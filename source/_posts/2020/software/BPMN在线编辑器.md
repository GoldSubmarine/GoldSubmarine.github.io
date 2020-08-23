---
title: BPMN 在线编辑器
date: 2020-06-03 10:13:00
tags: Activiti
categories: 软件技术
---

在 Activiti 以前的老版本中有提供一个嵌入后端的流程编辑器的，但是现在的新版本把流程编辑器从中剥离了出来，成为了一个单独的项目，是用 Angular 写的，因为目前我们的项目是基于 vue 的，所以这里使用 Vue + Bpmn.js 搭建了一个流程编辑器。

这个篇章不会涉及到流程任务的办理，所以只是在前端中画出流程图，然后导出一个 Bpmn 文件。

## 安装

首先准备一个 vue 工程，然后安装 bpmn

```bash
yarn add bpmn-js
```

## 创建 Bpmn 建模器

首先 Bpmn-js 的建模器其实是通过 Canvas 来实现的，我们在 template 中创建一个 div 供给 Bpmn 创建建模器。

```html
<template>
  <div class="container">
    <!-- 创建一个canvas画布 npmn-js是通过canvas实现绘图的，并设置ref让vue获取到element -->
    <div class="bpmn-canvas" ref="canvas"></div>
  </div>
</template>
```

写好了 Html 部分接下来我们来实现 js 部分。要创建建模器我们要使用到 BpmnModeler 这个对象，主要通过创建这个对象创建建模器。

```js
// 导入样式
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
// 在这里引入一下Bpmn建模器对象
import BpmnModeler from "bpmn-js/lib/Modeler";

export default {
  data() {
    return {
      bpmnModeler: null,
      canvas: null,
      // 这部分具体的代码我放到了下面
      initTemplate: `略`,
    };
  },
  methods: {
    init() {
      // 获取画布 element
      this.canvas = this.$refs.canvas;
      // 创建Bpmn对象
      this.bpmnModeler = new BpmnModeler({
        // 设置bpmn的绘图容器为上门获取的画布 element
        container: this.canvas,
      });

      // 初始化建模器内容
      this.initDiagram(this.initTemplate);
    },
    initDiagram(bpmn) {
      // 将xml导入Bpmn-js建模器
      this.bpmnModeler.importXML(bpmn, (err) => {
        if (err) {
          this.$Message.error("打开模型出错,请确认该模型符合Bpmn2.0规范");
        }
      });
    },
  },
  // 生命周期钩子，在组件加载完成后调用init函数进行创建初始化Bpmn-js建模器
  mounted() {
    this.init();
  },
};
```

这部份 xml 就是 Bpmn 流程图的模板代码了，这个模板包含了一个开始节点在里面，根据需求可以按照自己需要的创建或者修改模板，当然我不推荐手动修改 xml 代码。创建模板的方式我推荐就是在 Bpmn-js 建模器中来创建一个自己想要的模型，然后导出 xml 或者 bpmn 文件再把文件里面的代码复制出来使用就好。

在我具体的实际应用以及跟 Activiti7 后端的结合中发现 xml 模板需要注意的一个点是 xml 首部，就是 definitions 标签部分这里引入了很多命名空间，如果你的流程图需要部署到 Activiti 中的话那你要注意必须要引入 Activiti 的命名空间 .
   以下模板就是符合 Activiti 使用的 Xml 模板了。若没有引入或者不符合 Activiti 的规范命名空间的话那将会导致模型部署失败。如果模型最终要部署到 Activiti 的话建议基于以下模板修改使用。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions
  xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:activiti="http://activiti.org/bpmn"
  id="m1577635100724"
  name=""
  targetNamespace="http://www.activiti.org/testm1577635100724"
>
  <process id="process" processType="None" isClosed="false" isExecutable="true">
    <extensionElements>
      <camunda:properties>
        <camunda:property name="a" value="1" />
      </camunda:properties>
    </extensionElements>
    <startEvent id="_2" name="start" />
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_leave">
    <bpmndi:BPMNPlane id="BPMNPlane_leave" bpmnElement="leave">
      <bpmndi:BPMNShape id="BPMNShape__2" bpmnElement="_2">
        <omgdc:Bounds x="144" y="368" width="32" height="32" />
        <bpmndi:BPMNLabel>
          <omgdc:Bounds x="149" y="400" width="23" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>
```

完成以上的步骤我们完成了建模器的创建，让我们来看看效果。

![bpmn-1](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/bpmn-1.png)

## 添加 bpmn-js-properties-panel 面板插件

Bpmn-js 原本是不支持 Activities 那些自定义值的设置的，需要额外引入插件进行整合。首先先要安装两个插件，分别是 bpmn-js-properties-panel 和 camunda-bpmn-moddle

bpmn-js-properties-panel 是给建模器提供了属性编辑器，然后 camunda-bpmn-moddle 就是拓展了属性编辑器可以编辑的内容，像 Activitie 的 assignee 这些属性就是要依靠 camunda-bpmn-moddle 来提供编辑的。

```bash
// yarn 安装
yarn add bpmn-js-properties-panel
yarn add camunda-bpmn-moddle

