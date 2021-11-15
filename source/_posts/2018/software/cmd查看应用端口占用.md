---
title: windows 查看端口占用
date: 2018-04-17 00:15:12
tags: windows
categories: 软件技术
---

```bash
netstat -ano | findstr "1080"   //查看1080端口应用的进程id
tasklist | findstr "12652"  //查看12652进程的名字
taskkill -PID "12652" -F    //强制杀死pid为12652的进程
```

也可能 Hyper-V Connections/Adapters 发生异常

```bash
net stop winnat;
net start winnat;
```
