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

var adapter = new Adapter({
  parameters: { database: 'MongoDB' }
});
var collection = 'engine~rpm';

adapter.connect({
  database: 'pro_vio_sg_101'
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

        documents[times.hours].values[times.minutes.i].values[times.seconds.i].values.push({
          m: times.milliseconds,
          v: result[i].v
        });
      }

      // Sort everything.
      _.each(documents, (doc) => {
        doc.values.forEach((minutes) => {
          var minSum = 0, minCount = 0, minMin = null, minMax = null;

          minutes.values.forEach((seconds) => {
            // seconds.values.sort((a, b) => a.m > b.m); // Doesn't work for some reason...

            var secSum = 0, secCount = 0, secMin = null, secMax = null;
            seconds.values.forEach((d) => {
              secSum += (d.v || 0);
              secCount++;
              secMin = secMin === null ? d.v : Math.min(secMin, d.v);
              secMax = secMax === null ? d.v : Math.max(secMax, d.v);
            });
            seconds.sum = secSum;
            seconds.count = secCount;
            seconds.min = secMin;
            seconds.max = secMax;

            minSum += seconds.sum;
            minCount += seconds.count;
            minMin = minMin === null ? secMin : Math.min(minMin, secMin);
            minMax = minMax === null ? secMax : Math.max(minMax, secMax);
          });

          minutes.sum = minSum;
          minutes.count = minCount;
          minutes.min = minMin;
          minutes.max = minMax;
        });
      });

      console.log(`Aggregated data in ${Date.now() - start}ms.`);

      console.log('Inserting documents.');
      start = Date.now();
      return db.collection('aggregated-in-node')
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