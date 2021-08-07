'use strict';

const assert = require('assert');
const {MongoClient} = require('mongodb');
const mongoCollection = 'addons';
const mongoUrl = process.env.MONGODB_URI;
const client = new MongoClient(mongoUrl);

module.exports = {
  lookupAddons: lookupAddons,
  lookupAddon: lookupAddon,
  newAddon: newAddon,
  lookupDownloadsForAddon: lookupDownloadsForAddon,
  newDownloadCountForAddon: newDownloadCountForAddon,
  createConstraintsOnStartup: createConstraints
};

function createConstraints() {
  client.connect(function (err, client) {
    assert.equal(null, err);
    const collection = client.db().collection(mongoCollection);
    collection.createIndex('addonName', {unique: true, sparse: true}, function (err, indexName) {
      if (err) console.error('Error while creating addonNameUnique index: ' + err);
      console.log('Created index: ' + indexName);
    });
  });
}

function lookupAddons(res, callback) {
  client.connect(function (err, client) {
    assert.equal(null, err);
    const collection = client.db().collection(mongoCollection);
    collection.find(
      {'addonName': {$exists: true, $ne: null}},
      {'addonName': true}
    ).sort({addonName: 1}).toArray(
      function (err, results) {
        callback(err, res, results);
      }
    );
  });
}

function lookupAddon(addonName, res, callback) {
  client.connect(function (err, client) {
    assert.equal(null, err);
    const collection = client.db().collection(mongoCollection);
    collection.find(
      {'addonName': addonName}
    ).toArray(
      function (err, results) {
        callback(err, res, results);
      }
    );
  });
}

function newAddon(addonName, curseForgeUrl, wowInterfaceUrl, res, callback) {
  client.connect(function (err, client) {
    assert.equal(null, err);
    const collection = client.db().collection(mongoCollection);
    collection.insert(
      {
        addonName: addonName,
        curseForgeUrl: curseForgeUrl,
        wowInterfaceUrl: wowInterfaceUrl
      },
      {w: 1},
      function (err, results) {
        callback(err, res, addonName, results);
      }
    );
  });
}

function lookupDownloadsForAddon(addonName, res, callback) {
  client.connect(function (err, client) {
    assert.equal(null, err);
    const collection = client.db().collection(mongoCollection);
    collection.find(
      {'addonName': addonName}
    ).toArray(
      function (err, results) {
        if (err) {
          callback(err, res, addonName, results);
          return;
        }
        if (results.length === 0) {
          callback(err, res, addonName, results);
          return;
        }
        var addonId = results[0]._id;
        collection.find(
          {'addon_id': addonId}
        ).sort({timestamp: 1}).toArray(
          function (err, results) {
            callback(err, res, addonName, results);
          }
        );
      }
    );
  });

  var downloads = [];
  downloads.push({count: 1, timestamp: new Date()});
  downloads.push({count: 2, timestamp: new Date()});
  downloads.push({count: 3, timestamp: new Date()});
  return {
    addonName: addonName,
    downloads: downloads
  };
}

function newDownloadCountForAddon(addonName, count, timestamp, res, callback) {
  client.connect(function (err, client) {
    assert.equal(null, err);
    const collection = client.db().collection(mongoCollection);
    collection.find(
      {'addonName': addonName}
    ).toArray(
      function (err, results) {
        if (err) {
          callback(err, res, addonName, count, timestamp, results);
        }
        var addonId = results[0]._id;
        collection.insert(
          {
            addon_id: addonId,
            count: count,
            timestamp: timestamp
          },
          {w: 1},
          function (err, results) {
            callback(err, res, addonName, count, timestamp, results);
          }
        );
      }
    );
  });
}
