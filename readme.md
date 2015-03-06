imitate
=========

[![Build Status](https://travis-ci.org/workivate/imitate.svg)](https://travis-ci.org/workivate/imitate)

`imitate` is a REST API mocking tool. It offers a simple workflow for:

- Proxying an existing API;
- Caching requests into a persistent file;
- Using that file to stub the real API.

`imitate` is useful for end-to-end testing, offline development, and other situations where you want to access a close (but no cigar) copy of your real REST API. It is agnostic to your choice of backend or frontend.

Installation
============

Install it like any other node package, if using inside a project:

```bash
$ npm install imitate
```

To use the command-line API (coming soon), install it globally:

```bash
$ npm install -g imitate
```

Usage
=====

### Node API

#### proxyServer

To instantiate a proxyServer:

```javascript
var proxyServer = require('imitate').proxyServer;

var proxy = proxyServer({
  output: 'endpoints.json',
  url: 'https://api.github.com/',
});
```

This will start a proxyServer on `http://localhost:4000`, which will return the results from pinging https://api.github.com/ while also writing them in a file called 'endpoints.json' in the current working directory. See below for additional options.

You can stop it like any other `express` server:

```javascript
proxy.close(/* callback */);
```

#### mockServer

To instantiate a mockServer:

```javascript
var mockServer = require('imitate').mockServer;

var mock = mockServer({
  input: 'endpoints.json',
});
```

This will start a mockServer on `http://localhost:4000`, which will use `endpoints.json` to imitate all the previously stored endpoints. See below for additional options.

You can stop it like any other `express` server:

```javascript
mock.close(/* callback */);
```

### Command-line API

Coming soon!

Options
=======

### proxyServer

You can start a `proxyServer` with the following options:

```javascript
var proxyServer = require('imitate').proxyServer;

var proxy = proxyServer({
  // Mandatory parameters.
  url: 'https://api.github.com/', // URL to proxy.

  // Optional parameters. The values specified here are the defaults.
  port: 4000, // Port on which to start the server.
  host: 'localhost', // Hostname for the server.
  output: 'endpoints.json', // Output file in which the responses will be cached.
  silent: false, // Pass in 'true' to silence console.logs.
});
```

### mockServer

You can start a `mockServer` with the following options:

```javascript
var mockServer = require('imitate').mockServer;

var proxy = mockServer({
  // All optional parameters. The values specified here are the defaults.
  port: 4000, // Port on which to start the server.
  host: 'localhost', // Hostname for the server.
  input: 'endpoints.json', // Input file containing the cached responses.
  silent: false, // Pass in 'true' to silence console.logs.
});
```

License
=======

MIT.
