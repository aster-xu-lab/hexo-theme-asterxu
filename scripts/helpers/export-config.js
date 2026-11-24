/* global hexo */

'use strict';

const urlJoin = require('../utils/url-join');

/**
 * Export theme config to js
 */
hexo.extend.helper.register('export_config', function () {
  let { config, theme, theme_version } = this;
  const exportConfig = {
    hostname: (URL.canParse(config.url) && new URL(config.url).hostname) || config.url,
    root: config.root,
    version: theme_version,
    typing: theme.fun_features.typing,
    anchorjs: theme.fun_features.anchorjs,
    progressbar: theme.fun_features.progressbar,
    code_language: theme.code.language,
    copy_btn: theme.code.copy_btn,
    image_caption: theme.post.image_caption,
    image_zoom: theme.post.image_zoom,
    toc: theme.post.toc,
    lazyload: theme.lazyload,
    web_analytics: theme.web_analytics,
    search_path: urlJoin(config.root, theme.search.path),
    include_content_in_search: theme.search.content,
  };
  return `<script id="theme-configs">
    var AsterXuTheme = window.AsterXuTheme || {};
    AsterXuTheme.ctx = Object.assign({}, AsterXuTheme.ctx)
    var CONFIG = ${JSON.stringify(exportConfig)};

    if (CONFIG.web_analytics.follow_dnt) {
      var dntVal = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
      AsterXuTheme.ctx.dnt = dntVal && (dntVal.startsWith('1') || dntVal.startsWith('yes') || dntVal.startsWith('on'));
    }
  </script>`;
});
