---
title: ansible剧本
date: 2019-08-19 22:42:45
tags: ansible
categories: 软件技术
---

假设我们要给一台机器安装 nginx

```bash
ansible testHost -m yum_repository -a 'name=aliEpel description="alibaba EPEL" baseurl=https://mirrors.aliyun.com/epel/$releasever/Server/$basearch/'

ansible testHost -m yum -a 'name=nginx disable_gpg_check=yes enablerepo=aliEpel'

ansible testHost -m service -a "name=nginx state=started"
```

通过上面的命令，先确定了 yum 源，然后使用 yum 模块安装了 nginx，最后通过 service 启动了 nginx。

如果有新的机器需要安装 nginx，每次在 bash 中执行这些上述命令显然太过麻烦，我们更希望将它写成一个脚本，每次安装只需执行一下脚本，ansible 提供了这种脚本功能，并把它称为剧本（playbook）。

playbook 虽然功能类似于脚本，但并不像 shell 脚本一样将命令一步步写在文件中就行，编写 playbook 需要遵循 YAML 语法，首先创建一个以`.yaml`或`.yml`为后缀的文件。

在编写 playbook 之前先看两个简单命令：

```bash
ansible testHost -m ping   # ping远程主机
ansible testHost -m file -a "path=/testdir/test state=directory"   # 在testHost主机上创建文件夹（自行查阅file模块说明）
```

将上述命令写成 playbook

```yml
--- # 表示文档的开始
- hosts: testHost # host文件中的别名
  remote_user: root # 使用哪个用户
  tasks:
    - name: Ping the host # 描述
      ping: # 执行ping模块
    - name: make directory test
      file: # 执行file模块
        path: /testdir/test # file模块的参数
        state: directory
```

首先对剧本进行语法检查： `ansible-playbook --syntax-check ./playbook.yml` ，然后执行剧本： `ansible-playbook playbook.yml` ，输出如下：

```bash
$ ansible-playbook playbook.yml

PLAY [testHost] *********************************

TASK [Gathering Facts] **************************
ok: [testHost]

TASK [Ping the host] ****************************
ok: [testHost]

TASK [make directory test] **********************
changed: [testHost]

PLAY RECAP **************************************
testHost : ok=3    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

所有的剧本执行时都会先执行一个 Gathering Facts 的任务，该任务会收集远程主机的相关信息。还可以对多个主机进行操作：

```yml
---
- hosts: testHost,testA
  remote_user: root
  tasks:
    - name: Ping the host
      ping:
- hosts:
    testB
    testC
  remote_user: root
  tasks:
    - name: Touch file
      file:
        path: /testFile.txt
        state: touch
- hosts: testD
  remote_user: root
  tasks:
    - name: Touch file
      file: path=/testFile.txt state=touch mode=0700    # 给参数赋值，推荐的写法，可以自由换行但是要注意缩进
```

除了能使用 `--syntax-check` 对剧本进行语法检查，还能模拟执行 playbook，模拟执行任务并不会在真正的目标主机上运行，所以可以大胆的测试

```bash
ansible-playbook --check playbook.yml
```

使用上述命令模拟一些任务可能会报错，很可能是因为报错的任务需要依赖之前其他任务的运行结果。因为是模拟运行，所以每次运行都不会有实际的结果，当然就不能被后续的步骤依赖，模拟只是大概预估剧本的执行情况，不能代表实际的运行结果。
