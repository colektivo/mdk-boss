var EventEmitter = require('events').EventEmitter;
var util = require('util');
var MAXBUFFERS = 22;
var UNUSEDBUFFER = 20;

var Device = function () {
  this.init();
}

util.inherits(Device, EventEmitter);

Device.prototype.init = function () {
  this.counter = 0;
  this.fullBuffer = [];
}

Device.prototype.decode = function (array) {
  // discard useless data
  var result = array.filter( function (element, index) {
    return !(index % 2) && (index < UNUSEDBUFFER)
  }).map(function(element, index){
    // take the lower bits (4) from the byte + 1 to get the digits
    var value = parseInt(parseInt(element + 1, 16).toString(2).slice(-4),2);
    return value;
  }).join('');
  return result;
}

Device.prototype.capture = function (buffer, point) {
  this.counter++;
  // capture the 3rd byte
  this.fullBuffer.push(buffer[2]);
  if (this.counter == util) {
    this.counter = 0
    var result = this.decode(this.fullBuffer);
    this.fullBuffer = []
    this.emit('read', 'Location:' + point.slug + ' res:' + result, { for: 'everyone' });

    return result;
  }
}

module.exports = Device;

