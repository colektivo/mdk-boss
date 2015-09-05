'use strict';

var models  = require('../../models');

var Checking = {
  read: function(checkpoint, id) {
    models.VisitorTrack.create({cardId: id, position: checkpoint.position});
  }
}

module.exports = Checking;
