### 概述

- 正常情况下从左到右，从上到下依次排列
- 流向可以改变
- 特殊布局场景下对流的破坏

### 流、元素和基本尺寸

#### 块级元素 vs `display:block`

块级元素并不等同于 `display:block`的元素，因为 `li`,`table`的 display 值分别是`list-item`和`table`，但它们都是块级元素，因为它们都符合块级元素的基本特征，也就是水平流上只能显示一个元素，多个则换行显示。

正是由于它们都是块级元素，所以它们都能用来清除浮动

```css
.clear:after {
  content: '';
  /* 也可以是list-item , block */
  display: table;
  clear: both;
}
```
