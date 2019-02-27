# windows终端美化

- 打开管理员权限的Powershell
- 执行：set-executionpolicy remotesigned
- 安装Chocolatey：iex ((new-object net.webclient).DownloadString('https://chocolatey.org/install.ps1'))
- 执行：Install-Module posh-git -Scope CurrentUser
- 执行：Install-Module oh-my-posh -Scope CurrentUser
- 执行：Install-Module Get-ChildItemColor -Scope CurrentUser
- 下载[ParadoxWindows文件](https://raw.githubusercontent.com/vinsoncho/vinsoncho.github.io/master/2019/02.windows终端美化/ParadoxWindows.psm1)，通过`$ThemeSettings`查看主题的文件位置，将下载好的文件放在和Paradox文件同级的位置
- 执行：if (!(Test-Path -Path $PROFILE )) { New-Item -Type File -Path $PROFILE -Force }
- 执行：notepad $PROFILE
- 将下列文字复制到打开的txt中，保存并关闭

```bash
Import-Module Get-ChildItemColor
Set-Alias ll Get-ChildItemColor -option AllScope
Set-Alias ls Get-ChildItemColorFormatWide -option AllScope

# $env:PYTHONIOENCODING="utf-8"
# Remove curl alias
# If (Test-Path Alias:curl) {Remove-Item Alias:curl}
# If (Test-Path Alias:curl) {Remove-Item Alias:curl}
# Remove-Item alias:ls -force

Import-Module posh-git
Import-Module oh-my-posh

# Set theme
Set-Theme ParadoxWindows

Set-PSReadlineKeyHandler -Key Tab -Function MenuComplete

$DefaultUser = 'root'
```

## 修改注册表

- 下载并安装字体：[更纱黑体字体ttf版](https://github.com/be5invis/Sarasa-Gothic/releases)，安装字体Sarasa Mono T SC
- 按下 `win + r`，运行 `regedit`，打开 `HKEY_CURRENT_USER\Console\%SystemRoot%_System32_WindowsPowerShell_v1.0_powershell.exe`，修改 faceName 为 `等距更纱黑体 T SC`
- 安装colortool：choco install colortool
- 下载主题：[Solarized Dark Higher Contrast主题](https://github.com/mbadolato/iTerm2-Color-Schemes/tree/master/schemes)
- 将下载好的主题复制到 `C:\ProgramData\Chocolatey\lib\colortool\content\schemes`，并重命名，去掉空格为 `SolarizedDarkHigherContrast`
- 执行：notepad $PROFILE
- 将 `colortool SolarizedDarkHigherContrast` 复制到打开的txt的最后一行，保存并关闭

## 使用第三方FluentTerminal终端

- 执行：choco install ConEmu
- 下载[FluentTerminal终端](https://github.com/felixse/FluentTerminal/releases)用powershell执行install.psl

## vscode

vscode将terminal设置为某种powerline字体即可：[powerline](https://github.com/powerline/fonts)