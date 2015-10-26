var _ = require('lodash');

function makeValues() {
  var args = Array.prototype.slice.call(arguments);
  var length = args.shift();

  if (!_.isNumber(length)) {
    return _.clone(length);
  }

  return {
    values: _.map(Array(length), () => makeValues.apply(this, args))
  }
}

console.log(JSON.stringify(makeValues(30, 24, {}), undefined, 2));