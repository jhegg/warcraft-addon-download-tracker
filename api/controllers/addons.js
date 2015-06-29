'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 http://www.w3schools.com/js/js_strict.asp
*/

var util = require('util');

module.exports = {
  getAddons: getAddons,
  getAddon: getAddon,
  createAddon: createAddon,
  getDownloadsForAddon: getDownloadsForAddon,
  addDownloadsForAddon: addDownloadsForAddon
};

function getAddons(req, res) {
  // Get all addon names
  var addons = ['addon1', 'addon2'];
  res.json(addons);
}

function getAddon(req, res) {
  var name = req.swagger.params.addonName.value;
  // lookup addon by 'name'
  var addon = {addonName: name, curseForgeUrl: 'foo', wowInterfaceUrl: 'bar'}
  res.json(addon);
}

function createAddon(req, res) {
  var name = req.swagger.params.addonName.value;
  var curseForgeUrl = req.swagger.params.urls.value.curseForgeUrl;
  var wowInterfaceUrl = req.swagger.params.urls.value.wowInterfaceUrl;
  // create 'name'
  var addon = {addonName: name, curseForgeUrl: curseForgeUrl, wowInterfaceUrl: wowInterfaceUrl};
  res.json(addon);
}

function getDownloadsForAddon(req, res) {
  var name = req.swagger.params.addonName.value;
  var downloads = [];
  // lookup addon downloads by 'name'
  downloads.push({count: 1, timestamp: new Date()});
  downloads.push({count: 2, timestamp: new Date()});
  downloads.push({count: 3, timestamp: new Date()});
  var downloadsObject = {addonName: name, downloads: downloads};
  res.json(downloadsObject);
}

function addDownloadsForAddon(req, res) {
  var name = req.swagger.params.addonName.value;
  // lookup addon by 'name'
  var count = req.swagger.params.downloads.value.count;
  var timestamp = new Date();
  // insert count and timestamp for addon
  res.json(util.format('Inserted download count of \'%d\' for addon \'%s\'', count, name));
}
