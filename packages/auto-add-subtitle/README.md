### 介绍

自动添加字幕

### 如何使用

- 安装 ffmpeg
  [download ffmpeg](https://ffmpeg.org/download.html)
- 安装本工具

```sh
npm i -g auto-add-subtitle
```

- 使用

```sh
auto-add-subtitle [-vp={需要添加字幕的视频所在目录,默认是当前目录}]
```

![](../../assets/2020-10-20-11-39-51.png)

### 参考资料

- [axios-download-progress-in-node-js](https://futurestud.io/tutorials/axios-download-progress-in-node-js)

### 待实现功能

- 使用 [api-extractor](https://api-extractor.com/) 管理接口变更
- 换方案识别页面按钮

### 视频基本概念

![](../../assets/2020-10-12-17-13-28.png)

- container format
  avi,mp4 这种属于容器类型
- frame rate
  images per second
- bitrate
  bits per second
- frames
  数据单元
- packets
  压缩后的数据单元，一个 packets 可以包含多个完整的 frames
- srt files
  ![](../../assets/2020-10-15-09-22-12.png)
