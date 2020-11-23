# Req-uaza

## Methods
- setPath(path string) : sets the path for the request, defaults to `/`
- setPort(port int) : sets the port for the request, defaults to `443`
- setMethod(method string) : sets the desired method, defaults to `GET`
- setHeader(key string, value string) : sets a header on the request, defaults to `{ Content-Type: application/json }`
- setBody(body object) : sets the body for the requests, defaults to `{}`
- setURLParam(key string, value string) : sets a url param on the request, defaults to `?`
- setResponseFormat(format string) : sets the desired response format, defaults to `json`
- setSsl(ssl boolean) : sets whether the request is sent over HTTP or HTTPS, defaults to `true`
- send(callback function) : sets a callback after the request finishes receiving the response, defaults to `null` 

## Example POST Request

```javascript
const Request = require('request');
const req = new Request("domain.com");

req.setPort(8080);
req.setMethod("POST");
req.setPath("/api/v2/transactions");
req.setHeader("Authorization", `Bearer ${tok}`);

req.setBody({
  user: "user@example.com",
  filter: {
    before: moment().subtract(1, "year"),
  }
})

req.send(res => console.log(res));
# { message:  "Hello, world" }
```
