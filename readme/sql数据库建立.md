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
    identify int,
    name nvarchar(50),
    class_list nvarchar(300)
);

insert into login(usr,pwd,identify) values("admin","123",0);
insert into login(usr,pwd,identify) values("user","000",1);
insert into login(usr,pwd,identify) values("181090808","000",1);
insert into login(usr,pwd,identify) values("181090806","000",1);
insert into login(usr,pwd,identify) values("181090804","000",1);
insert into login(usr,pwd,identify) values("181090807","000",1);
insert into login(usr,pwd,identify) values("181090809","000",1);
insert into login(usr,pwd,identify) values("181090833","000",1);

select * from login;
```




```
// 作业表
/*
    作业码
    作业名
    作业发布者
    作业描述
    作业所属班级
*/
create table work(
    work_code nvarchar(1000) primary key,
    work_name nvarchar(1000) not null,
    work_belong nvarchar(50) references login(usr),
    work_desc nvarchar(3000),
    work_class nvarchar(20)
);

insert into work(work_code,work_name,work_belong) values("sdwW","first work","admin");
```


```
// 成绩表
/*
	usr 外键
	score_list [{work_code,score},...]
*/
create table score(
	usr nvarchar(50) primary key,
	score_list nvarchar(10000)
);
```