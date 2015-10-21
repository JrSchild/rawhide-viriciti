'use strict'

var Workload = require('rawhide/core/Workload');
var _ = require('lodash');

var value = 0;

class BasicWorkload extends Workload {
  load(done) {
    this.WRITE(done);
  }

  WRITE(done) {
    this.model.WRITE({
      t: Date.now(),
      v: value++
    }, done);
  }

  READ(done) {
    this.model.READ(done);
  }
}

module.exports = BasicWorkload;