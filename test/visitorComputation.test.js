'use strict'

var chai = require('chai')
  , expect = chai.expect
  , should = chai.should()
  , sinon = require('sinon')
  , moment = require('moment')
  , Sequelize = require('sequelize')
  , Promise = Sequelize.Promise;

sinon.assert.expose(chai.assert, { prefix: "" });

var VisitorComputation = require('./../lib/operations/VisitorComputation.js');
var models  = require('../models');

var startedHappening = moment([2023, 3, 3, 0, 0, 0, 0]).utc().toDate();

var timeCompleteReport =  [
                            { position: 1, timeSpent: { hours: 1, seconds: 4 }, timeSpentInSeconds: 500
                              , happened: startedHappening }
                            , { position: 2, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 600
                              , happened: moment(startedHappening).add(500,'seconds').utc().toDate() }
                            , { position: 3, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 400
                              , happened: moment(startedHappening).add(600,'seconds').utc().toDate() }
                            , { position: 4, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 300
                              , happened: moment(startedHappening).add(400,'seconds').utc().toDate() }
                            , { position: 5, timeSpent: { minutes: 30, seconds: 2 }, timeSpentInSeconds: 700
                              , happened: moment(startedHappening).add(300,'seconds').utc().toDate() }
                          ];

var timePartialReport = [
                        ];

var validCompleteResult = { happened: startedHappening
                      , workingTime: { "years": 0
                                     , "months": 0
                                     , "days": 0
                                     , "hours": 0
                                     , "minutes": 41
                                     , "seconds": 40
                                     , "decimalTime": 0
                                     }
                      , isValid: true
                      , isComplete: true
                      , timeReport: timeCompleteReport
                      };

var validNotComplete = { happened: startedHappening
                        , workingTime: { "years": 0
                                       , "months": 0
                                       , "days": 0
                                       , "hours": 1
                                       , "minutes": 10
                                       , "seconds": 10
                                       , "decimalTime": 0
                                       }
                      , isValid: true
                      , isComplete: false
                      , timeReport: []
                      };


var invalidResult = { happened: startedHappening
                          , isValid: false
                          , isComplete: false
                          , timeReport: timeCompleteReport
                    };

describe('storing time tracked',function(){
  describe('#validateAndstore', function(){

    var spy;

    beforeEach(function(){
      spy = sinon.spy(models.AreaTimeTrack, "bulkCreate");
      this.clock = sinon.useFakeTimers(new Date(2014,8,1,10,1,1,0).getTime());
    });
    afterEach(function () {
      models.AreaTimeTrack.bulkCreate.restore();
      this.clock.restore();
    }),
    describe('with a valid computation', function(){
      describe('with a complete set', function(){
        describe('with a reduced set having some checkpoints',function(){
          it('should record all registered positions and add the position 0 with the calculated workingTime', function(){
            VisitorComputation.validateAndStore(validCompleteResult);
            sinon.assert.calledWith(spy, [
              {position: 0, seconds: 2500, created_at: moment().utc().toDate()
                , happened: startedHappening }
            , {position: 1, seconds: 500, created_at: moment().utc().toDate()
              , happened: startedHappening }
            , {position: 2, seconds: 600, created_at: moment().utc().toDate()
              , happened: moment(startedHappening).add(500,'seconds').utc().toDate() }
            , {position: 3, seconds: 400, created_at: moment().utc().toDate()
              , happened: moment(startedHappening).add(600,'seconds').utc().toDate() }
            , {position: 4, seconds: 300, created_at: moment().utc().toDate()
            , happened: moment(startedHappening).add(400,'seconds').utc().toDate() }
            , {position: 5, seconds: 700, created_at: moment().utc().toDate()
              , happened: moment(startedHappening).add(300,'seconds').utc().toDate() }
            ] );
          });
        })
      });
      describe('with a Incomplete set', function(){
        describe('with the minimal set having only total time',function(){
          it('should record only position 0 with the calculated workingTime', function(){
            VisitorComputation.validateAndStore(validNotComplete);
            sinon.assert.calledWith(spy, [{position: 0, seconds: 4210, created_at: moment().utc().toDate(), happened: startedHappening}] );
          });
        });
      });
    });
    describe('with an invalid computation', function(){
      it('should not store it', function(){
        VisitorComputation.validateAndStore(invalidResult)
        sinon.assert.notCalled(spy);
      });
    });
  });

});



/*
position:
seconds:
createdAt:

1-6 records overall
1-2-6 records overall, and 1
1-2-3-6 records overall, and 1,2
1-2-3-4-6 records overall, and 1,2,3
1-2-3-4-6 records overall, and 1,2,3,4
1-2-3-4-5-6 records overall, and 1,2,3,4,5
*/
