raddec
======

RADio DECoding packet library for RFID, RTLS and M2M
----------------------------------------------------

A __raddec__ is an open-standard representation of a radio decoding.  This library provides functionality to manipulate any __raddec__ as JSON and to convert to/from its binary representation.

![raddec overview](https://reelyactive.github.io/raddec/images/raddec-overview.png)


Motivation
----------

Radio-Frequency IDentification (RFID), Real-Time Location Systems (RTLS) and M2M (Machine-to-Machine) communications share several key properties:
- transmitters transmit packets that may be received by one or more receivers
- each transmitter and receiver has its own identifier
- each received packet produces metadata including a timestamp and a Received Signal Strength Indication (RSSI)

For a broad range of applications, it is useful to identify, to locate and to collect [ambient data](https://www.reelyactive.com/ambient-data/) from wireless devices, and this __raddec__ library is developed with the intent of providing a protocol-agnostic means of representing and efficiently transferring such information across networks.


Overview
--------

A __raddec__ has two forms: an _encoded_ form in which it has a strict binary representation, and a _decoded_ form in which it typically has a less-restrictive JSON representation.  The JSON representation is as follows:

```javascript
{
  transmitterId: "aabbccddeeff",
  transmitterIdType: 2,
  rssiSignature: [{
      receiverId: "001bc50940810000",
      receiverIdType: 1,
      rssi: -69,
      numberOfDecodings: 3
  }],
  packets: [ /* As hexadecimal strings */ ],
  timestamp: 1343392496789
}
```

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
let encoded = raddec.encodeAsHexString();
console.log(encoded);
// -> 10001702aabbccddeeff013a0101001bc509408100000b (23 bytes)

// Decoding restores a standard, easy-to-manipulate JSON object
raddec = new Raddec(encoded);

// A trim prunes any non-standard properties, adds timestamp if none present
raddec.trim();
console.log(raddec);
// {
//    transmitterId: "aabbccddeeff",
//    transmitterIdType: 2,
//    rssiSignature: [{
//        receiverId: "001bc50940810000",
//        receiverIdType: 1,
//        rssi: -69,
//        numberOfDecodings: 1
//    }],
//    timestamp: 1343392496789
//  }

// Flattening creates a JSON object suitable for storage/search/retrieval,
//   with the default options shown below
let options = {
    includePackets: true,        // Applicable when packets property is present
    includeRssiSignature: false, // Note that the rssiSignature is NOT flat
    maxNumberOfReceivers: 15,    // Only considered if
    rssiThreshold: -127          //   includeRssiSignature is true
};
let flattened = raddec.toFlattened(options);
console.log(flattened);
// {
//    transmitterId: "aabbccddeeff",
//    transmitterIdType: 2,
//    receiverId: "001bc50940810000",
//    receiverIdType: 1,
//    rssi: -69,
//    numberOfDecodings: 1,
//    numberOfReceivers: 1,
//    timestamp: 1343392496789
//  }

```


Properties
----------

A __raddec__ _must_ include the following mandatory properties and _may_ include any or all of the following optional properties.

### Mandatory Properties

A __raddec__ includes the following three mandatory properties in both its _encoded_ (binary) and _decoded_ (JSON) form.

| Property          | Type            | Description                          |
|:------------------|:----------------|:-------------------------------------|
| transmitterId     | String          | Hexadecimal string, lowercase, no separators |
| transmitterIdType | Number          | Single byte (0-255)                  |
| rssiSignature     | Array of Object | Ordered from strongest to weakest RSSI |

Each object in the rssiSignature array includes the following properties.

| Property          | Type            | Description                          |
|:------------------|:----------------|:-------------------------------------|
| receiverId        | String          | Hexadecimal string, lowercase, no separators |
| receiverIdType    | Number          | Single byte (0-255)                  |
| rssi              | Number          | In dBm                               |
| numberOfDecodings | Number          | Range of 1-255 (0 reserved)          |


### Optional Properties

A __raddec__ _may_ include any or all of the following properties.

| Property  | Type            | Description                                  |
|:----------|:----------------|:---------------------------------------------|
| timestamp | Number          | UNIX epoch (millisecond precision)           |
| packets   | Array of String | Hexadecimal string, lowercase, no duplicates |
| events    | Array of Number | Index list of associated events              |

When encoding a __raddec__, the optional properties to include must be explicitly specified, as the following example illustrates:

```javascript
let encodedRaddec = raddec.encodeAsHexString({ includeTimestamp: true,
                                               includePackets: true,
                                               includeEvents: true });
```


Supported Wireless Protocols
----------------------------

The __raddec__ library is being developed with consideration for the following protocols/standards:
- Bluetooth Low Energy (broadcaster/observer roles)
- WiFi (ex: probe requests)
- RAIN RFID
- LPWAN (various standards)
- proprietary Active RFID (ex: reelyActive)


Quick Reference
---------------

Both _identifier types_ and _event types_ are represented as numerical indexes for efficient manipulation and compact storage.

### Identifier Types

The identifier type indexes, which can be found in the _identifiers.js_ file, are as follows:

| Index | Raddec.identifiers. | Description                                    |
|:------|:--------------------|:-----------------------------------------------|
| 0     | TYPE_UNKNOWN        | Unknown identifier type                        |
| 1     | TYPE_EUI64          | EUI-64 (used by reelyActive infrastructure)    |
| 2     | TYPE_EUI48          | EUI-48 (WiFi, BLE public addresses)            |
| 3     | TYPE_RND48          | Random 48-bit advertiser address (BLE)         |
| 4     | TYPE_TID96          | 96-bit tag identifier (EPC Tag Data Standard)  |
| 5+    | - RESERVED -        | Reserved for future use                        |

### Event Types

The event type indexes, which can be found in the _events.js_ file, are as follows:

| Index | Raddec.events.  | Description                                         |
|:------|:----------------|:----------------------------------------------------|
| 0     | APPEARANCE      | First decoding of the transmitter in recent memory  |
| 1     | DISPLACEMENT    | Change of strongest receiver by transmitter         |
| 2     | PACKETS         | New packet payload received from transmitter        |
| 3     | KEEPALIVE       | Periodic update of transmitter's recent decoding(s) |
| 4     | DISAPPEARANCE   | Transmitter no longer decoded by any receiver       |
| 5-7   | - RESERVED -    | Reserved for future use                             |


What's next?
------------

This library is currently in active development.  Expect features to be added periodically.  We recommend observing semantic versioning best practices for dependents should breaking changes be required.  If you have an interest in using this library and/or have strong thoughts on its properties, kindly get in touch via our [contact information](https://www.reelyactive.com/contact/).


Contributing
------------

Discover [how to contribute](CONTRIBUTING.md) to this open source project which upholds a standard [code of conduct](CODE_OF_CONDUCT.md).


Security
--------

Consult our [security policy](SECURITY.md) for best practices using this open source software and to report vulnerabilities.

[![Known Vulnerabilities](https://snyk.io/test/github/reelyactive/raddec/badge.svg)](https://snyk.io/test/github/reelyactive/raddec)


License
-------

MIT License

Copyright (c) 2018-2022 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
