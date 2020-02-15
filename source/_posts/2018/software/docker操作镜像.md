---
title: docker（二）镜像操作
date: 2018-06-21 00:15:12
tags: docker
categories: 软件技术
---

## 命令文档

[官方 Docker CLI 文档](https://docs.docker.com/engine/reference/commandline/docker/#child-commands)

## 获取镜像

```bash
docker pull [选项] [Docker Registry地址]<仓库名>:<标签>
```

- Docker Registry地址：地址的格式一般是 <域名/IP>[:端口号] 。默认地址是 Docker Hub。
- 仓库名：这里的仓库名是两段式名称，既 <用户名>/<软件名> 。对于 Docker Hub，如果不给出用户名，则默认为  library ，也就是官方镜像。

```bash
$ docker pull ubuntu:14.04

14.04: Pulling from library/ubuntu
bf5d46315322: Pull complete
9f13e0ac480c: Pull complete
e8988b5b3097: Pull complete
40af181810e7: Pull complete
e6f7c7e5c03e: Pull complete
Digest: sha256:147913621d9cdea08853f6ba9116c2e27a3ceffecf3b49298
3ae97c3d643fbbe
Status: Downloaded newer image for ubuntu:14.04
```

上面的命令中没有给出 Docker Registry 地址，因此将会从 `Docker Hub` 获取镜像。而镜像名称是 `ubuntu:14.04` ，因此将会获取官方镜像 `library/ubuntu` 仓库中标签为 `14.04` 的镜像。

从下载过程中可以看到我们之前提及的分层存储的概念，镜像是由多层存储所构成。下载也是一层层的去下载，并非单一文件。下载过程中给出了每一层的 ID 的前 12 位。并且下载结束后，给出该镜像完整的 sha256 的摘要，以确保下载一致性。

## 列出镜像

```bash
$ docker image ls   // 或 docker images

REPOSITORY   TAG      IMAGE ID       CREATED       SIZE
redis        latest   5f515359c7f8   5 days ago    183 MB
nginx        latest   05a60462f8ba   5 days ago    181 MB
mongo        3.2      fe9198c04d62   5 days ago    342 MB
mongo        <none>   00285df0df87   5 days ago    342 MB
ubuntu       16.04    f753707788c5   4 weeks ago   127 MB
ubuntu       latest   f753707788c5   4 weeks ago   127 MB
ubuntu       14.04    1e0c3dd64ccd   4 weeks ago   188 MB
```

1. ubuntu:16.04 官网显示 50MB，是压缩后的体积，当前是展开后体积。列表中的镜像体积总和并非是所有镜像实际硬盘消耗，因为多层存储，所以实际镜像大小的综合要小很多

2. `<none>` 这类无标签的镜像也被称为 虚悬镜像(dangling image)，由于新旧镜像同名，旧镜像名称被取消，`docker pull` 和 `docker build` 都可能导致这种现象，一般来说，虚悬镜像已经失去了存在的价值，是可以随意删除的，删除命令 `docker rmi $(docker images -q -f dangling=true)` ，显示命令 `docker images -f dangling=true`

```bash
docker image ls node      //列出特定镜像
docker system df      //查看镜像、容器、数据卷所占用的空间
docker images -f since=mongo:3.2      //列出在 mongo:3.2 之后建立的镜像，`-f` 是 filter 的缩写，`since` 表示之后，对应的 `before` 表示之前
docker image ls -q    // `-q` 表示只列出id，可以配合 `-f` 做批量操作
```

## 运行

```bash
$ docker run -it --rm ubuntu:14.04 bash

root@e7009c6ce357:/# cat /etc/os-release    // Linux 查看当前系统版本的命令
NAME="Ubuntu"
VERSION="14.04.5 LTS, Trusty Tahr"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 14.04.5 LTS"
VERSION_ID="14.04"
HOME_URL="http://www.ubuntu.com/"
SUPPORT_URL="http://help.ubuntu.com/"
BUG_REPORT_URL="http://bugs.launchpad.net/ubuntu/"
root@e7009c6ce357:/# exit
exit
$
```

- `docker run` 就是运行容器的命令
- `-it`：这是两个参数，一个是 `-i` ：交互式操作，一个是 `-t` 终端。我们这里打算进入 bash 执行一些命令并查看返回结果，因此我们需要交互式终端。
- `--rm`：这个参数是说容器退出后随之将其删除。默认情况下，为了排障需求，退出的容器并不会立即删除，除非手动 `docker rm` 。
- `ubuntu:14.04`：这是指用 ubuntu:14.04 镜像为基础来启动容器。
- `bash`：放在镜像名后的是命令，这里我们希望有个交互式 Shell，因此用的是 bash 。

```bash
docker run -d --name server1 -p 80:80 nginx
```

- `-d`：表示后台运行
- `-p`：表示端口映射，前者是宿主机的端口，后者是容器的端口
- `docker container logs servertest`查看容器的日志

容器不是虚拟机，容器是进程，因此一旦主线程退出，容器直接关闭，次线程也将退出，所以所有的命令必须在容器的前台执行，例如：`service nginx start` 会导致容器执行完直接退出。

比较

1. `docker run -it ubuntu cat /etc/os-release`和`docker run -it ubuntu bash`
2. `docker run -it -p 81:80 nginx`和 `docker run -it -p 82:80 nginx bash`

## commit构建镜像

```bash
$ docker run --name webserver -d -p 80:80 nginx   //run = create容器 + start容器
$ docker exec -it webserver bash    //进入正在运行的 container 并使用 bash
$ echo '<h1>Hello Docker!<h1>' > /usr/share/nginx/html/index.html       // 修改 nginx 文件内容
$ docker diff webserver     // 和上一层进行比较

>> C /root
>> A /root/.bash_history
>> C /run
>> A /run/nginx.pid
>> C /usr/share/nginx/html/index.html
>> C /var/cache/nginx
>> A /var/cache/nginx/client_temp
>> A /var/cache/nginx/fastcgi_temp
>> A /var/cache/nginx/proxy_temp
>> A /var/cache/nginx/scgi_temp
>> A /var/cache/nginx/uwsgi_temp

$ docker commit --author "cwj" --message "修改首页内容" webserver nginx:test      // 将webserver容器commit生成一个新的镜像为 nginx:test
$ docker history nginx:test

>> IMAGE               CREATED             CREATED BY                                      SIZE                COMMENT
>> b90c797d0416        29 minutes ago      nginx -g daemon off;                            200B                首页写改为hello world
>> c82521676580        3 days ago          /bin/sh -c #(nop)  CMD ["nginx" "-g" "daemon…   0B
>> <missing>           3 days ago          /bin/sh -c #(nop)  STOPSIGNAL [SIGTERM]         0B
>> <missing>           3 days ago          /bin/sh -c #(nop)  EXPOSE 80/tcp                0B
>> <missing>           3 days ago          /bin/sh -c ln -sf /dev/stdout /var/log/nginx…   22B
>> <missing>           3 days ago          /bin/sh -c set -x  && apt-get update  && apt…   53.7MB
>> <missing>           3 days ago          /bin/sh -c #(nop)  ENV NJS_VERSION=1.15.2.0.…   0B
>> <missing>           3 days ago          /bin/sh -c #(nop)  ENV NGINX_VERSION=1.15.2-…   0B
>> <missing>           11 days ago         /bin/sh -c #(nop)  LABEL maintainer=NGINX Do…   0B
>> <missing>           11 days ago         /bin/sh -c #(nop)  CMD ["bash"]                 0B
>> <missing>           11 days ago         /bin/sh -c #(nop) ADD file:919939fa022472751…   55.3MB
```

### 慎用 docker commit

`docker commit` 命令虽然可以比较直观的帮助理解镜像分层存储的概念，但是实际环境中并不会这样使用。命令的执行，会改动和添加很多文件，因此我们无法通过 `docker history nginx:test` 知道制作镜像的过程中进行什么操作，这种镜像被称为黑箱镜像。

`docker commit` 命令除了学习之外，还有一些特殊的应用场合，比如被入侵后保存现场等。但是，不要使用 `docker commit` 定制镜像，定制行为应该使用 `Dockerfile` 来完成。