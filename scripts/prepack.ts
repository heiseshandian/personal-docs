import { updateMarkdownContent } from './helpers';

(async () => {
  await updateMarkdownContent(updateAssetsPath);
})();

function updateAssetsPath(content: string) {
  return content.replace(
    /!\[\]\((.+)\)/g,
    (_, p1: string) => `![](${p1.replace(/^.*assets\//, 'assets/')})`,
  );
}
