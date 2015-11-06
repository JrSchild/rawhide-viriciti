'use strict'

var _ = require('lodash');
var Model = require('rawhide/core/Model');

class BaseModel extends Model {
  getDocumentModel() {
    return {};
  }
  
  createTable() {
    return this.adapter.createTable(this.parameters.thread.tableName);
  }
}

module.exports = BaseModel;