'use strict';

/**
 * A quick test to see how fast it is to process data at hindsight.
 */
var Adapter = require('rawhide/core/Adapter');
var utils = require('../lib/utils');
var _ = require('lodash');

const options = [
  ['minutes', 120000],
  ['seconds', 5000]
];

var database = 'my_test_db';
var collection = 'table';
var outputCollection = 'aggregated-in-node';

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
          documents[times.hours] = utils.getDocumentModel(options, {values: []});
          documents[times.hours]._id = times.hours;
        }

        documents[times.hours].options = options;
        documents[times.hours].values[times.minutes.i].values[times.seconds.i].values.push({
          m: times.milliseconds,
          v: result[i].v
        });
      }

      var standard = {
        sum: 0,
        count: 0,
        min: null,
        max: null
      };

      // Accumulate data for easier processing/querying and
      // make sure the final arrays are sorted.
      _.each(documents, (doc) => {

        _.merge(doc, standard);
        doc.values.forEach((minutes) => {

          _.merge(minutes, standard);
          minutes.values.forEach((seconds) => {

            // Add some sorting obscurity.
            seconds.values = seconds.values.sort((a, b) => a.m > b.m ? 1 : a.m < b.m ? -1 : 0);

            _.merge(seconds, standard);
            seconds.values.forEach((milliseconds) => {
              seconds.sum += (milliseconds.v || 0);
              seconds.count++;
              seconds.min = seconds.min === null ? milliseconds.v : Math.min(seconds.min, milliseconds.v);
              seconds.max = seconds.max === null ? milliseconds.v : Math.max(seconds.max, milliseconds.v);
            });

            minutes.sum += seconds.sum;
            minutes.count += seconds.count;
            minutes.min = minutes.min === null ? seconds.min : Math.min(minutes.min, seconds.min);
            minutes.max = minutes.max === null ? seconds.max : Math.max(minutes.max, seconds.max);
          });

          doc.sum += minutes.sum;
          doc.count += minutes.count;
          doc.min = doc.min === null ? minutes.min : Math.min(doc.min, minutes.min);
          doc.max = doc.max === null ? minutes.max : Math.max(doc.max, minutes.max);
        });
      });

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