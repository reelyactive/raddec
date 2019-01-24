/**
 * Copyright reelyActive 2019
 * We believe in an open Internet of Things
 */


const APPEARANCE = 0;
const DISPLACEMENT = 1;
const PACKETS = 2;
const KEEPALIVE = 3;
const DISAPPEARANCE = 4;

const APPEARANCE_MASK = 1 << APPEARANCE;
const DISPLACEMENT_MASK = 1 << DISPLACEMENT;
const PACKETS_MASK = 1 << PACKETS;
const KEEPALIVE_MASK = 1 << KEEPALIVE
const DISAPPEARANCE_MASK = 1 << DISAPPEARANCE;


/**
 * Encode the given events index list as a hexadecimal string byte.
 * @param {Array} events The given events as an index list.
 * @return {String} The resulting hexadecimal string.
 */
function encode(events) {
  if(!Array.isArray(events)) {
    return '00';
  }
  let bitmask = 0;
  for(event in events) {
    let index = events[event];
    bitmask += (1 << index);
  }
  return ('00' + bitmask.toString(16)).substr(-2);
}


/**
 * Decode the given hexadecimal string byte as an index list of events.
 * @param {String} rssi The given events as a bitmask hexadecimal string.
 * @return {Array} The corresponding index list of events.
 */
function decode(events) {
  let indexList = [];
  let eventsByte = parseInt(events, 16);

  if(eventsByte & APPEARANCE_MASK) {
    indexList.push(APPEARANCE);
  }
  if(eventsByte & DISPLACEMENT_MASK) {
    indexList.push(DISPLACEMENT);
  }
  if(eventsByte & PACKETS_MASK) {
    indexList.push(PACKETS);
  }
  if(eventsByte & KEEPALIVE_MASK) {
    indexList.push(KEEPALIVE);
  }
  if(eventsByte & DISAPPEARANCE_MASK) {
    indexList.push(DISAPPEARANCE);
  }

  return indexList;
}


module.exports.APPEARANCE = APPEARANCE;
module.exports.APPEARANCE_MASK = APPEARANCE_MASK;
module.exports.DISPLACEMENT = DISPLACEMENT;
module.exports.DISPLACEMENT_MASK = DISPLACEMENT_MASK;
module.exports.PACKETS = PACKETS;
module.exports.PACKETS_MASK = PACKETS_MASK;
module.exports.KEEPALIVE = KEEPALIVE;
module.exports.KEEPALIVE_MASK = KEEPALIVE_MASK;
module.exports.DISAPPEARANCE = DISAPPEARANCE;
module.exports.DISAPPEARANCE_MASK = DISAPPEARANCE_MASK;
module.exports.encode = encode;
module.exports.decode = decode;
