# docker笔记（一）镜像、容器、仓库、安装

## 注意

所有的实例只是用于演示，不需记住任何命令，重点在于理解概念，具体命令行操作直接使用 `docker --help` 来查询。

## 优势

特性 | 容器 | 虚拟机
:-----------: | :-----------: | :-----------:
启动           | 秒级                | 分钟级
硬盘使用       | 一般为 MB            | 一般为 GB
性能           | 接近原生             | 弱于
系统支持量      | 单机支持上千个容器   | 一般几十个

## 基本概念

Docker 包括三个基本概念：镜像、容器、仓库。理解了这三个概念，就理解了 Docker 的整个生命周期。

### 镜像（Image）

1. Docker 镜像是一个特殊的文件系统，除了提供容器运行时所需的程序、库、资源、配置等文件外，还包含了一些为运行时准备的一些配置参数（如匿名卷、环境变量、用户等）。镜像不包含任何动态数据，其内容在构建之后也不会被改变。

2. 分层存储，Docker 设计时，就充分利用 Union FS 的技术，将其设计为分层存储的架构。镜像并非是像一个 ISO 那样的打包文件，其实际体现是由一组文件系统组成，或者说，由多层文件系统联合组成。镜像构建时，会一层层构建，前一层是后一层的基础。每一层构建完就不会再发生改变，后一层上的任何改变只发生在自己这一层。

### 容器（Container）

1. 镜像（Image）和容器（Container）的关系，就像是面向对象程序设计中的 类 和 实例 一样，镜像是静态的定义，容器是镜像运行时的实体。容器可以被创建、启动、停止、删除、暂停等。

2. 容器的实质是进程，但与直接在宿主执行的进程不同，容器进程运行于属于自己的独立的 命名空间。因此容器可以拥有自己的 root 文件系统、自己的网络配置、自己的进程空间，甚至自己的用户 ID 空间。容器内的进程是运行在一个隔离的环境里，使用起来，就好像是在一个独立于宿主的系统下操作一样。

3. 分层存储，每一个容器运行时，是以镜像为基础层，在其上创建一个当前容器的存储层，我们可以称这个为容器运行时读写而准备的存储层为容器存储层。

4. 按照 Docker 最佳实践的要求，容器不应该向其存储层内写入任何数据，容器存储层要保持无状态化。所有的文件写入操作，都应该使用 数据卷（Volume）、或者绑定宿主目录，在这些位置的读写会跳过容器存储层，直接对宿主(或网络存储)发生读写，其性能和稳定性更高。

### 仓库（Repository）

1. 理解为 maven 或 npm

2. 我们可以通过 <仓库名>:<标签> 的格式来指定具体是这个软件哪个版本的镜像。如果不给出标签，将以 latest 作为默认标签。例如：ubuntu:14.04 或 jwilder/nginx-proxy:1.2

3. 镜像服务：阿里云加速器、DaoCloud 加速器、灵雀云加速器

4. 私有 Docker Registry，。Docker 官方提供了 Docker Registry 镜像，可以直接使用做为私有 Registry 服务。除了官方的 Docker Registry 外，还有第三方软件实现了 Docker Registry API，甚至提供了用户界面以及一些高级功能。

## 安装

Docker 最低支持 CentOS 7

docker 官方镜像源：https://registry.docker-cn.com

aliyun 镜像源：https://dev.aliyun.com/search.html

```bash
curl -sSL https://get.docker.com/ | sh      // Docker 官方提供了一键安装脚本
curl -sSL http://acs-public-mirror.oss-cn-hangzhou.aliyuncs.com/
docker-engine/internet | sh -       // 阿里云的安装脚本
curl -sSL https://get.daocloud.io/docker | sh       // DaoCloud 的安装脚本
```

检查安装成功

```bash
$ docker --version
Docker version 1.12.3, build 6b644ec    //版本后来按年份命名
$ docker-compose --version
docker-compose version 1.8.1, build 878cff1
$ docker-machine --version
docker-machine version 0.8.2, build e18a919

$ docker run -d -p 80:80 --name webserver1 nginx     //启动nginx服务
$ docker stop webserver1
$ docker rm webserver1
```