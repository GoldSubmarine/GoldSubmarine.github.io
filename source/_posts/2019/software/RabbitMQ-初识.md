---
title: RabbitMQ-初识
date: 2019-04-06 23:42:45
tags: rabbitmq
categories: 软件技术
---

## 使用场景

系统复杂以后，服务与服务之间经常要互相调用，服务调用有两种方式 RPC 和 MQ ，如果调用方关心执行的结果就用 RPC ，如果调用方不关心结果，就用 MQ。

如果调用方不关心执行结果，仍然使用 RPC，会引发上下游的耦合和瓶颈，设想一个场景，例如“帖子发布”服务，负责公司通用的帖子发布业务。有一些个性化的业务关心“用户发布帖子”这个事件，例如：用户发布帖子后，大数据部门要更新用户的画像，信息质量部门要异步检查帖子是否合规，以及增加积分。

耦合：一旦有新的业务需求要关注这个事件，修改代码的是通用上游服务；一旦下游业务出问题，会影响上游服务；下游业务接口升级，上游服务需要配合升级。

解耦：物理上解耦，上游和下游服务都之和 MQ 建立连接，逻辑上解耦，上游不在关心哪些下游需要订阅消息。

## 主流消息中间件介绍

- ActiveMQ 早期主流的消息中间件，性能不足，目前很少使用。
- Kafka 主要面向大数据方向，性能吞吐量。主要特点是基于 pull 模式来消费消息，0.8 版本开始支持复制，但是不支持事务，对消息的重复、丢失、错误没有严格要求，适合大量数据的收集业务。
- RocketMQ 是阿里开源的消息中间件。具有高性能、高可用、分布式等特点。思路源于 Kafka，但是在可靠传输和事务上做了优化。缺点是运维困难，需要专业的人员维护，商业版是收费的。
- RabbitMQ 是开源的消息队列。基于 AMQP 协议实现，AMQP 的主要特点是面向消息、队列、路由、可靠性。主要是可靠性稳定性，高性能（比不上 Kafka）。

## 初识 RabbitMQ

RabbitMQ 是开源的消息代理和队列服务器。使用 Erlang 语言编写。

优势：

- 开源免费
- 采用轻量级的 AMQP 协议，从而实现了跨平台跨语言
- 提供可靠性消息投递模式、返回模式
- 与 SpringAMQP 完美的整合，API 丰富
- 集群模式吩咐，表达式配置，高可用，镜像队列模型
- 保证数据不丢失的前提做到高可靠性、可用性

Erlang 语言最初用于交换机领域的架构模式，数据交互的性能非常优秀，有着和原生 socket 一样的延迟。

AMQP 是面向消息的中间件的二进制协议，只是一个开放标准。核心概念如下：

- Server：又称 Broker，接受客户端的连接，实现 AMQP 实体服务
- Connection：连接，应用程序与 Server 的网络连接
- Channel：网络信道，几乎所有的操作都在 Channel 中进行，是消息读写的通道，客户端可以建立多个 Channel，每个 Channel 代表一个会话任务。
- Message：消息，由 Properties 和 Body 组成。Properties 可以对消息进行修饰，比如消息的优先级、延迟等，Body 则是消息的内容
- Virtual Host：虚拟地址，用于逻辑的隔离，是最上层的消息路由。一个 Virtual Host 里面可以有若干个 Exchange 和 Queue，同一个 Virtual Host 里不能有相同名称的 Exchange 或 Queue
- Exchange：交换机，接收消息，根据路由键转发消息到绑定的 Queue
- Binding：Exchange 和 Queue 之间的虚拟连接，Binging 中可以包含 Routing key
- Routing key：一个路由规则，虚拟机用它来确定如何路由一个特定消息
- Queue：消息队列，保存消息并将它们转发给消费者

![RabbitMQ](/images/2019/RabbitMQ-jiagou.png)

如图，一个 Exchange 根据 Routing key 的规则可以绑定多个队列

## 安装

