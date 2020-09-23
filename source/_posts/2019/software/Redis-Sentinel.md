---
title: Redis-Sentinel
date: 2019-06-12 22:47:47
tags: redis
categories: 软件技术
---

Redis Sentinel是用于监控redis主从复制的节点

1. 客户端连接到 Sentinel，Sentinel告诉客户端哪个节点是主节点
2. 一旦 Sentinel 发现主节点出现了故障，就从从节点中选出一个新的主节点发送给客户端
3. 同时其他的从节点都会去复制这个新的主节点
4. 最后 Sentinel 仍然会监控那个宕机的主节点，一旦它恢复了正常，它就会作为一个从节点加入到当前的主从复制中。

Redis Sentinel本身就是高可用的，由多个Redis Sentinel进程组成，相当于Eureka，并且可以使用一套Sentinel监控多套主从复制。

## 主从模式

复制一份主节点(master)的数据到从节点(slave)。
一个master可以有多个slave，一个slave只能有一个master。
数据流时单向的，只能master到slave。

优点：

- 数据副本，，在主节点宕机后，可以启用从节点，从而达到高可用。
- 一主多从，主节点只负责写入，多个从节点负责读取，实现流量的分流。

命令行操作的方式：

```bash
slave 127.0.0.1 6379        # 将自己作为从节点，复制6379的数据，该命令立即返回ok，是异步的操作，同步的第一步是先清除自己所有的数据
slaveof no one      # 取消复制，自己不再是从节点，但是之前复制来的数据不会清空，只是切断了和主节点之间的连接
info replication    # 显示当前节点的一些信息
```

修改配置的方式：

```bash
slaveof 192.168.2.16 6379   # 自己作为192.168.2.16的从节点
slave-read-only yes     # 从节点必须只读，因为数据流是单向的，所以从节点写入数据后主节点不知道
```

## 全量复制

每个redis-server启动或重启后都有一个唯一的run_id，可以通过命令`redis-cli info`命令可以找到这个id。第一次从节点连接主节点或者主节点重启后run_id发生了变化时，会进行全量复制，
repl_back_buffer 是用来缓存主节点的操作，默认大小为1M，满了则溢出。
offset 是用来判断主从节点的数据库状态是否一致，通过命令`redis-cli info`可以看到`master_repl_offset`和slave0的`offset`一致

![redis-11](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/redis-11.png)

## 部分复制

网络可能发生抖动，重新连接到主节点后，从节点上报自己的runId和offset，主节点判断offset是否在repl_back_buffer中，如果在，则发送这些数据给从节点。如果不在，则重新进行全量复制。

![redis-12](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/redis-12.png)
