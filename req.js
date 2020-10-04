/* eslint-env es6 */
const https = require('https');
const http = require('http');
const { URLSearchParams } = require('url');

const PORTS = [
  "80",
  "443",
]

const PROTOCOLS = [
  http,
  https,
]

const STATUS = {
  "idle": 0,
  "fetching": 1,
  "done": 2,
  "failed": 3,
}

const SSL = {
  "off": 0,
  "on": 1,
}

const RESPONSE_TYPES = {
  "json": (r) => { return JSON.parse(r.toString() || String(r)) },
  "xml": (r) => {  },
  "text": (r) => { return r.toString() || String(r) },
}

class Request {
  constructor(baseUrl) {
    this.method = "GET"
    this.baseUrl = baseUrl;
    this.path = "/";
    this.headers = {};
    this.body = {};
    this.errors = [];
    
    this.ssl = SSL.on;
    this.port = PORTS[SSL.on];
    this.status = STATUS.idle;
    this.responseFormat = RESPONSE_TYPES.json;
  }

  send(cb) {
    this.request = PROTOCOLS[this.ssl].request(this._buildOpts(), (res) => this._call(res, cb));
    if (this.body) this.request.write(JSON.stringify(this.body));
    this.request.end();
  }

  setPath(url) {
    this.path = url;
    return this;
  }

  setPort(port) {
    this.port = port;
    return this;
  }

  // setMethod sets the method on the Request -- it will default to 'GET'
  setMethod(method) {
    switch (method.toUpperCase()) {
      case "GET":
      case "PUT":
      case "POST":
      case "PATCH":
      case "UPDATE":
      case "DELETE":
      case "OPTIONS":
        this.method = method;
        break;
      default:
        break;
    }
    return this;
  }

  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }

  setBody(body) {
    if (body !== Object(body)) this.body === null; 
    this.body = body;
    return this;
  }

  setURLParam(key, value) {
    this.params.append(key, value)
    return this;
  }

  setResponseFormat(format) {
    if (RESPONSE_TYPES[format]) {
      this.responseFormat = RESPONSE_TYPES[format];
    }

    return this;
  }

  setSsl(bool) {
    if (bool !== Boolean(bool)) return;
    this.ssl = bool ? SSL.on : SSL.off;
    return this;
  }

  _buildOpts() {
    return {
      headers: this.headers,
      host: this.baseUrl,
      port: this.port,
      path: this.path,
      method: this.method,
      path: (!this.params ? this.path : this.path + "?" + this.params),
      protocol: ( this.ssl ? "https:" : "http:" ),
    }
  }

  _call(response, cb) {
    let data = [];
    let length = 0;

    response.on('data', (d) => {
      if (this.status !== STATUS.fetching) this.status = STATUS.fetching;
      data.push(d);
      length += d.length;
    })

    response.on('error', (e) => {
      this.errors = this.errors.push(e);
      console.log(e.toString());
    })

    response.on('end', () => {
      this.status = STATUS.done;
      let buf = Buffer.alloc(length);

      for (let i = 0, pos = 0; i < data.length; i++) {
        data[i].copy(buf, pos);
        pos += data[i].length;
      }

      this.status = STATUS.failed;
      this.response = this.responseFormat(buf)
      if (cb) cb({ 
        status: response.statusCode, 
        response: this.response,
      });
    })
  }

  _retry() {
    setTimeout(this.send, 1000); 
  }
}

module.exports = Request;