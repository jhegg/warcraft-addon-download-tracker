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
