'use strict';

var Space     = require('./lib/space.js');
var Device    = require('./lib/device.js');
var HID       = require('node-hid');
var Checking  = require('./lib/operations/checkin.js');
var Kapitalismus  = require('./lib/kapitalismus.js');

var io        = require('socket.io')(8001);
//var devices   = Space.readers();
var devices   = require(__dirname + '/config/devices.json');
var Payment = require('./lib/representers/payment.js');
var VisitorComputation = require('./lib/operations/visitorComputation.js');

/*
As the devicePath change every time this should be reconfigured everytime, maybe a config file and a setup cli command will be a good idea
*/

console.log(Kapitalismus());

io.on('connection', function(socket){

  socket.on('init', function(data){
    console.log('init');
    Space.isValidConfig()
      .then(function(isValid){
        console.log('isValid:' + isValid);
        if (isValid) {
          Space.config().then(function(config){
            return Space.say(socket, 'ready to start', config);
          });
        } else {

          console.log(Space.readers());

          console.log("closing if there are previous connections");
          Space.disconnect();

          // devices should be added based on config not by defalult

          Space.readers().forEach(function(device){
            console.log("device to add:" + device.path);
            Space.addCheckpoint(device, function(data) {
              // devices empty array is added to leverage the maybe handling on Employee
              var check = {'readerData': {'devicePath': data.checkpoint.devicePath, 'id': data.id }, 'devices': []};
              console.log('data:' + JSON.stringify(check));
              Space.say(socket,'check', check);
            });
          });

          var config = Space.defaultConfig();
          console.log('config:' + JSON.stringify(config));

          return Space.say(socket, 'configure', config);

        }
      });
    });

  socket.on('save config', function (data) {
    console.log('save config:' + data);
    Space.saveConfig(JSON.parse(data))
      .then(function(config){
        console.log('new config:' + JSON.stringify(config));
        return Space.say(socket, 'ready to start', config);
      });
  });

  socket.on('stop', function (data) {
    socket.server.close();
  });

  socket.on('restart', function (data) {
    var config = Space.defaultConfig();
    return Space.say(socket, 'configure', config);
  });

  socket.on('start', function (data) {

    Space.disconnect();
    Space.config().then(function(config){
      config.devices.forEach(function(device){
        // device.device device.path device.devicePath WTF! REFACTOR.ME
        console.log("device to add:" + device.device);
        Space.addCheckpoint({path: device.device, position: device.position }, function() {});

      });
      if (Space.isReady()) {

        console.log('space ready');
        Space.say(socket, 'start tracking', config);

        var lastPosition = Space.lastPosition();
        var totalDevices = Space._checkpoints.length;

        console.log('totalDevices:' + totalDevices);
        console.log('lastPosition:' + lastPosition);


        Space.checkpoints().forEach(function(checkpoint){
          checkpoint.reader.on('read', function(data) {
            Checking.read(data.checkpoint, data.id)
              .then(function(){
                //socket.emit('check', { position: data.checkpoint.position, cardId: data.id } );
                if (data.checkpoint.position == lastPosition ) {
                  Payment.compute(data.id, totalDevices).then( function(data) {
                    console.log('payment   :' + JSON.stringify(data));
                    VisitorComputation.validateAndStore(data);
                    return socket.emit('completed', data);
                  });
                }
              });
            });
          });
      } else {
        return Space.say(socket, 'configure', {});
      }

    })

 });


});
