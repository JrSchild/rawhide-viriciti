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

var database = 'pro_vio_sg_101';
var collection = 'aggregated-in-node';

var adapter = new Adapter({
  parameters: { database: 'MongoDB' }
});

adapter.connect({
  database: database
})
  .then(() => start(adapter.db))
  .catch(console.error);

function start(db) {
  db.collection(collection)
    .aggregate([
      {
        $match: {
          _id: 1443517200000
        }
      },
      {
        $unwind: '$values',
      },
      // {
      //   $unwind: '$values.values',
      // }
    ])
    .toArray()
    .then(console.log)
  // 1443517200000
}