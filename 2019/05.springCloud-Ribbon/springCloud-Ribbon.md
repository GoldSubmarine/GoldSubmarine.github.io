# springCloud-Ribbon

## 负载均衡

负载均衡有客户端发现和服务端发现两种，eureka是客户端发现，服务端负载均衡有：Nginx，Zookeeper，Kubernetes。

Ribbon是客户端负载均衡器，客户端从eureka拉取已注册的可用服务信息，根据负载均衡策略命中一台，发送请求

RestTemplate，Feign，Zuul都使用了Ribbon做负载均衡

`loadBalancerClient` 和 `@LoadBalanced` 其实就是使用了Ribbon的组件

- 服务发现（ServerList）：根据服务的名字找出所有可用的该服务信息
- 服务监听（ServerListFilter）：检测失效的服务，从而剔除
- 服务选择规则（IRule）：从多个服务中选择一个服务

过程是：先通过ServerList获取到信息，再通过ServerListFilter剔除掉失效的服务，最后通过IRule选择一个有效的服务