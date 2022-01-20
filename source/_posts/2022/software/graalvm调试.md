---
title: GraalVM 调试
date: 2022-01-19 17:03:00
tags: GraalVM
categories: 软件技术
---

因为 Substrate VM 静态编译的产物是本地代码（native code）的可执行文件或共享库文件，而不再是 Java 的字节码，所以 native image 需要用本地代码的调试器 GDB（GNU Debugger）进行调试。这一本质区别决定了 native image 的调试体验无法达到与传统 Java 程序的相同水平，这也是静态编译的局限性之一。

目前已经在 GDB 中基本实现了 Java 源码与本地代码的对应，支持在 Java 源码中设置断点、查看 Java 对象结构等功能。

## 编译 debug 版本的 native image

同一个程序可以被编译为 release 版本和 debug 版本，前者是在生产环境中部署的高性能的正式版，后者是用于测试和开发的拥有全部源码信息的调试版。

编译 debug 版本时会涉及以下选项。

- -H:Optimize（可选）：优化级别选项。一共设置了 3 个优化等级：0 级代表没有优化，1 级代表基本优化，2 级代表激进优化。默认为 2 级。但是目前并没有完全实现这三级，而只有优化或不优化两种情况，也就是 1 级和 2 级是相同的。在编译 debug 版时可以先关闭优化，设置-H:Optimize=0。
- -H:GenerateDebugInfo（必选）：这是生成调试信息的级别选项。在调试时需要为调试器准备调试信息，以将二进制文件中的符号和汇编代码与程序的源代码连接起来，使得我们可以在调试时看到对应的源码内容，而不仅仅是汇编代码。GenerateDebugInfo 的值为数字，代表调试信息的详细程度，其中 0 代表不生成调试信息，是编译 release 版本时的默认级别。但是在目前的实现中只会区分 0 或正数，所有的正数都会生成同样详细的调试信息。-g 就相当于-H:GenerateDebugInfo=2，虽然将调试信息的级别设为了 2，但目前与级别 1 的效果没有差异。
- -H:-SpawnIsolates（推荐）：该选项关闭 isolate 支持。SpawnIsolates 选项控制是否支持多 isolate，当静态编译的后端不是 LLVM 时，该选项默认为打开。但是使用 isolate 会对 Java 普通对象指针（Ordinary Object Pointer，OOP）的编码产生影响，会将 OOP 中域的地址设置为相对于 heap 起点的相对地址，而不是绝对地址。调试时需要额外手动将域的值与 heap 基地址寄存器（X86_64 中为 r14，AArch64 中为 r29）中的值相加才能获得实际地址。所以并不推荐在调试时开启 isolate 支持，建议用-H:-SpawnIsolates 选项将其关闭。
- -H:DebugInfoSourceSearchPath=（可选）：该选项指定调试信息所需 Java 源码的搜索路径。在生成调试信息时需要添加程序的 Java 源码，编译器会自动从几个可能的位置寻找源码，比如从当前 JDK 的根目录下的 src.zip 中寻找 Java 运行时的源码，从静态编译指定的 classpath 上寻找每个同名加“-sources.jar”后缀名的 jar 包，从中读取源码。但是这种默认做法并不能应对所有可能性，所以可以通过本选项另外设置源码的搜索位置。本选项的值用逗号分隔，可以是目录、源码的 zip 包或 jar 包，也可以重复设置任意多次。
- -H:DebugInfoSourceCacheRoot=（可选）：该选项指定为 GDB 提供的调试信息使用的源码的根目录。默认情况下调试信息使用的 Java 源码放在与 nativeimage 相同根目录的 sources 目录中，如果有特别的需要也可以通过本选项将它们放在其他位置。
- -H:-DeleteLocalSymbols（可选）：该选项会保留 native image 中的局部符号。因为 Substrate VM 只编译生成 native image 的可重定向文件（Linux 中的.o 文件），最终的编译产物是用第三方的链接器（Linux 中是 GCC）链接生成的。为了减小编译产物的大小，本选项是默认打开的，会使用 GCC 的-Wl,-x 链接参数在链接时清除本地符号。我们可以关闭这个选项以保留更多的信息便于调试。
- -H:+PreserveFramePointer（可选）：该选项会在编译时为每个函数的入口保留栈指针，从而可以在 native image 中看到完整的函数调用堆栈。为了减小编译产物的大小，默认会关闭此选项。但是此选项并不影响 Java 异常机制 Throwable 类中的调用栈的完整性，它们是两种不同的机制。目前 native image 调试并没有考虑栈指针的存在，如果打开本选项虽然能在程序出故障时看到完整的调用堆栈，但是会导致在设置函数断点时的位置不准。

```bash
$GRAALVM_HOME/bin/native-image -cp bin -H:-SpawnIsolates -g -H:Optimize=0 -H:Name=debugHelloWorld org.book.HelloWorld
```

## 使用 GDB 调试 native image

GDB 是在 C/C++和汇编语言程序中广泛使用的调试工具，native image 也需要通过 GDB 调试。

目前 native image 已经具备了在 GDB 里执行以下调试功能的能力：

- 通过指定 Java 源码的文件名加行号，或者函数名的方式设置断点；
- 在 Java 源码上的单步调试；
- 调用栈回溯；
- 打印原始类型的值；
- 结构化地按域值打印 Java 对象；
- 将对象按继承树上不同级别的类型强制转换显示；
- 可识别函数名和静态域名。
- 尚不支持但正在开发中的功能是识别函数参数名和函数中的局部变量名。

上述的功能清单勾画了当前 native image 调试能力的范围边界
