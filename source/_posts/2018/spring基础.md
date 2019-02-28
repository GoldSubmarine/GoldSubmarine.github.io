---
title: Spring基础
date: 2018-11-15 00:15:12
tags: java
---

1. Spring框架的核心功能有两个：

    - Spring容器作为超级大工厂，负责创建、管理所有的Java对象，这些Java对象被称为Bean。
    - Spring容器管理容器中Bean之间的依赖关系，Spring使用一种被称为"依赖注入"的方式来管理Bean之间的依赖关系。

2. 两种注入方式的对比

    - 设值注入有如下优点：

        与传统的JavaBean的写法更相似，程序开发人员更容易理解、接受。通过setter方法设定依赖关系显得更加直观、自然。

        对于复杂的依赖关系，如果采用构造注入，会导致构造器过于臃肿，难以阅读。Spring在创建Bean实例时，需要同时实例化其依赖的全部实例，因而导致性能下降。而使用设值注入，则能避免这些问题。

        尤其在某些成员变量可选的情况下，多参数的构造器更加笨重。

    - 构造注入优势如下：

        构造注入可以在构造器中决定依赖关系的注入顺序，优先依赖的优先注入。

        对于依赖关系无需变化的Bean，构造注入更有用处。因为没有setter方法，所有的依赖关系全部在构造器内设定，无须担心后续的代码对依赖关系产生破坏。

        依赖关系只能在构造器中设定，则只有组件的创建者才能改变组件的依赖关系，对组件的调用者而言，组件内部的依赖关系完全透明，更符合高内聚的原则。

3. 可通过scope为Bean指定作用域，Spring支持如下五种作用域（scope）：

    - singleton: 单例模式，在整个Spring IoC容器中，singleton作用域的Bean将只生成一个实例。

    - prototype: 每次通过容器的getBean()方法获取prototype作用域的Bean时，都将产生一个新的Bean实例。

    - request: 对于一次HTTP请求，request作用域的Bean将只生成一个实例，这意味着，在同一次HTTP请求内，程序每次请求该Bean，得到的总是同一个实例。只有在Web应用中使用Spring时，该作用域才真正有效。

    - session：该作用域将 bean 的定义限制为 HTTP 会话。 只在web-aware Spring ApplicationContext的上下文中有效。

    - global session: 每个全局的HTTP Session对应一个Bean实例。在典型的情况下，仅在使用portlet context的时候有效，同样只在Web应用中有效。

    **总结：**Spring默认使用singleton作用域。prototype作用域的Bean创建、销毁代价比较大。而singleton作用域的Bean实例可以重复使用。因此，应该尽量避免将Bean设置成prototype作用域。

4. Bean管理

    - 在xml中可以通过ref可以指定要引用的bean的id，在注解中使用@Qualifier指定Bean的id来执行自动装配。

    - 生命周期的钩子，@PostConstruct初始化Bean时执行，@PreDestroy销毁Bean时执行，都用于修饰方法，无须任何属性。

    - @Autowired注入，默认采用byType自动装配策略。@Resource修饰实例变量时，将会直接使用反射中的Field注入，此时连setter方法都可以不要。

    - Spring的"零配置"支持：@Component标注一个普通的Spring Bean类；@Controller标注一个控制器组件类；@Service标注一个业务逻辑组件类；@Repository标注一个DAO组件类。在Spring配置文件中做如下配置，指定自动扫描的包：`<context:component-scan base-package="edu.shu.spring.domain"/>`

5. 自动装配的几种方式

    - no: 不使用自动装配。Bean依赖必须通过ref元素定义。这是默认配置，在较大的部署环境中不鼓励改变这个配置，显式配置合作者能够得到更清晰的依赖关系。

    - byName: 根据setter方法名进行自动装配。Spring容器查找容器中全部Bean，找出其id与setter方法名去掉set前缀，并小写首字母后同名的Bean来完成注入。如果没有找到匹配的Bean实例，则Spring不会进行任何注入。

    - byType: 根据setter方法的形参类型来自动装配。Spring容器查找容器中的全部Bean，如果正好有一个Bean类型与setter方法的形参类型匹配，就自动注入这个Bean；如果找到多个这样的Bean，就抛出一个异常；如果没有找到这样的Bean，则什么都不会发生，setter方法不会被调用。

    - constructor: 与byType类似，区别是用于自动匹配构造器的参数。如果容器不能恰好找到一个与构造器参数类型匹配的Bean，则会抛出一个异常。

    - autodetect: Spring容器根据Bean内部结构，自行决定使用constructor或byType策略。如果找到一个默认的构造函数，那么就会应用byType策略。

6. AOP

    - 通过扫描指定的注解，获取到要进行aop的对象。
    - AOP分为两类：静态AOP在编译阶段对程序进行修改，生成静态的AOP代理类，以AspectJ为代表，性能好但需要特殊的编译器支持。动态AOP在运行阶段动态生成AOP代理，以Spring AOP为代表，纯java实现，性能略差。