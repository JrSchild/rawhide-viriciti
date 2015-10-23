'use strict'

var Promise = require('bluebird');
var Adapter = require('rawhide/core/Adapter');
var _ = require('lodash');

class MongoDBSimpleNestedMapAdapter extends Adapter {
  constructor(model) {
    super(model);
    this.collections = {};
  }

  READ(metric) {}

  UPDATE(collectionName, query, update, done) {
    var start = Date.now();

    this.getParameterCollection(collectionName)
      .then((collection) => collection.updateOne(query, update))
      .then((result) => {
        if (!result.matchedCount) {
          return this.initializeDocument(collectionName, query)
            .then(() => this.UPDATE(collectionName, query, update, done));
        }
        this.model.setLatency(Date.now() - start);
        done();
      })
      .catch(done);
  }

  initializeDocument(collectionName, query) {
    var promiseName = `initializing${collectionName}`;

    // Return cached promise if exists.
    if (this[promiseName]) {
      return this[promiseName];
    }

    var documentModel = this.model.getDocumentModel();

    this[promiseName] = this.getParameterCollection(collectionName)
      .then((collection) => collection.updateOne(query, documentModel, {upsert: true}))
      .catch((err) => {
        // Error code 11000 is duplicate key, that's okay because
        // it was done by another thread. Throw error otherwise.
        if (err.code !== 11000) throw err;
      })

    // Delete the promise when it's finished.
    this[promiseName].finally(() => delete this[promiseName]);

    return this[promiseName];
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