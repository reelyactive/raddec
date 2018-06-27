/**
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */

const raddec = require("../../lib/index.js");
const assert = require ('assert');


// Inputs for the scenario
const INPUT_DATA_TRANSMITTER = { type: 2, id: "aa:bb:cc:dd:ee:ff" };
const INPUT_DATA_RECEIVERS = [
  { type: 1, id: "00-1b-c5-09-40-81-00-00", rssi: -80 }
];
const INPUT_DATA_ENCODED = '10001602aabbccddeeff012f01001bc50940810000fe';


// Expected outputs for the scenario
const EXPECTED_DATA_BASE = '10001602aabbccddeeff012f01001bc50940810000fe';
const EXPECTED_DATA_DECODED =  {
  deviceId: "aabbccddeeff",
  receiverId: "001bc50940810000",
  rssi: -80
};


// Describe the scenario
describe('raddec', function() {

  // Test the encode function with a single receiver
  it('should encode a raddec with a single receiver', function() {
    assert.equal(raddec.encode(INPUT_DATA_TRANSMITTER, INPUT_DATA_RECEIVERS),
                 EXPECTED_DATA_BASE);
  });

  // Test the decode function with a single receiver
  it('should decode a raddec with a single receiver', function() {
    assert.deepEqual(raddec.decode(INPUT_DATA_ENCODED), EXPECTED_DATA_DECODED);
  });

});
