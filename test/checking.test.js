'use strict'

var assert = require("assert");
var expect = require('expect.js');
var sinon = require('sinon');

var moment = require('moment');
var Checking = require('./../lib/operations/checking.js');
var models  = require('../models');

describe('Checking', function() {
  beforeEach(function () {
    this.clock = sinon.useFakeTimers(new Date(2014,8,1,10,1,1,0).getTime());
  }),

  afterEach(function () {
    this.clock.restore();
  }),
  describe('#new', function () {

    it('should persist the visitorTrack', function () {
      var checkpoint = {
        position: 4
      }
      //var spy = sinon.spy(models.VisitorTrack, "create");
      //Checking.read(checkpoint, 'persist323');
      //assert(spy.withArgs({cardId:'persist323', position: 4}).calledOnce);
    });


  });
});

/*
User.create({
  username: 'john-doe',
  password: generatePasswordHash('i-am-so-great')
}).then(function(user) {
})
*/
