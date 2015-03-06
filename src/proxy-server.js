// Proxies the API and generates an endpoints map.
var fs = require('fs');
var express = require('express');
var request = require('request');

// TODO: Refactor to work with any API endpoint.
var API_URL = 'http://test.com';

var OUTPUT_FILE = './endpoints.json';

var app = express();

var store = {};

// Use all incoming requests.
app.all('*', function(req, res) {
  // Unique-enough key for our store.
  // Example: GET /admin-panel/dashboard/engagement
  var key = req.method + ' ' + req.url;

  // Outgoing url.
  var url = API_URL + req.url;

  // TODO: hack, should not have to request twice.
  req.pipe(request(url)).pipe(res);

  // OPTIONS requests return 200 OK.
  if (req.method === 'OPTIONS') {
    return;
  }

  console.log('Proxying endpoint: ' + key);
  var data = [];
  req.pipe(request(url))
    .on('data', function(buf) {
      // request(url) sends us chunks of data, which we just push into the array.
      data.push(buf.toString());
    })
    .on('end', function() {
      store[key] = {
        method: req.method,
        url: req.url,
        // Join all of our chunks.
        response: data.join(''),
      };
      // Write to the file asynchronously.
      fs.writeFile(OUTPUT_FILE, JSON.stringify(store));
    });
});

app.listen(4000, 'localhost');
console.log('API proxy server listening on http://' + 'localhost' + ':' + 4000);
