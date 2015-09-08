'use strict';

var models  = require('../../models');
var moment = require('moment');
// TODO: I need to find a way to get this number from Space._checkpoints.length

/* this should be moved from here */

function dateDiff(fromDate, toDate) {
        if (!fromDate) throw new Error('Date should be specified');
        var startDate = moment.unix(0).toDate().getTime(),
            now = new Date(),
            toDate = toDate && toDate instanceof Date ? toDate : now,
            diff = toDate - fromDate,
            date = new Date(startDate + diff),
            years = date.getFullYear() - 1970,
            months = date.getMonth(),
            days = date.getDate() - 1,
            hours = date.getHours() - 1,
            minutes = date.getMinutes(),
            seconds = date.getSeconds(),

            diffDate = {
                years: 0,
                months: 0,
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            };

        if (years < 0) return diffDate;
        diffDate.years = years > 0 ? years : 0;
        diffDate.months = months > 0 ? months : 0;
        diffDate.days = days > 0 ? days : 0;
        diffDate.hours = hours > 0 ? hours : 0;
        diffDate.minutes = minutes > 0 ? minutes : 0;
        diffDate.seconds = seconds > 0 ? seconds : 0;
        return diffDate;
}

var Payment = {
  compute: function(cardId, maxDevices, callback) {

    /* the super query
      SELECT
    	DISTINCT ON ("position") "position",
    	             "id",
    	             "cardId",
    	             "createdAt",
    	             "updatedAt"
    	FROM
    	       (SELECT
                    "id",
                    "cardId",
                    "position",
                    "createdAt",
                    "updatedAt"
              FROM "VisitorTracks" AS "VisitorTrack"
              WHERE "VisitorTrack"."cardId" = 'payment14507'
              ORDER BY "VisitorTrack"."createdAt" DESC
              LIMIT 6) AS "track"
    ORDER BY "track"."position" DESC;
    */

    var magicQuery = "SELECT DISTINCT ON (\"position\") \"position\", " +
                     "\"id\", \"cardId\", \"createdAt\", \"updatedAt\" " +
                     "FROM (SELECT " +
                     "\"id\", \"cardId\", \"position\", \"createdAt\", \"updatedAt\" " +
                     "FROM \"VisitorTracks\" AS \"VisitorTrack\" " +
                     "WHERE \"VisitorTrack\".\"cardId\" = :cardId " +
                     "ORDER BY \"VisitorTrack\".\"createdAt\" DESC " +
                     "LIMIT :maxDevices" +
                     ") as \"track\" " +
                     "ORDER BY \"track\".\"position\" DESC";

    return models.sequelize.query(magicQuery,
      { replacements: { cardId: cardId, maxDevices: maxDevices}, type: models.sequelize.QueryTypes.SELECT, model: models.VisitorTrack }
    ).then(function(tracks) {
      var timeUsed = {
        workingTime: {
          years: 0,
          months: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          decimalTime: 0
        },
        isValid: false,
        timeReport: []
      };
      if (tracks.length > 0) {
        // is valid where at least 1st and last checkpoint where checked.
        var isValid = tracks.length > 1 && (tracks.filter(function(track, index) {
          return track.position == maxDevices || track.position == 1;
        }).length == 2);
        var endDate = moment(tracks[0].dataValues.createdAt).utc().toDate();
        var startDate = tracks[tracks.length - 1].dataValues.createdAt;
        var workingTime = dateDiff(startDate, endDate);
        workingTime.decimalTime = workingTime.hours + workingTime.minutes / 60;

        var timeReport = tracks.reverse().map(function(track, index, tracks){
          var trackEstimation = { position: track.dataValues.position }
          // in last checkpoint the time elapsed cannot be measured, is zero.
          var nextTrackTimestamp = index == (tracks.length - 1) ? track.dataValues.createdAt : tracks[index + 1].dataValues.createdAt;

          trackEstimation.timeElapsed = dateDiff(track.dataValues.createdAt, nextTrackTimestamp);
          return trackEstimation;
        });

        timeUsed = {workingTime: workingTime, timeReport: timeReport, isValid: isValid };
      } else {
        console.log('no data for:' + cardId);
      }
      callback(timeUsed);
    });

  }
}

module.exports = Payment;
