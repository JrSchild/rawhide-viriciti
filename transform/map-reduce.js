'use strict';

var Adapter = require('rawhide/core/Adapter');

var adapter = new Adapter({
  parameters: { database: 'MongoDB' }
});
var collection = 'engine~rpm';

adapter.connect({
  database: 'pro_vio_sg_101'
})
  .then(() => start(adapter.db))
  .catch(console.error);


function map() {
  var duration = this._id % 3600000;
  var docId = this._id - duration;
  this.minutesI = ~~(duration / 120000);
  this.minutesV = this.minutesI * 120000;
  duration -= this.minutesV;
  this.secondsI = ~~(duration / 5000);
  this.secondsV = this.secondsI * 5000;
  duration -= this.secondsV;
  this.miliseconds = duration;
  emit(docId, this);
}

function reduce(key, values) {
  var i, result = [];

  for (i = 0, l = values.length; i < l; i++ ) {
    if (values[i].values) {
      result.push.apply(result, values[i].values);
    } else {
      result.push(values[i]);
    }
  }

  return {
    values: result
  };
}

// TODO: Sort last children.
function finalize(key, data) {
  data = data.values;

  var docModel = {
    values: []
  };

  for (var i = 0; i < 30; i++) {
    docModel.values[i] = {
      values: []
    };
    for (var y = 0; y < 24; y++) {
      docModel.values[i].values[y] = [];
    }
  }

  if (!data) {
    return docModel;
  }

  var curr;
  for (var i = 0, l = data.length; i < l; i++) {
    curr = data[i];

    docModel.values[curr.minutesI].values[curr.secondsI].push({
      m: curr.miliseconds,
      v: curr.v
    });
  }

  return docModel;
}

function start(db) {
  var start = Date.now()
  var a = db.collection(collection)
    .mapReduce(map, reduce, {
      out: 'mapReduceOutput',
      finalize: finalize
    })
    .then((a) => console.log('done in', Date.now() - start))
    .catch(console.error);
}