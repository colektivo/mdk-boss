'use strict'

var chai = require('chai')
  , expect = chai.expect
  , should = chai.should()
  , assert = chai.assert;
var sinon = require('sinon');
var Sequelize = require('sequelize');
var Promise = Sequelize.Promise

var moment = require('moment');
var Payment = require('./../lib/representers/payment.js');
var models  = require('../models');

var visitors = [
  [
    {time: '1:00:00', position: 1},
    {time: '1:10:01', position: 2},
    {time: '1:50:33', position: 3},
    {time: '2:05:48', position: 4},
    {time: '2:17:56', position: 5},
    {time: '2:22:22', position: 6}
  ],
  [
    {time: '3:05:00', position: 1},
    {time: '3:11:22', position: 2},
    {time: '3:51:11', position: 3},
    {time: '4:00:12', position: 6}
  ],
  [
    {time: '4:31:02', position: 1},
    {time: '6:00:12', position: 6}
  ],
  [
    {time: '5:10:23', position: 1}
  ],
  [
    {time: '6:10:23', position: 6}
  ],
  [
    {time: '7:00:00', position: 1},
    {time: '7:10:01', position: 2},
    {time: '7:50:33', position: 3},
    {time: '8:05:48', position: 4},
    {time: '8:17:56', position: 5},
    {time: '8:44:44', position: 6}
  ],
  [
    {time: '7:05:00', position: 1},
    {time: '7:11:22', position: 2},
    {time: '7:51:11', position: 3},
    {time: '8:00:12', position: 6}
  ],
  [
    {time: '7:31:02', position: 1},
    {time: '10:00:12', position: 6}
  ]

]

var cards = [
  'payment14507',
  'payment14508',
  'payment14509',
  'payment14510',
  'payment14511'
]

var deletePromise = models.VisitorTrack.truncate();

