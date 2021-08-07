'use strict';

var express = require('express');
var {initialize} = require('express-openapi');
var http = require('http');
var addons = require('./api/controllers/addons.js');
const app = express();
module.exports = app; // for testing

// need to handle the index page before registering swagger, or swagger
// takes it over
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/static/index.html')
});

var allowedContentType = /^application\/json(?:[\s;]|$)/i;
app.use(function(req, res, next) {
  if (req.method === 'POST' && !allowedContentType.test(req.headers['content-type'])) {
    return res.status(406).json('The only allowed Content-Type is: application/json');
  }
  next();
});

var apiToken = process.env.API_TOKEN;
if (!apiToken) {
  throw new Error('The "API_TOKEN" environment variable must be set!');
}
app.use(function(req, res, next) {
  if (req.method === 'POST' && (req.headers['api-token'] != apiToken)) {
    return res.status(401).json('401 Unauthorized');
  }
  next();
});

initialize({
  app,
  apiDoc: './api/swagger/swagger.yaml',
  dependencies: {
    log: console.log
  },
  operations: addons
});

const server = http.createServer(app);
const PORT = process.env.PORT || 10010;
server.listen(PORT, (err) => {
  if (err) {
    console.error(`server listening error: ${err}`);
  }
  console.info('server started');
});

// catch-all route for static resources
app.use('/', express.static(__dirname + '/static'));

app.use(errorHandler);

// todo: I don't understand why this is necessary for proper error rendering
function errorHandler(err, req, res, next) {
  if (err) {
    res.status(res.statusCode).json(err.message);
  }
}