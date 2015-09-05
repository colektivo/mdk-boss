'use strict';

var Space = require('./lib/space.js');
var Device = require('./lib/device.js');
var HID = require('node-hid');
var Checking = require('./lib/operations/checking.js');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/*
As the devicePath change every time this should be reconfigured everytime, maybe a config file and a setup cli command will be a good idea
*/

var entrance = Space.addCheckpoint({slug: 'entrance', devicePath: 'USB_08ff_0009_14541000', position: 1});
var mid = Space.addCheckpoint({slug: 'mid', devicePath: 'USB_08ff_0009_14541400', position: 2});
var last = Space.addCheckpoint({slug: 'last', devicePath: 'USB_08ff_0009_14541200', position: 3});

if (Space.isReady()) {
  app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });

  io.on('connection', function(socket){
    socket.emit('chat message', 'I\'m tracking you...' );
    entrance.reader.on('read', function(data){ 
      Checking.read(data.checkpoint, data.id);
      io.emit('chat message', data.checkpoint.position + ':' + data.id );
    });
    mid.reader.on('read', function(data){ 
      Checking.read(data.checkpoint, data.id);
      io.emit('chat message', data.checkpoint.position + ':' + data.id );
    });
    last.reader.on('read', function(data){ 
      Checking.read(data.checkpoint, data.id);
      io.emit('chat message', data.checkpoint.position + ':' + data.id );
    });
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



