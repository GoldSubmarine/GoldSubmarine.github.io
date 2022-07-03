---
title: RxJava Reactive Extension
date: 2022-04-04 23:11:00
tags: RxJava
categories: 软件技术
---

## Observable 发布

`rx.Observable<T>`代表了一个流形式的值序列，如果想将`Observable<T>`与你更熟悉的事物进行类比，那么`Iterable<T>`可能是最接近的抽象形式。

Iterator 能够非常有效地生成无穷序列，例如，所有的自然数，如下所示

![20220404232201](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220404232201.png)

Observable 本质上是基于推送的，这意味着由它决定何时生成值。而 Iterator 则会一直处于空闲状态，直到有人调用 next()条目。Observable 能够产生任意数量的事件。显然，这与经典的观察者（observer）模式非常类似，该模式也被称为发布-订阅模式。

`Observable<T>`可以生成三种类型的事件

- Observatble 声明的类型为 T 的值
- 完成事件
- 错误事件

Reactive Extensions 规范明确规定，所有 Observable 都可以发布任意数量的值，并且可以跟随一个完成或错误事件（但是不能两者兼有）。严格来说，Rx 设计指南将该规则定义成了如下的形式：`OnNext*(OnCompleted | OnError)?`

- `OnNext OnCompleted` 发布一个值并结束
- `OnNext+ OnCompleted` 发布多个值并结束
- `OnNext+` 发布无限个值，没有结束
- `只有OnCompleted或OnError` 表示正常或非正常的终止
- `OnNext+ OnError` 发布多个值后发生了错误
- 除此之外，你还可以实现不发布任何事件的 Observable，包括完成或错误事件。

## 订阅 Observable

前面讲到 Observable 是延迟执行的，只有被 subscribe 后才会执行

![20220404234944](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220404234944.png)

RxJava 契约会确保你的回调不会同时在多个线程中触发，即便事件是从多个线程中发布的。Observable 一般不会抛出异常，异常是 Observable 能够传播的另一种通知（事件）类型。所以，你不能围绕着 subscribe()使用 try-catch 代码块来捕获这个过程中的异常，而是提供一个单独的回调，如下所示。

![20220404235202](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220404235202.png)

subscribe()有多个重载版本，第二个参数是可选的。它会通知在生成条目的时候可能会抛出的异常，保证在这个异常之后，不会有其他的 Tweet 出现。在 Observable 中，异常是一等公民。抛出的异常可以快速传播，产生很多的副作用，比如不一致的数据结构或失败的事务。

第三个可选的回调让我们能够监听流的结束

![20220404235854](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220404235854.png)

如果你一开始就知道某个流是无穷的，那么订阅完成通知就没有意义了。另一方面，在某些场景中，流结束可能恰好是实际要等待的事件。

可以将 subscribe 的三个回调函数封装到一个`Observer<T>`类中。如下所示

![20220405000305](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220405000305.png)

## 使用 Subscription 和 `Subscriber<T>` 控制监听器

一个 Observable 可以有多个订阅者。类似于发布者-订阅者模式，一个发布者可以分发事件给多个消费者。`Observable<T>`只是一个类型化数据结构，它可能存活很短的时间，也可能只要服务器程序在运行，它就持续存活。

Observer 有订阅的能力，那么它也应该具有在合适的情况下取消订阅的能力。有两种方式支持该功能：Subscription 和 Subscriber。

Subscription 的使用方式如下

![20220405001002](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220405001002.png)

除了使用 Subscription 取消订阅，还可以在监听者内部实现取消订阅，即`Subscriber<T>`，它同时实现了`Observer<T>`和 Subscription。

![20220405001637](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220405001637.png)

## 创建 Observable

为了保证你真正理解订阅是如何运行的，不妨考虑如下的样例，它对同一个 Observable 订阅了两次。

![20220405175022](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220405175022.png)
![20220405175041](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220405175041.png)

每次调用 subscribe 时，都会调用 create 方法里的回调函数，并且整个过程都在 main 线程中运行，没有创建新的线程。

如果你不想为所有订阅者调用 create()，而是想重用已经计算的事件，那么可以使用非常便利的 cache()操作符。

![20220405175458](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220405175458.png)

cache()和无穷流组合将会带来灾难性的结果，也就是 OutOfMemoryError。

因为 create 中的 lambda 函数是在 main 线程中执行的，想象我们要创建一个生成所有自然数的无穷流，那 lambda 函数永远不会结束，subscribe 函数也会永远被阻塞住。你可能会问：订阅函数的执行不应该是异步的嘛，怎么会在 main 线程中执行呢？下面让我们显示的并发一下

![20220405182122](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220405182122.png)

这里不再是在客户端线程中直接运行阻塞循环，而是生成了一个自定义的线程，在该线程中发布事件。现在，subscribe()不会再阻塞客户端线程，因为它底层做的事情仅仅是生成一个线程。此处只是一个并发展示，RxJava 也有更好的声明式工具来处理并发。

Rx 要求订阅者不能并发地接收通知。涉及显式的线程时，很容易违反这个要求。按照这样的假设，可以编写同步的 Observer，通常只能由一个线程进行访问。

建议尽可能频繁地检查 isUnsubscribed()标记，从而避免将事件发送给那些已经不再想接收新事件的订阅者。更好的处理方式是取消订阅后，立刻清理资源，而不是等待 10 秒后，才发现已经取消了订阅。subscriber 实例提供了 add 方法用于注册取消订阅的回调

![20220405184423](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220405184423.png)

错误处理通常使用 try-catch 代码块，如下图：

![20220406002227](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220406002227.png)

Observable 通过一个值来结束，并且使用 try-catch 来进行包装是非常常见的模式，所以 RxJava 引入了内置的 fromCallable()操作符。在语义上，它与前面的代码相同，但是更加简短。

![20220406002314](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220406002314.png)

计时：timer()和 interval()，效果和 js 中的 setTimeout/setInterval 相同，它们在底层会创建一个线程，异步的执行回调函数

![20220406003123](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220406003123.png)

![20220406003215](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/20220406003215.png)

## hot 和 cold 类型的 Observable

cold 类型的 Observable 完全是延迟（lazy）执行的，如果没有观察者，那么 Observable 只是一个静态的数据结构，不会执行。cold 类型的 Observable 通常来源于 Observable.create()，还包括 Observable.just()、from()和 range()。从某种程度上来说，cold 类型的 Observable 依赖 Subscriber，每个订阅者会得到独立的流。

hot 类型的 Observable 不管是否有 Subscriber，它都可能已经开始发布事件了。通常发生在完全无法控制事件源的场景下。包括鼠标移动、键盘输入或按钮点击。

cold 类型的 Observable，你都会获得完整且一致的事件集。但如果 Observable 是 hot 类型的，那么你就无法确保能接收到所有事件。在技术上来讲，可以缓冲（cache 操作符）来自 hot 类型 Observable 的所有事件，让后续的订阅者都能接收到相同的事件序列，但是它消耗的内存量是没有限制的，所以在缓存 hot 类型的 Observable 时要非常小心。
