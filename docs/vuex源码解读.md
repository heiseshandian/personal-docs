### vuex 踩坑记录

#### 使用 registerModule 多次注册同一模块会导致后面再调用此模块下的 action 时连续触发多次

```js
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

// 根模块
const store = new Vuex.Store({});

// 子模块-简便起见我们这里只定义个actions
const moduleA = {
  actions: {
    inc() {
      console.log("i was called");
    },
  },
};

// 多次注册子模块
store.registerModule("moduleA", moduleA);
store.registerModule("moduleA", moduleA);

// 调用一次 action
store.dispatch("inc");
```

实际上 action 被执行了两次

```sh
i was called
i was called
```

这个问题的出现原因是通过 registerModule 注册模块的时候并不会检查模块本身是否注册过，而 vuex 内部又是通过数组来收集 action 的，这就导致多次注册同一模块时 action 被加入到内部数组中多次。action 在 vuex 中被注册的简化代码如下：

```js
module.forEachAction((action, key) => {
  const type = action.root ? key : namespace + key;
  const handler = action.handler || action;
  registerAction(store, type, handler, local);
});

function registerAction(store, type, handler, local) {
  const entry = store._actions[type] || (store._actions[type] = []);
  entry.push(function wrappedActionHandler(payload) {
    // action参数注入等逻辑
  }
}
```

这里的 action 之所以是数组是 vuex 作者考虑到可能不同的模块需要对某一 action 做出响应，也就是说默认情况下不同模块的 action 是可以重名的，且默认注册在根命名空间下。比如说我们有个应用的不同页面被分成不同模块，然后用户切换账号的时候我们需要将不同页面上展示的资源都刷新掉，这时候就可以注册个名字叫做 refreshResource 的 action，各个模块可以实现自己的定制刷新逻辑，然后一次触发全部刷新（mutation 默认也是注册在根命名空间下）。当然，也可以为 module 添加 namespaced 属性控制 vuex 不要将 action 注册在根命名空间下。

添加了 namespaced 属性的模块可以在 action 中添加 root 属性将 action 和 mutation 注册在根命名空间下

```js
const moduleA = {
  namespaced: true,
  actions: {
    foo: {
      root: true,
      handler(namespacedContext, payload) {
        // ...
      },
    },
  },
};
```

那我们如何避免模块重复注册的问题呢？思路其实也挺简单的，那就是我们在注册模块前先判断下模块是否已经注册过，如果已经注册过就不再注册了

```js
const store = new Vuex.Store({
  // ...
});
rewriteRegisterModule(store);

function rewriteRegisterModule(store) {
  const original = store.registerModule;
  store.registerModule = function (path, ...rest) {
    if (store.hasModule(path)) {
      return;
    }
    original.call(store, path, ...rest);
  };
}
```

### 如何实现一个精简版 vuex？

如果让我们来实现一个精简版的 vuex，我们会如何实现，思路是什么？

一种很简单的思路是我们定义一个全局对象，然后在所有 vue 组件中使用这个对象作为组件的状态，这样当全局对象变更时所有的 vue 实例都会得到通知。

