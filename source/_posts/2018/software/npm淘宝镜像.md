---
title: npm淘宝镜像
date: 2018-03-12 00:15:12
tags: web
categories: 软件技术
---

一次性复制 4 行，粘贴到命令行会自动执行 3 行，回车执行第 4 行，设置成功.

npm config set sass_binary_site https://npmmirror.com/mirrors/node-sass/  ;  
npm config set electron_mirror https://npmmirror.com/mirrors/electron/  ;  
npm config set registry https://registry.npmmirror.com  ;  
npm config set phantomjs_cdnurl https://npmmirror.com/mirrors/phantomjs/  

yarn config set sass_binary_site https://npmmirror.com/mirrors/node-sass/  ;  
yarn config set electron_mirror https://npmmirror.com/mirrors/electron/  ;  
yarn config set registry https://registry.npmmirror.com  ;  
yarn config set phantomjs_cdnurl https://npmmirror.com/mirrors/phantomjs/  

## 设置代理

npm config set proxy http://127.0.0.1:1080

// 下载完成后删除代理
npm config delete proxy
