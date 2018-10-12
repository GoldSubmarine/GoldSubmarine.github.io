# Annotation注解

java5 引入了注解的概念，注解可以理解为标签  
`@Override` 准确复写  
`@Deprecated` 声明过期处理  
`@SuppressWarning` 压制警告
 
 ## 定义注解
 
 ```java
public @interface TestAnnotation {
}
```

注解通过 `@interface` 关键字进行定义,可以简单理解为将 `TestAnnotation` 这张标签贴到某个类或方法上面

## 元注解

元注解是可以注解到注解上的注解，元标签有 5 种。

### @Retention

当 @Retention 应用到一个注解上的时候，它解释说明了这个注解的的存活时间。
它的取值如下：
- RetentionPolicy.SOURCE 注解只在源码阶段保留，在编译器进行编译时它将被丢弃忽视
- RetentionPolicy.CLASS 注解只被保留到编译进行的时候，它并不会被加载到 JVM 中。 
- RetentionPolicy.RUNTIME 注解可以保留到程序运行的时候，它会被加载进入到 JVM 中，所以在程序运行时可以获取到它们。

```java
@Retention(RetentionPolicy.RUNTIME)
public @interface TestAnnotation {
    
}
```

### @Documented

这个元注解肯定是和文档有关。它的作用是能够将注解中的元素包含到 Javadoc 中去。

### @Target

@Target 指定了注解运用的地方。原本标签是你想张贴到哪个地方就到哪个地方，现在进行限制，比如只能张贴到方法上、类上、方法参数上等等。`@Target` 有下面的取值：

- ElementType.ANNOTATION_TYPE 可以给一个注解进行注解
- ElementType.PACKAGE 可以给一个包进行注解
- ElementType.TYPE 可以给一个类型进行注解，比如类、接口、枚举
- ElementType.CONSTRUCTOR 可以给构造方法进行注解
- ElementType.FIELD 可以给属性进行注解
- ElementType.METHOD 可以给方法进行注解
- ElementType.PARAMETER 可以给一个方法内的参数进行注解
- ElementType.LOCAL_VARIABLE 可以给局部变量进行注解

### @Inherited

如果一个超类被 @Inherited 注解过的注解进行注解的话，那么如果它的子类没有被任何注解应用的话，那么这个子类就继承了超类的注解。 

```java
@Inherited
@Retention(RetentionPolicy.RUNTIME)
@interface Test {}

@Test
public class A {}

public class B extends A {}
```

注解 Test 被 @Inherited 修饰，之后类 A 被 Test 注解，类 B 继承 A,类 B 也拥有 Test 这个注解。

### @Repeatable 

可重复注解，Java 1.8 才加进来的

```java
// 容器注解,里面必须要有一个 value 的属性,属性类型是一个被 @Repeatable 注解过的注解数组，注意它是数组
@interface Persons {
    Person[]  value();
}


@Repeatable(Persons.class)
@interface Person{
    String role default "";
}


@Person(role="artist")
@Person(role="coder")
@Person(role="PM")
public class SuperMan{

}
```

## 注解的属性

注解的属性也叫做成员变量。注解只有成员变量，没有方法，以“无形参的方法”形式来声明。  
在注解中定义属性时它的类型必须是 8 种基本数据类型，外加 类、接口、注解及它们的数组。  
注解中属性可以有默认值，默认值需要用 `default` 关键值指定。

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface TestAnnotation {
    String value();
    int id() default -1;
    int code() default 200;
    String msg();
}
```

上面代码定义了 TestAnnotation 这个注解中拥有 id 和 msg 两个属性。在使用的时候，我们应该给它们进行赋值。

```java
@TestAnnotation(code=3,msg="hello annotation")      // id 会取默认值
public class Test {
}

@TestAnnotation("hello annotation")      // 默认会赋值给 value 属性
public class Test {
}
```

还有一种情况，注解没有属性时，可以省略括号，比如：

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Perform {
}

@Perform
public void testMethod(){
}
```

## Java 预置的注解

- @Deprecated：用来标记过时的元素
- @Override：提示子类要复写父类中被 @Override 修饰的方法
- @SuppressWarnings：阻止警告
- @SafeVarargs：参数安全类型注解
- @FunctionalInterface：函数式接口注解，就是一个具有一个方法的普通接口，是 Java 1.8 版本引入的新特性。

## 注解使用

首先可以通过 Class 对象的 isAnnotationPresent() 方法判断它是否应用了某个注解

```java
public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
    
}
```

