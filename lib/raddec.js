/**
 * Copyright reelyActive 2018-2019
 * We believe in an open Internet of Things
 */


const identifiers = require('./identifiers');
const rssi = require('./rssi');
const rssiSignature = require('./rssiSignature');
const packets = require('./packets');
const events = require('./events');


const RADDEC_FLAG = 0x10;
const RADDEC_MAX_NUMBER_OF_RECEIVERS = 15;
const STANDARD_RADDEC_PROPERTIES = [
    'transmitterId',
    'transmitterIdType',
    'rssiSignature',
    'timestamp',
    'packets',
    'events'
];
const STANDARD_RSSI_SIGNATURE_PROPERTIES = [
    'receiverId',
    'receiverIdType',
    'rssi',
    'numberOfDecodings'
];
const DEFAULT_INCLUDE_PACKETS_FLATTENED = true;
const DEFAULT_INCLUDE_RSSI_SIGNATURE_FLATTENED = false;


/**
 * Raddec Class
 * Represents a generic set of radio decodings for a single transmitter.
 */
class Raddec {

  /**
   * Raddec constructor
   * @param {Object} source The source object.
   * @constructor
   */
  constructor(source) {
    if(Buffer.isBuffer(source)) {
      constructFromBuffer(this, source);
    }
    else if(typeof source === 'string') {
      constructFromHexString(this, source);
    }
    else if(isCompatibleObject(source)) {
      constructFromObject(this, source);
    }
    else {
      throw new Error('Raddec cannot be constructed from unhandled source');
    }
  }

  /**
   * Get the unique signature based on the transmitter ID and type.
   */
  get signature() {
    return this.transmitterId + identifiers.SIGNATURE_SEPARATOR +
           this.transmitterIdType;
  }

  /**
   * Get the unique receiver signature based on the ID and type.
   */
  get receiverSignature() {
    if((this.rssiSignature.length === 0) ||
       (this.rssiSignature[0].receiverIdType === identifiers.TYPE_UNKNOWN)) {
      return 'unknown' + identifiers.SIGNATURE_SEPARATOR +
             identifiers.TYPE_UNKNOWN;
    }
 
    return this.rssiSignature[0].receiverId + identifiers.SIGNATURE_SEPARATOR +
           this.rssiSignature[0].receiverIdType;
  }

  /**
   * Get the initial time based on the available timestamps.
   */
  get initialTime() {
    if(this.hasOwnProperty('earliestDecodingTime')) {
      return this.earliestDecodingTime;
    }
    else if(this.hasOwnProperty('timestamp')) {
      return this.timestamp;
    }
    else {
      return this.creationTime;
    }
  }

  /**
   * Add a decoding.
   * @param {Object} decoding The receiver, rssi and optional time.
   */
  addDecoding(decoding) {
    let target = null;
    decoding.receiverId = identifiers.format(decoding.receiverId);

    this.rssiSignature.forEach(function(current) {
      let isTarget = identifiers.areMatch(current.receiverId,
                                          current.receiverIdType,
                                          decoding.receiverId,
                                          decoding.receiverIdType);
      if(isTarget) {
        target = current;
      }
    });
    let targetFound = (target !== null);

    if(targetFound) {
      target.numberOfDecodings++;
      target.rssiSum += decoding.rssi;
      target.rssi = Math.round(target.rssiSum / target.numberOfDecodings);
    }
    else {
      this.rssiSignature.push({
          receiverId: decoding.receiverId,
          receiverIdType: decoding.receiverIdType,
          numberOfDecodings: 1,
          rssi: decoding.rssi,
          rssiSum: decoding.rssi
      });
    }

    if(decoding.hasOwnProperty('timestamp') &&
       (!this.hasOwnProperty('earliestDecodingTime') ||
        (decoding.timestamp < this.earliestDecodingTime))) {
      this.earliestDecodingTime =  decoding.timestamp;
    }

  }

  /**
   * Add a packet, unless it already exists in the set.
   * @param {String} packet The packet as a hexadecimal string.
   */
  addPacket(packet) {
    if(this.hasOwnProperty('packets')) {
      let isNewPacket = (this.packets.indexOf(packet) < 0);

      if(isNewPacket) {
        this.packets.push(packet);
      }
    }
    else {
      this.packets = [ packet ];
    }
  }

  /**
   * Add an event.
   * @param {Number} event The event as an index.
   */
  addEvent(event) {
    if(!this.hasOwnProperty('events')) {
      this.events = [];
    }
    if(!this.events.includes(event)) {
       this.events.push(event);
    }
  }

