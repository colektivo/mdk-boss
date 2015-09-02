var models  = require('../../models');

var Checking = {
  read: function(checkpoint, id) {
    console.log(checkpoint.position + ":" + id);
    models.VisitorTrack.create({cardId: id, position: checkpoint.position});
  }
}

module.exports = Checking;
