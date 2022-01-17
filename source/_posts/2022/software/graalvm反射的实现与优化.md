---
title: GraalVM 反射的实现与优化
date: 2022-01-08 16:16:00
tags: GraalVM
categories: 软件技术
---

反射是 Java 语言的一项重要特性，可以帮助开发人员在运行时不受限制地访问任何类、域和函数等反射目标，并且调用任何函数。反射的目标甚至不需要在编译时存在，只要在运行时存在即可。

但是，反射的动态性违反了静态编译的封闭性原则，反射的目标是用字符串表达的，而字符串的实际值在静态分析中是几乎无解的。

![20220108164413](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220108164413.png)

假设从程序入口开始经过各种调用后抵达了一个通过反射执行的函数调用——Method.invoke，该调用指向了反射目标函数（用虚线表示），随后又会引出一系列调用。在静态编译中，缺少了反射目标信息就意味着从反射调用到反射目标之间的这条调用虚线中断了，那么右下方的众多程序都会被认为不可达而不会编译到 native image 中，造成程序的正确性问题。

Substrate VM 基于配置实现了对反射的支持，即在编译阶段另外提供一个反射配置文件，告诉编译器反射的目标有哪些。

在掌握了反射目标信息后，Substrate VM 进一步优化了反射的运行时实现，使得静态编译的反射运行时性能较传统方式提升了 6 倍。

## 传统反射

![20220108165646](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220108165646.png)

无论获取哪种反射目标元素，都要先拿到元素所在的类，所以 Java 反射的隐含条件是反射目标元素所在的类必须在 classpath 上。接下来会检查元素所在类对象的 reflectionData 域中是否已经缓存了拟反射的元素，如有则返回缓存值，如果没有再通过本地函数查找反射目标，然后把结果填入缓存再返回。

获取反射目标元素至少需要调用一次本地函数，性能较差。虽然通过缓存可以提高第二次及以后的反射访问性能，但 reflectionData 域是 SoftReference，所以当程序内存吃紧时会被 GC 回收。

## 配置反射信息

反射的目标信息往往只有在运行时才能获得，在编译时几乎无法从源码中静态地分析出来，所以在静态编译中支持反射的最大困难在于如何在编译时知道反射的目标元素是什么。目前的解法是将反射的目标信息以配置的形式额外提供给 Substrate VM

反射配置文件是默认文件名为 reflect-config.json 的 json 文本，其 jsonschema 如下所示。

```java
{
String name; // 含包名的类全名
boolean allDeclaredConstructors; // 对应Class.getDeclaredConstructors()
boolean allPublicConstructors;   // 对应Class.getConstructors()
boolean allDeclaredMethods;       // 对应Class.getDeclaredMethods()
boolean allPublicMethods;         // 对应Class.getMethods()
boolean allDeclaredFields;        // 对应Class.getDeclaredFields()
boolean allPublicFields;          // 对应Class.getFields()
{
   String name;                 // 函数名
   String[] parameterTypes; // 参数类型列表（可选项，函数名不能唯一确定时使用）
  }[] methods;
  {
      String name;          // 域名
  }[] fields;
}[];
```

Schema 的第一项 name 是反射目标元素所在类的含包名的全名，如果反射目标元素是类，那么就是它本身。类的名字用“$”将外部类和内部类隔开。接下来的几个 boolean 项是指，当代码中使用了注释中的反射函数时，可以将对应项声明为 true，如果没有使用则不必添加该项。当代码中使用了获取某个具体函数的反射 API 时，需要在函数列表中填写对应的函数名，构造函数的函数名为 `<init>`。函数的参数类型列表上填写参数的类型（含包名的全名）；原始类型则写其 Java 关键字，如 int、float 等；数组则在类型元素类型名后加“[]”后缀。

示例：

```java
[
 {
   "name" : "java.lang.Class",
   "allDeclaredConstructors" : "true",
   "allPublicConstructors" : "true",
   "allDeclaredMethods" : "true",
   "allPublicMethods" : "true"
 },
 {
   "name" : "java.lang.String",
   "fields" : [
     { "name" : "value" },
     { "name" : "hash" }
   ],
   "methods" : [
     { "name" : "<init>", "parameterTypes" : [] },
     { "name" : "<init>", "parameterTypes" : ["char[]"] },
     { "name" : "charAt" },
     { "name" : "format", "parameterTypes" : ["java.lang.String", "java.lang.Object[]"]
       },
   ]
 },
 {
   "name" : "java.lang.String$CaseInsensitiveComparator",
   "methods" : [
     { "name" : "compare" }
   ]
  }
]
```

