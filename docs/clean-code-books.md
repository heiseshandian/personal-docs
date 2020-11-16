神在细节之中

## clean code

### 混乱的代价

混乱的代码难以理解，添加新功能的时候需要花费更多时间来了解代码的意图，同时，不明显与混乱的以来关系，缺乏测试等还会出现加了这个功能结果原来的功能无法正常工作的问题，大大降低添加新功能与修复 bug 的速度。

上线时间紧张，没时间清理代码，日后再清理代码，面对混乱的代码我们可能会有诸多借口。但是，作为一位专业人员，任何时候制造混乱都是错误的，任何时候都要保持代码的整洁，只有代码一直保持整洁才能让我们在任何时间里以正常的速度为软件添加新功能。

我们应该像项目经理捍卫计划表那样捍卫我们的代码，让代码始终保持整洁是我们的职责所在。

## meaningful names

### 命名应该体现意图

好的命名应该回答三个问题：

- why it exists
- what it does
- how it is used

bad code with bad names

```java
public List<int[]> getThem() {
  List<int[]> list1 = new ArrayList<int[]>();
  for (int[] x : theList)
  if (x[0] == 4)
  list1.add(x);
  return list1;
}
```

good code with good names

```java
public List<int[]> getFlaggedCells() {
  List<int[]> flaggedCells = new ArrayList<int[]>();
  for (int[] cell : gameBoard)
  if (cell[STATUS_VALUE] == FLAGGED)
  flaggedCells.add(cell);
  return flaggedCells;
}
```

### 避免可能引起混乱的名字

比如说我们可能会为一组账户数据命名为 accountList，这在 java 程序员中就可能会引起混乱，List 对于 java 程序员来说具有特殊的含义，如果你用于存储数据的容器不是 List 的话最好不要命名为 accountList，命名为 accounts 可能更为合适。

### 有意义的区分

很多时候我们可能会遇到这种情况，我们从外部模块中引入一个变量和我们的一个本地变量重名了，这时候我们可能会为其中一个随意命名或者为其中一个加上无意义的后缀和前缀来避免 ide 报错。这种做法是不可取的，如果确实需要这两个变量，那这两个变量所承担的职责肯定不一样，那我们就需要根据其职责来为变量命名。

### 使用能够读出来的名字

### 使用可搜索的名字

避免无意义的数字，字符。增加可读性，方便后期更改。

```ts
5;
WORK_DAYS_PER_WEEK = 5;
```

### Class Names

类的名字应该是名词，避免使用动词为类命名。

### Method Names

方法名应该永远采用动词或动词短语

### 为每一种概念选择一个单词并保持一致

### 避免使用同一个词语表达不同的意思

add vs append

### 添加有意义的上下文信息

类名，函数名，模块名，包名都能提供有意义的上下文信息。

```ts
const userName;
const userAge;
```

vs

```ts
class User {
  name: string;
  age: number;
}
```

## 函数

一个函数的所有代码应该在同一抽象层次，不在同一抽象层次的代码会大大降低可读性

### 尽可能短小

通过不断抽取函数的方式让函数保持尽可能单一且短小

### 嵌套

函数嵌套不应该超过两层

### 单一职责

一个函数的所有代码都应该在同一抽象层次上，并且此抽象层次仅低于函数本身所表示的抽象层次。通过抽取函数的形式将不同抽象层次的代码抽出去，提高可读性。

### switch

避免使用 switch，因为 switch 违反了单一职责原则，开闭原则。

### 使用描述性的名字

让函数保持尽可能的短小，小到只做好一件事情，这样为函数挑选描述性的名字就会变得容易一点。

### 参数

尽量避免使用三个或三个以上的参数
