# docker笔记(五) 数据卷

## 注意

所有的实例只是用于演示，不需记住任何命令，重点在于理解概念，具体命令行操作直接使用 `docker --help` 来查询。

## 概念

数据卷是一个可供一个或多个容器使用的特殊目录，它绕过 UFS，可以提供很多有用的特性：

- 数据卷可以在容器之间共享和重用
- 对数据卷的修改会立马生效
- 对数据卷的更新，不会影响镜像
- 数据卷默认会一直存在，即使容器被删除

类似于 Linux 下对目录或文件进行 mount，镜像中的被指定为挂载点的目录中的文件会隐藏掉，能显示看的是挂载的数据卷。

## 创建一个数据卷

在用 `docker run` 命令的时候，使用 -v 标记来创建一个数据卷并挂载到容器里。在一次 run 中多次使用可以挂载多个数据卷。也可以在 Dockerfile 中使用 `VOLUME` 来添加一个或者多个新的卷到由该镜像创建的任意容器。

- `docker volume create --name test-volume` 创建一个数据卷
- `docker run -d -P --name web -v /webapp my/webapp python app.py`    //加载一个数据卷到容器的 /webapp 目录

## 删除数据卷

数据卷是被设计用来持久化数据的，它的生命周期独立于容器，Docker不会在容器被删除后自动删除数据卷，并且也不存在垃圾回收这样的机制来处没有任何容器引用的数据卷。

如果需要在删除容器的同时移除数据卷。可以在删除容器的时候使用 `docker rm -v` 这个命令。

`docker volume prune` 删除无效的volume

`docker volume rm <volume>` 删除指定的volume

## 挂载一个主机目录作为数据卷

将主机的 `/src/webapp` 目录挂载到容器的 `/opt/webapp` 目录。

`docker run -d -P --name web -v /src/webapp:/opt/webapp my/webapp python app.py`

本地目录的路径必须是绝对路径，如果目录不存在 Docker 会自动为你创建它。

这个功能在进行测试的时候十分方便，比如用户可以放置一些程序到本地目录中，来查看容器是否正常工作。

`docker run -d -P --name web -v /src/webapp:/opt/webapp:ro my/webapp python app.py` 默认权限是读写，加上`:ro`设为已读

实例：`docker run --rm -it -v C:\Users\mori\Desktop\demo\docker\volume:/volume ubuntu bash`

## 查看数据卷的具体信息

```bash
$ docker volume ls
$ docker volume inspect <volume>

"Mounts": [
    {
        "Type": "bind",
        "Source": "/host_mnt/c/Users/mori/Desktop/demo/docker/volume",
        "Destination": "/.bash_history",
        "Mode": "",
        "RW": true,
        "Propagation": "rprivate"
    }
]
```

## 数据卷容器

如果你有一些持续更新的数据需要在容器之间共享，最好创建数据卷容器。数据卷容器，其实就是一个正常的容器，专门用来提供数据卷供其它容器挂载的。

创建一个名为 dbdata 的数据卷容器：

```bash
docker run -d -v /dbdata --name dbdata my/postgres echo 'Data-only container for postgres'
```

在其他容器中使用 --volumes-from 来挂载 dbdata 容器中的数据卷。所挂载数据卷的容器自己并不需要保持在运行状态。

```bash
docker run -d --volumes-from dbdata --name db1 my/postgres
docker run -d --volumes-from dbdata --name db2 my/postgres
```

可以使用超过多个的 `--volumes-from` 参数来指定从多个容器挂载不同的数据卷。也可以从其他已经挂载了数据卷的容器来级联挂载数据卷。

```bash
docker run -d --name db3 --volumes-from db1 my/postgres
```

如果删除了挂载的容器（包括 dbdata、db1 和 db2），数据卷并不会被自动删除。 如果要删除一个数据卷，必须在删除最后一个还挂载着它的容器时使用 `docker rm -v` 命令来指定同时删除关联的容器。

## 备份

```bash
docker run --volumes-from dbdata -v $(pwd):/backup ubuntu tar -cvf /backup/backup.tar /dbdata
```

## 恢复

首先创建一个带有空数据卷的容器 dbdata2

```bash
docker run -v /dbdata --name dbdata2 ubuntu bash
docker run --volumes-from dbdata2 -v $(pwd):/backup ubuntu tar -xvf /backup/backup.tar
```
