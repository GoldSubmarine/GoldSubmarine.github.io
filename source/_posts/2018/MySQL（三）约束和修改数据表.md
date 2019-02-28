---
title: MySQL约束和修改数据表
date: 2018-03-18 00:15:12
tags: database
---

## 约束

### 类型

```sql
NOT NULL    //非空约束
PRIMARY KEY     //主键约束
UNIQUE KEY      //唯一约束
DEFAULT     //默认约束
FOREIGN KEY     //外键约束
```

### 设置外键

1. 数据表的存储引擎只能为InnoDB
2. 外键列和参照列必须具有相似的数据类型
3. 外键列和参照列必须创建索引，如果外键列不存在索引的话，MySQL将自动的创建索引。

```sql
CREATE TABLE provinces(
    id SMALLINT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    pname VARCHAR(30)
)
CREATE TABLE user(
    id SMALLINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(30) NOT NULL,
    pid SMALLINT NOT NULL UNSIGNED,     //pid和provinces表的id的结构需要一致，不一致会报错
    FOREIGN KEY(pid) REFERENCES provinces(id)
)

SHOW INDEXES FROM user\G;   /展示拥有索引的字段
```