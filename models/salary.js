'use strict';

module.exports = function(sequelize, DataTypes) {
  var Salary = sequelize.define('Salary', {
    monthlyIncome: DataTypes.INTEGER,
    text: DataTypes.STRING,
  }, {
    tableName: 'salaries',
    underscored: true,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Salary;
};