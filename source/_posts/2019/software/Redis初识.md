---
title: Redis初识
date: 2019-05-23 01:07:48
tags: redis
categories: 软件技术
---

## 简介

Redis 是完全开源免费的，遵守BSD协议，是一个高性能的key-value数据库。

Redis 与其他 key - value 缓存产品有以下三个特点：

- Redis支持数据的持久化，可以将内存中的数据保存在磁盘中，重启的时候可以再次加载进行使用。
- Redis不仅仅支持简单的key-value类型的数据，同时还提供list，set，zset，hash等数据结构的存储。
- Redis支持master-slave模式的数据备份。

性能极高 – Redis能读的速度是110000次/s,写的速度是81000次/s。

不依赖外部库，单线程操作简单，原子性读写。

## 下载安装

- [Linux](https://redis.io/)
- [Windows](https://github.com/MSOpenTech/redis/releases)

- [网页练习](http://try.redis.io/)

```bash
$ redis-server  #启动redis服务器
$ redis-cli -h 127.0.0.1 -p 6379    #客户端连接服务器
```

## 数据结构

redis是key-value数据库，其中value可以是下列五种数据类型：

- string（字符串）
- hash（哈希）
- list（列表）
- set（集合）
- zset(sorted set：有序集合)

扩展的数据类型：

- bitmaps（位图）
- HyperLogLog（超小内存唯一值计数）
- GEO（地理信息定位）

## 功能

- 发布订阅
- Lua脚本
- 事务
- pipeline
- 主从复制
- 高可用(v2.8)
- 分布式(v3.0)

## 应用场景

- 缓存
- 计数器（微博的转发数，点赞数，incr命令）
- 消息队列（简单的功能）
- 排行榜（微博热搜）
- 社交网络（粉丝数，关注数，共同关注）
- 实时系统（布隆过滤器，辣鸡邮件）

## 可执行文件

- redis-server（redis服务器）
- redis-cli（redis命令行客户端）
- redis-benchmark（redis性能测试工具）
- redis-check-aof（AOF文件修复工具，断电时损坏文件）
- redis-check-dump（RDB文件检测工具，断电时损坏文件）
- redis-check-sentinel（sentinel服务器，v2.8）

## 返回值

1. 状态回复

    ```bash
    127.0.0.1:6379> ping
    PONG
    127.0.0.1:6379> get hello1
    (nil)
    127.0.0.1:6379> set hello world
    OK
    ```

2. 字符串回复

    ```bash
    127.0.0.1:6379> get hello
    "world"
    ```

3. 错误回复

    ```bash
    127.0.0.1:6379> hget hello field
    (error) WRONGTYPE Operation against a key holding the wrong kind of value
    ```

4. 整数回复

    ```bash
    127.0.0.1:6379> set number 1
    OK
    127.0.0.1:6379> incr number
    (integer) 2
    ```

5. 多行字符串回复

    ```bash
    127.0.0.1:6379> mget hello number
    1) "world2"
    2) "2"
    ```

## 常用配置

- port      //服务器端口
- daemonize     //是否使用守护进程的方式启动（yes|no），如果为yes，输出的日志文件将输出到指定位置
- dir   //工作目录，日志文件，持久化文件存储位置
- logfile   //系统日志文件名