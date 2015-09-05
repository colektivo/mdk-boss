'use strict';

module.exports = function(sequelize, DataTypes) {
  var Salary = sequelize.define('Salary', {
    monthlyIncome: DataTypes.INTEGER,
    text: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Salary;
};