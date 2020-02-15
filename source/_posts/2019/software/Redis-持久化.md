---
title: Redis-持久化
date: 2019-06-08 15:21:26
tags: redis
categories: 软件技术
---

redis所有的数据都在内存中，持久化就是将数据异步的保存到磁盘中

持久化的两种方式：

- 快照，将当前节点的数据保存一份（例如：Mysql Dump，Redis RDB）
- 写日志（例如：Mysql Binlog，Hbase Hlog，Redis AOF）

## RDB

将数据以**快照**的方式存储到磁盘中。redis将文件压缩成二进制文件。

保存到磁盘的3种方式：

1. save命令（同步）
   - 生成一个临时的文件，然后替换老的RDB文件

2. bgsave（异步）
   - 使用Linux的fork()函数，生成一个redis的子进程，用于保存数据，阻塞发生在fork阶段，fork的过程很快，并且有内存的消耗
   - Linux的fork()函数会把原来的进程的所有值都复制到新的进程中，只有少数值与原来的进程的值不同。相当于克隆了一个自己。redis并没有完全拷贝所有内存，而是采用了copy-on-write的策略
3. 自动
   - 满足，60秒内有10000次操作，或300秒内有10次操作，或900内有一次操作，满足任一条件，就调用bgsave
   - 缺点是过于频繁，会生成太多RDB文件

最佳配置：

```bash
# save 900 1        # 不开启自动保存
# save 300 10       # 不开启自动保存
# save 60 10000     # 不开启自动保存
dbfilename dump-${port}.rdb     # 文件名加上端口号，因为redis是单线程的，所以一台机器上会启动多个redis来利用多核的资源
dir /bigdiskpath        # 存储到硬盘较大的目录
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
```

缺点：

- 耗时，耗内存，cpu，IO
- 不可控，数据丢失

## AOF

数据以**日志**的形式存储数据，先将每一条操作放入到缓存区中，再采用一定的策略将缓冲区的内容同步到磁盘中。

AOF的三种策略：

- always，将每一条命令先放入缓冲区，再立即同步到磁盘中，优点是不丢失数据，缺点是IO开销
- everysec，每秒钟同步一次，将缓冲区的数据写入到磁盘（redis默认值），优点没有IO开销，缺点是会丢失一秒钟的数据
- no，由操作系统决定什么时候同步

重写：

随着时间的推移，AOF文件的体积变得越来越大，恢复和写入速度变慢，redis提供了日志重写，将无用的日志去除，减小磁盘占用，加快恢复速度。

例如：对hello进行多次赋值，重写后只保留最后一条赋值的操作；数字多次增加，只保留最后数字的值；过期数据直接忽略；多次rpush合并为一次rpush操作...

两种实现方式：

1. bgrewriteaof命令，fork出子进程用于重写，并不是去分析旧的日志，而是直接将内存中的数据写入AOF文件
2. 自动配置
   - `auto-aof-rewrite-min-size`，指定AOF文件占用多大空间时进行重写
   - `auto-aof-rewrite-percentage`，增长率，例如设置增长率为100%，目前重写完是100M，那么增长到200M时，再进行一次重写
   - `aof_current_size`，AOF当前尺寸（单位字节），内置的统计变量，不需要配置
   - `aof_base_size`，AOF上次启动和重写的尺寸（单位字节），内置的统计变量，不需要配置

最佳配置：

```bash
appenfonly yes  # 支持动态变化`config set appendonly yes`
appendfilename "appendonly-${port}.aof"
appendfsync everysec
dir /bigdiskpath
no-appendfsync-on-rewrite yes   # 重写的时候，停止本来的AOF追加，因为如果此时操作量大，磁盘IO资源就会紧张，缺点是没有追加，如果重写失败，原先的AOF又没有追加，数据就会丢失
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

## 对比

命令|RDB|AOF
:--:|:--:|:--:
启动优先级|低|高
体积|小|大
恢复速度|快|慢
数据安全性|丢数据|根据策略决定
轻重|重|轻

## 最佳策略

- 小分片，redis因为单线程，实际生产中都是单机多实例，通过`max-memory`给每个实例设置一个较小的内存，例如4G，这样每次持久化的时候，消耗较小，不集中。
- 预留40%的空余内存用于持久化，内存不足会引发数据丢失和一系列奇怪问题。
