'use strict';

var Space     = require('./lib/space.js');
var Device    = require('./lib/device.js');
var HID       = require('node-hid');
var Checking  = require('./lib/operations/checkin.js');

var app       = require('express')();
var http      = require('http').Server(app);
var io        = require('socket.io')(8001);

var env       = process.env.NODE_ENV || 'development';
var devices   = require(__dirname + '/config/devices.json')[env];

/*
As the devicePath change every time this should be reconfigured everytime, maybe a config file and a setup cli command will be a good idea
*/

var entrance = Space.addCheckpoint(devices.entrance);
var mid = Space.addCheckpoint(devices.hall);
var last = Space.addCheckpoint(devices.exit);
var Payment = require('./lib/representers/payment.js');

if (Space.isReady()) {
  app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });

  io.on('connection', function(socket){
    socket.emit('hello', { message: 'I\'m tracking you...' });
    var lastPosition = Space.lastPosition();
    var totalDevices = Space._checkpoints.length;

    for (var i = 0; i < totalDevices; i++) {
      Space._checkpoints[i].reader.on('read', function(data){
        Checking.read(data.checkpoint, data.id)
          .then(function(){
          socket.emit('check', { position: data.checkpoint.position, cardId: data.id } );
          if (data.checkpoint.position == lastPosition) {
            Payment.compute(data.id, totalDevices).then( function(data){
              socket.emit('completed', { text: 'Gotcha!'} );
              socket.emit('completed', data);
            });
          }
        });
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