describe('Payment', function() {
  var promise;

  before(function () {
    return promise = models.VisitorTrack.truncate()
      .then(function(){
        var currentCardId = 0;
        var cardId;

        var tracks = visitors.map(function(tracks, index, visitors){
          cardId = cards[currentCardId ++ % cards.length];
          var maybe = tracks.map(function(track, index, tracks) {
            var ok,
                time,
                hour,
                min,
                sec,
                clock,
                visitorTrack
            time = track.time.split(':');
            hour = time[0];
            min = time[1];
            sec = time[2];
            ok = moment([2023, 3, 3, hour, min, sec, 0]).utc().toDate();
            return {cardId: cardId, position: track.position, createdAt: ok};
          });
          return maybe;
        }).reduce(function(a, b) {
          return a.concat(b);
        });

        return models.VisitorTrack.bulkCreate(tracks);

      });

  }),

  afterEach(function () {
  }),
  describe('#compute', function () {
    var numOfDevices = 6;

    it('should compute the hours spent by the visitor', function () {
      var cardId = "payment14507";
      var computedPayment = Payment.compute(
        cardId,
        numOfDevices,
        function(computedPayment){
          return expect(1).to.eql(computedPayment.workingTime.hours );
        }
      );
      var cardId = "payment14508";
      var computedPayment = Payment.compute(
        cardId,
        numOfDevices,
        function(computedPayment){
          return expect(0).to.eql(computedPayment.workingTime.hours );
        }
      );
      var cardId = "payment14509";
      var computedPayment = Payment.compute(
        cardId,
        numOfDevices,
        function(computedPayment){
          return expect(2).to.eql(computedPayment.workingTime.hours );
        }
      );

    });

    it('should compute the minutes spent by the visitor', function () {
      var cardId = "payment14507";
      var computedPayment = Payment.compute(
        cardId,
        numOfDevices,
        function(computedPayment){
          expect(44).to.eql(computedPayment.workingTime.minutes );
        }
      );
      var cardId = "payment14508";
      var computedPayment = Payment.compute(
        cardId,
        numOfDevices,
        function(computedPayment){
          expect(55).to.eql(computedPayment.workingTime.minutes );
        }
      );
      var cardId = "payment14509";
      var computedPayment = Payment.compute(
        cardId,
        numOfDevices,
        function(computedPayment){
          expect(29).to.eql(computedPayment.workingTime.minutes );
        }
      );

    });

    it('should compute the seconds spent by the visitor', function () {
      var cardId = "payment14508";
      var computedPayment = Payment.compute(
        cardId,
        numOfDevices,
        function(computedPayment){
          expect(12).to.eql(computedPayment.workingTime.seconds );
        }
      );
      var cardId = "payment14509";
      var computedPayment = Payment.compute(
        cardId,
        numOfDevices,
        function(computedPayment){
          expect(10).to.eql(computedPayment.workingTime.seconds );
        }
      );
    });

    it('should compute the decimalTime spent by the visitor', function () {

      var cardId = "payment14507";
      var computedPayment = Payment.compute(
        cardId,
        numOfDevices,
        function(computedPayment){
          expect(1 + 44 / 60).to.eql(computedPayment.workingTime.decimalTime );
        }
      );

      var cardId = "payment14508";
      var computedPayment = Payment.compute(
        cardId,
        numOfDevices,
        function(computedPayment){
          expect(55 / 60).to.eql(computedPayment.workingTime.decimalTime );
        }
      );

    });

    describe('computing the time spent in each room by visitor', function () {

      describe('depending on how many checkpoints the visitor checked', function () {

        describe('with a visitor that checked everywhere', function () {

          it('should return all the check-ins from the user', function () {

            var cardId = "payment14507";
            var computedPayment = Payment.compute(
              cardId,
              numOfDevices,
              function(computedPayment){
                var computedResult = computedPayment;
                computedResult.timeReport[0].position.should.equal(1);
                computedResult.timeReport[1].position.should.equal(2);
                computedResult.timeReport[2].position.should.equal(3);
                computedResult.timeReport[3].position.should.equal(4);
                computedResult.timeReport[4].position.should.equal(5);
                computedResult.timeReport[5].position.should.equal(6);
              }
            );

          });
          it('should return the time spent in each checkpoint', function () {
            var cardId = "payment14507";
            var computedPayment = Payment.compute(
              cardId,
              numOfDevices,
              function(computedPayment){
                var computedResult = computedPayment;

                computedResult.timeReport[0].timeElapsed.hours.should.equal(0);
                computedResult.timeReport[0].timeElapsed.minutes.should.equal(10);
                computedResult.timeReport[0].timeElapsed.seconds.should.equal(1);

                computedResult.timeReport[1].timeElapsed.hours.should.equal(0);
                computedResult.timeReport[1].timeElapsed.minutes.should.equal(40);
                computedResult.timeReport[1].timeElapsed.seconds.should.equal(32);

                computedResult.timeReport[2].timeElapsed.hours.should.equal(0);
                computedResult.timeReport[2].timeElapsed.minutes.should.equal(15);
                computedResult.timeReport[2].timeElapsed.seconds.should.equal(15);

                computedResult.timeReport[3].timeElapsed.hours.should.equal(0);
                computedResult.timeReport[3].timeElapsed.minutes.should.equal(12);
                computedResult.timeReport[3].timeElapsed.seconds.should.equal(8);

                computedResult.timeReport[4].timeElapsed.hours.should.equal(0);
                computedResult.timeReport[4].timeElapsed.minutes.should.equal(26);
                computedResult.timeReport[4].timeElapsed.seconds.should.equal(48);

                computedResult.timeReport[5].timeElapsed.hours.should.equal(0);
                computedResult.timeReport[5].timeElapsed.minutes.should.equal(0);
                computedResult.timeReport[5].timeElapsed.seconds.should.equal(0);

              }
            );

          });
        });

        describe('with a visitor that checked in some of the checkpoints', function () {

          it('should be valid', function () {
            var cardId = "payment14508";
            var computedPayment = Payment.compute(
              cardId,
              numOfDevices,
              function(computedPayment){
                var computedResult = computedPayment;
                computedResult.isValid.should.be.true;
              }
            );
          });

          it('should return a partial list of the check-ins', function () {
            var cardId = "payment14508";
            var computedPayment = Payment.compute(
              cardId,
              numOfDevices,
              function(computedPayment){
                var computedResult = computedPayment;
                computedResult.timeReport[0].position.should.equal(1);
                computedResult.timeReport[1].position.should.equal(2);
                computedResult.timeReport[2].position.should.equal(3);
                computedResult.timeReport[3].position.should.equal(6);
              }
            );

          });

        });

        describe('with a visitor that checked only at the begining and at the end', function () {
          it('should be valid', function () {
            var cardId = "payment14509";
            var computedPayment = Payment.compute(
              cardId,
              numOfDevices,
              function(computedPayment){
                var computedResult = computedPayment;
                computedResult.isValid.should.be.true;
              }
            );
          });

          it('should return the total of the first checkpoint as the grand total', function () {

            var cardId = "payment14509";
            var computedPayment = Payment.compute(
              cardId,
              numOfDevices,
              function(computedPayment){
                var computedResult = computedPayment;

                computedResult.timeReport[0].timeElapsed.hours.should.equal(2);
                computedResult.timeReport[0].timeElapsed.minutes.should.equal(29);
                computedResult.timeReport[0].timeElapsed.seconds.should.equal(10);

                computedResult.timeReport[1].timeElapsed.hours.should.equal(0);
                computedResult.timeReport[1].timeElapsed.minutes.should.equal(0);
                computedResult.timeReport[1].timeElapsed.seconds.should.equal(0);

              }
            );

          });
        });

        describe('with a visitor that checked only at the begining', function () {
          it('should not be valid', function () {
            var cardId = "payment14510";
            var computedPayment = Payment.compute(
              cardId,
              numOfDevices,
              function(computedPayment){
                var computedResult = computedPayment;
                computedResult.isValid.should.be.false;
              }
            );
          });
          it('should return the total of the first checkpoint as the grand total', function () {

            var cardId = "payment14510";
            var computedPayment = Payment.compute(
              cardId,
              numOfDevices,
              function(computedPayment){
                var computedResult = computedPayment;

                computedResult.timeReport[0].timeElapsed.hours.should.equal(0);
                computedResult.timeReport[0].timeElapsed.minutes.should.equal(0);
                computedResult.timeReport[0].timeElapsed.seconds.should.equal(0);

              }
            );

          });
        });

      });
    });
  });


});
