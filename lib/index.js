/**
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */


const identifiers = require('./identifiers');
const rssi = require('./rssi');


/**
 * Encode the given parameters into a raddec.
 * @param {Object} transmitter The given transmitter.
 * @param {Object} receivers The given receivers.
 * @return {String} The resulting raddec as a hexadecimal string.
 */
function encode(transmitter, receivers) {
  var flag = '10'; // TODO: make constant

  var transmitterIdentifier = toHexString(transmitter.type);
  transmitterIdentifier += identifiers.format(transmitter.id);

  var rssiSignature = toHexString(receivers.length);
  for(var cReceiver = 0; cReceiver < receivers.length; cReceiver++) {
    rssiSignature += rssi.encode(receivers[cReceiver].rssi);
    rssiSignature += toHexString(receivers[cReceiver].type);
    rssiSignature += identifiers.format(receivers[cReceiver].id);
  }

  var numberOfBytes = (flag.length + 4 + transmitterIdentifier.length +
                      rssiSignature.length + 2) / 2; 
  var length = toHexString(numberOfBytes, 2);

  var raddec = flag + length + transmitterIdentifier + rssiSignature;

  var checksum = 0;
  for(var cByte = 0; cByte < (numberOfBytes - 1); cByte++) {
    checksum += parseInt(raddec.substr(cByte * 2, 2), 16);
  }
  raddec += toHexString(checksum % 256);

  return raddec;
}


/**
 * Decode the given raddec as JSON.
 * @param {Object} raddec The given raddec.
 * @return {Object} The resulting radio decoding as JSON.
 */
function decode(raddec) {
  if(!raddec || !(typeof raddec === 'string') || (raddec.length < 6)) {
    return null;
  }

  var flag = raddec.substr(0,2);
  if(flag !== '10') { // TODO: make constant
    return null;
  }

  var length = parseInt(raddec.substr(2,4), 16);
  if(raddec.length !== (length * 2)) {
    return null;
  }

  var checksum = 0;
  for(var cByte = 0; cByte < (length - 1); cByte++) {
    checksum += parseInt(raddec.substr(cByte * 2, 2), 16);
  }
  if((checksum % 256) !== parseInt(raddec.substr(-2), 16)) {
    return null;
  }

  var transmitterIdType = parseInt(raddec.substr(6,2));
  var transmitterIdLength = identifiers.lengthInBytes(transmitterIdType) * 2;
  var rssiSignatureIndex = 6 + 2 + transmitterIdLength;
  var rssiSignatureType = parseInt(raddec.substr(rssiSignatureIndex,2), 16);
  var rssiValue = rssi.decode(raddec.substr(rssiSignatureIndex + 2, 2));
  var receiverIdType = parseInt(raddec.substr(rssiSignatureIndex + 4, 2), 16);
  var receiverIdLength = identifiers.lengthInBytes(receiverIdType) * 2;

  var event = {
    deviceId: raddec.substr(8, transmitterIdLength),
    rssi: rssiValue,
    receiverId: raddec.substr(rssiSignatureIndex + 6, receiverIdLength)
  };

  return event;
}


/**
 * Convert the given number to a hexadecimal string of the given length.
 * @param {Number} number The given number.
 * @param {Number} numberOfBytes The number of bytes of hex string.
 * @return {String} The resulting hexadecimal string.
 */
function toHexString(number, numberOfBytes) {
  numberOfBytes = numberOfBytes || 1;
  var hexString = '00'.repeat(numberOfBytes) + number.toString(16);

  return hexString.substr(-2 * numberOfBytes);
}


module.exports.identifiers = identifiers;
module.exports.encode = encode;
module.exports.decode = decode;
