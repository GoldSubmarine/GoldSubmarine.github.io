---
title: Activiti 入门
date: 2020-06-03 10:14:00
tags: Activiti
categories: 软件技术
---

所谓工作流引擎是指 workflow 作为应用系统的一部分，并为之提供对各应用系统有决定作用的根据角色、分工和条件的不同决定信息传递路由、内容等级等核心解决方案。工作流引擎包括流程的节点管理、流向管理、流程样例管理等重要功能。

Activiti 是众多开源流程引擎中的一个。Activiti7 就是这个引擎当前最新的版本了。

## Spring Boot 2.x 整合 Activiti7

Activiti6 发布时 spring boot2.0 还未发布，而 Activiti7 对 spring boot2.0 支持的比较完善，所以这里我们选择 Activiti7

```xml
<!-- activiti -->
<dependency>
    <groupId>org.activiti</groupId>
    <artifactId>activiti-spring-boot-starter</artifactId>
    <version>7.1.0.M6</version>
    <exclusions>
        <exclusion>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<!-- mybatis-plus-boot -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.3.2</version>
</dependency>

<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>
```

需要安装的依赖就这些了，需要注意的是，我这里使用的是 MyBatis-plus，在 Activiti7 中是内置了 MyBatis ，如果发生依赖错误，请将 Activiti 中的 Mybatis 依赖排除掉。

接下来配置 application.yml

```yml
spring:
  # Activiti 相关配置
  activiti:
    # 是否对数据库架构进行检查更新
    database-schema-update: true
    # 历史储存级别
    history-level: full
    # 是否开启数据库储存历史记录 如果不开启这个配置的话 Activiti 只会创建17张表，完整的Activiti引擎依赖25张表
    db-history-used: true
  # 数据库配置
  datasource:
    url: jdbc:mysql://localhost:3306/activiti-seed?useUnicode=true&characterEncoding=utf-8&nullCatalogMeansCurrent=true
    username: root
    password: 123456
```

**注意：**datasource url 连接上需配置 `nullCatalogMeansCurrent=true` 参数，否则无法创建表，具体详情参见 activiti issue 区

## 绘制流程图

前一篇文章已经搭建好了 Vue + Bpmn.js 流程编辑器，画好流程图后，下载 bpmn 文件， 在项目的 resources 下新建一个 bpmn 的文件夹来存放刚刚画好的 bpmn 文件，当然你要是想要把这个文件夹命名别的名称也没啥。

## 概念

- RepositoryService
  是 Activiti 的仓库服务类。所谓的仓库指流程定义文档的两个文件：bpmn 文件和流程图片。
- RuntimeService
  是 activiti 的流程执行服务类。可以从这个服务类中获取很多关于流程执行相关的信息。
- TaskService
  是 activiti 的任务服务类。可以从这个类中获取任务的信息。
- HistoryService
  是 activiti 的查询历史信息的类。在一个流程执行完成后，这个对象为我们提供查询历史信息。

- ACT_RE_*: 'RE'表示repository。 这个前缀的表包含了流程定义和流程静态资源 （图片，规则，等等）。ACT_RE_PROCDEF 是基于 KEY_ 去升级版本号, 当原有的 key 已经存在, 就会升级版本号, 其中 KEY_, VERSION_, TENANT_ID_ 共同组成一个唯一键
- ACT_RU_*: 'RU'表示runtime。 这些运行时的表，包含流程实例，任务，变量，异步任务，等运行中的数据。 Activiti只在流程实例执行过程中保存这些数据， 在流程结束时就会删除这些记录。 这样运行时表可以一直很小速度很快。
- ACT_ID_*: 'ID'表示identity。 这些表包含身份信息，比如用户，组等等。
- ACT_HI_*: 'HI'表示history。 这些表包含历史数据，比如历史流程实例， 变量，任务等等。
- ACT_GE_*: 通用数据， 用于不同场景下，如存放资源文件。

## 部署流程

部署流程的方法基本有以下几种

- addInputStream 通过输入流部署
- addString 通过字符串部署
- addClasspathResource 通过文件路径读取流程文件部署
- addZipInputStream 通过压缩包输入流部署

