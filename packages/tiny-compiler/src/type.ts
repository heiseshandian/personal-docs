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
};

export type Visitor = {
  [key in LispNodeType]?: {
    enter?: (node: LispASTNode, parent: LispASTNode) => void;
    exit?: (node: LispASTNode, parent: LispASTNode) => void;
  };
};
