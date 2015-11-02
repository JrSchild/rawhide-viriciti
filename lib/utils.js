var _ = require('lodash');
var moment = require('moment');

module.exports = {
  splitTime,
  getDocumentModel
};

/**
 *
 * Split the time in intervals.
 * 
 * Options look something like this:
 * options = [
 *   ['minutes', 120000],
 *   ['seconds', 5000]
 * ];
 *
 * TODO:
 * Optional first parameter as a string, which defines where it should start counting. Has to be a valid for momentjs (mohth, day, hour, etc...)
 * Optional last parameter as a string defines final name. Does not need to be a valid momentjs format.
 * Example to start on the beginning of the day, then group by two hours, 5 minutes, 1 minute and end with seconds.
 * The _id could become the day + hours to create a new document for each two hour interval.
 * options = [
 *   'day',
 *   ['hours', 7200000],
 *   ['minutes', 300000],
 *   ['minutes-sub', 60000],
 *   'seconds'
 * ];
 */
function splitTime(time, options) {
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
};

/**
 * Create the document model based on options.
 */
function getDocumentModel(options, lastChild) {
  var lastValue = 3600000;
  lastChild = lastChild || {};

  var parameters = options.map((option) => {
    var value = lastValue / option[1];

    if (value % 1 !== 0) {
      throw new Error('Options do not add up.');
    }

    lastValue = option[1];
    return value;
  });

  parameters.push(lastChild);

  return makeValues.apply(null, parameters);
}

/**
 * Creates a nested array-object model.
 * The final parameter is the value each last item should have.
 * makeValues(2, 4, {}) returns:
 * {
 *   values: [
 *     { values: [{}, {}, {}, {}] },
 *     { values: [{}, {}, {}, {}] }
 *   ]
 * }
 */
function makeValues() {
  var args = Array.prototype.slice.call(arguments);
  var length = args.shift();

  if (!_.isNumber(length)) return _.clone(length);

  return {
    values: _.map(Array(length), () => makeValues.apply(this, args))
  };
}