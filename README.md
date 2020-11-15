[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

coding everyday

### 待办事项

#### master-dl

- 添加单元测试
- 支持多进度条（使用 zgq-shared 替换 progress）
- 重试机制
- 支持多选（目前只能选中一个课程）

#### auto-add-subtitle

- 正式解析前测试能否正常解析，不能的话借助 inquirer 提示用户升级依赖包
- 仿照 fluent-ffmpeg 更新说明文档
- 支持通过环境变量取 ffmpeg 路径，进度通知优化（比如说去掉前面无意义的速度信息）
- 考虑用 fluent-ffmpeg 替换裸写命令
