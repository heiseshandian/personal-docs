import { tokenize, parse, transform, generate, compile } from '../src';
import { CASTNode, LispASTNode, Token } from '../src/type';

const input = '(add 2 (subtract 4 2))';
const output = 'add(2, subtract(4, 2));';

const tokens: Token[] = [
  { type: 'paren', value: '(' },
  { type: 'name', value: 'add' },
  { type: 'number', value: '2' },
  { type: 'paren', value: '(' },
  { type: 'name', value: 'subtract' },
  { type: 'number', value: '4' },
  { type: 'number', value: '2' },
  { type: 'paren', value: ')' },
  { type: 'paren', value: ')' },
];

const ast: LispASTNode = {
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
};

const newAst: CASTNode = {
  type: 'Program',
  body: [
    {
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'add',
        },
        arguments: [
          {
            type: 'NumberLiteral',
            value: '2',
          },
          {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'subtract',
            },
            arguments: [
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
    },
  ],
};

test('tokenize', () => {
  expect(tokenize(input)).toEqual(tokens);
});

test('parse', () => {
  expect(parse(tokens)).toEqual(ast);
});

test('transform', () => {
  expect(transform(ast)).toEqual(newAst);
});

test('generate', () => {
  expect(generate(newAst)).toEqual(output);
});

test('compile', () => {
  expect(compile(input)).toEqual(output);
});
