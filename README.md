# Mono Editor

一款基于 React 的、块级风格的、Markdown 友好的，富文本编辑器。

# 动机即特性

- 开发者视角
  - 需要开源
  - 需要能自定义众多的行内组件和 Block 组件
    - 比如行内公式、at、link...
    - 比如 Notion 或者 yuque 的各种 Card
- 笔记软件视角
  - 需要一个 Block-Style 的编辑器
  - 需要能支撑 Block 级别的双链
- 使用者视角
  - 需要有文本编辑器编辑 Markdown 一样的丝滑体验，不需要担心富文本的格式边界
  - 需要丰富的富文本类型支持，加粗、斜体、下划线删除线、高亮、code...

## Features

- 是富文本编辑器：各类 Markdown 编辑器中会出现的编辑时的图片显示
- 是块级粒度的编辑器：总之就是块级粒度的编辑器。
- Markdown-style：通过边界提示（RichHint），即在格式边界添加 Markdown-like 的格式提示，绕过了一般富文本无法解决的边界格式问题（比如在加粗文本旁无法追加普通文本）。
- 丰富的 Block 类型：
  - Paragraph、Blockquote、Heading
  - List、Ordered List、TODO List
  - Table
  - Code、Image
  - [ ] File、...
- 丰富的 Inline Element 类型：
  - 各种富文本格式：加粗（b）、下划线（u）、删除线（s）、行内代码（code）、高亮（em）
  - 各种行内组件：图片、链接、公式
  - [ ] 艾特 / 双链
- 开发者友好的扩展模式：React + Typescript 开发，每一种 Block 都是一个继承抽象类 ABCBlock 的实现，每一类特殊的 Inline Element 都是一个继承抽象类 ABCInline 的实现，可以轻松定义新类型、或者覆盖重写某个 Block 类。
- [ ] 灵活的双链支持
- [ ] 更多...

## Development

```shell
git clone https://github.com/spaced-all/MoEditor
cd MoEditor
npm run start
```

## Demo

![](latest.png)

# 鸣谢

- [floating-ui](https://github.com/floating-ui/floating-ui/): 右键菜单，行内公式的编辑，Heading 的左侧提示，在 floating-ui 的支持下都可以很简单的实现。
- [Danfo.js](https://github.com/javascriptdata/danfojs): 提供了 js 上和 Python.pandas 类似的 DataFrame 类，用于表格支持
- [vditor](https://github.com/Vanessa219/vditor): 感谢 vditor 提供的灵感
- [editorjs.io](https://github.com/codex-team/editor.js): 感谢 editorjs.io 提供的灵感，以及适配到 React 上的困难，让我萌生了自己写一款的想法（
- [语雀](https://www.yuque.com/)：单论编辑器，语雀雀实可以看成编辑器的天花板，开发过程中的一些编辑器行为和操作习惯都参考了语雀

# 其他 Editor

如果你不满，那么下面是我发现的其他高星 editor：

- https://github.com/ianstormtaylor/slate
-

# 交流地点

- 欢迎用 issue & pr 提出任意优化建议/需求
- QQ 群：424957747
