'use strict';

var SwaggerExpress = require('swagger-express-mw');
var express = require('express');
var app = express();
module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

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

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 10010;
  app.listen(port);

  console.log('App now listening on port: ' + port);
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