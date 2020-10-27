[![](https://img.shields.io/badge/version-2.0-blue)](https://github.com/wkmyws/work-submit-system-server/releases/tag/2.0)
[![](https://img.shields.io/badge/license-gpl2-orange)](https://github.com/wkmyws/work-submit-system-server/blob/master/LICENSE)
[![](https://img.shields.io/badge/coverage-56%25-brightgreen)](https://github.com/wkmyws/work-submit-system-server/tree/master/%E6%B5%8B%E8%AF%95)
[![](https://img.shields.io/badge/nodejs-12.9.0-yellowgreen)](https://nodejs.org/)
[![](https://img.shields.io/badge/koa-2-green)](https://github.com/koajs/koa)

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
    

* /client

  B端应用

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

``` json
{
    usr,
    pwd,
}
```

``` json
{
    code,// 状态码
    msg, // 状态信息
    token,// code==0时 返回token 和identify
    identify, // 0 为管理员（老师） 1为学生
}
```

### POST /publish_assignments

> 发布作业

``` json
{
    token, // 登陆后获取的token
    work_name, // 作业名称
    work_desc, // 作业说明
    work_deadline, // 截止时间 格式：时间戳
    work_class, // 作业所属班级
}
```

``` json
{
    code, // 状态码
    msg, //状态信息
    token, // 更新后的token
    work_code, // 作业码
}
```

### POST /delete_assignments

> 删除作业

``` json
{
  token,
  work_code, // 作业码
}
```

``` json
{
  token,
  code,
  msg,
}
```

### POST /download_assignments

> 收集作业

``` json
{
  token,
  work_code,// 作业码
}
```

``` json
{
  token,
  code,
  msg,
  download_url, // 作业下载链接
}
```

### POST /submit_work

> 提交作业

``` json
{
    token,
    work_code,
    file, // 提交的文件 <file>
}
```

``` json
{
    token,
    code,
    msg
}
```

### POST /get_published_assignments_list

> 获取当前用户发布的所有作业（作业码+作业名）

``` json
{
    token,
}
```

``` json
{
    token,
    code,
    msg,
    work_list, // 作业列表（数组）：[{work_code,work_name}]
}
```

### POST /get_assignments_detail

> 获取作业码对应的详细作业信息

``` json
{
    token,
    work_code
}
```

``` json
{
    token,
    code,
    msg,
    work_name,
    work_belong,
    work_desc,
    class,
    no,
    work_deadline
}
```

### POST /reset_password

> 修改密码
>  
> admin可以修改自己和任意学生的密码
>
> 学生只能修改自己的密码

``` 
{
	token,
	usr, // 要修改密码的账户名,省缺默认为修改当前账户密码
  newPwd, //新密码
}
```

``` 
{
	token,
	code,
	msg
}
```

### POST /get_class_list

> 获取 学生/老师 所在班级 的数组

``` 
{
	token,
}
```

``` 
{
	token,
	code,
	msg,
	class_list, // class_list 为数组形式,如 ["sj003,"sj004","sj005"]
}
```

### POST /get_assignments_list_by_class

> 获取当前用户所在当前班级的所有作业的数组，按时间顺序排序

``` 
{
	token,
	class,
}
```

``` 
{
	token,
	code,
	msg,
	work_list // 作业列表（数组）：[{work_code,work_name}]
}
```

### POST /preview_assignment

> 预览作业
>
> 学生仅能预览自己的作业
>
> 老师可以预览当前班级任意学生的作业

``` 
{
	token, // 身份鉴别
	work_code, // 作业码
	usr, // 学生可不用填写这个参数，老师必须填写这个参数用以指定预览哪个学生的作业
}
```

``` 
{
	token,
	code,
	msg,
	url 
}
/* 通过
	let previewPage=window.open("");
	previewPage.document.write(html);
	previewPage.focus();
	来打开预览作业页面
*/
```

### POST /get_guy_info

> 获取学生详细信息
>
> 学生仅可获取自己信息
>
> 教师可获取任意学生信息

``` 
{
	token,
	usr, // 学生不填，教师必填
}
```

``` 
{
	token,
	code,
	msg,
	info, // json {usr,identify,class_list,name}
}
```

### POST /grade_assignments

> 打分
>
> 老师通过作业码和学生账户名给学生打分
>  
> 接收一个updateTarget数组批量上传学生分数

``` 
{
	token,
	work_code,
	updateTarget 
}

数据格式：
updateTarget=[
  {usr:"用户1",score:98},
  {usr:"用户2",score:66},
  ......
]
```

``` 
{
	token,
	code,
	msg
}
```

### POST /get_score

> 获取分数
>
> 老师可获取当前班级任意学生指定作业码的分数
>
> 学生仅可查看自己的

``` 
{
	token,
	work_code,
	usr
}
```

``` 
{
	token,
	code,
	msg,
	score_detail
}

score_detail={
  score,
  remark
}

```

### POST /get_stu_usr_by_workcode

> 获取此作业码对应的所有学生账户名称

``` 
{
  token,
  work_code,
}
```

``` 
{
  token,
  code,
  list,
}

// list=["stu1","stu2",...]
```
