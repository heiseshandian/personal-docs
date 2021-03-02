### 背景

昨天下午参加了字节跳动前端一面，面试官问了个 babel 工作原理的问题，没有回答好，本着学习的心态用 ts 重新实现一遍 [the-super-tiny-compiler](https://github.com/jamiebuilds/the-super-tiny-compiler)

### 介绍

通常编译器的编译过程会分为三步

- parsing 将源代码解析成计算机更容易读懂的抽象语法树 ast
- transform 将第一步解析得到的 ast 经过变换得到新的语法树（可以在旧的语法树上直接增删改，也可以基于旧的树生成新的抽象语法树）
- generate 基于第二步得到的抽象语法树生成最终代码
