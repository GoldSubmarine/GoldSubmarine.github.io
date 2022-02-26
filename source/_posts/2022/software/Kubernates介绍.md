---
title: Kubernates 介绍
date: 2022-02-19 17:04:00
tags: Kubernates
categories: 软件技术
---

## 回顾

- 传统部署时代：一台物理机部署多个应用，应用之间的资源消耗互相影响。
- 虚拟化时代：在一台物理机上运行多个虚拟机，每个虚拟机可以被认为是一台完整的机器。限制了应用程序之间的互相访问，保障安全性
- 容器化时代：与虚拟机类似，但更为轻量。是在一个操作系统上进行命名空间的隔离，每个容器拥有自己的文件系统、CPU、内存、进程空间

## Kubernetes 的功能

在一台操作系统上进行容器化部署，那就要求对容器进行方便的统一管理，Kubernetes 应运而生。

特性：

- 服务发现和负载均衡：通过 DNS 或 IP 方式暴露容器的访问方式，可以在同组容器内分发负载实现负载均衡
- 存储编排：自动挂载指定的存储系统，local stroage/nfs/云存储等
- 发布和回滚：声明您期望应用程序容器应该达到的状态，Kubernetes 将以合适的速率调整容器的实际状态，并逐步达到最终期望的结果。
- 自愈：重启已经停机的容器、替换或 kill 那些不满足自定义健康检查条件的容器、在容器就绪之前，避免调用者发现该容器
- 密钥及配置管理：可以存储和管理敏感信息，例如密码或证书

## 组件

### Master 组件

集群的控制平台，负责集群中的全局决策（例如，调度）探测并响应集群事件（例如，当 Deployment 的实际 Pod 副本数未达到 replicas 字段的规定时，启动一个新的 Pod）

Master 组件可以运行于集群中的任何机器上。但是，为了简洁性，通常在同一台机器上运行所有的 master 组件，且不在此机器上运行用户的容器。

#### kube-apiserver

此 master 组件提供 Kubernetes API。这是 Kubernetes 控制平台的前端，可以水平扩展（通过部署更多的实例以达到性能要求）。kubectl / kubernetes dashboard / kuboard 等 Kubernetes 管理工具就是通过 kubernetes API 实现对 Kubernetes 集群的管理。

#### etcd

支持一致性和高可用的名值对存储组件，Kubernetes 集群的所有配置信息都存储在 etcd 中。请确保[备份](https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/#backing-up-an-etcd-cluster)了 etcd 的数据。

#### kube-scheduler

监控所有新创建尚未分配到节点上的 Pod，并且自动为 Pod 选择一个合适的节点去运行。

影响调度的因素有：

- 单个或多个 Pod 的资源需求
- 硬件、软件、策略的限制
- 亲和与反亲和（affinity and anti-affinity）的约定
- 数据本地化要求
- 工作负载间的相互作用

#### kube-controller-manager

此 master 组件运行了所有的控制器，逻辑上来说，每一个控制器是一个独立的进程，但是为了降低复杂度，这些控制器都被合并运行在一个进程里。

包含的控制器有：

- 节点控制器： 负责监听节点停机的事件并作出对应响应
- 负责为集群中每一个 副本控制器对象维护期望的 Pod 副本数
- 端点控制器：负责为端点对象赋值
- Service Account & Token 控制器： 负责为新的名称空间创建 default Service Account 以及 API Access Token

#### cloud-controller-manager

运行与具体云基础设施供应商互动的控制器。特定于云供应商的代码将由云供应商自行维护，并在运行 Kubernetes 时链接到 cloud-controller-manager。

以下控制器中包含与云供应商相关的依赖：

- 节点控制器：当某一个节点停止响应时，调用云供应商的接口，以检查该节点的虚拟机是否已经被云供应商删除
- 路由控制器：在云供应商的基础设施中设定网络路由
- 服务（Service）控制器：创建、更新、删除云供应商提供的负载均衡器
- 数据卷（Volume）控制器：创建、绑定、挂载数据卷，并协调云供应商编排数据卷

### Node 组件

Node 组件运行在每一个节点上（包括 master 节点和 worker 节点），负责维护运行中的 Pod 并提供 Kubernetes 运行时环境。

#### kubelet

此组件是运行在每一个集群节点上的代理程序。它确保 Pod 中的容器处于运行状态。

#### kube-proxy

一个网络代理程序，运行在集群中的每一个节点上，是实现 Kubernetes Service 概念的重要部分。

负责在节点上维护网络规则，这些网络规则使得您可以在集群内、集群外正确地与 Pod 进行网络通信。

#### 容器引擎

容器引擎负责运行容器。Kubernetes 支持多种容器引擎：Docker、containerd、cri-o、rktlet 以及任何实现了 Kubernetes 容器引擎接口的容器引擎

### Addons

提供集群级别的功能特性，addons 使用到的 Kubernetes 资源都放置在 kube-system 名称空间下。

#### DNS

除了 DNS Addon 以外，其他的 addon 都不是必须的，所有 Kubernetes 集群都应该有 Cluster DNS。

存放了 Kubernetes Service 的 DNS 记录，Kubernetes 启动容器时，自动将该 DNS 服务器加入到容器的 DNS 搜索列表中。

#### Web UI（Dashboard）

[Dashboard](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/) 是一个 Kubernetes 集群的 Web 管理界面。用户可以通过该界面管理集群。

#### ContainerResource Monitoring

[Container Resource Monitoring](https://kubernetes.io/docs/tasks/debug-application-cluster/resource-usage-monitoring/)将容器的度量指标（metrics）记录在时间序列数据库中，并提供了 UI 界面查看这些数据

#### Cluster-level Logging

[Cluster-level logging](https://kubernetes.io/docs/concepts/cluster-administration/logging/)机制负责将容器的日志存储到一个统一存储中，并提供搜索浏览的界面