// npm 安装
npm install bpmn-js-properties-panel
npm install camunda-bpmn-moddle
```

在 App.vue 里要创建一个 div 给工具栏一个显示的位置。我直接就放 canvas 的下面了

```html
<!-- 工具栏显示的地方 -->
<div class="bpmn-js-properties-panel" id="js-properties-panel"></div>
```

然后要导入一下工具栏以及配置一下对工具栏的支持

```js
// 左边工具栏以及编辑节点的样式
import "bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css";
// 工具栏相关
import propertiesProviderModule from "bpmn-js-properties-panel/lib/provider/camunda";
import propertiesPanelModule from "bpmn-js-properties-panel";
import camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda";
```

修改后的 init 函数

```js
init() {
  // 获取画布 element
  this.canvas = this.$refs.canvas;

  // 创建Bpmn对象
  this.bpmnModeler = new BpmnModeler({
    // 设置bpmn的绘图容器为上门获取的画布 element
    container: this.canvas,

    // 加入工具栏支持
    propertiesPanel: {
      parent: "#js-properties-panel"
    },
    additionalModules: [propertiesProviderModule, propertiesPanelModule],
    moddleExtensions: {
      camunda: camundaModdleDescriptor
    }
  });

  this.createNewDiagram(this.bpmnTemplate);
}
```

效果如下

![bpmn-2](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/bpmn-2.jpg)

## 实现新建、导入，导出操作

实现这些功能我们先把按键和样式写上,以及给它们加上对应的点击事件, 我这里使用了 Element 组件

```html
<div class="action">
  <!-- 关于打开文件的这个我使用了Element的文件上传组件，在上传前钩子获取到文件然后读取文件内容 -->
  <el-upload class="upload-demo" :before-upload="openBpmn">
    <el-button icon="el-icon-folder-opened"></el-button>
  </el-upload>
  <el-button
    class="new"
    icon="el-icon-circle-plus"
    @click="newDiagram"
  ></el-button>
  <el-button icon="el-icon-download" @click="downloadBpmn"></el-button>
  <el-button icon="el-icon-picture" @click="downloadSvg"></el-button>
</div>
```

大概的效果是这样子

![bpmn-3](https://cdn.jsdelivr.net/gh/goldsubmarine/cdn@master/blog/bpmn-3.jpg)

具体看下述完整代码

## 汉化

对于这个汉化文件我是在码云上找到了一位大佬翻译好的文件，[链接](https://gitee.com/polarloves/bpmn-js/tree/master/app/customTranslate) 里面有两个文件 translationsGerman.js 和 customTranslate.js，其中 translationsGerman.js 这个文件是翻译好的文本配置，customTranslate.js 的话就是汉化器了，它会按照获取到编辑器原本的配置对比 translationsGerman.js 中的配置然后进行替换操作，将相关英文替换为中文文本。

具体看下述完整代码

## 完整代码

```vue
<!-- 参考：https://github.com/winily/bpmn-demo -->
<template>
  <el-dialog
    title="流程设计"
    :visible.sync="dialogVisible"
    fullscreen
    :close-on-click-modal="false"
    @closed="$emit('close')"
  >
    <div style="position: relative;">
      <!-- 创建一个canvas画布 npmn-js是通过canvas实现绘图的，并设置ref让vue获取到element -->
      <div class="bpmn-container">
        <div ref="canvas" class="bpmn-canvas" />
        <!-- 工具栏显示的地方 -->
        <div id="js-properties-panel" class="bpmn-js-properties-panel" />
      </div>

      <!-- 把操作按钮写在这里面 -->
      <div class="action">
        <el-upload action class="upload-demo" :before-upload="openBpmn">
          <el-button icon="el-icon-folder-opened" />
        </el-upload>
        <el-button class="new" icon="el-icon-circle-plus" @click="newDiagram" />
        <el-button icon="el-icon-download" @click="downloadBpmn" />
        <el-button icon="el-icon-picture" @click="downloadSvg" />
        <a ref="downloadLink" hidden />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

import BpmnModeler from "bpmn-js/lib/Modeler";

// 左边工具栏以及编辑节点的样式
import "bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css";
// 工具栏相关
import propertiesProviderModule from "bpmn-js-properties-panel/lib/provider/camunda";
import propertiesPanelModule from "bpmn-js-properties-panel";
import camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda";
import camundaExtensionModule from "camunda-bpmn-moddle/lib";

// 汉化
import customTranslate from "./translate";

