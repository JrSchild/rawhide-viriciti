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

class SimpleNestedArrayModel extends BaseModel {
  WRITE(data, done) {
    var times = utils.splitTime(data.t, options);
    var query = {
      _id: times.hours
    };
    var update = {};

    update['$set'] = {
      [`values.${times.minutes.i}.values.${times.seconds.i}.values.${times.milliseconds}`]: data.v
    };

    this.adapter.UPDATE(this.parameters.thread.tableName, query, update, done);
  }

  READ(done) {
    this.adapter.READ(done);
  }

  getDocumentModel() {
    return utils.makeValues(30, 24, {});
  }
}

module.exports = SimpleNestedArrayModel;
module.exports.ADAPTERS = ADAPTERS;