---
title: Spring 异常处理及最佳实践
date: 2019-09-08 22:31:00
tags: spring
---

spring 中有三种方式能够处理异常 @ResponseStatus、 ResponseEntity、 HttpServletResponse，下面比较他们的优缺点：

## HttpServletResponse

HttpServletResponse 是 javax.servlet 下的一个接口，如下使用：

```java
@RequestMapping(value = "/user", method = RequestMethod.GET)
public void getUser(HttpServletResponse response) throws IOException{
    response.setStatus(500);
    response.getWriter().append("server error");
}
```

这种方式可以很好的实现同时满足自定义反馈码+消息内容，一般的实现方式也都是这样。但是也有不太好的地方：

1. 如果需要返回 json 格式数据还需要设置 response.setContentType("application/json");和 response.setCharacterEncoding("UTF-8");这样做有些多余，重复的工作太多，虽然可以进行封装。
2. 最严重的问题是返回值必须是 void 类型，否则就会和 @ResponseBody 出现冲突，其次就是不能利用 @ResponseBody 自动封装 json 的特性，在 spring mvc 框架中如果在方法上加上@ResponseBody 是可以对返回值自动进行 json 封装的。

## @ResponseStatus

@ResponseStatus 是一个注解，可以作用在方法和类上面，如下使用：

```java
@RequestMapping(value = "/user", method = RequestMethod.GET)
@ResponseStatus(code=HttpStatus.INTERNAL_SERVER_ERROR,reason="server error")
public String getUser(){
    return "hello user";
}
```

启动程序后，返回值如下：

```text
Whitelabel Error Page
This application has no explicit mapping for /error, so you are seeing this as a fallback.

Sun Sep 08 23:36:04 CST 2019
There was an unexpected error (type=Internal Server Error, status=500).
server error
```

getUser 方法中没有错误，结果还是出现了 500 错误，也就是说只要加了该注解，就一定会报错，可以用在自定义异常或全局捕获的异常处：

```java
@ResponseStatus(code=HttpStatus.INTERNAL_SERVER_ERROR,reason="111")
public class ServerException extends Exception {

}
```

缺点如下：

- 无法返回一个 json 格式的自定义错误信息
- code 值和 reason 只能是写死的，不能动态变化，于是每种异常都要定义一个异常类，基本无法使用。

## ResponseEntity

ResponseEntity 是 spring 中的一个类，直接上代码

```java
@RequestMapping(value = "/user", method = RequestMethod.GET)
public ResponseEntity getUser() {
    Map<String,Object> map = new HashMap<String,Object>();
    map.put("name", "qwer");
    return new ResponseEntity(map, HttpStatus.OK);
}
```

返回结果

```json
{
  "name": "qwer"
}
```

可以看到自动将 map 转成了 json，于是可以在异常类中动态修改 http 状态码和自定义返回 json 了。比上方两种都要强大。

## 最佳实践

```java
// Result.java
// 统一的返回数据封装
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Result<E> implements Serializable {

    /**
     * 序列化
     */
    private static final long serialVersionUID = 801303944859566772L;

    /**
     * 操作结果的状态码，200为成功，其余失败
     */
    private Integer code;

    /**
     * 操作结果的描述信息，可作为页面提示信息使用
     */
    private String msg;

    /**
     * 返回的业务数据
     */
    private E data;

    public static <E> Result<E> success() {
        return Result.<E>builder().code(200).msg("调用成功").build();
    }

    public static <E> Result<E> successMsg(String msg) {
        return Result.<E>builder().code(200).msg(msg).build();
    }

    public static <E> Result<E> success(E data) {
        return Result.<E>builder().code(200).msg("调用成功").data(data).build();
    }

    public static <E> Result<E> success(String msg, E data) {
        return Result.<E>builder().code(200).msg(msg).data(data).build();
    }

    public static <E> Result<?> success(int code, E data) {
        return Result.<E>builder().data(data).code(code).msg("调用成功").build();
    }

    public static <E> Result<?> success(int code, String msg, E data) {
        return Result.<E>builder().data(data).code(code).msg(msg).build();
    }

    public static <E> Result<E> fail() {
        return Result.<E>builder().code(0).msg("调用失败").build();
    }

    public static <E> Result<E> failMsg(String msg) {
        return Result.<E>builder().code(0).msg(msg).build();
    }

    public static <E> Result<E> fail(E data) {
        return Result.<E>builder().code(0).msg("调用失败!").data(data).build();
    }

    public static <E> Result<?> fail(int code, String msg) {
        return Result.<E>builder().code(code).msg(msg).build();
    }

    public static <E> Result<?> fail(int code, String msg, E data) {
        return Result.<E>builder().data(data).code(code).msg(msg).build();
    }

    @Override
    public String toString() {
        return "Result{" + "code=" + code + ", msg='" + msg + '\'' + ", data=" + data + '}';
    }
}
```

```java
// ResultCode.java
// 业务代码的code值
public interface ResultCode {
    int BAD_REQUEST = 400;

    /**
     * 接口未授权
     */
    int UNAUTHORIZED = 4001;

    /**
     * 重新登录
     */
    int TOLOGIN = 50014;

}
```

```java
//ServiceException.java
//自定义业务异常
@Data
public class ServiceException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * 业务代码code
     */
    private Integer code;

    /**
     * http协议的status
     */
    private HttpStatus httpStatus;

    public ServiceException() {
        super();
    }

    public ServiceException(String msg) {
        super(msg);
    }

    public ServiceException(int resultCode, String msg) {
        super(msg);
        this.code = resultCode;
    }

    public ServiceException(HttpStatus httpStatus, String msg) {
        super(msg);
        this.httpStatus = httpStatus;
    }

    public ServiceException(HttpStatus httpStatus, int resultCode, String msg) {
        super(msg);
        this.httpStatus = httpStatus;
        this.code = resultCode;
    }
}
```

```java
// GlobalExceptionHandler.java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理所有不可知的异常
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result> handleException(Exception e){
        log.error("", e);
        return new ResponseEntity<>(Result.fail(ResultCode.BAD_REQUEST,"服务器异常，请稍后重试"), HttpStatus.BAD_REQUEST);
    }

    /**
     * 处理 接口无权访问异常AccessDeniedException
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Result> handleAccessDeniedException(AccessDeniedException e){
        log.error("无权访问：{}", e.getMessage());
        return new ResponseEntity<>(Result.fail(ResultCode.UNAUTHORIZED, "无权访问"), HttpStatus.UNAUTHORIZED);
    }

    // ...其他异常

    /**
     * 业务代码错误
     */
    @ExceptionHandler(value = ServiceException.class)
    public ResponseEntity<Result> serviceException(ServiceException e) {
        log.error(e.getMessage());
        Result result = Result.fail();
        if(Objects.nonNull(e.getCode())) {
            result.setCode(e.getCode());
        }
        if(Objects.nonNull(e.getMessage())) {
            result.setMsg(e.getMessage());
        }
        if(Objects.nonNull(e.getHttpStatus())) {
            return new ResponseEntity<>(result, e.getHttpStatus());
        }
        return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
    }
}
```

这样就既能自定义 http 状态码，也能灵活改变业务状态码，并实现了返回值都是 json，这样前端处理更加友好。使用实例：

```java
@RequestMapping(value = "/user", method = RequestMethod.GET)
public ResponseEntity getUser() {
    throw new ServiceException(HttpStatus.UNAUTHORIZED, ResultCode.TOLOGIN, "未授权，请联系管理员");
}
```
