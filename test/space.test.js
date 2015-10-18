'use strict'

var chai = require('chai')
  , expect = chai.expect
  , should = chai.should()
  , sinon = require('sinon')
  , moment = require('moment')
  , Sequelize = require('sequelize')
  , Promise = Sequelize.Promise;

var EventEmitter = require('events').EventEmitter;
var Device = require('./../lib/device.js');
var Space = require('./../lib/space.js');
var Checkpoint = require('./../lib/checkpoint.js');
var HID = require('node-hid');
var models = require('../models');


// Fixture data, should be located in other file.

var sampleDevices = [ { vendorId: 1452,
    productId: 628,
    path: 'TEST_05ac_0274_14c00000',
    serialNumber: 'D3H5196A5S1FTV4AD5ES',
    manufacturer: 'Apple Inc.',
    product: 'Apple Internal Keyboard / Trackpad',
    release: 1572,
    interface: -1 },
  { vendorId: 1452,
    productId: 628,
    path: 'TEST_05ac_0274_14c00000',
    serialNumber: 'D3H5196A5S1FTV4AD5ES',
    manufacturer: 'Apple Inc.',
    product: 'Apple Internal Keyboard / Trackpad',
    release: 1572,
    interface: -1 },
  { vendorId: 2303,
    productId: 9,
    path: 'TEST_08ff_0009_14541200',
    serialNumber: '08FF20140315',
    manufacturer: 'Sycreader RFID Technology Co., Ltd',
    product: 'SYC ID&IC USB Reader',
    release: 8,
    interface: -1 },
  { vendorId: 1452,
    productId: 628,
    path: 'TEST_05ac_0274_14c00000',
    serialNumber: 'D3H5196A5S1FTV4AD5ES',
    manufacturer: 'Apple Inc.',
    product: 'Apple Internal Keyboard / Trackpad',
    release: 1572,
    interface: -1 },
  { vendorId: 1452,
    productId: 628,
    path: 'TEST_05ac_0274_14c00000',
    serialNumber: 'D3H5196A5S1FTV4AD5ES',
    manufacturer: 'Apple Inc.',
    product: 'Apple Internal Keyboard / Trackpad',
    release: 1572,
    interface: -1 },
  { vendorId: 2303,
    productId: 9,
    path: 'TEST_08ff_0009_14541400',
    serialNumber: '08FF20140315',
    manufacturer: 'Sycreader RFID Technology Co., Ltd',
    product: 'SYC ID&IC USB Reader',
    release: 8,
    interface: -1 },
  { vendorId: 2303,
    productId: 9,
    path: 'TEST_08ff_0009_14541300',
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

var promise;

var device1 = 'TEST_08ff_0009_14541200';
var device2 = 'TEST_08ff_0009_14541400';
var device3 = 'TEST_08ff_0009_14541300';

var defaultConfig = [ { device: device1, position: 0 }
                    , { device: device2, position: 0 }
                    , { device: device3, position: 0 }
                    ]

// end fixture data

describe('Space', function () {

  describe('configuration', function(){

    beforeEach(function () {
      Space.checkpoints = [];
      Space.setDevices([ device1
                       , device2
                       , device3
                      ]);
    });

    afterEach(function () {
      Space.setDevices([]);
    });

    describe('#defaultConfig', function(){

      it('returns the default JSON config', function(){
        Space.defaultConfig().should.have.deep.property("devices")
          .that.is.an("array")
          .that.deep.equals(defaultConfig);
      });
    });

    describe('#saveConfig', function(){

      var config;

      beforeEach(function(done){
        Space.saveConfig({ devices: defaultConfig }).then(function(data){
          config = data;
          done();
        });
      });

      it("should save the new configuration",function(done){
        config.should.have.property("devices")
          .that.deep.equals(defaultConfig);
        done();
      });

    });

    describe('#isValidDevice', function(){

      describe('with a list of devices', function(){
        beforeEach(function(){
          Space.setDevices([ device1
                           , device2
                           , device3
                          ]);

        });
        afterEach(function(){
          Space.setDevices([]);
        });

        describe('with a existing device', function(){
          it('should return true', function(){
            Space.isValidDevice({device: device1, position: 0}).should.be.true;
          });
        });
        describe('with a non existing device', function(){
          it('should return false', function(){
            Space.isValidDevice({device: "Z", position: 1}).should.be.false;
          });
        });

      });

    });

    describe('#isValidPosition', function(){

      beforeEach(function(){
        Space.setDevices([ device1
                         , device2
                         , device3
                        ]);
      });

      afterEach(function(){
                  Space.setDevices([]);
      });

      describe('with a position value a less than 1 number', function(){
        it('should return false', function(){
          Space.isValidPosition({device: "X", position: 0}).should.be.false;
        });
      });

      describe('with a position value bigger than the num of devices', function(){
        it('should return false', function(){
          Space.isValidPosition({device: "X", position: 11}).should.be.false;
        });
      });

      describe('with a position value in the range 1 - num of devices', function(){
        it('should return true', function(){
          Space.isValidPosition({device: "X", position: 3}).should.be.true;
        });
      });

    });

    describe('#isValidConfig', function(){

      describe('when there is a valid config', function(){
        var validConfig = new Promise(function(resolve, reject){
          resolve({
            devices: [
                { device: "A", position: 3}
              , { device: "B", position: 2}
              , { device: "C", position: 1}
            ]
          });
        });
        beforeEach(function(){
          Space.setDevices([ "A", "B", "C" ]);
          sinon.stub(Space,'config').returns(validConfig);
        });
        afterEach(function(){
          Space.config.restore();
        });
        it('should return true', function(){
          Space.isValidConfig().should.eventually.be.true
        });
      });

      describe('when there is an invalid config', function(){

        var validConfig = new Promise(function(resolve, reject){
          resolve({
            devices: [
                { device: "Z", position: 3}
              , { device: "B", position: 2}
              , { device: "C", position: 1}
            ]
          });
        });
        beforeEach(function(){
          Space.setDevices([
              {device: 'A', position: 3}
            , {device: 'B', position: 1}
            , {device: 'C', position: 2}
          ]);
          sinon.stub(Space,'config').returns(validConfig);
        });
        afterEach(function(){
          Space.config.restore();
        });

        it('should return false', function(){
          Space.isValidConfig().should.eventually.be.false
        });
      });
    });

    describe('#config', function(){

      var config;

      describe('where there is no previous config', function(){
        beforeEach(function(done){
          models.Config.truncate({logging: false}).then(function(){
            Space.config().then(function(data){
              config = data;
              done();
            });
          });
        });

        it('should return the default config', function(done) {
          config.should.have.deep.property("devices")
            .that.is.an("array")
            .that.deep.equals(defaultConfig);
          done();

        });
      })
      describe('where there is a previous config', function(){

        var lastConfigArray = [
                        { device: device1, position: 2 }
                      , { device: device2, position: 3 }
                      , { device: device3, position: 1 }
                      ];
        beforeEach(function(done){

          models.Config.truncate({logging: false})
          .then(function(){
            models.Config.bulkCreate(
              [ {data: { devices: defaultConfig }, created_at: moment().subtract(10, 'days').toDate() }
              , {data: { devices: lastConfigArray }, created_at: moment().subtract(1,'days').toDate() } ]
              , {logging: false} )
            .then(function(){
              Space.config()
              .then(function(data){
                config = data;
                done();
              });
            });
          });

        });

        it('should return the last config saved', function(){

          config.should.have.deep.property("devices")
            .that.is.an("array")
            .that.deep.equals(
              [ { device: device1, position: 2 }
              , { device: device2, position: 3 }
              , { device: device3, position: 1 }
            ]);
        });
      });
    });
  });

  describe('setup',function(){
    beforeEach(function () {
      Space.checkpoints = [];
      Space.setDevices([ device1
                       , device2
                       , device3
                      ]);
    });

    afterEach(function () {
      Space.setDevices([]);
    });
    describe('#checkpoints', function () {
      it('should return the list of checkpoints', function () {
        expect(Space.checkpoints).to.eql([]);
      });
    });

    describe('#addCheckpoint', function () {
      it('should add a new checkpoint', function () {

        Space.addCheckpoint(sampleDecicesConfig.entrance, function(data){} );
        Space.addCheckpoint(sampleDecicesConfig.exit, function(data){} );
        expect(Space.checkpoints).to.have.length(2);

      });
    });

    describe('#lastDevice', function () {

      it('should know the last device on the space', function () {

        var config = { devices: [
                                { device: device1, position: 3 }
                              , { device: device2, position: 1 }
                              , { device: device3, position: 2 }
        ]}

        expect(Space.lastDevice(config)).to.eql(device1);

      });
    });

  });




});
