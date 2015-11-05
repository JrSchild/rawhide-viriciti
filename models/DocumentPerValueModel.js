'use strict'

var Model = require('rawhide/core/Model');

const ADAPTERS = {
  MongoDB: 'MongoDBBasicAdapter'
};

class DocumentPerValueModel extends Model {
  WRITE(data, done) {
    this.adapter.WRITE({
      _id: data.t,
      v: data.v
    }, done);
  }

  READ(done) {
    this.adapter.READ(done);
  }
}

module.exports = DocumentPerValueModel;
module.exports.ADAPTERS = ADAPTERS;