var moment = require('moment');

var time = 1445511198207;

momentTime = moment(time);
momentObj = moment(time).toObject();

// In this order because moment changes internally on each call.
var startOfSecond = +momentTime.startOf('second');
var startOfMinute = +momentTime.startOf('minutes');
var hour = +momentTime.startOf('hour');

console.log('date:         ', new Date(time));
console.log('time:         ', time);
console.log('hour:         ', hour);
console.log('startOfMinute:', startOfMinute);
console.log('startOfSecond:', startOfSecond);
console.log('------------------------');

var minInterval = 60000 * 2
var secInterval = 1000 * 5
var minute = ~~((startOfMinute - hour) / minInterval) * minInterval;
var second = ~~((startOfSecond - hour - minute) / secInterval) * secInterval;
var millisecond = time - hour - minute - second;

console.log('hour:         ', hour);
console.log('minute:       ', minute);
console.log('second:       ', second);
console.log('millisecond:  ', millisecond);
console.log('------------------------');


// momentTime = moment(time);
// console.log(JSON.stringify(momentTime.toObject(), undefined, 2));
// console.log('------------------------');

// var minute = ~~(momentTime.get('minutes') / 2) * 2 * 60000;

// momentTime.subtract(minute, 'millisecond');
// console.log(+momentTime);
// console.log(JSON.stringify(momentTime.toObject(), undefined, 2));
// console.log('------------------------');

// var second = ~~(momentTime.get('seconds') / 5) * 5 * 1000;
// console.log('minute:       ', minute);
// console.log('second:       ', second);


momentTime = moment.duration(time - hour);
console.log(momentTime._data);

minute = ~~(momentTime.get('minutes') / 5) * 5 * 60000;
momentTime.subtract(minute);

second = ~~(momentTime.get('seconds') / 7) * 7 * 1000 + (momentTime.get('minutes') * 60000);
momentTime.subtract(second);

console.log('minute:       ', minute);
console.log('second:       ', second);
console.log('millisecond:  ', +momentTime);
console.log('------------------------');

momentTime = moment.duration(time - hour);

millisecond = momentTime.milliseconds() + (momentTime.seconds() % 5) * 1000;
momentTime.subtract(millisecond);

second = momentTime.seconds() * 1000 + (momentTime.minutes() % 2) * 60000;
momentTime.subtract(second);

minute = momentTime.minutes() * 60000;

console.log('minute:       ', minute);
console.log('second:       ', second);
console.log('millisecond:  ', millisecond);
console.log('------------------------');


// Options:
var options = {
  format: 'index', // index,timestamp(default)
  minutes: 7,
  seconds: 7
};

console.log(JSON.stringify(splitTime2(time, options), undefined, 2));
console.log('------------------------');


momentTime = moment.duration(time - hour);
console.log(momentTime._data);
console.log(+momentTime);
var i = [120000, 5000];

var one = ~~(+momentTime / i[0]);
console.log(one, one * i[0]);
momentTime.subtract(one * i[0]);

var two = ~~(+momentTime / i[1]);
console.log(two, two * i[1]);
momentTime.subtract(two * i[1]);
console.log(+momentTime);

console.log('------------------------');
var options = {
  intervals: [
    ['minutes', 120000],
    ['seconds', 5000]
  ],
  start: 'hours',
  end: 'miliseconds'
};
var _ = require('lodash');

console.log(JSON.stringify(splitTime3(time, options), undefined, 2));

function splitTime3(time, options) {
  var start = moment(time).startOf(options.start);
  var result = {
    [options.start]: +start
  };

  momentTime = moment.duration(time - start);

  _.transform(options.intervals, (result, i) => {
    var index = ~~(+momentTime / i[1]);

    result[i[0]] = {
      i: index,
      v: index * i[1]
    };
    momentTime.subtract(result[i[0]].v);
  }, result);

  result[options.end] = +momentTime;

  return result;
}


function splitTime2(time, options) {
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

function splitTime(time, options) {
  var m = options.minutes;
  var s = options.seconds;

  var millisecond = momentTime.milliseconds() + (momentTime.seconds() % s) * 1000;
  momentTime.subtract(millisecond);

  var seconds = momentTime.seconds() * 1000 + (momentTime.minutes() % m) * 60000;
  momentTime.subtract(seconds);

  var minutes = momentTime.minutes() * 60000;

  // What to do with miliseconds? It's probably not a good idea
  // to end up with a sparse array with a length of 5000.
  if (options.format === 'index') {
    minutes /= (60000 * m);
    seconds /= (1000 * s);
  }

  return { minutes, seconds, millisecond };
}
