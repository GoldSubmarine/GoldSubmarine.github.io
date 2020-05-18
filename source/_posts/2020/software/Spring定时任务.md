---
title: Spring定时任务
date: 2020-04-02 23:51:00
tags: spring
categories: 软件技术
---

spring-boot 项目中，想添加一个定时任务，可以怎么办？

## @Scheduled 注解

```java
@EnableScheduling
@SpringBootApplication
public class QuickMediaApplication {

    public static void main(String[] args) {
        SpringApplication.run(QuickMediaApplication.class, args);
    }

    @Scheduled(cron = "0/1 * * * * ?")
    public void sc1() throws InterruptedException {
        System.out.println(Thread.currentThread().getName() + " | sc1 " + System.currentTimeMillis());
        while (true) {
            Thread.sleep(5000);
        }
    }

    @Scheduled(cron = "0/1 * * * * ?")
    public void sc2() {
        System.out.println(Thread.currentThread().getName() + " | sc2 " + System.currentTimeMillis());
    }
}
```

上面只是介绍了简单的使用姿势，但有几个自然而然的疑问有待验证：

1. 一个项目中有多个定时任务时，他们是并行执行的还是串行执行的？

   若串行：则 sc1 打印一次，sc2 可能打印 0 或者 1 次  
   若并行：sc1 打印一次，sc2 打印 n 多次  
   执行一下上述代码，发现定时任务是串行执行的；如果一个任务出现阻塞，其他的任务都会受到影响

2. 那么有相同的 cron 表达式的定时任务之间，有先后顺序么？

   重复执行上述代码，发现 sc1 和 sc2 的打印是乱序的，并没有表现出明显的优先级关系

3. 如果需要他们并行执行，可以怎么做？

   首先是在 Application 上添加注解@EnableAsync，开启异步调用，然后再计划任务上加上@Async 注解即可

   ```java
   @EnableAsync
   @EnableScheduling
   @SpringBootApplication
   public class QuickMediaApplication {

       public static void main(String[] args) {
           SpringApplication.run(QuickMediaApplication.class, args);
       }

       @Scheduled(cron = "0/1 * * * * ?")
       @Async
       public void sc1()  {
           System.out.println(Thread.currentThread().getName() + " | sc1 " + System.currentTimeMillis());
       }
   }
   ```

   执行上述代码，从上面的输出，可以简单的推理，每次调度上面的任务都是新开了一个线程来做的，所以如果在定时任务中写了死循环，会导致不断创建线程，最后线程过多，整个进程崩掉

4. 自定义线程池

   ```java
   @Bean
   public AsyncTaskExecutor asyncTaskExecutor() {
       ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
       executor.setThreadNamePrefix("yhh-schedule-");
       executor.setMaxPoolSize(10);
       executor.setCorePoolSize(3);
       executor.setQueueCapacity(0);
       executor.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());
       return executor;
   }

   @Scheduled(cron = "0/1 * * * * ?")
   @Async
   public void sc1() throws InterruptedException {
       System.out.println(Thread.currentThread().getName() + " | sc1 " + System.currentTimeMillis());
       while (true) {
           Thread.sleep(1000 * 5);
       }
   }
   ```

   执行代码，发现最多 10 个线程，再提交的任务直接丢弃

> 参考链接：<https://juejin.im/post/5b64448af265da0f7f44c201>  
> 版权归作者所有，转载请注明出处
