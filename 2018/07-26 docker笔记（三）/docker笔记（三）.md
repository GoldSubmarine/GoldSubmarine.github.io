# 常用命令

- `-p`：docker和主机之间的端口映射，例如：`docker run --name webserver -d -p 80:80 nginx` ，[文档](https://docs.docker.com/engine/reference/run/#expose-incoming-ports)
- `-i`：交互式操作(Interactive)
- `-t`：终端(terminal)
- `-q`：仅列出ID值
- `-f`：过滤(filter)，可结合go语言模板语法
- `-rm`：删除，运行结束后，删除该存储层，[文档](https://docs.docker.com/engine/reference/run/#clean-up---rm)
- `--format`：格式化输出结果，可结合[go语言模板语法](https://gohugo.io/templates/introduction/)使用。