import postcss from 'postcss';
import plugin from '../src';

test('simple', async () => {
  await run(
    `.img{background:url(../img/bg.png)}`,
    `.img{background:url(../img/bg.png)}.webp .img{background:url(../img/bg.webp)}`,
  );
});

test('no-webp', async () => {
  await run(
    `.no-webp .img{background:url(../img/bg.png)}
    .with-webp{background:url(../img/bg.png)}`,
    `.no-webp .img{background:url(../img/bg.png)}
    .with-webp{background:url(../img/bg.png)}
    .webp .with-webp{background:url(../img/bg.webp)}`,
  );
});

async function run(input: string, output: string) {
  const result = await postcss([plugin]).process(input, { from: undefined });
  expect(result.css).toEqual(output);
  expect(result.warnings()).toHaveLength(0);
}
