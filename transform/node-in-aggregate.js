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
var collection = 'aggregated-in-node';
var outputCollection = 'node-in-aggregated';

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
    .then((collections) => {
      var documents = [];

      console.log(`Found all in ${Date.now() - start}ms.`);

      console.log('Start unwinding');
      start = Date.now();

      collections.forEach((collection) => {
        console.log(collection._id);
        collection.values.forEach((minutes, minutesI) => {
          minutesI *= 120000;

          minutes.values.forEach((seconds, secondsI) => {
            secondsI *= 5000;

            seconds.values.forEach((second) => {
              documents.push({
                _id: collection._id + minutesI + secondsI + second.m,
                v: second.v
              });
            })
          });
        });
      });

      console.log(`Unwound data in ${Date.now() - start}ms.`);

      console.log('Inserting documents.');
      start = Date.now();

      return db.collection(outputCollection)
        .insert(documents);
    })
    .then((result) => {
      console.log(`Done, inserted in: ${Date.now() - start}ms.`);
      console.log(`Unwound into ${result.length} in ${Date.now() - begin}ms.`);
    })
    .catch(console.error);
}