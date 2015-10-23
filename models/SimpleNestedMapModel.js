'use strict'

var Model = require('rawhide/core/Model');
var utils = require('../lib/utils');

const ADAPTERS = {
  MongoDB: 'MongoDBSimpleNestedMapAdapter'
};

const options = [
  ['minutes', 120000],
  ['seconds', 5000]
];

class SimpleNestedMapModel extends Model {
  WRITE(data, done) {
    var times = utils.splitTime(data.t, options);
    var query = {
      _id: times.hours
    };
    var update = {};

    update['$set'] = {[`values.${times.minutes.v}.values.${times.seconds.v}.values.${times.milliseconds}`]: data.v};

    this.adapter.UPDATE(this.parameters.thread.tableName, query, update, done);
  }

  READ(done) {
    this.adapter.READ(done);
  }
}

module.exports = SimpleNestedMapModel;
module.exports.ADAPTERS = ADAPTERS;