'use strict';

var models  =     require('../../models')
                , moment = require('moment')
                , Sequelize = require('sequelize')
                , Promise = Sequelize.Promise;

// TODO: I need to find a way to get this number from Space._checkpoints.length

/* this should be moved from here */

function allPositions(devices){
  var array = [];
  for (var i = 0; i < devices; i++){
    array.push(i+1);
  }
  return array;
}

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

/* the OLD super query
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

/* the NEW super query

--
-- This query makes the righ calculation based on visitor tracks.
-- parameters for the whole query:
--            cardId
--            limit: how many rows max we will get for tracking one visitor
--            time_window: how much time we consider that is another day
--            num_of_tracking_devices: how many devices are there integer between (2...n)
--            cycle_time_interval:  how much time we consider that the card can be used again, less than that time we consider that is the same visitor.
--            minimal_time_between_devices: how minutes are enough to consider that the visitor was not just playing with the card.
--            max_time_in_the_space: how many hours is the maximum that a visitor can stay.
-- Frist we get the dataset with previous and next positions on the results for later calculations

WITH tracks AS (
	SELECT 	id,
		card_id,
		position,
		created_at,

		-- configuration
		-- here it goes the variable replacement from the script
		1 as first_device,
		6 as last_device,
		6 as num_of_tracking_devices,
		-- cycle_time_interval
		(interval '1 hour') as cycle_time_interval,
		-- time_window
		(interval '6 hours') as time_window,
		-- minimal_time_between_devices
		(interval '10 minutes') as minimal_time_between_devices,
		-- max_time_in_the_space
		(interval '5 hours') as max_time_in_the_space,

		row_number() OVER (PARTITION by card_id ORDER BY created_at DESC) as myrow,
		lag(position, 1) OVER (PARTITION by card_id) as prev,
		lag(created_at, 1) OVER (PARTITION by card_id) as prev_time,
		lead(position, 1) OVER (PARTITION by card_id) as next,



		lead(created_at, 1) OVER (PARTITION by card_id) as next_time,
		lead(position, 1) OVER (PARTITION by card_id) - lead(position, 2) OVER (PARTITION by card_id)  as next_valid,
		lag(position, 2) OVER (PARTITION by card_id) - lag(position, 1) OVER (PARTITION by card_id)  as prev_valid




	FROM visitor_tracks AS visitor_track
	-- select the card id and the time window of the open time of the museum
	WHERE card_id = 'dumbvisitorcomplete'
		-- this should be replaced by timestamp - createdAt
		AND date '2023-04-03' + (interval '5 hours') - created_at < (interval '24 hours') -- max_time_in_the_space
	ORDER BY created_at DESC
	-- here goes: limit
	LIMIT 50
)

--
-- this is the final select that will get only the valid entries from the previous query
-- it should return the num of rows equals to numOfTrackingDevices
-- parameters:
--		none
--

 SELECT *,
	lag(created_at,1) OVER (PARTITION by card_id) - created_at as time_spent,
  EXTRACT(epoch FROM lag(created_at,1) OVER (PARTITION by card_id) - created_at) as time_spent_in_seconds

FROM

--
-- this query do all the calculations required to get a valid time tracking set
-- parameters:
--		numOfTrackingDevices: how many devices are there integer between (2...n)
--

( SELECT
	id,
	card_id,
	myrow,
	created_at,
	prev_time - created_at as time_to_position,
	created_at - next_time as time_from_position,
	prev - position as difference_with_next,
	prev,
	position,
	next,
	position - next as difference_with_prev,
	prev_valid,
	next_valid,
	prev_time,
	next_time,
	CASE
		WHEN position = last_device AND prev IS NULL
			THEN '[-> Finish '
		WHEN position = last_device AND prev IS NOT NULL AND prev - position < -1
			THEN '[-> Finish '
		WHEN position = first_device AND ((position - next < 0 AND prev <> position AND created_at - next_time > cycle_time_interval) OR next IS NULL)
			THEN 'Starts ->]'
		WHEN position = first_device AND (next IS NULL OR created_at - next_time > cycle_time_interval) AND prev <> position
			THEN 'Starts ->]'
		WHEN position = first_device AND (next IS NULL OR created_at - next_time > cycle_time_interval OR next = last_device)
			THEN 'Starts ->]'
		WHEN prev - position = -1
			THEN '<-- back'
		WHEN prev - position < -1 AND (prev <> first_device OR prev_valid < 0)
			THEN '<-- skip'
		WHEN prev = position
			THEN 'repeat..'
		WHEN prev - position = 1
			THEN 'forward -->' -- '-->'
		WHEN prev - position > 1
			THEN 'Skip -->'
		ELSE 'unknown'
	END
	as movement,
	-- detect moving backward or skipping devices setting 0
	CASE
		WHEN prev > position OR next < position
			THEN prev_time - created_at
		ELSE (interval '0 seconds')
	END
	as complete,

	CASE
		WHEN position = last_device AND prev IS NULL
			THEN 'exit'
		ELSE ''
	END
	as exit,
	CASE
	-- last device
		-- invalid:
		-- in the case that is the last_device and the next record is on the last_device too and the time window is longer than cycle_time_interval then is NOT valid
		WHEN position = last_device AND next = last_device AND created_at - next_time > cycle_time_interval
			THEN 0
		-- in case of only one latest device on the dataset and the next is a position 1 but long time ago, reject
		WHEN position = last_device AND next = first_device AND created_at - next_time > cycle_time_interval
			THEN 0
		-- when position is LATEST and is not last record is NOT valid
		WHEN position = last_device AND prev IS NOT NULL
			THEN 0
		-- when is not the first record of the LATEST we try to get it by the difference with the previous position
		WHEN position = last_device AND prev IS NOT NULL AND prev - position < -1
			THEN position
		-- valid:
		-- when position is LATEST and is the last record is valid
		WHEN position = last_device AND prev IS NULL
			THEN position
	-- first device
		-- invalid:
		-- in case of only one first device on the dataset and the prev is a last position but long time after, reject
		WHEN position = first_device AND prev = last_device AND prev_time - created_at > cycle_time_interval
			THEN 0
		-- valid:
		-- when position is the first and the previous happened more than the minimum cycle time
		WHEN position = first_device AND created_at - next_time > cycle_time_interval
			THEN position

	-- other devices (can exclude first or last device)
		-- invalid:
		-- if the previous or the next are invalid this is also invalid is not the latest position and both values are present
		WHEN (position <> last_device AND position <> first_device AND next_valid IS NOT NULL AND prev_valid IS NOT NULL) AND (prev_valid < 0 OR (next_valid < 0 AND next <> first_device ))
			THEN 0
		-- when position is NOT LATEST and the previous position was the same is NOT valid
		WHEN position <> last_device AND position = next AND prev IS NOT NULL AND created_at - next_time < minimal_time_between_devices
			THEN 0
		-- when repeating in a short timeframe is NOT valid
		WHEN next = position AND (position <> first_device OR (position = first_device AND created_at - next_time < cycle_time_interval  ))
			THEN 0
		-- when the user moves back from higher position and is not first_device is NOT valid
		WHEN position <> first_device AND prev = position AND next > position
			THEN 0
		-- when moving backwards is NOT valid
		WHEN position > prev AND ( next > prev OR position <> first_device)
			THEN 0
		-- when moving backwards and is not the first_device is NOT valid
		WHEN position <> first_device AND position - next < 0
			THEN 0

	-- any device (applies to any device)
		-- invalid:
		-- when next and prev position is the same is NOT valid
		WHEN prev = next
			THEN 0
		-- when the previous and the next differs on more than 2 then is NOT valid
		WHEN position - prev > 1 AND next - position > 1
			THEN 0
		-- when skipping is NOT valid
		WHEN prev - position > 1
			THEN 0
	-- valid
	-- any other case is valid
	ELSE position
	END
	as valid_position

FROM tracks

LIMIT (
	--
	-- this query is to get how many rows contains the valid set
	-- parameters:
	--  		cycleTimeInterval:  how much time we consider that the card can be used again, less than that time we consider that is the same visitor.
	--
	SELECT myrow AS rows FROM (
		SELECT
		id,
		created_at,
		position,
		myrow,
		--
		-- detecting the entrance
		--
		CASE
			-- position should be the FIRST and the next position in the query should be a higher position
			WHEN position = first_device AND (position - next < 0 OR created_at - next_time > cycle_time_interval OR next = last_device) AND created_at - next_time > cycle_time_interval
				THEN myrow
			-- if there's only one set the postion 1 does noth have previous"
			 WHEN position = first_device AND next IS NULL
				THEN myrow
			-- anything else invalid
			ELSE 0
		END
		as entrance
		--
		FROM tracks
		) AS result
	WHERE entrance > 0
	LIMIT 1
	)
) AS final
WHERE valid_position > 0

*/

