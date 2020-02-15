---
title: Redis-Zset
date: 2019-05-28 00:44:45
tags: redis
categories: 软件技术
---

## Zset键值结构

![redis-9](/images/2019/redis-9.png)

Zset 结构是有序的，value 不能重复，score 代表分值的一个排序，可以根据分值来排序或者取一定分值范围内的元素。

## 常用命令

```bash
127.0.0.1:6379> zadd maths 100 abcd      # 增加，100为 score
(integer) 1
127.0.0.1:6379> zadd maths 100 asdf     # score 可以相同，相当于两个人数学都考了100分
(integer) 1
127.0.0.1:6379> zadd maths 76 qwer
(integer) 1
127.0.0.1:6379> zrem maths asdf         # 删除
(integer) 1
127.0.0.1:6379> zscore maths qwer       # 获取某个值的分数
"76"
127.0.0.1:6379> zincrby maths 5 qwer    # 将元素的分数增加
"81"
127.0.0.1:6379> zcard maths             # 获取集合中元素个数
(integer) 2
127.0.0.1:6379> zrank maths abcd         # 获取排名，从小到大排列，最小的元素为 0
(integer) 1
127.0.0.1:6379> zrange maths 0 -1 withscores    # 根排名范围获取元素，withscores 参数可选
1) "qwer"
2) "81"
3) "abcd"
4) "100"
127.0.0.1:6379> zrangebyscore maths 70 90       # 根据分数范围获取元素
1) "qwer"
127.0.0.1:6379> zcount maths 70 90          # 获取分数范围内元素的个数
(integer) 1
```

## 其他命令

```bash
127.0.0.1:6379> zrevrank maths abcd      # 从高到底的该用户的排名，和zrank相反，同理 zrevrange,zrevrangebyscore
(integer) 0
```

## 总结

![redis-10](/images/2019/redis-10.png)

## 实战

排行榜，热搜榜