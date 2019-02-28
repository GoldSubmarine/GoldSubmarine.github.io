---
title: docker部署ss
date: 2018-11-11 00:15:12
tags: docker
---

本教程基于 `shadowsocks-manager` 教你docker部署ss

## 系统

本人使用的是 centos7 ，请不要使用 centos6.5 以下版本 ，因为docker是基于AUFS分层的，而 centos6.5 的内核不支持AUFS存储，所以尽量使用centos7

## 安装docker

```bash
curl -sSL https://get.docker.com/ | sh      // Docker 官方提供了一键安装脚本
curl -sSL https://get.daocloud.io/docker | sh       // DaoCloud 的安装脚本
```

建议使用docker官方提供的脚本，尽量不要用自带的yum或apt去安装，因为这些包更新不及时，可能是很老的版本

## ss准备

shadowsocks-manager是管理shadowsocks的工具，部署一共分为三部分

1. 配置以及启动shadowsocks
2. 配置以及启动shadowsocks-manager的 **server** 端连接第一步中启动的shadowsocks
3. 配置以及启动shadowsocks-manager的 **manager** 端（web端）连接第二步中启动的server端

### 拉取镜像

```bash
docker pull gyteng/ssmgr
```

如果提示没有启动docker daemon，则执行 systemctl start docker 后再试

镜像中既包含shadowsocks，又包含shadowsocks-manager，所以不用单独取安装任何项目

### 配置第二步中的server端

在自己的home文件夹中新建 `.ssmgr` 文件夹，并将所有的配置文件放入该 `.ssmgr` 文件夹中

```yml
# 文件名 server.yml

type: s     # s 代表server的意思

shadowsocks:
  address: 127.0.0.1:6001   # 要连接的shadowsocks的端口
manager:
  address: 0.0.0.0:6002     # 自己的server的端口
  password: '123456'
db: 'ss.sqlite'
```

### 配置第三步中的manager端

```yml
# 文件名 manager.yml

type: m     # m 代表manager的意思

manager:
  address: 127.0.0.1:6002   # 对应server的端口
  password: '123456'         # 对应server的密码

plugins:
  flowSaver:
    use: true
  user:
    use: true
  account:
    use: true
  macAccount:
    use: true
  group:
    use: true
  email:
    use: true
    username: 'your username'   # 邮箱账号，例如qq邮箱：12345678@qq.com
    password: 'your password'   # 不是邮箱的密码，而是要去qq邮箱官网上开启smtp服务，如何开启自行搜索，开启后会有一个随机字符串密码
    host: 'smtp.qq.com'         # 填写邮箱公司的smtp地址，qq邮箱的smtp就是 smtp.qq.com
  webgui:
    use: true
    host: '0.0.0.0'
    port: '8080'               # manager的web网页端口，建议不要用 80 端口，50000以上的端口较好
    site: 'http://127.0.0.1'    # 如果你有域名，可配置，没有的话随便填我们最后会通过 ip + port 来访问网页
    # cdn: 'http://xxx.xxx.com'
    # icon: 'icon.png'
    # skin: 'default'
    # googleAnalytics: 'UA-xxxxxxxx-x'
    gcmSenderId: '456102641793'
    gcmAPIKey: 'AAAAGzzdqrE:XXXXXXXXXXXXXX'
  # alipay:
  #   use: true
  #   appid: 2015012104922471
  #   notifyUrl: 'http://yourwebsite.com/api/user/alipay/callback'
  #   merchantPrivateKey: 'xxxxxxxxxxxx'
  #   alipayPublicKey: 'xxxxxxxxxxx'
  #   gatewayUrl: 'https://openapi.alipay.com/gateway.do'
  # webgui_telegram:
  #   use: true
  #   token: '191374681:AAw6oaVPR4nnY7T4CtW78QX-Xy2Q5WD3wmZ'
  # paypal:
  #   use: true
  #   mode: 'live' # sandbox or live
  #   client_id: 'At9xcGd1t5L6OrICKNnp2g9'
  #   client_secret: 'EP40s6pQAZmqp_G_nrU9kKY4XaZph'

db: 'webgui.sqlite'
```

## 运行

准备好两个配置文件后，开始运行

**注意：** 两个配置文件一定要在 ~/.ssmgr/ 文件夹下

运行容器

```bash
docker run --name ssmgr -it -v ~/.ssmgr:/root/.ssmgr --net=host gyteng/ssmgr bash
```

如果提示没有启动docker daemon，则执行 `systemctl start docker` 后再试

进入容器后，执行第一步，启动shadowsocks，建议使用gcm的加密方式

```bash
ss-manager -m aes-256-gcm -u --manager-address 127.0.0.1:6001 &
# 这里的 6001 就是 server.yml 文件中配置的 shadowsocks 的端口
# 注意：命令最后有一个 & 符
```

执行第二步，启动server

```bash
ssmgr -c ~/.ssmgr/server.yml &
```

执行第三步，启动manger

```bash
ssmgr -c ~/.ssmgr/manager.yml
# 命令最后 **不** 能有 & 符，不然容器会退出
```

最后使用ctrl+P+Q退出容器，请不要使用ctrl+c

访问manager中配置的端口好，就能打开了，注册的第一个账号会被视为管理员

进入管理控制台后，点击菜单 `账号` 创建账号后就能使用了

ps：不建议商业化使用，只是当作自己的管理工具使用

## 问题

进入容器进行的操作被视为黑箱操作，其实是有违docker的使用的，而且如果你重启服务器，就要重新进入容器，去执行那3步运行操作，我试图通过数据卷的方式去执行自己的bash脚本，但是遇到了权限问题，可能要自己制作镜像才能解决，后续有时间会改进并更新本教程。
