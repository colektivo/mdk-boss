'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    var now = new Date();

    return queryInterface.bulkInsert('salaries', [
      { monthly_income: 830000, text: "Philip Lahm", updated_at : now, created_at: now },
      { monthly_income: 16000,  text: "Chief physician", updated_at: now, created_at: now },
      { monthly_income: 11100,  text: "Manager", updated_at: now, created_at: now },
      { monthly_income: 10300,  text: "Pilot", updated_at: now, created_at: now },
      { monthly_income: 6100,   text: "Judge", updated_at: now, created_at: now },
      { monthly_income: 4030,   text: "School teacher", updated_at: now, created_at: now },
      { monthly_income: 2830,   text: "Car mechanic", updated_at: now, created_at: now },
      { monthly_income: 2576,   text: "Insurance salesman", updated_at: now, created_at: now },
      { monthly_income: 2064,   text: "Nurse", updated_at: now, created_at: now },
      { monthly_income: 1288,   text: "Hairdresser", updated_at: now, created_at: now },
      { monthly_income: 670,    text: "Student", updated_at: now, created_at: now }
    ], { silent: true }, ['monthly_income', 'text']);


  },

  down: function (queryInterface, Sequelize) {

  }
};
