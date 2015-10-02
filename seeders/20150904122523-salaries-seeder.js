'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

    var now = new Date();

    return queryInterface.bulkInsert('salaries', [
      { monthly_income: 830000, text: "football_t", updated_at : now, created_at: now },
      { monthly_income: 16000,  text: "doctor_t", updated_at: now, created_at: now },
      { monthly_income: 11100,  text: "manager_t", updated_at: now, created_at: now },
      { monthly_income: 10300,  text: "pilot_t", updated_at: now, created_at: now },
      { monthly_income: 6100,   text: "judge_t", updated_at: now, created_at: now },
      { monthly_income: 4030,   text: "teacher_t", updated_at: now, created_at: now },
      { monthly_income: 2830,   text: "mechanic_t", updated_at: now, created_at: now },
      { monthly_income: 2576,   text: "salesman_t", updated_at: now, created_at: now },
      { monthly_income: 2064,   text: "nurse_t", updated_at: now, created_at: now },
      { monthly_income: 1288,   text: "hairdresser_t", updated_at: now, created_at: now },
      { monthly_income: 670,    text: "student_t", updated_at: now, created_at: now }
    ], { silent: true }, ['monthly_income', 'text']);


  },

  down: function (queryInterface, Sequelize) {

  }
};