当反射配置文件保存为编译时 classpath 的 META-INF/native-image/reflect-config.json 文件时，可以被 Substrate VM 自动识别生效。如果放在其他位置则需要通过编译时选项-H:ReflectionConfigurationFiles=指定配置文件的位置，多个文件用逗号分隔。

**反射配置的 schema 以类为单位组织，如果只有对类的反射（如 Class.forName），则只需要提供类名即可；如果有对函数和属性的反射，则会在类的配置项中增加对应的函数项和属性项。函数项至少需要函数名，如果在类中存在同名函数，则还要提供函数的参数类型列表以唯一确定对应的函数；属性项只需要属性名即可，因为类中的属性名都是唯一的。**

## 生成反射配置文件的工具

手动配置反射信息是一项烦琐且容易出错的工作。在一个简单的 Spring Boot 应用中就可能会有上百条反射项，这是难以手动完成的。因此 Substrate VM 另外提供了可以自动生成反射配置文件的工具——native-image-agent，帮助开发人员快速得到应用程序的反射及其他动态特性的配置。

native-image-agent 是一个基于 JVMTI 的运行时代理，可以挂载在被编译的应用程序上监控“获取反射目标”类型的 JDK API 函数，开发人员需要先运行一遍拟编译的应用程序，每当这些 API 被执行到时，代理都会记录下它们的反射信息，最后生成配置文件。这种方式可以高效地生成静态编译所需的配置文件。

配置文件和自动生成过程对反射**覆盖率**是不可控的，所以不能保证对传统 Java 应用中反射的 100%兼容。

## Substrate VM 的反射实现

Substrate VM 能够借由反射配置文件在编译时得到反射元数据，从而不仅支持了反射功能的实现，甚至还大幅提升了静态编译后反射的运行时性能。

反射特性是由 com.oracle.svm.reflect.hosted.ReflectionFeature 类实现的，该类实现了 Feature 接口，，在准备阶段解析配置文件，在 duringAnalysis 阶段将反射数据填入 DynamicHub.reflection-Data，在 registerGraphBuilderPlugins 阶段注册了调用插件。运行时的支持则由 java.lang.Class 的替换类 DynamicHub，以及 Method、Field、Constructor、AccesibleObject 和 Executable 等反射类所对应的替换类完成。

除了通过配置文件设置反射外，Substrate VM 还提供了位于 RuntimeReflection 类中的一组注册反射信息的 API，用于支持通过编程的方式注册反射，序列化 Feature 就是典型地使用了 RuntimeReflection 注册反射元数据的例子，它在 duringSetup 阶段为序列化目标类的部分函数注册了相应的反射元数据。

## 其他类似动态特性的支持

- JNI 调用：配置文件可以由-H:JNIConfigurationFiles=选项指定，也可以保存为能够被 native-image 在编译时自动识别的 classpath 路径下的 META-INF/native-image/jni-config.json 文件。
- 动态代理：配置文件可以由-H:DynamicProxyConfigurationFiles=选项指定，也可以保存为能够被 native-image 在编译时自动识别的 classpath 路径下的 META-INF/native-image/proxy-config.json 文件。
- 资源访问：资源配置文件可以由-H:ResourceConfigurationFiles=选项指定，也可以保存为能够被 native-image 在编译时自动识别的 classpath 路径下的 META-INF/native-image/resource-config.json 文件。
- 序列化特性：通过设置用逗号分隔的-H:Serialization-ConfigurationFiles=选项指定配置文件，用逗号分隔的-H:SerializationDenyConfigurationFiles=选项指定出于安全原因需要拒绝的序列化目标对象类型。默认以 classpath 下的 META-INF/native-image/serialization-config.json 文件作为序列化的配置文件。序列化特性是将 Java 对象转换为字节数组再恢复回来的技术，对应 java 的 Serializable
