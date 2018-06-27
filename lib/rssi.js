/**
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */


const MAX_RSSI_DBM = 0;
const MIN_RSSI_DBM = -127;


/**
 * Format the given RSSI value as a hexadecimal string byte.
 * @param {Number} rssi The given RSSI in dBm.
 * @return {String} The resulting hexadecimal string.
 */
function format(rssi) {
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


module.exports.format = format;
