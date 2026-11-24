/* global hexo */

'use strict';

hexo.extend.generator.register('_hexo_generator_search', function(locals) {
  const config = this.theme.config;
  if (!config.search.enable) {
    return;
  }

  const nunjucks = require('nunjucks');
  const env = new nunjucks.Environment();
  const pathFn = require('path');
  const fs = require('fs');
  const { stripHTML, unescapeHTML } = require('hexo-util');

  env.addFilter('uriencode', function(str) {
    return encodeURI(str);
  });

  // 索引只保留可搜索的纯文本：去掉标签与脚本，块级标签补空格，压缩空白。
  env.addFilter('plainText', function(str) {
    if (!str) return '';
    let text = String(str)
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<\/(p|div|li|tr|h[1-6]|blockquote|pre|ul|ol|table|section|article|figure|figcaption|td|th)>/gi, ' ')
      .replace(/<br\s*\/?>/gi, ' ');
    text = unescapeHTML(stripHTML(text));
    text = text.replace(/&#(x?[0-9a-f]+);/gi, function(entity, code) {
      var point = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : parseInt(code, 10);
      var valid = point >= 0 && point <= 0x10FFFF && !(point >= 0xD800 && point <= 0xDFFF);
      return valid ? String.fromCodePoint(point) : entity;
    });
    // eslint-disable-next-line no-control-regex
    text = text.replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim();
    return text.replace(/]]>/g, ']]]]><![CDATA[>');
  });

  env.addFilter('urlJoin', function(str) {
    const base = str[0];
    const relative = str[1];
    return relative
      ? base.replace(/\/+$/, '') + '/' + relative.replace(/^\/+/, '')
      : base;
  });

  const searchTmplSrc = pathFn.join(hexo.theme_dir, 'scripts/generators/local-search.xml');
  const searchTmpl = nunjucks.compile(fs.readFileSync(searchTmplSrc, 'utf8'), env);

  const searchConfig = config.search;
  let searchField = searchConfig.field;
  const content = searchConfig.content && true;

  let posts, pages;

  if (searchField.trim() !== '') {
    searchField = searchField.trim();
    if (searchField === 'post') {
      posts = locals.posts.sort('-date');
    } else if (searchField === 'page') {
      pages = locals.pages;
    } else {
      posts = locals.posts.sort('-date');
      pages = locals.pages;
    }
  } else {
    posts = locals.posts.sort('-date');
  }

  const xml = searchTmpl.render({
    config : config,
    posts  : posts,
    pages  : pages,
    content: content,
    url    : hexo.config.root
  });

  return {
    path: searchConfig.generate_path || '/local-search.xml',
    data: xml
  };
});
