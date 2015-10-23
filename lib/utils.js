var _ = require('lodash');
var moment = require('moment');

/**
 *
 * Split the time in intervals.
 * 
 * Options look something like this:
 * options = [
 *   ['minutes', 120000],
 *   ['seconds', 5000]
 * ];
 */
module.exports = {
  splitTime(time, options) {
    var start = moment(time).startOf('hours');

    var result = {
      hours: +start
    };

    time = moment.duration(time - start);

    // Subtract each interval from the duration.
    _.transform(options, (result, i) => {

      // Current index is the biggest interval that fits inside the time rounded down.
      var index = ~~(+time / i[1]);

      result[i[0]] = {
        i: index,
        v: index * i[1]
      };

      // Remove the current value from the duration for the next iteration.
      time.subtract(result[i[0]].v);
    }, result);

    // Set the leftover time on the object.
    result.milliseconds = +time;

    return result;
  }
};