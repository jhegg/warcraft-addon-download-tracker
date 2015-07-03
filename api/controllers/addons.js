'use strict';

var util = require('util');
var database = require('../helpers/database');

database.createConstraintsOnStartup();

module.exports = {
  getAddons: getAddons,
  getAddon: getAddon,
  createAddon: createAddon,
  getDownloadsForAddon: getDownloadsForAddon,
  addDownloadsForAddon: addDownloadsForAddon
};

function getAddons(req, res) {
  database.lookupAddons(res, getAddonsCallback);
}

function getAddonsCallback(err, res, results) {
  if (err) throw err;
  if (!results || results.empty) {
    res.json({});
  } else {
    var addonNames = results.map(function (addon) { return addon.addonName } );
    res.json(addonNames);
  }
}

function getAddon(req, res) {
  var name = req.swagger.params.addonName.value;
  // todo what other validation should be done on name? or is swagger handling that for us?
  res.json(database.lookupAddon(name));
}

function createAddon(req, res) {
  var name = req.swagger.params.addonName.value;
  var curseForgeUrl = req.swagger.params.urls.value.curseForgeUrl;
  var wowInterfaceUrl = req.swagger.params.urls.value.wowInterfaceUrl;
  // todo validation
  database.newAddon(name, curseForgeUrl, wowInterfaceUrl, res, createAddonCallback);
}

function createAddonCallback(err, res, name, results) {
  if (err) {
    console.error('Error in addons#createAddonCallback: ' + err);
    return res.status(400).json(util.format('The specified addon already exists: %s', name));
  }
  var addon = results['ops'][0];
  delete addon['_id'];
  res.json(addon);
}

function getDownloadsForAddon(req, res) {
  var name = req.swagger.params.addonName.value;
  // todo validation
  res.json(database.lookupDownloadsForAddon(name));
}

function addDownloadsForAddon(req, res) {
  var name = req.swagger.params.addonName.value;
  var count = req.swagger.params.downloads.value.count;
  // todo validation
  var timestamp = new Date();
  res.json(database.newDownloadCountForAddon(name, count, timestamp));
}
