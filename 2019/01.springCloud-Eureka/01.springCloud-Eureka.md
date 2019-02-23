# springCloud-Eureka

Eureka 由两个组件组成：

- Eureka Server 注册中心
- Eureka Client 服务注册

心跳检测，健康检查，负载均衡

## server项目生成

使用 Spring Initializr 生成项目，选择 Cloud Discovery 中的 Eureka Server 依赖。
在主类上需要添加 @EnableEurekaServer 注解，表示自己是注册server。

启动后可以访问localhost:8080 看到注册中心的界面，后台一直报错，因为它既是server也是client，他也需要注册到server上，可以在application.yml中进行以下配置：

```yml
# application.yml
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka     # 注意是8080，不是8761
#    register-with-eureka: false     # 可选，false表示不要在server的页面上显示自己
#  server:
#    enable-self-preservation: false    # 自我保护机制关闭，仅开发环境设置
spring:
  application:
    name: eureka
server:
  port: 8761
```

**注意：**启动后仍然会报错，因为既是server也是client，所以一开始client找不到server，但是一会儿会进行心跳检测，重新连接，就能连接上。

## client项目生成

使用 Spring Initializr 生成项目，选择 Cloud Discovery 中的 Eureka Discovery 依赖。在主类上需要添加 @EnableEurekaClient 注解，表示自己是注册 client。然后引入 spring-boot-starter-web 依赖，不然注册完后就会直接退出，最后进行以下配置：

```yml
# application.yml
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
spring:
  application:
    name: client
server:
  port: 8080
```

## 高可用Eureka

启动两个 eureka（8761和8762），让它们互相注册，此时如果有一个client注册到8761上，8762的eureka也能发现这个client，如果8761掉线，8762还是能发现这个client。

但是如果8761掉线，client重启，那么8762就不能发现这个client。

**正确的做法**是client向所有的eureka都发起注册，eureka之间也都互相注册，如下配置：

```yml
# application.yml
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka,http://localhost:8762/eureka     # 向两台eureka都发起注册
spring:
  application:
    name: client
server:
  port: 8080
```

## 负载均衡

负载均衡有客户端发现和服务端发现两种，eureka是客户端发现，服务端发现有：Nginx，Zookeeper，Kubernetes。

eureka是客户端发现，客户端从注册中心获取到一堆地址，从中选择一个发送请求，