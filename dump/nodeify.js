'use strict'

var Promise = require('bluebird');

class Parent {
  connect(promise) {
    console.log(promise);
  }
}

class Child extends Parent {
  connect() {
    var promise = Promise.resolve(123);

    return super.connect(promise);
  }
}

var child = new Child()
child.connect()