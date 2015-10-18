'use strict';

var Device = require('./device.js');

var Checkpoint = function (args) {
  this.device = args.device;
  this.position = args.position;
  this.reader = new Device();
};

module.exports = Checkpoint;
