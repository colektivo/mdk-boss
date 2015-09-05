'use strict';

var HID = require('node-hid');
var System = require('./device.js');
var Checkpoint = require('./checkpoint.js');

var space = {
  _checkpoints: [],
  devices: function(){
    return HID.devices();
  },
  readers: function() {
    var deviceFinderString = 'SYC ID&IC USB Reader';
    return this.devices().filter(
      function( element, index) {
        return element.product === deviceFinderString;
      }
    );
  },
  checkpoints: function () {
    return this._checkpoints;
  },
  addCheckpoint: function (checkpointData) {
    
    var point = new Checkpoint(checkpointData);
    point.device = new HID.HID(
      this.readers().filter( function( element, index) {
      return element.path === point.devicePath;
    })[0].path);
    point.device.on("data", point.capture.bind(point));
    this._checkpoints.push(point);
    return point;
  }
}
module.exports = space;


