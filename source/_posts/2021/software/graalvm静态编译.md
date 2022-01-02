---
title: GraalVM 静态编译
date: 2022-01-02 16:18:00
tags: GraalVM
categories: 软件技术
---

## 动态反射

在 Java 的动态特性（如反射和动态类加载）的支持下，有些依赖项在编译时并不需要，只要在运行时能够找到即可。例如下面这种通过反射调用目标函数的情况，编译时并不会依赖 a.b.C 类，只要运行时的 classpath 中提供了该类即可。

```java
Class c = Class.forName("a.b.C");
Method m = c.getDeclaredMethod("m");
n.invoke();
```

如果运行时没有执行到这段代码，那应用程序也不会报任何错误。

Java 语言的动态特性违反了静态编译的封闭性假设。GraalVM 允许通过配置的形式将缺失的信息补充给静态编译器以满足封闭性。

- `reflect-config.json`：向静态编译提供反射目标信息
- `jni-config.json`：JNI 回调目标信息
- `resource-config.json`：资源文件信息
- `proxy-config.json`：动态代理目标接口信息
- `serialization-config.json`：序列化信息
- `predefined-classes-config.json`：提前定义的动态类信息

静态编译框架会根据用户提供的配置信息，从编译时的 classpath 上寻找对应的元素，并将它们编译到最后的产物中，从而实现封闭性。

## 编译依赖和运行时依赖

Java 程序对库的依赖，无论在编译时还是运行时都是不完全的，但是静态编译出于封闭性的要求必须在编译时获得所有依赖，一旦完成编译，依赖就被内化成了二进制可执行程序的一部分，运行时也无法再变化。因此在准备静态编译目标应用程序时，必须先准备好目标应用程序的编译时和运行时两部分的依赖。

实际项目中往往使用了如 Maven 之类的构建工具，pom.xml 的`<dependency>`项的`<scope>`属性用来指定依赖的类型，`compile` 表示编译时依赖，`runtime` 表示运行时依赖，Maven 有多个插件可以将应用程序和所有依赖库全部打包到一个被称为 Fat Jar 的包中

## 依赖生成工具 native-image-agent

手动维护配置文件工作巨大，并且开发人员也未必清楚所有的反射信息，尤其是第三方库或框架里的使用。GraalVM 提供了 native-image-agent，启动时指定该 agent，可以在运行时监控并记录这些动态特性的调用信息，并自动生成配置文件。

```bash
$GRAALVM_HOME/bin/java -cp $CP -agentlib:native-image-agent=config-output-dir=$PROJECT_ROOT/src/main/resources/META-INF/native-image AppMain
```

native-image-agent 不需要额外下载，包含在 GraalVM 的基础安装包内，直接配置就可使用。使用此 agent 还需要注意两点：

1. 启动 agent 必须使用 GraalVM JDK 内的 java。此 agent 使用 GraalVM 独有的一些特性，其他 JDK 没有
2. 静态编译框架会默认从 classpath 下的`/META-INF/native-image`目录读取配置文件

更多信息参见文档：https://www.graalvm.org/reference-manual/native-image/Agent

## 命令行模式编译

GraalVM 及其所有子项目都是命令行界面的应用程序，其他形式只是命令行的包装。

```bash
$GRAALVM_HOME/bin/bative-image -cp $CP $OPTS [app.Main]
// 或
$GRAALVM_HOME/bin/bative-image $OPTS -jar [app.jar]
```

-cp: 指定编译的依赖范围

$OPTS 是编译时设置的选项，从使用的角度可以分为

- 启动器选项用于控制启动器行为
  1. -cp、--classpath、-jar、--version
  2. --debug-attach[=<port>] 在指定端口开启远程调试，默认端口是 8000
  3. 编译器参数，可以通过$GRAALVM_HOME/bin/native-image --help查看，更多的是以“-H:”为前缀（目前共有544个）的高级选项，这些选项可以通过执行$GRAALVM_HOME/bin/native-image --expert-options-all | grep“\-H:”查看。
  4. --allow-incomplete-classpath：静态分析可能会将实际不会执行的代码加入编译，这部分代码的依赖是允许缺失的
  5. --allow-incomplete-classpath：允许不完全的 classpath，静态分析可能会将实际不会执行的代码加入编译，这部分代码的依赖是允许缺失的
  6. --initialize-at-run-time：将指定的单个类或包中的所有类的初始化推迟到运行时。类初始化优化是 GraalVM 的一个创新，但并非所有类都可以在编译时初始化。Substrate VM 会自动判断一个类是否可以在编译时初始化，用户也可以手动指定类的初始化时机。
  7. --initialize-at-build-time：将指定的单个类或包中的所有类的初始化提前到编译时。
  8. --shared：将程序编译为共享库文件，不加此选项默认将应用程序编译为可执行文件。
  9. -J<Flag>：设置 native-image 编译框架本身的 JVM 参数。
  10. -H:Name：指定编译产生的可执行文件的名字。
  11. -H:-DeleteLocalSymbols：禁止删除本地符号，本参数默认设置为打开，即会删除本地符号。如果有调试需求，可以关闭此选项。
  12. -H:+PreserveFramePointer：保留栈帧指针信息，本参数默认为关闭。如有调试需求，可以将此参数设置为打开。
  13. -H:+ReportExceptionStackTraces：打印编译时异常的调用栈，本参数默认为关闭。打开后就可以在静态编译出错时输出完整的异常调用栈信息，帮助发现异常原因以便修复。
