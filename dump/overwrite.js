'use strict';

class Parent {
  constructor() {
    this.connect = () => {
      console.log('OVERWRITTEN');
      this.constructor.prototype.connect.call(this);
    }
  }

  connect() {
    console.log('parent connect');
  }
}

class Child extends Parent {
  connect() {
    console.log('child connect');
  }
}

var parent = new Parent();
parent.connect();


var child = new Child();
child.connect();