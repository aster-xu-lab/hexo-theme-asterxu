# AsterXu Theme

带本地搜索、深色模式和响应式文章目录的 Hexo 主题。首版安装验收使用 Hexo 8 和 Node.js 26。

## 安装

在已经可以构建的 Hexo 8 站点根目录执行：

```sh
git clone https://github.com/aster-xu-lab/hexo-theme-asterxu.git themes/asterxu
```

在站点的 `_config.yml` 中启用主题：

```yaml
theme: asterxu
```

执行 `npx hexo generate` 生成站点，或执行 `npx hexo server` 本地预览。使用 Hexo 8 的标准归档、分类和标签生成器，以及 EJS、Marked 和 Stylus 渲染器。首次从其他主题切换时，可先执行 `npx hexo clean` 刷新生成物。

## 可选配置

将覆盖项放在站点根目录的 `_config.asterxu.yml`。默认显示站点标题、简介和最近文章。搜索及基础样式使用主题随附的资源。

- `navbar.github` 显示 GitHub 按钮。
- 需要关于页时，创建一个使用 `layout: about` 的 Hexo 页面，并在 `navbar.menu` 中添加对应路径。`about.name` 设置姓名，页面 front matter 的 `lead` 设置简介。
- 可在 `source/_data/home.yml` 中配置 `hero`（`title`、`eyebrow`、`lead`）、`featured`（文章 `path`、`pitch`、可选 `series`）和 `about`（`paragraphs` 和可选的 `link.path`、`link.label`）。
- 已有系列生成器的站点可以用 `home.series_path` 指定已存在的导读入口，`source/_data/series.yml` 提供 `groups` 和 `series`，组简介可用 `home_note`。文章回链可由站点的 `series_for_post` 助手提供，返回系列名称和 ID。

## 本地验收

```sh
npm ci --prefix example
node test/installation.cjs
```

验收从当前 Git 提交克隆主题到两个临时 Hexo 站点，分别验证根路径和项目子路径。示例内容只用于验收。

## 许可证

GPLv3 许可及原始版权声明见 [LICENSE](LICENSE)。AsterXu 于 2026-11-24 更新主题品牌和独立安装配置。