var Payment = {
  compute: function(card_id, maxDevices, timestamp) {

    timestamp = typeof timestamp !== 'undefined' ?  timestamp : moment().format('YYYY-MM-DD');

    return new Promise(function(resolve, reject) {

      // the query provides almost everything and is composed of:
      // tracks: get the latest tracks for the selected card in a reasonable time range
      // final: returns the final dataset with the time spent on each position and how the user moved into the space
      // result: return how many rows can contain a valid visitor set from final

      // TODO: maybe adding one more subquery to return only valid datasets, currently some validation happens on the backend.

      var magicQuery2 = "WITH tracks AS (" +
      "  SELECT 	id, " +
      "    card_id, " +
      "    position, " +
      "    created_at, " +
      "    1 as first_device, " +
      "    :maxDevices as last_device, " +
      "    :maxDevices as num_of_tracking_devices, " +
      "    (interval '1 hour') as cycle_time_interval, " +
      "    (interval '6 hours') as time_window, " +
      "    (interval '10 minutes') as minimal_time_between_devices, " +
      "    (interval '5 hours') as max_time_in_the_space, " +
      "    row_number() OVER (PARTITION by card_id ORDER BY created_at DESC) as myrow, " +
      "    lag(position, 1) OVER (PARTITION by card_id) as prev, " +
      "    lag(created_at, 1) OVER (PARTITION by card_id) as prev_time, " +
      "    lead(position, 1) OVER (PARTITION by card_id) as next, " +
      "    lead(created_at, 1) OVER (PARTITION by card_id) as next_time, " +
      "    lead(position, 1) OVER (PARTITION by card_id) - lead(position, 2) OVER (PARTITION by card_id)  as next_valid, " +
      "    lag(position, 2) OVER (PARTITION by card_id) - lag(position, 1) OVER (PARTITION by card_id)  as prev_valid " +
      "  FROM visitor_tracks AS visitor_track  " +
      "  WHERE card_id = :card_id " +
      "  	AND date :timestamp + (interval '5 hours') - created_at < (interval '24 hours') " +
      "  ORDER BY created_at DESC " +
      "  LIMIT 50 " +
      ") " +
      "SELECT *, " +
      "  lag(created_at,1) OVER (PARTITION by card_id) - created_at as time_spent, " +
      "  EXTRACT(epoch FROM lag(created_at,1) OVER (PARTITION by card_id) - created_at) as time_spent_in_seconds " +
      "FROM ( SELECT " +
      "  id, " +
      "  card_id, " +
      "  myrow, " +
      "  created_at, " +
      "  prev_time - created_at as time_to_position, " +
      "  created_at - next_time as time_from_position, " +
      "  prev - position as difference_with_next, " +
      "  prev, " +
      "  position, " +
      "  next, " +
      "  position - next as difference_with_prev, " +
      "  prev_valid, " +
      "  next_valid, " +
      "  prev_time, " +
      "  next_time, " +
      "  CASE " +
      "    WHEN position = last_device AND prev IS NULL " +
      "      THEN '[-> Finish ' " +
      "    WHEN position = last_device AND prev IS NOT NULL AND prev - position < -1 " +
      "      THEN '[-> Finish ' " +
      "    WHEN position = first_device AND ((position - next < 0 AND prev <> position AND created_at - next_time > cycle_time_interval) OR next IS NULL) " +
      "      THEN 'Starts ->]' " +
      "    WHEN position = first_device AND (next IS NULL OR created_at - next_time > cycle_time_interval) AND prev <> position " +
      "      THEN 'Starts ->]' " +
      "    WHEN position = first_device AND (next IS NULL OR created_at - next_time > cycle_time_interval OR next = last_device) " +
      "      THEN 'Starts ->]' " +
      "    WHEN prev - position = -1 " +
      "      THEN '<-- back' " +
      "    WHEN prev - position < -1 AND (prev <> first_device OR prev_valid < 0) " +
      "      THEN '<-- skip' " +
      "    WHEN prev = position " +
      "      THEN 'repeat..' " +
      "    WHEN prev - position = 1 " +
      "      THEN 'forward -->' " +
      "    WHEN prev - position > 1 " +
      "      THEN 'Skip -->' " +
      "    ELSE 'unknown' " +
      "  END " +
      "  as movement, " +
      "  CASE " +
      "    WHEN prev > position OR next < position " +
      "      THEN prev_time - created_at " +
      "    ELSE (interval '0 seconds') " +
      "  END " +
      "  as complete, " +
      "  CASE " +
      "    WHEN position = last_device AND prev IS NULL " +
      "      THEN 'exit' " +
      "    ELSE '' " +
      "  END " +
      "  as exit, " +
      "  CASE " +
      "    WHEN position = last_device AND next = last_device AND created_at - next_time > cycle_time_interval " +
      "      THEN 0 " +
      "    WHEN position = last_device AND next = first_device AND created_at - next_time > cycle_time_interval " +
      "      THEN 0 " +
      "    WHEN position = last_device AND prev IS NOT NULL " +
      "      THEN 0 " +
      "    WHEN position = last_device AND prev IS NOT NULL AND prev - position < -1 " +
      "      THEN position " +
      "    WHEN position = last_device AND prev IS NULL " +
      "      THEN position " +
      "    WHEN position = first_device AND prev = last_device AND prev_time - created_at > cycle_time_interval " +
      "      THEN 0 " +
      "    WHEN position = first_device AND created_at - next_time > cycle_time_interval " +
      "      THEN position " +
      "    WHEN (position <> last_device AND position <> first_device AND next_valid IS NOT NULL AND prev_valid IS NOT NULL) AND (prev_valid < 0 OR (next_valid < 0 AND next <> first_device )) " +
      "      THEN 0 " +
      "    WHEN position <> last_device AND position = next AND prev IS NOT NULL AND created_at - next_time < minimal_time_between_devices " +
      "      THEN 0 " +
      "    WHEN next = position AND (position <> first_device OR (position = first_device AND created_at - next_time < cycle_time_interval  )) " +
      "      THEN 0 " +
      "    WHEN position <> first_device AND prev = position AND next > position " +
      "      THEN 0 " +
      "    WHEN position > prev AND ( next > prev OR position <> first_device) " +
      "      THEN 0 " +
      "    WHEN position <> first_device AND position - next < 0 " +
      "      THEN 0 " +
      "    WHEN prev = next " +
      "      THEN 0 " +
      "    WHEN position - prev > 1 AND next - position > 1 " +
      "      THEN 0 " +
      "    WHEN prev - position > 1 " +
      "      THEN 0 " +
      "  ELSE position " +
      "  END " +
      "  as valid_position " +
      "FROM tracks " +
      "LIMIT ( " +
      "  SELECT myrow AS rows FROM ( " +
      "    SELECT  " +
      "    id, " +
      "    created_at, " +
      "    position, " +
      "    myrow, " +
      "    CASE  " +
      "      WHEN position = first_device AND (position - next < 0 OR created_at - next_time > cycle_time_interval OR next = last_device) AND created_at - next_time > cycle_time_interval  " +
      "        THEN myrow " +
      "      WHEN position = first_device AND next IS NULL " +
      "        THEN myrow " +
      "      ELSE 0 " +
      "    END  " +
      "    as entrance " +
      "    FROM tracks " +
      "    ) AS result " +
      "  WHERE entrance > 0 " +
      "  LIMIT 1) " +
      ") AS final " +
      "WHERE valid_position > 0 ";

      return models.sequelize.query(magicQuery2,
        {
          replacements: { timestamp: timestamp, card_id: card_id, maxDevices: maxDevices }
        , type: models.sequelize.QueryTypes.SELECT
        }
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
          isComplete: false,
          timeReport: []
        };
        if (tracks.length > 0) {

          // is valid where at least 1st and last checkpoint where checked.
          var isValid = tracks.length > 1 && (tracks.filter(function(track, index) {
            return track.position == maxDevices || track.position == 1;
          }).length == 2) && tracks
          .map( function(track){
              return track.time_spent_in_seconds
            })
          .reduce(function(prev, next){
            return prev + next;
          },0) < 3600 * 5;
          var isComplete = tracks.length == maxDevices && tracks.map(function(track, index){
            return track.position;
          }).join('') === allPositions(maxDevices).reverse().join('');

          var endDate = moment(tracks[0].created_at).utc().toDate();
          var startDate = tracks[tracks.length - 1].created_at;
          var workingTime = dateDiff(startDate, endDate);

          workingTime.decimalTime = workingTime.hours + workingTime.minutes / 60;
          var timeReport = tracks.slice(1).reverse().map(function(track, index, tracks){
            return { position: track.position, timeSpent: track.time_spent, timeSpentInSeconds: track.time_spent_in_seconds };
          });

          timeUsed = {workingTime: workingTime, timeReport: timeReport, isValid: isValid, isComplete: isComplete };

        } else {
          console.log('no data for:' + card_id);
        }
        return (timeUsed);
      }).then(function(timeUsed){
        if (timeUsed.isValid) {
          var seconds = timeUsed.workingTime.hours * 3600
                        + timeUsed.workingTime.minutes * 60
                        + timeUsed.workingTime.seconds;

          timeUsed.timeReport.map(function(track, index){
            var seconds = track.hours * 3600
                          + track.minutes * 60
                          + track.seconds;
          });
        }
        resolve(timeUsed);
      });

    });

  }
}

module.exports = Payment;
