---
title: Mysql索引
date: 2020-01-14 01:16:00
tags: mysql
categories: 软件技术
---

## 默认排序

```sql
create table user(
    id int primary key,
    age int,
    height int,
    weight int,
    name varchar(32)
)engine = innoDb;

INSERT INTO user(id,age,height,weight,name)VALUES(2,1,2,7,'小吉');
INSERT INTO user(id,age,height,weight,name)VALUES(5,2,1,8,'小尼');
INSERT INTO user(id,age,height,weight,name)VALUES(1,4,3,1,'小泰');
INSERT INTO user(id,age,height,weight,name)VALUES(4,1,5,2,'小美');
INSERT INTO user(id,age,height,weight,name)VALUES(3,5,6,7,'小蔡');

select * from user;
```

先创建一张 user 表，然后乱序的插入一些数据，可以发现最后 select 出的数据却是按照 id 排序的，为什么会出现 MySQL 会默默帮我们排序呢？它是在什么时候进行排序的？

## 页的引入

在操作系统的概念中，当我们往磁盘中取数据，假设要取出的数据的大小是 1KB，但是操作系统并不会只取出这 1kb 的数据，而是会取出 4KB 的数据，因为操作系统的一个页表项的大小是 4KB。这就涉及到一个程序局部性的概念，大概就是**一个程序在访问了一条数据之后，在之后会有极大的可能再次访问这条数据和访问这条数据的相邻数据**，所以索性直接加载 4KB 的数据到内存中，下次要访问这一页的数据时，直接从内存中找，可以减少磁盘 IO 次数。

在 MySQL 的 InnoDb 引擎中，页的大小是 16KB，是操作系统的 4 倍，而 int 类型的数据是 4 个字节，其它类型的数据的字节数通常也在 4000 字节以内，所以一页是可以存放很多很多条数据的，而 MySQL 的数据正是以页为基本单位组合而成的。和操作系统一样，一次 IO 加载一整页数据

![mysql-index-1](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/mysql-index-1.png)

上图就是我们目前为止所理解的页的结构，他包含我们的多条数据，另外，MySQL 的数据以页组成，那么它有指向下一页的指针和指向上一页的指针。

## 页目录（跳表）

上文中我们提了一个问题，**为什么数据库在插入数据时要对其进行排序呢？**

这就要涉及到一个数据库优化查询效率的问题了，可以看出页中的数据是一个链表。假设，我们这一页中有一百万条数据，我们要查的数据正好在最后一个，那么从前往后找，需要查找一百万次才能找到这条数据，即使是在内存中查找，这个效率也是不高的。

![mysql-index-2](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/mysql-index-2.png)

如上图，mysql 为了加快查询速度做了一些优化：首先对这 5 条数据按照 id 排序，然后创建跳表，假设选取 id 为 1、3 作为特征点，当要查询 id 为 4 的数据时，先和 1、3 作比较，4 大于 3，于是可以直接从 id 为 3 的数据开始先后遍历，可以看到通过特征点大大加快了查询速度。ps：跳表可以建多层级。

所以数据库在插入时会进行排序，只有有序的链表才能通过创建跳表来加快查询速度。

## 页的扩展

在开头说页的概念的时候，我们有说过，MySQL中每一页的大小只有16KB，不会随着数据的插入而自动扩容，所以这16KB不可能存下我们所有的数据，那么必定会有多个页来存储数据，那么在多页的情况下，MySQL中又是怎么组织这些页的呢？

![mysql-index-3](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/mysql-index-3.png)

可以看到，在数据不断变多的情况下，MySQL会再去开辟新的页来存放新的数据，而每个页都有指向下一页的指针和指向上一页的指针，将所有页组织起来，第一页中存放id为1-5的数据，第二页存放id为6-10的数据，第三页存放id为11-15的数据，需要注意的是在开辟新页的时候，我们插入的数据不一定是放在新开辟的页上，而是要进行所有页的数据比较，来决定这条插入的数据放在哪一页上，而完成数据插入之后，最终的多页结构就会像上图中画的那样。

## 优化多页模式查询效率

多页其本质也是一个链表结构，只要是链表结构，查询效率一定不会高。

既然我们可以用页目录来优化页内的数据区，那么我们也可以采取类似的方式来优化这种多页的情况。

![mysql-index-4](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/mysql-index-4.png)

如上图，我们将每页中最小的元素作为特征点提取出来，将待查询id和这些特征点比较，就能确定当前要查询的数据在哪一页。

**回归正题，相信有对MySQL比较了解的同学已经发现了，我们画的最终的这幅图，就是MySQL中的一种索引结构——B+树**。将上图中的页目录去掉，简化后如下图

![mysql-index-5](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/mysql-index-5.png)

这就是我们兜兜转转由简到繁形成的一颗B+树。和常规B+树有些许不同，这是一棵MySQL意义上的B+树，MySQL的一种索引结构，其中的每个节点就可以理解为是一个页，而叶子节点也就是数据页，除了叶子节点以外的节点就是目录页。非叶子节点只存放了索引，而只有叶子节点中存放了真实的数据，这也是符合B+树的特点的。

## B+树的优势

- 由于叶子节点上存放了所有的数据，并且有指针相连，每个叶子节点在逻辑上是相连的，所以对于范围查找比较友好。
- B+树的所有数据都在叶子节点上，所以B+树的查询效率稳定，一般都是查询3次。
- B+树有利于数据库的扫描。
- B+树有利于磁盘的IO，因为他的层高基本不会因为数据扩大而增高（三层树结构大概可以存放两千万数据量。

## 聚簇索引和非聚簇索引

基于B+树聊聊MySQL的其它知识点

所谓聚簇索引，就是将索引和数据放到一起，找到索引也就找到了数据，我们刚才看到的B+树索引就是一种聚簇索引，而非聚簇索引就是将数据和索引分开，查找时需要先查找到索引，然后通过索引回表找到相应的数据。InnoDB有且只有一个聚簇索引，而MyISAM中都是非聚簇索引。

![mysql-index-6](https://gcore.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/mysql-index-6.png)

上图为非聚簇索引，通过索引只能先找到对应的id，拿到该id再通过唯一的聚簇索引找到该数据，也就是会通过主键索引来回表查询数据。

