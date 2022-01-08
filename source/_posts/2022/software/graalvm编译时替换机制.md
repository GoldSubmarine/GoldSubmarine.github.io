---
title: GraalVM 编译时替换机制
date: 2022-01-06 00:39:00
tags: GraalVM
categories: 软件技术
---

编译时替换机制是 Substrate VM 的一项非常重要的基础特性，可以无侵入地在编译时用替换类更换目标程序中的原始类，以实现对目标程序的运行时行为更新。替换机制使得 SubstrateVM 可以在不修改 JDK 源代码的前提下，对 JDK 的运行时行为进行静态化适配改造，以保持对传统 Java API 的兼容。

```java
public class Foo{
    private enum Type{…}
    private void bar(Type t){…}
}

@TargetClass(Foo.class)
public final class Target_Foo{
    @Substitute
    void bar(Target_Type t){…}
}

@TargetClass(name="Foo", innerClass="Type")
public final class Target_Foo_Type{}
```

## 实现原理

静态编译的过程是先对字节码进行静态分析，得到基于分析类型（AnalysisType、AnalysisMethod 和 AnalysisField）的分析数据，然后将分析得到的可达函数编译到 native image。

替换机制在分析开始前先将所有的可替换元素都收集起来，在分析的过程中仅将遇到的可替换类中声明的替换元素对应的原始元素替换掉，所以在分析结果的数据中，所有应替换的原始元素均已被替换掉了，编译时编译器并不用关心替换的问题。
