# tailwindcss-postcss-px-to-rem

一个专为 Tailwind CSS 设计的 PostCSS 插件，用于将 CSS 中的 px 单位自动转换为 rem 单位，支持 Tailwind 工具类、方括号语法和自定义值的处理。

## 特性

- 🎯 **专为 Tailwind CSS 优化** - 完美支持 Tailwind 工具类和自定义值语法，包括 `w-[16px]`、`[margin-top:8px]` 等
- 🔧 **智能转换** - 自动处理所有 px，包括选择器方括号、普通工具类、媒体查询、CSS 属性值
- ⚙️ **灵活配置** - 支持多种配置选项，满足不同项目需求
- 🚫 **精确排除** - 支持排除特定类名和 1px 值
- 📱 **响应式支持** - 处理 Tailwind 响应式断点
- 🎨 **高精度** - 可配置转换精度，且自动去除多余 0（如 1.0000rem -> 1rem）

## 安装

```bash
npm install tailwindcss-postcss-px-to-rem --save-dev
```

## 基本使用

### PostCSS 配置

在你的 `postcss.config.js` 文件中添加插件：

```javascript
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('tailwindcss-postcss-px-to-rem'),
    require('autoprefixer'),
  ],
}
```

### Tailwind CSS 配置

在你的 `tailwind.config.js` 中确保插件在 PostCSS 处理之前运行：

```javascript
module.exports = {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 配置选项

插件支持以下配置选项（与 index.ts 保持一致）：

```javascript
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('tailwindcss-postcss-px-to-rem')({
      rootValue: 16,                 // 根元素字体大小，默认 16
      excludeOnePx: true,            // 是否排除 1px，默认 true
      unitPrecision: 4,              // 转换后 rem 值的精度，默认 4
      includeTailwindClasses: true,  // 是否处理 Tailwind 工具类，默认 true
      includeCSSModules: true,       // 是否处理 CSS Modules，默认 true
      classFilter: undefined,        // 自定义类名过滤函数
    }),
    require('autoprefixer'),
  ],
}
```

### 配置选项详解

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `rootValue` | `number` | `16` | 根元素字体大小，用于计算 rem 值 |
| `excludeOnePx` | `boolean` | `true` | 是否排除 1px 值的转换 |
| `unitPrecision` | `number` | `4` | 转换后 rem 值的小数位数（多余 0 会自动去除）|
| `includeTailwindClasses` | `boolean` | `true` | 是否处理 Tailwind 工具类（含方括号语法）|
| `includeCSSModules` | `boolean` | `true` | 是否处理 CSS Modules |
| `classFilter` | `(className: string) => boolean` | `undefined` | 自定义类名过滤函数，返回 true 则跳过 |

## 使用示例

### 基本转换

**输入 CSS：**
```css
.container {
  width: 320px;
  height: 240px;
  margin: 20px;
  padding: 16px;
}
```

**输出 CSS：**
```css
.container {
  width: 20rem;
  height: 15rem;
  margin: 1.25rem;
  padding: 1rem;
}
```

### Tailwind 方括号语法/工具类转换

**输入 HTML：**
```html
<div class="w-[50px] text-[16px] p-[20px]"></div>
```

**输出 CSS：**
```css
.w-[3.125rem] {
  width: 3.125rem;
}
.text-[1rem] {
  font-size: 1rem;
}
.p-[1.25rem] {
  padding: 1.25rem;
}
```

**复杂方括号表达式：**
```html
<div class="[&>*]:[margin-top:16px][padding:8px]"></div>
```

**输出 CSS：**
```css
[&>*]:[margin-top:1rem][padding:0.5rem] {
  ...
}
```

### 普通工具类转换

**输入 HTML：**
```html
<div class="text-16px margin-20px"></div>
```

**输出 CSS：**
```css
.text-1rem {
  font-size: 1rem;
}
.margin-1.25rem {
  margin: 1.25rem;
}
```

### 排除 1px 和自定义过滤

```javascript
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('tailwindcss-postcss-px-to-rem')({
      excludeOnePx: true,
      classFilter: (className) => className.includes('no-rem'),
    }),
    require('autoprefixer'),
  ],
}
```

**输入 CSS：**
```css
.test { font-size: 16px; }
.no-rem { font-size: 16px; }
```

**输出 CSS：**
```css
.test { font-size: 1rem; }
.no-rem { font-size: 16px; }
```

### 自定义根元素字体大小

```javascript
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('tailwindcss-postcss-px-to-rem')({
      rootValue: 14, // 使用 14px 作为根元素字体大小
    }),
    require('autoprefixer'),
  ],
}
```

**输入 CSS：**
```css
.text { font-size: 14px; }
```

**输出 CSS：**
```css
.text { font-size: 1rem; }
```

## 响应式断点处理

插件会自动处理 Tailwind 的响应式断点：

**输入 CSS：**
```css
@media (min-width: 640px) {
  .container { width: 320px; }
}
```

**输出 CSS：**
```css
@media (min-width: 40rem) {
  .container { width: 20rem; }
}
```

## 注意事项

1. **1px 处理**：默认情况下，1px 值不会被转换，因为通常用于边框等需要保持像素精度的场景。
2. **精度控制**：使用 `unitPrecision` 选项控制转换后的小数位数，插件会自动去除多余的 0。
3. **类名排除**：可用 `classFilter` 自定义过滤逻辑。
4. **性能考虑**：插件会处理所有 CSS 规则，建议在生产环境中使用。

## 测试

运行测试：

```bash
npm test
```

## 许可证

MIT

## 作者

yhsy

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0
- 初始版本发布
- 支持 Tailwind CSS 工具类和方括号语法转换
- 支持响应式断点处理
- 提供灵活的配置选项
- rem 精度自动去除多余 0
