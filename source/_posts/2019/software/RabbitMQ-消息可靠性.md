---
title: RabbitMQ-消息可靠性
date: 2019-04-18 16:28:00
tags: rabbitmq
categories: 软件技术
---

## 消息可靠性

生产端的可靠性投递：

- 保障消息成功发出
- 保障 MQ 节点的成功接收
- 发送端收到 MQ 服务器的 ACK
- 完善的消息补偿机制

具体方案：

1. 消息落库，对消息状态进行打标
2. 消息的延迟投递，做二次确认，回调检查

![RabbitMQ](/images/2019/RabbitMQ-kekao-dabiao.png)

缺点是 BIZ DB 和 MSG DB 都进行了一次 insert 操作，在高并发场景下有性能问题

![RabbitMQ](/images/2019/RabbitMQ-kekao-dabiao2.png)

把消息打标抽离成单独的一个服务，减少了一步核心业务的 insert 操作。

## 消费端幂等性

1. 唯一 ID + 指纹码，作为数据库主键，从而实现去重，好处是简单，坏处是并发下数据库有写入的性能瓶颈。解决方案：使用 hash 算法，根据 id 进行分库分表

2. 利用 Redis 的原子性去实现

## confirm 确认消息流程

![RabbitMQ](/images/2019/RabbitMQ-kekao-confirm.png)

注意这里的 ack 指的是消息**是否到达 exchange**

1. channel 上开启确认模式：`channel.confirmSelect()`
2. 在 channel 上添加监听：`addConfirmListener`，监听成功和失败的返回结果，根据具体的结果对消息进行重发或记录日志。

```java
Channel channel = connection.createChannel();
channel.confirmSelect();    //开启确认模式
channel.addConfirmListener(new ConfirmListener() {
    @Override
    public void handleAck(long deliveryTag, boolean multiple) throws IOException {
        System.out.println("===========ack==========");
    }

    @Override
    public void handleNack(long deliveryTag, boolean multiple) throws IOException {
        //可对消息进行重发
        System.out.println("===========noack==========");
    }
});
```

## Return 消息机制

指的是消息最后有没有抵达 queue。

没有抵达可能是因为没有找到 exchange，或者根据 routingkey 没有找到指定的队列。

一个关键的配置项为 Mandatory，如果是 true，则监听器会接收到路由不可达的消息，然后进行后续处理。如果为 false，那么服务端自动删除该消息。

```java
channel.basicPublish(exchangeName, routingKey, true, properties, msg.getBytes());     //第三个参数为mandatory
channel.addReturnListener(new ReturnListener() {
    @Override
    public void handleReturn(int replyCode, String replyText, String exchange, String routingKey, AMQP.BasicProperties properties, byte[] body) throws IOException {
        System.out.println("replyCode:" + replyCode);
        System.out.println("replyText:" + replyText);
        System.out.println("exchange:" + exchange);
        System.out.println("routingKey:" + routingKey);
        System.out.println("properties:" + properties);
        System.out.println("body:" + body);
    }
});
```
