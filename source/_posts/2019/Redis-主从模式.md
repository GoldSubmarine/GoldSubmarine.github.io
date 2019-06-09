---
title: Redis-主从模式
date: 2019-06-09 20:37:37
tags: redis
---

单机的问题：机器故障，容量瓶颈，QPS瓶颈。

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

![全量复制的过程](/images/2019/redis-11.png)

## 部分复制

网络可能发生抖动，重新连接到主节点后，从节点上报自己的runId和offset，主节点判断offset是否在repl_back_buffer中，如果在，则发送这些数据给从节点。如果不在，则重新进行全量复制。

![部分复制的过程](/images/2019/redis-12.png)
