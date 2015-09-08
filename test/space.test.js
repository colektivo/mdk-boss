'use strict'

var assert = require("assert");
var expect = require('expect.js');
var sinon = require('sinon');

var EventEmitter = require('events').EventEmitter;
var Device = require('./../lib/device.js');
var Space = require('./../lib/space.js');
var Checkpoint = require('./../lib/checkpoint.js');
var HID = require('node-hid');

// Fixture data, should be located in other file.

var sampleDevices = [ { vendorId: 1452,
    productId: 628,
    path: 'USB_05ac_0274_14c00000',
    serialNumber: 'D3H5196A5S1FTV4AD5ES',
    manufacturer: 'Apple Inc.',
    product: 'Apple Internal Keyboard / Trackpad',
    release: 1572,
    interface: -1 },
  { vendorId: 1452,
    productId: 628,
    path: 'USB_05ac_0274_14c00000',
    serialNumber: 'D3H5196A5S1FTV4AD5ES',
    manufacturer: 'Apple Inc.',
    product: 'Apple Internal Keyboard / Trackpad',
    release: 1572,
    interface: -1 },
  { vendorId: 2303,
    productId: 9,
    path: 'USB_08ff_0009_14541200',
    serialNumber: '08FF20140315',
    manufacturer: 'Sycreader RFID Technology Co., Ltd',
    product: 'SYC ID&IC USB Reader',
    release: 8,
    interface: -1 },
  { vendorId: 1452,
    productId: 628,
    path: 'USB_05ac_0274_14c00000',
    serialNumber: 'D3H5196A5S1FTV4AD5ES',
    manufacturer: 'Apple Inc.',
    product: 'Apple Internal Keyboard / Trackpad',
    release: 1572,
    interface: -1 },
  { vendorId: 1452,
    productId: 628,
    path: 'USB_05ac_0274_14c00000',
    serialNumber: 'D3H5196A5S1FTV4AD5ES',
    manufacturer: 'Apple Inc.',
    product: 'Apple Internal Keyboard / Trackpad',
    release: 1572,
    interface: -1 },
  { vendorId: 2303,
    productId: 9,
    path: 'USB_08ff_0009_14541400',
    serialNumber: '08FF20140315',
    manufacturer: 'Sycreader RFID Technology Co., Ltd',
    product: 'SYC ID&IC USB Reader',
    release: 8,
    interface: -1 },
  { vendorId: 2303,
    productId: 9,
    path: 'USB_08ff_0009_14541300',
    serialNumber: '08FF20140315',
    manufacturer: 'Sycreader RFID Technology Co., Ltd',
    product: 'SYC ID&IC USB Reader',
    release: 8,
    interface: -1 } ]


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

describe('Space', function () {

  afterEach(function () {
    Space.devices.restore();
    HID.HID.restore();
  });

  beforeEach(function () {
    Space._checkpoints = [];
    sinon.stub(HID,'HID');
    sinon.stub(Space,'devices').returns(sampleDevices);
  });

  describe('#checkpoints', function () {
    it('should return the list of checkpoints', function () {
      expect(Space.checkpoints()).to.eql([]);
    });
  });

  describe('#addCheckpoint', function () {
    it('should add a new checkpoint', function () {

      var hid1 = { on: function (event, callback) {}};
      var hid2 = { on: function (event, callback) {}};

      HID.HID.withArgs('USB_08ff_0009_14541300').returns(hid1);
      HID.HID.withArgs('USB_08ff_0009_14541400').returns(hid2);

      Space.addCheckpoint(sampleDecicesConfig.entrance);
      Space.addCheckpoint(sampleDecicesConfig.exit);
      expect(Space.checkpoints()).to.have.length(2);

    });
  });

  describe('#lastPosition', function () {

    it('should know the last position on the space', function () {
      var hid1 = { on: function (event, callback) {}};
      var hid2 = { on: function (event, callback) {}};
      var hid3 = { on: function (event, callback) {}};

      HID.HID.withArgs('USB_08ff_0009_14541300').returns(hid1);
      HID.HID.withArgs('USB_08ff_0009_14541700').returns(hid2);
      HID.HID.withArgs('USB_08ff_0009_14541400').returns(hid3);

      Space.addCheckpoint(sampleDecicesConfig.entrance);
      Space.addCheckpoint(sampleDecicesConfig.hall);
      Space.addCheckpoint(sampleDecicesConfig.exit);

      expect(Space.lastPosition()).to.eql(3);

    });
  });

  describe('#isReady', function () {

    it('should know if its ready to start', function () {
      var hid1 = { on: function (event, callback) {}};
      var hid2 = { on: function (event, callback) {}};

      HID.HID.withArgs('USB_08ff_0009_14541300').returns(hid1);
      HID.HID.withArgs('USB_08ff_0009_14541400').returns(hid2);

      Space.addCheckpoint(sampleDecicesConfig.entrance);
      Space.addCheckpoint(sampleDecicesConfig.exit);

      //expect(Space.checkpoints()).to.have.length(2);
      expect(Space.isReady()).to.be(false);
    });
    it('should add failed checkpoints with up false', function () {
      var hid1 = { on: function (event, callback) {}};
      var hid2 = { on: function (event, callback) {}};

      HID.HID.withArgs('USB_08ff_0009_14541300').returns(hid1);
      HID.HID.withArgs('USB_08ff_0009_14541400').returns(hid2);

      Space.addCheckpoint(sampleDecicesConfig.entrance);
      Space.addCheckpoint(sampleDecicesConfig.exit);

      expect(Space.checkpoints()).to.have.length(2);
    });

  });
});
