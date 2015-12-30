'use strict'

var BaseModel = require('./BaseModel');
var utils = require('../lib/utils');
var argv = require('yargs')
  .default('variation', 'a')
  .default('format', 3)
  .check(function (argv) {
    if (!/^[abcd]{1}$/.test(argv.variation)) {
      throw 'Only variation a,b,c or d allowed.'
    }
    if (1 > argv.format || argv.format > 13) {
      throw 'Format must be between 1 and 13.'
    }
    return true;
  })
  .argv;

const ADAPTERS = {
  MongoDB: 'MongoDBSimpleNestedMapAdapter'
};

const variations = {
  a: [Object, Object],
  b: [Object, Array],
  c: [Array, Object],
  d: [Array, Array]
};
const formats = [
  [60000, 1000],
  [3600000, 60000, 1000],
  [3600000, 120000, 5000],
  [3600000, 180000, 10000],
  [3600000, 240000, 15000],
  [3600000, 360000, 36000, 1000],
  [3600000, 300000, 25000, 1000],
  [3600000, 300000, 20000, 1000],
  [3600000],
  [3600000, 60000],
  [3600000, 60000, 2000],
  [3600000, 60000, 5000],
  [3600000, 60000, 10000]
];

const format = formats[argv.format - 1];
const variation = variations[argv.variation];
const B = variation[0] === Object ? 1 : 0;

class GeneralModel extends BaseModel {
  WRITE(data, done) {
    var times = utils.splitTimeArray(data.t, format);
    var query = {
      _id: times[0]
    };
    var update = {};
    var updateStr = 'values.';

    var i = 1, l = format.length;
    for (; i < l; i++) {
      updateStr += `${times[i][B]}.values.`;
    }

    if (variation[1] === Object) {
      updateStr += `${times[l]}`;
      update.$set = {
        [updateStr]: data.v
      }
    } else {
      // Cut off the final dot of the string.
      updateStr = updateStr.substring(0, updateStr.length - 1);
      update.$push = {
        [updateStr]: {
          t: times[l],
          v: data.v
        }
      };
    }

    this.adapter.UPDATE(this.parameters.thread.tableName, query, update, done);
  }

  READ(done) {
    this.adapter.READ(done);
  }

  getDocumentModel() {
    if (variation[0] === Object && variation[1] === Object)
      return {};

    return utils.makeValuesArray(format, variation);
  }

  static name() {
    return `Model-1-${argv.format}-${argv.variation}`;
  }
}

module.exports = GeneralModel;
module.exports.ADAPTERS = ADAPTERS;