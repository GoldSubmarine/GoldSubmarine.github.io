---
title: Github下载提速
date: 2019-09-03 01:29:00
tags: git
categories: 软件技术
---

使用命令行 `git clone xxx` 下载项目时经常很慢，即使开了全局代理仍然很慢。

使用下列命令即可走代理提速：

```bash
git config --global http.https://github.com.proxy socks5://127.0.0.1:1080
git config --global https.https://github.com.proxy socks5://127.0.0.1:1080
```

如果上述的命令执行后，clone 项目时完全卡住不动，尝试使用 http 代理，如下：

```bash
git config --global http.https://github.com.proxy https://127.0.0.1:1080
git config --global https.https://github.com.proxy https://127.0.0.1:1080
```

以上配置只能代理 http 的下载，如果使用 ssh 的方式，则以上代理不能生效，windows 可以配置以下 socket 代理，其他系统配置可以查看 [https://github.com/comwrg/package-manager-proxy-settings](https://github.com/comwrg/package-manager-proxy-settings)

```bash
// .ssh/config
Host github.com
    User git
    ProxyCommand connect -S 127.0.0.1:1080 %h %p
```

还可提升请求的 buffer 的容量，如下：

```bash
git config --global http.postBuffer 524288000
```

使用命令 `git config --global -l` 可查看 git 全局配置，windows 中全局配置文件位置为 `C:\Users\xxx\.gitconfig`

如需卸载刚才的配置，直接从配置文件中删除即可。
