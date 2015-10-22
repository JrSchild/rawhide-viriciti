'use strict'

var Promise = require('bluebird');
var Adapter = require('rawhide/core/Adapter');

class MongoDBSimpleNestedMapAdapter extends Adapter {
  constructor(model) {
    super(model);
    this.collections = {};
  }

  READ(metric) {}

  UPDATE(collectionName, query, update, done) {
    var start = Date.now();

    this.getParameterCollection(collectionName)
      .then((collection) => collection.updateOne(query, update, { upsert: true }))
      .then(() => {
        this.model.setLatency(Date.now() - start);
        done();
      })
      .catch(done);
  }

  getParameterCollection(collectionName) {
    if (this.collections[collectionName]) {
      return Promise.resolve(this.collections[collectionName]);
    }

    return Promise.fromNode(this.db.collection.bind(this.db, collectionName, {strict: true}))
      .catch(() => this.db.createCollection(collectionName).catch((err) => {

        // If status code is 48, it means it was created by another thread while this code was run.
        // If so, run this method again to retrieve and cache it.
        if (err.code !== 48) throw err;

        return this.getParameterCollection(collectionName);
      }))
      .then((collection) => (this.collections[collectionName] = collection));
  }

  READ(done) {
    var start = Date.now();

    var cursor = this.db.collection(this.parameters.thread.tableName)
      .find({});

    cursor.nextObject((err, res) => {
      cursor.close()
      this.model.setLatency(Date.now() - start);
      done(err);
    });
  }

  createTable() {
    return null;
  }

  // Clean up and delete database.
  destroy() {}
}

module.exports = MongoDBSimpleNestedMapAdapter;