  /**
   * Merge the given Raddec instance into the current instance.
   * @param {Raddec} raddec The given Raddec instance.
   */
  merge(raddec) {
    let isSameTransmitter = identifiers.areMatch(this.transmitterId,
                                                 this.transmitterIdType,
                                                 raddec.transmitterId,
                                                 raddec.transmitterIdType);
    if(!isSameTransmitter) {
      throw new Error('Raddec cannot be merged with mismatched transmitter');
      return;
    }

    packets.merge(raddec.packets, this.packets);
    rssiSignature.merge(raddec.rssiSignature, this.rssiSignature);
    mergeTimes(raddec, this);
  }

  /**
   * Encode as hexadecimal string.
   * @param {Object} options Flags for any optional properties to include.
   */
  encodeAsHexString(options) {
    options = options || {};

    let flag = toHexString(RADDEC_FLAG);

    let transmitterIdentifier = toHexString(this.transmitterIdType) +
                                this.transmitterId;

    let numberOfReceivers = this.rssiSignature.length;
    if(numberOfReceivers > RADDEC_MAX_NUMBER_OF_RECEIVERS) {
      numberOfReceivers = RADDEC_MAX_NUMBER_OF_RECEIVERS;
    }
    let rssiSignature = toHexString(numberOfReceivers);
    for(let index = 0; index < numberOfReceivers; index++) {
      let current = this.rssiSignature[index];
      rssiSignature += rssi.encode(current.rssi);
      rssiSignature += toHexString(current.numberOfDecodings); // TODO: limit
      rssiSignature += toHexString(current.receiverIdType);
      if(current.receiverIdType !== identifiers.TYPE_UNKNOWN) {
        rssiSignature += identifiers.format(current.receiverId);
      }
    }

    let optionalProperties = '';

    if(options.includeTimestamp === true) {
      optionalProperties += toHexString(0xf0); // TODO: make constant
      optionalProperties += toHexString(this.initialTime, 6);
    }

    if(options.includePackets === true) {
      optionalProperties += toHexString(0xf1); // TODO: make constant
      let packets = this.packets || [];
      let numberOfPackets = Math.min(packets.length, 15); // TODO: make constant
      optionalProperties += toHexString(numberOfPackets);
      for(let index = 0; index < numberOfPackets; index++) {
        let packet = packets[index];
        let packetLength = toHexString(packet.length / 2);
        optionalProperties += packetLength + packet;
      }
    }

    if(options.includeEvents === true) {
      optionalProperties += toHexString(0xf2); // TODO: make constant
      optionalProperties += events.encode(this.events);
    }

    let lengthInBytes = (flag.length + 4 + transmitterIdentifier.length +
                         rssiSignature.length + 2 +
                         optionalProperties.length) / 2;
    let length = toHexString(lengthInBytes, 2);

    let raddec = flag + length + transmitterIdentifier + rssiSignature +
                 optionalProperties;

    let checksum = 0;
    for(let index = 0; index < (lengthInBytes - 1); index++) {
      checksum += parseInt(raddec.substr(index * 2, 2), 16);
    }
    checksum = toHexString(checksum % 256);

    raddec += checksum;

    return raddec;
  }

  /**
   * Create a flattened representation.
   * @param {Object} options Flags for any optional properties to include.
   */
  toFlattened(options) {
    options = options || {};

    let includePackets = DEFAULT_INCLUDE_PACKETS_FLATTENED;
    let includeRssiSignature = DEFAULT_INCLUDE_RSSI_SIGNATURE_FLATTENED;
    let maxNumberOfReceivers = RADDEC_MAX_NUMBER_OF_RECEIVERS;
    let rssiThreshold = options.rssiThreshold || rssi.MIN_RSSI_DBM;

    if(options.hasOwnProperty('includePackets')) {
      includePackets = options.includePackets;
    }
    if(options.hasOwnProperty('includeRssiSignature')) {
      includeRssiSignature = options.includeRssiSignature;
    }
    if(options.hasOwnProperty('maxNumberOfReceivers')) {
      maxNumberOfReceivers = options.maxNumberOfReceivers;
    }

    let raddec = {
        transmitterId: this.transmitterId,
        transmitterIdType: this.transmitterIdType
    };

    if(this.hasOwnProperty('rssiSignature')) {
      raddec.receiverId = this.rssiSignature[0].receiverId;
      raddec.receiverIdType = this.rssiSignature[0].receiverIdType;
      raddec.rssi = this.rssiSignature[0].rssi;
      raddec.numberOfDecodings = this.rssiSignature[0].numberOfDecodings;
      raddec.numberOfReceivers = this.rssiSignature.length;

      if(includeRssiSignature) {
        raddec.rssiSignature = [];
        this.rssiSignature.forEach(function(entry, index) {
          if((index < maxNumberOfReceivers) && (entry.rssi >= rssiThreshold)) {
            let trimmedEntry = {};
            Object.keys(entry).forEach(function(property) {
              if(STANDARD_RSSI_SIGNATURE_PROPERTIES.includes(property)) {
                trimmedEntry[property] = entry[property];
              }
            });
            raddec.rssiSignature.push(trimmedEntry);
          }
        });
      }
    }

    if(this.hasOwnProperty('timestamp')) {
      raddec.timestamp = this.timestamp;
    }

    if(this.hasOwnProperty('packets')) {
      raddec.numberOfDistinctPackets = this.packets.length;

      if(includePackets) {
        raddec.packets = this.packets;
      }
    }

    if(this.hasOwnProperty('events')) {
      raddec.events = this.events;
    }

    return raddec;
  }