安装 RabbitMQ 之前先要安装对应版本的 Erlang，可以查看官网上的两者之间的[版本对应关系](https://www.rabbitmq.com/which-erlang.html)，推荐使用 docker 安装：`docker run -d -p 15672:15672 -p 5672:5672 -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=admin --name rabbitmq --hostname=rabbitmqhostone rabbitmq:latest`。安装成功后，就可以打开 http://yourip:15672 登陆 web 页面可视化查看队列。默认的账号密码都是 guest

- port:5672，消息通信端口
- port:15672，web 可视化端口
- port:25672，集群通信端口

## 常用命令

```bash
rabbitmq-server start &     # 启动服务
rabbitmqctl stop_app    # 停止服务
rabbitmq-plugins list     #查看所有的插件
rabbitmq-plugins enable rabbitmq_management     # 启动web管理界面，访问 http://yourip:15672
rabbitmqctl stop_app    # 关闭应用
rabbitmqctl start_app    # 启动应用
rabbitmqctl status    # 节点状态
rabbitmqctl add_user username password    # 添加用户
rabbitmqctl list_users    # 列出所有用户
rabbitmqctl delete_user username    # 删除用户
rabbitmqctl change_password username newpassword    # 修改密码
rabbitmqctl list_vhosts     # 列出所有的虚拟主机
rabbitmqctl add_vhost vhostpath     # 创建虚拟主机
rabbitmqctl delete_vhost vhostpath     # 创建虚拟主机
rabbitmqctl list_permissions -p vhostpath     # 列出虚拟主机上所有的权限
rabbitmqctl list_queues     # 查看所有队列信息
rabbitmqctl -p vhostpath purge_queue blue   # 清除队列里的消息
rabbitmqctl reset       # 移除所有数据，要在rabbitmqctl stop_app之后使用
rabbitmqctl join_cluster <clusternode> [--ram]  # 组成集群命令，存储模式是内存，也可以是磁盘：disc
rabbitmqctl cluster_status  # 查看集群状态
rabbitmqctl change_cluster_node_type disc | ram     # 修改集群节点的存储形式
rabbitmqctl forget_cluster_node [--offline]     # 忘记节点（摘除节点）
rabbitmqctl rename_cluster_node oldnode1 newnode1 [oldnode2] [newnode2 ...]     # 修改节点名称
```

## 简单示例

```java
public class Procuder1 {
    public static void main(String[] args) throws Exception {
        ConnectionFactory connectionFactory = new ConnectionFactory();
        connectionFactory.setAutomaticRecoveryEnabled(true);
        connectionFactory.setNetworkRecoveryInterval(3000);

        connectionFactory.setHost("127.0.0.1");
        connectionFactory.setPort(5672);
        connectionFactory.setVirtualHost("/");

        Connection connection = connectionFactory.newConnection();

        Channel channel = connection.createChannel();

        Map<String, Object> map = new HashMap<>();
        map.put("a", "1");
        map.put("b", "2");
        String msg = "Hello Rabbitmq";
        AMQP.BasicProperties properties = new AMQP.BasicProperties().builder()
                .deliveryMode(2)    //持久化投递
                .expiration("15000")
                .contentEncoding("UTF-8")
                .headers(map)
                .build();
        //注意：如果没有指定exchange，会使用默认的exchange（AMQP default），规则是路由到和routingKey名称相同的queue上
        //exchange，routing key，properties，body
        channel.basicPublish("", "test001", properties, msg.getBytes());

        channel.close();
        connection.close();
    }
}
```

```java
public class Consumer1 {

    public static void main(String[] args) throws Exception {
        ConnectionFactory connectionFactory = new ConnectionFactory();

        connectionFactory.setHost("127.0.0.1");
        connectionFactory.setPort(5672);
        connectionFactory.setVirtualHost("/");

        Connection connection = connectionFactory.newConnection();

        Channel channel = connection.createChannel();

        //创建一个队列
        String queueName = "test001";
        //queue,durable,exclusive,autoDelete,otherProperties
        channel.queueDeclare(queueName, true, false, false, null);

        //创建消费者，把它绑定到一个channel上
        Consumer consumer = new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
                String msg = new String(body, "UTF-8");
                System.out.println("Customer Received '" + msg + "'");
            }
        };

        //设置channel，通过channel把consumer和queue绑定起来
        channel.basicConsume(queueName, true, consumer);

    }
}
```
