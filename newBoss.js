'use strict';

var Kapitalismus  = require('./lib/kapitalismus.js');
var io = require('socket.io')(8001);
var Device = require('./lib/device.js');
var Checkin  = require('./lib/operations/checkin.js');

var Payment = require('./lib/representers/payment.js');
var VisitorComputation = require('./lib/operations/visitorComputation.js');

var util = require('util');
var Space = require('./lib/space.js');

console.log(Kapitalismus());

io.on('connection', function(socket){

  socket.on('save config', function (data) {
    console.log('====================');
    console.log('save config:' + data);
    console.log('====================');
    Space.saveConfig(JSON.parse(data))
      .then(function(config){
        return Space.say(socket, 'ready to start', config);
      });
  });

  socket.on('stop', function (data) {
    socket.server.close();
  });

  socket.on('restart', function (data) {
    var config = Space.defaultConfig();
    Space.saveConfig(config).then(function(config){
      return Space.say(socket, 'configure', config);
    });
  });

  socket.on('employee started', function (data){

    if (Space.devices.length > 0) {
      console.log('=========================');
      console.log('employee started devices:' + Space.devices);
      console.log('=========================');
      socket.emit('units ready', "all units working" );
      Space.isValidConfig()
        .then(function(isValid){
          if (isValid) {
            Space.config().then(function(config){
              console.log('ready to start');
              Space.say(socket, 'ready to start', config);
              return;
            });
          } else {
            var config = Space.defaultConfig();
            console.log('Config not valid:' + JSON.stringify(config));
            Space.say(socket, 'configure', config);

            return;
          }
        });

    }

  })

  socket.on('devices', function(data){

    // code smell here, sorry
    Space.setDevices(data);
    console.log("===========================");
    console.log("Adding devices from police:\n");
    Space.devices.forEach(function(device){
      console.log("    device: " + device);
      Space.addCheckpoint(device);
    });
    console.log("\n===========================\n");

    // start listen to the devices
    data.forEach(function(device){
      var reader = new Device();
      reader.on('read', function(data) {
        var check = {'readerData': {'devicePath': data.device, 'id': data.id }, 'devices': []};
        Space.shout(socket, 'check', check );
        console.log(JSON.stringify(check));

        if (Space.isTracking()) {
          var currentPosition = Space.currentConfig.devices.filter(function(element){ return element.device == data.device})[0].position;
          Checkin.read(currentPosition, data.id)
            .then(function() {
              if (data.device == Space.currentLastDevice ) {
                Payment.compute(data.id, Space.currentConfig.devices.length).then( function(data) {
                  console.log('payment   :' + JSON.stringify(data));
                  VisitorComputation.validateAndStore(data);
                  return socket.broadcast.emit('completed', data);
                });
              }
            });
        }
      });
      socket.on(device, function(data){
        reader.capture(data, device);
      }.bind(this));
    }.bind(this));

    socket.on('disconnect', function(){
      socket.broadcast.emit('units ready', "" );
        console.log('police disconnected');
      });

    Space.isValidConfig()
      .then(function(isValid){
        if (isValid) {
          Space.config().then(function(config){
            console.log("\nConfiguration valid, READY TO START\n")
            return Space.shout(socket, 'ready to start', config);
          });
        } else {
          console.log("\nConfiguration not valid, waiting for employee to configure...\n")
          var config = Space.defaultConfig();
          return Space.shout(socket, 'configure', config);
        }
      });


    socket.broadcast.emit('units ready', "all units working");

    return;

  }.bind(this));

  socket.on('start', function (data) {

    Space.config().then(function(config){

      Space.currentLastDevice = Space.lastDevice(config);
      var totalDevices = Space.checkpoints.length;

      Space.tracking = true;
      Space.currentConfig = config;

      console.log('totalDevices:' + totalDevices);
      console.log('lastDevice:' + Space.currentLastDevice);

      console.log('space ready');
      Space.say(socket, 'start tracking', config)
    });

  });

  // TODO use ack here
  // tell the police that the devices where received
  socket.emit('devices', {});

});