  /**
   * Remove all non-standard properties.
   */
  trim() {
    let raddec = this;

    if(!raddec.hasOwnProperty('timestamp')) {
      raddec.timestamp = raddec.initialTime;
    }

    Object.keys(raddec).forEach(function(property) {
      if(!STANDARD_RADDEC_PROPERTIES.includes(property)) {
        delete raddec[property];
      }
    });

    if(raddec.hasOwnProperty('rssiSignature')) {
      raddec.rssiSignature.forEach(function(entry) {
        Object.keys(entry).forEach(function(property) {
          if(!STANDARD_RSSI_SIGNATURE_PROPERTIES.includes(property)) {
            delete entry[property];
          }
        });
      });
    }
  }

  static mergeRssiSignatures(source, destination) {
    return rssiSignature.merge(source, destination);
  }

  static mergePackets(source, destination) {
    return packets.merge(source, destination);
  }
}


/**
 * Construct the Raddec from a hexadecimal string.
 * @param {Raddec} instance The given Raddec instance.
 * @param {String} source The source as a hexadecimal string.
 */
function constructFromHexString(instance, source) {
  if(source.length < 6) { // TODO: make constant
    throw new Error('Raddec hexadecimal string too short to be valid');
  }

  source = source.toLowerCase();

  let isHex = /[0-9a-f]/.test(source);
  if(!isHex) {
    throw new Error('Raddec hexadecimal string is not hexadecimal');
  }

  let flag = source.substr(0,2);
  if(flag !== '10') { // TODO: make constant
    throw new Error('Raddec hexadecimal string has invalid flag');
  }

  let length = parseInt(source.substr(2,4), 16);
  if(source.length !== (length * 2)) {
    throw new Error('Raddec hexadecimal string has length mismatch');
  }

  let calculatedChecksum = 0;
  for(let index = 0; index < (length - 1); index++) {
    calculatedChecksum += parseInt(source.substr(index * 2, 2), 16);
  }
  let providedChecksum = parseInt(source.substr(-2), 16);
  if((calculatedChecksum % 256) !== providedChecksum) {
    throw new Error('Raddec hexadecimal string checksum mismatch');
  }

  let transmitterIdType = parseInt(source.substr(6,2));
  let transmitterIdLength = identifiers.lengthInBytes(transmitterIdType) * 2;

  instance.transmitterId = source.substr(8, transmitterIdLength);
  instance.transmitterIdType = transmitterIdType;
  instance.rssiSignature = [];

  let rssiSignatureIndex = 6 + 2 + transmitterIdLength; // TODO: make constants
  let rssiSignatureType = parseInt(source.substr(rssiSignatureIndex,2), 16);
  let numberOfReceivers = rssiSignatureType & 0x0f;
  let sourceIndex = rssiSignatureIndex + 2;

  for(let index = 0; index < numberOfReceivers; index++) {
    let rssiValue = rssi.decode(source.substr(sourceIndex, 2));
    let numberOfDecodings = parseInt(source.substr(sourceIndex + 2, 2), 16);
    let receiverIdType = parseInt(source.substr(sourceIndex + 4, 2), 16);
    let receiverIdLength = identifiers.lengthInBytes(receiverIdType) * 2;
    let receiverId = null;
    if(receiverIdType !== identifiers.TYPE_UNKNOWN) {
      receiverId = source.substr(sourceIndex + 6, receiverIdLength);
    }

    instance.rssiSignature.push({
        receiverId: receiverId,
        receiverIdType: receiverIdType,
        rssi: rssiValue,
        numberOfDecodings: numberOfDecodings
    });
    sourceIndex += (6 + receiverIdLength); // TODO: make constant
  }

  instance.creationTime = new Date().getTime();

  let hasAdditionalProperty = (sourceIndex < ((length - 1) * 2));
  while(hasAdditionalProperty) {
    let propertyFlag = parseInt(source.substr(sourceIndex, 2), 16);
    sourceIndex += 2;

    switch(propertyFlag) {
      case 0xf0: // Timestamp
        instance.timestamp = parseInt(source.substr(sourceIndex, 12), 16);
        sourceIndex += 12;
        break;
      case 0xf1: // Packets
        let numberOfPackets = parseInt(source.substr(sourceIndex, 2), 16);
        instance.packets = [];
        sourceIndex += 2;

        for(let index = 0; index < numberOfPackets; index++) {
          let packetLength = parseInt(source.substr(sourceIndex, 2), 16);
          let packet = source.substr(sourceIndex + 2, packetLength * 2);
          instance.packets.push(packet);
          sourceIndex += 2 + packetLength * 2;
        }
        break;
      case 0xf2: // Events
        instance.events = events.decode(source.substr(sourceIndex, 2), 16);
        sourceIndex += 2;
        break;
      default: // Unknown property, exit gracefully
        return;
    }
    hasAdditionalProperty = (sourceIndex < ((length - 1) * 2));
  }
}


