'use strict'

var Model = require('rawhide/core/Model');
var utils = require('../lib/utils');

const ADAPTERS = {
  MongoDB: 'MongoDBSimpleNestedMapAdapter'
};

const options = {
  format: 'index',
  minutes: 2,
  seconds: 5
};

class SimpleNestedMapModel extends Model {
  WRITE(data, done) {
    var times = utils.splitTime(data.t, options);
    var query = {
      _id: times.hour
    };
    var update = {};

    update['$set'] = {[`values.${times.minutes}.values.${times.seconds}.values.${times.milliseconds}`]: data.v};

    this.adapter.UPDATE(this.parameters.thread.tableName, query, update, done);
  }

  READ(done) {
    this.adapter.READ(done);
  }
}

module.exports = SimpleNestedMapModel;
module.exports.ADAPTERS = ADAPTERS;