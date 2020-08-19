---
title: Mysql优化
date: 2020-05-19 01:27:00
tags: mysql
categories: 软件技术
---

## explain 详解

// todo

## 常见案例

### 类型不匹配

```sql
SELECT * FROM `user` WHERE org_id = 175110
```

如果 org_id 在 user 表中为字符串类型，而查询时使用的数字，结果可以查出来，但不会走索引

### 联合索引乱序

```sql
SELECT * FROM `user` WHERE org_id = 175110 and 1=1 and role_id = 12
```

假设给 role_id 和 org_id 建了联合索引，则上述查询会走索引，mysql 内部做了优化

### limit 性能

```sql
select * from table_name limit 10000,10;
```

mysql在执行上述sql时，先扫描10010行放到内存中，然后抛弃前面 10000 条，返回最后十条

#### 优化一

````sql
select * from table_name where (id >= 10000) limit 10;
```

上述sql，通过主键索引直接找到10000的位置，并往后数10行返回即可，但在实际应用中是这个简单的sql

#### 优化二

```sql
Select * From table_name Where id in (Select id From table_name where ( user = xxx )) limit 10000, 10;

select * from table_name where( user = xxx ) limit 10000,10;
```

第一条sql花费的时间为第二条的三分之一，因为子查询走的时索引，扫描完索引就直接返回了，并没有遍历实际的数据，然后再 in 数据，可以减少实际扫描的数据量

### 字符集不同进行join操作

