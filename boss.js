'use strict';

var Space     = require('./lib/space.js');
var Device    = require('./lib/device.js');
var HID       = require('node-hid');
var Checking  = require('./lib/operations/checking.js');

var app       = require('express')();
var http      = require('http').Server(app);
var io        = require('socket.io')(http);

var env       = process.env.NODE_ENV || 'development';
var devices   = require(__dirname + '/config/devices.json')[env];

/*
As the devicePath change every time this should be reconfigured everytime, maybe a config file and a setup cli command will be a good idea
*/

var entrance = Space.addCheckpoint(devices.entrance);
var mid = Space.addCheckpoint(devices.hall);
var last = Space.addCheckpoint(devices.exit);

if (Space.isReady()) {
  app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });

  io.on('connection', function(socket){
    socket.emit('chat message', 'I\'m tracking you...' );
    var lastPosition = Space.lastPosition();
    for (var i = 0; i < Space._checkpoints.length; i++) {
      Space._checkpoints[i].reader.on('read', function(data){
        Checking.read(data.checkpoint, data.id);
        io.emit('chat message', data.checkpoint.position + ':' + data.id );
        if (data.checkpoint.position == lastPosition) {
          io.emit('chat message', 'Show starts for: ' + data.id  );
        }
      });
    }
  });

  http.listen(3000, function(){
    console.log('listening on *:3000');
  });

} else {
  console.log('Your boss is having holidays...');
  Space._checkpoints.filter(
    function(element, index){
      return element.up;
    }).forEach(
      function(element, index) {
        console.log('Device ' + element.devicePath + ' not found');
    });
}
