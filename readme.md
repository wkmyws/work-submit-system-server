## 项目结构

* /readme

  项目开发文档

* /server

  子服务模块

* /work

  存放上传的作业的文件夹地址

* /public

  静态资源文件夹

  + tmp

    临时下载文件夹

* app.js

  服务器入口

* readme.md

  项目总说明文档

## 服务器接口

> 依次为
>  
> + METHOD ROUTER
> + 【参数】
> + 【返回参数】
> + test
> + 【测试参数】
> + 【测试的返回参数】
> 
> （采用 `rest client` 编写的测试语法）

### POST /login

> 用户身份验证

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
    identify, // 0 为管理员（老师） 1为学生
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

### POST /publish_assignments

> 发布作业

``` 
{
    token, // 登陆后获取的token
    work_name, // 作业名称
    work_desc // 作业说明
}
```

``` 
{
    code, // 状态码
    msg, //状态信息
    token, // 更新后的token
    work_code, // 作业码
}
```

test

``` 
POST http://47.96.235.211:3000/publish_assignments/ HTTP/1.1
content-type: application/json

{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3IiOiJhZG1pbiIsInB3ZCI6IjEyMyIsImlkZW50aWZ5IjowLCJpYXQiOjE2MDA4NzYwMTQsImV4cCI6MTYwMDg3NzgxNH0.hosTJDX_zgoLwzfTYZUmt15KiHYQiD_MslStfGfQ0HY",
    "work_name": "测试1238",
    "work_desc": "描述"
}
```

``` 
HTTP/1.1 200 OK
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 41
Date: Wed, 23 Sep 2020 15:49:16 GMT
Connection: close

{
  "code": 22,
  "msg": "作业名不能重复"
}
```

### POST /delete_assignments

> 删除作业

``` 
{
  token,
  work_code, // 作业码
}
```

``` 
{
  token,
  code,
  msg,
}
```

test

``` 

```

``` 

```

### POST /download_assignments

> 收集作业

``` 
{
  token,
  work_code,// 作业码
}
```

``` 
{
  token,
  code,
  msg,
  download_url, // 作业下载链接
}
```

test

``` 

```

``` 

```

### POST /submit_work

> 提交作业

``` 
{
	token,
	work_code,
	file, // 提交的文件 <file>
}
```

``` 
{
	token,
	code,
	msg
}
```

test

``` 

```

``` 

```



### ~~POST /get_published_assignments_list~~

> 获取当前用户发布的所有作业（作业码+作业名）

```json
{
	token,
}
```

```
{
	token,
	code,
	msg,
	work_list, // 作业列表（数组）：[{work_code,work_name}]
}
```



### ~~POST /get_assignments_detail~~

> 获取作业码对应的详细作业信息

```
{
	token,
	work_code
}
```

```
{
	token,
	code,
	msg,
	work_name,
	work_belong,
	work_desc
}
```

