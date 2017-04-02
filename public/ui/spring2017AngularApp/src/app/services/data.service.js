/**
 * Created by trai on 4/1/17.
 */

(function () {
  'use strict';

  angular.module('spring2017AngularApp')
    .factory('DataService', DataService);

  function DataService(moment) {


    return {
      highChartCumulative: highChartCumulative,
      subjectTotals: subjectTotals,
      highChartProbability: highChartProbability
    };

// TODO: Probability distribution of session length (total and per-subject)
// TODO: Probability distribution of daily total (total and per-subject)

    /*
     * Return the total duration of a sequence of sessions (hours).
     */
    function sumSessions(sessions) {

      return sessions.reduce(function (acc, curr, i) {
        return acc + ((curr.stop - curr.start) / 3600000);
      }, 0);

    }

    /*
     * Return the number of days since the first session.
     */
    function daysSinceStart(dayGroups) {
      return dayGroups.length;
    }


    /*
     * Return the total duration of today's sessions
     */
    function todaysTotal(dayGroups) {
      return sumSessions(dayGroups[dayGroups.length - 1]['sessions']);
    }

    /*
     * Return the sessions for the current day.
     */
    function todaysSessions(dayGroups) {
      return dayGroups[dayGroups.length - 1]['sessions'];
    }

// TODO: Should simply use a library stdev function on session duration input
    function stdevOfSessionLength(sessions) {

      const mu = averageSessionDuration(sessions);

      const sse = sessions.reduce(function (acc, curr, ind) {
        return acc + Math.pow(durationInHours(curr) - mu, 2);
      });

      return Math.pow(sse / (sessions.length - 1), 0.5);
    }


    /*
     * Return an array of moving averages with the given radius.
     *
     * TODO: Use stepSize to determine how many days separate consecutive data points
     */
    function movingAverage(dayGroups, radius, stepSize) {

      if (dayGroups.length < radius) {
        return [];
      }

      const dailyTotals = dayGroups.map(function (curr, i, arr) {
        return {
          "date": curr['date'],
          "total": sumSessions(curr['sessions'])
        }
      });

      // Sum of study time for the window being analyzed
      var windowTotal = sumArray(dailyTotals.slice(0, radius).map(function (curr, i, arr) {
        return curr['total'];
      }));

      var res = [[dayGroups[radius - 1]['date'].valueOf(), windowTotal / radius]];

      for (var i = radius; i < dayGroups.length; i++) {
        windowTotal -= dailyTotals[i - radius]['total'];
        windowTotal += dailyTotals[i]['total'];
        res.push([dailyTotals[i]['date'].valueOf(), windowTotal / radius]);
      }

      return res;
    }

    function convertTimestampsToMoments(sessions, tz) {
       return sessions.map(function (curr, i, arr) {
          return {
             "start": moment(curr.startTime).tz(tz),
              "stop": moment(curr.endTime).tz(tz),
              "subject": curr.subject
          }
       })
    }

// Does not handle sessions longer than 24 hours
    function splitDays(sessions) {

      // TODO: How should we generalize to allow users to change timezones?
      const tz = "America/Chicago";

      // Trivial case
      if (sessions.length === 0) {
        return [];
      }

      // Get an array of sessions that use moment objects as timestamps
      var m_sessions = convertTimestampsToMoments(sessions, tz);

      // The end of the day being handled
      var marker = m_sessions[0].start.clone().endOf('day');

      // The end of the current day
      const endOfToday = moment().tz(tz).endOf('day');

      // An array of objects to hold the sessions of successive day
      var days = [];

      while (marker <= endOfToday) {
        days.push({"date": marker.clone(), "sessions": []});
        marker.add(1, 'day');
      }

      // Day index
      var day_ind = 0;

      m_sessions.forEach(function (session, i, arr) {

        // Skip any empty days
        while (session.start > days[day_ind].date) {
          day_ind += 1;
        }

        // Add this session to the current day. Split if necessary.
        if (session.stop < days[day_ind].date) {
          days[day_ind].sessions.push(session)
        } else {

          // TODO: To fix the 24 hour bug, we would use some kind of loop here

          days[day_ind].sessions.push({
            "start": session.start.clone(),
            "stop": days[day_ind].date.clone(),
            "subject": session.subject
          });

          days[day_ind + 1].sessions.push({
            "start": days[day_ind].date.clone().add(1, 'day').startOf('day'),
            "stop": session.stop.clone(),
            "subject": session.subject
          });
        }
      });

      return days;
    }


// Compute a list of cumulative study totals
    function cumulative(sessions, numLevels) {

      // A running total of the hours studied
      var cumul = 0;

      // Total duration of completed sessions
      const total = sumRawSessions(sessions);

      const levelSize = total / numLevels;

      var level = 1;

      // List of timestamped cumulative totals
      var res = [[new Date(sessions[0].startTime), 0]];

      sessions.forEach(function (curr, i, arr) {

        // Add the session's duration to the cumulative total
        cumul += (curr.endTime - curr.startTime) / (3600 * 1000);

        if (cumul >= level * levelSize) {

          // How much the session extends past the level boundary
          const t = (cumul - level * levelSize) * 3600 * 1000;

          res.push([new Date(curr.endTime - t), level * levelSize]);
          level += 1;
        }
      });

      // Add the last item in cumuls if needed
      if (res.length < numLevels + 1) {
        res.push([new Date(sessions[sessions.length - 1].endTime), cumul]);
      }

      return res;
    }

    // Compute a list of cumulative study totals
    function highChartCumulative(sessions, numLevels) {

      // A running total of the hours studied
      var cumul = 0;

      // Total duration of completed sessions
      const total = sumRawSessions(sessions);

      const levelSize = total / numLevels;

      var level = 1;

      // List of timestamped cumulative totals
      var res = [{"x": sessions[0].startTime, "y": 0}];

      sessions.forEach(function (curr, i, arr) {

        // Add the session's duration to the cumulative total
        cumul += (curr.endTime - curr.startTime) / (3600 * 1000);

        if (cumul >= level * levelSize) {

          // How much the session extends past the level boundary
          const t = (cumul - level * levelSize) * 3600 * 1000;

          res.push({"x": curr.endTime - t, "y": level * levelSize});
          level += 1;
        }
      });

      // Add the last item in cumuls if needed
      if (res.length < numLevels + 1) {
        res.push({"x": sessions[sessions.length - 1].endTime, "y": cumul});
      }

      return res;
    }


    function subjectTotals(sessions) {

      // The total number of hours studied
      var total = 0;

      // The total number of sessions logged
      var count = 0;

      // Keys are subject names, values are the times spent studying that subject
      var subTotals = new Map();

      // Keys are subject names, values are the number of sessions studied
      var counts = new Map();

      // A list of sessions durations
      var diffs = [];

      // Compute the time spent studying each subject
      sessions.forEach(function (curr, i, arr) {

        const diff = (curr.endTime - curr.startTime) / (3600 * 1000);

        if (subTotals.has(curr.subject)) {
          counts.set(curr.subject, counts.get(curr.subject) + 1);
          subTotals.set(curr.subject, subTotals.get(curr.subject) + diff);
        } else {
          counts.set(curr.subject, 1);
          subTotals.set(curr.subject, diff);
        }

        count += 1;
        total += diff;
        diffs.push(diff);
      });


      function cmp(sub1, sub2) {
        if (sub1[1] < sub2[1]) {
          return 1;
        }

        if (sub1[1] > sub2[1]) {
          return -1;
        }

        return 0;
      }


      return Array.from(subTotals.entries()).sort(cmp).slice(0, 10);
    }

    function durationInHours(session) {
      return (session.endTime - session.startTime) / 3600000;
    }

// Compute the total duration, in seconds, of a group of sessions.
    function sumRawSessions(sessions) {

      var total = 0;

      sessions.forEach(function (curr, i, arr) {
        total += curr.endTime - curr.startTime;
      });

      return total / (3600 * 1000);
    }


// Assume sessions are sorted chronologically and non-overlapping.
// TODO: Check that we are not modifying the original sessions array
    function sessionsSince(t, sessions) {

      var result = [];

      for (var i = sessions.length - 1; i >= 0; i--) {

        if (sessions[i].endTime > t) {
          result.push(sessions[i]);
        } else {
          break;
        }

      }

      // Handle a session that spans t
      if (result[0].startTime < t) {
        result[0].startTime = t;
      }

      // Need to reverse the result array
      result.reverse();

      return result;
    }

// TODO: Use a mean function from a library
    function averageSessionDuration(sessions) {

      const total = sessions.reduce(function (acc, curr, ind) {
        return acc + durationInHours(curr)
      }, 0);

      return total / sessions.length;
    }

    /*
     * Return the yearly totals.
     */
    function yearlyTotals(dayGroups) {

      // A map in which keys are years and values are the number of hours studied in a year
      var m = new Map();

      dayGroups.forEach(function (curr, i, arr) {

        const y = curr.date.year();

        if (m.has(y)) {
          m.set(y, m.get(y) + sumSessions(curr.sessions));
        } else {
          m.set(y, sumSessions(curr.sessions));
        }
      });

      return m;
    }


    /*
     * Compute the length of the current streak (in days)
     */
    function currentStreak(dayGroups) {

      if (dayGroups.length == 0) {
        return 0;
      }

      var i = dayGroups.length - 2;
      var streak = 0;

      // Count days in the streak, not including today
      while (i >= 0 && dayGroups[i]['sessions'].length > 0) {
        i--;
        streak++;
      }

      // If the user has programmed today, add it to the streak
      if (dayGroups[dayGroups.length - 1]['sessions'].length > 0) {
        streak += 1;
      }

      return streak;
    }

    /*
     * Compute the average number of hours studied on each weekday
     */
    function dayOfWeekAverages(dayGroups) {

      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      var dayTotals = [0, 0, 0, 0, 0, 0, 0];
      var counts = [0, 0, 0, 0, 0, 0, 0];

      dayGroups.forEach(function (curr, i, arr) {
        dayTotals[curr.date.day()] += sumSessions(curr.sessions);
        counts[curr.date.day()] += 1;
      });

      return dayTotals.map(function (curr, i, arr) {
        return [days[i], dayTotals[i] /= counts[i]];
      });
    }


    /*
     * Compute a histogram of daily totals
     */
    function dailyTotalHistogram(dailyTotals, numBins) {

      // Bins are as follows: <=0, <=1, <=2, ..., >=numBins - 1
      var bins = [];

      for (var i = 0; i < numBins; i++) {
        bins.push(0);
      }

      dailyTotals.forEach(function (curr, i, arr) {
        bins[Math.min(Math.ceil(curr), numBins - 1)] += 1;
      });

      // Normalize the bins
      bins.forEach(function (curr, i, arr) {
        bins[i] = bins[i] / dailyTotals.length;
      });

      return bins;
    }


    /*
     * Return the average-day probability vector
     */
    function probability(numBins, dayGroups) {

      var bins = [];

      for (var i = 0; i < numBins; i++) {
        bins.push(0);
      }

      dayGroups.forEach(function (dayGroup, i, arr) {
        dayGroup['sessions'].forEach(function (session, j, arr) {

          const upperBound = dayGroup['date'].clone();
          const lowerBound = dayGroup['date'].clone().startOf('day');

          const startBin = Math.floor((session.start - lowerBound) * numBins / (upperBound - lowerBound));
          const stopBin = Math.floor((session.stop - lowerBound) * numBins / (upperBound - lowerBound));

          for (var b = startBin; b < stopBin; b++) {
            bins[b] += 1;
          }
        });
      });

      // Normalize
      bins.forEach(function (curr, i, arr) {
        bins[i] = curr / dayGroups.length;
      });

      return bins;
    }

    function highChartProbability(sessions) {

      var bins = [];

      numBins = 100;

      dayGroups = splitDays(sessions)

      for (var i = 0; i < numBins; i++) {
        bins.push(0);
      }

      dayGroups.forEach(function (dayGroup, i, arr) {
        dayGroup['sessions'].forEach(function (session, j, arr) {

          const upperBound = dayGroup['date'].clone();
          const lowerBound = dayGroup['date'].clone().startOf('day');

          const startBin = Math.floor((session.start - lowerBound) * numBins / (upperBound - lowerBound));
          const stopBin = Math.floor((session.stop - lowerBound) * numBins / (upperBound - lowerBound));

          for (var b = startBin; b < stopBin; b++) {
            bins[b] += 1;
          }
        });
      });

      // Normalize
      bins.forEach(function (curr, i, arr) {
        bins[i] = curr / dayGroups.length;
      });

      return bins;
    }

  }

})();