- 编译器选项
- 运行时选项
  1. 运行时参数用于控制可执行程序的运行时表现，以“-R:”开头，目前共有 378 个，数量可能会随版本升级而变化。执行`$GRAALVM_HOME/bin/native-image --expert-options-all | grep "\-R:"`查看所有运行时参数及说明。

最后的 app.Main 是应用程序主类的全名。静态编译需要指定编译的入口，对于一般的应用程序需要给出 main 函数所在的主类。Substrate VM 会自动在主类中寻找 main 函数作为编译入口。如果设置了--shared 选项编译动态库文件，则无须设置主类。

## 配置文件模式

当静态编译使用的编译参数较多时，就需要通过执行脚本或配置文件来管理参数，GraalVM 官方推荐使用配置文件管理。目前配置文件支持用户自行配置 3 个属性。

- Args：设置各项参数，类似上述的$OPTS。不同参数用空格分隔，换行使用“\”。
- JavaArgs：设置静态编译框架本身的 JVM 参数，等同于上述的-J<Flag>。
- ImageName：设置编译生成的文件名，等同于上述的-H:Name 参数。

配置文件的默认保存路径是静态编译时 classpath 下的 `META-INF/native-image/native-image.properties`。Substrate VM 会从 classpath 的文件目录结构或 classpath 上的 jar 包中按上述路径寻找有效的配置文件。

## Maven 插件模式

在使用 Maven 插件编译项目时，必须首先保证系统环境变量 GRAALVM_HOME 指向了 GraalVM JDK 所在的目录。

使用 Maven 插件时需要先在应用程序的 pom 中添加编译所需的 graal-sdk 依赖

```xml
<dependency>
    <groupId>org.graalvm.sdk</groupId>
    <artifactId>graal-sdk</artifactId>
    <version>${graalvm.version}</version>
    <scope>provided</scope>
</dependency>

<plugin>
    <groupId>org.graalvm.nativeimage</groupId>
    <artifactId>native-image-maven-plugin</artifactId>
    <version>${graalvm.version}</version>
    <executions>
        <execution>
            <goals><goal>native-image</goal></goals>
            <phase>package</phase>
        </execution>
    </executions>
    <configuration>
        <skip>false</skip>
        <imageName>example</imageName>
        <mainClass>app.Main</mainClass>
        <buildArgs>--no-fallback -H:-DeleteLocalSymbols</buildArgs>
    </configuration>
</plugin>
```

- skip: 是否执行静态编译，true 表示不执行，false 表示执行。

配置完成后执行 mvn package 即可在项目 target 目录下生成静态编译的可执行文件。

## Gradle 插件模式

```kotlin
// build.gradle
plugins {
    id 'org.graalvm.buildtools.native' version "${current_plugin_version}"
}
```

```kotlin
// settings.gradle
pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}
```

```kotlin
// build.gradle
nativeBuild {
    imageName = "application"
    mainClass= "org.test.Main"
    buildArgs("--no-server")
    debug = false
    verbose = false
    fallback = false
    classpath("dir1", "dir2")
    jvmArgs("flag")
    runtimeArgs("--help")
    systemProperties = [name1: "value1", name2: "value2"]   // 设置执行静态编译的JVM系统属性
    agent = false   // 指定是否需要启动native-iamge-agent
    nativeTest {
        agent = false
    }
}
```

Gradle 插件中一共有 4 个任务

- nativeRun：以 native image 的形式执行当前项目的应用。这个任务会先对当前的 Java 项目执行静态编译。
- nativeBuild：将当前项目静态编译为 native image。
- nativeTest：将 test 目录中的所有测试静态编译到一个单一 native image 中并执行。
- nativeTestBuild：静态编译项目的 test 目录中的所有测试。

当使用 agent 生成配置信息时，需要依靠 Junit5 的测试代码覆盖所有的流程，可以在 build.gradle 中为 Gradle 的测试 JVM 指定 native-image-agent 选项

```kotlin
subprojects {
    test {
        jvmArgs "-agentlib:native-image-agent=config-output-dir=test-configs"
        filter {
            includeTestsMatching "AllTest*"
        }
    }
}
```
