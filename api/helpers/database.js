'use strict';

var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var mongoCollection = 'addons';
var mongoUrl = process.env.MONGOLAB_URI;

module.exports = {
  lookupAddons: lookupAddons,
  lookupAddon: lookupAddon,
  newAddon: newAddon,
  lookupDownloadsForAddon: lookupDownloadsForAddon,
  newDownloadCountForAddon: newDownloadCountForAddon,
  createConstraintsOnStartup: createConstraints
};

function createConstraints() {
  MongoClient.connect(mongoUrl, function (err, db) {
    assert.equal(null, err);
    var collection = db.collection(mongoCollection);
    collection.createIndex('addonName', {unique: true}, function (err, indexName) {
      if (err) console.error('Error while creating addonNameUnique index: ' + err);
      console.log('Created index: ' + indexName);
    });
  });
}

function lookupAddons(res, callback) {
  MongoClient.connect(mongoUrl, function (err, db) {
    assert.equal(null, err);
    db.collection(mongoCollection).find(
      {'addonName': { $exists: true, $ne: null}},
      {'addonName': true},
      {'sort': 'addonName'}
    ).toArray(
      function (err, results) {
        callback(err, res, results);
      }
    );
  });
}

function lookupAddon(addonName, res, callback) {
  MongoClient.connect(mongoUrl, function (err, db) {
    assert.equal(null, err);
    db.collection(mongoCollection).find(
      {'addonName': addonName}
    ).toArray(
      function (err, results) {
        callback(err, res, results);
      }
    );
  });
}

function newAddon(addonName, curseForgeUrl, wowInterfaceUrl, res, callback) {
  MongoClient.connect(mongoUrl, function (err, db) {
    assert.equal(null, err);
    var collection = db.collection(mongoCollection);
    collection.insert(
      {
        addonName: addonName,
        curseForgeUrl: curseForgeUrl,
        wowInterfaceUrl: wowInterfaceUrl
      },
      { w: 1 },
      function (err, results) {
        callback(err, res, addonName, results);
      }
    );
  });
}

function lookupDownloadsForAddon(addonName) {
  var downloads = [];
  // todo do the mongo lookup
  // todo what sort of validation should I do here?
  downloads.push({count: 1, timestamp: new Date()});
  downloads.push({count: 2, timestamp: new Date()});
  downloads.push({count: 3, timestamp: new Date()});
  return {
    addonName: addonName,
    downloads: downloads
  };
}

function newDownloadCountForAddon(addonName, count, timestamp) {
  // todo use mongo to lookup addonName to verify it exists
  // todo use mongo to insert a new record, with count and timestamp
  return {
    addonName: addonName,
    count: count,
    timestamp: timestamp
  }
}
