---
title: graalvm native-image-agent实现
date: 2022-01-18 23:36:00
tags: GraalVM
categories: 软件技术
---

native-image-agent 是基于 JVMTI（JVM Tool Interface）开发的 Agent 程序，用于在 Java 程序运行时记录对动态特性的访问，并生成动态特性配置文件。Agent 也是一个 JNI 的静态或者动态共享库

JVMTI 是 C 语言接口，传统的 JVMTI Agent 都是用 C 语言开发的。JVMTI 提供了大量的函数用于获取 JVM 的状态和修改程序的执行过程，这些函数涵盖了内存管理、线程、线程组、栈帧、强制函数提前返回、堆管理、局部变量控制、断点设置、域访问、类管理、对象信息、函数控制等方面，可以说用户通过这些函数就可以对程序的运行时实现全面控制。

开发 Agent 时需要先#include `<jvmti.h>`，然后在 Agent_OnLoad 里定义 Agent 关心的事件，再在事件对应的函数中实现在该事件中要做的事情。开发完成后用 C/C++编译器将程序编译为动态或者静态库，然后在启动 Java 应用时用-agentlib 选项指定要载入的 Agent 及其所需的参数。

## native-image-agent 的可用选项

native-image-agent 默认可以接受多个参数，对生成的配置文件结果进行定制，其参数格式和添加方式与普通的 Java Agent 完全一样。基本的使用方法为：

```bash
java -agentlib=native-image-agent:[参数1],[参数2]
```

- trace-output=：输出追踪文件。native-image-agent 可以追踪动态特性函数的调用方信息，并将其输出到指定的 json 格式文件中。
- config-output-dir=：指定生成动态特性配置文件的输出目录。native-image-agent 会记录所有的动态特性调用，并将它们输出到指定的目录下。该选项支持使用变量{pid}和{datetime}指定基于应用程序运行时的进程号和时间的可变的输出目录。例如该选项输出的文件名为各动态特性的默认文件名，即`[reflect|resource|jni|proxy|serialization|predefined-classes]-config.json`。该选项会以覆盖模式将各配置文件输出到指定的路径下。
- config-merge-dir=：指定生成动态特性配置文件的输出目录，该选项的基本用法与 config-output-dir 完全相同，只是会合并指定目录中已有的配置文件中的配置项，而不是覆盖它们。需要注意的是该选项与 config-output-dir 是互斥的，只能设置其中之一。
- no-builtin-caller-filter：不使用 native-image-agent 内置的调用过滤器。本选项属于 caller-filter，会关闭内置的默认 caller 过滤器，仅能用于测试目的，因为可能导致静态编译失败。
- builtin-caller-filter=：是否使用内置调用过滤器，可以接受的值为 true 或 false。默认情况下无须设置即为 true，设为 false 则等同于 no-builtin-caller-filter 选项。
- no-builtin-heuristic-filter：不使用内置的启发式过滤器。内置的启发式过滤器是针对 JVM 内部的过滤器，默认是开启的，关闭会导致静态编译失败，仅用于调试目的。
- builtin-heuristic-filter=：是否使用内置启发式过滤器，可以接受的值为 true 或 false。默认情况下无须设置即为 true，设为 false 则等同于 no-builtin-heuristic-filter 选项。
- caller-filter-file=：指定自定义的 caller-filter 文件的位置，文件内容格式如代码清单 14-1 所示。所有从文件中配置的类中产生的动态特性调用都按配置的 include-Classes 或 excludeClasses 指示从记录中加入或排除。
- access-filter-file=：指定自定义的 access-filter 文件的位置，文件内容格式如代码清单 14-1 所示。所有到文件中配置的类中的动态特性调用都按配置的 includeClasses 或 excludeClasses 指示从记录中加入或排除。
- config-write-period-secs=：指定将配置信息写到文件中的时间间隔，单位为秒，必须为正整数。
- config-write-initial-delay-secs=：指定第一次将配置信息写到文件中的时间，单位为秒，必须为正整数，与 config-write-period-secs 选项配合使用。
- config-to-omit=：指定需要忽略的配置文件所在目录。与 config-out-dir 或 config-merge-dir 选项配合使用，所有出现在指定忽略的配置文件中的配置项都将被 native-image-agent 在记录时忽略掉。
  有时我们并不需要 native-image-agent 记录所有的动态特性调用，比如来自 Substrate VM 框架本身的、JDK 内部的，或者测试框架的等，那么就可以为 Agent 设置各种过滤器，native-image-agent 支持两种类型的过滤：**caller-filter**（对动态特性使用方的过滤）和 **access-filter**（对动态特性定义方的过滤）。
  ```json
  {
    "rules": [
      { "excludeClasses": "com.oracle.svm.**" },
      { "includeClasses": "com.oracle.svm.tutorial.*" },
      { "excludeClasses": "com.oracle.svm.tutorial.HostedHelper" }
    ]
  }
  ```
  过滤设置写在 json 文件的 rules 部分中，每一项可以是 excludeClasses 或者 include-Classes。前者指需要从配置中排除的类，后者指需要在配置中加入的类。可用的通配符有\*\*(匹配类和子包)和\*(匹配类)两种，前者匹配类和子包，后者匹配类。过滤器中后出现的条目会覆盖先出现的条目，所以内置过滤器会最先加载，随后再加载用户自定义的过滤器
