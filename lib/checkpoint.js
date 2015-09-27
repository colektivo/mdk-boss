'use strict';

var Device = require('./device.js');

var Checkpoint = function (args) {
  this.devicePath = args.path;
  this.position = args.position;
  this.reader = new Device;
  this.capture = function(data) {
    this.reader.capture(data, this);
  }
};

module.exports = Checkpoint;