export default {
  data() {
    return {
      dialogVisible: true,
      bpmnModeler: null,
      canvas: null,
      bpmnTemplate: `
          <?xml version="1.0" encoding="UTF-8"?>
          <definitions
              xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
              xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC"
              xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
              xmlns:xsd="http://www.w3.org/2001/XMLSchema"
              xmlns:activiti="http://activiti.org/bpmn"
              id="m1577635100724"
              name=""
              targetNamespace="http://www.activiti.org/testm1577635100724"
            >
            <process id="process" processType="None" isClosed="false" isExecutable="true">
              <extensionElements>
                <camunda:properties>
                  <camunda:property name="a" value="1" />
                </camunda:properties>
              </extensionElements>
              <startEvent id="_2" name="start" />
            </process>
            <bpmndi:BPMNDiagram id="BPMNDiagram_leave">
              <bpmndi:BPMNPlane id="BPMNPlane_leave" bpmnElement="leave">
                <bpmndi:BPMNShape id="BPMNShape__2" bpmnElement="_2">
                  <omgdc:Bounds x="144" y="368" width="32" height="32" />
                  <bpmndi:BPMNLabel>
                    <omgdc:Bounds x="149" y="400" width="23" height="14" />
                  </bpmndi:BPMNLabel>
                </bpmndi:BPMNShape>
              </bpmndi:BPMNPlane>
            </bpmndi:BPMNDiagram>
          </definitions>
      `,
    };
  },
  mounted() {
    this.$nextTick().then(() => this.init());
  },
  methods: {
    newDiagram() {
      this.createNewDiagram(this.bpmnTemplate);
    },
    async downloadBpmn() {
      try {
        const { xml } = await this.bpmnModeler.saveXML({ format: true });
        // 获取文件名
        const name = `${this.getFilename(xml)}.bpmn`;
        // 将文件名以及数据交给下载方法
        this.download({ name: name, data: xml });
      } catch (err) {
        console.log("error rendering", err);
      }
    },
    async downloadSvg() {
      try {
        const { xml } = await this.bpmnModeler.saveXML({ format: true });
        // 获取文件名
        const name = `${this.getFilename(xml)}.svg`;

        // 从建模器画布中提取svg图形标签
        let context = "";
        const djsGroupAll = this.$refs.canvas.querySelectorAll(".djs-group");
        for (const item of djsGroupAll) {
          context += item.innerHTML;
        }
        // 获取svg的基本数据，长宽高
        const viewport = this.$refs.canvas.querySelector(".viewport").getBBox();

        // 将标签和数据拼接成一个完整正常的svg图形
        const svg = `
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              width="${viewport.width}"
              height="${viewport.height}"
              viewBox="${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}"
              version="1.1"
              >
              ${context}
            </svg>
          `;
        // 将文件名以及数据交给下载方法
        this.download({ name: name, data: svg });
      } catch (err) {
        console.log("error rendering", err);
      }
    },
    openBpmn(file) {
      const reader = new FileReader();
      // 读取File对象中的文本信息，编码格式为UTF-8
      reader.readAsText(file, "utf-8");
      reader.onload = () => {
        // 读取完毕后将文本信息导入到Bpmn建模器
        this.createNewDiagram(reader.result);
      };
      return false;
    },
    getFilename(xml) {
      const start = xml.indexOf("process");
      let filename = xml.substr(start, xml.indexOf(">"));
      filename = filename.substr(filename.indexOf("id") + 4);
      filename = filename.substr(0, filename.indexOf('"'));
      return filename;
    },
    download({ name = "diagram.bpmn", data }) {
      // 这里就获取到了之前设置的隐藏链接
      const downloadLink = this.$refs.downloadLink;
      // 把数据转换为URI，下载要用到的
      const encodedData = encodeURIComponent(data);

      if (data) {
        // 将数据给到链接
        downloadLink.href =
          "data:application/bpmn20-xml;charset=UTF-8," + encodedData;
        // 设置文件名
        downloadLink.download = name;
        // 触发点击事件开始下载
        downloadLink.click();
      }
    },
    async init() {
      // 获取画布 element
      this.canvas = this.$refs.canvas;

      // 将汉化包装成一个模块
      const customTranslateModule = {
        translate: ["value", customTranslate],
      };

      // 创建Bpmn对象
      this.bpmnModeler = new BpmnModeler({
        // 设置bpmn的绘图容器为上门获取的画布 element
        container: this.canvas,

        // 加入工具栏支持
        propertiesPanel: {
          parent: "#js-properties-panel",
        },
        additionalModules: [
          // 工具栏模块
          propertiesProviderModule,
          propertiesPanelModule,
          // camunda
          camundaExtensionModule,
          // 汉化模块
          customTranslateModule,
        ],
        moddleExtensions: {
          camunda: camundaModdleDescriptor,
        },
      });

      await this.createNewDiagram(this.bpmnTemplate);
    },
    async createNewDiagram(bpmn) {
      // 将字符串转换成图显示出来;
      try {
        await this.bpmnModeler.importXML(bpmn);
      } catch (err) {
        console.log(
          "打开模型出错,请确认该模型符合Bpmn2.0规范",
          err.message,
          err.warnings
        );
      }
    },
  },
};
</script>

<style>
.bpmn-container {
  width: 100%;
  height: calc(100vh - 114px);
  display: flex;
}

.bpmn-canvas {
  width: calc(100% - 300px);
  height: calc(100vh - 114px);
}

.bpmn-js-properties-panel {
  width: 320px;
  height: inherit;
  overflow-y: auto;
}

.action {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
}
.upload-demo {
  margin-right: 10px;
}
</style>
```

> 参考链接：[https://github.com/winily/bpmn-demo](https://github.com/winily/bpmn-demo)