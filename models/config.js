'use strict';
module.exports = function(sequelize, DataTypes) {
  var Config = sequelize.define('Config', {
    data: DataTypes.JSON
  }, {
    underscored: true,
    tableName: 'configs',
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Config;
};
