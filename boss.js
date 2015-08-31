var Space = require('./lib/space.js');
var Device = require('./lib/device.js');
var HID = require('node-hid');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var entrance = Space.addCheckpoint({slug: 'entrance', device_path: 'USB_08ff_0009_14541300', order: 1});
var mid = Space.addCheckpoint({slug: 'mid', device_path: 'USB_08ff_0009_14541400', order: 2});
var last = Space.addCheckpoint({slug: 'last', device_path: 'USB_08ff_0009_14541200', order: 3});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  entrance.reader.on('read', function(data){ 
    io.emit('chat message', data);
    //console.log(data);
  });
  mid.reader.on('read', function(data){ 
    io.emit('chat message', data);
  });
  last.reader.on('read', function(data){ 
    io.emit('chat message', data);
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});

