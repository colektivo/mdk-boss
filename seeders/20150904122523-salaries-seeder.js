'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    var now = new Date();

    return queryInterface.bulkInsert('Salaries', [
      { monthlyIncome: 830000, text: "Philip Lahm", createdAt: now, updatedAt: now },
      { monthlyIncome: 16000,  text: "Chief physician", createdAt: now, updatedAt: now },
      { monthlyIncome: 11100,  text: "Manager", createdAt: now, updatedAt: now },
      { monthlyIncome: 10300,  text: "Pilot", createdAt: now, updatedAt: now },
      { monthlyIncome: 6100,   text: "Judge", createdAt: now, updatedAt: now },
      { monthlyIncome: 4030,   text: "School teacher", createdAt: now, updatedAt: now },
      { monthlyIncome: 2830,   text: "Car mechanic", createdAt: now, updatedAt: now },
      { monthlyIncome: 2576,   text: "Insurance salesman", createdAt: now, updatedAt: now },
      { monthlyIncome: 2064,   text: "Nurse", createdAt: now, updatedAt: now },
      { monthlyIncome: 1288,   text: "Hairdresser", createdAt: now, updatedAt: now },
      { monthlyIncome: 670,    text: "Student", createdAt: now, updatedAt: now }
    ], { silent: true }, ['monthlyIncome', 'text']);


  },

  down: function (queryInterface, Sequelize) {

  }
};
