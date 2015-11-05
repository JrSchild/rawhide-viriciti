'use strict'

var Workload = require('rawhide/core/Workload');
var _ = require('lodash');

// Stack is faster than heap.
var value = 0;
var multiply;
var current;

class BasicWorkload extends Workload {

  constructor(parameters) {
    super(parameters);
    current = parameters.start + parameters.id;
    multiply = parameters.thread.multiply
  }

  load(done) {
    this.WRITE(done);
  }

  WRITE(done) {
    this.model.WRITE({
      t: (current += multiply),
      v: value++
    }, done);
  }

  READ(done) {
    this.model.READ(done);
  }
}

module.exports = BasicWorkload;