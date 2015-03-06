'use strict';
var fs = require('fs');
var express = require('express');
var request = require('request');

function proxyServer(options) {
  if (!options) {
    throw new Error('proxyServer called without options object.');
  } else {
    if (!options.url) {
      throw new Error('proxyServer called without specifying `url`.');
    }
  }
  var API_URL = options.url;
  var HOST = options.host || 'localhost';
  var PORT = options.port || 4000;
  var SILENT = options.silent || false;
  var OUTPUT = options.output || 'endpoints.json';

  function log(message) {
    if (SILENT) { return; }
    console.log(message);
  }

  var app = express();

  var store = {};

  app.all('*', function(req, res) {
    // Unique-enough key for our store. Example: GET /admin-panel/dashboard/engagement
    var key = req.method + ' ' + req.url;

    var url = API_URL + req.url;

    // TODO: hack, should not have to request twice.
    req.pipe(request(url)).pipe(res);

    // OPTIONS requests return 200 OK.
    if (req.method === 'OPTIONS') {
      return;
    }

    log('Proxying endpoint: ' + key);
    var data = [];
    req.pipe(request(url))
      .on('data', function(buf) {
        data.push(buf.toString());
      })
      .on('end', function() {
        store[key] = {
          method: req.method,
          url: req.url,
          response: data.join(''),
        };
      });
  });

  var serverInstance = app.listen(PORT, HOST);

  serverInstance.on('close', function() {
    fs.writeFileSync(OUTPUT, JSON.stringify(store));
  });

  return serverInstance;
}

module.exports = proxyServer;
