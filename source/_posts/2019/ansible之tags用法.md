---
title: ansible之tags用法
date: 2019-08-20 00:14:45
tags: ansible
---

假设你写了一个很长的 playbook，但是你只想执行其中的某一部分，可以使用 tags 实现这个需求，tags 就是打标签，把需要执行的或不需要执行的操作打上标签，剧本如下：

```yml
---
- hosts: testHost
  remote_user: root
  tasks:
    - name: Ping the host first
      tags: t1
      ping:
    - name: Ping the host second
      tags: t2
      ping:
    - name: Ping the host third
      tags: t3
      ping:
```

如上所示，我们给这两个 task 打上了三个标签 t1、t2、t3，假设我们只想执行 t1，可以使用如下命令：

```bash
ansible-playbook --tags=t1 playbook.yml
```

除了指定执行的标签以外，还能指定不执行哪些标签，例如想要执行 t1 和 t2，不执行 t3，即排除 t3 ，可以使用如下命令：

```bash
ansible-playbook --skip-tags=t3 playbook.yml
```

我们还可以给一个 task 打上多个标签，有三种语法：

```yml
# 语法一
tags:
  - t1
  - t2

# 语法二
tags: t1,t3

# 语法三
tags: ['t1', 't4']
```

如上所示，三个任务都具有 t1 标签，执行 t1 则三个任务都会执行，如下：

```bash
ansible-playbook --tags=t1 playbook.yml
```

一次性执行多个标签，标签之间需要用逗号隔开，如下：

```bash
ansible-playbook --tags t2,t3 playbook.yml
```

查看当前 playbook 文件有哪些标签：

```bash
ansible-playbook --list-tags playbook.yml
```

ansible 还预置了 5 种特殊的 tag，分别是:

- `always`：总是执行，除非用`--skip-tags`明确指定不执行，如果是`--skip-tags always`则所有的 always 都不执行
- `never`：与 always 相对，从不执行，除非用`--tags`明确指定执行
- `tagged`：该字段并不是写在剧本中的，而是在调用时使用，例如`--tags tagged`表示执行所有有标签的任务，没有标签的不会执行。`--skip-tags tagged`表示跳过有标签的任务，即使是 always 也会跳过
- `untagged`：同 tagged
- `all`：执行所有任务，包括 never
