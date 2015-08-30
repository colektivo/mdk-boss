var Space = require('./lib/space.js');
var Device = require('./lib/device.js');
var HID = require('node-hid');


Space.addCheckpoint({slug: 'entrance', device_path: 'USB_08ff_0009_14541300', order: 1});
Space.addCheckpoint({slug: 'mid', device_path: 'USB_08ff_0009_14541400', order: 2});
Space.addCheckpoint({slug: 'last', device_path: 'USB_08ff_0009_14541200', order: 3});

