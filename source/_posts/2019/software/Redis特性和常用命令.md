---
title: Redis特性和常用命令
date: 2019-05-23 22:36:48
tags: redis
categories: 软件技术
---

### 获取条数

redis内置计数器，复杂度为 O(1)

```bash
# 获取条数
127.0.0.1:6379> dbsize
(integer) 2
```

### 获取key

keys 一般不在生产环境中使用，复杂度为 O(n)，有性能问题，可以用scan或者去遍历从节点，不会对生产环境产生影响

```bash
# keys [pattern]  获取正则匹配的key
127.0.0.1:6379> keys he*
1) "hello"
2) "hehe"
127.0.0.1:6379> keys he[hl]*
1) "hello"
2) "hehe"
127.0.0.1:6379> keys use?
1) "user"
```

### 检查key是否存在

可以使用，复杂度为 O(1)

```bash
127.0.0.1:6379> exists hello
(integer) 1     #存在返回1
127.0.0.1:6379> del hello
(integer) 1
127.0.0.1:6379> exists hello
(integer) 0     #不存在返回0
```

### 删除数据

```bash
127.0.0.1:6379> mset a b c d
OK
127.0.0.1:6379> del a c
(integer) 2     #删除的个数
127.0.0.1:6379> del a
(integer) 0
```

### 过期时间

```bash
127.0.0.1:6379> set hello world
OK
127.0.0.1:6379> expire hello 100    #设置过期时间
(integer) 1
127.0.0.1:6379> ttl hello       #查看过期时间
(integer) 94
127.0.0.1:6379> persist hello   #移除过期时间
(integer) 1
127.0.0.1:6379> ttl hello
(integer) -1        #如果不存在过期时间，返回 -1，如果key不存在，返回 -2
```

### 判断 value 类型

返回类型有6种：string，hash，set，zset，list，none

```bash
127.0.0.1:6379> set a b
OK
127.0.0.1:6379> type a
string
127.0.0.1:6379> sadd c 1 2 3
(integer) 3
127.0.0.1:6379> type c
set
```

## 时间复杂度

命令   | 时间复杂度
:-----:|:------:
keys   |  O(n)
mget   |  O(n)
mset   |  O(n)
dbsize |  O(1)
del    |  O(1)
exists |  O(1)
expire |  O(1)
type   |  O(1)
get    |  O(1)
del    |  O(1)
set    |  O(1)
setnx  |  O(1)
setxx  |  O(1)
incr   |  O(1)
decr   |  O(1)

## 数据结构和内部编码

在不同数据量的情况下，使用不同的内部编码。

![redis-1](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/redis-1.png)

每一条记录内部都有一个 redis-object

![redis-2](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/redis-2.png)

## 单线程

redis 是单线程的，一次只会执行一条命令，同时提交了多条指令，会把指令放到一个队列中，然后依次的执行。

redis 虽然是单线程，但是仍然高性能，因为：

1. 纯内存（主要原因）
2. 异步IO（使用了epoll）
3. 避免线程切换消耗

因为是单线程，一条一条执行，所以要避免使用长（慢）命令，例如：keys, flushall, flushdb, slow lua script, mutil/ecex, operate big value(collection)