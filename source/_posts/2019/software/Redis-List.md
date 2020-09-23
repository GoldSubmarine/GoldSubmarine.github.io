---
title: Redis-List
date: 2019-05-26 20:57:34
tags: redis
categories: 软件技术
---

## List键值结构

![redis-7](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/redis-7.png)
![redis-6](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/redis-6.png)

value 其实就是一个 list ，编程语言中的对 list 的操作，基本都有对应的 redis 操作实现。

## 常用命令

```bash
127.0.0.1:6379> rpush userList u1 u2 u3 u4 u5   # 从右侧插入元素
(integer) 5
127.0.0.1:6379> lpush userList  q1 q2 q3 q4 q5   # 从左侧插入元素
(integer) 10
127.0.0.1:6379> lrange userList 0 -1        # 获取 list 中所有的元素（包含 0 和 -1）
 1) "q5"
 2) "q4"
 3) "q3"
 4) "q2"
 5) "q1"
 6) "u1"
 7) "u2"
 8) "u3"
 9) "u4"
10) "u5"
127.0.0.1:6379> lindex userList -1          # 获取索引为 -1 的元素
"u5"
127.0.0.1:6379> llen userList               # 获取 list 的长度
(integer) 10
127.0.0.1:6379> lset userList -1 u55        # 改
OK
127.0.0.1:6379> linsert userList before u1 redis    # 在 u1 之前插入
(integer) 11
127.0.0.1:6379> linsert userList after u1 redis2    # 在 u1 之后插入
(integer) 12
127.0.0.1:6379> lpop userList       # 从左侧删除
"q5"
127.0.0.1:6379> rpop userList       # 从右侧删除
"u55"
127.0.0.1:6379> lrem userList 4 q3  # 删除最左侧的 4 个元素中值等于 q3 的元素（ 开头的字幕 l 是list的意思，不是 left）
(integer) 1
127.0.0.1:6379> lrem userList -4 q3  # 删除最右侧的 4 个元素中值等于 q3 的元素
(integer) 0
127.0.0.1:6379> lrem userList 0 q3  # 删除 list 中所有值等于 q3 的元素
(integer) 0

127.0.0.1:6379> rpush word a b c d e
(integer) 5
127.0.0.1:6379> ltrim word 1 3      # 只保留索引为 1 到 3 之间的元素
OK
127.0.0.1:6379> lrange word 0 -1
1) "b"
2) "c"
3) "d"
```

## 其余命令

blpop 阻塞的 lpop，可用于实现消息队列的功能

```bash
127.0.0.1:6379> blpop word 20   # 从 word 的左侧弹出一个元素，如果word中有值，立即弹出，如果 word 为空，则最多等待 20 秒钟，加入12秒时有元素插入，则立即弹出并结束当前命令
1) "word"
2) "a"
127.0.0.1:6379> brpop word 20
1) "word"
2) "e"
```