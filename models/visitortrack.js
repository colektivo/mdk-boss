'use strict';
module.exports = function(sequelize, DataTypes) {
  var VisitorTrack = sequelize.define('VisitorTrack', {
    cardId: DataTypes.STRING,
    position: DataTypes.INTEGER,
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return VisitorTrack;
};