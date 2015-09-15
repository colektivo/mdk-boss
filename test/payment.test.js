'use strict'

var chai = require('chai')
  , expect = chai.expect
  , should = chai.should()
  //, assert = chai.assert
  , sinon = require('sinon')
  , Sequelize = require('sequelize')
  , Promise = Sequelize.Promise
  , moment = require('moment')
  , chaiAsPromised = require("chai-as-promised")
  , chaiSubset = require('chai-subset');

chai.use(chaiAsPromised);
chai.use(chaiSubset);

var Payment = require('./../lib/representers/payment.js');
var models  = require('../models');
var numOfDevices = 6;

/*

  helper functions
  createTracks(cardId, array of arrays) create the tracks for the cardId based on the array provided
  addTimeBetweenDevices() add default time between devices
  addTimeBetweenVisitors() add default time between visitors

*/

function addTimeBetweenDevices(timestamp) {
  return moment(timestamp).add(30,'minutes').add(2,'seconds').utc().toDate();
}

function addTimeBetweenVisitors(timestamp) {
  return moment(timestamp).add(3,'hours').utc().toDate();
}

function createTracks(cardId, startDate , tracksData) {
  var visitorRecords = [];
  var currentTimestamp = startDate;
  // create the data set with default dates
  for (var i = 0; i < tracksData.length; i++) {
    var trackRecords = [];
    for (var j = 0; j < tracksData[i].length; j++) {
      var record = {card_id: cardId, position: tracksData[i][j], created_at: currentTimestamp};
      trackRecords.push(record);
      console.log(record);
      currentTimestamp = addTimeBetweenDevices(currentTimestamp);
    }
    visitorRecords = visitorRecords.concat(trackRecords);
    currentTimestamp = addTimeBetweenVisitors(currentTimestamp);
  }
  return visitorRecords;
}

var defaultTimestamp = moment([2023, 3, 3, 0, 0, 0, 0]).utc().toDate();

