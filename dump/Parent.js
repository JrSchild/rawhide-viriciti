'use strict';

class Parent {
  constructor(parameters) {
    console.log(parameters, this.constructor.ADAPTERS);
    console.log(this.constructor.prototype.lol());
  }
}

module.exports = Parent;