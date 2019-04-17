---
title: RabbitMQ-Exchange
date: 2019-04-18 00:02:00
tags: java
---

## 交换机属性

- name：交换机名称
- type：交换机类型 direct、topic、fanout、headers
- durability：是否需要持久化，true为持久化
- auto delete：当没有队列与该exchange绑定时，自动删除该exchange
- internal：当前exchange是否用于rabbitmq内部使用，默认为false（内部扩展插件）
- arguments：扩展参数，用于AMQP协议定制使用

### Direct Exchange

所有发送到Direct Exchange的消息被转发到RoutingKey中指定的Queue。
注意：如果你没有指定exchange，则会使用默认的exchange，将消息传递到和routing key相同名字的queue上，名字必须**完全匹配**，否则该消息会被抛弃。

```java
public class Consumer2 {

    public static void main(String[] args) throws Exception {
        ConnectionFactory connectionFactory = new ConnectionFactory();

        connectionFactory.setHost("132.232.40.53");
        connectionFactory.setPort(5672);
        connectionFactory.setVirtualHost("/");

        Connection connection = connectionFactory.newConnection();

        Channel channel = connection.createChannel();

        //创建一个队列
        String exchangeName = "test_direct_exchange";
        String exchangeTypoe = "direct";
        String queueName = "test_direct_queue";
        String routingKey = "test.direct";

        //queue,durable,exclusive,autoDelete,otherProperties
        channel.queueDeclare(queueName, true, false, false, null);
        channel.exchangeDeclare(exchangeName, exchangeTypoe, true, false, false, null);
        channel.queueBind(queueName, exchangeName, routingKey);

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

```java
public class Procuder2 {
    public static void main(String[] args) throws Exception {
        ConnectionFactory connectionFactory = new ConnectionFactory();
        connectionFactory.setAutomaticRecoveryEnabled(true);
        connectionFactory.setNetworkRecoveryInterval(3000);

        connectionFactory.setHost("132.232.40.53");
        connectionFactory.setPort(5672);
        connectionFactory.setVirtualHost("/");

        Connection connection = connectionFactory.newConnection();

        Channel channel = connection.createChannel();

        String exchangeName = "test_direct_exchange";
        String routingKey = "test.direct";
        String msg = "Hello Rabbitmq";

        //exchange，routing key，properties，body
        channel.basicPublish(exchangeName, routingKey, null, msg.getBytes());

        channel.close();
        connection.close();
    }
}
```

### Topic Exchange

所有发送到Topic Exchange上的消息，都会被转发到所有关心RouteKey中指定的Topic的Queue上

Exchange将RouteKey和某Topic进行模糊匹配，此时队列需要绑定一个Topic

可以使用通配符进行模糊匹配：

- "#"匹配一个词或多个词，例如："log.#"能匹配到"log.info.oa"
- "\*"匹配正好一个词，例如："log.\*"会匹配到"log.erro"

![RabbitMQ](/images/2019/RabbitMQ-topic-exchange.png)

### Fanout Exchange

- 不处理routing key，直接把队列和交换机绑定
- 发送到交换机的消息直接被转发到与之绑定的queue上
- Fanout交换机转发消息是最快的

```java
//queueName, exchangeName, routingKey
channel.queueBind(queueName, exchangeName, "");     //routing key可以随意设置，都不会处理，这里设为空字符串即可
```