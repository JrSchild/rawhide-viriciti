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

class ExtendedNestedMapModel extends Model {
  WRITE(data, done) {
    var times = utils.splitTime(data.t, options);
    var query = {
      _id: times.hours
    };
    var update = {};

    update['$set'] = {
      [`values.${times.minutes.v}.values.${times.seconds.v}.values.${times.milliseconds}`]: data.v
    };

    update['$inc'] = {
      'sum': data.v,
      'count': 1,
      [`values.${times.minutes.v}.sum`]: data.v,
      [`values.${times.minutes.v}.count`]: 1,
      [`values.${times.minutes.v}.values.${times.seconds.v}.sum`]: data.v,
      [`values.${times.minutes.v}.values.${times.seconds.v}.count`]: 1
    };

    update['$min'] = {
      'min': data.v,
      [`values.${times.minutes.v}.min`]: data.v,
      [`values.${times.minutes.v}.values.${times.seconds.v}.min`]: data.v
    };

    update['$max'] = {
      'max': data.v,
      [`values.${times.minutes.v}.max`]: data.v,
      [`values.${times.minutes.v}.values.${times.seconds.v}.max`]: data.v
    };

    this.adapter.UPDATE(this.parameters.thread.tableName, query, update, done);
  }

  getDocumentModel() {
    return {};
  }

  READ(done) {
    this.adapter.READ(done);
  }
}

module.exports = ExtendedNestedMapModel;
module.exports.ADAPTERS = ADAPTERS;