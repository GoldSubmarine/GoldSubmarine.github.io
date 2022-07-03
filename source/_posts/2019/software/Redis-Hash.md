---
title: Redis-Hash
date: 2019-05-26 14:32:16
tags: redis
categories: 软件技术
---

## Hash键值结构

![redis-3](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/redis-3.png)

value 其实就是一个 map 结构

## 常用命令

```bash
127.0.0.1:6379> hset user1 name cwj     # 增
(integer) 1
127.0.0.1:6379> hset user1 age 18       # 增
(integer) 1
127.0.0.1:6379> hget user1 name     # 查
"cwj"
127.0.0.1:6379> hset user1 name qwer    # 改
(integer) 0
127.0.0.1:6379> hdel user1 name     # 删
(integer) 1
127.0.0.1:6379> hset user1 name cwj     # 增
(integer) 1
127.0.0.1:6379> hgetall user1       # 查询整个 hash
1) "age"
2) "18"
3) "name"
4) "cwj"
127.0.0.1:6379> hexists user1 name  # 判断属性是否存在
(integer) 1
127.0.0.1:6379> hlen user1      # 有几个属性
(integer) 2
127.0.0.1:6379> hmget user1 name age        # 批量获取
1) "cwj"
2) "18"
127.0.0.1:6379> hmset user1 height 50 sex female    # 批量设置
OK
127.0.0.1:6379> hgetall user1  #获取整个 hash 表
1) "name"
2) "cwj"
3) "age"
4) "18"
5) "height"
6) "50"
7) "sex"
8) "female"
127.0.0.1:6379> hkeys user1     # 获取 hash 表的键
1) "name"
2) "age"
3) "height"
4) "sex"
127.0.0.1:6379> hvals user1     # 获取 hash 表的值
1) "cwj"
2) "18"
3) "50"
4) "female"
```

## 实战

记录每个用户首页的访问量

```bash
127.0.0.1:6379> hincrby user1 pageview 2    # 给 user1 的 pageview 属性加 2
(integer) 2
```

缓存

```java
public VideoInfo get(long id) {
    String redisKey = redisPrefix + id;
    Map<String, String> hashMap = redis.hgetAll(redisKey);
    VideoInfo videoInfo = transferMapToVideo(hashMap);
    if(videoInfo == null) {
        videoInfo = mysql.get(id);
        if(videoInfo != null) {
            redis.hmset(redisKey, transferVideoToMap(videoInfo));
        }
    }
}
```

## 优缺点

![redis-4](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/redis-4.png)

## 其余命令

```bash
127.0.0.1:6379> hsetnx user1 name aaa   # 如果 user1 的 name 已经存在，就会失败
(integer) 0
127.0.0.1:6379> hincrby user1 age 2     # 将 user1 的年龄加 2
(integer) 20
127.0.0.1:6379> hincrbyfloat user1 age 1.3      # 浮点数加法
"21.3"
```

## 复杂度

![redis-5](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/redis-5.png)
