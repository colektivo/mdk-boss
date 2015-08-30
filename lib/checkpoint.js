var System = require('./device.js');

var Checkpoint = function (args) {
  this.slug = args.slug;
  this.device_path = args.device_path;
  this.order = args.order;
  this.device = {};
  this.fullBuffer = [];
  this.counter = 0;
  this.capture = function(data) {
    System.capture(data, this);
  }
};

module.exports = Checkpoint;
