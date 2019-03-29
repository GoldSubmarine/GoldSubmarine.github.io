---
title: windows终端美化
date: 2019-01-13 00:15:12
tags: windows
---

![screenshot](/images/2019/powershellscreenshot.png)

**注意：** 全程使用管理员权限的Powershell，如果安装遇到问题，可以将vpn切换到全局模式

- 打开管理员权限的Powershell
- 执行：`set-executionpolicy remotesigned`
- 安装Chocolatey，执行：`iex ((new-object net.webclient).DownloadString('https://chocolatey.org/install.ps1'))`
- 安装colortool，执行：`choco install colortool`
- 执行：`Install-Module posh-git -Scope CurrentUser`
- 执行：`Install-Module oh-my-posh -Scope CurrentUser`
- 执行：`Install-Module Get-ChildItemColor -Scope CurrentUser`
- 下载[ParadoxWindows文件](/file/2019/ParadoxWindows.psm1)，并把将下载好的文件放到 `C:\Users\当前用户\Documents\WindowsPowerShell\Modules\oh-my-posh\当前版本\Themes` 文件夹下
- 下载字体[更纱黑体字体ttf版](https://github.com/be5invis/Sarasa-Gothic/releases)，解压后，复制 `Sarasa Mono T SC` (4个字体)粘贴到 `C:\Windows\Fonts`
- 打开powershell，右击窗口，选择属性，更改字体为 `等距更纱黑体 T SC`，将布局中的窗口宽度设为100，高度设为30
- 下载主题：[Solarized Dark Higher Contrast](https://github.com/mbadolato/iTerm2-Color-Schemes/tree/master/schemes)，将主题复制到 `C:\ProgramData\Chocolatey\lib\colortool\content\schemes`，并重命名文件，去掉空格为 `SolarizedDarkHigherContrast`
- 执行：`if (!(Test-Path -Path $PROFILE )) { New-Item -Type File -Path $PROFILE -Force }`
- 执行：`notepad $PROFILE`
- 将下列文字复制到打开的txt中，保存并关闭

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

colortool SolarizedDarkHigherContrast > $null
```

## vscode

打开设置，搜索`terminal font family`，将字体设置为`Consolas, 'Courier New', monospace,等距更纱黑体 T SC`，或某种powerline字体即可：[powerline](https://github.com/powerline/fonts)

## 使用第三方FluentTerminal终端

如果你想使用第三方终端，推荐`FluentTerminal`，可以看看他的介绍

- 执行：choco install ConEmu
- 下载[FluentTerminal终端](https://github.com/felixse/FluentTerminal/releases)用powershell执行install.psl