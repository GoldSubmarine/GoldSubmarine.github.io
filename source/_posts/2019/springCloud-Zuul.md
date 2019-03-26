---
title: SpringCloud-Zuul
date: 2019-03-26 17:33:45
tags: java
---

常见的网关服务有：Nginx，Tyk，Kong，Zuul。SpringCloud 的网关服务就是 Zuul。

Zuul 的并发性能并不高，但是功能强大，可以配合 Nginx 的高性能一起使用。

Zuul 的核心是一系列的过滤器，有四种 API 过滤器：前置(pre)，路由(route)，后置(post)，错误(error)。

## 生成项目

1. 使用 Spring Initializr 生成项目，选择 Cloud Discovery 中的 Eureka Discovery 依赖、 Cloud Config 中的 Config Client 依赖和 Cloud Routing 中的 Zuul 依赖。
2. 在主类上需要添加 @EnableZuulProxy 注解，表示自己是一个网关代理服务。
3. 将`application.yml`重命名为`bootstrap.yml`，然后添加下列配置。

   ```yml
   spring:
   application:
     name: api-gateway
   cloud:
     config:
     discovery:
       enabled: true
       service-id: CONFIG
     profile: dev
   eureka:
   client:
     service-url:
     defaultZone: http://localhost:8761/eureka
   server:
   port: 8888
   ```

4. 启动 Zuul 后，可以看到 Eureka 上有了 API-GATEWAY 服务

## 路由

假设 Eureka 上还有一个 PRODUCT 服务，并且它的一个 api 接口`http://localhost:8080/env/print`可以正常访问，并返回数值 123。那么此时可以通过访问 Zuul 的`http://localhost:8888/product/env/print`，也可以正常返回 123。其中 url 中的 `product` 为 Eureka 上的服务名称(Application Name)。
