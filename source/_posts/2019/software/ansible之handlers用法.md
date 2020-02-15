---
title: ansible之handlers用法
date: 2019-08-20 00:14:45
tags: ansible
categories: 软件技术
---

假设我们修改了某个 playbook 后，要应用到远程主机，并重启服务，就需要使用到 handlers。

以 nginx 为例，将 nginx 的端口从 8080 改为 8081 后，应用配置，并重启 nginx。虽然 nginx 提供了`nginx -s reload`重启命令，但是我们并不会使用它，因为有的服务没有重启命令，此处只是用 nginx 作为示例，剧本如下：

```yml
---
- hosts: testHost
  remote_user: root
  tasks:
  - name: Modify the configuration
    lineinfile:
      path=/etc/nginx/conf.d/vhost.conf
      regexp="listen(.*) 8080 (.*)"
      line="listen\1 8081 \2"
      backrefs=yes
      backup=yes
  - name: restart nginx
    service:
      name=nginx
      state=restarted
```

执行剧本 `ansible-playbook playbook.yml` ，输出如下：

```bash
$ ansible-playbook playbook.yml

PLAY [testHost] *********************************

TASK [Gathering Facts] **************************
ok: [testHost]

TASK [Modify the configuration] *****************
changed: [testHost]

TASK [restart nginx] ****************************
changed: [testHost]

PLAY RECAP **************************************
testHost : ok=3    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

使用 `ss -tnl` 命令可以看到端口已经成功改为 8081.再次执行 playbook，可以看到任务 Modify the configuration 变成了 ok，不再是 changed，也就是前面说的幂等性，ansible 检查到 nginx 配置与目标配置一致，就跳过该任务不再修改。但是仍然可以看到最后一步 nginx 重启了。

如果配置因为幂等性，没有修改，那自然我们也不希望 nginx 重启，此时可以使用 handlers 做到这一点，直接看配置：

```yml
---
- hosts: testHost
  remote_user: root
  tasks:
  - name: Modify the configuration
    lineinfile:
      path=/etc/nginx/conf.d/vhost.conf
      regexp="listen(.*) 8080 (.*)"
      line="listen\1 8081 \2"
      backrefs=yes
      backup=yes
    notify:
      restart nginx

  handlers:
  - name: restart nginx
    service:
      name=nginx
      state=restarted
  - name: Ping the host     # handlers和tasks一样可以定义多个任务，但是ping任务并没有被notify，所以也不会执行
    ping:
```

handlers 其实就是另一种 tasks，他们是平级的，handlers 只能被 tasks 中的任务调用，自己本身不会执行。只有当 tasks 中的任务实际真正执行了（没有因为幂等性跳过），才会调用 `notify` 中的 handlers.

如果想要一次性 notify 多个 handlers，需要使用 listen 关键字，示例如下：

```yml
---
- hosts: testHost
  remote_user: root
  tasks:
  - name: Modify the configuration
    lineinfile:
      path=/etc/nginx/conf.d/vhost.conf
      regexp="listen(.*) 8080 (.*)"
      line="listen\1 8081 \2"
      backrefs=yes
      backup=yes
    notify:
      this is a group

  handlers:
  - name: restart nginx
    listen: this is a group
    service:
      name=nginx
      state=restarted
  - name: Ping the host     # handlers和tasks一样可以定义多个任务，但是ping任务并没有被notify，所以也不会执行
    listen: this is a group
    ping:
```
