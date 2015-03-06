'use strict';
var fs = require('fs');
var assert = require('assert');

var _ = require('lodash');
var request = require('request');
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
  var proxyServer;

  before(function() {
    // Start a dummy API that our tests will be pinging.
    require('./mock/api.js');
    proxyServer = apiAngel.proxyServer;
  });

  describe('options', function() {
    it('should throw an error if called without options', function(done) {
      try {
        proxyServer();
      } catch (error) {
        done();
      }
    });

    it('should throw an error if called without url', function(done) {
      try {
        proxyServer({
          output: 'endpoints.json',
        });
      } catch (error) {
        done();
      }
    });
  });

  describe('regular usage', function() {
    var serverInstance;
    var PORT = 4000;
    var HOST = 'localhost';
    var OUTPUT = './endpoints.json.tmp';
    var baseUrl = 'http://' + HOST + ':' + PORT;
    var targetUrl = 'http://' + HOST + ':3000';

    before(function() {
      serverInstance = proxyServer({
        port: PORT,
        host: HOST,
        output: OUTPUT,
        silent: true,
        url: targetUrl,
      });
    });

    it('should proxy GET /', function(done) {
      var expectedResponse = JSON.stringify({
        hello: 'world',
      });

      request(baseUrl, function(error, response, body) {
        assert.equal(body, expectedResponse);
        done();
      });
    });

    it('should write correct schema in endpoints.json', function(done) {
      var expectedData = {
        method: 'GET',
        url: '/',
        response: '{"hello":"world"}',
      };

      serverInstance.close(function() {
        var content = fs.readFileSync(OUTPUT);
        var data = JSON.parse(content);

        assert.equal(_.keys(data).length, 1);
        assert.deepEqual(data['GET /'], expectedData);
        done();
      });
    });
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
