import { types as t, PluginObj } from "@babel/core";

interface BabelPluginOptions {
  rootValue?: number;
  excludeOnePx?: boolean;
  unitPrecision?: number;
}

// src/babel-plugin.ts (部分代码)

function processTailwindClass(
  className: string,
  options: BabelPluginOptions
): string {
  // 处理方括号语法
  if (/\[.*?\]/.test(className)) {
    return className.replace(/\[([^\]]+)\]/g, (match, content) => {
      const processedContent = content.replace(pxRegex, (pxMatch, pxValue) => {
        const pixelValue = parseFloat(pxValue);

        if (options.excludeOnePx && pixelValue === 1) {
          return pxMatch;
        }

        const remValue = (pixelValue / (options.rootValue || 16)).toFixed(
          options.unitPrecision || 4
        );
        return `${remValue}rem`;
      });

      return `[${processedContent}]`;
    });
  }

  // 处理普通类名
  return className.replace(/-(\d+(?:\.\d+)?)px\b/g, (_, px) => {
    const pixelValue = parseFloat(px);
    if (options.excludeOnePx && pixelValue === 1) return `-${px}px`;

    const remValue = (pixelValue / (options.rootValue || 16)).toFixed(
      options.unitPrecision || 4
    );
    return `-${remValue}rem`;
  });
}

export default function ({ types: t }: { types: typeof t }): PluginObj {
  return {
    name: "transform-tailwind-px-to-rem",

    visitor: {
      // 处理静态className字符串
      StringLiteral(path, state) {
        const {
          excludeOnePx = true,
          rootValue = 16,
          unitPrecision = 4,
        } = state.opts || {};

        if (
          path.parent.type === "JSXAttribute" &&
          path.parent.name.name === "className"
        ) {
          const newValue = processTailwindClass(path.node.value, {
            excludeOnePx,
            rootValue,
            unitPrecision,
          });

          if (newValue !== path.node.value) {
            path.replaceWith(t.stringLiteral(newValue));
          }
        }
      },

      // 处理模板字符串
      TemplateLiteral(path, state) {
        const {
          excludeOnePx = true,
          rootValue = 16,
          unitPrecision = 4,
        } = state.opts || {};

        if (
          path.parent.type === "JSXAttribute" &&
          path.parent.name.name === "className"
        ) {
          path.node.quasis.forEach((quasi) => {
            if (quasi.value.raw) {
              quasi.value.raw = processTailwindClass(quasi.value.raw, {
                excludeOnePx,
                rootValue,
                unitPrecision,
              });
              quasi.value.cooked = quasi.value.raw;
            }
          });
        }
      },
    },
  };
}
