# chrome dev tools 使用技巧

## dom 断点调试

当你要调试特定元素的 DOM 中的更改时，可以使用此选项。这些是 DOM 更改断点的类型：
![dom 断点调试](../assets/20240129093700.png)

- Subtree modifications: 子节点删除或添加时
- Attributes modifications: 属性修改时
- Node Removal: 节点删除时

## logpoints

Logpoints （日志点）是一种向控制台提供调试信息的方式，而无需使用 console.log()，这在线上应用调试时会很有用。可以通过右键单击 DevTools 中的 Source 选项卡中的任何行并指定要记录的表达式来添加新的 Logpoint。执行该行时，就会在控制台中获得它的值。

![logpoints](../assets/20240130092636.png)

## 动态表达式

实时表达式是一种在表达式更改时显示其值的功能。 这有助于追踪代价高昂的表达式（如动画中使用的表达式）或变化很大的表达式（例如，如果正在遍历数组）的问题。它会将 Console 面板里的表达式置顶，并且能随着用户点击的变化，而动态刷新该置顶的表达式。

只需点击下图中眼睛图标，输入一个想要置顶的 JavaScript 表达式即可：

![动态表达式](../assets/20240130092850.png)

## 复制 JavaScript 变量

假如你的代码经过计算会输出一个复杂的对象，且需要被复制下来发送给其他人，怎么办？
使用 copy 函数，将对象作为入参执行即可

![复制 JavaScript 变量](../assets/20240130093232.png)

## 截取一张全屏的网页

偶尔咱们也会有对网页截屏的需求，一屏还好，系统自带的截屏或者微信截图等都可以办到，但是要求将超出一屏的内容也截下来咋办呢？

- 准备好需要截屏的内容
- cmd + shift + p 执行 Command 命令
- 输入 Capture full size screenshot 按下回车

注意：目前对于 juejin 网站使用 Capture full size screenshot 无法正常截取全屏
