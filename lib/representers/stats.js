'use strict';

var models  =     require('../../models')
                , moment = require('moment')
                , Sequelize = require('sequelize')
                , Promise = Sequelize.Promise;

var Stats = {
  compute: function() {
    var superQuery = ""
        superQuery = superQuery + "SELECT area_timetracks.position, "
        superQuery = superQuery + " CAST(AVG(seconds) AS int4) as \"averageTimeSpent\", "
        superQuery = superQuery + " CAST(count(*) AS int4) as \"records\" FROM area_timetracks "
        superQuery = superQuery + " GROUP BY area_timetracks.position "
        superQuery = superQuery + " ORDER BY area_timetracks.position;"

    return models.sequelize.query(superQuery,
      {
        type: models.sequelize.QueryTypes.SELECT
      , logging: false
      }
    );

  }
}

module.exports = Stats;
