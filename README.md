# warcraft-addon-download-tracker

[![Build Status](https://travis-ci.org/jhegg/warcraft-addon-download-tracker.svg?branch=master)](https://travis-ci.org/jhegg/warcraft-addon-download-tracker) [![Coverage Status](https://coveralls.io/repos/jhegg/warcraft-addon-download-tracker/badge.svg?branch=master)](https://coveralls.io/r/jhegg/warcraft-addon-download-tracker?branch=master)

This project allows authors of World of Warcraft addons to track their download counts across both WoWInterface and CurseForge. It uses Node.JS and Swagger to expose a REST API for posting and reading data, as well as an example downloads-over-time chart using NVD3.

## Example usage steps

1. Run this app on Heroku (or your favorite hosting provider that supports Node.JS).
  * Note: requires MongoDB.
2. Use [jhegg/addon-download-count-updater](https://github.com/jhegg/addon-download-count-updater) to fetch download counts for one or more addons, and post the results to your Heroku app's REST API. Be sure to schedule the updater to run once a day, using a cron job or scheduled task.
3. View the results at the provided index page, which very well needs to be tweaked depending on how many addons you have. Here's an example for mine: https://boxing-marks-7365.herokuapp.com/

## Requirements

* NodeJS v0.12 or higher
* MongoDB

## Running it locally

1. Install MongoDB, and start it.
2. Fetch the dependencies: `npm install`
2. Set an `API_TOKEN` environment variable, for example `my-secret-token`.
3. Start up the app with auto-reloading of changes: `swagger project start`
4. Open up the swagger live editor for the REST API: `swagger project edit`
