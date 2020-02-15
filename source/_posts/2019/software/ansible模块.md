---
title: ansible模块
date: 2019-08-10 17:51:45
tags: ansible
categories: 软件技术
---

在基本概念中我们已经使用过 ping 模块，ansible 还提供了很多其他模块供我们使用

```bash
ansible-doc -l;  # 查看所有的ansible模块
ansible -s ping;  # 查看某个模块的使用方法
ansible -s fetch;  # 查看某个模块的使用方法
```

我们以 fetch 模块为例，示范如何使用模块

```bash
$ ansible-doc -s fetch

- name: Fetch files from remote nodes
  fetch:
      dest: # (required) A directory to save the file into. For example, if the `dest' directory is `/backup' a `src' file named `/etc/profile' on host `host.example.com', would be saved into `/backup/host.example.com/etc/profile'. The host name is based on the inventory name.
      fail_on_missing: # When set to `yes', the task will fail if the remote file cannot be read for any reason. Prior to Ansible 2.5, setting this would only fail if the source file was missing. The default was changed to `yes' in Ansible 2.5.
      flat: # Allows you to override the default behavior of appending hostname/path/to/file to the destination. If `dest' ends with '/', it will use the basename of the source file, similar to the copy module. Obviously this is only handy if the filenames are unique.
      src: # (required) The file on the remote system to fetch. This `must' be a file, not a directory. Recursive fetching may be supported in a later release.
      validate_checksum: # Verify that the source and destination checksums match after the files are fetched.
```

查看 fetch 模块的文档，其中 dest 和 src 是必填项，src 指远程主机的文件位置，dest 为存放到当前 ansible 主机的位置。

远程机器的配置如下：

```yml
all:
  children:
    vps:
      hosts:
        192.168.1.100:
          ansible_port: 2
          ansible_user: root
          ansible_ssh_pass: abcd
        server101:
          ansible_host: 192.168.1.101
          ansible_port: 22
          ansible_user: root
          ansible_ssh_pass: abcd
```

执行下载受控主机文件的命令：

```bash
$ ansible all -m fetch -a "src=/root/.bash_history dest=/root/fetch/"

144.34.209.243 | CHANGED => {
    "changed": true,
    "checksum": "d2146f6c3efe7a68374bdfe6ff65a5bc924b2586",
    "dest": "/root/fetch/192.168.1.100/root/.bash_history",
    "md5sum": "fa817f141afae86398d20d56572e7694",
    "remote_checksum": "d2146f6c3efe7a68374bdfe6ff65a5bc924b2586",
    "remote_md5sum": null
}
bwg | CHANGED => {
    "changed": true,
    "checksum": "9777a9dd8eab4343d6f242d913b86fd8bfa60606",
    "dest": "/root/fetch/server101/root/.bash_history",
    "md5sum": "90b6cfedcbf109d7607bcee27b83910b",
    "remote_checksum": "9777a9dd8eab4343d6f242d913b86fd8bfa60606",
    "remote_md5sum": null
}
```

使用 `-a` 指定模块的参数，以上打印出的文字是黄色的，并且从 dest 可以看到 ansible 按主机的不同进行了分类。

如果再次执行`ansible all -m fetch -a "src=/root/.bash_history dest=/root/fetch/"`，打印出的文字是绿色的，并且`changed: false`，表示已经和远程主机完全一样，不需要再次拉取。

## 常用模块

- **copy 模块**：将 ansible 主机上的文件拷贝到远程主机中
- **file 模块**：完成一些对文件的基本操作，比如，创建文件或目录、删除文件或目录、修改文件权限等
- **blockinfile 模块**：在指定的文件中插入"一段文本"，这段文本是被标记过的，换句话说就是，我们在这段文本上做了记号，以便在以后的操作中可以通过"标记"找到这段文本，然后修改或者删除它
- **lineinfile 模块**：确保"某一行文本"存在于指定的文件中，或者确保从文件中删除指定的"文本"（即确保指定的文本不存在于文件中），还可以根据正则表达式，替换"某一行文本"
- **find模块**：在远程主机中查找符合条件的文件，就像find命令一样
- **replace模块**：可以根据我们指定的正则表达式替换文件中的字符串，文件中所有被正则匹配到的字符串都会被替换
- **command模块**：在远程主机上执行命令
- **shell模块**：在远程主机上执行命令，与command模块不同的是，shell模块在远程主机中执行命令时，会经过远程主机上的/bin/sh程序处理
- **script模块**：在远程主机上执行ansible主机上的脚本，也就是说，脚本一直存在于ansible主机本地，不需要手动拷贝到远程主机后再执行
- **cron模块**：管理远程主机中的计划任务，功能相当于crontab命令
- **service模块**：管理远程主机上的服务，比如，启动或停止远程主机中的nginx服务
- **user模块**：管理远程主机上的用户，比如创建用户、修改用户、删除用户、为用户创建密钥对等操作
- **group模块**：管理远程主机上的组
- **yum_repository模块**：管理远程主机上的yum仓库
- **yum模块**：在远程主机上通过yum源管理软件包
