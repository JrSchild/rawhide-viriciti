'use strict';

/**
 * A quick test to see how fast it is to process data at hindsight.
 */
var Adapter = require('rawhide/core/Adapter');
var utils = require('../lib/utils');
var _ = require('lodash');

const options = [];

var database = 'my_test_db';
var collection = 'table';
var outputCollection = 'aggregated-in-node-map';

var adapter = new Adapter({
  parameters: { database: 'MongoDB' }
});

adapter.connect({
  database: database
})
  .then(() => start(adapter.db))
  .catch(console.error);

function start(db) {
  var cursor = db.collection(collection)
    .find({});

  var begin = Date.now();
  var start = begin;
  var documents = {};

  console.log('Start retrieving everything');
  cursor.toArray()
    .then((result) => {
      var times;

      console.log(`Found all in ${Date.now() - start}ms.`);
      console.log(`First record: ${JSON.stringify(result[0])}`);
      console.log(`Last record: ${JSON.stringify(result[result.length - 1])}`);

      console.log('Start aggregating');
      start = Date.now();

      for (var i = 0, l = result.length; i < l; i++) {
        times = utils.splitTime(result[i]._id, options);

        if (!documents[times.hours]) {
          documents[times.hours] = {values: {}};
          documents[times.hours]._id = times.hours;
        }

        documents[times.hours].values[times.milliseconds] = result[i].v;
      }

      console.log(`Aggregated data in ${Date.now() - start}ms.`);

      console.log('Inserting documents.');
      start = Date.now();
      return db.collection(outputCollection)
        .insert(_.values(documents), (err) => {
          if (err) {
            throw err;
          }

          console.log(`Done, inserted in: ${Date.now() - start}ms.`);
          console.log(`Aggregated ${result.length} documents into ${Object.keys(documents).length} docs in ${Date.now() - begin}ms.`);
          process.exit();
        });
    })
    .catch(console.error);
}