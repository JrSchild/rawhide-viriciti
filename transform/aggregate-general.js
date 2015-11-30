'use strict';

/**
 * A quick test to see how fast it is to process data at hindsight.
 */
var Adapter = require('rawhide/core/Adapter');
var utils = require('../lib/utils');
var _ = require('lodash');
var MongoClient = require('mongodb').MongoClient;
const settings = require('../database.json').MongoDB;
const variations = {
  a: [Object, Object],
  b: [Object, Array],
  c: [Array, Object],
  d: [Array, Array]
};

// Parameters
const options = [3600000, 120000, 5000];
const type = variations.d;
const inputCollection = 'table';
const outputCollection = 'aggregated-in-node';

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
  var begin = Date.now();
  var start = begin;
  var documents = {};

  console.log('Start retrieving everything');

  db.collection(inputCollection)
    .find({})
    .toArray()
    .then((result) => {
      var times, current;

      console.log(`Found all in ${Date.now() - start}ms.`);
      console.log(`First record: ${JSON.stringify(result[0])}`);
      console.log(`Last record: ${JSON.stringify(result[result.length - 1])}`);

      console.log('Start aggregating');
      start = Date.now();

      for (var i = 0, l = result.length; i < l; i++) {
        times = utils.splitTimeArray(result[i]._id, options);

        if (!documents[times[0]]) {
          if (type[0] === Object) {
            documents[times[0]] = {values: {}};
          } else {
            documents[times[0]] = utils.getDocumentModelArray(options, new type[1]);
          }
          documents[times[0]]._id = times[0];
          documents[times[0]].options = options;
        }

        let current = documents[times[0]].values;
        let y = 1, q = options.length;
        let M = type[0] === Object ? 1 : 0;
        for (; y < q; y++) {
          if (type[0] === Object) {
            current[times[y][M]] = current[times[y][M]] || {values: {}};
            current = current[times[y][M]].values;
          } else {
            current = current[times[y][M]].values || current[times[y][M]];
          }
        }
        current[times[q]] = result[i].v;
      }

      console.log(`Aggregated data in ${Date.now() - start}ms.`);

      console.log('Inserting documents.');
      start = Date.now();
      return db.collection(outputCollection)
        .insert(_.values(documents), (err) => {
          if (err) {
            throw err;
          }

          // Find the corresponding letter.
          var variation = Object.keys(variations).find((elem) => {
            return variations[elem] === type;
          }, null);

          // Get stats from DB

          // Join stats with metrics from this script

          // Write 'em away

          console.log(`Done, inserted in: ${Date.now() - start}ms.`);
          console.log(`Aggregated ${result.length} documents into ${Object.keys(documents).length} docs in ${Date.now() - begin}ms.`);
          process.exit();
        });
    })
    .catch(console.error);
}