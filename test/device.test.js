'use strict'

var chai = require('chai')
  , expect = chai.expect
  , should = chai.should()
  , sinon = require('sinon')
  , moment = require('moment')
  , Sequelize = require('sequelize')
  , Promise = Sequelize.Promise;

sinon.assert.expose(chai.assert, { prefix: "" });

var Device = require('./../lib/device.js');
var Checkpoint = require('./../lib/checkpoint.js');
var HID = require('node-hid');

// Fixture data, should be located in other file.

    var bufferListCard1 = [];
    bufferListCard1.push(new Buffer('00001f0000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000220000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000210000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000200000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000240000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard1.push(new Buffer('00001e0000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000210000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000220000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000270000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000240000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000280000000000', 'hex'));
    bufferListCard1.push(new Buffer('0000000000000000', 'hex'));


    var bufferListCard2 = [];
    bufferListCard2.push(new Buffer('0000200000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000220000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000270000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000210000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000230000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000240000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000220000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000200000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard2.push(new Buffer('00001f0000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000200000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000000000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000280000000000', 'hex'));
    bufferListCard2.push(new Buffer('0000000000000000', 'hex'));

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

describe('Device', function () {
  describe('#capture()', function() {
    it('should emit read event', function () {
      var result;
      var device = new Device();
      var spy = sinon.spy();
      var checkpoint = new Checkpoint({slug: 'entrance', devicePath: 'USB_08ff_0009_14541300', position: 1});
      device.on('read', spy);
      bufferListCard1.map(function(element, index ) {
        result = device.capture(element, checkpoint );
      });
      // assert(spy.calledWith({
      //   checkpoint: checkpoint,
      //   id: result},
      //   { for: 'everyone' }));
      sinon.assert.calledWith(spy, {
        checkpoint: checkpoint,
        id: result},
        { for: 'everyone' });

    });
  });

  describe('#capture()', function() {
    it('should return the card id based on data events', function () {
      var result;
      var device = new Device();
      var checkpoint = new Checkpoint({slug: 'entrance', devicePath: 'USB_08ff_0009_14541300', position: 1});
      bufferListCard1.map(function(element, index ) {
        result = device.capture(element, checkpoint );
      });
      result.should.equal('2543714507');

      var checkpoint = new Checkpoint({slug: 'mid', devicePath: 'USB_08ff_0009_14541400', position: 2});
      bufferListCard2.map(function(element, index ) {
        result = device.capture(element, checkpoint);
      });
      result.should.equal('3504675323');
    });
  });

  describe('#decode()', function () {
    it('should return the decoded Card id from captured array from reader', function () {
      var device = new Device();
      device.decode([ 31, 0, 34, 0, 33, 0, 32, 0, 36, 0, 30, 0, 33, 0, 34, 0, 39, 0, 36, 0, 40, 0 ]).should.equal('2543714507');
      device.decode([ 32, 0, 34, 0, 39, 0, 33, 0, 35, 0, 36, 0, 34, 0, 32, 0, 31, 0, 32, 0, 40, 0 ]).should.equal('3504675323');
    });
  });
});
