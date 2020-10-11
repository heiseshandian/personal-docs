### 介绍

自动添加字幕

### 参考资料

- [axios-download-progress-in-node-js](https://futurestud.io/tutorials/axios-download-progress-in-node-js)

### 待实现功能

- 视频切割进度通知
- exec 执行的 cmd 过长导致报错
- 视频切割保持清晰度（-codec copy）

### 视频基本概念

![](../../assets/2020-10-10-23-30-24.png)

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
