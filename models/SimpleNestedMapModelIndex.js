'use strict'

var BaseModel = require('./BaseModel');
var utils = require('../lib/utils');

const ADAPTERS = {
  MongoDB: 'MongoDBSimpleNestedMapAdapter'
};

const options = [
  ['minutes', 120000],
  ['seconds', 5000]
];

class SimpleNestedMapModelIndex extends BaseModel {
  WRITE(data, done) {
    var times = utils.splitTimeBeginning(data.t, options);
    var query = {
      _id: times.minutes
    };
    var update = {};

    update.$set = {
      [`values.${times.seconds.i}.values.${times.milliseconds}`]: data.v
    };

    this.adapter.UPDATE(this.parameters.thread.tableName, query, update, done);
  }

  READ(done) {
    this.adapter.READ(done);
  }

  indexes() {
    return [
      {'values': 'hashed'}
    ];
  }
}

module.exports = SimpleNestedMapModelIndex;
module.exports.ADAPTERS = ADAPTERS;