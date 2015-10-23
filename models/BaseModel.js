'use strict'

var _ = require('lodash');
var Model = require('rawhide/core/Model');

class BaseModel extends Model {

  getDocumentModel() {
    return {};
  }

  static makeValues() {
    var args = Array.prototype.slice.call(arguments);
    var length = args.shift();

    if (!_.isNumber(length)) return _.clone(length);

    return {
      values: _.map(Array(length), () => BaseModel.makeValues.apply(this, args))
    };
  }
}

module.exports = BaseModel;