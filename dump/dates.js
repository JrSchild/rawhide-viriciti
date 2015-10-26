var moment = require('moment');

var query = {};
var update = {};

console.log('------------------------');

var time = 1445511198207;
console.log('time:', time, new Date(time));
var startOfHour = +moment(time).startOf('hour');
var startOfMinute = +moment(time).startOf('minute');
var startOfSecond = +moment(time).startOf('second');

console.log('startOfHour:', startOfHour, new Date(startOfHour));
console.log('startOfMinute:', startOfMinute, new Date(startOfMinute));
console.log('startOfSecond:', startOfSecond, new Date(startOfSecond));
console.log('------------------------');
// console.log(startOfMinute - startOfHour);
console.log('------------------------');
var hour = startOfHour;
var minute = Math.floor(Math.abs(startOfMinute - hour) / 60000 / 2) * 60000 * 2;
var second = Math.floor(Math.abs(startOfSecond - hour - minute) / 1000 / 5) * 1000 * 5;
var millisecond = time - hour - minute - second;

console.log('hour:', hour, new Date(hour));
console.log('minute:', minute);
console.log('second:', second);
console.log('millisecond:', millisecond);
console.log(hour + minute + second + millisecond);
console.log(time);

query._id = hour;

update['$set'] = {[`values.${minute}.values.${second}.values.${millisecond}`]: 123};