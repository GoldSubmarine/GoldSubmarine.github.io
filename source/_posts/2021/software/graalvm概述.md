---
title: GraalVM 概述
date: 2021-12-30 22:36:00
tags: GraalVM
categories: 软件技术
---

## GraalVM 是什么

![20211230223651](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20211230223651.png)

这些语言可以作为客座语言（guest language）运行在主语言（host language）也就是 Java 的平台上，客座语言程序与主语言程序共享同一个运行时，在同一个内存空间里交互数据。

图片下方列出了 GraalVM 的适用场景，可以看到其既可以作为组件嵌入 OpenJDK（用 GraalVM 编译器代替 OpenJDK 的 C2 编译器做 JIT 编译）和 Node.js，也可以在 Oracle 数据库中支持直接运行内嵌的 JavaScript 代码，或者作为独立的应用程序运行（Java 静态编译程序）。

![20211230232059](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20211230232059.png)

上图展示了 GraalVM 实现多语言支持的框架结构。Truffle 是 GraalVM 里的解释器实现框架，开发人员可以使用 Truffle 提供的 API 快速用 Java 实现一种语言的解释器，从而实现了在 JVM 平台上运行其他语言的效果。更进一步，Truffle 中还给出了指导 JIT 编译的 Profiling 接口和编译优化接口，使得用 Truffle 实现的解释器还能将频繁执行的热点函数送入 JVM 的 GraalVM 编译器执行运行时的实时编译。

自 GraalVM 21.0 开始，JVM 类型的语言（图 2-2 圈中的）既可以通过名为 Java on Truffle 的组件由 Truffle 统一执行，也可以按旧有的通过 JVM 解释器进而 JIT 编译的方式执行。Java onTruffle 是基于 Truffle 实现的完全遵循 JVM 8 和 11 规范的 Java 字节码解释器。Java on Truffle 目前的性能还不够好，但它为 Java 世界带来了更多更有想象力的可能性，例如混用 JDK 新旧版本的能力。

![20211230232441](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20211230232441.png)

Java 和 Scala 比原生的略好，这里参与对比的是 GraalVM 支持 JVM 类型语言的方式，而不是 Java on Truffle，也就是 GraalVM 编译器和 OpenJDK 的 C2 JIT 编译器的对比。Ruby 和 R 语言的性能有大幅提高，这是因为它们原生只有解释执行而没有 JIT 编译。Native 使用的是 LLVM 的提前编译（AOT）器，JavaScript 是 JS V8 编译器，GraalVM 比它们的性能要差。

## 静态编译的优点

除多语言支持以外，GraalVM 的最大特性就是本书的主角——Java 静态编译。

GraalVM 的 Java 静态编译器就是上图中位于 GraalVM 架构底层的 GraalVM JITCompiler，这意味着 GraalVM 统一了 JIT 和 AOT 编译器。

GraalVM 的静态编译方案的基本实现思路是由用户指定编译入口（比如 main 函数），然后编译框架从入口开始静态分析程序的可达范围，编译器将分析出的可达函数和 SubstrateVM 中的运行时支持代码一起编译为一个被称为 native image 的二进制本地代码文件。根据用户的参数设置，这个本地代码文件既可以是 ELF 可执行文件，也可以是动态共享库文件。

当语言的抽象程度减弱时，描述同一件事情所需的代码量就会增大，所以当一段 Java 的字节码被编译为本地代码时，代码行数会大幅增加，造成代码量的膨胀，GraalVM 以 main 函数为入口，将所有**可达**的代码编译到 native image 中。

GraalVM 静态编译还实现了多种运行时优化，典型的有对 Java 静态初始化过程的优化。传统 Java 模型中的类是在第一次被用到时初始化的，之后每次用到时还要再检查是否已经被初始化过。GraalVM 则将其优化为在编译时初始化，只要编译时初始化成功，就无须在运行时做初始化检查。但并不是所有的类都可以在编译时初始化，假如一个类的初始化函数里启动了一个线程或者获取了当前的时间，那么这种运行时行为就不能在编译时初始化。

## 静态编译的缺点

- 静态分析是资源密集型计算，需要消耗大量的内存、CPU 和时间。
- 对反射的分析能力非常有限。对于实际中存在的大量反射，只能通过额外配置的方式加以解决。但是当代码发生变化时，配置也需要随之改变，如有遗漏则会造成运行时错误。
- 静态编译后程序的运行时性能低于传统 Java 经过 JIT 编译后的峰值性能。
  - 虽然启动性能好，但是缺少运行时的程序动态执行画像数据，不能执行更有针对性的 JIT 编译优化。
  - 传统 Java 可以针对不同的场景选择性能更佳的 GC 策略，但是 GraalVM 的垃圾回收机制较简单，其企业版提供了性能较好的 G1，社区版只提供了最简单的顺序 GC（serial GC）

## 使用场景

该技术非常适合快起快停、不会长时间运行的 Java Serverless 应用。
