# tailwindcss-postcss-px-to-rem

一个专为 Tailwind CSS 设计的 PostCSS 插件，用于将 CSS 中的 px 单位自动转换为 rem 单位，支持 Tailwind 工具类和自定义值的处理。

## 特性

- 🎯 **专为 Tailwind CSS 优化** - 完美支持 Tailwind 工具类和自定义值语法
- 🔧 **智能转换** - 自动处理 `w-[16px]` 等方括号语法和普通工具类
- ⚙️ **灵活配置** - 支持多种配置选项，满足不同项目需求
- 🚫 **精确排除** - 支持排除特定类名和 1px 值
- 📱 **响应式支持** - 处理 Tailwind 响应式断点
- 🎨 **高精度** - 可配置转换精度

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

插件支持以下配置选项：

```javascript
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('tailwindcss-postcss-px-to-rem')({
      rootValue: 16,             // 根元素字体大小，默认 16
      excludeOnePx: true,        // 是否排除 1px，默认 true
      unitPrecision: 4,          // 转换后 rem 值的精度，默认 4
      includeUtilities: true,    // 是否处理 Tailwind 工具类，默认 true
      includeComponents: true,   // 是否处理 Tailwind 组件，默认 true
      includeScreens: true,      // 是否处理 Tailwind 响应式断点，默认 true
      customUtilities: [],       // 自定义工具类前缀数组
      excludeClasses: [],        // 排除特定类名数组
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
| `unitPrecision` | `number` | `4` | 转换后 rem 值的小数位数 |
| `includeUtilities` | `boolean` | `true` | 是否处理 Tailwind 工具类 |
| `includeComponents` | `boolean` | `true` | 是否处理 Tailwind 组件 |
| `includeScreens` | `boolean` | `true` | 是否处理 Tailwind 响应式断点 |
| `customUtilities` | `string[]` | `[]` | 自定义工具类前缀数组 |
| `excludeClasses` | `(string\|RegExp)[]` | `[]` | 排除特定类名，支持字符串和正则表达式 |

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

### Tailwind 工具类转换

**输入 HTML：**
```html
<div class="w-[320px] h-[240px] text-[16px] p-[20px]"></div>
```

**输出 CSS：**
```css
.w-\[20rem\] {
  width: 20rem;
}
.h-\[15rem\] {
  height: 15rem;
}
.text-\[1rem\] {
  font-size: 1rem;
}
.p-\[1\.25rem\] {
  padding: 1.25rem;
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
.margin-1\.25rem {
  margin: 1.25rem;
}
```

### 排除特定类名

```javascript
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('tailwindcss-postcss-px-to-rem')({
      excludeClasses: ['.no-rem', /^\.exclude-/],
    }),
    require('autoprefixer'),
  ],
}
```

**输入 CSS：**
```css
.test { font-size: 16px; }
.no-rem { font-size: 16px; }
.exclude-test { width: 320px; }
```

**输出 CSS：**
```css
.test { font-size: 1rem; }
.no-rem { font-size: 16px; }
.exclude-test { width: 320px; }
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

2. **精度控制**：使用 `unitPrecision` 选项控制转换后的小数位数，避免过长的数值。

3. **类名排除**：使用 `excludeClasses` 选项排除不需要转换的类名，支持字符串匹配和正则表达式。

4. **性能考虑**：插件会处理所有 CSS 规则，建议在生产环境中使用。

## 测试

运行测试：

```bash
npm test
```

## 许可证

ISC

## 作者

fishku

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0
- 初始版本发布
- 支持 Tailwind CSS 工具类转换
- 支持方括号自定义值语法
- 支持响应式断点处理
- 提供灵活的配置选项
