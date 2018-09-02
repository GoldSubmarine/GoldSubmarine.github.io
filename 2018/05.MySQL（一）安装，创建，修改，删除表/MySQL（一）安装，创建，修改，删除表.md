# MySQL安装，创建，修改，删除表

## 配置文件

配置文件地址：C:\ProgramData\MySQL\MySQL Server 8.0下的 **my.ini**

## 启动MySQL服务和停止MySQL服务

```sql
net start mysql //启动mysql服务
net stop mysql //停止mysql服务
```

## MySQL登录

下列是mysql的一些参数配置，默认参数可以不写

```sql
-D=name //打开制定数据库
--delimiter = name  //制定分隔符
-h=name //服务器地址
-p=password //小写p密码
-P=3306    //大写P端口号,3306为默认端口号
--prompt=name   //设置提示符（登陆后，替换mysql前缀这几个字）\D：完整的日期，\d：当前数据库，\h：服务器名称，\u：当前用户
-u=name //用户名
-V  //输出版本信息并退出
```

实例：`mysql -u root -p -P 3306 -h 127.0.0.1`

```sql
exit    //退出
```

## MySQL常用命令（注意结尾分号）

```sql
SELECT VERSION();   //打印当前版本
SELECT NOW();   //打印当前时间
SELECT USER();   //打印当前用户
```

## MySQL语句的规范

- 关键字与函数名称全部大写
- 数据库名称，表名称，字段名称全部小写
- SQL语句必须以分号结尾

```sql
CREATE DATABASE test1;   //创建一个名为test1的表
CREATE DATABASE IF NOT EXISTS test1;   //创建一个名为test1的表，重名的话，会发出警告
SHOW WARNINGS;      //显示警告
SHOW DATABASES;     //显示出所有的表名称
SHOW CREATE DATABASE test1;     //显示创建test1的详细指令，可以查看编码方式
CREATE DATABASE IF NOT EXISTS test2 CHARACTER SET gbk;  //创建一个表，使用gbk的编码方式
ALTER DATABASE test2 CHARACTER SET utf8;    //修改test2的编码方式为utf8
DROP DATABASE IF EXISTS test2;      //删除数据库test2
```

```sql
CREATE  //创建指令
DROP    //删除指令
ALTER   //修改指令
```