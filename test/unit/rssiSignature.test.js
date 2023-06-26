/**
 * Copyright reelyActive 2023
 * We believe in an open Internet of Things
 */


const rssiSignature = require("../../lib/rssiSignature.js");
const assert = require ('assert');


// Inputs for the scenario
const INPUT_DATA_FIRST_SIGNATURE = [{
    receiverId: "0123456789ab",
    receiverIdType: 2,
    rssi: -70,
    numberOfDecodings: 1
}];
const INPUT_DATA_SECOND_SIGNATURE = [{
    receiverId: "0123456789ab",
    receiverIdType: 2,
    rssi: -72,
    numberOfDecodings: 1
}];
const INPUT_DATA_THIRD_SIGNATURE = [{
    receiverId: "0123456789ab",
    receiverIdType: 2,
    receiverAntenna: 1,
    rssi: -74,
    numberOfDecodings: 1
}];
const INPUT_DATA_FOURTH_SIGNATURE = [{
    receiverId: "0123456789ab",
    receiverIdType: 2,
    receiverAntenna: 1,
    rssi: -76,
    numberOfDecodings: 1
}];
const INPUT_DATA_FIFTH_SIGNATURE = [{
    receiverId: "0123456789ab",
    receiverIdType: 2,
    receiverAntenna: 2,
    rssi: -78,
    numberOfDecodings: 1
}];


// Expected outputs for the scenario
const EXPECTED_DATA_NO_ANTENNA = [{
    receiverId: "0123456789ab",
    receiverIdType: 2,
    rssi: -71,
    rssiSum: -142,
    numberOfDecodings: 2
}];
const EXPECTED_DATA_SAME_ANTENNA = [{
    receiverId: "0123456789ab",
    receiverIdType: 2,
    receiverAntenna: 1,
    rssi: -75,
    rssiSum: -150,
    numberOfDecodings: 2
}];
const EXPECTED_DATA_DIFFERENT_ANTENNA = [{
    receiverId: "0123456789ab",
    receiverIdType: 2,
    receiverAntenna: 1,
    rssi: -76,
    numberOfDecodings: 1
},
{
    receiverId: "0123456789ab",
    receiverIdType: 2,
    receiverAntenna: 2,
    rssi: -78,
    numberOfDecodings: 1
}];
const EXPECTED_DATA_SOME_ANTENNA = [{
    receiverId: "0123456789ab",
    receiverIdType: 2,
    rssi: -72,
    numberOfDecodings: 1
},
{
    receiverId: "0123456789ab",
    receiverIdType: 2,
    receiverAntenna: 2,
    rssi: -78,
    numberOfDecodings: 1
}];


// Describe the scenario
describe('rssiSignature', function() {

  // Test the merge with same receiver
  it('should merge signatures from the same receiver', function() {
    let merged = Object.assign([], INPUT_DATA_FIRST_SIGNATURE);
    rssiSignature.merge(INPUT_DATA_SECOND_SIGNATURE, merged);
    assert.deepEqual(merged, EXPECTED_DATA_NO_ANTENNA);
  });

  // Test the merge with same receiver and antenna
  it('should merge signatures from the same receiver & antenna', function() {
    let merged = Object.assign([], INPUT_DATA_THIRD_SIGNATURE);
    rssiSignature.merge(INPUT_DATA_FOURTH_SIGNATURE, merged);
    assert.deepEqual(merged, EXPECTED_DATA_SAME_ANTENNA);
  });

  // Test the merge with same receiver, different antenna
  it('should merge signatures from different antennas', function() {
    let merged = Object.assign([], INPUT_DATA_FOURTH_SIGNATURE);
    rssiSignature.merge(INPUT_DATA_FIFTH_SIGNATURE, merged);
    assert.deepEqual(merged, EXPECTED_DATA_DIFFERENT_ANTENNA);
  });

  // Test the merge with same receiver, antenna & no-antenna
  it('should merge signatures with and without antennas', function() {
    let merged = Object.assign([], INPUT_DATA_FIFTH_SIGNATURE);
    rssiSignature.merge(INPUT_DATA_SECOND_SIGNATURE, merged);
    assert.deepEqual(merged, EXPECTED_DATA_SOME_ANTENNA);
  });

});