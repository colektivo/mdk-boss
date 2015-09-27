'use strict';

var HID = require('node-hid');
var System = require('./device.js');
var Checkpoint = require('./checkpoint.js');
var models  =     require('../models')
  , Sequelize = require('sequelize')
  , Promise = Sequelize.Promise;


// prototype Array.max
Array.prototype.max = function () {
    return Math.max.apply(Math, this);
};

// console.log(HID.devices());

var space = {
  _checkpoints: [],
  defaultConfig: function(){
    var devices = this.readers().map(function(device, index){
      return { device: device.path, position: 0 }
    });
    return { devices: devices };
  },

  say: function (socket, command, data) {
    console.log('boss says: ' + command + JSON.stringify(data));
    socket.emit('boss says', { command: command, config: data} );
  },

  devices: function(){
    return HID.devices();
  },

  isValidConfig: function() {
    return new Promise(function(resolve, reject){
      this.config()
        .then(function(config){
          var numOfValidDevices = config.devices
            .filter(function(entry){
              return this.isValidPosition(entry) && this.isValidDevice(entry);
            }.bind(this))
            .length
          resolve(numOfValidDevices == config.devices.length);
      }.bind(this));
    }.bind(this));
  },

  isValidPosition: function(entry){
    //console.log('lastPosition:' + this.lastPosition());
    return (entry.position > 0 && entry.position < (this.readers().length + 1));
  },

  isValidDevice: function(device){
    return this.readers().filter(function(reader){
      console.log('reader.path:'+reader.path);
      console.log('device.device:'+device.device);
      return reader.path === device.device
    }).length == 1;
  },

  saveConfig: function(newConfig){
    return new Promise(function(resolve, reject) {
      models.Config.create({data: newConfig}, {logging: false}).then(function(config, created) {
        resolve(config.data);
      });
    });
  },

  config: function() {
    return new Promise(function(resolve, reject) {
      var query = "SELECT * FROM "
                + "configs "
                + "ORDER BY created_at DESC "
                + "LIMIT 1";
      return models.sequelize.query(query,
        { logging: false
        , type: models.sequelize.QueryTypes.SELECT
        }
      ).then(function(result){
        if (result.length > 0) {
          resolve(result[0].data);
        } else {
          this.saveConfig(this.defaultConfig()).then(function(config){
            resolve(config);
          });
        }
      }.bind(this));
    }.bind(this));


  },
  readers: function() {
    var deviceFinderString = 'SYC ID&IC USB Reader';
    return this.devices().filter(
      function( element, index) {
        return element.product === deviceFinderString;
      }
    );
  },

  disconnect: function() {
    this.checkpoints().forEach(function(point){
      point.device.close();
    });
    this._checkpoints = [];
  },

  checkpoints: function () {
    return this._checkpoints;
  },

  lastPosition: function() {
    return this._checkpoints.map(
      function (element, index){
        return element.position;
    }).max();
  },

  isReady: function(){
    var active = this._checkpoints.filter(
        function( element, index){
          return element.up;
        });
        return active.length == this._checkpoints.length;
  },

  addCheckpoint: function (checkpointData, traceCallback) {
    var point = new Checkpoint(checkpointData);
    var deviceFound = this.readers().filter( function( element, index) {
      return (element.path === point.devicePath);
    });
    if (deviceFound.length > 0) {
      point.device = new HID.HID(deviceFound[0].path);
      point.device.on("data", point.capture.bind(point));
      point.up = true;
      this._checkpoints.push(point);
      // add trace method before start
      point.reader.on('read', traceCallback);
      console.log('Device ' + point.devicePath + ' [OK] ');
    } else {
      point.up = false;
      this._checkpoints.push(point);
      console.log('Device ' + point.devicePath + ' [NOT FOUND] ');
    }

    return point;
  }
}
module.exports = space;
