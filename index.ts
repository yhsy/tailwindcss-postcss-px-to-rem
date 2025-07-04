// import { Plugin } from "postcss";

export interface PxToRemOptions {
  rootValue?: number; // 根元素字体大小，默认16px
  excludeOnePx?: boolean; // 是否排除1px，默认true
  unitPrecision?: number; // REM精度，默认4位小数
  includeTailwindClasses?: boolean; // 是否处理Tailwind类名，默认true
  includeCSSModules?: boolean; // 是否处理CSS Modules，默认true
  classFilter?: (className: string) => boolean; // 自定义类名过滤函数
}

const pxRegex = /(\d*\.?\d+)px/;

function processValue(value: string, options: PxToRemOptions): string {
  if (!pxRegex.test(value)) return value;

  return value.replace(pxRegex, (match: string, px: string) => {
    const pixelValue = parseFloat(px);

    // 排除1px或自定义过滤
    if (
      (options.excludeOnePx && pixelValue === 1) ||
      (options.classFilter && options.classFilter(match))
    ) {
      return match;
    }

    // 转换为REM并应用精度
    const remValue = parseFloat(
      (pixelValue / (options.rootValue || 16)).toFixed(
        options.unitPrecision || 4
      )
    );
    return `${remValue}rem`;
  });
}

// 处理Tailwind类名中的px
function processTailwindClass(
  className: string,
  options: PxToRemOptions
): string {
  // 处理方括号语法如 w-[50px], [&>*]:[margin-top:16px]
  if (/\[.*?\]/.test(className)) {
    return className.replace(
      /\[([^\]]+)\]/g,
      (match: string, content: string) => {
        // 处理方括号内的所有px值
        const processedContent = content.replace(
          pxRegex,
          (pxMatch: string, pxValue: string) => {
            const pixelValue = parseFloat(pxValue);

            // 排除1px或自定义过滤
            if (
              (options.excludeOnePx && pixelValue === 1) ||
              (options.classFilter && options.classFilter(pxMatch))
            ) {
              return pxMatch;
            }

            // 转换为REM
            const remValue = parseFloat(
              (pixelValue / (options.rootValue || 16)).toFixed(
                options.unitPrecision || 4
              )
            );
            return `${remValue}rem`;
          }
        );

        return `[${processedContent}]`;
      }
    );
  }

  // 处理普通类名如 text-16px
  if (/(\-(\d+(?:\.\d+)?)px$)/.test(className)) {
    return processValue(className, options);
  }

  return className;
}

// 主插件函数
const pxToRem = (options: PxToRemOptions = {}) => {
  const config: PxToRemOptions = {
    rootValue: 16,
    excludeOnePx: true,
    unitPrecision: 4,
    includeTailwindClasses: true,
    includeCSSModules: true,
    ...options,
  };

  return {
    postcssPlugin: "postcss-tailwind-px-to-rem",

    // 处理CSS规则
    Rule(rule: any) {
      if (config.includeTailwindClasses && rule.selector.includes("[")) {
        rule.selector = rule.selector.replace(
          /\[([^\]]+)\]/g,
          (match: string, content: string) => {
            // 处理方括号内的所有px值
            const processedContent = content.replace(
              pxRegex,
              (pxMatch: string, pxValue: string) => {
                const pixelValue = parseFloat(pxValue);

                if (
                  (config.excludeOnePx && pixelValue === 1) ||
                  (config.classFilter && config.classFilter(pxMatch))
                ) {
                  return pxMatch;
                }

                const remValue = parseFloat(
                  (pixelValue / (config.rootValue || 16)).toFixed(
                    config.unitPrecision || 4
                  )
                );
                return `${remValue}rem`;
              }
            );

            return `[${processedContent}]`;
          }
        );
      }
      // 处理普通类名
      if (config.includeTailwindClasses && rule.selector.startsWith(".")) {
        rule.selector = rule.selector
          .split(",")
          .map((selector: string) => {
            return selector.replace(
              /\.[^\s,.#:[>+~]+/g,
              (className: string) => {
                if (className === ".") return className;
                return `.${processTailwindClass(className.slice(1), config)}`;
              }
            );
          })
          .join(",");
      }
    },

    // 处理CSS值
    Declaration(decl: any) {
      decl.value = processValue(decl.value, config);
    },

    // 处理媒体查询
    AtRule(atRule: any) {
      if (atRule.name === "media") {
        atRule.params = processValue(atRule.params, config);
      }
    },
  };
};

pxToRem.postcss = true;
export default pxToRem;
