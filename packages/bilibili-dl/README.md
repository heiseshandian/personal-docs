## Background

There are many videos without subtitles on [bilibili](https://www.bilibili.com/), which is difficult for someone (like me) to understand. So, i build this tool to download videos from bilibili and another tool [auto-add-subtitle](https://www.npmjs.com/package/auto-add-subtitle) to add subtitles for videos i downloaded.

Read this in other languages: [english](./README.md) | [简体中文](./README.zh-cn.md)

## Introduction

This tool use [贝贝 bilibili](https://xbeibeix.com/api/bilibili/) to parse real video url then use axios download the video. (just for study, do not abuse!)

## Installation

```sh
npm i -g bilibili-dl
```

## Usage

```sh
bilibili-dl [{-s should parse and download whole series,default is false}] {url}
```
