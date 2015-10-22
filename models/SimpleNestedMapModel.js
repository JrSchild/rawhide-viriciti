'use strict'

var Model = require('rawhide/core/Model');
var moment = require('moment');

const ADAPTERS = {
  MongoDB: 'MongoDBSimpleNestedMapAdapter'
};

class SimpleNestedMapModel extends Model {
  WRITE(data, done) {
    var query = {};
    var update = {};

    var time = data.t;
    var startOfHour = +moment(time).startOf('hour');
    var startOfMinute = +moment(time).startOf('minute');
    var startOfSecond = +moment(time).startOf('second');

    var hour = startOfHour;
    var minute = Math.floor(Math.abs (startOfMinute - hour) / 60000 / 2) * 60000 * 2;
    var second = Math.floor(Math.abs (startOfSecond - hour - minute) / 1000 / 5) * 1000 * 5;
    var millisecond = time - hour - minute - second;

    query._id = hour;
    update['$set'] = {[`values.${minute}.values.${second}.values.${millisecond}`]: data.v};

    this.adapter.UPDATE(this.parameters.thread.tableName, query, update, done);
  }

  READ(done) {
    this.adapter.READ(done);
  }
}

module.exports = SimpleNestedMapModel;
module.exports.ADAPTERS = ADAPTERS;