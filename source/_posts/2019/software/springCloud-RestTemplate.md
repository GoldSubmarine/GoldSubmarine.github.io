---
title: SpringCloud-RestTemplate
date: 2019-02-08 00:15:12
tags: SpringCloud
categories: 软件技术
---

## 服务之间调用方式

- 服务拆分后通过轻量级的接口进行互相调用，如http或rpc，轻量级的接口保证了整个系统是异构的，服务可以跨语言，跨平台。
- springcloud采用http通信，dubbo采用rpc通信
- springcloud服务间有两种restful调用方式：RestTemplate 和 Feign

## RestTemplate调用其他服务

1. 直接写死被调用方的url，缺点是：1.不知道对方的ip地址   2.对方有多个实例服务，无法负载均衡

    ```java
    @RestController
    @RequestMapping("/restTemplate")
    public class Controller {

        @RequestMapping("/hello")
        public String getHello() {
            RestTemplate restTemplate = new RestTemplate();
            return restTemplate.getForObject("http://localhost:8761/test/hello", String.class);     // 返回 hello
        }
    }
    ```

2. 通过loadBalancerClient从注册中心获取被调用的ip和端口

    ```java
    @RestController
    @RequestMapping("/restTemplate")
    public class Controller {

        @Autowired
        private LoadBalancerClient loadBalancerClient;

        @RequestMapping("/hello")
        public String getHello() {
            RestTemplate restTemplate = new RestTemplate();
            ServiceInstance serviceInstance = loadBalancerClient.choose("PRODUCT"); //application 的 name
            String url = String.format("http://%s:%s", serviceInstance.getHost(), serviceInstance.getPort()) + "/test/hello";
            return restTemplate.getForObject(url, String.class);    //返回hello
        }
    }
    ```

3. 通过`@LoadBalanced`注解从注册中心获取ip和端口

```java
// RestTemplateConfig.java
@Component
public class RestTemplateConfig {

    @Bean
    @LoadBalanced   //通过此注解
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

```java
//Controller.java
@RestController
@RequestMapping("/restTemplate")
class Controller {

    @Autowired
    private RestTemplate restTemplate;

    @RequestMapping("/hello")
    public String getHello() {
        return restTemplate.getForObject("http://PRODUCT/test/hello", String.class);    //直接写 application 的 name
    }
}
```