### mini-vue

实现个小型的 vue

```js
// reactive
const map = new WeakMap();
const getDep = (target, prop) => {
  if (!map.has(target)) {
    map.set(target, new Map());
  }
  const depsMap = map.get(target);
  if (!depsMap.get(prop)) {
    depsMap.set(prop, new Dep());
  }
  return map.get(target).get(prop);
};

const proxyHandler = {
  get(target, prop, receiver) {
    const dep = getDep(target, prop);
    dep.depend();
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    const dep = getDep(target, prop);
    Reflect.set(target, prop, value, receiver);
    dep.notify();
  },
};

function reactive(state) {
  return new Proxy(state, proxyHandler);
}

let activeEffect;
class Dep {
  constructor() {
    this.subs = new Set();
  }

  depend() {
    if (activeEffect) {
      this.subs.add(activeEffect);
    }
  }

  notify() {
    this.subs.forEach((sub) => sub());
  }
}

// effect
function watchEffect(effect) {
  function wrappedEffect() {
    activeEffect = effect;
    effect();
    activeEffect = null;
  }
  wrappedEffect();
}

// vdom
function h(tag, props, children) {
  return {
    tag,
    props,
    children,
  };
}

function mount(vdom, container) {
  const { tag, props, children = [] } = vdom;
  // tag
  const ele = document.createElement(tag);
  container.appendChild(ele);
  vdom.ele = ele;

  // props
  if (props) {
    Object.keys(props).forEach((prop) => {
      if (prop.startsWith("on")) {
        ele.addEventListener(prop.slice(2).toLowerCase(), props[prop]);
        return;
      }
      ele.setAttribute(prop, props[prop]);
    });
  }

  // children
  if (typeof children === "string") {
    ele.textContent = children;
  } else {
    children.forEach((child) => mount(child, ele));
  }
}

function patch(n1, n2) {
  if (n1.tag === n2.tag) {
    // tag
    const ele = (n2.ele = n1.ele);

    // props add  modify
    if (n2.props) {
      Object.keys(n2.props).forEach((prop) => {
        if (n2.props[prop] !== n1.props[prop]) {
          ele.setAttribute(prop, n2.props[prop]);
        }
      });
    }

    // props delete
    if (n1.props) {
      Object.keys(n1.props).forEach((prop) => {
        if (!(prop in n2.props)) {
          ele.removeAttribute(prop);
        }
      });
    }

    // children
    const oldChildren = n1.children;
    const newChildren = n2.children;
    if (typeof newChildren === "string") {
      if (oldChildren !== newChildren) {
        ele.textContent = newChildren;
      }
    } else {
      // common length
      newChildren
        .slice(0, Math.min(oldChildren.length, newChildren.length))
        .forEach((newChild, i) => {
          patch(oldChildren[i], newChild);
        });

      // add item
      if (newChildren.length > oldChildren.length) {
        newChildren.slice(oldChildren.length).forEach((child) => {
          mount(child, ele);
        });
      }

      // remove item
      if (newChildren.length < oldChildren.length) {
        oldChildren.slice(newChildren.length).forEach((child) => {
          ele.removeChild(child.ele);
        });
      }
    }
  } else {
    // replace
  }
}

const App = {
  data: reactive({ count: 0 }),
  render() {
    return h(
      "div",
      {
        class: "btn",
        onClick: () => this.data.count++,
      },
      `${this.data.count}`
    );
  },
};

function mountApp(component, container) {
  let isMounted = false;
  let prevDom;
  watchEffect(() => {
    if (!isMounted) {
      prevDom = component.render();
      mount(prevDom, container);
      isMounted = true;
    } else {
      let newVDom = component.render();
      patch(prevDom, newVDom);
      prevDom = newVDom;
    }
  });
}
```

### vue3 源码学习笔记

- ls-lint
  An extremely fast file and directory name linter - Bring some structure to your project directories
- yorkie
  fork 自 husky

### 学习资料

- [vue3 deep dive](https://www.bilibili.com/video/BV1rC4y187Vw?p=5) 尤大亲自介绍 vue3 底层实现原理，手把手教学实现个微型的 vue，composition api 简介（推荐，可以反复看）
- [vue3 新特性简介](https://www.bilibili.com/video/BV12k4y1y75T/?spm_id_from=333.788.videocard.2) composition api，suspense，teleport（why，usage）
- [vue3 响应式原理](https://www.bilibili.com/video/BV1SZ4y1x7a9/?spm_id_from=333.788.videocard.4)
