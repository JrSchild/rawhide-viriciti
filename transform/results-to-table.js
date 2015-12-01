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

  return [name].concat(_.values(_.pick(result, 'time', 'aggregate', 'insert', 'speed')));
}).sort((a, b) => a[1] - b[1]);

rows.unshift(['name', 'total time (ms)', 'transform time (ms)', 'insert time (ms)', 'speed (%)']);
rows = rows.map((row) => row.join(';')).join('\n');
fs.writeFileSync('../results/results.aggregate.csv', rows);