```java
@Resource
private RepositoryService repositoryService;

public void deploy(ProcessDeploymentDTO processDeploymentDTO) {
    // 部署流程后回返回对应部署成功的流程定义对象
    // 通过 RepositoryService 创建一个流程定义
    Deployment deployment = this.repositoryService.createDeployment()
        // 设置流程定义名称
        .name(processDeploymentDTO.getName())
        /**
         * 添加输入流，两个参数
         * @param name 第一个参数是设置流程定义文件的名称
         * @param inputStream 第二个参数输入流，从提交的文件中获取输入流，读取到上传的文件数据
         */
        .addInputStream(processDeploymentDTO.getFile().getOriginalFilename(), // 获取文件名
        processDeploymentDTO.getFile().getInputStream()) // 从文件中获取输入流
        // 流程定义的类别
        .category(processDeploymentDTO.getCategory())
        // 流程定义的key
        .key(processDeploymentDTO.getKey())
        // 执行部署
        .deploy();
}
```

## 查询流程定义

其实也很简单，通过链式掉用来组成条件设置排序以及筛选操作。

```java
public IPage<ActivitiDeploymentDTO> findActivitiList(
        ActivitiDeploymentDTO activitiDeploymentDTO, IPage<ActivitiDeploymentDTO> page) {
    // 获取查询流程定义对对象
    DeploymentQuery deploymentQuery =
            this.repositoryService.createDeploymentQuery().orderByDeploymenTime();
    // 排序
    if (!CollectionUtils.isEmpty(page.orders())) {
        if (page.orders().get(0).isAsc()) {
            deploymentQuery.asc();
        } else {
            deploymentQuery.desc();
        }
    }
    // 动态查询
    if (StringUtils.isNotBlank(activitiDeploymentDTO.getCategory())) {
        deploymentQuery.deploymentCategoryLike(activitiDeploymentDTO.getCategory());
    }
    if (StringUtils.isNotBlank(activitiDeploymentDTO.getName())) {
        deploymentQuery.deploymentNameLike(activitiDeploymentDTO.getName());
    }
    if (StringUtils.isNotBlank(activitiDeploymentDTO.getKey())) {
        deploymentQuery.deploymentKeyLike(activitiDeploymentDTO.getKey());
    }
    long start = (page.getCurrent() - 1) * page.getSize();
    long end = start + page.getSize();
    List<ActivitiDeploymentDTO> result =
            deploymentQuery.listPage((int) start, (int) end).stream()
                    .map(ActivitiDeploymentDTO::new)
                    .collect(Collectors.toList());
    page.setRecords(result);
    page.setTotal(deploymentQuery.count());
    return page;
}

public ActivitiDeploymentDTO getActivitiDeploymentById(String id) {
    Deployment deployment =
            this.repositoryService.createDeploymentQuery().deploymentId(id).singleResult();
    return new ActivitiDeploymentDTO(deployment);
}

/** 第一参数为流程定义id 第二参数为是否联级删除流程定义 如果第二参数为true的话所有有关这个流程定义的数据都会被删除 */
public void deleteActiviti(String deploymentId) {
    // 输入流程定义删除流程, 若该流程有正常运行的流程或者记录，会删除失败
    this.repositoryService.deleteDeployment(deploymentId, true);
}
```

## 查询一次部署对应的流程定义文件和对应的输入流（bpmn，png）

```java
@Test
public void test() throws IOException {
    //使用默认配置文件创建流程引擎
    ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
    String deploymentId = "901";
    List<String> list = processEngine.getRepositoryService().getDeploymentResourceNames(deploymentId);
    for (String name : list) {
        //将文件保存到本地磁盘
        InputStream inputStream = processEngine.getRepositoryService().getResourceAsStream(deploymentId, name);
        org.apache.commons.io.FileUtils.copyInputStreamToFile(inputStream, new File("d:\\" + name));
        inputStream.close();

        InputStream PngInputStream = processEngine.getRepositoryService().getProcessDiagram(processDefinitionId);
        FileUtils.copyInputStreamToFile(PngInputStream, new File("d:\\my.png"));
    }
}
```

## 启动流程实例

流程实例是根据一个流程定义具体的一次执行过程就是一个流程实例,一个流程定义对应多个流程实例(一对多关系)。

```java
@Test
public void test() {
    //使用默认配置文件创建流程引擎
    ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();

    // 通过id启动
    String processDefinitionId = "myProcess_1:7:1004";//流程定义id可在act_re_procdef表中查询到
    ProcessInstance processInstance1 = processEngine.getRuntimeService().startProcessInstanceById(processDefinitionId);
    System.out.println(processInstance.getId());

    // 通过key启动
    String processDefinitionKey = "myProcess_1";
    ProcessInstance processInstance2 = processEngine.getRuntimeService().startProcessInstanceByKey(processDefinitionKey);
    System.out.println(processInstance.getId());
}
```

