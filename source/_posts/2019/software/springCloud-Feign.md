---
title: SpringCloud-Feign
date: 2019-02-08 00:15:12
tags: SpringCloud
categories: 软件技术
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
@FeignClient(name = "PRODUCT")  // application 的 name，这个名字是必须的，如果是非 spring cloud 项目，随便填一个就好
public interface ProductFeign {

    @RequestMapping("/test/hello")  // 远程http接口
    public String getHello();

    @RequestMapping("/test/get")
    public String getProduct(int id);   // 单个参数

    @RequestMapping("/test/query")
    public String queryProduct(Product product);   // 单个对象参数

    @RequestMapping("/test/query2")
    public String queryProduct(@RequestParam("name") String name, @RequestParam("weight") int weight);  // 多个入参必须加 @RequestParam

    @RequestMapping("/test/query3")
    public String queryProduct(@RequestParam("product") Product product, @RequestParam("weight") int weight);  // 多个入参必须加 @RequestParam
}
```

调用上面定义的接口方法

```java
// Controller.java
@RestController
@RequestMapping("/restTemplate")
class Controller {

    @Resource
    private ProductFeign productFeign;

    @RequestMapping("/hello")
    public String getHello() {
        String str = productFeign.getHello();
        return str;
    }
}
```