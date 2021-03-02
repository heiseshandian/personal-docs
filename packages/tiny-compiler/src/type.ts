export interface Token {
  type: 'paren' | 'name' | 'number';
  value: string;
}

type LispNodeType = 'Program' | 'NumberLiteral' | 'CallExpression';

export type LispASTNode = {
  type: LispNodeType;
  body?: LispASTNode[];
  value?: string;
  name?: string;
  params?: LispASTNode[];
  _context?: unknown;
};

type CNodeType = LispNodeType | 'ExpressionStatement' | 'Identifier';

export type CASTNode = {
  type: CNodeType;
  body?: CASTNode[];
  expression?: CASTNode;
  callee?: CASTNode;
  name?: string;
  arguments?: CASTNode[];
  value?: string;
};

export type Visitor = {
  [key in LispNodeType]?: {
    enter?: (node: LispASTNode, parent: LispASTNode | null) => void;
    exit?: (node: LispASTNode, parent: LispASTNode | null) => void;
  };
};
