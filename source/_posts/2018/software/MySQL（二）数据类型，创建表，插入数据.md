---
title: MySQL数据类型与操作数据表
date: 2018-03-16 00:15:12
tags: database
categories: 软件技术
---

## 数据类型

### 数字类型

![数字类型](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/numberType.png)

### 日期和时间

![dateAndTimeType](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/dateAndTimeType.png)

### 字符

![字符类型](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/stringType.png)

## 一些操作

```sql
SHOW DATABASES;  //显示所有的数据库
USE test1;  //使用test1数据库
SELECT DATABASE();  //显示已经打开的数据库
CREATE TABLE IF NOT EXISTS table1(
    username VARCHAR(20) NULL,
    age TINYINT UNSIGNED,   //无符号
    salary FLOAT(8,2) UNSIGNED NOT NULL //不能为空
);
SHOW TABLES;
SHOW TABLES FROM mysql; //展示mysql中所有的表
SHOW COLUMNS FROM table1;   //展示table1表格中所有的列的信息
INSERT table1 VALUES('Tom',25,7865.23); //插入一条完整的数据，如果参数不全，则会报错
INSERT table1(username,salary) VALUES('john',4500.69);  //插入一条数据，但只有两个参数
SELECT * FROM table1;   //选择表中所有的数据

CREATE TABLE table2(
    id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, //设置主键，并且自动增长
    username VARCHAR(30) NOT NULL UNIQUE KEY,    //约束为唯一
    sex ENUM(1,2,3) DEFAULT 3  //设置默认值
);

```