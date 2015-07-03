'use strict';

var assert = require('assert');
var util = require('util');
var MongoClient = require('mongodb').MongoClient;
var mongoCollection = 'addons';
var mongoUrl = process.env.MONGOLAB_URI;

module.exports = {
  lookupAddons: lookupAddons,
  lookupAddon: lookupAddon,
  newAddon: newAddon,
  lookupDownloadsForAddon: lookupDownloadsForAddon,
  newDownloadCountForAddon: newDownloadCountForAddon
};

function lookupAddons(res, callback) {
  MongoClient.connect(mongoUrl, function (err, db) {
    assert.equal(null, err);
    db.collection(mongoCollection).find(
      {},
      {'addonName': true},
      {'sort': 'addonName'}
    ).toArray(
      function (err, results) {
        callback(err, res, results);
      }
    );
  });
}

function lookupAddon(addonName) {
  // todo do the mongo lookup
  // todo for safety, should I #lookupAddons, and then iterate and string compare to find a match, to
  //        prevent malicious input?
  return {
    addonName: addonName,
    curseForgeUrl: 'http://curseforge.com/' + addonName,
    wowInterfaceUrl: 'http://wowinterface.com/author'
  }
}

function newAddon(addonName, curseForgeUrl, wowInterfaceUrl) {
  // todo do the mongo lookup
  // todo what sort of validation should I do here?
  return {
    addonName: addonName,
    curseForgeUrl: curseForgeUrl,
    wowInterfaceUrl: wowInterfaceUrl
  };
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
