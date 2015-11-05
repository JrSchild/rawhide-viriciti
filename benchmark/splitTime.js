var _ = require('lodash');
var moment = require('moment');
var utils = require('../lib/utils');
var Benchmark = require('benchmark');

var options = [
  ['minutes', 120000],
  ['seconds', 5000]
];
var optionsArr = [3600000, 120000, 5000];

var now = Date.now();

(new Benchmark.Suite)
.add('First splitTime', () => {
  splitTimeFirst(now, options);
})
.add('Second splitTime', () => {
  splitTimeTwo(now, options);
})
.add('splitTime with Array', () => {
  splitTimeArray(now, optionsArr)
})
.add('splitTime with Array 2', () => {
  splitTimeArrayTwo(now, optionsArr)
})
.add('splitTime with Array 3', () => {
  splitTimeArrayThree(now, optionsArr)
})
.add('Current splitTime', () => {
  utils.splitTime(now, options);
})
.on('cycle', (event) => console.log(`${event.target}`))
.run({async: true});


function splitTimeFirst(time, options) {
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

function splitTimeTwo(time, options) {
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

function splitTimeArray(time, options) {
  var duration = time % options[0];
  var result = [time - duration];
  var index;

  for (var i = 1, l = options.length; i < l; i++) {
    index = ~~(duration / options[i]);
    result.push([index, index * options[i]]);
    duration -= result[i][1];
  }
  result.push(duration);

  return result;
}

function splitTimeArrayTwo(time, options) {
  var duration = time % options[0];
  var result = [time - duration];
  var index;

  var i = 1, l = options.length;
  for (; i < l; i++) {
    index = ~~(duration / options[i]);
    result[i] = [index, index * options[i]];
    duration -= result[i][1];
  }
  result[i] = duration;

  return result;
}

function splitTimeArrayThree(time, options) {
  var duration = time % options[0];
  var i = 1, l = options.length;
  var result = Array(l + 1);
  result[0] = time - duration;
  var index;

  for (; i < l; i++) {
    index = ~~(duration / options[i]);
    result[i] = [index, index * options[i]];
    duration -= result[i][1];
  }
  result[i] = duration;

  return result;
}