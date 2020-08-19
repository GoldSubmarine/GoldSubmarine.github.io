---
title: Redis-Set
date: 2019-05-27 23:14:45
tags: redis
categories: 软件技术
---

## Set键值结构

![redis-8](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/redis-8.png)

Set 结构是无序的，每次获取顺序都不固定

## 常用命令

```bash
127.0.0.1:6379> sadd hobby football     # 增加
(integer) 1
127.0.0.1:6379> sadd hobby football     # 如果已经存在，则添加失败
(integer) 0
127.0.0.1:6379> srem hobby football     # 删除
(integer) 1
127.0.0.1:6379> sadd hobby footbball basketball running     # 批量增加
(integer) 3
127.0.0.1:6379> scard hobby     # 获取属性个数
(integer) 3
127.0.0.1:6379> sismember hobby running     # 判断 running是否存在于集合中
(integer) 1
127.0.0.1:6379> srandmember hobby       # 随机获取一个值
"footbball"
127.0.0.1:6379> spop hobby      # 随机获取一个值，并从集合中删除
"basketball"
127.0.0.1:6379> smembers hobby      # 获取集合中所有的值
1) "running"
2) "footbball"
```

## 集合间命令

```bash
127.0.0.1:6379> sadd num1 1 2 3 4     # 新增两个 set
(integer) 4
127.0.0.1:6379> sadd num2 3 4 5 6
(integer) 4
127.0.0.1:6379> sdiff num1 num2     # 求差集，即 num1 中有，num2 中没有的值
1) "1"
2) "2"
127.0.0.1:6379> sdiff num2 num1     # 差集，即 num2 中有，num1 中没有的值
1) "5"
2) "6"
127.0.0.1:6379> sinter num1 num2    # 交集
1) "3"
2) "4"
127.0.0.1:6379> sunion num1 num2    # 并集
1) "1"
2) "2"
3) "3"
4) "4"
5) "5"
6) "6"
```

## 实战

微博中共同关注的好友