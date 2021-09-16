/**
 * Copyright reelyActive 2018-2019
 * We believe in an open Internet of Things
 */

const Raddec = require("../../lib/raddec.js");
const assert = require ('assert');


// Inputs for the scenario
const INPUT_DATA_TRANSMITTER = {
    transmitterId: "aa:bb:cc:dd:ee:ff",
    transmitterIdType: 2
};
const INPUT_DATA_FIRST_DECODING = {
    receiverId: "00-1b-c5-09-40-81-00-00",
    receiverIdType: 1,
    rssi: -69,
    timestamp: 1420075425678
};
const INPUT_DATA_SECOND_DECODING = {
    receiverId: "001BC50940810000",
    receiverIdType: 1,
    rssi: -72,
    timestamp: 1420075424567
};
const INPUT_DATA_THIRD_DECODING = {
    receiverId: "001bc50940810001",
    receiverIdType: 1,
    rssi: -42,
    timestamp: 1420075426789
};
const INPUT_DATA_FIRST_PACKET =
    '061bffeeddccbbaa02010611074449555520657669746341796c656572';
const INPUT_DATA_SECOND_PACKET =
    '061bffeeddccbbaa02010611074449555520657669746341796c65656c';
const INPUT_DATA_THIRD_PACKET =
    '061bffeeddccbbaa02010611074449555520657669746341796c656572';
const INPUT_DATA_FIRST_EVENT = Raddec.events.DISPLACEMENT;
const INPUT_DATA_SECOND_EVENT = Raddec.events.PACKETS;
const INPUT_DATA_THIRD_EVENT = Raddec.events.DISPLACEMENT;
const INPUT_DATA_MERGE_RADDEC = {
    transmitterId: "aa:bb:cc:dd:ee:ff",
    transmitterIdType: 2,
    packets: [ '061bffeeddccbbaa02010611074449555520657669746341796c656576' ],
    rssiSignature: [{
        receiverId: "001bc50940810000",
        receiverIdType: 1,
        rssi: -77,
        rssiSum: -154,
        numberOfDecodings: 2
    }],
    earliestDecodingTime: 1420075424000
};
const INPUT_DATA_HEX_STRING_RADDEC =
    '10002202aabbccddeeff02350401001bc50940810000550101001bc5094081000117';
const INPUT_DATA_HEX_STRING_RADDEC_OPTIONS =  '10008702aabbccddeeff02550101001bc50940810001350401001bc50940810000f0014aa3175900f1031d061bffeeddccbbaa02010611074449555520657669746341796c6565721d061bffeeddccbbaa02010611074449555520657669746341796c65656c1d061bffeeddccbbaa02010611074449555520657669746341796c656576f2063e';
const INPUT_DATA_BUFFER_RADDEC =
    Buffer.from(INPUT_DATA_HEX_STRING_RADDEC, 'hex');
const INPUT_DATA_FLATTENED_RADDEC = {
    transmitterId: "aabbccddeeff",
    transmitterIdType: 2,
    rssiSignature: [{
        receiverId: "001bc50940810000",
        receiverIdType: 1,
        rssi: -77,
        numberOfDecodings: 2
    },
    {
        receiverId: "001bc50940810001",
        receiverIdType: 1,
        rssi: -80,
        numberOfDecodings: 2
    }],
    packets: [ '061bffeeddccbbaa02010611074449555520657669746341796c656576' ],
    timestamp: 1420075424000,
    events: [ 0 ]
};
const INPUT_DATA_FLATTENED_MINIMAL_RADDEC = {
    transmitterId: "aabbccddeeff",
    transmitterIdType: 2,
    timestamp: 1420075424000
};
const INPUT_OPTIONS_FLATTENED = {
    includePackets: false,
    includeRssiSignature: true,
    maxNumberOfReceivers: 1,
    rssiThreshold: -77
};
const INPUT_DATA_TRIM_RADDEC = {
    transmitterId: "aa:bb:cc:dd:ee:ff",
    transmitterIdType: 2,
    packets: [ '061bffeeddccbbaa02010611074449555520657669746341796c656576' ],
    rssiSignature: [{
        receiverId: "001bc50940810000",
        receiverIdType: 1,
        rssi: -77,
        rssiSum: -154,
        numberOfDecodings: 2
    }],
    earliestDecodingTime: 1420075424000
};

