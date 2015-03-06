/* global before */
'use strict';
var assert = require('assert');
var apiAngel = require('../index.js');

describe('apiAngel package', function() {
  it('should expose proxyServer', function() {
    assert.notEqual(apiAngel.proxyServer, undefined);
  });
  it('should expose mockServer', function() {
    assert.notEqual(apiAngel.mockServer, undefined);
  });
});

describe('proxyServer', function() {
  var apiServer;

  before(function() {
    apiServer = apiAngel.proxyServer;
  });

  it('should expose .listen method', function() {
    assert.notEqual(apiServer.listen, undefined);
  });
});

describe('mockServer', function() {
  var mockServer;

  before(function() {
    mockServer = apiAngel.mockServer;
  });

  it('should expose .listen method', function() {
    assert.notEqual(mockServer.listen, undefined);
  });
});
