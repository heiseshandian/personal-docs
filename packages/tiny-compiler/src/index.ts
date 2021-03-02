import { CASTNode, LispASTNode, Token, Visitor } from './type';

const NUMBER_REG = /[0-9]/;
const NAME_REG = /[a-z]/i;
const WHITE_SPACE_REG = /\s/;

/**
 * 负责将原始代码转换为tokens数组，所谓token指的是描述独立语法片段的对象
 * 举个例子，input是 (add 2 (subtract 4 2))
 * 本函数的输出就是：
 *
  [
    { type: 'paren', value: '(' },
    { type: 'name', value: 'add' },
    { type: 'number', value: '2' },
    { type: 'paren', value: '(' },
    { type: 'name', value: 'subtract' },
    { type: 'number', value: '4' },
    { type: 'number', value: '2' },
    { type: 'paren', value: ')' },
    { type: 'paren', value: ')' },
  ]
 */
export function tokenize(input: string): Token[] {
  if (!input || input.length === 0) {
    return [];
  }

  // 我们用一个指针来指向当前待处理的字符
  let current = 0;
  const tokens: Token[] = [];

  while (current < input.length) {
    let char = input[current];

    // 空白字符直接跳过
    if (WHITE_SPACE_REG.test(char)) {
      // 指针后移到下一个需要处理的字符
      current++;
      continue;
    }

    // 左括号或者右括号
    if (char === '(' || char === ')') {
      tokens.push({
        type: 'paren',
        value: char,
      });
      current++;
      continue;
    }

    // 数字
    if (NUMBER_REG.test(char)) {
      // 与括号不同，数字是可以同时出现多个字符的，比如说 123，
      // 那我们就需要将123识别为一个完整的节点
      let value = '';
      while (NUMBER_REG.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({
        type: 'number',
        value,
      });
      // !这里不需要再后移指针，上面的while循环退出的时候current已经指向下一个非数字字符了
      continue;
    }

    // 标识符
    if (NAME_REG.test(char)) {
      // 标识符的处理方式与数字类似，其实这里也可以抽出一个更小的函数来复用处理数字的逻辑
      // 此处处于演示目的不做抽取
      let value = '';
      while (NAME_REG.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({
        type: 'name',
        value,
      });
      continue;
    }

    // 代码执行到此处说明当前字符非上面列出的所有字符类型，这时候我们可以抛出错误告知外部
    throw new TypeError(`未知字符 ${char}`);
  }

  return tokens;
}

/**
 * 负责将 tokenize 后得到的 tokens 数组转化为抽象语法树（ast）
 * 对于
  [
    { type: 'paren', value: '(' },
    { type: 'name', value: 'add' },
    { type: 'number', value: '2' },
    { type: 'paren', value: '(' },
    { type: 'name', value: 'subtract' },
    { type: 'number', value: '4' },
    { type: 'number', value: '2' },
    { type: 'paren', value: ')' },
    { type: 'paren', value: ')' },
  ] 而言

  本函数的输出是：
  {
    type: 'Program',
    body: [
      {
        type: 'CallExpression',
        name: 'add',
        params: [
          {
            type: 'NumberLiteral',
            value: '2',
          },
          {
            type: 'CallExpression',
            name: 'subtract',
            params: [
              {
                type: 'NumberLiteral',
                value: '4',
              },
              {
                type: 'NumberLiteral',
                value: '2',
              },
            ],
          },
        ],
      },
    ],
  }
 */
export function parse(tokens: Token[]): LispASTNode {
  let current = 0;

  function walk(): LispASTNode {
    let token = tokens[current];

    if (token.type === 'number') {
      // 返回前跳到下一个需要处理的节点
      current++;

      return {
        type: 'NumberLiteral',
        value: token.value,
      };
    }

    if (token.type === 'paren' && token.value === '(') {
      // 跳过左括号节点，来到name节点
      token = tokens[++current];

      const node: LispASTNode = {
        type: 'CallExpression',
        name: token.value,
        params: [],
      };

      // 跳过name节点
      token = tokens[++current];

      while (
        token.type !== 'paren' ||
        (token.type === 'paren' && token.value !== ')')
      ) {
        node.params?.push(walk());
        // !这里是current，不是current+1，因为经过递归walk之后current已经加1了
        token = tokens[current];
      }

      // 跳过右括号
      current++;
      return node;
    }

    throw new TypeError(`未知的token类型 ${token.type}`);
  }

  const ast: LispASTNode = {
    type: 'Program',
    body: [],
  };

  while (current < tokens.length) {
    ast.body?.push(walk());
  }

  return ast;
}

// 提供一种遍历ast上所有节点的方式，当然也可以不这么做，直接在transform中手动遍历节点
// 这么做就相当于将遍历节点与对节点的操作分开，我们知道，单一职责是软件设计上的良好实践
export function traverse(ast: LispASTNode, visitor: Visitor) {
  function traverseArray(arr: LispASTNode[], parent: LispASTNode | null) {
    arr.forEach(child => traverseNode(child, parent));
  }

  function traverseNode(node: LispASTNode, parent: LispASTNode | null) {
    const methods = visitor[node.type];

    // 进入节点
    if (methods?.enter) {
      methods.enter(node, parent);
    }

    // 递归遍历子节点
    switch (node.type) {
      case 'Program':
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        traverseArray(node.body!, node);
        break;
      case 'CallExpression':
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        traverseArray(node.params!, node);
        break;
      case 'NumberLiteral':
        break;
      default:
        // 走到此处说明node.type非上面列出的所有类型，我们直接抛出一个错误让外部自行处理
        throw new TypeError(`未知类型 ${node.type}`);
    }

    // 出节点
    if (methods?.exit) {
      methods.exit(node, parent);
    }
  }

  traverseNode(ast, null);
}

/**
 * 将左边的ast转化成右边的ast
 *
 * ----------------------------------------------------------------------------
 *   Original AST                     |   Transformed AST
 * ----------------------------------------------------------------------------
 *   {                                |   {
 *     type: 'Program',               |     type: 'Program',
 *     body: [{                       |     body: [{
 *       type: 'CallExpression',      |       type: 'ExpressionStatement',
 *       name: 'add',                 |       expression: {
 *       params: [{                   |         type: 'CallExpression',
 *         type: 'NumberLiteral',     |         callee: {
 *         value: '2'                 |           type: 'Identifier',
 *       }, {                         |           name: 'add'
 *         type: 'CallExpression',    |         },
 *         name: 'subtract',          |         arguments: [{
 *         params: [{                 |           type: 'NumberLiteral',
 *           type: 'NumberLiteral',   |           value: '2'
 *           value: '4'               |         }, {
 *         }, {                       |           type: 'CallExpression',
 *           type: 'NumberLiteral',   |           callee: {
 *           value: '2'               |             type: 'Identifier',
 *         }]                         |             name: 'subtract'
 *       }]                           |           },
 *     }]                             |           arguments: [{
 *   }                                |             type: 'NumberLiteral',
 *                                    |             value: '4'
 * ---------------------------------- |           }, {
 *                                    |             type: 'NumberLiteral',
 *                                    |             value: '2'
 *                                    |           }]
 *  (sorry the other one is longer.)  |         }
 *                                    |       }
 *                                    |     }]
 *                                    |   }
 * ----------------------------------------------------------------------------
 */
export function transform(ast: LispASTNode): CASTNode {
  const newAst: CASTNode = {
    type: 'Program',
    body: [],
  };

  // 使得遍历的时候可以在旧的ast上访问到新ast上的某个节点，进而实现操作新ast的目的
  ast._context = newAst.body;

  traverse(ast, {
    CallExpression: {
      enter(node, parent) {
        let expression: CASTNode = {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: node.name,
          },
          arguments: [],
        };

        // CallExpression节点的_context指向arguments数组，
        // 这样我们就能在访问CallExpression节点的时候通过node._context.push(...)的方式收集参数了
        node._context = expression.arguments;

        // 用表达式将CallExpression包裹起来
        if (parent?.type !== 'CallExpression') {
          expression = {
            type: 'ExpressionStatement',
            expression,
          };
        }

        // 将 expression 节点挂载在父节点下
        (parent?._context as CASTNode[]).push(expression);
      },
    },
    NumberLiteral: {
      enter(node, parent) {
        // NumberLiteral 节点必然挂载在CallExpression之下，我们在CallExpression中已经将节点的_context
        // 指向arguments
        (parent?._context as CASTNode[]).push({
          type: 'NumberLiteral',
          value: node.value,
        });
      },
    },
  });

  return newAst;
}

export function generate(node: CASTNode): string | undefined {
  switch (node.type) {
    case 'Program':
      return node.body?.map(generate).join('\n');
    case 'ExpressionStatement':
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return generate(node.expression!) + ';';
    case 'CallExpression':
      return (
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        generate(node.callee! as CASTNode) +
        '(' +
        node.arguments?.map(arg => generate(arg)).join(', ') +
        ')'
      );
    case 'NumberLiteral':
      return node.value;
    case 'Identifier':
      return node.name;
    default:
      throw new TypeError(`未知类型 ${node.type}`);
  }
}

export function compile(input: string): string | undefined {
  const ast = parse(tokenize(input));
  const newAst = transform(ast);
  return generate(newAst);
}