// Expected outputs for the scenario
const EXPECTED_DATA_TRANSMITTER_ID = "aabbccddeeff";
const EXPECTED_DATA_TRANSMITTER_ID_TYPE = 2;
const EXPECTED_DATA_BARE_RSSI_SIGNATURE = [];
const EXPECTED_DATA_BARE_ENCODING = '10000c02aabbccddeeff0019';
const EXPECTED_DATA_FIRST_RSSI_SIGNATURE = [{
    receiverId: "001bc50940810000",
    receiverIdType: 1, 
    rssi: -69,
    rssiSum: -69,
    numberOfDecodings: 1
}];
const EXPECTED_DATA_FIRST_EARLIEST_TIME = 1420075425678;
const EXPECTED_DATA_FIRST_ENCODING =
    '10001702aabbccddeeff013a0101001bc509408100000b';
const EXPECTED_DATA_SECOND_RSSI_SIGNATURE = [{
    receiverId: "001bc50940810000",
    receiverIdType: 1, 
    rssi: -70,
    rssiSum: -141,
    numberOfDecodings: 2
}];
const EXPECTED_DATA_SECOND_EARLIEST_TIME = 1420075424567;
const EXPECTED_DATA_THIRD_RSSI_SIGNATURE = [{
    receiverId: "001bc50940810000",
    receiverIdType: 1, 
    rssi: -70,
    rssiSum: -141,
    numberOfDecodings: 2
},{
    receiverId: "001bc50940810001",
    receiverIdType: 1, 
    rssi: -42,
    rssiSum: -42,
    numberOfDecodings: 1
}];
const EXPECTED_DATA_THIRD_EARLIEST_TIME = 1420075424567;
const EXPECTED_DATA_THIRD_ENCODING =
  '10002202aabbccddeeff02390201001bc50940810000550101001bc5094081000119';
const EXPECTED_DATA_FIRST_PACKET = [
  '061bffeeddccbbaa02010611074449555520657669746341796c656572'
];
const EXPECTED_DATA_SECOND_PACKET = [
  '061bffeeddccbbaa02010611074449555520657669746341796c656572',
  '061bffeeddccbbaa02010611074449555520657669746341796c65656c'
];
const EXPECTED_DATA_THIRD_PACKET = [
  '061bffeeddccbbaa02010611074449555520657669746341796c656572',
  '061bffeeddccbbaa02010611074449555520657669746341796c65656c'
];
const EXPECTED_DATA_FIRST_EVENT = [ Raddec.events.DISPLACEMENT ];
const EXPECTED_DATA_SECOND_EVENT = [ Raddec.events.DISPLACEMENT,
                                     Raddec.events.PACKETS ];
const EXPECTED_DATA_THIRD_EVENT = [ Raddec.events.DISPLACEMENT,
                                    Raddec.events.PACKETS ];
