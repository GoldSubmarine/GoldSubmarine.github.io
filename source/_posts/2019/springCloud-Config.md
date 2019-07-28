---
title: SpringCloud-Config
date: 2019-03-23 10:19:14
tags: java
---

统一的配置中心的好处

- 能够确保线上账号密码的安全和权限，线上环境只有运维才能知道账号密码
- 降低了开发人员同时修改配置文件带来的冲突问题
- 能够实现不重启应用服务，自动更新配置

配置中心必须基于一个 git 仓库，大致流程是先拉取远程的 git 到本地，然后读取本地 git 中的内容，最后启动服务。如果某天远程的 git 无法访问了，它就会直接使用本地的 git。

## server 项目

1. 使用 Spring Initializr 生成项目，选择 Cloud Discovery 中的 Eureka Discovery 依赖和 Cloud Config 中的 Config Server 依赖。
2. 在主类上需要添加 @EnableEurekaClient 注解，表示要注册到 Eureka 上，再添加 @EnableConfigServer 注解，表示自己是 config 的 server。
3. 新建一个 git 仓库为 `config-repo`，将某一个项目的配置文件写到这个仓库里，比如商品服务，于是我们在`config-repo`中新建一个`product.yml`文件，将商品服务的 `application.yml` 中的内容复制到 `product.yml` 中

配置中心的 `application.yml` 的配置如下：

```yml
# application.yml
spring:
  application:
    name: config
  cloud:
    config:
      server:
        git:
          uri: https://github.com/goldsubmarine/config-repo #远程仓库的git地址
          username: xxxxxxxx
          password: xxxxxxxx
          basedir: /xxx/xxx #因为线上服务可能有文件权限问题，所以可以配置远程git下载的路径
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
server:
  port: 9000
```

启动后就可以访问 `http://localhost:9000/master/product-aa.yml`，可以看到刚才仓库中的`product.yml`文件的内容就显示出来了，可以看出路径的格式为`/${分支名称}/${项目名称}-${环境}.${文件后缀}`

- 虽然远程的文件名中并不是 `product-aa.yml`，但是必须要有环境，所以可以随意写一个 aa 或者 bb，一般远程的配置文件名命名为项目名+环境名，例如`product-dev.yml`，此时访问`http://localhost:9000/master/product-dev.yml`就可以了
- 远程的配置文件后缀为 yml，但是也可以访问 `http://localhost:9000/master/product-dev.properties`，配置中心会自动转换格式的类型，此外还支持 json 格式
- **注意：**假如远程 git 中有两个文件`product.yml`和`product-dev.yml`，那么访问`http://localhost:9000/master/product-dev.properties`时，配置中心会将两份配置的内容合并后发送给调用者。

## client 项目

在 client 项目的 pom 文件中加入依赖

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

将自己的`application.yml`文件中的内容复制到远程仓库中，例如命名为`product-dev.yml`，然后删除掉 `application.yml`，并建一个文件`bootstrap.yml`，配置如下：

```yaml
# bootstrap.yml
spring:
  cloud:
    config:
      name: product #项目名称
      profile: dev #环境
      label: master #分支branch
      discovery:
        enabled: true
        service-id: CONFIG #查看Eureka中配置中心的Application的名称
  application:
    name: product
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

## 高可用

多启动几个配置中心即可，客户端会采用负载均衡的策略访问配置中心

## 动态刷新配置

大致流程如下：客户端和配置中心都连接到 rabbitmq ，各自都产生了一个自己的消息队列。远程 git 中的配置修改后，发送一个 http 请求到配置中心的 bus 上，bus 会通过消息队列通知到所有的客户端，客户端再从配置中心重新拉取配置信息并生效。

实现目标：远程 git 上的配置发生变化，所有项目无需重启，自动应用该配置

### client 端

同样在 client 端的 pom 文件加入下列依赖：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>
```

然后修改远程仓库的配置`product-dev.yml`，添加 rabbitmq 的相关配置：

```yml
spring:
  rabbitmq:
    host: 192.168.xx.xx
    port: 5672
    username: xxx
    password: xxx
```

如果有通过`@Bean`，`@value`或者`@ConfigurationProperties`等手动注入配置的地方，需要在 class 上添加 `@RefreshScope` 注解才能使配置生效。

### server 端

在配置中心的 pom 文件加入下列依赖：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>
```

然后修改配置中心的`application.yml`，添加 rabbitmq 的相关配置，并把 bus-refresh 接口暴露出去：

```yml
spring:
  rabbitmq:
    host: 192.168.xx.xx
    port: 5672
    username: xxx
    password: xxx
management: #把 bus-refresh 接口暴露出去
  endpoints:
    web:
      exposure:
        include: "*"
```

重启配置中心后，查看 rabbitmq 的 queues，可以看到多了一个 springCloudBus 的消息队列。此时使用 post 方式访问 `http://${configServerIp}:9000/actuator/bus-refresh`，可以看到客户端的配置已经自动刷新并生效了。

最后可以通过配置 git 仓库的 webhook 实现自动发送 http 请求，webhook 的请求地址不再是`/actuator/bus-refresh`，而是`http://yourIp/monitor`，contentType 为`application/json`
