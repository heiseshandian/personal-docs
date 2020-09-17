## 介绍

编程的本质是把一个复杂的问题拆分成一系列简单的问题，然后把这些简单的解决方案组合起来解决复杂的问题。

```js
const pipe = (...args) => (x) => args.reduce((acc, fn) => fn(acc), x);
const compose = (...args) => (x) => args.reduceRight((acc, fn) => fn(acc), x);
```

通过组合构建函数能在很大程度上减少不必要的中间变量，减轻大脑的工作负担，提高工作效率。通过更少的代码做更多的事。

组合的三种形式：

- delegation
- acquaintance (use-a, an object knows another object by reference, e.g., a network handler might be passed a reference to a logger to log request-the request handler uses a logger)
- aggregation (has-a, when child objects form part of a parent object)

软件开发的本质就是组合

## 不可变性

函数式编程是 js 的支柱，而不可变性是函数式编程的支柱。

- Immutability
- Separation
- Composition
- Flow
