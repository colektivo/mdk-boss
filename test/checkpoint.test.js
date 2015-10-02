'use strict'

var chai = require('chai')
  , expect = chai.expect
  , should = chai.should()
  , sinon = require('sinon')
  , moment = require('moment')
  , Sequelize = require('sequelize')
  , Promise = Sequelize.Promise;


var Checkpoint = require('./../lib/checkpoint.js');
var HID = require('node-hid');

var sampleDecicesConfig = {
  "entrance": {
    "path": "USB_08ff_0009_14541000",
    "position": 1
  },
  "hall": {
    "path": "USB_08ff_0009_14541700",
    "position": 2
  },
  "exit": {
    "path": "USB_08ff_0009_14541400",
    "position": 3
  }
};


// end fixture data


describe('Checkpoint', function () {
  describe("#new", function () {
    it("should remember devicePath", function () {
      var checkpoint = new Checkpoint(sampleDecicesConfig.entrance);
      checkpoint.devicePath.should.equal(sampleDecicesConfig.entrance.path);
    });
    it("should remember the position", function () {
      var checkpoint = new Checkpoint(sampleDecicesConfig.hall);
      checkpoint.position.should.equal(2);
    });
  });
});
