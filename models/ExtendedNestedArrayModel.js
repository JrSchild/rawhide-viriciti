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

class ExtendedNestedArrayModel extends BaseModel {
  WRITE(data, done) {
    var times = utils.splitTime(data.t, options);
    var query = {
      _id: times.hours
    };
    var update = {};

    update['$set'] = {
      [`values.${times.minutes.i}.values.${times.seconds.i}.values.${times.milliseconds}`]: data.v
    };

    update['$inc'] = {
      'sum': data.v,
      'count': 1,
      [`values.${times.minutes.i}.sum`]: data.v,
      [`values.${times.minutes.i}.count`]: 1,
      [`values.${times.minutes.i}.values.${times.seconds.i}.sum`]: data.v,
      [`values.${times.minutes.i}.values.${times.seconds.i}.count`]: 1
    };

    update['$min'] = {
      'min': data.v,
      [`values.${times.minutes.i}.min`]: data.v,
      [`values.${times.minutes.i}.values.${times.seconds.i}.min`]: data.v
    };

    update['$max'] = {
      'max': data.v,
      [`values.${times.minutes.i}.max`]: data.v,
      [`values.${times.minutes.i}.values.${times.seconds.i}.max`]: data.v
    };

    this.adapter.UPDATE(this.parameters.thread.tableName, query, update, done);
  }

  READ(done) {
    this.adapter.READ(done);
  }

  getDocumentModel() {
    return utils.getDocumentModel(options);
  }
}

module.exports = ExtendedNestedArrayModel;
module.exports.ADAPTERS = ADAPTERS;