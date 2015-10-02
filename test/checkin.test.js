'use strict'

var chai = require('chai')
  , expect = chai.expect
  , should = chai.should()
  , sinon = require('sinon')
  , moment = require('moment')
  , Sequelize = require('sequelize')
  , Promise = Sequelize.Promise;

sinon.assert.expose(chai.assert, { prefix: "" });

var Checkin = require('./../lib/operations/checkin.js');
var models  = require('../models');

describe('Checkin', function() {
  var spy;
  beforeEach(function () {
    this.clock = sinon.useFakeTimers(new Date(2014,8,1,10,1,1,0).getTime());
    spy = sinon.spy(models.VisitorTrack, "create");
  }),

  afterEach(function () {
    models.VisitorTrack.create.restore();
    this.clock.restore();
  }),
  describe('#new', function () {

    it('should persist the visitorTrack', function () {
      var checkpoint = {
        position: 4
      }
      Checkin.read(checkpoint, 'persist323');
      sinon.assert.calledWith(spy, {card_id:'persist323', position: 4, created_at: moment().utc().toDate()} );
    });


  });
});
