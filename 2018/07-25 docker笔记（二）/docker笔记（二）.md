# docker笔记（二）获取、运行

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

- 上面的命令中没有给出 Docker Registry 地址，因此将会从 `Docker Hub` 获取镜像。而镜像名称是 `ubuntu:14.04` ，因此将会获取官方镜像 `library/ubuntu` 仓库中标签为 `14.04` 的镜像。

- 从下载过程中可以看到我们之前提及的分层存储的概念，镜像是由多层存储所构成。下载也是一层层的去下载，并非单一文件。下载过程中给出了每一层的 ID 的前 12 位。并且下载结束后，给出该镜像完整的 sha256 的摘要，以确保下载一致性。

## 运行

```bash
$ docker run -it --rm ubuntu:14.04 bash     //比较 docker run node cat /etc/os-release

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

## 列出镜像

```bash
$ docker image ls   // 或 docker images

REPOSITORY   TAG      IMAGE ID       CREATED       SIZE
redis        latest   5f515359c7f8   5 days ago    183 MB
nginx        latest   05a60462f8ba   5 days ago    181 MB
mongo        3.2      fe9198c04d62   5 days ago    342 MB
<none>       <none>   00285df0df87   5 days ago    342 MB
ubuntu       16.04    f753707788c5   4 weeks ago   127 MB
ubuntu       latest   f753707788c5   4 weeks ago   127 MB
ubuntu       14.04    1e0c3dd64ccd   4 weeks ago   188 MB
```

1. ubuntu:16.04 官网显示 50MB，是压缩后的体积，当前是展开后体积。列表中的镜像体积总和并非是所有镜像实际硬盘消耗，因为多层存储，所以实际镜像大小的综合要小很多

2. `<none>` 这类无标签也无仓库名的镜像也被称为 虚悬镜像(dangling image)，由于新旧镜像同名，旧镜像名称被取消，`docker pull` 和 `docker build` 都可能导致这种现象，一般来说，虚悬镜像已经失去了存在的价值，是可以随意删除的，删除命令 `docker rmi $(docker images -q -f dangling=true)` ，显示命令 `docker images -f dangling=true`





// 3. 有仓库名但标签为 `<none>` 为中间层镜像，是其它镜像所依赖的镜像，不能删除。只要删除那些依赖它们的镜像后，这些依赖的中间层镜像也会被连带删除

```bash
$ docker image ls node      //列出特定镜像
$ docker system df      //查看镜像、容器、数据卷所占用的空间
$ docker images -f since=mongo:3.2      //列出在 mongo:3.2 之后建立的镜像，`-f` 是 filter 的缩写，`since` 表示之后，对应的 `before` 表示之前
$ docker image ls -q    // `-q` 表示只列出id，可以配合 `-f` 做批量操作
```