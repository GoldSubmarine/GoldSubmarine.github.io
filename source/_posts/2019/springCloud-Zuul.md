---
title: SpringCloud-Zuul
date: 2019-03-26 17:33:45
tags: java
---

常见的网关服务有：Nginx，Tyk，Kong，Zuul。SpringCloud 的网关服务就是 Zuul。

Zuul 的并发性能并不高，但是功能强大，可以配合 Nginx 的高性能一起使用。

Zuul 的核心是一系列的过滤器，有四种 API 过滤器：

- 前置(pre)，可用于限流，鉴权，参数校验
- 路由(route)
- 后置(post)，用于统计，日志
- 错误(error)

## 生成项目

1. 使用 Spring Initializr 生成项目，选择 Cloud Discovery 中的 Eureka Discovery 依赖、 Cloud Config 中的 Config Client 依赖和 Cloud Routing 中的 Zuul 依赖。
2. 在主类上需要添加 `@EnableZuulProxy` 注解，表示自己是一个网关代理服务。
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

假设 Eureka 上还有一个 PRODUCT 服务，端口为 8080，并且它的一个 api 接口`http://localhost:8080/env/print`可以正常访问，并返回数值 123。那么此时可以通过访问 Zuul 的`http://localhost:8888/product/env/print`，也可以正常返回 123。其中 url 中的 `product` 为 Eureka 上的服务名称(Application Name)。

以上是 Zuul 的默认配置，假如不想用服务名称访问，需要自定义前缀名称，可以添加下列配置：

```yml
zuul:
  routes:
    #自定义路由规则
    myProduct: # 简洁写法 product: /myProduct/**
      path: /myProduct/**
      serviceId: PRODUCT
      sensitiveHeaders: # 点进去可以看到默认的敏感头是 Cookie，Set-Cookie，Authorization，配上这个参数不写，就可以置空，这样cookie就能传递到product服务中去
  ignored-patterns: # 屏蔽原来的服务，不允许通过/product访问，只能通过/myProduct访问
    - /product/env/print # 可以使用通配符 /product/env/**
```

此时访问 Zuul 的`http://localhost:8888/myProduct/env/print`可以返回 123，因为配置了 ignored-patterns，所以无法再通过`http://localhost:8888/product/env/print`访问

## 动态刷新配置

这里只说 client 端的大致配置，具体见 springCloud-Config 这章。

1. 首先 pom 文件加入 springBus 依赖
2. 将`application.yml`重命名为`bootstrap.yml`，配置上 eureka、spring-cloud-config、applicationName
3. 远程 git 中新建一个`api-gateway-dev.yml`文件，配置 rabbitmq 和 Zuul 的路由规则
4. 新建一个 `ZuulConfig.java` 文件，内容如下：

```java
// ZuulConfig.java
@Component
public class ZuulConfig {

    @ConfigurationProperties("zuul")
    @RefreshScope
    public ZuulProperties zuulProperties() {
        return new ZuulProperties();    //点进去可以看到，就是这个类去加载的application.yml中的配置
    }
}
```

## 高可用

启动多个 Zuul，注册到 Eureka 上，最前端是 Nginx 做负载均衡

## 前置过滤器

使用前置过滤器进行鉴权

```java
// TokenFilter.java
package com.order.apigateway.config;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import com.netflix.zuul.exception.ZuulException;
import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_DECORATION_FILTER_ORDER;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;

@Component
public class TokenFilter extends ZuulFilter {
    @Override
    public String filterType() {
        return PRE_TYPE;    //过滤器类型，前置(pre)路由(route)后置(post)错误(error)
    }
    @Override
    public int filterOrder() {
        return PRE_DECORATION_FILTER_ORDER - 1;  //设置过滤器的优先级，越小的越靠前
    }

    @Override
    public boolean shouldFilter() {
        return true;
    }

    @Override
    public Object run() throws ZuulException {
        RequestContext requestContext = RequestContext.getCurrentContext();
        HttpServletRequest request = requestContext.getRequest();

        String token = request.getParameter("token");
        if(StringUtils.isEmpty(token)) {    //如果请求的参数中token为空，就返回401
            requestContext.setSendZuulResponse(false);
            requestContext.setResponseStatusCode(HttpStatus.SC_UNAUTHORIZED);
        }
        return null;
    }
}

```

## 后置过滤器

可以对应用服务器响应返回的 http 加工

```java
// AddResponseHeaderFilter.java
package com.order.apigateway.config;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import com.netflix.zuul.exception.ZuulException;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletResponse;

import java.util.UUID;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.POST_TYPE;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.SEND_RESPONSE_FILTER_ORDER;

@Component
public class AddResponseHeaderFilter extends ZuulFilter {
    @Override
    public String filterType() {
        return POST_TYPE;    //过滤器类型，前置(pre)路由(route)后置(post)错误(error)
    }

    @Override
    public int filterOrder() {
        return SEND_RESPONSE_FILTER_ORDER - 1;  //设置过滤器的优先级，越小的越靠前
    }

    @Override
    public boolean shouldFilter() {
        return true;
    }

    @Override
    public Object run() throws ZuulException {
        RequestContext requestContext = RequestContext.getCurrentContext();
        HttpServletResponse response = requestContext.getResponse();

        response.setHeader("X-Foo", UUID.randomUUID().toString());  //对应用服务器响应返回的http加工，添加一个头部信息
        return null;
    }
}
```

## 限流

使用 Google 开源的 Guava 包中的 RateLimiter（令牌桶算法）进行限流

```java
// RateLimitFilter.java
package com.order.apigateway.config;

import com.google.common.util.concurrent.RateLimiter;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.exception.ZuulException;
import org.springframework.stereotype.Component;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.SERVLET_DETECTION_FILTER_ORDER;

@Component
public class RateLimitFilter extends ZuulFilter {

    private static final RateLimiter RATE_LIMITER = RateLimiter.create(100);    //生成一个令牌桶，每秒放入100个令牌

    @Override
    public String filterType() {
        return PRE_TYPE;    //过滤器类型，前置(pre)路由(route)后置(post)错误(error)
    }

    @Override
    public int filterOrder() {
        return SERVLET_DETECTION_FILTER_ORDER - 1;      // 限流的优先级应该是最高的，找到默认的最小的值（-3）再减一
    }

    @Override
    public boolean shouldFilter() {
        return true;
    }

    @Override
    public Object run() throws ZuulException {
        if(!RATE_LIMITER.tryAcquire()) {        // 获取一个令牌，获取失败则报错
            System.out.println("rateLimitExcept");
            throw new RuntimeException();
        }
        return null;
    }
}
```

## 跨域

跨域有多种解决方案，可以通过 springBoot 的 `@CrossOrigin`，或者 Nginx 上进行转发代理，也可以 Zuul 增加 CorsFilter 过滤器

```java
// CorsConfig
package com.order.apigateway.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    public CorsFilter corsFilter() {
        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        final CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);
        config.setAllowedOrigins(Arrays.asList("*"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("*"));
        config.setMaxAge(300l);

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}

```
