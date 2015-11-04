'use strict';

/**
 * A quick test to see how fast it is to process data at hindsight.
 */
var Adapter = require('rawhide/core/Adapter');
var utils = require('../lib/utils');

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
  var newDocument = utils.getDocumentModel(options);

  console.log('Start retrieving everything');
  cursor.toArray()
    .then((result) => {
      var times;

      console.log(`Found all in ${Date.now() - start}ms.`);
      console.log(`First record: ${result[0]}`);
      console.log(`Last record: ${result[result.length - 1]}`);
     
      console.log('Start aggregating');
      start = Date.now();
      newDocument._id = utils.splitTime(result[0], options).hours;

      for (var i = 0, l = result.length; i < l; i++) {
        times = utils.splitTime(result[i]._id, options);
        newDocument.values[times.minutes.i].values[times.seconds.i][times.milliseconds] = result[i].v
      }
      console.log(`Aggregated data in ${Date.now() - start}ms.`);

      console.log('Inserting new document.');
      start = Date.now();
      return db.collection(collection)
        .insertOne(newDocument, (err) => {
          if (err) {
            throw err;
          }

          console.log(`Done, inserted in: ${Date.now() - start}ms.`);
          console.log(`Aggregated ${result.length} documents into one in ${Date.now() - begin}ms.`);
        });
    })
    .catch(console.error);
}