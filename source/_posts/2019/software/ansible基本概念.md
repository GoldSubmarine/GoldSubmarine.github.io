---
title: ansible基本概念
date: 2019-08-09 14:23:45
tags: ansible
categories: 软件技术
---

ansible 是一个"自动化运维工具"，它能帮你同时在 100 台服务器上安装、配置 nginx，并在安装后启动它们。

ansible 是"以结果为导向的"，我们指定了一个"目标状态"，ansible 会自动判断，"当前状态"是否与"目标状态"一致，如果一致，则不进行任何操作，如果不一致，那么就将"当前状态"变成"目标状态"，这就是"幂等性"。例如你想将某个文件拷贝到服务器上，如果服务器上已经存在，则不进行任何操作，如果不存在则拷贝。

相比于其他的配置管理工具 puppet 或者 saltstack 等，ansible 不需要在受控主机上安装 agent。

## 安装

```bash
yum install -y epel-release;    # 使用第三方镜像源
yum install -y ansible  # 安装ansible
yum install -y openssh-server python    # 安装python和ssh
```

ansible 是基于 python 开发和运行的，所以需要安装 python。

## Ping

测试运行 `ansible 192.168.1.100 -m ping`

"ping"是 ansible 中的一个模块，`-m`表示调用 ping 模块。想要让上述命令正常执行，则必须同时满足两个最基本的条件：

1. ansible 所在的主机可以通过 ssh 连接到受管主机
2. 受管主机的 IP 地址等信息已经添加到 ansible 的"配置清单"中

安装完 ansible 以后，ansible 会提供一个默认的"配置清单"，即：`/etc/ansible/hosts`，打开后添加如下信息：

```ini
192.168.1.100:22 ansible_user=root ansible_ssh_pass=abcd
```

再次执行`ansible 192.168.1.100 -m ping`，结果报错：

```bash
192.168.1.100 | FAILED! => {
    "msg": "Using a SSH password instead of a key is not possible because Host Key checking is enabled and sshpass does not support this.  Please add this host's fingerprint to your known_hosts file to manage this host."
}
```

原因是由于在本机的 `~/.ssh/known_hosts` 文件中并有 fingerprint key 串，ssh 第一次连接的时候一般会提示是否要将 key 字符串加入到 `~/.ssh/known_hosts` 文件中。为避免首次连接时让输入 yes/no 部分的提示，可对文件 `/etc/ansible/ansible.cfg` 进行如下配置：`host_key_checking = False`，保存后再次尝试 `ansible 192.168.1.100 -m ping`，执行成功。

## 清单配置详解

假设我们有多台主机：

- 192.168.1.100
- 192.168.1.101
- 192.168.1.102
- 192.168.1.103

其中 100 和 101 为 centos 系统，102 和 103 为 ubuntu 系统，可以在 `/etc/ansible/hosts` 中进行如下配置：

```ini
[centos]
192.168.1.100:22 ansible_user=root ansible_ssh_pass=abcd
server101 ansible_host=192.168.1.101 ansible_port=22 ansible_user=root ansible_ssh_pass=abcd    # server101 为当前机器的别名，这种写法必须有别名

[ubuntu]
192.168.1.102:22 ansible_user=root ansible_ssh_pass=abcd
192.168.1.103:22 ansible_user=root ansible_ssh_pass=abcd
```

如上所示，可以对主机进行不同的分组，执行 `ansible all -m ping` 可以看到 4 台主机都 ping 成功了，而执行 `ansible centos -m ping` 只 ping 了 100 和 101

hosts 配置还可以进行其他方式的分组：

```ini
[A]
192.168.1.[20:30]   # 10台设备

[B]
server-[a:c].test.com   # 3台设备
db.test.com

[C:children]    # children 关键字表示当前组为子组的集合
A
B
```

除了 INI 风格的配置，ansible 还支持 YAML 格式，如下所示：

```yml
all:
  children:
    centosGroup:
      hosts:
        192.168.1.100:
            ansible_user: root
            ansible_ssh_pass: abcd
        192.168.1.101:  # 表示不需要账户密码，注意结尾的 冒号
    ubuntuGroup:
      hosts:
        server102:  # 别名的方式
          ansible_host: 192.168.1.102
          ansible_port: 22
        192.168.1.103:
```
