### async query(sql,list)

+ sql: sql语句

+ list: 参数列表

+ ret: 查询结果(array)

```
let res = await query("select * from login where usr=?;",["admin"])
res.length && console.log("success") || console.log("loss")
```

### async login(usr,pwd)

+ usr: 用户名

+ pwd: 密码

+ ret: false || 查询到的第一条记录(json)

```
let res = await login("admin","123")
console.log(res) // { usr: 'admin', pwd: '123', identify: 0 }
```