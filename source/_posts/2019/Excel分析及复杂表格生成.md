---
title: Excel分析及复杂表格生成
date: 2019-12-18 17:37:00
tags: office
---

Excel 导出文件，总体来说两个方案：

1. 通过 api 来操作 excel，写代码来创建 excel
2. 通过模板，填充数据的方式来创建 excel

方案 2 更好一点，在面对复杂 excel 的时候，写模板语言比直接写代码更简单。

## 方案 1

### docx4j

java 处理 word 和 excel 的 sdk，类似 poi

不支持模板处理，不能处理 SpreadsheetML

### exceljs

浏览器运行 excel api，好处是能保留样式。

不支持模板处理，不能处理 SpreadsheetML

## 方案 2

通过填充模板来生成 excel，也有两种方式：

1. 在 excel 里写模板语言
2. 在 excel 导出的 xml 格式文件里写模板语言

第一种方式的好处是格式保留的比较好，生成后就是 excel 格式，缺点是，直接在 excel 里写模板不是很好理解。

第二种方式的好处是在 xml 里写模板比较容易理解，但是格式保存成了 xml，excel 打开的时候有 warning，且保存成 xml 有些内容会丢失。

### SpreadsheetML 2003/2004

excel 另存为
暂时先用 SpreadsheetML 2003/2004 类型的 xml 类型，后续想办法无损的把 xml 转成 xls。

