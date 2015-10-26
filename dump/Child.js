'use strict'

var Parent = require('./Parent');

const ADAPTERS = {
  MongoDB: 'MongoDBBasicAdapter'
};

class BasicModel extends Parent {
  lol() {
    return 'hihihih';
  }
}

module.exports = BasicModel;
module.exports.ADAPTERS = ADAPTERS;