// Mocks the API by using a pre-generated endpoints file.
var _ = require('lodash');
var express = require('express');
var endpoints = require('./endpoints.json');

var app = express();

function allowCrossDomain(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}
app.use(allowCrossDomain);

_.each(endpoints, function(endpoint) {
  // TODO: hack, ignore get parameters since express server routing declarations
  // don't like them.
  endpoint.url = endpoint.url.split('?')[0];

  function responseFn(req, res) {
    res.end(endpoint.response);
  }
  console.log('Defining endpoint: ' + endpoint.method + ' ' + endpoint.url);

  switch (endpoint.method) {
    case 'GET':
      app.get(endpoint.url, responseFn);
      break;

    case 'POST':
      app.post(endpoint.url, responseFn);
      break;
  }
});

var server = app.listen(4000, 'localhost');

var invokedFromCLI = (require.main === module);

if (invokedFromCLI) {
  console.log('API mock server listening on http://' + 'localhost' + ':' + 4000);
} else {
  // Invoked from gulp.
  module.exports = server;
}