以下实现来自 vue 官网 [state-management](https://vuejs.org/v2/guide/state-management.html)

```js
var sourceOfTruth = {};

var vmA = new Vue({
  data: sourceOfTruth,
});

var vmB = new Vue({
  data: sourceOfTruth,
});
```

当然，sourceOfTruth 本身没对组件对其修改做任何限制，这对于调试来说可能不太方便（组件可以随便变更状态，比如说 A 组件依赖于某个状态，但是 B 组件无意中改了这个状态，这就导致 A 组件 ui 被无意刷新了），我们可以约定下状态变更的方式。

以下实现来自 vue 官网 [state-management](https://vuejs.org/v2/guide/state-management.html)

```js
const store = {
  debug: true,
  state: {
    message: "Hello!",
  },
  setMessageAction(newValue) {
    if (this.debug) console.log("setMessageAction triggered with", newValue);
    this.state.message = newValue;
  },
  clearMessageAction() {
    if (this.debug) console.log("clearMessageAction triggered");
    this.state.message = "";
  },
};
```

业务端只能通过调用 action 的方式来改变状态，这样每一次状态变更就是可追踪的。

当然，上面的模式还有个问题就是每个组件都需要手动引入 store，使用体验可能不是很好，我们期望可以像 vuex 一样只注册一次，然后在每个 vue 组件中都可以使用。借助全局 mixin 的方式我们可以轻松实现类似功能。

```js
const store = {
  // ...
};

Vue.mixin({
  beforeCreate() {
    this.$store = store;
  },
});
```

这样在组件中使用的时候我们就可以直接使用 this.\$store 来访问全局 store 对象，而不用每次都手动引入。

```js
export default {
  data() {
    return this.$store;
  },
};
```

到这里其实已经和 vuex 的使用体验非常接近了，有个不同点是我们的 store 对象不是响应式的，当然，我们可以借助 vue 来让 store 变成响应式的。

```js
Vue.observable(store.state);
```

这样在组件中我们就可以通过计算属性的方式来引用 state 里面的属性值

```js
export default {
  computed: {
    message() {
      return this.$store.state.message;
    },
  },
};
```

至此，精简版 vuex 就实现完毕了，当然，为了绑定方便我们还可以添加 mapXXX 类函数。实现起来也不费事。大家可以自行实现下~

### vuex(3.5.1) 源码解读

#### 为什么要看 vuex 源码？

- 非常简短，看起来不费劲
- 业务上的特殊使用场景导致一些奇怪的 bug，不了解内部实现可能无法从根本上解决问题

#### install

通过 global mixin 的形式往每个 vue 实例下都挂个 \$store 属性，这样就可以在每个 vue 组件里面通过 this.\$store 访问 vuex，这么做主要是为了避免每次使用 vuex 都需要手动 import store from '...'。

```js
Vue.mixin({ beforeCreate: vuexInit });

function vuexInit() {
  const options = this.$options;
  // store injection
  if (options.store) {
    this.$store = typeof options.store === "function" ? options.store() : options.store;
  } else if (options.parent && options.parent.$store) {
    this.$store = options.parent.$store;
  }
}
```

#### state & getter

从 Store 构造函数开始看，暂时忽略掉不需要关心的逻辑，state 和 getter 初始化步骤如下，我们可以看到 vuex 内部其实是用了一个 vue 实例来让 state 具备响应式，vuex 中的 getters 其实就是计算属性。

```js
const computed = {};
forEachValue(wrappedGetters, (fn, key) => {
  computed[key] = () => fn(store);
  Object.defineProperty(store.getters, key, {
    get: () => store._vm[key],
    enumerable: true, // for local getters
  });
});

store._vm = new Vue({
  data: {
    $$state: state,
  },
  computed,
});
```

#### mutation

从 Store 构造函数开始看，忽略掉不需要关心的细节。可以看出 vuex 给 mutation 注入了两个参数，一个是当前模块的状态，另一个是传参。这样我们就能在 mutation 中改变当前模块的状态了。

```js
module.forEachMutation((mutation, key) => {
  const namespacedType = namespace + key;
  registerMutation(store, namespacedType, mutation, local);
});

function registerMutation(store, type, handler, local) {
  const entry = store._mutations[type] || (store._mutations[type] = []);
  entry.push(function wrappedMutationHandler(payload) {
    handler.call(store, local.state, payload);
  });
}
```

#### action

从 Store 构造函数开始看，忽略掉不需要关心的细节。可以看出 vuex 给 action 注入了两个参数，第一个包含 commit，dispatch，这让我们在 action 中可以改变状态以及触发其他 action，第一个参数里面还包含当前模块以及根模块的状态和计算属性；第二个则是用户传入的参数。从这里我们也可以发现对于 action 而言只接受一个 payload 入参，如果我们需要传入多个参数的话只能通过对象的形式传入，传入多个参数是无效的~

```js
module.forEachAction((action, key) => {
  const type = action.root ? key : namespace + key;
  const handler = action.handler || action;
  registerAction(store, type, handler, local);
});

function registerAction(store, type, handler, local) {
  const entry = store._actions[type] || (store._actions[type] = []);
  entry.push(function wrappedActionHandler(payload) {
    let res = handler.call(
      store,
      {
        dispatch: local.dispatch,
        commit: local.commit,
        getters: local.getters,
        state: local.state,
        rootGetters: store.getters,
        rootState: store.state,
      },
      payload
    );
    if (!isPromise(res)) {
      res = Promise.resolve(res);
    }
    if (store._devtoolHook) {
      return res.catch((err) => {
        store._devtoolHook.emit("vuex:error", err);
        throw err;
      });
    } else {
      return res;
    }
  });
}
```
