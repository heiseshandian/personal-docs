[toc]

### 核心概念

- Environments 定义代码的运行环境，每个环境会包含一组预先定义的全局变量
- Globals 全局变量
- Rules 规则

### 常用包

| 包名                              | 用途                                                            |
| --------------------------------- | --------------------------------------------------------------- |
| eslint-plugin-import              | 解析 es6 的 import/export                                       |
| eslint-import-resolver-typescript | 为 eslint-plugin-import 添加 ts 支持                            |
| @typescript-eslint/parser         | eslint 默认解析器仅支持 es5，本包用于生成 ESTree 供 eslint 使用 |
