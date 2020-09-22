### POST /login

```
{
    usr,
    pwd,
}
```

```
{
    code,// 状态码
    msg, // 状态信息
    token,// code==0时 返回token 和identify
    identify,
}
```

test

```
POST http://47.96.235.211:3000/login/ HTTP/1.1
content-type: application/json

{
    "usr": "user",
    "pwd": "000"
}
```

```
HTTP/1.1 200 OK
my-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3IiOiJ1c2VyIiwicHdkIjoiMDAwIiwiaWRlbnRpZnkiOjEsImlhdCI6MTYwMDc5MDE3M30.olO1UKaSp89egZF6tRDhQTuP9yi2166JlsjqwBsrFO4
Content-Type: application/json; charset=utf-8
Content-Length: 199
Date: Tue, 22 Sep 2020 15:56:13 GMT
Connection: close

{
  "code": 0,
  "msg": "",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3IiOiJ1c2VyIiwicHdkIjoiMDAwIiwiaWRlbnRpZnkiOjEsImlhdCI6MTYwMDc5MDE3M30.olO1UKaSp89egZF6tRDhQTuP9yi2166JlsjqwBsrFO4",
  "identify": 1
}
```