---
title: 使用 ControllerAdvice 注解统一处理日期映射和异常捕获
date: 2019-09-08 18:01:00
tags: spring
categories: 软件技术
---

## 作用

@ControllerAdvice，是 Spring3.2 提供的新注解

- @ControllerAdvice 是一个 @Component，用于定义@ExceptionHandler，@InitBinder 和@ModelAttribute 方法，适用于所有使用 @RequestMapping 方法。
- Spring4 之前，@ControllerAdvice 在同一调度的 Servlet 中协助所有控制器。Spring4 已经改变：@ControllerAdvice 支持配置控制器的子集，而默认的行为仍然可以利用。
- 在 Spring4 中， @ControllerAdvice 通过 annotations(), basePackageClasses(), basePackages()方法定制用于选择控制器子集。

简单来说就是给所有的 Controller 加上统一的 @ExceptionHandler 或 @InitBinder 或 @ModelAttribute 处理。

## 统一异常处理

```java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理所有不可知的异常
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity handleException(Exception e){
        log.error("服务器异常：{}", e);
        return new ResponseEntity<>("服务器异常，请稍后重试", HttpStatus.BAD_REQUEST);
    }

    /**
     * 处理数组越界异常
     */
    @ExceptionHandler(ArrayIndexOutOfBoundsException.class)
    @ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR,reason = "数组越界")
    public void handleAccessDeniedException(ArrayIndexOutOfBoundsException e){
        log.error("数组越界：{}", e.getMessage());
    }

    /**
     * 业务代码错误
     */
    @ExceptionHandler(value = ServiceException.class)
    public ResponseEntity serviceException(ServiceException e) {
        log.error("业务代码错误：{}", e.getMessage());
        return new ResponseEntity<>("业务代码错误：", HttpStatus.BAD_REQUEST);
    }
}
```

@RestControllerAdvice 是 @ControllerAdvice 的增强，类似于 @RestController

上面的代码中可以看到通过 @RestControllerAdvice 注解，将上面的三种异常处理加到了所有的 controller 上，这样就能捕获所有能到达 controller 层的异常。

以上只是 demo 展示，最佳实战请见另一篇博客 [spring 统一异常处理](https://blog.javahub.org/2019/09/08/2019/Spring%E5%BC%82%E5%B8%B8%E5%A4%84%E7%90%86%E5%8F%8A%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/)

## 统一日期映射处理

```java
@ControllerAdvice
public class ControllerHandler {

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        dateFormat.setLenient(false);
        binder.registerCustomEditor(Date.class, new CustomDateEditor(dateFormat, true));
    }

}
```

相当于给所有的 controller 加了 initBinder，这样就可以自定义映射时间到 bean 中。还有一种通过 Converter 的写法：

```java
// ControllerHandler.java
@ControllerAdvice
public class ControllerHandler {

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        GenericConversionService genericConversionService = (GenericConversionService) binder.getConversionService();
        if (genericConversionService != null) {
            genericConversionService.addConverter(new DateConverter());
        }
    }

}

// DateConverter.java
public class DateConverter implements Converter<String, Date> {
    private static final String dateFormat = "yyyy-MM-dd HH:mm:ss";
    private static final String shortDateFormat = "yyyy-MM-dd";
    private static final String timeStampFormat = "^\\d+$";

    @Override
    public Date convert(String value) {
        if(StringUtils.isEmpty(value)) {
            return null;
        }
        value = value.trim();
        try {
            if (value.contains("-")) {
                SimpleDateFormat formatter;
                if (value.contains(":")) {
                    formatter = new SimpleDateFormat(dateFormat);
                } else {
                    formatter = new SimpleDateFormat(shortDateFormat);
                }
                return formatter.parse(value);
            } else if (value.matches(timeStampFormat)) {
                Long lDate = new Long(value);
                return new Date(lDate);
            }
        } catch (Exception e) {
            throw new RuntimeException(String.format("格式化时间 %s 失败", value));
        }
        throw new RuntimeException(String.format("格式化时间 %s 失败", value));
    }

}
```
