---
title: Kubernates 进阶
date: 2022-03-04 00:24:00
tags: Kubernates
categories: 软件技术
---

## 架构

### 节点

节点（node）指的是一个工作机器，不同的集群中，节点可能是虚拟机也可能是物理机。每个节点都由 master 组件管理，并包含了运行 Pod（容器组）所需的服务。这些服务包括：容器引擎、kubelet、kube-proxy。

节点的状态包含如下信息：

1. Addresses：依据你集群部署的方式（在哪个云供应商部署，或是在物理机上部署），Addesses 字段可能有所不同。
2. Conditions：描述了节点的状态。
   - OutOfDisk：如果节点上的空白磁盘空间不够，不能够再添加新的节点时，该字段为 True，其他情况为 False
   - Ready：如果节点是健康的且已经就绪可以接受新的 Pod。则节点 Ready 字段为 True。False 表明了该节点不健康，不能够接受新的 Pod。
   - MemoryPressure：如果节点内存紧张，则该字段为 True，否则为 False
   - PIDPressure：如果节点上进程过多，则该字段为 True，否则为 False
   - DiskPressure：如果节点磁盘空间紧张，则该字段为 True，否则为 False
   - NetworkUnvailable：如果节点的网络配置有问题，则该字段为 True，否则为 False
3. Capacity and Allocatable：容量和可分配量描述了节点上的可用资源的情况：CPU、内存、该节点可调度的最大 pod 数量
4. Info：描述了节点的基本信息，例如：Linux 内核版本、Kubernetes 版本（kubelet 和 kube-proxy 的版本）、Docker 版本、操作系统名称

### 节点管理

节点是一台物理或虚拟的机器，它不是由 Kubernetes 创建出来的，向 Kubernetes 中创建节点时，仅仅是创建了一个描述该节点的 API 对象。节点 API 对象创建成功后，Kubernetes 将检查该节点是否有效。例如，假设您创建如下节点信息：

```yml
kind: Node
apiVersion: v1
metadata:
  name: "10.240.79.157"
  labels:
    name: "my-first-k8s-node"
```

Kubernetes 在 APIServer 上创建一个节点 API 对象（节点的描述），并且基于 `metadata.name` 字段对节点进行健康检查。如果节点有效（节点组件正在运行），则可以向该节点调度 Pod；否则，该节点 API 对象将被忽略，直到节点变为有效状态。

#### 节点控制器（Node Controller）

节点控制器是一个负责管理节点的 Kubernetes master 组件。在节点的生命周期中，节点控制器起到了许多作用。

- 在注册节点时为节点分配 CIDR 地址块
- 通过云供应商（cloud-controller-manager）接口检查节点列表中每一个节点对象对应的虚拟机是否可用。只要节点状态异常，自动将节点对象从 APIServer 中删除。
- 节点控制器监控节点的健康状况。
- 当节点变得不可触达时（例如，由于节点已停机，节点控制器不再收到来自节点的心跳信号），节点控制器将节点 API 对象的 NodeStatus Condition 取值从 NodeReady 更新为 Unknown；然后在等待 pod-eviction-timeout 时间后，将节点上的所有 Pod 从节点驱逐。

#### 节点自注册

如果 kubelet 的启动参数 --register-node 为 true（默认为 true），kubelet 会尝试将自己注册到 API Server。

#### 手动管理节点

集群管理员可以创建和修改节点 API 对象，如果管理员想要手工创建节点 API 对象，可以将 kubelet 的启动参数 --register-node 设置为 false。

#### 节点容量

节点 API 对象中描述了节点的容量（Capacity），例如，CPU 数量、内存大小等信息。通常，节点在向 APIServer 注册的同时，在节点 API 对象里汇报了其容量（Capacity）。

### 控制器

控制器它不断监控着集群的状态，并对集群做出对应的变更调整。每一个控制器都不断地尝试着将当前状态调整到目标状态。

在 Kubernetes 中，每个控制器至少追踪一种类型的资源。这些资源对象中有一个 spec 字段代表了目标状态。以 Kubernetes 中自带的一个控制器 Job Controller 为例，一个 Job 将运行一个（或多个）Pod，执行一项任务，然后停止，Job Controller 自己并不执行任何 Pod 或容器，而是发消息给 API Server，由其他的控制组件配合 API Server，以执行创建或删除 Pod 的实际动作。

控制器同样也会更新其关注的 API 对象。例如：一旦 Job 的任务执行结束，Job Controller 将更新 Job 的 API 对象，将其标注为 Finished。

这种通过控制器监控集群状态并利用负反馈原理不断接近目标状态的系统，相较于那种完成安装后就不再改变的系统，是一种更高级的系统形态，尤其是在您将运行一个大规模的复杂集群的情况下。

## 操作 Kubernetes

### Kubernetes 对象

在 .yaml 文件中，如下字段是必须填写的：

- apiVersion 用来创建对象时所使用的 Kubernetes API 版本
- kind 被创建对象的类型
- metadata 用于唯一确定该对象的元数据：包括 name 和 namespace，如果 namespace 为空，则默认值为 default
- spec 描述您对该对象的期望状态

不同类型的 Kubernetes，其 spec 对象的格式不同（含有不同的内嵌字段），通过 [API 手册](https://kubernetes.io/docs/reference/#api-reference)可以查看 Kubernetes 对象的字段和描述。

### 名称空间和名称

可以通过 `namespace + name` 唯一性地确定一个 RESTFUL 对象，例如：`/api/v1/namespaces/{namespace}/pods/{name}`

名称空间的用途是，为不同团队的用户（或项目）提供虚拟的集群空间，也可以用来区分开发环境/测试环境、准上线环境/生产环境。名称空间不可以嵌套，任何一个 Kubernetes 对象只能在一个名称空间中。名称空间内部的同类型对象不能重名

当 Kubernetes 对象之间的差异不大时，无需使用名称空间来区分，例如，同一个软件的不同版本，只需要使用 labels 来区分即可。

Kubernetes 安装成功后，默认有初始化了三个名称空间：

- default 默认名称空间，如果 Kubernetes 对象中不定义 `metadata.namespace` 字段，该对象将放在此名称空间下
- kube-system Kubernetes 系统创建的对象放在此名称空间下
- kube-public 此名称空间自动在安装集群是自动创建，并且所有用户都是可以读取的（即使是那些未登录的用户）。主要是为集群预留的，例如，某些情况下，某些 Kubernetes 对象应该被所有集群用户看到。

### 标签和选择器

标签（Label）是附加在 Kubernetes 对象上的一组名值对，其意图是按照对用户有意义的方式来标识 Kubernetes 对象，同时，又不对 Kubernetes 的核心逻辑产生影响。

```yml
metadata:
  labels:
    key1: value1
    key2: value2
```

使用标签，用户可以按照自己期望的形式组织 Kubernetes 对象之间的结构，而无需对 Kubernetes 有任何修改。

通常来讲，会有多个 Kubernetes 对象包含相同的标签。通过使用标签选择器（label selector），用户/客户端可以选择一组对象。标签选择器（label selector）是 Kubernetes 中最主要的分类和筛选手段。

Kubernetes api server 支持两种形式的标签选择器，`equality-based` 基于等式的 和 `set-based` 基于集合的。标签选择器可以包含多个条件，并使用逗号分隔，此时只有满足所有条件的 Kubernetes 对象才会被选中。

#### 基于等式的选择方式

