'use strict';

var Sequelize = require('sequelize');
var moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  var VisitorTrack = sequelize.define('VisitorTrack', {
    card_id: DataTypes.STRING,
    position: DataTypes.INTEGER,
    created_at: {
      type: Sequelize.DATE,
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: moment().utc().toDate()
    }
  }, {
    tableName: 'visitor_tracks',
    timestamps: false,
    underscored: true,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return VisitorTrack;
};
