```html
<div
  data-inspector-line="11"
  data-inspector-column="4"
  data-inspector-relative-path="src/components/Slogan/Slogan.tsx"
  class="css-1f15bld-Description e1vquvfb0"
>
  <p
    data-inspector-line="44"
    data-inspector-column="10"
    data-inspector-relative-path="src/layouts/index.tsx"
  >
    Inspect react components and click will jump to local IDE to view component
    code.
  </p>
</div>
```

```tsx
import React from 'react'
import { Inspector } from 'react-dev-inspector'

const InspectorWrapper = process.env.NODE_ENV === 'development'
  ? Inspector
  : React.Fragment

export const Layout = () => {
  // ...

  return (
    <InspectorWrapper
      keys={['control', 'shift', 'command', 'c']} // default keys
      ...  // Props see below
    >
     <Page />
    </InspectorWrapper>
  )
}
```

```ts
// launchEditorEndpoint.js
module.exports = "/__open-stack-frame-in-editor";
```

```ts
// errorOverlayMiddleware.js
const launchEditor = require("./launchEditor");
const launchEditorEndpoint = require("./launchEditorEndpoint");

module.exports = function createLaunchEditorMiddleware() {
  return function launchEditorMiddleware(req, res, next) {
    if (req.url.startsWith(launchEditorEndpoint)) {
      const lineNumber = parseInt(req.query.lineNumber, 10) || 1;
      const colNumber = parseInt(req.query.colNumber, 10) || 1;
      launchEditor(req.query.fileName, lineNumber, colNumber);
      res.end();
    } else {
      next();
    }
  };
};
```

```ts
new DefinePlugin({
  "process.env.PWD": JSON.stringfy(process.env.PWD),
});
```
```ts
export default function inspectorLoader(
  this: webpack.loader.LoaderContext,
  source: string
) {
  const { rootContext: rootPath, resourcePath: filePath } = this;

  const ast: Node = parse(source);

  traverse(ast, {
    enter(path: NodePath<Node>) {
      if (path.type === "JSXOpeningElement") {
        doJSXOpeningElement(path.node as JSXOpeningElement, { relativePath });
      }
    },
  });

  const { code } = generate(ast);

  return code
}
```
```ts
const doJSXOpeningElement: NodeHandler<
  JSXOpeningElement,
  { relativePath: string }
> = (node, option) => {
  const { stop } = doJSXPathName(node.name)
  if (stop) return { stop }

  const { relativePath } = option

  // 写入行号
  const lineAttr = jsxAttribute(
    jsxIdentifier('data-inspector-line'),
    stringLiteral(node.loc.start.line.toString()),
  )

  // 写入列号
  const columnAttr = jsxAttribute(
    jsxIdentifier('data-inspector-column'),
    stringLiteral(node.loc.start.column.toString()),
  )

  // 写入组件所在的相对路径
  const relativePathAttr = jsxAttribute(
    jsxIdentifier('data-inspector-relative-path'),
    stringLiteral(relativePath),
  )

  // 在元素上增加这几个属性
  node.attributes.push(lineAttr, columnAttr, relativePathAttr)

  return { result: node }
}
```
```ts
/**
 * https://stackoverflow.com/questions/29321742/react-getting-a-component-from-a-dom-element-for-debugging
 */
export const getElementFiber = (element: HTMLElement): Fiber | null => {
  const fiberKey = Object.keys(element).find(
    key => key.startsWith('__reactInternalInstance$'),
  )

  if (fiberKey) {
    return element[fiberKey] as Fiber
  }

  return null
}
```
```ts
// 这里用正则屏蔽了一些组件名 这些正则匹配到的组价名不会被检测到
export const debugToolNameRegex = /^(.*?\.Provider|.*?\.Consumer|Anonymous|Trigger|Tooltip|_.*|[a-z].*)$/;

export const getSuitableFiber = (baseFiber?: Fiber): Fiber | null => {
  let fiber = baseFiber

  while (fiber) {
    // while 循环向上递归查找 displayName 符合的组件
    const name = fiber.type?.displayName ?? fiber.type?.name
    if (name && !debugToolNameRegex.test(name)) {
      return fiber
    }
	// 找不到的话 就继续找 return 节点
    fiber = fiber.return
  }

  return null
}
```
```ts
export const getFiberName = (fiber?: Fiber): string | undefined => {
  const fiberType = getSuitableFiber(fiber)?.type
  let displayName: string | undefined

  // The displayName property is not guaranteed to be a string.
  // It's only safe to use for our purposes if it's a string.
  // github.com/facebook/react-devtools/issues/803
  //
  // https://github.com/facebook/react/blob/v17.0.0/packages/react-devtools-shared/src/utils.js#L90-L112
  if (typeof fiberType?.displayName === 'string') {
    displayName = fiberType.displayName
  } else if (typeof fiberType?.name === 'string') {
    displayName = fiberType.name
  }

  return displayName
}
```
```js
const COMMON_EDITORS_OSX = {
  '/Applications/Atom.app/Contents/MacOS/Atom': 'atom',
  '/Applications/Visual Studio Code.app/Contents/MacOS/Electron': 'code',
  ...
}
```
```js
child_process.spawn("code", pathInfo, { stdio: "inherit" });
```

```js
const { DefinePlugin } = require('webpack');

{
  module: {
    rules: [
      {
        test: /\.(jsx|js)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015', 'react'],
            },
          },
          // 注意这个 loader babel 编译之前执行
          {
            loader: 'react-dev-inspector/plugins/webpack/inspector-loader',
            options: { exclude: [resolve(__dirname, '想要排除的目录')] },
          },
        ],
      }
    ],
  },
  plugins: [
    new DefinePlugin({
      'process.env.PWD': JSON.stringify(process.env.PWD),
    }),
  ]
}
```

```js
import createErrorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware'

{
  devServer: {
    before(app) {
      app.use(createErrorOverlayMiddleware())
    }
  }
}
```

```js
import React from 'react'
import { Inspector } from 'react-dev-inspector'

const InspectorWrapper = process.env.NODE_ENV === 'development'
  ? Inspector
  : React.Fragment

export const Layout = () => {
  // ...

  return (
    <InspectorWrapper
      keys={['control', 'shift', 'command', 'c']} // default keys
      ...  // Props see below
    >
     <Page />
    </InspectorWrapper>
  )
}
```
