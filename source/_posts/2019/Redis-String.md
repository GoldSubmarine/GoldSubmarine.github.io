---
title: Redis-String
date: 2019-05-24 01:12:16
tags: redis
---

## 常用命令

字符串增删改查, value不能大于 512M

```bash
127.0.0.1:6379> set user qwer   # 写入值
OK
127.0.0.1:6379> set user asdf   # 覆盖qwer
OK
127.0.0.1:6379> get user   # 获取user
"asdf"
127.0.0.1:6379> del user   # 删除user
1
127.0.0.1:6379> get user   # 返回空（nil）
(nil)
127.0.0.1:6379> mset hello world java best php good     # 批量设值
OK
127.0.0.1:6379> mget hello java php     # 批量获取
1) "world"
2) "best"
3) "good"
```

```bash
set key value   #无论key存不存在，都设置value
setnx key value   #key不存在，才设置value
set key value xx   #key存在，才设置value，结尾就是xx，语法很奇怪
set key 9 value     #设置key的值为value，过期时间为9秒，原子操作，分布式锁
```

## 缓存

```java
public UserInfo get(long id) {
    UserInfo userInfo;
    String redisKey = redisPrefix + id;
    if(redis.get(redisKey) != null) {
        userInfo = unserialize(redis.get(redisKey));
    } else {
        userInfo = mysql.get(id);
        if(userInfo != null) redis.set(redisKey, serialize(userInfo));
    }
    return userInfo;
}
```

## 计数

```bash
127.0.0.1:6379> incr num    # 如果key不存在，就创建key，并设置默认值为 0 ，然后自增为 1
(integer) 1
127.0.0.1:6379> decr num    # 自减
(integer) 0
127.0.0.1:6379> incrby num 4    # 加 4
(integer) 4
127.0.0.1:6379> decrby num 2    # 减 2
(integer) 2
127.0.0.1:6379> get num     # 最后获取的都是字符串，而不是数字
"2"
```

## 分布式id生成器

因为redis是单线程，操作具有原子性，所以多个java线程并发的从redis中取自增的id时，不会产生冲突。

## 其余命令

```bash
127.0.0.1:6379> set num aa
OK
127.0.0.1:6379> getset num bb       # 给num设置一个新的值bb，并将旧的值aa返回
"aa"
127.0.0.1:6379> append num cc       # 在num原有值bb后追加字符cc，返回值为字符长度
(integer) 4
127.0.0.1:6379> get num             # 查看num，此时值为追加后的值bbcc
"bbcc"
127.0.0.1:6379> strlen num          # 计算数字长度（注意中文，utf-8中，一个中文占用2个字节） O(1)的复杂度，会缓存字符长度
(integer) 4
```

```bash
127.0.0.1:6379> incrbyfloat money 3.5   # 浮点数计算
"3.5"
127.0.0.1:6379> set name abcdef
OK
127.0.0.1:6379> getrange name 1 3       # 获取索引为1-3之间的字符
"bcd"
127.0.0.1:6379> setrange name 1 qqq     # 设置索引从1开始，替换后续的字符
(integer) 6
127.0.0.1:6379> get name                # 查看提花后的值
"aqqqef"
```