var moment = require('moment');

module.exports.splitTime(time, options) => {
  var minInterval = 60000 * options.minutes;
  var secInterval = 1000 * options.seconds;

  var momentTime = moment(time);
  var startOfSecond = +momentTime.startOf('second');
  var startOfMinute = +momentTime.startOf('minutes');

  var hour = +momentTime.startOf('hour');
  var minutes = ~~((startOfMinute - hour) / minInterval) * minInterval;
  var seconds = ~~((startOfSecond - hour - minute) / secInterval) * secInterval;
  var milliseconds = time - hour - minute - second;

  // What to do with miliseconds? It's probably not a good idea
  // to end up with a sparse array with a length of 5000.
  if (options.format === 'index') {
    minutes /= (60000 * options.minutes);
    seconds /= (1000 * options.seconds);
  }

  return { hour, minutes, seconds, millisecond };
}