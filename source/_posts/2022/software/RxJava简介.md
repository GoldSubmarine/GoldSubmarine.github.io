---
title: RxJava 简介
date: 2022-04-04 15:02:00
tags: RxJava
categories: 软件技术
---

## 反应式编程

反应式编程（reactive programming）是一个通用的编程术语，它主要关注对变更做出反应，比如数据值或事件。反应式编程通常可以按照命令式（imperative）的方式来实现。回调就是一种以命令式实现反应式编程的方法。电子表格是反应式编程的一个绝佳例子：某些单元格依赖于其他的单元格，如果被依赖的单元格发生变化，这些单元格也会随之“做出反应”。

在现在的计算机中，当涉及操作系统和硬件时，一切都会变成命令式的。反应式-函数式编程就是一种抽象，就像高层级命令式编程术语是对底层二进制和汇编指令的抽象一样。记住并理解“一切都会变成命令式的”很重要，因为它能够帮助理解反应式-函数式编程的思维模型，并理解它最终是如何执行的，这里并没有什么魔法。

反应式-函数式编程解决的问题就是并发和并行。更通俗地说，它解决了回调地狱问题。回调地狱是以命令式的方式来处理反应式和异步用例带来的问题。

## 场景

反应式编程在如下场景中非常有用。

- 处理用户事件，比如鼠标移动和单击、键盘输入、GPS 信号因用户设备的移动而不断变化、设备陀螺仪信号和触摸事件等。
- 响应和处理来自磁盘或网络的所有延迟受限的 IO 事件，IO 本质上是异步的
- 在应用程序中处理由该应用程序无法控制的生产者推送过来的事件或数据（来自服务器的系统事件、上述用户事件、来自硬件的信号、模拟世界中由传感器触发的事件等）。

如果涉及的代码只处理一个事件流，那么使用带有回调的反应式-命令式编程就很好，引入反应式-函数式编程并不会带来太多的收益。如果你的程序像大多数程序一样，那么你需要组合事件（或者函数或网络调用的异步响应）、包含事件交互的条件逻辑，而且在所有调用之后必须处理故障场景和清理资源。在这种情况下，反应式-命令式的复杂性会急剧增加，而反应式-函数式编程则能体现出它的价值了。

反应式-函数式编程难入门而且学习曲线较陡峭，但是它的复杂性要远远低于反应式-命令式编程。

## 异步与同步

一般而言，Observable 是异步的，但它并非总是如此。Observable 可以是同步的，事实上，它默认就是同步的

以下代码示例完全是同步的

![20220404152408](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220404152408.png)

实际上，只是 Observable 包装的函数不停的通过 `onNext` 推送数据，Observable 本身是不知道异步与同步。

![20220404153150](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220404153150.png)

以上例子展示了一个既可能同步有可能异步的例子。

RxJava 会使用大量的操作符 API 来操作、组合和转换数据，比如 map()、filter()、take()、flatMap()和 groupBy()。大多数这样的操作符是同步的，这意味着在事件经过的时候，它们会在 onNext()中执行同步计算。

![20220404153342](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220404153342.png)

## 并发与并行

RxJava 的 Observable 契约要求事件（onNext()、onCompleted()、onError()）始终避免并发发布。换句话说，单个 Observable 流必须始终是序列化和线程安全的。

![20220404153638](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220404153638.png)

这段代码是合法的

![20220404153655](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220404153655.png)

这段代码是非法的，因为它的两个线程能够并发地调用 onNext()，这破坏了契约。

那么，该如何结合 RxJava 发挥并发和并行的优势呢？那就是组合。

![20220404154036](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220404154036.png)

## 延迟执行与立即执行

Observable 类型是延迟执行的，这意味着在订阅它之前，它什么事情都不会做。这与立即执行类型有所不同，比如 Future，它在创建之时就开始活跃工作了。

因为 Observable 是延迟执行的，也就意味着一个特定的实例可以调用多次。

![20220404155812](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220404155812.png)

现在有了两个单独的订阅，每个都调用 getDataFromServerWithCallback 并发布事件。

在进行组合的时候，延迟执行是非常有用的

## 双重性

Rx 的 Observable 是一个异步的“双重”（dual）Iterable。所谓“双重”，指的是 Observable 提供了 Iterable 的所有功能，但数据方向相反：它推送数据，而不是拉取数据。

Java 8 中的 Iterable 可以通过 java.util.stream.Stream 类型实现函数组合，使用的拉取的方式，如下所示

![20220404160156](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220404160156.png)

Rx 中的 Observable 允许通过推送的方式对异步数据进行编程

![20220404160322](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220404160322.png)

## 基数条目

### 事件流

事件流非常简单。随着时间的推移，生产者将事件推送给消费者

![20220404161235](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220404161235.png)

如果使用 Future 的话，它将无法很好地运行。

![20220404161307](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220404161307.png)

onSuccess 回调只能收到“最后的事件信息”，无法实现重复推送

### 多个值

多值响应是 Observable 的另一个用武之地。一般来讲，任何使用 List、Iterable 或 Stream 的地方，都可以使用 Observable 来替换。

![20220404161501](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220404161501.png)

同样，也可以和 Future 协作使用，如下所示。

![20220404161526](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220404161526.png)

两者实现了相同的功能，如果返回的数据列表比较小的话，这可能对性能并没有太大的影响，选择哪种方式完全取决于个人喜好。但是，如果列表非常大，或者远程数据源必须从不同的位置获取列表的不同部分，那么 `Observable<Friend>` 方式在性能和延迟性方面会有更好的表现。

Future 需要接收完所有的数据，才能进行后续处理，Observable 每接收一条信息就进行一次处理。

如果要等待整个集合的话，消费者将会经历完成该集合聚合需要的最长延迟。如果条目是以 Observable 流的形式返回，那么消费者能够立即接收它们并进行处理。要使这种方式能够正常运行，必须要牺牲流的顺序，这样才能让服务器按照收到的顺序发布条目。如果顺序对用户来说非常重要，那么在条目数据或元数据中可以包含一个排序或位置信息，这样客户端可以按需对条目进行排序和定位。

此外，这种方式还能按每个条目的需求分配内存，而不必为整个集合分配和收集内存。

### 单个值 Single

尽管 Rx Observable 在处理多值流的时候非常棒，但简洁的单值表示非常适合 API 的设计和使用。此外，基本的请求/响应行为在应用程序中非常普遍。基于此，RxJava 提供了一个 Single 类型，它与 Future 是对等的，只不过它是延迟执行的。其次，它适配 RxJava 的 API，所以它能够很容易地与 Observable 交互。

![20220404165721](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220404165721.png)

使用 Single 来代替 Observable 表示“单个值的流”能够简化使用，只需考虑如下行为中的一种

- 响应错误
- 永远不响应
- 响应成功

而在使用 Observable 的时候，默认是多值的，必须要考虑一些其他的状态

- 响应错误
- 永远不响应。
- 响应成功，没有数据并终止。
- 响应成功，有单个数据值并终止。
- 响应成功，有多个数据值并终止。
- 响应成功，有一个或多个值，并且永远不终止（等待更多数据）。

使用 Single，消费该 API 的思维模型会更加简单。

### 无返回值 Completable

除了 Single 之外，RxJava 还有一个 Completable 类型。它解决了没有返回类型，只需要表示成功或失败的常见场景。
