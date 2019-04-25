---
title: RabbitMQ-Cluster
date: 2019-04-25 23:26:00
tags: rabbitmq
---

## 主备模式

主备模式和主从模式的区别：

- 主备模式有一个主节点，多个从节点，主节点可以读和写，从节点不可读写，如果主节点宕机了，从节点变为主节点。推荐在并发不高的情况下使用，模型简单好用。
- 主从模式有一个主节点，多个从节点，主节点可以读和写，从节点可以读，但是不能写，主节点宕机了，从节点变为主节点。

## 远程模式

远距离通信和复制，简称Shovel模式，就是我们可以跨地域的让两个mq集群互联，不常用，了解即可。

## 镜像模式

保证数据100%不丢失，在实际工作中也是用的最多的，并且实现集群也非常简单，一般的大厂都是使用镜像模式，主要目的就是数据的高可靠性保障，一般来说3个节点就能保障100%的数据可靠性。3个节点的数据是完全备份的。

![RabbitMQ](/images/2019/RabbitMQ-cluster-mirror.png)

## 多活模式

是实现异地数据复制的主流模式，因为远程模式比较复杂，所以异地数据一般使用双活或多活的模式来实现。这种模式需要依靠rabbitmq的federation插件，可以实现持续的可靠的AMQP数据通信，多活模式在实际的配置和应用都非常简单。

采用多中心的模式，更好的保障了数据的安全，每个中心部署一套集群，各中心的MQ除了为业务提供正常的消息服务，中心之间还需要实现部分消息共享

![RabbitMQ](/images/2019/RabbitMQ-cluster-duohuo1.png)

federation插件是一个不需要cluster，而在Brokers之间传输消息的高性能插件，federation插件可以在Brokers或者cluster之间传输消息，连接的双方可以使用不同的users和virtual hosts，双方也可以使用不同的RabbitMQ和Erlang版本。federation插件使用AMQP协议通信，可以接收不连续的传输

![RabbitMQ](/images/2019/RabbitMQ-cluster-federation.png)

满足routingkey的会被路由到另一个Broker上