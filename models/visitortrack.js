'use strict';

var Sequelize = require('sequelize');
var moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  var VisitorTrack = sequelize.define('VisitorTrack', {
    cardId: DataTypes.STRING,
    position: DataTypes.INTEGER,
    createdAt: {
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: moment().utc().toDate()
    }
  }, {
    timestamps: false,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return VisitorTrack;
};
