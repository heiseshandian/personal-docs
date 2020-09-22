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

## 函数式编程发展史

lambda calculus

- 一切函数都是匿名函数
- 一切函数都是一元表达式（只有一个参数）
- 函数是一等公民，意味着函数可以作为参数，可以作为返回值

## 纯函数

- 同样的输入产生同样的输出
- 无副作用（不能改变任何外部状态）

纯函数是函数的最简形式，纯函数使得并发计算变得简单，同时，纯函数容易重构，可测试，使得你的代码具备灵活性与可扩展性，因为你不用担心修改一个纯函数会导致什么未知的后果，你只需要保证同样的输入，输出不变就行了。

```js
// 模拟根据用户输入异步请求数据后展示tips
// （异步执行先后顺序不确定，需要确保有新的输入后旧的任务取消，且过时的数据不再展示出来）
const taskManager = {
  tasks: [],
  addTask(task) {
    this.clearPendingTasks();

    task.timeout = setTimeout(() => {
      if (task.timeout !== null) {
        task();
        task.timeout = null;
      }
    }, Math.random() * 2000);

    this.tasks.push(task);
  },
  clearPendingTasks() {
    this.tasks.forEach((task) => {
      if (task.timeout) {
        clearTimeout(task.timeout);
        task.timeout = null;
      }
    });

    this.tasks.length = 0;
  },
};
```

## 什么是函数式编程？

- 纯函数
- 函数组合
- 避免共享状态
- 避免更改状态
- 避免副作用
- 偏向声明式

共享状态的问题

- race condition bug （异步请求到达的顺序与发出的顺序不一致导致旧的数据覆盖新的数据）

## functors

```js
const mapObject = (obj) => ({
  map(fn) {
    return mapObject(
      Object.keys(obj).reduce((acc, key) => {
        acc[key] = fn(obj[key]);
        return acc;
      }, {})
    );
  },
  value() {
    return obj;
  },
});
```

## monads

```js
const composeM = (method) => (...ms) => ms.reduce((f, g) => (x) => g(x)[method](f));
const pipeM = (method) => (...ms) => ms.reduce((f, g) => (x) => f(x)[method](g));

const composePromises = composeM("then");
```
