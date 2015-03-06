'use strict';
var fs = require('fs');
var express = require('express');
var _ = require('lodash');

function mockServer(options) {
  options = options || {};
  var HOST = options.host || 'localhost';
  var PORT = options.PORT || 4000;
  var SILENT = options.silent || false;
  var INPUT = options.input || 'endpoints.json';

  function log(message) {
    if (SILENT) { return; }
    console.log(message);
  }

  var endpoints = JSON.parse(fs.readFileSync(INPUT));

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
    log('Defining endpoint: ' + endpoint.method + ' ' + endpoint.url);

    // TODO: hook up all the different kinds of endpoints.
    switch (endpoint.method) {
      case 'GET':
        app.get(endpoint.url, responseFn);
        break;

      case 'POST':
        app.post(endpoint.url, responseFn);
        break;
    }
  });

  var serverInstance = app.listen(PORT, HOST);

  return serverInstance;
}

module.exports = mockServer;
