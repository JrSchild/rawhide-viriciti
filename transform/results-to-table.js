var fs = require('fs');
var _ = require('lodash');
var bytes = require('bytes');
var results = require('../results/results.aggregate.json');

// Calculate highest time.
var max = _.max(results, (result) => result.time).time;

var rows = Object.keys(results).map((name) => {
  var result = results[name];

  result.speed = Math.round(max / result.time * 1000) / 10;
  result.size = bytes(result.size);
  result.avgObjSize = bytes(result.avgObjSize);

  return [name].concat(_.values(_.pick(result, 'time', 'count', 'size', 'totalIndexSize', 'speed')));
}).sort((a, b) => b[5] - a[5]);

rows.unshift(['name', 'time (sec)', 'count', 'size', 'indexSize', 'speed (%)']);
rows = rows.map((row) => row.join(';')).join('\n');
fs.writeFileSync('../results/results.aggregate.csv', rows);