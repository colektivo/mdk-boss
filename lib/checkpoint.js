var Device = require('./device.js');

var Checkpoint = function (args) {
  this.slug = args.slug;
  this.device_path = args.device_path;
  this.order = args.order;
  this.reader = new Device;
  this.capture = function(data) {
    this.reader.capture(data, this);
  }
};

module.exports = Checkpoint;
