'use strict'

var Model = require('rawhide/core/Model');
var utils = require('../lib/utils');
var _ = require('lodash');

const ADAPTERS = {
  MongoDB: 'MongoDBSimpleNestedMapAdapter'
};

const options = [
  ['minutes', 120000],
  ['seconds', 5000]
];

class SimpleNestedArrayModel extends Model {
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
    return makeValues(30, 24, {});

    function makeValues() {
      var args = Array.prototype.slice.call(arguments);
      var length = args.shift();

      if (!_.isNumber(length)) return _.clone(length);

      return {
        values: _.map(Array(length), () => makeValues.apply(this, args))
      };
    }
  }
}

module.exports = SimpleNestedArrayModel;
module.exports.ADAPTERS = ADAPTERS;