---
title: ansible变量
date: 2019-08-25 20:38:45
tags: ansible
categories: 软件技术
---

## 简单变量使用

先说说如何定义变量，变量名应该由字母数字下划线组成，变量名要以字母开头，ansible 内置的关键字不能作为变量名。可以借助 vars 关键字来定义变量，示例如下：

```yml
---
- hosts: testHost
  vars:
    name1: Ping the host
    name2: make directory test
    file:
      path: test
      state: directory
  remote_user: root
  tasks:
    - name: "{{ name1 }}"
      ping:
    - name: "{{ name2 }}"
      file:
        path: /testdir/{{ file.path }}
        state: "{{ file['state'] }}"
```

如上所示，定义了三个变量，使用双大括号就可以引用变量，如果变量之前有其他字符串，则不需要加双引号，如果处于开头位置，必须加双引号。

## 文件方式引入

我们还可以将变量放入一个专门的文件中，其他 playbook 引入该文件，再使用其中的变量。在文件中定义变量不需要使用 vars 关键字，直接定义变量即可，如下所示：

```yaml
# cat nginx_vars.yml
nginx:
  conf80: /etc/nginx/conf.d/80.conf
  conf8080: /etc/nginx/conf.d/8080.conf
```

然后在 playbook 中通过 vars_files 引入变量，var 和 vars_files 可以同时使用，如下所示：

```yml
---
- hosts: test70
  remote_user: root
  vars:
    name1: task1
  vars_files:
  - /testdir/ansible/nginx_vars.yml
  tasks:
  - name: "{{ name1 }}"
    file:
      path={{nginx.conf80}}
      state=touch
  - name: task2
    file:
      path: "{{nginx['conf8080']}}"
      state=touch
```

## 调用远程系统信息变量

所有的剧本执行时都会先执行一个 Gathering Facts 的任务，该任务会收集远程主机的相关信息，例如 ip、主机名、系统版本、硬件配置等信息。这些信息被保存到变量中，可以在 playbook 中使用。

其实 playbook 每次执行时，是自动调用了一个 setup 模块从而执行了 Gathering Facts 任务，我们也可以手动调用 setup 模块来查看收集到的信息：

```bash
ansible test70 -m setup
```

可以看到控制台输出了一个 json，信息非常的多，`ansible_facts`字段下的变量都可以直接在 playbook 中使用。

我们可以使用关键字筛选出我们需要的信息，例如：`ansible test70 -m setup -a 'filter=ansible_memory_mb'` ，当然一般记不住这么长的过滤信息，所以我们可以使用通配符来过滤信息 `ansible test70 -m setup -a 'filter=*mb*'`

除了上述信息，我们还可以到远程主机上自定义信息，这些自定义信息也能被 setup 模块收集，ansible 默认回到目标主机的/etc/ansible/facts.d 目录下寻找主机的自定义信息，并且自定义信息必须以“.fact”为后缀，文件内容需要是 INI 格式或者 json 格式。

例如我们到远程主机上创建该文件，并写入变量，如下所示：

```json
{
  "testmsg": {
    "msg1": "this is a message",
    "msg2": "this is another message"
  }
}
```

然后在 ansible 主机上查看这些信息：

```bash
ansible test70 -m setup -a "filter=ansible_local"
```

## debug 模块简介

下面简单介绍一些 debug 模块，它可以帮助我们调试变量，直接看示例：

```yml
---
- hosts: test70
  remote_user: root
  vars:
    name1: task1
    debugmsg: msg1
  tasks:
  - name: "{{ name1 }}"
    file:
      path={{nginx.conf80}}
      state=touch
  - name: debug demo
    debug:
      msg: "print {{ debugmsg }}"
```

可以看到，使用 debug 模块可以在控制台输出变量的信息，这可以帮助我们确定变量的值是否符合我们的预期。

## 交互式变量

在运行某些脚本时，会提示用户输入一些信息，如下所示：

```yml
---
- hosts: test70
  remote_user: root
  vars_prompt:
    - name: "your_name"
      prompt: "What is your name"
      private: no
      default: lili
    - name: "your_age"
      prompt: "How old are you"
  tasks:
   - name: output vars
     debug:
      msg: Your name is {{your_name}},You are {{your_age}} years old.
```

通过 `vars_prompt` 关键字定义了两个变量，运行 playbook 后会提示用户输入信息。`private`值为 no，表示用户的输入在控制台可见，默认为 yes 不可见。

## 命令行变量

```yml
---
- hosts: test70
  vars:
    pass_var: test_default
  remote_user: root
  tasks:
  - name: "Passing Variables On The Command Line"
    debug:
      msg: "{{ pass_var }}{{ pass_var1 }}"
```

```bash
ansible-playbook playbook.yml -e 'pass_var="test" pass_var1="test1"'
```

可以在playbook中设置默认值，如果调用时没有在命令行给该变量赋值，就会使用默认值。

```bash
ansible-playbook cmdvar.yml -e "@/testdir/ansible/testvar"
```

如上所示，通过“@”符号加上变量文件路径，即可把变量文件中的变量加载到playbook中使用。
