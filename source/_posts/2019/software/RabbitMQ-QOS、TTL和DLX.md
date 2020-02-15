---
title: RabbitMQ-QOS、TTL和DLX
date: 2019-04-21 18:03:00
tags: rabbitmq
categories: 软件技术
---

## 服务质量保障Qos

设想一个场景，我们的rabbitmq上有上万条未处理的消息，随便打开一个客户端，此时巨量的消息推送过来，该客户端处理不了就会宕机。所以需要消费端限流。

RabbitMQ提供了qos（服务质量保障）功能，在手动确认消息的前提下，如果一定数目（通过consume或channel设置的qos值）的消息未被确认，则不再消费新的消息。

- prefetchSize：单条消息的大小限制，设置为 0 表示不限制
- prefetchCount：每次消费的消息个数，只有**手动**ack以后才会消费新的消息
- global：级别，true为channel级别，false为consume级别

```java
Consumer consumer = new DefaultConsumer(channel) {
    @Override
    public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
        String msg = new String(body, "UTF-8");
        System.out.println("Customer Received '" + msg + "'");
        channel.basicAck(envelope.getDeliveryTag(), false);     //消费后手动ack，表示可以推送下一条消息了
        //channel.basicNack(envelope.getDeliveryTag(), false, false); //Nack，消费失败了，最后一个参数为是否重回队列（requeue），回到队列的尾部
    }
};
//......banding
channel.basicQos(0, 1, false);
channel.basicConsume(queueName, false, consumer);   //第二个参数为是否自动ack，必须为false，qos才起作用
```

如果因为业务导致消费失败，一般来说，实际生产中都不会重回队列，而是通过记录日志，后续进行补偿。

## TTL消息/队列

- TTL是Time To Live的缩写，也就是生存时间
- 可以在发送消息的时候，通过消息的properties中的expiration指定过期时间
- 也可以给队列设置消息的过期时间

## DLX死信队列

如果一条消息不能被正确消费，就把这条消息称为死信，消息变成死信的几种情况：

- 消息被拒绝（basic.reject/basic.nack）并且requeue=false，不重回队列
- 消息TTL过期
- 队列达到最大长度

死信队列DLX（Dead-Letter-Exchange）：当一条消息变成死信后，它被重新publish到另一个exchange，这个exchange就是DLX。

DLX就是一个正常的exchange，和普通的exchange没有区别。当其他队列产生死信后，就publish到DLX上，DLX再路由到绑定的队列上。

```java
//创建死信队列
channel.exchangeDeclare("dlx.exchange", "fanout", true, false, false, null);
channel.queueDeclare("dlx.queue", true, false, false, null);
channel.queueBind("dlx.queue", "dlx.exchange", "");

//声明其他正常的queue
Map<String, Object> arguments = new HashMap<>();
arguments.put("x-dead-letter-exchange", "dlx.exchange");
channel.queueDeclare("queueName", true, false, false, arguments);     //声明一个队列，通过最后的arguments指定dlx
```