describe.only('Payment', function() {
  var promise;

  before(function () {

    // complete
    var nicevisitorcomplete = createTracks("nicevisitorcomplete", defaultTimestamp, [ [1,6], [1,2,3,4,5,6] ] );
    var dumbvisitorcomplete = createTracks("dumbvisitorcomplete", defaultTimestamp, [ [1,6], [1,2,3,3,4,5,6]  ] );
    var reversecomplete = createTracks("reversecomplete", defaultTimestamp, [ [6,5,4,3,2,1],[1,2,3,4,5,6]] );
    var noprevactivitycomplete = createTracks("noprevactivitycomplete", defaultTimestamp, [ [1], [1], [1,1,2,3,4,5,6]  ] );

    // valid
    var onesix3valid = createTracks("onesix3valid", defaultTimestamp, [ [1,2,3,6],[1,1,1,6,6,6]] );
    var double12valid = createTracks("double12valid", defaultTimestamp, [ [1,2,3,4,5,6], [1,1,2,2,3,6]] );
    var pure666valid = createTracks("pure666valid", defaultTimestamp, [ [1,2,3,4,5], [1,6,6,6]] );
    var drunkvalid = createTracks("drunkvalid", defaultTimestamp, [ [1,2,3,4,5,6], [1,2,2,3,3,4,3,2,2,6] ] );

    // invalid
    var only6 = createTracks("only6", defaultTimestamp, [ [1,2,3,4,5,6], [6]] );
    var only1only6 = createTracks("only1only6", defaultTimestamp, [ [1], [6]] );
    var only666 = createTracks("only666only6", defaultTimestamp, [ [6,6,6], [6]] );
    var check26 = createTracks("check26", defaultTimestamp, [ [1,2,3,4,5,6],[2,6]] );
    var reverse6 = createTracks("reverse6", defaultTimestamp, [ [1,2,3,4,5,6], [6,5,4,3,2,1], [6]] );
    var just61 = createTracks("just61", defaultTimestamp, [ [1,2,3,4,5,6],[6],[1]  ] );
    var just11 = createTracks("just11", defaultTimestamp, [ [1,2,3,4,5,6],[1],[1]  ] );
    var just22 = createTracks("just22", defaultTimestamp, [ [1,2,3,4,5,6],[2],[2]  ] );
    var just33 = createTracks("just33", defaultTimestamp, [ [1,2,3,4,5,6],[3],[3]  ] );

    return promise = models.VisitorTrack.truncate()
      .then(function(){
        var tracks = only6.concat(only1only6
                                  , only666
                                  , check26
                                  , reverse6
                                  , reversecomplete
                                  , pure666valid
                                  , onesix3valid
                                  , double12valid
                                  , drunkvalid
                                  , nicevisitorcomplete
                                  , dumbvisitorcomplete
                                  , noprevactivitycomplete);
        return models.VisitorTrack.bulkCreate(tracks);
      });
  }),

  afterEach(function () {
  }),

  describe('#compute', function () {

    // check26
    describe('when visitor only check the 2nd and the latest', function(){
      var payment;
      before(function(done){
        var promise = Payment.compute(
          "check26"
          , numOfDevices
          , '2023-04-03'
        );
        promise.then(function(result){
          payment = result;
          done();
        });
      });
      it('Should be valid', function(){
        payment.should.have.property('isValid', false);
      });
    });

    // just33
    describe('when last visitor only check the 3rd and previous visitor only check the 3rd', function(){
      var payment;
      before(function(done){
        var promise = Payment.compute(
          "just33"
          , numOfDevices
          , '2023-04-03'
        );
        promise.then(function(result){
          payment = result;
          done();
        });
      });
      it('Should be valid', function(){
        payment.should.have.property('isValid', false);
      });
    });



    // just22
    describe('when last visitor only check the 2nd and previous visitor only check the 2nd', function(){
      var payment;
      before(function(done){
        var promise = Payment.compute(
          "just22"
          , numOfDevices
          , '2023-04-03'
        );
        promise.then(function(result){
          payment = result;
          done();
        });
      });
      it('Should be valid', function(){
        payment.should.have.property('isValid', false);
      });
    });


    // just11
    describe('when last visitor only check the first and previous visitor only check the first', function(){
      var payment;
      before(function(done){
        var promise = Payment.compute(
          "just11"
          , numOfDevices
          , '2023-04-03'
        );
        promise.then(function(result){
          payment = result;
          done();
        });
      });
      it('Should be valid', function(){
        payment.should.have.property('isValid', false);
      });
    });

    // just61
    describe('when last visitor only check the first and previous visitor only check the latest', function(){
      var payment;
      before(function(done){
        var promise = Payment.compute(
          "just61"
          , numOfDevices
          , '2023-04-03'
        );
        promise.then(function(result){
          payment = result;
          done();
        });
      });
      it('Should be valid', function(){
        payment.should.have.property('isValid', false);
      });
    });

    // reverse6
    describe('when visitor only check the latest and previous visitor did reverse checkin', function(){
      var payment;
      before(function(done){
        var promise = Payment.compute(
          "reverse6"
          , numOfDevices
          , '2023-04-03'
        );
        promise.then(function(result){
          payment = result;
          done();
        });
      });
      it('Should be valid', function(){
        payment.should.have.property('isValid', false);
      });
    });


    // only666
    describe('when visitor only check the latest and previous visitor was playing only in the latest', function(){
      var payment;
      before(function(done){
        var promise = Payment.compute(
          "only666"
          , numOfDevices
          , '2023-04-03'
        );
        promise.then(function(result){
          payment = result;
          done();
        });
      });
      it('Should be valid', function(){
        payment.should.have.property('isValid', false);
      });
    });

    // only1only6
    describe('when visitor only check the latest and previous visitor only in the first', function(){
      var payment;
      before(function(done){
        var promise = Payment.compute(
          "only1only6"
          , numOfDevices
          , '2023-04-03'
        );
        promise.then(function(result){
          payment = result;
          done();
        });
      });
      it('Should be valid', function(){
        payment.should.have.property('isValid', false);
      });
    });

    // only6
    describe('when visitor only check the latest', function(){
      var payment;
      before(function(done){
        var promise = Payment.compute(
          "only6"
          , numOfDevices
          , '2023-04-03'
        );
        promise.then(function(result){
          payment = result;
          done();
        });
      });
      it('Should be valid', function(){
        payment.should.have.property('isValid', false);
      });
    });

    // noprevactivitycomplete
    describe('visitor repeating the first after weird previous activity', function(){
      var payment;
      var roomExpectation = {
          timeReport: [
              { position: 1, timeSpent: { hours: 1, seconds: 4 }, timeSpentInSeconds: 3604 }
            , { position: 2, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 1802 }
            , { position: 3, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 1802 }
            , { position: 4, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 1802 }
            , { position: 5, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 1802 }
          ]
        };
      before(function(done){
        var promise = Payment.compute(
          "noprevactivitycomplete"
          , numOfDevices
          , '2023-04-03'
        );
        promise.then(function(result){
          payment = result;
          done();
        });
      });
      it('Should be valid', function(){
        payment.should.have.property('isValid', true);
      });

      it('Should be complete', function(){
        payment.should.have.property('isComplete', true);
      });

      it('should compute the hours spent by the visitor', function () {
        payment.should.have.property('workingTime')
        .that.is.an('object')
        .that.deep.equals(
          { years: 0
          , months: 0
          , days: 0
          , hours: 3
          , minutes : 0
          , seconds: 12
          , decimalTime: 3
          });
      });

      it('contain the time spent on the rooms', function(){
        payment.should.containSubset(roomExpectation);
      });


    });

    // drunkvalid
    describe('when visitor checks twice on first twice on 2nd once in 3rd and then 6th', function(){
      var payment;
      before(function(done){
        var promise = Payment.compute(
          "drunkvalid"
          , numOfDevices
          , '2023-04-03'
        );
        promise.then(function(result){
          payment = result;
          done();
        });
      });
      it('Should be valid', function(){
        payment.should.have.property('isValid', true);
      });

      it('Should be complete', function(){
        payment.should.have.property('isComplete', false);
      });

      it('should compute the hours spent by the visitor', function () {
        payment.should.have.property('workingTime')
        .that.is.an('object')
        .that.deep.equals(
          { years: 0
          , months: 0
          , days: 0
          , hours: 4
          , minutes : 30
          , seconds: 18
          , decimalTime: 4.5
          });
      });
    });



    // pure666valid
    describe('when visitor checks on the first and repeat on the latest', function(){
      var payment;
      before(function(done){
        var promise = Payment.compute(
          "pure666valid"
          , numOfDevices
          , '2023-04-03'
        );
        promise.then(function(result){
          payment = result;
          done();
        });
      });
      it('Should be valid', function(){
        payment.should.have.property('isValid', true);
      });

      it('Should be complete', function(){
        payment.should.have.property('isComplete', false);
      });

      it('should compute the hours spent by the visitor', function () {
        payment.should.have.property('workingTime')
        .that.is.an('object')
        .that.deep.equals(
          { years: 0
          , months: 0
          , days: 0
          , hours: 1
          , minutes : 30
          , seconds: 6
          , decimalTime: 1.5
          });
      });
    });


    // double12valid
    describe('when visitor checks twice on first twice on 2nd once in 3rd and then 6th', function(){
      var payment;
      before(function(done){
        var promise = Payment.compute(
          "double12valid"
          , numOfDevices
          , '2023-04-03'
        );
        promise.then(function(result){
          payment = result;
          done();
        });
      });
      it('Should be valid', function(){
        payment.should.have.property('isValid', true);
      });

      it('Should be complete', function(){
        payment.should.have.property('isComplete', false);
      });

      it('should compute the hours spent by the visitor', function () {
        payment.should.have.property('workingTime')
        .that.is.an('object')
        .that.deep.equals(
          { years: 0
          , months: 0
          , days: 0
          , hours: 2
          , minutes : 30
          , seconds: 10
          , decimalTime: 2.5
          });
      });
    });


    // onesix3valid
    describe('a unsure visitor checking several times in the first and several in the last', function(){
      var payment;
      before(function(done){
        var promise = Payment.compute(
          "onesix3valid"
          , numOfDevices
          , '2023-04-03'
        );
        promise.then(function(result){
          payment = result;
          done();
        });
      });
      it('Should be valid', function(){
        payment.should.have.property('isValid', true);
      });

      it('Should not be complete', function(){
        payment.should.have.property('isComplete', false);
      });

      it('should compute the hours spent by the visitor', function () {
        payment.should.have.property('workingTime')
        .that.is.an('object')
        .that.deep.equals(
          { years: 0
          , months: 0
          , days: 0
          , hours: 2
          , minutes : 30
          , seconds: 10
          , decimalTime: 2.5
          });
      });

    });

    // reversecomplete
    describe('with the perfect visitor checking in order in all devices but a nasty previous visitor doing all reverse', function(){
      var payment;
      var roomExpectation = {
          timeReport: [
              { position: 1, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 1802 }
            , { position: 2, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 1802 }
            , { position: 3, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 1802 }
            , { position: 4, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 1802 }
            , { position: 5, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 1802 }
          ]
        };
      before(function(done){
        var promise = Payment.compute(
          "reversecomplete"
          , numOfDevices
          , '2023-04-03'
        );
        promise.then(function(result){
          payment = result;
          done();
        });
      });
      it('Should be valid', function(){
        payment.should.have.property('isValid', true);
      });

      it('Should be complete', function(){
        payment.should.have.property('isComplete', true);
      });

      it('should compute the hours spent by the visitor', function () {
        payment.should.have.property('workingTime')
        .that.is.an('object')
        .that.deep.equals(
          { years: 0
          , months: 0
          , days: 0
          , hours: 2
          , minutes : 30
          , seconds: 10
          , decimalTime: 2.5
          });
      });

      it('contain the time spent on the rooms', function(){
        payment.should.containSubset(roomExpectation);
      });


    });
    // nicevisitorcomplete
    describe('with the perfect visitor checking in order in all devices', function(){
      var payment;
      var roomExpectation = {
          timeReport: [
              { position: 1, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 1802 }
            , { position: 2, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 1802 }
            , { position: 3, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 1802 }
            , { position: 4, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 1802 }
            , { position: 5, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 1802 }
          ]
        };
      before(function(done){
        var promise = Payment.compute(
          "nicevisitorcomplete"
          , numOfDevices
          , '2023-04-03'
        );
        promise.then(function(result){
          payment = result;
          done();
        });
      });

      it('Should be valid', function(){
        payment.should.have.property('isValid', true);
      });

      it('Should be complete', function(){
        payment.should.have.property('isComplete', true);
      });

      it('should compute the hours spent by the visitor', function () {
        payment.should.have.property('workingTime')
        .that.is.an('object')
        .that.deep.equals(
          { years: 0
          , months: 0
          , days: 0
          , hours: 2
          , minutes : 30
          , seconds: 10
          , decimalTime: 2.5
          });
      });

      it('contain the time spent on the rooms', function(){
        payment.should.containSubset(roomExpectation);
      });


    });
    // dumbvisitorcomplete
    describe('with visitors checkin everywhere in order but repeating checkin at some devices', function(){
      var payment;
      var roomExpectation = {
          timeReport: [
              { position: 1, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 1802 }
            , { position: 2, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 1802 }
            , { position: 3, timeSpent: { hours: 1,    seconds: 4 }, timeSpentInSeconds: 3604 }
            , { position: 4, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 1802 }
            , { position: 5, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 1802 }
          ]
        };

      before(function(done){
        var promise = Payment.compute(
          "dumbvisitorcomplete"
          , numOfDevices
          , '2023-04-03'
        );
        promise.then(function(result){
          payment = result;
          done();
        });
      });

      it('Should be valid', function(){
        payment.should.have.property('isValid', true);
      });

      it('Should be complete', function(){
        payment.should.have.property('isComplete', true);
      });

      it('should compute the hours spent by the visitor', function () {
        payment.should.have.property('workingTime')
        .that.is.an('object')
        .that.deep.equals(
          { years: 0
          , months: 0
          , days: 0
          , hours: 3
          , minutes : 0
          , seconds: 12
          , decimalTime: 3
          });

      });

      it('contain the time spent on the rooms', function(){
        payment.should.containSubset(roomExpectation);
      });
    });

  });


});
