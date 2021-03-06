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

class SimpleNestedArrayModelPush extends BaseModel {
  WRITE(data, done) {
    var times = utils.splitTime(data.t, options);
    var query = {
      _id: times.hours
    };
    var update = {};

    update['$push'] = {
      [`values.${times.minutes.i}.values.${times.seconds.i}`]: {
        m: times.milliseconds,
        v: data.v
      }
    };

    this.adapter.UPDATE(this.parameters.thread.tableName, query, update, done);
  }

  READ(done) {
    this.adapter.READ(done);
  }

  getDocumentModel() {
    return utils.getDocumentModel(options, []);
  }
}

module.exports = SimpleNestedArrayModelPush;
module.exports.ADAPTERS = ADAPTERS;