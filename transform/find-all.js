var path = require('path');
var cluster = require('cluster');
var async = require('async');
var _ = require('lodash');
var MongoClient = require('mongodb').MongoClient;
var settings = require('../database.json').MongoDB;
var times = 20;
var inputCollection = 'table';

/**
 * A test that benchmarks find all elements in a collection.
 */
if (cluster.isMaster) {
  async.timesSeries(times, (i, next) => {
    var child = cluster.fork();
    child.on('message', (data) => {
      console.log(`iteration ${i + 1}: ${data}`);
      next(null, data);
    });
  }, (err, result) => {
    if (err) throw err;

    console.log('average:', Math.round(_.sum(result) / result.length));
  });
} else {
  MongoClient.connect(`mongodb://${settings.host}:${settings.port}/${settings.database}`, function (err, db) {
    if (err) throw err;

    var start = Date.now();

    db.collection(inputCollection)
      .find({})
      .toArray()
      .then((result) => {
        process.send(Date.now() - start);
        process.exit();
      })
      .catch(console.error);
  });
}