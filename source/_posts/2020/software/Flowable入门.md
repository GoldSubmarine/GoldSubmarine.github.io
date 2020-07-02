---
title: Flowable 入门
date: 2020-07-02 15:45:00
tags: Flowable
categories: 软件技术
---

# 技术选型

Flowable、Activiti、camunda 关系

# 集成springboot

http://www.shareniu.com/flowable6.5_zh_document/bpm/index.html#springSpringBoot

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.flowable</groupId>
    <artifactId>flowable-spring-boot-starter</artifactId>
    <version>${flowable.version}</version>
</dependency>
```

```yml
# application.yml
flowable:
  database-schema-update: true
  async-executor-activate: false
  dmn:
    enabled: false
  cmmn:
    enabled: false
  content:
    enabled: true
  app:
    enabled: false
  idm:
    enabled: false
  rest-api-enabled: false
```

注意: jdbc连接要配上参数 `&nullCatalogMeansCurrent=true`，否则创建表会失败.
