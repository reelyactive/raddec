/**
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */


/**
 * Merge the source packets into the destination packets.
 * @param {Array} source The source Array of packets.
 * @param {Array} destination The destination Array of packets.
 */
function merge(source, destination) {
  if(Array.isArray(source)) {
    destination = destination || [];
    source.forEach(function(packet) {
      let isNewPacket = !destination.includes(packet);
      if(isNewPacket) {
        destination.push(packet);
      }
    });
  }
}


module.exports.merge = merge;
