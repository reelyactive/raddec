/**
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */


const TYPE_EUI64 = 1;
const TYPE_EUI48 = 2;
const TYPE_RND48 = 3;


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


module.exports.TYPE_EUI64 = TYPE_EUI64;
module.exports.TYPE_EUI48 = TYPE_EUI48;
module.exports.TYPE_RND48 = TYPE_RND48;

module.exports.format = format;