const EXPECTED_DATA_TIMESTAMP_ENCODING = '10002902aabbccddeeff02550101001bc50940810001350401001bc50940810000f0014aa31759006c';
const EXPECTED_DATA_PACKET_ENCODING = '10007e02aabbccddeeff02550101001bc50940810001350401001bc50940810000f1031d061bffeeddccbbaa02010611074449555520657669746341796c6565721d061bffeeddccbbaa02010611074449555520657669746341796c65656c1d061bffeeddccbbaa02010611074449555520657669746341796c656576ef';
const EXPECTED_DATA_EVENTS_ENCODING = '10002402aabbccddeeff02550101001bc50940810001350401001bc50940810000f20611';
const EXPECTED_DATA_MERGE_RSSI_SIGNATURE = [{
    receiverId: "001bc50940810001",
    receiverIdType: 1, 
    rssi: -42,
    rssiSum: -42,
    numberOfDecodings: 1
},{
    receiverId: "001bc50940810000",
    receiverIdType: 1, 
    rssi: -74,
    rssiSum: -295,
    numberOfDecodings: 4
}];
const EXPECTED_DATA_MERGE_PACKET = [
  '061bffeeddccbbaa02010611074449555520657669746341796c656572',
  '061bffeeddccbbaa02010611074449555520657669746341796c65656c',
  '061bffeeddccbbaa02010611074449555520657669746341796c656576'
];
const EXPECTED_DATA_MERGE_EARLIEST_DECODING_TIME = 1420075424000;
const EXPECTED_DATA_HEX_STRING_RADDEC = {
    transmitterId: "aabbccddeeff",
    transmitterIdType: 2,
    rssiSignature: [{
      receiverId: "001bc50940810000",
      receiverIdType: 1, 
      rssi: -74,
      numberOfDecodings: 4
    },{
      receiverId: "001bc50940810001",
      receiverIdType: 1, 
      rssi: -42,
      numberOfDecodings: 1
    }]
};
const EXPECTED_DATA_HEX_STRING_RADDEC_OPTIONS = {
    transmitterId: "aabbccddeeff",
    transmitterIdType: 2,
    rssiSignature: [{
      receiverId: "001bc50940810001",
      receiverIdType: 1, 
      rssi: -42,
      numberOfDecodings: 1
    },{
      receiverId: "001bc50940810000",
      receiverIdType: 1, 
      rssi: -74,
      numberOfDecodings: 4
    }],
    timestamp: 1420075424000,
    packets: [
        "061bffeeddccbbaa02010611074449555520657669746341796c656572",
        "061bffeeddccbbaa02010611074449555520657669746341796c65656c",
        "061bffeeddccbbaa02010611074449555520657669746341796c656576"
    ],
    events: [ Raddec.events.DISPLACEMENT, Raddec.events.PACKETS ]
};
const EXPECTED_DATA_BUFFER_RADDEC = EXPECTED_DATA_HEX_STRING_RADDEC;
const EXPECTED_DATA_FLATTENED_RADDEC = {
    transmitterId: "aabbccddeeff",
    transmitterIdType: 2,
    receiverId: "001bc50940810000",
    receiverIdType: 1,
    rssi: -77,
    numberOfDecodings: 2,
    numberOfReceivers: 2,
    packets: [ '061bffeeddccbbaa02010611074449555520657669746341796c656576' ],
    numberOfDistinctPackets: 1,
    timestamp: 1420075424000,
    events: [ 0 ]
};
const EXPECTED_DATA_FLATTENED_MINIMAL_RADDEC = {
    transmitterId: "aabbccddeeff",
    transmitterIdType: 2,
    timestamp: 1420075424000
};
const EXPECTED_DATA_FLATTENED_RADDEC_WITH_OPTIONS = {
    transmitterId: "aabbccddeeff",
    transmitterIdType: 2,
    receiverId: "001bc50940810000",
    receiverIdType: 1,
    rssi: -77,
    rssiSignature: [{
        receiverId: "001bc50940810000",
        receiverIdType: 1,
        rssi: -77,
        numberOfDecodings: 2
    }],
    numberOfDecodings: 2,
    numberOfReceivers: 2,
    numberOfDistinctPackets: 1,
    timestamp: 1420075424000,
    events: [ 0 ]
};
const EXPECTED_DATA_TRIM_RADDEC = {
    transmitterId: "aabbccddeeff",
    transmitterIdType: 2,
    packets: [ '061bffeeddccbbaa02010611074449555520657669746341796c656576' ],
    rssiSignature: [{
        receiverId: "001bc50940810000",
        receiverIdType: 1,
        rssi: -77,
        numberOfDecodings: 2
    }],
    timestamp: 1420075424000
};


