var fs = require('fs');
var _ = require('lodash');
var bytes = require('bytes');
var results = require('../results/results.aggregate.json');

// Calculate lowest time.
var min = _.min(results, (result) => result.time).time;

var rows = Object.keys(results).map((name) => {
  var result = results[name];
  var speed = Math.round(result.time / 6518 * 1000) / 10;
  result.size = bytes(result.size);
  result.avgObjSize = bytes(result.avgObjSize);
  return [name].concat(_.values(_.pick(result, 'time', 'size', 'avgObjSize', 'totalIndexSize')), speed);
});

rows.unshift(['name', 'time (sec)', 'size', 'avgObjSize', 'indexSize', 'speed (%)']);
rows = rows.map((row) => row.join(';')).join('\n');
fs.writeFileSync('../results/results.aggregate.csv', rows);