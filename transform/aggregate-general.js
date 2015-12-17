'use strict';

/**
 * A quick test to see how fast it is to process data at hindsight.
 */
var fs = require('fs');
var path = require('path');
var cluster = require('cluster');
var _ = require('lodash');
var async = require('async');
var utils = require('../lib/utils');
var MongoClient = require('mongodb').MongoClient;
var Statistics = require('rawhide/core/Statistics');
var argv = require('yargs')
  .default('variation', 'a')
  .default('format', 3)
  .check(function (argv) {
    if (!/^[abcd]{1}$/.test(argv.variation)) {
      throw 'Only variation a,b,c or d allowed.'
    }
    if (1 > argv.format || argv.format > 8) {
      throw 'Format must be between 1 and 8.'
    }
    return true;
  })
  .argv;
const settings = require('../database.json').MongoDB;
const variations = {
  a: [Object, Object],
  b: [Object, Array],
  c: [Array, Object],
  d: [Array, Array]
};
const formats = [
  [60000, 1000],
  [3600000, 60000, 1000],
  [3600000, 120000, 5000],
  [3600000, 180000, 10000],
  [3600000, 240000, 15000],
  [3600000, 360000, 36000, 1000],
  [3600000, 300000, 25000, 1000],
  [3600000, 300000, 20000, 1000]
];

// Set to falsy value to ignore.
const FETCH_TIME = 5951;
const TEST_TIMES = 5;

// Parameters
const format = formats[argv.format - 1];
const type = variations[argv.variation];
const inputCollection = 'table';
const outputCollection = 'aggregated-in-node';

const M = type[0] === Object ? 1 : 0;
const IS_ALL_OBJECT = type[0] === Object && type[1] === Object;
const FORMAT_LENGTH = format.length;

if (cluster.isMaster) {
  var child;
  var resultPath = path.resolve(process.cwd(), '../results');
  Statistics.ensureDirSync(resultPath);
  resultPath += `/results.aggregate.json`;

  var results = Statistics.requireOrCreate(resultPath);

  return async.timesSeries(TEST_TIMES, (i, next) => {
    console.log('iteration', i);
    child = cluster.fork();
    child.on('message', (data) => setTimeout(() => next(null, data), 500));
    child.on('error', (err) => next(err));
  }, (err, stats) => {
    if (err) throw err;

    stats[0].time = [stats[0].time];
    stats[0].find = [stats[0].find];
    stats[0].aggregate = [stats[0].aggregate];
    stats[0].insert = [stats[0].insert];

    stats = stats.reduce((prev, curr) => {
      prev.time.push(curr.time);
      prev.find.push(curr.find);
      prev.aggregate.push(curr.aggregate);
      prev.insert.push(curr.insert);

      return prev;
    });

    stats.time = Math.round(_.sum(stats.time) / TEST_TIMES);
    stats.find = Math.round(_.sum(stats.find) / TEST_TIMES);
    stats.aggregate = Math.round(_.sum(stats.aggregate) / TEST_TIMES);
    stats.insert = Math.round(_.sum(stats.insert) / TEST_TIMES);

    results[`Model-2.${stats.formatIndex}.${stats.variation}`] = stats;
    fs.writeFileSync(resultPath, JSON.stringify(results, undefined, 2));

    console.log('done with', `Model-2.${stats.formatIndex}.${stats.variation}`);

    process.exit();
  });
}

MongoClient.connect(`mongodb://${settings.host}:${settings.port}/${settings.database}`, function (err, db) {
  if (err) throw err;

  db.collection(outputCollection)
    .drop()
    .then(function () {
      start(db);
    })
    .catch(function (err) {
      if (err.errmsg === 'ns not found') {
        return start(db);
      }
      console.error(err);
    });
});

function start(db) {
  var start = Date.now();
  var stats = {
    time: start,
    find: start,
    aggregate: null,
    insert: null
  };
  var documents = {};

  console.log('Start retrieving everything');

  db.collection(inputCollection)
    .find({})
    .toArray()
    .then((result) => {
      var times, current;

      stats.find = FETCH_TIME || Date.now() - stats.find;
      start = Date.now();
      stats.aggregate = start;
      console.log(`Found all in:        ${stats.find}ms`);

      for (var i = 0, l = result.length; i < l; i++) {
        times = utils.splitTimeArray(result[i]._id, format);

        if (!documents[times[0]]) {
          if (IS_ALL_OBJECT) {
            documents[times[0]] = {values: {}};
          } else {
            documents[times[0]] = utils.makeValuesArray(format, type);
          }
          documents[times[0]]._id = times[0];
          documents[times[0]].format = format;
        }

        let current = documents[times[0]].values;
        let y = 1;
        for (; y < FORMAT_LENGTH; y++) {
          if (IS_ALL_OBJECT && !current[times[y][M]]) {
            current[times[y][M]] = {values: {}};
          }
          current = current[times[y][M]].values;
        }

        if (type[1] === Object) {
          current[times[FORMAT_LENGTH]] = result[i].v;
        } else {
          current.push({
            t: times[FORMAT_LENGTH],
            v: result[i].v
          });
        }
      }

      stats.aggregate = Date.now() - stats.aggregate;
      start = Date.now();
      stats.insert = Date.now();
      console.log(`Aggregated data in:  ${stats.aggregate}ms`);

      return db.collection(outputCollection)
        .insert(_.values(documents), (err) => {
          if (err) {
            throw err;
          }

          var end = Date.now();
          stats.insert = end - stats.insert;
          stats.time = stats.find + stats.insert + stats.aggregate;
          console.log(`Inserted in:         ${stats.insert}ms`);
          console.log(`Aggregated ${result.length} documents into ${Object.keys(documents).length} docs in ${stats.time}ms.`);

          // Get stats from DB
          db.collection(outputCollection).stats(function (err, collStats) {
            if (err) throw err;

            // Join stats with metrics from this script
            _.merge(stats, _.pick(collStats, 'count', 'size', 'avgObjSize', 'storageSize', 'totalIndexSize'));

            stats.type = type.map((a) => a());
            stats.format = format;
            stats.formatIndex = argv.format;
            stats.variation = argv.variation;

            process.send(stats);
            process.exit();
          });
        });
    })
    .catch(console.error);
}