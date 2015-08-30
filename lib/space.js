var HID = require('node-hid');
var devices = HID.devices();
var deviceFinderString = 'SYC ID&IC USB Reader';

var System = require('./device.js');
var Checkpoint = require('./checkpoint.js');

var readers = devices.filter( function( element, index) {
  console.log(element.product);
  return element.product === deviceFinderString;
});

console.log(readers);

var space = {
  _checkpoints: [],
  checkpoints: function () {
    return this._checkpoints;
  },
  addCheckpoint: function (checkpoint) {
    point = new Checkpoint(checkpoint);
    point.device = new HID.HID(
      readers.filter( function( element, index) {
      return element.path === point.device_path;
    })[0].path);
    point.device.on("data", point.capture.bind(point));
    this._checkpoints.push(point);
  }
}
module.exports = space;


