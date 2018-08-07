raddec
======

RADio DECoding packet library for RFID, RTLS and M2M.  We believe in an open Internet of Things.


Motivation
----------

Radio-Frequency IDentification (RFID), Real-Time Location Systems (RTLS) and M2M (Machine-to-Machine) communications share several key properties:
- transmitters transmit packets that may be received by one or more receivers
- each transmitter and receiver has its own identifier
- each received packet produces metadata including a timestamp and a Received Signal Strength Indication (RSSI)

For a broad range of applications, it is useful to identify, to locate and to collect sensed data from wireless devices, and this __raddec__ library is developed with the intent of providing a protocol-agnostic means of representing and efficiently transferring such information across networks.


Overview
--------

A __raddec__ has two forms: an _encoded_ form in which it has a strict binary representation, and a _decoded_ form in which it typically has a less-restricive JSON representation.

This library provides functionality to _encode_ a __raddec__, typically in anticipation of network transport to a destination computer, and to _decode_ the same __raddec__, typically to facilitate manipulation and storage of the contained information.

### Hello raddec!

```javascript
const Raddec = require('raddec');

// The minimal raddec includes simply a transmitter identifier and type
let raddec = new Raddec({ 
    transmitterId: "aa:bb:cc:dd:ee:ff",
    transmitterIdType: Raddec.identifiers.TYPE_EUI48
});

// One or more decodings by receivers are typically added
raddec.addDecoding({
    receiverId: "00-1b-c5-09-40-81-00-00",
    receiverIdType: Raddec.identifiers.TYPE_EUI64,
    rssi: -69
});

// Encoding results in a compact representation
console.log(raddec.encodeAsHexString());
// -> 10001702aabbccddeeff013a0101001bc509408100000b (23 bytes)

// Decoding restores a standard, easy-to-manipulate JSON object
raddec = new Raddec(raddec.encodeAsHexString());
console.log(raddec);
// {
//    transmitterId: "aabbccddeeff",
//    transmitterIdType: 2,
//    rssiSignature: [{
//        receiverId: "001bc50940810000",
//        receiverIdType: 1,
//        rssi: -69,
//        numberOfDecodings: 1
//    }]
//  }

```


Mandatory Properties
--------------------

A __raddec__ includes the following three mandatory properties in both its _encoded_ and _decoded_ form.

| Property          | Type            | Description                          |
|-------------------|-----------------|--------------------------------------|
| transmitterId     | String          | Hexadecimal string, lowercase, no separators |
| transmitterIdType | Number          | Single byte (0-255)                  |
| rssiSignature     | Array of Object | Ordered from strongest to weakest RSSI |

Each object in the rssiSignature array includes the following properties.

| Property          | Type            | Description                          |
|-------------------|-----------------|--------------------------------------|
| receiverId        | String          | Hexadecimal string, lowercase, no separators |
| receiverIdType    | Number          | Single byte (0-255)                  |
| rssi              | Number          | In dBm                               |
| numberOfDecodings | Number          | Range of 1-255 (0 reserved)          |


Optional Properties
-------------------

A __raddec__ may include any or all of the following properties.

| Property          | Type            | Description                          |
|-------------------|-----------------|--------------------------------------|
| timestamp*        | Number          | *various options being defined...    |
| packets           | Array of String | Hexadecimal string, lowercase, no duplicates |


Supported Wireless Protocols
----------------------------

The __raddec__ library is being developed with consideration for the following protocols/standards:
- Bluetooth Low Energy (broadcaster/observer roles)
- WiFi (ex: probe requests)
- RAIN RFID
- LPWAN (various standards)
- proprietary Active RFID (ex: reelyActive)


What's next?
------------

This library is currently in active development and breaking changes to the encoded __raddec__ are to be expected.  If you have an interest in using this library and/or have strong thoughts on its properties, kindly get in touch via our [contact information](https://www.reelyactive.com/contact/).


License
-------

MIT License

Copyright (c) 2018 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
