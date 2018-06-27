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
  var flag = '10';

  var transmitterIdentifier = toHexString(transmitter.type);
  transmitterIdentifier += identifiers.format(transmitter.id);

  var rssiSignature = toHexString(receivers.length);
  for(var cReceiver = 0; cReceiver < receivers.length; cReceiver++) {
    rssiSignature += rssi.format(receivers[cReceiver].rssi);
    rssiSignature += toHexString(receivers[cReceiver].type);
    rssiSignature += identifiers.format(receivers[cReceiver].id);
  }

  var length = (flag.length + 4 + transmitterIdentifier.length +
                rssiSignature.length + 2) / 2; 
  length = toHexString(length, 2);

  var raddec = flag + length + transmitterIdentifier + rssiSignature;

  var checksum = 0;
  for(var cByte = 0; cByte < length; cByte++) {
    checksum += parseInt(raddec.substr(cByte * 2, 2), 16);
  }
  raddec += toHexString(checksum % 256);

  return raddec;
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
