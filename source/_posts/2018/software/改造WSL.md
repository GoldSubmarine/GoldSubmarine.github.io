---
title: 改造 WSL
date: 2019-10-17 22:59:12
tags: windows
categories: 软件技术
---

## 安装

首先安装 wsl ，我选择的时 ubuntu 版本，具体步骤查网上教程。

## 镜像

改为阿里镜像，注意要删除原有的 ubuntu 镜像，不然仍有部分连接会走 ubuntu 源

## 终端主题

使用 powershell 安装 chocolatey，然后使用它安装 colortool 具体步骤查网上教程。

下载 [Solarized Dark Higher Contrast主题](https://raw.githubusercontent.com/mbadolato/iTerm2-Color-Schemes/master/schemes/Solarized%20Dark%20Higher%20Contrast.itermcolors)，然后重命名为 `SolarizedDarkHigherContrast.itermcolors` 并移动到 `C:\ProgramData\chocolatey\lib\colortool\content\schemes` 文件夹中，直接打开 Ubuntu （并非从powershell使用bash打开ubuntu），执行命令 `ColorTool.exe -x SolarizedDarkHigherContrast.itermcolors`。在 WSL 中可以调用 windows 程序，但是不能省略 `.exe` 。

## ZSH 及主题

安装 zsh 和 oh my zsh，使用 agnoster 主题，虽然应用成功，但是文件夹确实绿色的背景色，下载 [dircolors.256dark](https://raw.githubusercontent.com/seebi/dircolors-solarized/master/dircolors.256dark) 到 home 文件夹，编辑 `vim ~/.zshrc`，加入一行文字

> eval `dircolors ~/dircolors.256dark`

修改 `vim ~/dircolors.256dark` 中的 `EXEC 00;38;5;64` 为 `EXEC 00;38;5;244` 即可

agnoster 主题不能换行，自行修改代码，执行 `vim ~/.zshrc`，在文件末尾输入以下代码：

```bash
prompt_end() {
    if [[ -n $CURRENT_BG ]]; then
     print -n "%{%k%F{$CURRENT_BG}%}$SEGMENT_SEPARATOR"
    else
     print -n "%{%k%}"
    fi

    print -n "%{%f%}"
    CURRENT_BG=''

    #Adds the new line and ➜ as the start character.
    echo "\n \033[32m$\033[0m ";
}
```


[参考的这篇文章](https://medium.com/@Andreas_cmj/how-to-setup-a-nice-looking-terminal-with-wsl-in-windows-10-creators-update-2b468ed7c326)

## 环境变量

首先在 WSL 中可以使用 Windows 中安装好的程序，但是不能省略 `exe`，而且我们希望使用 Linux 中的程序，以 npm 举例，如果你在 windows 中安装了 npm，当你直接执行 `npm -v` 时会报错，这里我们先采用 nvm 在 Linux 上安装 nodejs 和 npm

首先安装 [nvm](https://github.com/nvm-sh/nvm)，安装脚本会报错，不过不用理会，然后 `vim ~/.zshrc`，编辑 `plugins=(git nvm)`，最后 `vim ~/.profile` 将 `/usr/bin` 添加到环境变量中

```bash
# set PATH so it includes user's private bin if it exists
if [ -d "/usr/bin" ] ; then
    PATH="/usr/bin:$PATH"
fi
```

这样就会优先使用 `/usr/bin` 中的库
