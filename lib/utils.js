var moment = require('moment');

module.exports = {
  splitTime(time, options) {
    var minInterval = 60000 * options.minutes;
    var secInterval = 1000 * options.seconds;

    var momentTime = moment(time);
    var startOfSecond = +momentTime.startOf('second');
    var startOfMinute = +momentTime.startOf('minutes');

    var hours = +momentTime.startOf('hour');
    var minutes = ~~((startOfMinute - hours) / minInterval) * minInterval;
    var seconds = ~~((startOfSecond - hours - minutes) / secInterval) * secInterval;
    var milliseconds = time - hours - minutes - seconds;

    // What to do with miliseconds? It's probably not a good idea
    // to end up with a sparse array with a length of 5000.
    if (options.format === 'index') {
      minutes /= (60000 * options.minutes);
      seconds /= (1000 * options.seconds);
    }

    return { hours, minutes, seconds, milliseconds };
  }
};