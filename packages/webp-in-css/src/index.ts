import { Declaration, PluginCreator, Rule } from 'postcss';

interface Options {
  noWebpClass: string;
  webpClass: string;
  rename: (oldName: string) => string;
  imgReg: RegExp;
}

const IMG_REG = /\.(jpe?g|png)/i;
const IMG_REG_GLOBAL = /\.(jpe?g|png)/gi;

const defaultOptions: Options = {
  noWebpClass: 'no-webp',
  webpClass: 'webp',
  imgReg: IMG_REG,
  rename: (oldName: string) => oldName.replace(IMG_REG_GLOBAL, '.webp'),
};

const webpInCss: PluginCreator<Partial<Options>> = opts => {
  const { noWebpClass, webpClass, imgReg, rename } = {
    ...defaultOptions,
    ...opts,
  };

  return {
    postcssPlugin: 'postcss-webp-in-css',
    Declaration(decl) {
      // 不含图片的声明直接跳过
      if (!imgReg.test(decl.value)) {
        return;
      }

      const rule = decl.parent as Rule;
      // 对于不需要替换为webp格式的声明直接返回
      if (rule.selector.includes(noWebpClass)) {
        return;
      }

      const webp = rule?.cloneAfter();
      // @ts-expect-error
      webp.each((d: Declaration) => {
        if (d.prop === decl.prop && d.value === decl.value) {
          d.value = rename(d.value);
        } else {
          d.remove();
        }
      });
      webp.selectors = webp.selectors.map(
        selector => `.${webpClass} ${selector}`,
      );
    },
  };
};

webpInCss.postcss = true;

export default webpInCss;
