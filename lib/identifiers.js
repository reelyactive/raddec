/**
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */


const TYPE_EUI64 = 1;
const TYPE_EUI48 = 2;
const TYPE_RND48 = 3;

const LENGTH_EUI64 = 8;
const LENGTH_EUI48 = 6;
const LENGTH_RND48 = 6;


/**
 * Convert the given identifier to a valid identifier string, if possible.
 * @param {String} identifier The given identifier.
 * @return {String} Valid identifier string, or null if invalid input.
 */
function format(identifier) {
  if(typeof identifier === 'string') {
    var hexIdentifier = identifier.replace(/[^A-Fa-f0-9]/g, '');
    return hexIdentifier.toLowerCase();
  }
  return null;
}


/**
 * Return the length in bytes of the given identifier type.
 * @param {Number} identifier The given identifier type.
 * @return {Number} The length of the identifier in bytes.
 */
function lengthInBytes(type) {
  switch(type) {
    case TYPE_EUI64:
      return LENGTH_EUI64;
    case TYPE_EUI48:
      return LENGTH_EUI48;
    case TYPE_RND48:
      return LENGTH_RND48;
    default:
      return null;
  }
}


/**
 * Determine if the two given identifiers (and types) match.
 * @param {String} firstId The first identifier.
 * @param {Number} firstIdType The type of the first identifier.
 * @param {String} secondId The second identifier.
 * @param {Number} secondIdType The type of the second identifier.
 * @return {boolean} True if match, false otherwise.
 */
function areMatch(firstId, firstIdType, secondId, secondIdType) {
  return ((firstId === secondId) && (firstIdType === secondIdType));
}


module.exports.TYPE_EUI64 = TYPE_EUI64;
module.exports.TYPE_EUI48 = TYPE_EUI48;
module.exports.TYPE_RND48 = TYPE_RND48;

module.exports.format = format;
module.exports.lengthInBytes = lengthInBytes;
module.exports.areMatch = areMatch;
