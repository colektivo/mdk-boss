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

var models = require('../models');
var Stats = require('./../lib/representers/stats.js');

var timeStamp = moment().utc().toDate();

var records = [
    { position: 1, seconds: 100, happened: timeStamp , created_at: timeStamp }
  , { position: 1, seconds: 200, happened: timeStamp , created_at: timeStamp }
  , { position: 1, seconds: 100, happened: timeStamp , created_at: timeStamp }
  , { position: 1, seconds: 200, happened: timeStamp , created_at: timeStamp }
  , { position: 1, seconds: 100, happened: timeStamp , created_at: timeStamp }
  , { position: 1, seconds: 200, happened: timeStamp , created_at: timeStamp }
  , { position: 2, seconds: 1000, happened: timeStamp , created_at: timeStamp }
  , { position: 2, seconds: 2000, happened: timeStamp , created_at: timeStamp }
  , { position: 2, seconds: 1000, happened: timeStamp , created_at: timeStamp }
  , { position: 2, seconds: 2000, happened: timeStamp , created_at: timeStamp }
  , { position: 2, seconds: 1000, happened: timeStamp , created_at: timeStamp }
  , { position: 2, seconds: 2000, happened: timeStamp , created_at: timeStamp }

  , { position: 3, seconds: 500, happened: timeStamp , created_at: timeStamp }
  , { position: 3, seconds: 1000, happened: timeStamp , created_at: timeStamp }

  , { position: 4, seconds: 1000, happened: timeStamp , created_at: timeStamp }
  , { position: 4, seconds: 2000, happened: timeStamp , created_at: timeStamp }
  , { position: 4, seconds: 1000, happened: timeStamp , created_at: timeStamp }
  , { position: 4, seconds: 2000, happened: timeStamp , created_at: timeStamp }

  , { position: 5, seconds: 1000, happened: timeStamp , created_at: timeStamp }
  , { position: 5, seconds: 2000, happened: timeStamp , created_at: timeStamp }
  , { position: 5, seconds: 1000, happened: timeStamp , created_at: timeStamp }
  , { position: 5, seconds: 2000, happened: timeStamp , created_at: timeStamp }

  , { position: 0, seconds: 4000, happened: timeStamp , created_at: timeStamp }
  , { position: 0, seconds: 2000, happened: timeStamp , created_at: timeStamp }
  , { position: 0, seconds: 4000, happened: timeStamp , created_at: timeStamp }
  , { position: 0, seconds: 2000, happened: timeStamp , created_at: timeStamp }

]

describe('Stats',function(){
  var promise;

  before(function () {

    return promise = models.AreaTimeTrack.truncate()
      .then(function(){
        return models.AreaTimeTrack.bulkCreate(records, {logging: false});
      });

  });
  describe('#compute', function(){
    describe('the first position 0 counting all the space', function(){
      it('should be the position 0', function(){
        Stats.compute().should.eventually.have.deep.property("[0].position", 0);
      });
      it('should have the computed average', function(){
        Stats.compute().should.eventually.have.deep.property("[0].averageTimeSpent", 3000);
      });
      it('should have the computed average', function(){
        Stats.compute().should.eventually.have.deep.property("[0].records", 4);
      });
    });

    describe('the position 3', function(){
      it('should be the position 3', function(){
        Stats.compute().should.eventually.have.deep.property("[3].position", 3);
      });
      it('should have the computed average', function(){
        Stats.compute().should.eventually.have.deep.property("[3].averageTimeSpent", 750);
      });
      it('should have the computed average', function(){
        Stats.compute().should.eventually.have.deep.property("[3].records", 2);
      });
    });

  });
});
