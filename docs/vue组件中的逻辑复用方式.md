### mixin

#### 示例

```js
var myMixin = {
  created: function () {
    this.hello();
  },
  methods: {
    hello: function () {
      console.log('hello from mixin!');
    },
  },
};

// define a component that uses this mixin
var Component = Vue.extend({
  mixins: [myMixin],
});

var component = new Component(); // => "hello from mixin!"
```

#### 优点

- 允许多继承，一个组件可以同时使用多个 mixin

#### 缺点

- 命名冲突（mixin 中的某些属性会被组件的同名属性覆盖，这可能会导致 mixin 无法正常工作），可以通过命名规范来解决，比如说所有 mixin 内的属性都以 \$\_ 命名（vue style guide 推荐）
- 属性来源问题，某个组件继承多个 mixin 时要想知道模板里面用到的某个属性来自哪个 mixin 会变成一件很困难的事情
- 不清晰的依赖关系（mixin 可以直接访问组件中的属性，这就导致 mixin 和组件强耦合，对于组件的变更可能会影响到 mixin 的正常工作）

### 参考资料

- https://vueschool.io/articles/vuejs-tutorials/reusing-logic-in-vue-components/
- https://css-tricks.com/how-the-vue-composition-api-replaces-vue-mixins/
- https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html
