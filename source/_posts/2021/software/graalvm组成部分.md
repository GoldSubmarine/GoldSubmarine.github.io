---
title: GraalVM 组成部分
date: 2022-01-01 01:08:00
tags: GraalVM
categories: 软件技术
---

## Compiler

GraalVM 编译器是用 Java 语言编写的 Java 编译器。

可集成到 OpenJDK 的 HotSpot JVM 中取代现有的 C2 编译器。既可以在运行时进行 JIT 编译，也可以在运行前提供 AOT 编译。

作为 Truffle 解释器的编译器，除了依赖它的解释执行，还依赖底层的 JIT 编译。

Substrate VM 使用 GraalVM 编译器作为其静态编译器，在离线状态下将 Java 程序的字节码编译为本地代码。因为 GraalVM 编译器本身也是一个 Java 程序，所以它可以被 Substrate VM 静态编译为本地库文件（称为 libgraal），从而进一步提升运行时性能，降低运行时内存使用，减小对主体程序的影响。

## Truffle

Truffle 是一个解释器实现框架。它提供了解释器的开发框架接口，可以快速开发出不同语言解释器，进而可以使用 GraalVM 编译器进行 JIT 编译优化，从而得到高效的运行时性能。

## Espresso

Espresso 是从 GraalVM 21.0 开始引入的子项目，是一个基于 Truffle 框架开发的，符合 Java 8 和 Java 11 规范的 Java 字节码解释器。这层解释器解耦了底层真正运行的 JVM，使得 java8 on java11 或 java11 on java8 成为可能。

## Substrate VM

静态编译框架 Substrate VM。它提供了将 Java 程序静态编译为本地代码的编译工具链，包括了编译框架、静态分析工具、C++支持框架及运行时支持等。但是 Substrate VM 中并没有编译器和链接器，因为其编译器是 GraalVM 编译器，而链接器则使用了 GCC（在 Linux 系统上）。

## Sulong

Sulong 子项目是 GraalVM 为 LLVM 的中间语言 bitcode 提供的高性能运行时工具，是基于 Truffle 框架实现的 bitcode 解释器。

## wasm

一个基于 GraalVM 实现的 WebAssembly 引擎，用于解释执行或者编译一个 WebAssembly 程序。

## 综述

从以上子项目的组成可以看到，GraalVM 将各种不同的语言汇集于统一的 Truffle 运行时平台执行，再由 GraalVM 编译器在运行时通过 JIT 编译加速执行。因为 GraalVM 整体使用 Java 编写，所以理论上这些子项目最终都可以被 Substrate VM 静态编译，作为动态库 so 文件嵌入其他项目中，实现更进一步的性能提升，这也是 Oracle GraalVM 项目组的一大愿景。目前 GraalVM 编译器已经被 Substrate VM 静态编译为 libgraal.so 库文件，然后集成到 OpenJDK 中取代了传统的 C2 编译器。

## 编译系统工具 mx

因为项目本身的复杂性和定制化程度较高，所以没有使用 Ant、Maven、Gradle 等现有的主流编译系统，而使用自己基于 Python 开发的命令行编译系统工具 mx。

整个项目由 225 个模块组成，包括 41 个 Substrate VM 子项目模块，112 个编译器子项目模块，42 个 Truffle 子项目模块和 30 个 SDK 子项目模块。如此复杂的项目无法直接用 ide 查看，我们需要使用 mx 工具自动生成 IDE 配置。支持构建 Eclipse、IDEA 和 NetBean 的项目配置文件。
