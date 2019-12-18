---
title: Excel分析及复杂表格生成
date: 2019-12-18 17:37:00
tags: office
---

## Excel 文件结构

Excel 文件本质上是一个包含多个 xml 文件的压缩包。我们可以通过将 Excel 文件的扩展名更改为 .zip 或 .rar ，解压该文件来查看其结构。

### 文件夹

首先我将制作好的“Excel~文件结构初窥.xlsx”文件拓展名改为.zip 然后对其解压，得到下面的文件目录：

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
  6. worksheets 文件夹下主要是各个工作表的一些信息，sheet1.xml、sheet2.xml、sheet3.xml 里都是一些描述表的代码，这里就不细说了。同样该文件夹下又有一个 \_rels 文件夹，其中有个 sheet1.xml.rels 文件，用于说明该工作表下各文件的关系。代码如下：

## 复杂表格生成方案

Excel 导出文件，总体来说两个方案：

- 通过 api 来操作 excel，写代码来创建 excel
- 通过模板，填充数据的方式来创建 excel

方案 2 更好一点，在面对复杂 excel 的时候，写模板语言比直接写代码更简单。

1. docx4j: java 处理 word 和 excel 的 sdk，类似 poi，不支持模板处理，不能处理 SpreadsheetML
2. exceljs：浏览器或 nodejs 运行 excel api，好处是能保留样式。不支持模板处理，不能处理 SpreadsheetML
3. sail-sail/ejsExcel: 属于第一种方式。不过是 nodejs 实现，不支持浏览器运行。且模板语言比较难懂。
4. xelem: 比较老的项目了，可以解析 SpreadsheetML，但是保存时，只能保存成 xml，无法保存成 xls 等格式
5. JODConverter: Java 的 OpenDocument 文件转换器,支持多种 excel 格式的转换。但是不支持 SpreadsheetML
6. sheetjs: 可以浏览器运行，可以读取 SpreadsheetML，但是保存成 xls 的时候，样式丢失。商业版支持样式，价格预计\$750
7. protobi/js-xlsx: 对 sheetjs 的 fork，支持样式了，但是比较老了，还有些 bug。有些人对它继续封装了。比如：layui-excel，但是对于 SpreadsheetML 的样式读取有问题，样式仍保留不了。

## 最终方案

通过解压 `abc.xlsx`，分析 `/xl/worksheets/sheet1.xml`，大概能读懂 `<row>`代表一行，`<c>`代表一个单元格（cell），`<v>`代表值（value）

打开 excel 明明看到了一些汉字，但打开`sheet1.xml` 找到对应的位置，`<v>`标签中的却是数字，原因是 excel 维护了一个字符串池，位于`/xl/sharedStrings.xml`，这个数字就是字符串池中的索引值。

`<c>`标签上可以看到 3 个属性：[参见文档](https://docs.microsoft.com/en-us/dotnet/api/documentformat.openxml.spreadsheet.cellvalues?view=openxml-2.8.1)

- `r`：单元格坐标
- `s`：style 样式，和`/xl/styles.xml`对应
- `t`：数据类型的枚举，(b)代表布尔值,(e)代表 error，(inlineStr)内联文字，(n)数字，(s)共享字符，(str)字符串

分析完毕，我们想要使用模板渲染，而不是 api 去生成 excel，所以只要使用`freemarker`或`ejs`这样的模板语法生成`sheet1.xml`文件就行，但是默认文字是共享的，模板渲染很不方便，所以可以把属性`t`改为`str`，这样就可以直接在`<v>`标签中填写文字了。

最终方案：首先用 excel 制作一个有样式的模板，然后重命名为 zip 格式，解压获取到`sheet1.xml`，我们采用`ejs`模板语法将`sheet1.xml`书写好，然后重新塞回 zip 文件中，前端通过 ajax 获取这个 zip 包的二进制流，通过`zipjs`这个库解压 zip，于是浏览器就获取到了`sheet1.xml`这个文件，结合后台返回的数据用`ejs`渲染好模板，将渲染好的模板重新塞回 zip 中，最后前端实现这个 zip 的下载。

**注意事项：**

1. 如果 excel 中使用了数学公式，生成 excel 后会报错，原因是 `calcChain.xml` 文件会记录单元格的计算顺序，SpreadsheetML 规范中说该文件非必须，所以建议删除掉[相关连接](https://docs.microsoft.com/zh-cn/office/open-xml/working-with-the-calculation-chain)
2. 分析 `sheet1.xml`你可能会看到这样的代码

   ```xml
   <c r="E8" s="8">
       <f>SUM(E4:E7)</f>
       <v>20</v>
   </c>
   ```

   表示 E8 这个单元格是 E4:E7 的和，生成模板时要动态计算这个 20 非常麻烦，可以直接删除掉`<v>`标签，只需书写公式，excel 打开后会自动进行计算