/**
 * Construct the Raddec from a Buffer.
 * @param {Raddec} instance The given Raddec instance.
 * @param {Buffer} source The source as a Buffer.
 */
function constructFromBuffer(instance, source) {
  let sourceAsHexString = source.toString('hex');
  constructFromHexString(instance, sourceAsHexString);
}


/**
 * Construct the Raddec from an Object.
 * @param {Raddec} instance The given Raddec instance.
 * @param {Object} source The source as an Object.
 */
function constructFromObject(instance, source) {
  instance.transmitterId = identifiers.format(source.transmitterId);
  instance.transmitterIdType = source.transmitterIdType;
  instance.rssiSignature = source.rssiSignature || [];

  instance.rssiSignature.forEach(function(entry) {
    entry.receiverIdType = entry.receiverIdType || identifiers.TYPE_UNKNOWN;
    entry.rssi = entry.rssi || -Number.MAX_SAFE_INTEGER;
    entry.numberOfDecodings = entry.numberOfDecodings || 1;
    entry.rssiSum = entry.rssiSum || entry.rssi;
  });

  if(source.hasOwnProperty('packets')) {
    instance.packets = source.packets;
  }
  if(source.hasOwnProperty('timestamp')) {
    instance.timestamp = source.timestamp;
  }
  if(source.hasOwnProperty('events')) {
    instance.events = source.events;
  }
  if(source.hasOwnProperty('earliestDecodingTime')) {
    instance.earliestDecodingTime = source.earliestDecodingTime;
  }
  instance.creationTime = new Date().getTime();
}


/**
 * Merge the times of the source Raddec into those of the destination Raddec.
 * @param {Raddec} source The source Raddec instance.
 * @param {Raddec} destination The destination Raddec instance.
 */
function mergeTimes(source, destination) {
  if(source.hasOwnProperty('earliestDecodingTime')) {
    if(destination.hasOwnProperty('earliestDecodingTime')) {
       let isSourceEarlier = (source.earliestDecodingTime <
                              destination.earliestDecodingTime);
       if(isSourceEarlier) {
         destination.earliestDecodingTime = source.earliestDecodingTime;
       }
    }
    else {
      destination.earliestDecodingTime = source.earliestDecodingTime;
    }
  }
}


/**
 * Convert the given number to a hexadecimal string of the given length.
 * @param {Number} number The given number.
 * @param {Number} numberOfBytes The number of bytes of hex string.
 * @return {String} The resulting hexadecimal string.
 */
function toHexString(number, numberOfBytes) {
  numberOfBytes = numberOfBytes || 1;
  let hexString = '00'.repeat(numberOfBytes) + number.toString(16);

  return hexString.substr(-2 * numberOfBytes);
}


/**
 * Determine if the given Object is compatible with a Raddec.
 * @param {Object} source The source Object.
 */
function isCompatibleObject(source) {
  return ((source !== null) &&
          (source.hasOwnProperty('transmitterId')) &&
          (source.hasOwnProperty('transmitterIdType')));
}


module.exports = Raddec;
module.exports.identifiers = identifiers;
module.exports.events = events;
