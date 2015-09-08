'use strict'

var assert = require("assert");
var expect = require('expect.js');
var sinon = require('sinon');

var Checkpoint = require('./../lib/checkpoint.js');
var HID = require('node-hid');

var sampleDecicesConfig = {
  "entrance": {
    "devicePath": "USB_08ff_0009_14541000",
    "position": 1
  },
  "hall": {
    "devicePath": "USB_08ff_0009_14541700",
    "position": 2
  },
  "exit": {
    "devicePath": "USB_08ff_0009_14541400",
    "position": 3
  }
};


// end fixture data


describe('Checkpoint', function () {
  describe("#new", function () {
    it("should remember devicePath", function () {
      var checkpoint = new Checkpoint(sampleDecicesConfig.entrance);
      assert.equal(sampleDecicesConfig.entrance.devicePath, checkpoint.devicePath);
    });
    it("should remember the position", function () {
      var checkpoint = new Checkpoint(sampleDecicesConfig.hall);
      assert.equal(2, checkpoint.position);
    });
  });
});
