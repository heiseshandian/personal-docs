### 介绍

自动添加字幕

### 参考资料

- [axios-download-progress-in-node-js](https://futurestud.io/tutorials/axios-download-progress-in-node-js)

### 待实现功能

- 对外提供 cli
- 支持并行加字幕（上传操作串行，其他操作并行）
- 自动加字幕优化（无头模式，并发，成功率）
- 目标使用情况 videos -> videos + srts（其他所有中间文件都需要清理掉）
- 使用 [api-extractor](https://api-extractor.com/) 管理接口变更

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
