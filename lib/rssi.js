/**
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */


const MAX_RSSI_DBM = 0;
const MIN_RSSI_DBM = -127;


/**
 * Encode the given RSSI value as a hexadecimal string byte.
 * @param {Number} rssi The given RSSI in dBm.
 * @return {String} The resulting hexadecimal string.
 */
function encode(rssi) {
  if(rssi < MIN_RSSI_DBM) {
    rssi = MIN_RSSI_DBM;
  }
  else if(rssi > MAX_RSSI_DBM) {
    rssi = MAX_RSSI_DBM;
  }
  else {
    rssi = Math.round(rssi);
  }

  return ('00' + (rssi - MIN_RSSI_DBM).toString(16)).substr(-2);
}


/**
 * Decode the given hexadecimal string byte as RSSI in dBm.
 * @param {String} rssi The given RSSI as a hexadecimal string.
 * @return {Number} The resulting RSSI in dBm.
 */
function decode(rssi) {
  return parseInt(rssi,16) + MIN_RSSI_DBM;
}


module.exports.MAX_RSSI_DBM = MAX_RSSI_DBM;
module.exports.MIN_RSSI_DBM = MIN_RSSI_DBM;

module.exports.encode = encode;
module.exports.decode = decode;
