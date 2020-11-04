import { updateMarkdownContent } from './helpers';

(async () => {
  await updateMarkdownContent(updateContentPath);
})();

const assetReg = /!\[\]\((.+)\)/g;
const mdReg = /\(\W*(\w+\.md)\)/g;
function updateContentPath(content: string, packageName: string) {
  return content
    .replace(
      assetReg,
      (_, p1: string) => `![](${p1.replace(/^.*assets\//, 'assets/')})`,
    )
    .replace(
      mdReg,
      (_, p1: string) =>
        `(https://github.com/heiseshandian/personal-docs/blob/HEAD/packages/${packageName}/${p1})`,
    );
}
