---
title: Elasticsearch
date: 2018-09-06 00:15:12
tags: Elasticsearch
categories: 软件技术
---

一个分布式全文搜索引擎，它可以快速地储存、搜索和分析海量数据，底层是开源库 Lucene。

## 安装和启动

Elastic 需要 Java 8 环境，注意要保证环境变量JAVA_HOME正确设置。

直接从[官网](https://www.elastic.co/downloads/elasticsearch)下载压缩包，解压后进入目录，运行下面的命令，即可启动Elastic。

```bash
./bin/elasticsearch
```

如果这时[报错](https://github.com/spujadas/elk-docker/issues/92)"max virtual memory areas vm.maxmapcount [65530] is too low"，要运行下面的命令。

```bash
sudo sysctl -w vm.max_map_count=262144
```

运行成功后，在浏览器中访问 http://localhost:9200

```json
{
    name: "WaillK8",
    cluster_name: "elasticsearch",
    cluster_uuid: "TuhiSwBhR96OAa_s2yLxEg",
    version: {
        number: "6.4.2",
        build_flavor: "default",
        build_type: "zip",
        build_hash: "04711c2",
        build_date: "2018-09-26T13:34:09.098244Z",
        build_snapshot: false,
        lucene_version: "7.4.0",
        minimum_wire_compatibility_version: "5.6.0",
        minimum_index_compatibility_version: "5.0.0"
    },
    tagline: "You Know, for Search"
}
```

可以看到，默认节点(node)的name为WaillK8，默认的集群(cluster)名称为elasticsearch，当然，也可以在启动命令中自定义节点名称和集群名称，如下：

```bash
./bin/elasticsearch -d -Ecluster.name=my_cluster -Enode.name=node_1
```

刚刚的启动方式是前台运行，也可以通过 `./elasticsearch -d` 在后台启动。使用 java 的进程工具 `jps` 或 `ps -e | grep elasticsearch` 查看进程的pid。

## 目录结构

|文件/文件夹|作用|
|:--------:|:---|
|bin	        |可执行文件存放目录，例如启动文件|
|config	        |配置文件存放目录|
|data	        |数据存储目录|
|lib	        |第三方依赖库|
|logs	        |运行日志输出目录|
|modules	    |依赖模块目录|
|plugins	    |插件目录|
|LICENSE.txt	|LICENSE声明文件|
|NOTICE.txt	    |版权声明文件|
|README.textile	|框架介绍信息|

## 配置介绍

我们经常涉及到的有三个，elasticsearch.yml、log4j2.properties以及jvm.options。这里主要来看看elasticsearch.yml配置文件，如下：

```bash
# 集群配置
#配置集群名字，集群名字默认为elasticsearch，
#elasticsearch会自动发现在同一网段下的elasticsearch节点。
#读者在第一次启动elasticsearch时，在浏览器中输入http://localhost:9200，
#在返回的数据中，就有集群名字，默认即为elasticsearch。

#cluster.name: my-application

# 节点配置
#配置节点名称
#node.name: node-1
#给节点添加自定义属性

#node.attr.rack: r1

# 路径配置
#数据存放目录，默认是elasticsearch下的data目录，可以指定多个目录，用,隔开，如：

#path.data:/path/data1,/path/data2

#path.data: /path/to/data

#日志存放目录，默认为elasticsearch下的logs目录

#path.logs: /path/to/logs

# 内存配置
#配置是否锁住内存。当jvm开始swapping时，elasticsearch的效率降低，为了避免这种情况，可以设置为true。

#bootstrap.memory_lock: true

# 网络配置
#设置绑定的ip地址

#network.host: 192.168.0.1

#配置对外提供服务的http端口号

#http.port: 9200

# 集群节点发现参数
#设置集群中master节点的初始列表，通过这个配置可以发现新加入的集群的节点。

#discovery.zen.ping.unicast.hosts: ["host1", "host2"]

#保证集群中的节点可以知道其他n个有master资格的节点，防止出现split brain，默认为1

#discovery.zen.minimum_master_nodes:

#当n个节点启动后，再开始集群的恢复

#gateway.recover_after_nodes: 3
```

## 基本概念

### 集群(cluster)

一个集群就是由一个或多个节点组织在一起， 这些节点共同持有全部的索引数据， 并共同提供索引和搜索功能。一个集群有一个唯一的名字标识，这个名字很重要， 因为一个节点只能通过指定某个集群的名字，来加入这个集群，相当于命名空间。在生产环境中应显式地设定这个名字，而不是使用默认的"elasticsearch"，以防止名称重复。

### 节点(node)

集群由一个或多个节点组成，一个节点就是集群中的一个服务。每个节点也用一个名字来标识。默认情况下是一个随机的UUID。开发者根据这个名字来确定网络中的哪些服务对应于集群中的哪些节点。

一个节点可以通过配置集群名称的方式来加入一个指定的集群。如果开发者启动了多个节点， 这些节点能够相互发现彼此，且配置的集群名称相同，那么这些节点会自动加入集群中。集群里可以拥有任意多个节点，只有一个节点也可以被称为单节点集群。

可以理解为一个 **进程** 服务就是一个节点。

### 索引(index)

可以理解为一个数据库，在一个集群中，可以创建任意多个索引。

### 文档(document)

一个文档就是数据库中的一条数据。许多条 Document 构成了一个 Index。

### 类型(type)

理解为数据库中的 **表** ，一个类型是你的索引的一个 **逻辑** 上的分类/分区，通常，会为具有一组相同字段的文档定义一个类型。比如说，我们假设你运营一个博客平台 并且将你所有的数据存储到一个索引中。在这个索引中，你可以为用户数据定义一个类型，为博客数据定义另一个类型，当然，也可以为评论数据定义另一个类型。

**注意：** 这是一个即将 **废弃** 的概念，在Elasticsearch 6.0.0或更高版本中创建的索引只包含单个映射类型（type）。在具有多种映射类型的5.x中创建的索引将继续像以前一样在6.x中运行。映射类型将在7.0.0中完全删除。

### 分片和复制(shards and replicas)

假设某个索引要存10亿条文档，一台服务器存不下，为了解决这个问题，Elasticsearch提供了将索引划分成多片的能力，这些片叫做分片。

当用户创建一个索引的时候，可以指定分片的数量（默为5，但是在7.0版本中默认会变为1）。每个分片本身也是一个功能完善并且独立的“索引”，这个“索引” 可以被放置到集群中的任何节点上。

分片的好处有两点：

- 允许水平分割/扩展内容容量
- 允许在分片（位于多个节点上）之上进行分布式的、并行的操作，进而提高性能/吞吐量

至于一个分片怎样分布，它的文档怎样聚合回搜索请求，是完全由Elasticsearch管理的。在一个网络/云的环境里，失败随时都可能发生。在某个分片/节点因为某些原因处于离线状态或者消失的情况下，需要备份数据，部署到新的机器上。为此， Elasticsearch允许创建分片的一份或多份拷贝，这些拷贝叫做复制分片，或者直接叫复制。