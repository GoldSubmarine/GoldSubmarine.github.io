# docker笔记（四）容器和仓库

## 注意

所有的实例只是用于演示，不需记住任何命令，重点在于理解概念，具体命令行操作直接使用 `docker --help` 来查询。

## 启动容器

- `docker run <image>` 创建并启动一个容器，实例：`docker run ubuntu:14.04 /bin/echo 'Hello world'`
- `docker start <container>` 启动一个已经存在的容器
- `docker run -d <image>` 后台运行一个容器

## 终止容器

- `docker stop` 终止一个容器

## 重启一个容器

- `docker restart` 重启容器

## 进入后台运行的容器

`docker attach <container>` 连接到后台运行的容器的shell，全局只有一个shell实例
`docker exec -it <container> <cmd>` 连接到后台运行的容器，并新建一个shell实例

## 查看容器的状态

- `docker logs <container>` 查看后台运行的容器的日志
- `docker ps` 查看当前运行的容器
- `docker ps -a` 查看所有的容器
- `docker container ls` 查看当前运行的容器
- `docker container ls -a` 查看所有的容器
- `docker inspect <container>` **查看容器的具体信息**

## 导出导入容器

- `docker export ubuntu-container > ubuntu.tar` 导出一个容器快照到本地
- `cat ubuntu.tar | sudo docker import - test/ubuntu:v1.0` 从容器快照文件中再导入为镜像，镜像名为 `test/ubuntu`

## 删除容器

- `docker rm <container>` 删除一个容器

## 清理所有处于停止状态的容器

- `docker rm $(docker ps -a -q)` 这个命令其实会试图删除所有的容器，不过因为运行中的容器不能删除，所以只会删除停止运行的容器。

## 搜索仓库

- `docker search centos` 搜索centos镜像

## 下载镜像

- `docker pull centos`

