---
title: Kubernates 入门
date: 2022-02-26 16:42:00
tags: Kubernates
categories: 软件技术
---

Kubernetes 能够对容器化软件进行部署管理，在不停机的前提下提供简单快速的发布和更新方式。换句话说，如果项目需要多机器节点的微服务架构，并且采用 Docker image（镜像）进行容器化部署，那么 k8s 可以帮助我们屏蔽掉集群的复杂性，自动选择最优资源分配方式进行部署。

## 集群简单介绍

![20220226171353](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220226171353.png)

Master 负责管理集群 负责协调集群中的所有活动，例如调度应用程序，维护应用程序的状态，扩展和更新应用程序。

Worker 节点(即图中的 Node)是 VM(虚拟机)或物理计算机，充当 k8s 集群中的工作计算机。 每个 Worker 节点都有一个 Kubelet，它管理该 Worker 节点并负责与 Master 节点通信。该 Worker 节点还应具有用于处理容器操作的工具，例如 Docker。

## Deployment

首先需要了解一个基本概念 Deployment，译为部署。在 k8s 中，通过发布 Deployment，可以创建应用程序 (docker image) 的实例 (docker container)，这个实例会被包含在称为 Pod 的概念中，Pod 是 k8s 中最小可管理单元。

![20220228000141](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220228000141.png)

Deployment 处于 master 节点上，通过发布 Deployment，master 节点会选择合适的 worker 节点创建 Container（即图中的正方体），Container 会被包含在 Pod （即蓝色圆圈）里。

创建应用程序实例后，Kubernetes Deployment Controller 会持续监控这些实例。如果运行实例的 worker 节点关机或被删除，则 Kubernetes Deployment Controller 将在群集中资源最优的另一个 worker 节点上重新创建一个新的实例。这提供了一种自我修复机制来解决机器故障或维护问题。

## Pod

![20220228003220](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220228003220.png)

Pod 容器组 是一个 k8s 中一个抽象的概念，用于存放一组 container（可包含一个或多个 container 容器，即图上正方体)，以及这些 container （容器）的一些共享资源。这些资源包括：

- 共享存储，称为卷(Volumes)，即图上紫色圆柱
- 网络，每个 Pod（容器组）在集群中有个唯一的 IP，pod（容器组）中的 container（容器）共享该 IP 地址
- 共享 IP 地址和端口空间，同一个 Pod 内的容器可以使用 localhost + 端口号互相访问，始终位于同一位置并共同调度

Pod（容器组）是 k8s 集群上的最基本的单元。当我们在 k8s 上创建 Deployment 时，会在集群上创建包含容器的 Pod (而不是直接创建容器)。每个 Pod 都与运行它的 worker 节点（Node）绑定，并保持在那里直到终止或被删除。如果节点（Node）发生故障，则会在群集中的其他可用节点（Node）上运行相同的 Pod（从同样的镜像创建 Container，使用同样的配置，IP 地址不同，Pod 名字不同）。

## Node

![20220228005002](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220228005002.png)

Node（节点）是 kubernetes 集群中的计算机，可以是虚拟机或物理机。Pod（容器组）总是在 Node（节点） 上运行。每个 Node（节点）都由 master 管理。一个 Node（节点）可以有多个 Pod（容器组），kubernetes master 会根据每个 Node（节点）上可用资源的情况，自动调度 Pod（容器组）到最佳的 Node（节点）上。

每个 Kubernetes Node（节点）至少运行：

- Kubelet，负责 master 节点和 worker 节点之间通信的进程；管理 Pod（容器组）和 Pod（容器组）内运行的 Container（容器）。
- 容器运行环境（如 Docker）负责下载镜像、创建和运行容器等。

## 部署 nginx Deployment

使用 kubectl 部署 nginx，创建文件 nginx-deployment.yaml，内容如下：

```yml
apiVersion: apps/v1 #与k8s集群版本有关，使用 kubectl api-versions 即可查看当前集群支持的版本
kind: Deployment #该配置的类型，我们使用的是 Deployment
metadata: #译名为元数据，即 Deployment 的一些基本属性和信息
  name: nginx-deployment #Deployment 的名称
  labels: #标签，可以灵活定位一个或多个资源，其中key和value均可自定义，可以定义多组，目前不需要理解
    app: nginx #为该Deployment设置key为app，value为nginx的标签
spec: #这是关于该Deployment的描述，可以理解为你期待该Deployment在k8s中如何使用
  replicas: 1 #使用该Deployment创建一个应用程序实例
  selector: #标签选择器，与上面的标签共同作用，目前不需要理解
    matchLabels: #选择包含标签app:nginx的资源
      app: nginx
  template: #这是选择或创建的Pod的模板
    metadata: #Pod的元数据
      labels: #Pod的标签，上面的selector即选择包含标签app:nginx的Pod
        app: nginx
    spec: #期望Pod实现的功能（即在pod中部署）
      containers: #生成container，与docker中的container是同一种
        - name: nginx #container的名称
          image: nginx:1.7.9 #使用镜像nginx:1.7.9创建container，该container默认80端口可访问
```

应用 YAML 文件

```bash
kubectl apply -f nginx-deployment.yaml
```

查看部署结果

```bash
# 查看 Deployment
kubectl get deployments

# 查看 Pod
kubectl get pods
```
