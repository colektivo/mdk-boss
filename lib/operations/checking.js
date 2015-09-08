'use strict';

var models  = require('../../models');
var moment = require('moment');

var Checking = {
  read: function(checkpoint, id) {
    return models.VisitorTrack.create({
      cardId: id,
      position: checkpoint.position,
      createdAt: moment().utc().toDate()
    });
  }
}

module.exports = Checking;
