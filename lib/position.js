/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const INVALID_POSITION_HEX = '7FFFFFFFFFFFFFFF'; // NaN


/**
 * Encode the given position as a hexadecimal string byte.
 * @param {Array} position The given position.
 * @return {String} The resulting hexadecimal string.
 */
function encode(position) {
  if(!Array.isArray(position)) {
    return INVALID_POSITION_HEX + INVALID_POSITION_HEX + INVALID_POSITION_HEX;
  }

  let buffer = Buffer.allocUnsafe(24);

  for(let cAxis = 0; cAxis < 3; cAxis++) {
    if((cAxis > position.length) || !Number.isFinite(position[cAxis])) {
      buffer.write(INVALID_POSITION_HEX, cAxis * 8, 8, 'hex');
    }
    else {
      buffer.writeDoubleBE(position[cAxis], cAxis * 8);
    }
  }

  return buffer.toString('hex');
}


/**
 * Decode the given hexadecimal string as a position.
 * @param {String} position The given position as a hexadecimal string.
 * @return {Array} The corresponding position as an array of numbers.
 */
function decode(position) {
  let decodedPosition = [];
  let buffer = Buffer.from(position, 'hex');

  for(let cAxis = 0; cAxis < 3; cAxis++) {
    let value = buffer.readDoubleBE(cAxis * 8);

    if(!Number.isFinite(value)) {
      return decodedPosition;
    }

    decodedPosition.push(value);
  }

  return decodedPosition;
}


module.exports.encode = encode;
module.exports.decode = decode;
