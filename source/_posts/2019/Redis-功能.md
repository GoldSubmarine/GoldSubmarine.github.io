---
title: Redis-常用功能
date: 2019-06-05 22:43:54
tags: redis
---

## 慢查询

如果一条命令执行的过慢，就会被标记成慢查询，记录到redis的一个队列（相当于log日志），这个队列的长度是固定的，先进先出，只保存在内存中，重启后就丢失了。

两个配置：

- slowlog-max-len    # 慢查询的队列长度为100
- slowlog-log-slower-than   # 慢查询的时间阈值（单位微秒）这里是10毫秒，如果为0则记录所有的命令，如果为<0,则不记录任何命令

```bash
132.232.40.53:6379> config get slowlog-max-len      # 默认队列长度为128
1) "slowlog-max-len"
2) "128"
132.232.40.53:6379> config get slowlog-log-slower-than      # 默认时间为10毫秒，超过10毫秒则标记为慢查询
1) "slowlog-log-slower-than"
2) "10000"
```

两种修改配置的方法：

- 修改配置文件重启
- 这两个配置支持动态配置，例如：`config set slowlog-max-len 1000`

```bash
slowlog get [n]     # 获取慢查询队列的前n个命令
slowlog len         # 获取慢查询队列的长度
slowlog reset       # 清空慢查询队列
```

经验：

- slowlog-max-len 不要设置的过大，默认10ms，通常超过1ms就对性能产生了影响，所以通常设置为1ms
- slowlog-log-slower-than 不要设置的太小，通常设置为1000左右，便于数据分析，防止数据溢出
- 定期做慢查询的持久化

## 流水线 pipeline

redis 中，**1次网络传输时间 + 1次命令时间 = 1次请求时间**。因为redis的执行很快，而网络传输很慢，所以可以将一堆命令进行打包，一次性传输到redis服务器，执行完成后，redis将结果集按顺序排列好，一次性返回给客户端。这就是pipeline

例如要写入10000条数据，但是redis没有 hmset 命令，可以使用pipline，以下为java中的实现：

```java
Jedis jedis = new Jedis("127.0.0.1", 6379);
for (int i = 0; i < 10000; i++) {
    jedis.hset("hashKey:" + i, "field" + i, "value" + i);
}
```

循环执行一万次大概需要50秒

```java
Jedis jedis = new Jedis("127.0.0.1", 6379);
for (int i = 0; i < 100; i++) {
    Pipeline pipeline = jedis.pipelined();
    for (int j = i*100; j < (i+1)*100; j++) {
        pipeline.hset("hashkey:" + j, "field" + j, "value" + j);
    }
    pipeline.syncAndReturnAll();
}
```

用 pipeline 一次性打包100条操作发送给redis，最后插入10000条数据只要0.7秒

注意：

- mset操作时redis原生提供的，具有原子性，而pipeline没有原子性
- 注意每次pipeline携带的数据量，不要过大
- pipeline每次只能作用在一个redis节点上，注意在集群中的使用

## 发布订阅

```bash
132.232.40.53:6379> subscribe sohu:tv       # client 订阅一个 channel
Reading messages... (press Ctrl-C to quit)
1) "subscribe"
2) "sohu:tv"
3) (integer) 1

132.232.40.53:6379> publish sohu:tv "tv1"    # server 发布一个消息，返回值为订阅的client个数
(integer) 1

132.232.40.53:6379> subscribe sohu:tv       # 此时的 client 控制台显示出 tv1
Reading messages... (press Ctrl-C to quit)
1) "subscribe"
2) "sohu:tv"
3) (integer) 1
1) "message"
2) "sohu:tv"
3) "tv1"

132.232.40.53:6379> unsubscribe sohu:tv     # client 取消订阅 channel
132.232.40.53:6379> psubscribe so*           # 按正则匹配 channel，然后订阅
```

发布订阅和消息队列的区别： 发布以后所有订阅者都可以收到消息，而消息队列中，一条消息只能被一个订阅者消费。
