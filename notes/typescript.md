[toc]

### FAQ

#### Cannot write file '\*.js' because it would overwrite input file.

这是因为 ts 需要编译成 js 输出到某个目录中，不指定 outDir 会默认输出到当前目录，这样如果开启了 allowJs 就会导致 ts 输出覆盖原始的 js 文件，所以这时候 ts 就报错提示了

解决方案

- 配置 outDir 输出到其他目录
- 关闭 js 检测

#### 如何在 window 下面添加属性

```ts
// file.d.ts
interface Window {
  propertyName: T;
}
```

```json
// tsconfig.json
{
  "include": ["file.d.ts"]
}
```
