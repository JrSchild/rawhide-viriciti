'use strict'

var _ = require('lodash');
var Model = require('rawhide/core/Model');

class BaseModel extends Model {
  getDocumentModel() {
    return {};
  }
}

module.exports = BaseModel;