[clean code 作者亲自讲解如何编写整洁代码](https://www.youtube.com/watch?v=7EmboKQH8lM&list=PLmmYSbUCWJ4x1GO839azG_BBw8rkh-zOj)

you're not done when it works, you're done when it's right.

### the rules of functions

- They should be small
- They should be smaller than that
- 一个函数的所有代码必须在同一个抽象层次上，并且此抽象层次必须比函数名称低一级

一个函数应该只做一件事。当函数小到你不能再从中抽取任何有意义的更小的函数

### 注释

- 仅在代码本身无法表达意图的时候才使用注释，注释本质上是对代码表述能力的一种否定
- 注释应该阐述意图而不是阐述代码本身干了什么
- 当你发现自己需要写注释时先不要急着写，先想一想如何使代码更为整洁（整洁到不需要被注释）

### TODO comments

- 代码合并到 master 分支之前需要完成所有 todo 或者删除所有 todo 注释（不然 todo 就意味着永远也不会做了，想想那些我们说明天再做的事情，正常情况下明天等于永不~）
