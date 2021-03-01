import { LispASTNode, Token } from './type';

const NUMBER_REG = /[0-9]/;
const NAME_REG = /[a-z]/i;
const WHITE_SPACE_REG = /\s/;

export function tokenize(input: string): Token[] {
  if (!input || input.length === 0) {
    return [];
  }

  let current = 0;
  const tokens: Token[] = [];

  while (current < input.length) {
    let char = input[current];

    // white space
    if (WHITE_SPACE_REG.test(char)) {
      current++;
      continue;
    }

    // paren
    if (char === '(' || char === ')') {
      tokens.push({
        type: 'paren',
        value: char,
      });
      current++;
      continue;
    }

    // number
    if (NUMBER_REG.test(char)) {
      let value = '';
      while (NUMBER_REG.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({
        type: 'number',
        value,
      });
      current++;
      continue;
    }

    // name
    if (NAME_REG.test(char)) {
      let value = '';
      while (NAME_REG.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({
        type: 'name',
        value,
      });
      current++;
      continue;
    }

    throw new TypeError(`未知字符 ${char}`);
  }

  return tokens;
}

export function parse(tokens: Token[]): LispASTNode {
  let current = 0;

  function walk(): LispASTNode {
    let token = tokens[current];

    if (token.type === 'number') {
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
        token = tokens[current];
      }
    }

    throw new TypeError(`未知的token类型 ${token.type}`);
  }

  const ast: LispASTNode = {
    type: 'Program',
    body: [],
  };
  ast.body?.push(walk());

  return ast;
}

export function traverse() {}

export function transform() {}

export function generate() {}
