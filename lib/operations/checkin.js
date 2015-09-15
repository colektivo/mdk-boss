'use strict';

var models  = require('../../models');
var moment = require('moment');

var Checkin = {
  read: function(checkpoint, id) {
    return models.VisitorTrack.create({
      card_id: id,
      position: checkpoint.position,
      created_at: moment().utc().toDate()
    });
  }
}

module.exports = Checkin;
