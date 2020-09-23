登录数据库
```
mysql -u root -p
```

建立数据库`server`
```
create database server;
use server;
```

创建数据表&&添加测试数据
```
// 登录表
create table login(
    usr nvarchar(50) primary key,
    pwd nvarchar(50) not null,
    identify int
);

insert into login(usr,pwd,identify) values("admin","123",0);
insert into login(usr,pwd,identify) values("user","000",1);

select * from login;
```

```
// 作业表
create table work(
    work_name nvarchar(1000) primary key,
    work_desc nvarchar(3000)
);

insert into work("di yi");
```