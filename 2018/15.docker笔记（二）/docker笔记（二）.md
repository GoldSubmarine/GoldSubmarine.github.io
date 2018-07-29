# docker笔记（二）获取、运行

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

## 使用 Dockerfile 定制镜像

我们可以把每一层修改、安装、构建、操作的命令都写入一个脚本，用这个脚本来构建、定制镜像，这个脚本就是Dockerfile。

```bash
mkdir mynginx
cd mynginx
touch Dockerfile
```

### FROM 命令

```dockerfile
FROM nginx      //指定上一个 image ，切必须位于第一行
RUN echo '<h1>Hello, Docker!</h1>' > /usr/share/nginx/html/index.html
```

在 Docker Hub 上有非常多的高质量的官方镜像， 有可以直接拿来使用的服务类的镜像，如 nginx 、 redis 、 mongo 、 mysql 、 httpd 、 php 、 tomcat 等； 也有一些方便开发、构建、运行各种语言应用的镜像，如 node 、 openjdk 、 python 、 ruby 、 golang 等。如果没有找到对应服务的镜像，官方还提供了一些更为基础的操作系统镜像，如 ubuntu 、 debian 、 centos 、 fedora 、 alpine 等。

除了选择现有镜像为基础镜像外，Docker 还存在一个特殊的镜像，名为 `scratch` 。这个镜像是虚拟的概念，并不实际存在，它表示一个空白的镜像。

```dockerfile
FROM scratch
...
```

如果你以 scratch 为基础镜像的话，意味着你不以任何系统和镜像为基础，接下来所写的指令将作为镜像第一层开始存在。
不以任何系统为基础，直接将可执行文件复制进镜像的做法并不少见，比如 swarm 、 coreos/etcd 。对于 Linux 下静态编译的程序来说，并不需要有操作系统提供运行时支持，所需的一切库都已经在可执行文件里了，因此直接 `FROM scratch` 会让镜像体积更加小巧。使用 Go 语言开发的应用很多会使用这种方式来制作镜像，这也是为什么有人认为 Go 是特别适合容器微服务架构的语言的原因之一。

### RUN 执行命令

CMD 指令的格式和 RUN 相似，也是两种格式：

- shell 格式： CMD <命令>       //实际执行的是 CMD [sh, -c, <命令>]
- exec 格式： CMD ["可执行文件", "参数1", "参数2"...]

```dockerfile
FROM debian:jessie
RUN apt-get update
RUN apt-get install -y gcc libc6-dev make
RUN wget -O redis.tar.gz "http://download.redis.io/releases/redis-3.2.5.tar.gz"
RUN mkdir -p /usr/src/redis
RUN tar -xzf redis.tar.gz -C /usr/src/redis --strip-components=1
RUN make -C /usr/src/redis
RUN make -C /usr/src/redis install
```

之前说过，Dockerfile 中每一个指令都会建立一层， RUN 也不例外。每一个 RUN 的行为，就和刚才我们手工建立镜像的过程一样：新建立一层，在其上执行这些命令，执行结束后， commit 这一层的修改，构成新的镜像。Union FS 是有最大层数限制的，比如 AUFS，曾经是最大不得超过 42 层，现在是不得超过 127 层。

上面的 Dockerfile 正确的写法应该是这样：

```dockerfile
FROM debian:jessie
RUN buildDeps='gcc libc6-dev make' \
&& apt-get update \
&& apt-get install -y $buildDeps \
&& wget -O redis.tar.gz "http://download.redis.io/releases/redis-3.2.5.tar.gz" \
&& mkdir -p /usr/src/redis \
&& tar -xzf redis.tar.gz -C /usr/src/redis --strip-components=1 \
&& make -C /usr/src/redis \
&& make -C /usr/src/redis install \
&& rm -rf /var/lib/apt/lists/* \
&& rm redis.tar.gz \
&& rm -r /usr/src/redis \
&& apt-get purge -y --auto-remove $buildDeps
```

镜像构建时，一定要确保每一层只添加真正需要添加的东西，任何无关的东西都应该清理掉。

### 构建镜像

```dockerfile
FROM nginx
RUN echo '<h1>Hello Docker!</h1>' > /usr/share/nginx/html/index.html \
&& echo '<p>2018/07/29</p>' >> /usr/share/nginx/html/index.html
USER cwj
LABEL version="1.0"
LABEL description="测试用的nginx"
```