// Describe the scenario
describe('raddec', function() {

  let raddec = new Raddec(INPUT_DATA_TRANSMITTER);

  // Test the constructor
  it('should construct a bare Raddec', function() {
    assert.equal(raddec.transmitterId, EXPECTED_DATA_TRANSMITTER_ID);
    assert.equal(raddec.transmitterIdType, EXPECTED_DATA_TRANSMITTER_ID_TYPE);
    assert.deepEqual(raddec.rssiSignature, EXPECTED_DATA_BARE_RSSI_SIGNATURE);
  });

  // Test the encoder with rssiSignature length 0
  it('should encode a bare Raddec', function() {
    assert.equal(raddec.encodeAsHexString(), EXPECTED_DATA_BARE_ENCODING);
  });

  // Test the addDecoding function
  it('should add a decoding', function() {
    raddec.addDecoding(INPUT_DATA_FIRST_DECODING);
    assert.deepEqual(raddec.rssiSignature, EXPECTED_DATA_FIRST_RSSI_SIGNATURE);
    assert.equal(raddec.earliestDecodingTime,
                 EXPECTED_DATA_FIRST_EARLIEST_TIME);
  });

  // Test the encoder with rssiSignature length 1
  it('should encode a Raddec with one rssiSignature element', function() {
    assert.equal(raddec.encodeAsHexString(), EXPECTED_DATA_FIRST_ENCODING);
  });

  // Test the addDecoding function for a same receiver
  it('should add a decoding for an existing receiver', function() {
    raddec.addDecoding(INPUT_DATA_SECOND_DECODING);
    assert.deepEqual(raddec.rssiSignature, EXPECTED_DATA_SECOND_RSSI_SIGNATURE);
    assert.equal(raddec.earliestDecodingTime,
                 EXPECTED_DATA_SECOND_EARLIEST_TIME);
  });

  // Test the addDecoding function for a new receiver
  it('should add a decoding for a new receiver', function() {
    raddec.addDecoding(INPUT_DATA_THIRD_DECODING);
    assert.deepEqual(raddec.rssiSignature, EXPECTED_DATA_THIRD_RSSI_SIGNATURE);
    assert.equal(raddec.earliestDecodingTime,
                 EXPECTED_DATA_THIRD_EARLIEST_TIME);
  });

  // Test the encoder with rssiSignature length 2
  it('should encode a Raddec with two rssiSignature elements', function() {
    assert.equal(raddec.encodeAsHexString(), EXPECTED_DATA_THIRD_ENCODING);
  });

  // Test the addPacket function
  it('should add a packet', function() {
    raddec.addPacket(INPUT_DATA_FIRST_PACKET);
    assert.deepEqual(raddec.packets, EXPECTED_DATA_FIRST_PACKET);
  });

  // Test the addPacket function with a new packet
  it('should add a new packet', function() {
    raddec.addPacket(INPUT_DATA_SECOND_PACKET);
    assert.deepEqual(raddec.packets, EXPECTED_DATA_SECOND_PACKET);
  });

  // Test the addPacket function with an existing packet
  it('should not add an existing packet again', function() {
    raddec.addPacket(INPUT_DATA_THIRD_PACKET);
    assert.deepEqual(raddec.packets, EXPECTED_DATA_THIRD_PACKET);
  });

  // Test the addEvent function
  it('should add an event', function() {
    raddec.addEvent(INPUT_DATA_FIRST_EVENT);
    assert.deepEqual(raddec.events, EXPECTED_DATA_FIRST_EVENT);
  });

  // Test the addEvent function with a new event
  it('should add another event', function() {
    raddec.addEvent(INPUT_DATA_SECOND_EVENT);
    assert.deepEqual(raddec.events, EXPECTED_DATA_SECOND_EVENT);
  });

  // Test the addEvent function with an existing event
  it('should not add an existing event again', function() {
    raddec.addEvent(INPUT_DATA_THIRD_EVENT);
    assert.deepEqual(raddec.events, EXPECTED_DATA_THIRD_EVENT);
  });

  // Test the merge function with another raddec
  it('should merge the given raddec into the current', function() {
    raddec.merge(new Raddec(INPUT_DATA_MERGE_RADDEC));
    assert.deepEqual(raddec.rssiSignature, EXPECTED_DATA_MERGE_RSSI_SIGNATURE);
    assert.deepEqual(raddec.packets, EXPECTED_DATA_MERGE_PACKET);
    assert.equal(raddec.earliestDecodingTime,
                 EXPECTED_DATA_MERGE_EARLIEST_DECODING_TIME);
  });

  // Test the encoder with optional timestamp
  it('should encode a Raddec with optional timestamp', function() {
    assert.equal(raddec.encodeAsHexString({ includeTimestamp: true }),
                 EXPECTED_DATA_TIMESTAMP_ENCODING);
  });

  // Test the encoder with optional packets
  it('should encode a Raddec with optional packets', function() {
    assert.equal(raddec.encodeAsHexString({ includePackets: true }),
                 EXPECTED_DATA_PACKET_ENCODING);
  });

  // Test the encoder with optional events
  it('should encode a Raddec with optional events', function() {
    assert.equal(raddec.encodeAsHexString({ includeEvents: true }),
                 EXPECTED_DATA_EVENTS_ENCODING);
  });

  // Test the constructor from hexadecimal string
  it('should construct a Raddec from hexadecimal string', function() {
    raddec = new Raddec(INPUT_DATA_HEX_STRING_RADDEC);
    delete raddec['creationTime'];
    assert.deepEqual(raddec, EXPECTED_DATA_HEX_STRING_RADDEC);
  });

  // Test the constructor from hexadecimal string with optional properties
  it('should construct a Raddec from hexadecimal string', function() {
    raddec = new Raddec(INPUT_DATA_HEX_STRING_RADDEC_OPTIONS);
    delete raddec['creationTime'];
    assert.deepEqual(raddec, EXPECTED_DATA_HEX_STRING_RADDEC_OPTIONS);
  });

  // Test the constructor from Buffer
  it('should construct a Raddec from Buffer', function() {
    raddec = new Raddec(INPUT_DATA_BUFFER_RADDEC);
    delete raddec['creationTime'];
    assert.deepEqual(raddec, EXPECTED_DATA_BUFFER_RADDEC);
  });

  // Test the toFlattened function
  it('should create a flattened representation of the Raddec', function() {
    raddec = new Raddec(INPUT_DATA_FLATTENED_RADDEC);
    assert.deepEqual(raddec.toFlattened(), EXPECTED_DATA_FLATTENED_RADDEC);
  });

  // Test the toFlattened function with options
  it('should create a flattened Raddec with options', function() {
    raddec = new Raddec(INPUT_DATA_FLATTENED_RADDEC);
    assert.deepEqual(raddec.toFlattened(INPUT_OPTIONS_FLATTENED),
                     EXPECTED_DATA_FLATTENED_RADDEC_WITH_OPTIONS);
  });

  // Test the toFlattened function with a minimal raddec
  it('should create a flattened representation of the min Raddec', function() {
    raddec = new Raddec(INPUT_DATA_FLATTENED_MINIMAL_RADDEC);
    assert.deepEqual(raddec.toFlattened(),
                     EXPECTED_DATA_FLATTENED_MINIMAL_RADDEC);
  });

  // Test the trim function
  it('should trim non-standard properties from the Raddec', function() {
    raddec = new Raddec(INPUT_DATA_TRIM_RADDEC);
    raddec.trim();
    assert.deepEqual(raddec, EXPECTED_DATA_TRIM_RADDEC);
  });

});