然后通过 getAnnotation() 方法来获取 Annotation 对象或者是 getAnnotations() 方法获取这个元素上的所有注解。

```java
public <A extends Annotation> A getAnnotation(Class<A> annotationClass) {}

public Annotation[] getAnnotations() {}
```

如果获取到的 Annotation 如果不为 null，则就可以调用它们的属性方法了。

```java
@TestAnnotation(msg="hello")
public class Test {

    @Check(value="hi")
    int a;


    @Perform
    public void testMethod(){}


    @SuppressWarnings("deprecation")
    public void test1(){
        Hero hero = new Hero();
        hero.say();
        hero.speak();
    }


    public static void main(String[] args) {

        boolean hasAnnotation = Test.class.isAnnotationPresent(TestAnnotation.class);

        if ( hasAnnotation ) {
            TestAnnotation testAnnotation = Test.class.getAnnotation(TestAnnotation.class);
            //获取类的注解
            System.out.println("id:"+testAnnotation.id());
            System.out.println("msg:"+testAnnotation.msg());
        }


        try {
            Field a = Test.class.getDeclaredField("a");
            a.setAccessible(true);
            //获取一个成员变量上的注解
            Check check = a.getAnnotation(Check.class);

            if ( check != null ) {
                System.out.println("check value:"+check.value());
            }

            Method testMethod = Test.class.getDeclaredMethod("testMethod");

            if ( testMethod != null ) {
                // 获取方法中的注解
                Annotation[] ans = testMethod.getAnnotations();
                for( int i = 0;i < ans.length;i++) {
                    System.out.println("method testMethod annotation:"+ans[i].annotationType().getSimpleName());
                }
            }
        } catch (NoSuchFieldException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
            System.out.println(e.getMessage());
        } catch (SecurityException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
            System.out.println(e.getMessage());
        } catch (NoSuchMethodException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
            System.out.println(e.getMessage());
        }
    }
}
```

运行结果：

```text
id:-1
msg:hello
check value:hi
method testMethod annotation:Perform
```

## 实例

写一个 Jiecha 注解，用来检查错误

```java
// NoBug.java

package ceshi;
import ceshi.Jiecha;


public class NoBug {

    @Jiecha
    public void suanShu(){
        System.out.println("1234567890");
    }
    @Jiecha
    public void jiafa(){
        System.out.println("1+1="+1+1);
    }
    @Jiecha
    public void jiefa(){
        System.out.println("1-1="+(1-1));
    }
    @Jiecha
    public void chengfa(){
        System.out.println("3 x 5="+ 3*5);
    }
    @Jiecha
    public void chufa(){
        System.out.println("6 / 0="+ 6 / 0);
    }

    public void ziwojieshao(){
        System.out.println("我写的程序没有 bug!");
    }

}
```

上面的代码，有些方法上面运用了 @Jiecha 注解,接下来定义这个注解

```java
package ceshi;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface Jiecha {

}
```

再编写一个测试类 TestTool 就可以测试 NoBug 相应的方法了

```java
package ceshi;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;



public class TestTool {

    public static void main(String[] args) {
        // TODO Auto-generated method stub

        NoBug testobj = new NoBug();

        Class clazz = testobj.getClass();

        Method[] method = clazz.getDeclaredMethods();
        //用来记录测试产生的 log 信息
        StringBuilder log = new StringBuilder();
        // 记录异常的次数
        int errornum = 0;

        for ( Method m: method ) {
            // 只有被 @Jiecha 标注过的方法才进行测试
            if ( m.isAnnotationPresent( Jiecha.class )) {
                try {
                    m.setAccessible(true);
                    m.invoke(testobj, null);

                } catch (Exception e) {
                    // TODO Auto-generated catch block
                    //e.printStackTrace();
                    errornum++;
                    log.append(m.getName());
                    log.append(" ");
                    log.append("has error:");
                    log.append("\n\r  caused by ");
                    //记录测试过程中，发生的异常的名称
                    log.append(e.getCause().getClass().getSimpleName());
                    log.append("\n\r");
                    //记录测试过程中，发生的异常的具体信息
                    log.append(e.getCause().getMessage());
                    log.append("\n\r");
                } 
            }
        }
        
        log.append(clazz.getSimpleName());
        log.append(" has  ");
        log.append(errornum);
        log.append(" error.");

        // 生成测试报告
        System.out.println(log.toString());
    }
}
```

测试的结果

```text
1234567890
1+1=11
1-1=0
3 x 5=15
chufa has error:

  caused by ArithmeticException

/ by zero

NoBug has  1 error.
```