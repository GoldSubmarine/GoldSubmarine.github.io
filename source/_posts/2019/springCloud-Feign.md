---
title: SpringCloud-Feign
date: 2019-02-08 00:15:12
tags: java
---

进行应用间通信有两种方式：restTemplate 和 feign  

feign是伪RPC，内部使用Ribbon做负载均衡  

在pom中添加依赖，注意是openfeign，不是feign  

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

在启动的主类上添加 `@EnableFeignClients` 注解（如果是加载的模块，需要配置为`@EnableFeignClients(basePackages="com.xxx.xxx.xxx")`）

新建Product接口文件

```java
// Product.java
@FeignClient(name = "PRODUCT")  // application 的 name
public interface Product {
    @RequestMapping("/test/hello")  // 远程http接口
    public String getHello();
}
```

调用上面定义的接口方法

```java
// Controller.java
@RestController
@RequestMapping("/restTemplate")
class Controller {

    @Autowired
    private Product product;

    @RequestMapping("/hello")
    public String getHello() {
        String str = product.getHello();
        return str;
    }
}
```