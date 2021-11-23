---
title: 发布jar至私服
date: 2021-11-23 11:50:00
tags: Java
categories: 软件技术
---

## 常用 maven 命令参数

|               | 含义                                                 |
| ------------- | ---------------------------------------------------- |
| mvn -v        | --version 显示版本信息;                              |
| mvn -h        | --help 显示帮助信息;                                 |
| mvn -e        | --errors 控制 Maven 的日志级别,产生执行错误相关消息; |
| mvn -X        | --debug 控制 Maven 的日志级别,产生执行调试信息;      |
| mvn -Pxxx     | 激活 id 为 xxx 的 profile (如有多个，用逗号隔开);    |
| mvn -Dxxx=yyy | 指定 Java 全局属性;                                  |

## mvn -Dxxx 常用的属性

| 含义         |
| ------------ | ------------------------------ |
| groupId      | 项目的 groupid                 |
| artifactId   | 项目的 artifactId              |
| version      | 版本号                         |
| packaging    | 打包方式【 jar / pom 】        |
| file         | 文件在本地磁盘的位置           |
| pomFile      | 相关的 pom 文件的的磁盘路径    |
| url          | nexus 私服所在服务器的 url     |
| repositoryId | setting 中配置的 nexus 的库 id |

```bash
# 示例
# 往私库 上传带 pom 的jar包，不指定的话，默认生成的pom文件里，是空白的，没有任何依赖
mvn deploy:deploy-file "-DgroupId=groupId" "-DartifactId=artifactId" "-Dversion=1.0" "-Dpackaging=jar" "-Dfile=jar file path" "-DpomFile=pom file path" "-Durl=http://localhost:8081/repository/maven-releases/" "-DrepositoryId=nexus"
```

指定 settings.xml

```bash
mvn help:effective-settings
```

查看当前生效的 settings.xml

```bash
mvn help:effective-settings
```

常用命令

```bash
mvn compile 	# 编译,将Java 源程序编译成 class 字节码文件。
mvn test 		# 测试，并生成测试报告
mvn clean 		# 将以前编译得到的旧的 class 字节码文件删除
mvn pakage		# 打包,动态 web工程打 war包，Java工程打 jar 包
mvn install 	# 将项目生成 jar 包放在仓库中，以便别的模块调用
mvn deploy		# 将项目打包，发布到nexus
```

settings.xml 文件示例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings>
<localRepository>D:\maven3.5-r9\repos</localRepository>
    <servers>
        <server>
            <id>nexus</id>
            <username>admin</username>
            <password>admin</password>
        </server>
		<server>
            <id>releases</id>
            <username>admin</username>
            <password>admin</password>
        </server>
		<server>
            <id>snapshots</id>
            <username>admin</username>
            <password>admin</password>
        </server>
    </servers>

    <mirrors>
        <mirror>
            <id>nexus</id>
            <mirrorOf>*</mirrorOf>
            <url>http://localhost:8081/repository/maven-public/</url>
        </mirror>
    </mirrors>

    <profiles>
        <profile>
            <id>nexus</id>
            <repositories>
                <repository>
                    <id>nexus</id>
            		<url>http://localhost:8081/repository/maven-public/</url>
                    <releases>
                        <enabled>false</enabled>
                        <updatePolicy>always</updatePolicy>
                    </releases>
                    <snapshots>
                        <enabled>false</enabled>
                        <updatePolicy>always</updatePolicy>
                    </snapshots>
                </repository>
                <repository>
                    <id>releases</id>
                    <name>Nexus Release Repository</name>
                    <url>http://localhost:8081/repository/maven-releases</url>
                    <releases>
                        <enabled>true</enabled>
                        <updatePolicy>always</updatePolicy>
                    </releases>
                </repository>
                <repository>
                    <id>snapshots</id>
                    <name>Nexus Snapshot Repository</name>
                    <url>http://localhost:8081/repository/maven-snapshots</url>
                    <snapshots>
                        <enabled>true</enabled>
                        <updatePolicy>always</updatePolicy>
                    </snapshots>
                </repository>
            </repositories>
            <pluginRepositories>
                <pluginRepository>
                    <id>nexus-plugin</id>
                    <url>http://localhost:8081/repository/maven-public</url>
                    <releases>
                        <enabled>true</enabled>
                        <updatePolicy>always</updatePolicy>
                    </releases>
                    <snapshots>
                        <enabled>true</enabled>
                        <updatePolicy>always</updatePolicy>
                    </snapshots>
                </pluginRepository>
            </pluginRepositories>
        </profile>
        <profile>
            <id>jdk1.8</id>
            <activation>
                <activeByDefault>true</activeByDefault>
                <jdk>1.8</jdk>
            </activation>
            <properties>
                <maven.compiler.source>1.8</maven.compiler.source>
                <maven.compiler.target>1.8</maven.compiler.target>
                <maven.compiler.compilerVersion>1.8</maven.compiler.compilerVersion>
            	<maven-jar-plugin.version>3.1.1</maven-jar-plugin.version>
            </properties>
        </profile>
    </profiles>
    <activeProfiles>
        <activeProfile>nexus</activeProfile>
        <activeProfile>jdk1.8</activeProfile>
    </activeProfiles>
</settings>
```
