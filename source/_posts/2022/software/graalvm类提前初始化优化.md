---
title: GraalVM 类提前初始化优化
date: 2022-01-08 15:36:00
tags: GraalVM
categories: 软件技术
---

根据 JVM 规范的定义，Java 类或接口的初始化是指调用其自身的初始化函数的行为。在运行时，Java 类在使用前都需要初始化并且只能初始化一次，所以每当执行到一个类时，都要检查其是否已经初始化过，如果没有则进行初始化。

在这个过程中有两处可以优化：一是类初始化的执行耗时，二是检查类是否被初始化过的耗时。在冷启动应用程序时，因类的初始化造成的开销也相当可观。

但并不是所有的类都可以提前初始化。类初始化除了改变类本身的状态外还会产生副作用。比如在类初始化时启动线程、获取当前时间等，这些行为必须在运行时执行，在编译时执行产生的结果并不符合程序语义。所以，Substrate VM 中定义了详细的规则，确保提前初始化类优化不会影响程序执行的正确性。

## java 中的类初始化

Java 类的初始化就是执行类的静态初始化函数—— `<clinit>`函数，以对类中定义的静态域进行初始化，并且执行定义在静态代码块，即源码中 static{}里定义的代码。

为了保证在多线程环境下类初始化的唯一性，JVM 还会用同步锁保护类初始化流程。

类初始化单例的实现

```java
public class Foo{
    private static Foo instance = new Foo();
    private Foo(){…}
    public static Foo getInstance() { return instance;}
}
```

## 编译时的类初始化

提前类初始化优化是一把双刃剑，一方面可以降低运行时的初始化开销，但是另一方面可能会导致正确性问题。

```java
public class InitTest {
    public static void main(String[] args) {
        new InitTest().test();
    }

    public void test(){
        long start = System.nanoTime();
        int first = DataHolder.intData[0];
        long end = System.nanoTime();
        System.out.println(end - start);

        start = System.nanoTime();
        int second = DataHolder.intData[1];
        end = System.nanoTime();
        System.out.println(end - start);
    }
}
class DataHolder {
    static int intData[];
    static {
        intData = new int[100];
        for (int i = 0; i < 100; i++) {
            intData[i] = i;
        }
    }
}
```

根据 Substrate VM 的文档，类初始化优化可以至少提升 2 倍的 native image 运行时性能。这个数据是类初始化优化前后的 native image 的性能对比，而不是 native image 与传统 JDK 的对比。

| \            | 第一次(ns) | 第二次(ns) |
| ------------ | ---------- | ---------- |
| 传统 JDK     | 301843.5   | 155.5      |
| native image | 72.5       | 50.5       |

但是提前初始化会可能导致不安全或运行时错误，参见以下代码

```java
public class Foo{
    private static final long START_TIME = System.nanoTime();
    …
}
```

Substrate VM 在实现类提前初始化优化时，建立了对类的提前初始化安全性的判断规则，只有符合规则，被确认为安全的类才会被优化。具体规则如下

1. 基本类型都被认为是安全的，会进行提前初始化。基本类型包括：注解接口、枚举类型、原始类型、数组、为注解生成的动态代理类、包含$$StringConcat 的动态字符串拼接类。
2. native image 运行时的支持类：由 Substrate VM 维护的运行时类
3. 应用程序定义的类和应用程序使用的三方库中的类 C：只有当类 C 所有的相关超类都是安全的，并且类 C 的`<clinit>`函数是安全的，则类 C 就是安全的。
   1. 相关超类，指 C 类的所有父类以及 C 类实现的含有 default 函数的接口。
   2. 当一个函数 M 存在以下任意一种情况时，我们认为 M 是不安全的函数。
      1. M 会最终调用到本地函数。因为本地函数是无法被分析的，不知道其中是否存在产生副作用的内容，所以统一将其视为不安全。
      2. M 函数中调用了无法唯一绑定实现的虚函数。这个限制主要是为了控制静态分析时的搜索空间范围。
      3. M 函数是 Substitution 机制的替换目标函数。
      4. M 函数调用了其他不安全的函数。
      5. M 函数中存在对另一个类的静态域的依赖。

Substrate VM 将类的初始化时机分为 3 种

- 提前初始化，表示为 BUILD_TIME 初始化；
- 延迟初始化，表示为 RUN_TIME 初始化；
- 重初始化，表示为 RERUN。主要针对 Substrate VM 框架中的类，普通用户可以忽略。

## 手动设置类初始化时机

Substrate VM 也支持开发人员和使用者手动对类初始化的时机进行设置。这种机制可以将某些已知初始化安全性的类的初始化时机固化下来，避免重复分析，以节省分析时间。但是，用户必须在完全了解要配置的类的初始化行为的前提下才能对其进行配置

选项式配置有两种风格的选项：`--initialize-at-[run|build]-time=<class.name>`和`-H:ClassInitialization=<class.name>:[build_time|run_time]`，它们具有完全相同的效果，选项的值是需要配置的类或包的全名，多个值之间使用逗号分隔。
