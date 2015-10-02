'use strict';
var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  var AreaTimeTrack = sequelize.define('AreaTimeTrack', {
    position: DataTypes.INTEGER,
    seconds: DataTypes.INTEGER,
    happened: {
      type: Sequelize.DATE,
    },
    created_at: {
      type: Sequelize.DATE,
    }
  }, {
    tableName: 'area_timetracks',
    underscored: true,
    timestamps: false,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return AreaTimeTrack;
};
