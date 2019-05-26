---
title: RabbitMQ-SpringBoot整合
date: 2019-04-23 22:57:45
tags: rabbitmq
---

## 生产端整合

```yml
# application.yml
spring:
  rabbitmq:
    addresses: 127.0.0.1
    username: guest
    password: guest
    virtual-host: /
    connection-timeout: 15000

    publisher-confirms: true    # 消息抵达MQ时的回调
    publisher-returns: true     # 消息没有抵达queue时的回调
    template:
      mandatory: true   # 消息没有抵达queue时，如果为false，自动删除该消息，如果为true，监听器会接收到路由不可达的消息
```

```java
// RabbitSender.java
package com.rabbitmq.demo.demo2;

import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
public class RabbitSender {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    final RabbitTemplate.ConfirmCallback confirmCallback = new RabbitTemplate.ConfirmCallback() {
        @Override
        public void confirm(CorrelationData correlationData, boolean ack, String cause) {
            System.out.println("correlationData:" + correlationData);
            System.out.println("ack:" + ack);
            System.out.println("cause:" + cause);
            if(!ack) {
                System.out.println("异常处理");
            } else {
                //更新数据库消息打标状态
            }
        }
    };

    final RabbitTemplate.ReturnCallback returnCallback = new RabbitTemplate.ReturnCallback() {
        @Override
        public void returnedMessage(org.springframework.amqp.core.Message message, int code, String text, String exchange, String routingKey) {
            System.out.println("message:" + message + ",code:" + code + ",text:" + text + ",exchange:" + exchange + ",routingkey:" + routingKey);
            System.out.println("异常处理");
        }
    };

    public void send(Object message, Map<String, Object> properties) {
        MessageHeaders msgheader = new MessageHeaders(properties);
        Message msg = MessageBuilder.createMessage(message, msgheader);
        //application.properties中的publisher-confirms必须设为true
        rabbitTemplate.setConfirmCallback(confirmCallback);     //消息抵达MQ的callback
        //application.properties中的template.mandatory必须设为true
        //application.properties中的publisher-returns必须设为true
        rabbitTemplate.setReturnCallback(returnCallback);       //消息没有抵达queue的callback

        CorrelationData correlationData = new CorrelationData(UUID.randomUUID().toString());    //消息唯一的id
        rabbitTemplate.convertAndSend("springboot-exchange-1", "springboot.hello.routingkey", msg, correlationData);
    }
}
```

```java
// RabbitSenderTest.java
package com.rabbitmq.demo.demo2;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@SpringBootTest
public class RabbitSenderTest {

    @Autowired
    private RabbitSender rabbitSender;

    @Test
    public void send() {
        Map<String, Object> properties = new HashMap<>();
        properties.put("name", "cwj");
        properties.put("age", "18");
        rabbitSender.send("hello springboot rabbitmq", properties);
    }
}
```

## 消费端整合

```yml
# application.yml
spring:
  rabbitmq:
    addresses: 127.0.0.1
    username: guest
    password: guest
    virtual-host: /
    connection-timeout: 15000
    listener:
      simple:
        acknowledge-mode: manual  #手工ack
        concurrency: 5  # 初始监听数量
        max-concurrency: 10   # 最大监听数量

      order:    # 自定义监听配置
        queue:
          name: order-queue
          durable: true
        exchange:
          name: order-exchange
          durable: true
          type: topic
          ignoreDeclarationExceptions: true
          key: order.*
```

```java
// RabbitReceiver.java
package com.rabbitmq.demo.demo2;

import com.rabbitmq.client.Channel;
import org.springframework.amqp.rabbit.annotation.*;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.Headers;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class RabbitReceiver {

    //如果MQ上没有绑定的queue和exchange，就会自动创建
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "springboot-queue-1", durable = "true"),
            exchange = @Exchange(value = "springboot-exchange-1", durable = "true", type = "topic"),
            key = "springboot.*",
            ignoreDeclarationExceptions = "true"
    ))
    @RabbitHandler
    public void onMessage(Message message, Channel channel) throws Exception {
        System.out.println("消息：" + message.getPayload());
        Long deliveryTag = (Long) message.getHeaders().get(AmqpHeaders.DELIVERY_TAG);
        channel.basicAck(deliveryTag, false);   //手动ack
    }

    //实际生产中通过配置文件注入，当然最好建一个实体与配置文件对应
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "${spring.rabbitmq.listener.order.queue.name}", durable = "${spring.rabbitmq.listener.order.queue.durable}"),
            exchange = @Exchange(value = "${spring.rabbitmq.listener.order.exchange.name}", durable = "${spring.rabbitmq.listener.order.exchange.durable}", type = "${spring.rabbitmq.listener.order.exchange.type}"),
            key = "${spring.rabbitmq.listener.order.exchange.key}",
            ignoreDeclarationExceptions = "${spring.rabbitmq.listener.order.exchange.ignoreDeclarationExceptions}"
    ))
    @RabbitHandler
    public void onMessage2(@Payload String message, @Headers Map<String, Object> headers, Channel channel) throws Exception {
        System.out.println("消息：" + message);
        Long deliveryTag = (Long) headers.get(AmqpHeaders.DELIVERY_TAG);
        channel.basicAck(deliveryTag, false);   //手动ack
    }
}
```