## 查询流程实例列表

```java
// act_ru_execution表
@Test
public void test() {
    //使用默认配置文件创建流程引擎
    ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
    //流程实例查询对象，查询act_ru_execution表
    ProcessInstanceQuery query = processEngine.getRuntimeService().createProcessInstanceQuery();
    query.processDefinitionKey("myProcess_1");
    query.orderByProcessDefinitionId().desc();
    query.listPage(0, 3);
    List<ProcessInstance> list = query.list();
    for (ProcessInstance pi : list) {
        System.out.println(pi.getId() + "--" + pi.getActivityId());
    }
}
```

## 结束流程实例

```java
// 操作的表：act_re_excution,act_ru_task
@Test
public void test() {
    //使用默认配置文件创建流程引擎
    ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
    String processInstanceId = "1601";
    processEngine.getRuntimeService().deleteProcessInstance(processInstanceId, "不想要了");
}
```

## 查询个人任务列表

```java
@Test
public void test() {
    //使用默认配置文件创建流程引擎
    ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
    //创建任务查询
    TaskQuery taskQuery = processEngine.getTaskService().createTaskQuery();
    //添加查询条件 办理人为王五
    String assignee = "王五";
    taskQuery.taskAssignee(assignee);
    taskQuery.orderByTaskCreateTime().desc();
    List<Task> list = taskQuery.list();//查询所有
    for (Task task : list) {
        System.out.println(task.getId() + "——" + task.getName());
    }
}
```

## 办理任务

```java
@Test
public void test() {
    //使用默认配置文件创建流程引擎
    ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
    String taskId = "602";//任务id可在act_ru_task表中查询到
    processEngine.getTaskService().complete(taskId);//传入任务id办理业务
    System.out.println("办理成功");
}
```

## 直接将流程向下执行一步

```java
@Test
public void test() {
    //使用默认配置文件创建流程引擎
    ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
    String executionId = "1401"; //流程实例id
    processEngine.getRuntimeService().signal(executionId);
}
```

## 查询最新版本的流程定义列表

```java
@Test
public void test() {
    //使用默认配置文件创建流程引擎
    ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
    ProcessDefinitionQuery query = processEngine.getRepositoryService().createProcessDefinitionQuery();
    query.orderByProcessDefinitionVersion().asc();
    List<ProcessDefinition> list = query.list();
    Map<String, ProcessDefinition> map = new HashMap<>();
    for (ProcessDefinition pd : list) {
        map.put(pd.getKey(),pd);
    }
    System.out.println(map);
}
```

## 流程的修改

添加新的流程版本，如果已经在执行的流程，按照原来的流程继续执行。新的流程按照最新版本进行执行。

## 历史数据查询

1. 查询历史流程实例列表

    ```java
    // act_hi_procinst
    @Test
    public void test() {
        //使用默认配置文件创建流程引擎
        ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
        HistoricProcessInstanceQuery query = processEngine.getHistoryService().createHistoricProcessInstanceQuery();
        List<HistoricProcessInstance> list = query.list();
        for (HistoricProcessInstance hi : list) {
            System.out.println(hi.getId());
        }
    }
    ```

2. 查询历史活动数据

    ```java
    // act_hi_actinst
    @Test
    public void test() {
        //使用默认配置文件创建流程引擎
        ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
        HistoricActivityInstanceQuery query = processEngine.getHistoryService().createHistoricActivityInstanceQuery();
        //按照流程实例排序
        query.orderByProcessInstanceId().desc();
        query.orderByHistoricActivityInstanceEndTime().asc();
        List<HistoricActivityInstance> list = query.list();
        for (HistoricActivityInstance hi : list) {
            System.out.println(hi.getActivityId() + "——" + hi.getActivityName() + "——" + hi.getActivityType());
        }
    }
    ```

3. 查询历史任务数据

    ```java
    // act_hi_taskinst
    @Test
    public void test() {
        //使用默认配置文件创建流程引擎
        ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
        HistoricTaskInstanceQuery query = processEngine.getHistoryService().createHistoricTaskInstanceQuery();
        query.orderByProcessInstanceId().asc();
        query.orderByHistoricTaskInstanceEndTime().asc();
        List<HistoricTaskInstance> list = query.list();
        for (HistoricTaskInstance hi:list){
            System.out.println(hi.getAssignee()+"——"+hi.getName()+"——"+hi.getStartTime());
        }
    }
    ```

> 参考链接：[Activiti工作流基础学习笔记](https://juejin.im/post/5bfd65835188252bf829c32e)