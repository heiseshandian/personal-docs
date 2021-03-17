### 判断是否支持 webp 格式

1. 通过 [caniuse](https://caniuse.com/) 网站查询 webp 格式的支持情况，然后在业务端通过 ua 判断支持情况

2. 通过加载 webp 格式的图片来判断

```js
function checkWebPSupport() {
  return new Promise((resolve, reject) => {
    var img = new Image();
    img.onload = function () {
      resolve();
    };
    img.onerror = function () {
      reject();
    };
    img.src = 'path/to/your/webp file';
  });
}
```

3. 通过 canvas 来判断

```js
function canUseWebP() {
  var elem = document.createElement('canvas');
  if (!!(elem.getContext && elem.getContext('2d'))) {
    // was able or not to get WebP representation
    return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
  }
  // very old browser like IE 8, canvas not supported
  return false;
}
```

### 如何使用

```css
.elementWithBackgroundImage {
  background-image: url('image.jpg');
}
.webp .elementWithBackgroundImage {
  background-image: url('image.webp');
}
```
