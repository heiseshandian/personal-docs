### 背景

bilibili 上有不少英文教学视频没有英文字幕，这对于我这种听力渣渣来说看起来太有难度了，所以就想着能不能先把 bilibili 上的视频下载下来，然后通过语音识别技术为视频添加英文字幕。经过一番搜索发现是可行的。先通过本工具下载视频，然后通过 [auto-add-subtitle](https://www.npmjs.com/package/auto-add-subtitle) 为视频添加字幕。

[english](./README.md) | [简体中文](./README.zh-cn.md)

### 介绍

本工具通过 [贝贝 bilibili](https://xbeibeix.com/api/bilibili/) 网站解析视频地址，然后通过 axios 下载文件。（仅供学习，请勿滥用）

### 安装与使用

- 全局安装本工具

```sh
npm i -g bilibili-dl
```

- 下载视频

```sh
bilibili-dl [{-s 是否下载整个系列，默认是false}] {url}
```
