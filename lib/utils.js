var _ = require('lodash');

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
  var duration = time % 3600000;
  var result = {
    hours: time - duration
  };
  var index;

  // Subtract each interval from the duration.
  for (var i = 0, l = options.length; i < l; i++) {

    // Current index is the biggest interval that fits inside the time rounded down.
    index = ~~(duration / options[i][1]);
    result[options[i][0]] = {
      i: index,
      v: index * options[i][1]
    };

    // Remove the current value from the duration for the next iteration.
    duration -= result[options[i][0]].v
  }

  // Set the leftover time on the object.
  result.milliseconds = duration;

  return result;
}

/**
 * Create the document model based on options.
 */
function getDocumentModel(options, lastChild) {
  var lastValue = 3600000;
  lastChild = lastChild || {};

  var parameters = options.map((option) => {
    var value = lastValue / option[1];

    if (value !== ~~value) {
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

  if (!_.isNumber(length)) return _.cloneDeep(length);

  return {
    values: _.map(Array(length), () => makeValues.apply(this, args))
  };
}