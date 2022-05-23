---
title: GraalVM Feature机制
date: 2022-01-05 22:58:00
tags: GraalVM
categories: 软件技术
---

## 概述

Feature 机制是 Substrate VM 的一种编译时功能特性扩展机制，由 org.graalvm.nativeimage.hosted.Feature 接口定义基本行为规范。每个实现了该接口的类各自负责某一项特定功能，它们一起组成了填充到静态编译框架骨骼上的肌肉。

Feature 的代码本身只在编译时执行，并不会在 native image 的运行时执行，但是由它们既可以添加编译时的功能特性，也可以添加运行时的功能特性，并且可以被方便地添加和删除，所以 Feature 是一种灵活的增加或去掉编译时和运行时行为的机制。

Feature 定义了 13 个可以在编译流程的不同阶段被调用的功能函数，还有 2 个规则函数定义了 Feature 在何种条件下被启用和当前 Feature 对其他 Feature 的依赖。GraalFeature 接口继承了 Feature 接口，另外增加了 6 个函数向 GraalVM 编译器里注册了对编译内容的扩展，一般用于需要直接修改编译内容的场景。

![20220105233337](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220105233337.png)

Substrate VM 中的功能特性基本上都是以 Feature 的方式开发实现的。目前在 Substrate VM 中共有 212 个 Feature 接口的实现类和 30 个 GraalFeature 的实现类，涵盖了编译框架方方面面的功能特性。

不过这些实现类并不是同时生效的，有的只对特定平台（x86 或 AArch64）有效，有的只对特定 JDK 版本生效。

## Feature 管理

### 注册

FeatureHandler 里聚合了 Feature 和 GraalFeature 的实现子类，对注册的实现类进行统一调用。

在这种管理中心统一调度的模型下，开发人员在定义 Feature 时只需关注当前 Feature 需要在什么阶段实现什么功能即可，不必考虑框架方面的细节问题。

Feature 有两种注册生效方式：一是通过@AutomaticFeature 注解自动注册；二是通过-H:Features=选项登记注册。NativeImageGenerator 在编译流程的准备阶段刚开始时就调用 featureHandler.registerFeatures 函数，遍历寻找 classlist 阶段加载的所有类中带有@AutomaticFeature 的类，然后反射调用它们的无参构造函数，将生成的实例放入队列中。然后从-H:Fetures=选项值中读取设置的 Feature 类，同样用反射构造实例再将返回结果注册到 featureInstances 里。不过在向 registerFeatures 添加 Feature 实例之前会先调用 Feature 实例的 getRequiredFeatures 函数，将要添加 Feature 的依赖的 Feature 加到当前 Feature 之前，以保证其中可能存在的数据依赖的正确性。

### 依赖

Feature 之间并不是相互隔离的，也可以存在依赖关系。当需要在相同的 Feature 函数之间建立依赖时，必须通过 getRequireFeatures 函数显式定义依赖对象

由于 FeatureHandler.featureInstances 是 ArrayList 类型，因此其中各 Feature 实例被遍历调用的顺序就由注册的顺序决定。

### ImageSingletons 单例库

Substrate VM 编译时环境中有一个 org.graalvm.nativeimage.ImageSingletons 类，代表了以键值对形式存储的单例库，其中以单例的类型为键，以单例对象为值，保存了在编译时定义的需要在编译过程中跨阶段使用或在 native image 运行时使用的所有单例对象。

### GraalFeature 实现静态编译优化

GraalFeature 是 Feature 接口的子类，额外定义了一组向编译器注册扩展功能特性的函数，从而影响最终生成的 native image 的运行时行为。

GraalVM 编译器是面向 OpenJDK Hotspot 运行时的 JIT 编译、AOT 编译以及 Substrate VM 静态编译的通用编译器，并不是针对静态编译而特别设计的。

先介绍一些关于 GraalVM 编译器的基础知识。编译器的任务是将源语言转换为目标语言，一般情况下，源语言是高级语言，目标语言是低级语言。具体到 GraalVM 编译器，其编译的源语言是 Java 字节码，目标语言是平台相关的汇编代码。GraalFeature 可以直接向 GraalVM 编译器里注册各种扩展组件，实现针对静态编译特有的编译优化。
