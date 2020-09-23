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
  "failed": 3
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
  constructor(path) {
    this.method = "GET"
    this.baseUrl = process.env.VUE_APP_API_BASE_URL;
    this.port = PORTS[SSL.on];
    this.path = path;
    this.status = STATUS.idle;
    this.headers = {};
    this.body = {};
    this.ssl = SSL.on;
    this.responseFormat = RESPONSE_TYPES.json;
    this.errors = [];
  }

  send(cb) {
    this.request = PROTOCOLS[this.ssl].request(this._buildOpts(), (res) => this._call(res, cb));
    if (this.body) this.request.write(JSON.stringify(this.body), (err) => {
      if (err) console.log(err)
    });
    if (this.status === STATUS.failed) setTimeout(this.send(), 1000);
    this.request.end();
    return this.response;
  }

  setBaseUrl(url) {
    if (url.match(/(?=https?)/)) {
      url = url.split('//')[1]
    }

    if (url.match(/(?=\/)/)) {
      url = url.split('/')[0]
    }

    this.baseUrl = url;
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
        this.method = method
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

  setFormParam(key, value) {
    this.form.set(key, value)
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
      path: this.path,
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

      this.response = this.responseFormat(buf)
      if (cb) cb(this.response);
    })
  }
}

module.exports = Request;