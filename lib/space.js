'use strict';

var HID = require('node-hid');
var System = require('./device.js');
var Checkpoint = require('./checkpoint.js');

// prototype Array.max
Array.prototype.max = function () {
    return Math.max.apply(Math, this);
};

console.log(HID.devices());

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
  lastPosition: function() {
    return this._checkpoints.map(
      function (element, index){
        return element.position;
    }).max();
  },
  isReady: function(){
    var active = this._checkpoints.filter(
        function( element, index){
          return element.up;
        });
        return active.length == this._checkpoints.length;
  },
  addCheckpoint: function (checkpointData) {
    var point = new Checkpoint(checkpointData);
    var deviceFound = this.readers().filter( function( element, index) {
      return (element.path === point.devicePath);
    });
    if (deviceFound.length > 0) {
      point.device = new HID.HID(deviceFound[0].path);
      point.device.on("data", point.capture.bind(point));
      point.up = true;
      this._checkpoints.push(point);
      console.log('Device ' + point.devicePath + ' [OK] ');
    } else {
      point.up = false;
      this._checkpoints.push(point);
      console.log('Device ' + point.devicePath + ' [NOT FOUND] ');
    }

    return point;
  }
}
module.exports = space;
