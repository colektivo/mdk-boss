'use strict';

var System = require('./device.js');
var Checkpoint = require('./checkpoint.js');
var models  =     require('../models')
  , Sequelize = require('sequelize')
  , Promise = Sequelize.Promise;

var space = {
  tracking: false,
  devices: [],
  checkpoints: [],
  currentConfig: {},
  currentLastDevice: "",
  defaultConfig: function(){
    var devices = this.devices.map(function(device, index){
      return { device: device, position: 0 }
    });
    return { devices: devices };
  },

  setDevices: function(devices){
    this.devices = devices;
  },

  say: function (socket, command, data) {
    console.log('\nBOSS SAYS: ' + command + ':' + JSON.stringify(data));
    socket.emit('boss says', { command: command, config: data} );
  },

  shout: function (socket, command, data) {
    console.log('\nBOSS SHOUT: ' + command + ':' + JSON.stringify(data));
    socket.broadcast.emit('boss says', { command: command, config: data} );
  },

  isTracking: function(){
    return this.tracking;
  },

  isValidConfig: function() {
    return new Promise(function(resolve, reject){
      this.config()
        .then(function(config){
          var numOfValidDevices = config.devices
            .filter(function(entry){
              return this.isValidPosition(entry) && this.isValidDevice(entry);
            }.bind(this))
            .length;
          resolve(numOfValidDevices == config.devices.length && config.devices.length > 2);
      }.bind(this));
    }.bind(this));
  },

  isValidPosition: function(entry){
    return (entry.position > 0 && entry.position < (this.devices.length + 1));
  },

  isValidDevice: function(device){
    return this.devices.filter(function(existingDevice){
      return existingDevice === device.device
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

  lastDevice: function(config) {
    return config.devices.filter(
      function(element, index, array) {
        if (element.position == config.devices.length) {
          return element;
        }
    })[0].device
  },

  addCheckpoint: function (checkpointData) {
    var point = new Checkpoint(checkpointData);
    this.checkpoints.push(point);
    return point;
  }
}
module.exports = space;
