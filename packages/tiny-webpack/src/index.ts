import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { transformFromAst } from '@babel/core';

export function parseFile(filename: string) {
  const content = fs.readFileSync(filename, { encoding: 'utf8' });
  const ast = parse(content, { sourceType: 'module' });
  const deps: Record<string, string> = {};

  // 收集依赖
  // @ts-expect-error
  traverse(ast, {
    ImportDeclaration({ node }) {
      const dirname = path.dirname(filename);
      const dep = path.join('./', dirname, node.source.value);
      deps[node.source.value] = dep;
    },
  });

  // 转化代码
  // @ts-expect-error
  const { code } = transformFromAst(ast, null, {
    presets: ['@babel/preset-env'],
  });

  return {
    filename,
    deps,
    code,
  };
}

interface Graph {
  [key: string]: {
    deps: Record<string, string>;
    code: string;
  };
}

export function generateGraph(entry: string) {
  const entryModule = parseFile(entry);
  const graphArray = [entryModule];

  // 将所有依赖加入到graphArray中
  for (let i = 0; i < graphArray.length; i++) {
    const { deps } = graphArray[i];
    for (const j in deps) {
      const depModule = parseFile(deps[j]);
      graphArray.push(depModule);
    }
  }

  // 生成依赖图谱
  const graph: Graph = {};
  graphArray.forEach(({ code, deps, filename }) => {
    graph[filename] = { code, deps };
  });

  return graph;
}
