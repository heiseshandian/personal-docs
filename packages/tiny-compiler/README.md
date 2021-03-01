### 背景

昨天下午参加了字节跳动前端一面，面试官问了个 babel 工作原理的问题，没有回答好，本着学习的心态用 ts 重新实现一遍 [the-super-tiny-compiler](https://github.com/jamiebuilds/the-super-tiny-compiler)

### 介绍

通常编译器的编译过程会分为三步

- parsing 将源代码解析成计算机更容易读懂的抽象语法树 ast
- transform 将第一步解析得到的 ast 经过变换得到新的语法树（可以在旧的语法树上直接增删改，也可以基于旧的树生成新的抽象语法树）
- generate 基于第二步得到的抽象语法树生成最终代码

#### parsing

parsing 通常分为两步

- 词法分析

这一步主要负责将源代码拆分成一个个的 token，token 主要用于描述一个独立的语法单元。比如说以下代码（lisp 代码），经过词法分析后得到的 tokens 数组可能是这样的

```lisp
(add 2 (subtract 4 2));
```

```js
// tokens
[
  { type: 'paren', value: '(' },
  { type: 'name', value: 'add' },
  { type: 'number', value: '2' },
  { type: 'paren', value: '(' },
  { type: 'name', value: 'subtract' },
  { type: 'number', value: '4' },
  { type: 'number', value: '2' },
  { type: 'paren', value: ')' },
  { type: 'paren', value: ')' },
];
```

- 语法分析

这一步主要是通过遍历词法分析阶段得到 tokens 数组组装成一棵抽象语法树。对于上面的例子，生成的 ast 可能是这样的

```js
// ast
{
  type: 'Program',
  body: [{
    type: 'CallExpression',
    name: 'add',
    params: [{
      type: 'NumberLiteral',
      value: '2',
    }, {
      type: 'CallExpression',
      name: 'subtract',
      params: [{
        type: 'NumberLiteral',
        value: '4',
      }, {
        type: 'NumberLiteral',
        value: '2',
      }]
    }]
  }]
}
```