构建命令：`docker build [选项] <上下文路径/URL/->` 实例： `$ docker build -t nginx:test .` **注意最后的 `.`**

> 上下文路径是指定构建的根目录。

Docker 在运行时分为 Docker 引擎（也就是服务端守护进程）和客户端工具，是C/S架构，客户端会把指定的上下文路径下的所有文件打包(不需要打包的文件放入`.dockerignore`中)，再发送到服务器端，由服务器完成镜像的构建。本质上客户端只发送指令，所有的操作都是由服务器端完成，就是terminal和server的关系。

举例：`COPY ./package.json /app/`，这里的 `./package.json` 指的是根路径下的 `package.json` ，所以 `COPY ../xxx /app/` 或 `COPY /usr/xxx /app/` 都是无效的。

### COPY 指令

`COPY <源路径>... <目标路径>`

COPY 指令将从构建上下文目录中 <源路径> 的文件/目录，复制到新的一层的镜像内的 <目标路径> 位置。比如：

```dockerfile
FROM nginx
COPY ./index.html /usr/src/mynginx/
RUN cat /usr/src/mynginx/index.html > /usr/share/nginx/html/index.html \
&& echo '<p>2018/07/29</p>' >> /usr/share/nginx/html/index.html
LABEL version="1.0"
LABEL description="测试用的nginx"
```

