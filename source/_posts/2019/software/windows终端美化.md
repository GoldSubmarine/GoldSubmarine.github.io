---
title: windows终端美化
date: 2019-01-13 00:15:12
tags: windows
categories: 软件技术
---

![powershellscreenshot](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/powershellscreenshot.png)

**注意：** 全程使用管理员权限的 Powershell，如果安装遇到问题，可以将 vpn 切换到全局模式

- 打开管理员权限的 Powershell
- 执行：`set-executionpolicy remotesigned`
- 安装 Chocolatey，执行：`iex ((new-object net.webclient).DownloadString('https://chocolatey.org/install.ps1'))`
- 安装 colortool，执行：`choco install colortool`
- 执行：`Install-Module posh-git -Scope CurrentUser`
- 执行：`Install-Module oh-my-posh -Scope CurrentUser`
- 执行：`Install-Module Get-ChildItemColor -Scope CurrentUser -AllowClobber`
- 下载[ParadoxWindows 文件](/file/2019/ParadoxWindows.psm1)，并把将下载好的文件放到 `C:\Users\当前用户\Documents\WindowsPowerShell\Modules\oh-my-posh\当前版本\Themes` 文件夹下
- 下载字体[更纱黑体字体 ttf 版](https://github.com/be5invis/Sarasa-Gothic/releases)，解压后，复制 `Sarasa Mono T SC` (4 个字体)粘贴到 `C:\Windows\Fonts`
- 打开 powershell，右击窗口，选择属性，更改字体为 `等距更纱黑体 T SC`，将布局中的窗口宽度设为 100，高度设为 30
- 下载主题：[Solarized Dark Higher Contrast](https://github.com/mbadolato/iTerm2-Color-Schemes/tree/master/schemes)，将主题复制到 `C:\ProgramData\Chocolatey\lib\colortool\content\schemes`，并重命名文件，去掉空格为 `SolarizedDarkHigherContrast.itermcolors`
- 执行：`if (!(Test-Path -Path $PROFILE )) { New-Item -Type File -Path $PROFILE -Force }`
- 执行：`notepad $PROFILE`
- 将下列文字复制到打开的 txt 中，保存并关闭

```bash
# $env:PYTHONIOENCODING="utf-8"

Import-Module Get-ChildItemColor
Set-Alias ll Get-ChildItemColor -option AllScope
Set-Alias ls Get-ChildItemColorFormatWide -option AllScope

Import-Module posh-git
Import-Module oh-my-posh

# Set theme
Set-Theme ParadoxWindows

Set-PSReadlineKeyHandler -Key Tab -Function MenuComplete

$DefaultUser = 'root'

colortool -q SolarizedDarkHigherContrast.itermcolors
```

如果背景是粉红色，可以点击属性=>颜色=>背景，选择上图中的背景色即可。

## vscode

打开设置，搜索`terminal font family`，将字体设置为`Consolas, 'Courier New', monospace,等距更纱黑体 T SC`，或某种 powerline 字体即可：[powerline](https://github.com/powerline/fonts)

## Windows Terminal

[Windows Terminal 如何添加到右键菜单？](https://www.zhihu.com/question/325948326/answer/700753639)

```json
{
  "list": [
    {
      // Make changes here to the powershell.exe profile.
      "guid": "{61c54bbd-c2c6-5271-96e7-009a87ff44bf}",
      "name": "Windows PowerShell",
      "commandline": "powershell.exe",
      "hidden": false,
      "fontFace": "等距更纱黑体 T SC",
      "fontSize": 10,
      "colorScheme": "Solarized Dark Higher Contrast",
      "startingDirectory": null,
      "useAcrylic": false
    }
  ],
  "schemes": [
    {
      "name": "Solarized Dark Higher Contrast",
      "black": "#002831",
      "red": "#d11c24",
      "green": "#6cbe6c",
      "yellow": "#a57706",
      "blue": "#2176c7",
      "purple": "#c61c6f",
      "cyan": "#259286",
      "white": "#eae3cb",
      "brightBlack": "#006488",
      "brightRed": "#f5163b",
      "brightGreen": "#51ef84",
      "brightYellow": "#b27e28",
      "brightBlue": "#178ec8",
      "brightPurple": "#e24d8e",
      "brightCyan": "#00b39e",
      "brightWhite": "#fcf4dc",
      "background": "#001e27",
      "foreground": "#9cc2c3"
    }
  ]
}
```
