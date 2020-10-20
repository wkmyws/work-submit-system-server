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

insert into login(usr,pwd,identify,name,class_list) values("teacher1","123",0,"唔西迪",'["sj001","sj002"]');
insert into login(usr,pwd,identify,name,class_list) values("teacher2","123",0,"玛卡巴卡",'["sj003","sj004","sj005"]');
insert into login(usr,pwd,identify,name,class_list) values("181090808","000",1,"史洋炀",'["sj001","sj003","sj005"]');
insert into login(usr,pwd,identify,name,class_list) values("181090804","000",1,"田悦辰",'["sj001","sj002"]');
insert into login(usr,pwd,identify,name,class_list) values("181090806","000",1,"阮荣耀",'["sj001","sj003","sj004"]');
insert into login(usr,pwd,identify,name,class_list) values("181090807","000",1,"邵柯帆",'["sj004","sj005"]');
insert into login(usr,pwd,identify,name,class_list) values("181090809","000",1,"顾玮煜",'["sj002","sj004","sj005"]');
insert into login(usr,pwd,identify,name,class_list) values("181090833","000",1,"龚佳慧",'["sj001","sj002","sj003","sj004","sj005"]');

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
    work_class nvarchar(20),
    work_deadline bigint,
    no int not null auto_increment
);

insert into work(work_code,work_name,work_belong) values("sdwW","first work","admin");
```


```
// 成绩表
/*
	json:{
        usr:{
            score,
            remark,
        }
    }
*/
create table score(
	work_code nvarchar(1000) primary key,
	json nvarchar(10000) default '{}'
);
```