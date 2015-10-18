'use strict';

var models  = require('../../models');
var moment = require('moment');
var Sequelize = require('sequelize')
              , Promise = Sequelize.Promise;

var VisitorComputation = {
  storeTotalTime: function(result) {
    return models.AreaTimeTrack.bulkCreate(
      this.getRecordsFrom(result)
      , { logging: false }
    );
  },
  getRecordsFrom: function(result) {
    var records = [
        { position: 0
        , seconds: Math.round(result.workingTime.hours * 3600 + result.workingTime.minutes * 60 + result.workingTime.seconds)
        , created_at: moment().utc().toDate()
        , happened: result.happened
        }
    ];
    if (result.isComplete) {
      result.timeReport.forEach(function(entry){
        records.push(
          { position: entry.position
          , seconds: entry.timeSpentInSeconds
          , created_at: moment().utc().toDate()
          , happened: entry.happened
          }
        )
      });
    }
    return records;
  },
  validateAndStore: function(result) {
    if (result.isValid) {
      return this.storeTotalTime(result);
    } else {
      return new Promise(function(resolve, reject){
        resolve([]);
      });
    }
  }
}

module.exports = VisitorComputation;
