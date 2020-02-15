---
title: Netty 组件介绍
date: 2019-10-12 01:36:45
tags: java
categories: 软件技术
---

## 组件

1. NioEventLoop

   服务端的主线程，用于不断接收客户端的连接请求，并创建客户端的 channel，处理和客户端之间的读写。  
   对于客户端来说就是处理服务端的连接成功，并处理和服务端之间的读写。

2. Channel

   一个 channel 对应一个 socket 连接，或者说 channel 就是对一个 socket 的封装

3. ByteBuf

   用于处理接收到的数据的工具

4. Pipeline

   每个 channel 都有一个 pipeline，用于链式存储 ChannelHandler 业务逻辑

5. ChannelHandler

   用于处理业务逻辑，例如数据包的拆分，数据包转换成 Java 对象