- <源路径> 可以是多个，甚至可以是通配符，其通配符规则要满足 Go 的 [filepath.Match](https://golang.org/pkg/path/filepath/#Match) 规则，如：`COPY hom* /mydir/` ， `COPY hom?.txt /mydir/`
- 如果`/usr/src/mynginx/`目录不存在，会自动创建改目录
- 目标路径也可以是相对于工作目录的相对路径(工作目录可以用 `WORKDIR` 指令来指定)
- 使用 COPY 指令，源文件的各种元数据都会保留。比如读、写、执行权限、文件变更时间等。

### ADD 指令（了解，不实用）

ADD 指令和 COPY 的格式和性质基本一致。但是在 COPY 基础上增加了一些功能。比如 <源路径> 可以是一个 URL ，，Docker 引擎会试图去下载这个链接的文件放到 <目标路径> 去。下载后的文件权限自动设置为 600 ，如果这并不是想要的权限，那么还需要增加额外的一层 RUN 进行权限调整。如果下载的是个压缩包，需要解压缩，也一样还需要额外的一层 RUN 指令进行解压缩。

在 Docker 官方的最佳实践文档中要求，尽可能的使用 COPY ，因为 COPY 的语义很明确，就是复制文件而已，而 ADD 则包含了更复杂的功能，其行为也不一定很清晰。

### CMD 容器启动命令

CMD 指令的格式和 RUN 相似，也是两种格式：

- shell 格式： CMD <命令>       //实际执行的是 CMD [sh, -c, <命令>]
- exec 格式： CMD ["可执行文件", "参数1", "参数2"...]
- 参数列表格式： CMD ["参数1", "参数2"...] 。在指定了 ENTRYPOINT 指令后，用 CMD 指定具体的参数。

只可以出现一次，如果写了多个，只有最后一个生效。

Docker 不是虚拟机，容器就是进程。既然是进程，那么在启动容器的时候，需要指定所运行的程序及参数。CMD 指令就是用于指定默认的容器主进程的启动命令的。比如， ubuntu 镜像默认的 CMD 是 `/bin/bash` ，在运行时可以指定新的命令来替代镜像设置中的这个默认命令，比如：`docker run -it ubuntu cat /etc/os-release`

一些初学者将 CMD 写为：`CMD service nginx start` 然后发现容器执行后就立即退出了。对于容器而言，其启动程序就是容器应用进程，容器就是为了主进程而存在的，主进程退出，容器就失去了存在的意义，从而退出，其它辅助进程不是它需要关心的东西。

使用 service nginx start 命令，则是希望 upstart 来以后台守护进程形式启动 nginx 服务。 `CMD service nginx start` 会被理解为 `CMD ["sh", "-c", "service nginx start"]`，因此主进程实际上是 sh 。那么当service nginx start 命令结束后， sh 也就结束了， sh 作为主进程退出了，自然就会令容器退出。

正确的做法是直接执行 nginx 可执行文件，并且要求以前台形式运行 `CMD ["nginx", "-g", "daemon off;"]`

### ENTRYPOINT 入口点

- ENTRYPOINT 的格式和 RUN 指令格式一样，分为 exec 格式和 shell 格式。
- ENTRYPOINT 的目的和 CMD 一样，都是在指定容器启动程序及参数。 ENTRYPOINT 在运行时也可以替代，不过比 CMD 要略显繁琐，需要通过 docker run 的参数 --entrypoint 来指定。
- 只可以出现一次，如果写了多个，只有最后一个生效。

当指定了 ENTRYPOINT 后， CMD 的含义就发生了改变，不再是直接的运行其命令，而是将 CMD 的内容作为参数传给 ENTRYPOINT 指令，换句话说实际执行时，将变为：`<ENTRYPOINT> "<CMD>"`

场景一：让镜像变成像命令一样使用

```dockerfile
FROM ubuntu:16.04
RUN apt-get update \
&& apt-get install -y curl \
&& rm -rf /var/lib/apt/lists/*
CMD [ "curl", "-s", "http://ip.cn" ]
```

```bash
$ docker run myip
当前 IP：61.148.226.66 来自：北京市 联通
```

如果我们希望显示 HTTP 头信息，就需要加上 -i 参数。

```dockerfile
FROM ubuntu:16.04
RUN apt-get update \
&& apt-get install -y curl \
&& rm -rf /var/lib/apt/lists/*
ENTRYPOINT [ "curl", "-s", "http://ip.cn" ]
```

```bash
$ docker run myip

当前 IP：61.148.226.66 来自：北京市 联通

$ docker run myip -i

HTTP/1.1 200 OK
Server: nginx/1.8.0
Date: Tue, 22 Nov 2016 05:12:40 GMT
Content-Type: text/html; charset=UTF-8
Vary: Accept-Encoding
X-Powered-By: PHP/5.6.24-1~dotdeb+7.1
X-Cache: MISS from cache-2
X-Cache-Lookup: MISS from cache-2:80
X-Cache: MISS from proxy-2_6
Transfer-Encoding: chunked
Via: 1.1 cache-2:80, 1.1 proxy-2_6:8006
Connection: keep-alive
当前 IP：61.148.226.66 来自：北京市 联通
```

场景二：应用运行前的准备工作

redis 官方镜像

```dockerfile
FROM alpine:3.4
...
RUN addgroup -S redis && adduser -S -G redis redis
...
ENTRYPOINT ["docker-entrypoint.sh"]
EXPOSE 6379
CMD [ "redis-server" ]
```

```bash
#!/bin/sh
...
# allow the container to be started with `--user`
if [ "$1" = 'redis-server' -a "$(id -u)" = '0' ]; then
chown -R redis .
exec su-exec redis "$0" "$@"
fi
exec "$@"
```

该脚本的内容就是根据 CMD 的内容来判断，如果是 redis-server 的话，则切换到 redis 用户身份启动服务器，否则依旧使用 root 身份执行。比如：

```bash
$ docker run -it redis id
uid=0(root) gid=0(root) groups=0(root)
```

### ENV 设置环境变量

格式有两种：

- ENV <key> <value>
- ENV <key1>=<value1> <key2>=<value2>...

```dockerfile
ENV NODE_VERSION 7.2.0
RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
&& curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
&& gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
&& grep " node-v$NODE_VERSION-linux-x64.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
&& tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
&& rm "node-v$NODE_VERSION-linux-x64.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
&& ln -s /usr/local/bin/node /usr/local/bin/nodejs
```

### ARG 构建参数(了解)

格式： ARG <参数名>[=<默认值>]

构建参数和 ENV 的效果一样，都是设置环境变量。所不同的是， ARG 所设置的构建环境的环境变量，在将来容器运行时是不会存在这些环境变量的。但是不要因此就使用 ARG 保存密码之类的信息，因为 docker history 还是可以看到所有值的。

### VOLUME 定义匿名卷

格式为：

VOLUME ["<路径1>", "<路径2>"...]
VOLUME <路径>

在 Dockerfile 中，我们可以事先指定某些目录挂载为匿名卷，这样在运行时如果用户不指定挂载，其应用也可以正常运行，不会向容器存储层写入大量数据。当然，运行时可以覆盖这个挂载设置。

```dockerfile
VOLUME /data
```

```bash
docker run -d -v mydata:/data xxxx
```

使用了 mydata 这个命名卷挂载到了 /data 这个位置，替代了 Dockerfile 中定义的匿名卷的挂载配置。

### EXPOSE 声明端口

格式为 EXPOSE <端口1> [<端口2>...]

EXPOSE 指令是声明运行时容器提供的服务端口。这仅仅是声明打算使用什么端口而已，并不会因为这个声明，应用就开启这个端口的服务。

在 Dockerfile 中写入这样的声明有两个好处，一个是帮助镜像使用者理解这个镜像服务的守护端口，以方便配置映射；另一个用处则是在运行时使用随机端口映射时，也就是 `docker run -P` 时，会自动随机映射 EXPOSE 的端口。

### WORKDIR 指定工作目录

格式为 WORKDIR <工作目录路径>

使用 WORKDIR 指令可以来指定工作目录（或者称为当前目录），以后 **各层** 的当前目录就被改为指定的目录，该目录需要已经存在， WORKDIR 并 **不会** 帮你建立目录。

```dockerfile
RUN cd /app
RUN echo "hello" > world.txt
```

如果将这个 Dockerfile 进行构建镜像运行后，会发现找不到 /app/world.txt 文件，应按如下操作：

```dockerfile
WORKDIR /app
RUN echo "hello" > world.txt
```

### USER 指定当前用户

格式： USER <用户名>

USER 指令和 WORKDIR 相似，都是改变环境状态并影响以后的层。 WORKDIR 是改变工作目录， USER 则是改变之后层的执行 RUN , CMD 以及 ENTRYPOINT 这类命令的身份。

当然，和 WORKDIR 一样， USER 只是帮助你切换到指定用户而已，这个用户必须是 **事先建立好** 的，否则无法切换。

### HEALTHCHECK 健康检查

格式：

- HEALTHCHECK [选项] CMD <命令> ：设置检查容器健康状况的命令
- HEALTHCHECK NONE ：如果基础镜像有健康检查指令，使用这行可以屏蔽掉其健康检查指令

当在一个镜像指定了 HEALTHCHECK 指令后，用其启动容器，初始状态会为 starting ，在 HEALTHCHECK 指令检查成功后变为 healthy ，如果连续一定次数失败，则会变为 unhealthy 。

和 CMD , ENTRYPOINT 一样， HEALTHCHECK 只可以出现一次，如果写了多个，只有最后一个生效。

HEALTHCHECK 支持下列选项：

- --interval=<间隔> ：两次健康检查的间隔，默认为 30 秒；
- --timeout=<时长> ：健康检查命令运行超时时间，如果超过这个时间，本次健康检查就被视为失败，默认 30 秒；
- --retries=<次数> ：当连续失败指定次数后，则将容器状态视为 unhealthy ，默认 3 次。

在 HEALTHCHECK [选项] CMD 后面的命令，格式和 ENTRYPOINT 一样，分为 shell 格式，和 exec 格式。命令的返回值决定了该次健康检查的成功与否： 0 ：成功； 1 ：失败； 2 ：保留，不要使用这个值。

实例：用 curl 来帮助判断 Web 容器是否健康

```dockerfile
FROM nginx
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
HEALTHCHECK --interval=5s --timeout=3s \
            CMD curl -fs http://localhost/ || exit 1
```

容器运行后，可以通过 `docker ps` 看到 `STATUS` 状态(starting, healthy, unhealthy)

### ONBUILD 为其他镜像设置指令

格式： ONBUILD <其它指令>

ONBUILD 是一个特殊的指令，它后面跟的是其它指令，比如 RUN , COPY 等，这些指令在当前镜像构建时并不会被执行。只有当以当前镜像为基础镜像，去构建下一级镜像的时候才会被执行。

实例：构建一个 node 项目

常规的做法：

```dockerfile
FROM node:slim
RUN "mkdir /app"
WORKDIR /app
COPY ./package.json /app
RUN [ "npm", "install" ]
COPY . /app/
CMD [ "npm", "start" ]
```

使用 `ONBUILD` 指令，首先创建一个基础镜像 my-node

```dockerfile
FROM node:slim
RUN "mkdir /app"
WORKDIR /app
ONBUILD COPY . /app/
ONBUILD RUN [ "npm", "install" ]
CMD [ "npm", "start" ]
```

其他镜像只要继承改镜像即可

```dockerfile
FROM my-node
```