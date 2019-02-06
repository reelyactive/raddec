/**
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */


const identifiers = require('./identifiers');


/**
 * Merge the source rssiSignature into the destination rssiSignature.
 * @param {Array} source The source rssiSignature.
 * @param {Array} destination The destination rssiSignature.
 */
function merge(source, destination) {
  source.forEach(function(current) {
    let matchFound = false;
    destination.forEach(function(target) {
      let isSameReceiver = identifiers.areMatch(current.receiverId,
                                                current.receiverIdType,
                                                target.receiverId,
                                                target.receiverIdType);
      if(isSameReceiver) {
        target.numberOfDecodings += current.numberOfDecodings || 1;
        target.rssiSum += current.rssiSum || current.rssi;
        target.rssi = Math.round(target.rssiSum / target.numberOfDecodings);
        matchFound = true;
      }
    });
    if(!matchFound) {
      destination.push(current);
    }
  });
  destination.sort(compareRssi);
}


/**
 * Compare rssi values for array sorting.
 * @param {Object} a An rssiSignature entry.
 * @param {Object} b Another rssiSignature entry.
 */
function compareRssi(a,b) {
  if(a.rssi < b.rssi)
    return 1;
  if(a.rssi > b.rssi)
    return -1;
  return 0;
}


module.exports.merge = merge;