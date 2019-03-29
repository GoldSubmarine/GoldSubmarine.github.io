---
title: SpringCloud-Hystrix
date: 2019-03-28 11:26:56
tags: java
---

雪崩效应：假设有三个服务 ABC，A 调用 B，B 调用 C。假设 C 因为某种原因不可用，B 会不断重试去调用 C，因为始终调用不成功于是 B 也不可用，最后导致 A 也不可用，整个服务都不可用。并且因为不断重试，最后会导致资源耗尽。

所以引入了 Hystrix 用于服务容错，Hystrix 有以下几个功能：

- 服务降级（优先保证核心服务，非核心服务不可用或弱可用。例如保障商品订单支付服务，停止广告积分服务）
- 服务熔断
- 依赖隔离
- 监控

## 服务降级

首先在 client 端加入 Hystrix 依赖

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
</dependency>
```

然后再启动类上增加`@EnableCircuitBreaker`注解，

`@SpringCloudApplication`是`@SpringBootApplication`,`@EnableEurekaClient`,`@EnableCircuitBreaker`三个注解的合集，所以如果你使用 springBoot，Eureka 和 Hystrix，启动类上只需要加`@SpringCloudApplication`即可。

```java
package com.order.product.config;

import com.netflix.hystrix.contrib.javanica.annotation.DefaultProperties;
import com.netflix.hystrix.contrib.javanica.annotation.HystrixCommand;
import com.netflix.hystrix.contrib.javanica.annotation.HystrixProperty;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@DefaultProperties(defaultFallback = "defaultFallback")     //指定失败后默认的回调方法名
public class HystrixController {

    @HystrixCommand(fallbackMethod = "failIp")//指定失败后调用的回调方法名
    @RequestMapping("/getIp")
    public String getIp() {
        throw new RuntimeException();
    }

    public String failIp() {
        return "站点暂时找不到了";
    }

    //不指定回调方法名，就会走默认的回调
    //如果方法中发送了http请求，就需要考虑过期时间，在`HystrixCommandProperties.java`中看到默认的超时时间是一秒钟，可以手动设置为3秒
    @HystrixCommand(commandProperties = {
            @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = "3000")
    })
    @RequestMapping("/getIp2")
    public String getIp2() {
        throw new RuntimeException();
    }

    public String defaultFallback() {   //失败后，默认的回调
        return "太拥挤了，请稍后再试····";
    }
}
```

可以看到不一定是调用远程 api 时可以降级，只要是方法体内报错，都会触发降级，所以也可以用于自己的服务降级，比如当前数据库连接数太多，或并发数太高了。

也可以把统一的超时时间写在配置文件`application.yml`中，如下：

```yml
hystrix:
  command:
    default:
      execution:
        isolation:
          thread:
            timeoutInMilliseconds: 400
```

## 服务熔断

```yml
hystrix:
  command:
    default:
      execution: # 超时时间配置
        isolation:
          thread:
            timeoutInMilliseconds: 400
      circuitBreaker: #断路器的配置
        enabled: true
        requestVolumeThreshold: 10 # 一个rolling window内最小的请求数。如果设为20，那么当一个rolling window的时间内（比如说1个rolling window是10秒）收到19个请求，即使19个请求都失败，也不会触发circuit break。默认20
        sleepWindowInMilliseconds: 10000 #  触发短路的时间值，当该值设为5000时，则当触发circuit break后的5000毫秒内都会拒绝request，也就是5000毫秒后才会关闭circuit。默认5000
        errorThresholdPercentage: 80 # 错误率阈值
```

一个 sleepWindowInMilliseconds 时间过后，会进入半开状态，如果下一个链接成功后，会将断路器打开

## feign 中使用 hystrix

服务降级的回调代码应该写在服务的提供方，之前说过当自己的服务对外提供服务时，应该将自己的服务改造成多模块：client,common,server。服务降级的代码应该写在 client 模块中。

```java
package com.order.product.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;

//在此处通过fallback字段定义服务降级的class
@FeignClient(name = "product", fallback = ProductClient.ProductClientFallback.class)
public interface ProductClient {

    @PostMapping("/test")
    String test();

    @Component  //注意这里要有注解，这样服务的调用方才能将此类加入spring容器
    static class ProductClientFallback implements ProductClient {
        @Override
        public String test() {
            return "系统被挤爆了。。。。。。";
        }
    }
}
```

在服务的调用方，需要进行下列配置：

```yml
feign:
  hystrix:
    enable: true
```

另外在启动类上添加 `@ComponentScan(basePackages = "com.xxx")` 才能扫描到服务降级的代码，将降级的代码加入 spring 容器中。

## hystrix-dashboard 监控

添加下列依赖，当然前提是已经加入了`spring-cloud-starter-netflix-hystrix-dashboard`和`spring-boot-starter-actuator`依赖。

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-hystrix-dashboard</artifactId>
</dependency>
```

添加`application.yml`的配置

```yml
management:
  endpoints:
    web:
      exposure:
        include: hystrix.stream
        # Unable to connect to Command Metric Stream.
```

然后在启动类上添加 `@EnableHystrixDashboard` 注解，直接启动后，访问 `http://localhost:8080/hystrix` 可以看到一个页面，页面提示要填入一个地址，有三种情况，因为我们是单个应用，所以选最后一种，填入`http://http://localhost:8080/actuator/hystrix.stream`，Delay 填 1000，Title 写服务名称，点击 Monitor Stream 按钮，可以看到一直是 loading 状态。此时访问那些配置了服务降级的接口，就可以看到 loading 消失，出现了数据。
