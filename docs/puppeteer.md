### 其他

#### load vs networkidle0 vs networkidle2

[来源](https://github.com/puppeteer/puppeteer/issues/1666)

- `load` argument corresponds to the load event in the page. In certain cases, it might not happen at all
- `networkidle0` argument considers navigation successful when page has no network activity for half a second. This might never happen if the page is constantly loading multiple resources.
- `networkidle2` argument considers navigation successful when page has no more then 2 network requests for half a second. This is useful if page runs a long polling in the background.