参考：[What's lost when I save my workbook as an XML Spreadsheet 2003 file?](https://support.office.com/en-us/article/what-s-lost-when-i-save-my-workbook-as-an-xml-spreadsheet-2003-file-8e7e858b-eda6-47eb-a1e5-b82a7bdffc3f)

在不考虑有些内容 xml 无法保存的情况下，可以通过某些第三方 api 把 xml 再转成 xls

### sail-sail/ejsExcel

属于第一种方式。不过是 nodejs 实现，不支持浏览器运行。且模板语言比较难懂。

### xelem

比较老的项目了，可以解析 SpreadsheetML，但是保存时，只能保存成 xml，无法保存成 xls 等格式

### JODConverter

Java 的 OpenDocument 文件转换器,支持多种 excel 格式的转换。但是不支持 SpreadsheetML

### sheetjs

可以浏览器运行，可以读取 SpreadsheetML，但是保存成 xls 的时候，样式丢失。

商业版支持样式，价格预计`$750`

### protobi/js-xlsx

对 sheetjs 的 fork，支持样式了，但是比较老了，还有些 bug。

有些人对它继续封装了。比如：[layui-excel](https://blog.wj2015.com/2019/05/01/js-xlsx%E6%94%AF%E6%8C%81%E6%A0%B7%E5%BC%8F/)，但是对于 SpreadsheetML 的样式读取有问题，样式仍保留不了。

### easyxls

商业版，支持 SpreadsheetML 转成 excel。

缺点：商业版，一个机器一个 license

### OpenDocument

当一个 excel 转成 OpenDocument 格式后，解压 OpenDocument 文件，里面的 `content.xml` 格式跟 SpreadsheetML 是类似的。

可以把 `content.xml` 做成模板，生成完整的`content.xml`之后，保存成 ods 文件，再通过 JODConverter 转成 excel 文件

这个方案好处是：`content.xml` 比较容易懂，合并单元格等方式采用相对位置，而不是绝对位置，比如（A1、B2）的方式，模板实现比较简单。

缺点是：OpenDocument 会有格式损失（参考：[Differences between the OpenDocument Spreadsheet (.ods) format and the Excel for Windows (.xlsx) format](https://support.office.com/en-us/article/differences-between-the-opendocument-spreadsheet-ods-format-and-the-excel-for-windows-xlsx-format-3db958c8-e0ac-49a5-9965-2c2f8afbd960)），部分格式不支持，且需要再转换为 excel 文件

### xlsx 模板

直接用 xlsx 文件作为模板。

首先将一个后缀为`xlsx`的 excel 文件拓展名改为.zip 然后对其解压，得到下面的文件目录：

- [Content_Types].xml 文件：列出了该工作簿下包含的各个部件信息。

  1. Type： 包含枚举 VSIX 包中的文件类型的子元素
  2. xmlns：(必选)使用此 [Content_Types].xml 文件的架构的位置
  3. Default：ZIP 压缩包每种文件类型的引用， Extension 值为 VSIX 包中的文件扩展名
  4. Override：不同类型文档内容的 XML 部件的引用， PartName 值为链接外部文件的位置
  5. ContentType：说明与文件扩展名相关联的内容类型

- \_rels：内含一个名为 .rels 的文件，包含关于该工作簿程序包的各文件关系。

  1. Id：唯一值，可以是任意字符串
  2. Type：包含各文件的关系类型
  3. Target：包含各文件的位置

- docProps：内含一个 app.xml 与一个 core.xml 分别定义工作簿的各元数据。

  1. app.xml 文件下定义了该文档的一些基本属性，包括但不限于“加密情况”、“工作簿名称”、“公司名称”、“应用程序版本”等
  2. core.xml 文件中定义的信息与 app.xml 类似，也是一些基础属性信息，更直观地说的话，就是通过右键“属性/详细信息”查看到信息

- xl：内含多个文件夹及文件，主要为描述该工作簿下各工作表的文件。

  1. sharedStrings.xml：记录表格中输入的各数据信息
  2. styles.xml：Excel 工作表中设置的各样式信息
  3. workbook.xml：定义工作簿中的各个部件信息
  4. printerSettings 文件夹下有一个 printerSettings1.bin 文件，主要是描述应用程序打印时如何打印文档的信息。
  5. theme 文件夹下包含工作簿主题的数据的 XML 文件。比如这里的 theme1.xml 。代码不贴了，没多大意义。
  6. worksheets 文件夹下主要是各个工作表的一些信息，sheet1.xml、sheet2.xml、sheet3.xml 里都是一些描述表的代码，这里就不细说了。同样该文件夹下又有一个 \_rels 文件夹，其中有个 sheet1.xml.rels 文件，用于说明该工作表下各文件的关系。

参考：[关于 Excel 文件结构与读写](https://testerhome.com/topics/6050)

#### row 结构

下面分析 sheet1.xml 文件的结构

在 sheetData 标签里，是一个`row`，结构如下：

```xml
<row r="1" spans="1:13" ht="45" customHeight="1">
 <c r="A1" s="26" t="s">
    <v>2</v>
 </c>
 <c r="B1" s="26" />
</row>
```

其中：

- `row` 的 `r` 表示 Row Index 第几行；`spans` 表示哪些列是非空的，是可选项；ht 表示`Row height`； `customHeight`表示`Row height`是否被手动设置过，1 表示是
- `c`表示`cell`（单元格）；`r` 表示 `Reference`, 单元格的位置；`s` 是 `Style Index`，样式估计存储在`styles.xml`里；`t`表示`Cell Data Type`，表示单元格的数据类型，是一个枚举。可选值有：

  - b (Boolean)
  - e (Error)
  - inlineStr (Inline String)。表示字符不在 `shared string table`里，这个类型的单元格，填充内容时，可以不用`v`标签
  - n (Number)
  - s (Shared String) 表示内容在`shared string table`，估计存储在`sharedStrings.xml`里
  - str (String) 表示内容是可以是一个公式（公式也可以是普通的字符串）

某些标签的属性不清楚可以参考这个：[SpreadsheetML (for .xlsx)](http://webapp.docx4java.org/OnlineDemo/ecma376/SpreadsheetML/index.html)

分析完 row 的结构，我们可以写它的模板来填充内容。样式我们保持不变，不用关心。

需要注意的是：每个单元格的`Cell Data Type`都可以指定，因此，模板里原有的内容，可以继续用`Shared String`（excel 保存默认就是`Shared String`），我们自己填充数据的时候，可以选择`str`或者`inlineStr`。

#### 合并单元格

合并单元格定义如下：

```xml
<mergeCells count="2">
  <mergeCell ref="C4:C5" />
  <mergeCell ref="D4:D5" />
</mergeCells>
```

其中：`mergeCells`的`count`表示`mergeCell`子标签的数量。`mergeCell`标签里的`ref`表示的是 `cell Reference Range`

> SpreadsheetML 里 reference 有两种表示方式，一种是`A1`模式，字母表示列，数字表示行。另一种模式是`R1C1`模式，行和列都通过数字来表示。另外两种模式都可以指定相对位置，`A1`模式的相对位置不好懂，`R1C1`模式的相对位置，只要用`[]`把数字括起来就可以了。比如`RC[-3]:RC[-1]`，当 R 不指定数字时，表示整列。参考：[Reference Mode](http://webapp.docx4java.org/OnlineDemo/ecma376/SpreadsheetML/ST_RefMode.html)、 [Cell References](http://webapp.docx4java.org/OnlineDemo/ecma376/SpreadsheetML/Cell%20References.html)

合并单元格，需要我们手动指定哪些 cell 需要合并。

#### 自动换行

```xml
<!-- styles.xml -->
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1">
  <alignment wrapText="1" />
</xf>
```

设置 `<alignment wrapText="1" />` 样式以后，单元格中的文字能自动换行并能撑开高度；但是如果当前单元格为合并单元格，则只能换行，目前没有找到可以撑开高度的方法

#### 公式计算

当单元格有公式的时候，定义如下

```xml
<c r="E16" s="8">
    <f>SUM(E4:E15)</f>
    <v>6</v>
 </c>
```

这里除了有公式之外，还定义了一个`v`标签,这个 v 标签不是必须的，如果没有 excel 会重新计算的，因此我们可以忽略。

另外，还需要注意 `calcChain.xml` 文件，这个文件也跟公式计算有关。

单元格的计算可以根据不同的优化和依赖按照不同的顺序来计算。这个文件里记录了哪些单元格最后被计算了。

注意：这个文件不记录公式之间的依赖，只是记录单元格被计算的顺序。

这个文件不是必须的，spreadsheet 程序可以用，也可以不用这个文件，即使有这个文件，程序也可能不按照这个顺序来。因此，为了简单，我们可以不填充这个文件，直接从 excel 包里删除。参考： [Calculation Chain](http://webapp.docx4java.org/OnlineDemo/ecma376/SpreadsheetML/Calculation%20Chain.html)

#### 打印设置

有时候 excel 里有打印设置，对于我们导出来说是没有用的，直接删掉。 参考：[Remove Existing PrinterSettings of Worksheets in Excel file](https://docs.aspose.com/display/cellsjava/Remove+Existing+PrinterSettings+of+Worksheets+in+Excel+file)

总结：`xlsx 模板` 会比 `OpenDocument`模板 复杂一点，需要制定 单元格的绝对位置，以及`merge cell`需要单独指定。好处是：直接是直接编辑 xlsx，样式什么的都保留的很好，不会像 OpenDocument 功能受限。

## 最终方案

使用 `xlsx 模板` 的方案来做。

首先用 excel 制作一个有样式的模板，然后重命名为 zip 格式，解压获取到`sheet1.xml`，我们采用`ejs`模板语法将`sheet1.xml`书写好，然后重新塞回 zip 文件中，前端通过 ajax 获取这个 zip 包的二进制流，通过`jszip`这个库解压 zip，于是前端 js 就获取到了`sheet1.xml`这个文件，结合后台返回的数据用`ejs`渲染好模板，将渲染好的模板重新塞回 zip 中，最后前端实现这个 zip 的下载。

参考项目：[export-excel-demo](https://github.com/GoldSubmarine/export-excel-demo)

另外，填充逻辑可能比较复杂，我们可通过合理的抽象，将使用的复杂度降低。
