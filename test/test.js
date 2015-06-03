'use strict';
var fs = require('fs');
var assert = require('assert');

var _ = require('lodash');
var request = require('request');
var imitate = require('../index.js');

describe('imitate package', function() {
  it('should expose proxyServer', function() {
    assert.notEqual(imitate.proxyServer, undefined);
  });
  it('should expose mockServer', function() {
    assert.notEqual(imitate.mockServer, undefined);
  });
});

describe('proxyServer', function() {
  var proxyServer;

  before(function() {
    // Start a dummy API that our tests will be pinging.
    require('./mock/api.js');
    proxyServer = imitate.proxyServer;
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

  describe('logging', function() {
    var serverInstance;
    var PORT = 4001;
    var HOST = 'localhost';
    var OUTPUT = './endpoints.json.tmp';
    var baseUrl = 'http://' + HOST + ':' + PORT;
    var targetUrl = 'http://' + HOST + ':3000';
    var options = {
      port: PORT,
      host: HOST,
      output: OUTPUT,
      url: targetUrl,
      silent: false
    };

    before(function() {
      serverInstance = proxyServer(options);
    });

    it('should log proxying GET /', function(done) {
      var expectedResponse = JSON.stringify({
        hello: 'world',
      });

      request(baseUrl, function(error, response, body) {
        assert.equal(body, expectedResponse);
        done();
      });
    });

    it('should log proxying POST /', function(done) {
      var expectedResponse = JSON.stringify({
        hello: 'world',
      });

      request(
        {url: baseUrl,
        method: 'POST',
        form: {hello: 'world'}
      }, function(error, response, body) {
        assert.equal(body, expectedResponse);
        done();
      });
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

    it('should proxy POST /', function(done) {
      var expectedResponse = JSON.stringify({
        hello: 'world',
      });

      request({
        url: baseUrl,
        method: 'POST',
        form: {hello: 'world'}
      }, function(error, response, body) {
        assert.equal(body, expectedResponse);
        done();
      });
    });

    it('should return 200 on OPTIONS request', function(done) {
      request({
        url: baseUrl,
        method: 'OPTIONS'
      }, function(error, response) {
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('should write correct schema in endpoints.json', function(done) {
      var expectedDataGET = {
        method: 'GET',
        url: '/',
        response: '{"hello":"world"}',
      };

      var expectedDataPOST = {
        method: 'POST',
        url: '/',
        response: '{"hello":"world"}',
      };

      serverInstance.close(function() {
        var content = fs.readFileSync(OUTPUT);
        var data = JSON.parse(content);


        assert.equal(_.keys(data).length, 2);
        assert.deepEqual(data['GET /'], expectedDataGET);
        assert.deepEqual(data['POST /'], expectedDataPOST)
        done();
      });
    });
  });
});

describe('mockServer', function() {
  var mockServer;

  before(function() {
    mockServer = imitate.mockServer;
  });

  describe('regular usage', function() {
    var serverInstance;
    var PORT = 4000;
    var HOST = 'localhost';
    var INPUT = './endpoints.json.tmp';
    var baseUrl = 'http://' + HOST + ':' + PORT;

    before(function() {
      serverInstance = mockServer({
        port: PORT,
        host: HOST,
        input: INPUT,
        silent: true,
      });
    });

    it('should return GET /', function(done) {
      var expectedResponse = JSON.stringify({
        hello: 'world',
      });

      request(baseUrl, function(error, response, body) {
        assert.equal(body, expectedResponse);
        done();
      });
    });

    it('should send 200 on OPTIONS request', function (done) {
      request({
        url: baseUrl,
        method: 'OPTIONS'
      }, function(error, response) {
          assert.equal(response.statusCode, 200);
          done();
      });
    });

    it('should POST to /', function(done) {
      var expectedResponse = JSON.stringify({
        hello: 'world',
      });
      request({
        url: baseUrl,
        method: 'POST',
        data: {hello: 'world'}
      }, function(error, response, body) {
        assert.equal(body, expectedResponse);
        done();
      });
    });

    after(function(done) {
      serverInstance.close(function() { done(); });
    });

  });
  describe('logging', function () {
    var serverInstance;
    var PORT = 4000;
    var HOST = 'localhost';
    var INPUT = './endpoints.json.tmp';
    var baseUrl = 'http://' + HOST + ':' + PORT;

    before(function() {
      serverInstance = mockServer({
        port: PORT,
        host: HOST,
        input: INPUT,
        silent: false
      });
    });

    it('should defining endpoints', function (done) {
      done();
    });

    after(function(done) {
      serverInstance.close(function() { done(); });
    });
  });

  describe('custom headers', function() {
    var serverInstance;
    var PORT = 4000;
    var HOST = 'localhost';
    var INPUT = './endpoints.json.tmp';
    var baseUrl = 'http://' + HOST + ':' + PORT;
    var expectedHeaders = 'My-Special-Snowflake-Headers';

    before(function() {
      serverInstance = mockServer({
        accessControlAllowHeaders: 'My-Special-Snowflake-Headers',
        port: PORT,
        host: HOST,
        input: INPUT,
        silent: true,
      });
    });

    it('should return GET / with custom headers', function(done) {
      request(baseUrl, function(error, response) {
        var headers = response.headers['access-control-allow-headers'];
        assert.equal(headers, expectedHeaders);
        done();
      });
    });

    after(function(done) {
      serverInstance.close(function() { done(); });
    });
  });
});
