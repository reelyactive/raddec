/**
 * Copyright reelyActive 2018-2026
 * We believe in an open Internet of Things
 */


const identifiers = require('./identifiers');


/**
 * Merge the source rssiSignature into the destination rssiSignature.
 * @param {Array} source The source rssiSignature.
 * @param {Array} destination The destination rssiSignature.
 */
function merge(source, destination) {
  source.forEach((current) => {
    let isMatchFound = false;
    destination.forEach((target) => {
      let isSameReceiver = identifiers.areReceiverMatch(current.receiverId,
                                                        current.receiverIdType,
                                                        current.receiverAntenna,
                                                        target.receiverId,
                                                        target.receiverIdType,
                                                        target.receiverAntenna);
      if(isSameReceiver) {
        target.rssiSum = target.rssiSum ||
                         (target.rssi * target.numberOfDecodings);
        target.numberOfDecodings += current.numberOfDecodings || 1;
        target.rssiSum += current.rssiSum ||
                          (current.rssi * current.numberOfDecodings);
        target.rssi = Math.round(target.rssiSum / target.numberOfDecodings);
        isMatchFound = true;
      }
    });
    if(!isMatchFound) {
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
