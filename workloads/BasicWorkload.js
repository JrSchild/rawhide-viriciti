'use strict'

var Workload = require('rawhide/core/Workload');

class BasicWorkload extends Workload {

  constructor(parameters) {
    super(parameters);

    // Start time should be at the beginning of the hour so it won't overlap into
    // the next hour during a test. That would result in inconsistent results.
    this.time = (parameters.start - (parameters.start % 3600000)) + parameters.id;
    this.multiply = parameters.thread.multiply;
    this.value = 0;
  }

  load(done) {
    this.WRITE(done);
  }

  WRITE(done) {
    this.model.WRITE({
      t: (this.time += this.multiply),
      v: ++this.value
    }, done);
  }

  READ(done) {
    this.model.READ(done);
  }
}

module.exports = BasicWorkload;