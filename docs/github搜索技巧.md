[toc]

### 查找项目技巧

对于带空格的关键字可使用双引号括起来

build label:"bug fix"

#### 根据项目名称，description，readme 等进行查找

| Qualifier      | Example                                    |
| -------------- | ------------------------------------------ |
| in:description | web in:description. description 中含有 web |
| in:readme      | web in:readme. readme 中含有 web           |

#### 查找某个用户或某个机构下的所有项目

| Qualifier     | Example      |
| ------------- | ------------ |
| user:USERNAME | user:defunkt |
| user:ORGNAME  | org:github   |

#### 缩小搜索结果

| Qualifier               | Example                             |
| ----------------------- | ----------------------------------- |
| size:n                  | size:1000 大小正好等于 1MB 的项目   |
| followers:n             |                                     |
| forks:n                 |                                     |
| stars:n                 | stars:>5000 star 数大于 5000 的项目 |
| language:LANGUAGE       |                                     |
| license:LICENSE_KEYWORD |                                     |

#### 排除某些结果

| Qualifier  | Example                             |
| ---------- | ----------------------------------- |
| NOT        | hello NOT world                     |
| -QUALIFIER | cats stars:>10 -language:javascript |

#### 根据用户名查找

| Qualifier          | Example               |
| ------------------ | --------------------- |
| QUALIFIER:USERNAME | author:nat            |
| QUALIFIER:@me      | is:issue assignee:@me |

### 参考文章

- [about-searching-on-github](https://help.github.com/en/github/searching-for-information-on-github/about-searching-on-github)
- [searching-for-repositories](https://help.github.com/en/github/searching-for-information-on-github/searching-for-repositories)
- [understanding-the-search-syntax](https://help.github.com/en/github/searching-for-information-on-github/understanding-the-search-syntax)
