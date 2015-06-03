'use strict';
var express = require('express');

var app = express();

app.get('/', function(req, res) {
  res.send(JSON.stringify({
    hello: 'world',
  }));
});

app.post('/', function(req, res) {
  res.send(JSON.stringify({
    hello: 'world',
  }));
});


app.listen(3000);
