---
title: GraalVM 安装使用
date: 2021-12-26 17:08:00
tags: GraalVM
categories: 软件技术
---

## 下载安装 GraalVM

从[官网](https://www.graalvm.org/downloads/)下载 GraalVM 社区版，下载后解压到某个目录中

环境变量添加 GRAALVM_HOME ，值为刚才解压的目录。环境变量 Path 中添加 `%GRAALVM_HOME%/bin`.。

安装 GraalVM 插件 `gu.cmd install native-image`，如果出现了下载超时，可以手动在 GitHub 上下载对应平台的 jar，例如打开[下载页面](https://github.com/graalvm/graalvm-ce-builds/releases/tag/vm-21.3.0)

![20211226165450](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20211226165450.png)

执行 `gu.cmd -L install native-image-installable-svm-java17-windows-amd64-21.3.0.jar`

查看已安装的组件 `gu.cmd list`

## 下载安装平台编译器

因为 GraalVM 可以编译到指定平台的机器码，所以需要下载该平台的编译工具。Windows 系统下载[Microsoft C++生成工具](https://visualstudio.microsoft.com/zh-hans/visual-cpp-build-tools/)

![20211226164229](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20211226164229.png)

配置环境变量

```text
MSVC
C:\Program Files (x86)\Microsoft Visual Studio\2019\Professional\VC\Tools\MSVC\14.29.30133

WK10_INCLUDE
C:\Program Files (x86)\Windows Kits\10\Include\10.0.18362.0

WK10_LIB
C:\Program Files (x86)\Windows Kits\10\Lib\10.0.18362.0

INCLUDE
%WK10_INCLUDE%\ucrt;%WK10_INCLUDE%\um;%WK10_INCLUDE%\shared;%MSVC%\include;

LIB
%WK10_LIB%\um\x64;%WK10_LIB%\ucrt\x64;%MSVC%\lib\x64;

Path下新增
C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\VC\Tools\MSVC\14.29.30133\bin\Hostx64\x64
```

## 编译机器码

如果配置了上述的环境变量，忽略以下操作。

不管是 spring native 或 fat jar，想要编译为 windows 机器码，必须先通过 `x64 Native Tools Command Prompt` 打开命令行，通过此命令行才能正常进行编译。

如果你的代码在 D 盘，而 Microsoft C++生成工具安装在了 C 盘，你会发现通过 `x64 Native Tools Command Prompt` 打开的命令行无法 cd 到 D 盘，一个变通方案是在项目根目录创建 `build.sh`，直接在命令行中执行此脚本

```bash
// build.sh

PROJECT_ROOT=$(dirname "$0");
cd $PROJECT_ROOT;
// compile command here...
```

![20211226170914](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20211226170914.png)
