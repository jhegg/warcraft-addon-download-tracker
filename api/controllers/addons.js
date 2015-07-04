'use strict';

var util = require('util');
var database = require('../helpers/database');

database.createConstraintsOnStartup();

module.exports = {
  getAddons: getAddons,
  getAddonsCallback: getAddonsCallback, // visible for testing
  getAddon: getAddon,
  getAddonCallback: getAddonCallback, // visible for testing
  createAddon: createAddon,
  createAddonCallback: createAddonCallback, // visible for testing
  getDownloadsForAddon: getDownloadsForAddon,
  getDownloadsForAddonCallback: getDownloadsForAddonCallback, // visible for testing
  addDownloadsForAddon: addDownloadsForAddon,
  addDownloadsForAddonCallback: addDownloadsForAddonCallback // visible for testing
};

function getAddons(req, res) {
  database.lookupAddons(res, getAddonsCallback);
}

function getAddonsCallback(err, res, results) {
  if (err) {
    console.error('Error in addons#getAddonsCallback: ' + err);
    return res.status(500).json('An error occurred while fetching addons, sorry.');
  }

  if (!results || results.length === 0) {
    res.json([]);
    return;
  }

  var addonNames = results.map(function (addon) {
    return addon.addonName
  });
  res.json(addonNames);
}

function getAddon(req, res) {
  var name = req.swagger.params.addonName.value;
  database.lookupAddon(name, res, getAddonCallback);
}

function getAddonCallback(err, res, results) {
  if (err) {
    console.error('Error in addons#getAddonCallback: ' + err);
    return res.status(500).json('An error occurred while fetching the addon, sorry.');
  }

  if (!results || results.length === 0) {
    return res.status(404).json('The requested addon could not be found.');
  }

  var addon = results[0];
  delete addon['_id'];
  res.json(addon);
}

function createAddon(req, res) {
  var name = req.swagger.params.addonName.value;
  var curseForgeUrl = req.swagger.params.urls.value.curseForgeUrl;
  var wowInterfaceUrl = req.swagger.params.urls.value.wowInterfaceUrl;
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
  database.lookupDownloadsForAddon(name, res, getDownloadsForAddonCallback);
}

function getDownloadsForAddonCallback(err, res, addonName, results) {
  if (err) {
    console.error('Error in addons#getDownloadsForAddonCallback: ' + err);
    return res.status(500).json('An error occurred while fetching the addon download count, sorry.');
  }

  if (!results || results.length === 0) {
    return res.status(404).json('No results were found for the addon download count, sorry.');
  }

  var counts = results.map(function (results) {
    return {
      count: results.count,
      timestamp: results.timestamp
    }
  });

  res.json({addonName: addonName, downloads: counts});
}

function addDownloadsForAddon(req, res) {
  var name = req.swagger.params.addonName.value;
  var count = req.swagger.params.downloads.value.count;
  var timestamp = new Date();
  database.newDownloadCountForAddon(name, count, timestamp, res, addDownloadsForAddonCallback);
}

function addDownloadsForAddonCallback(err, res, name, count, timestamp, results) {
  if (err) {
    console.error('Error in addons#addDownloadsForAddonCallback: ' + err);
    return res.status(500).json(util.format(
      'An error occurred while posting download counts for %s, sorry.',
      name));
  }
  var output = {
    addonName: name,
    count: count,
    timestamp: timestamp
  };
  res.json(output);
}
