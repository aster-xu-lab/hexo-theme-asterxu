'use strict';

const objUtil = require('../../utils/object');
const { isNotEmptyObject } = require('../../utils/object');

module.exports = (hexo) => {
  const isZh = hexo.theme.i18n.languages[0].search(/zh-CN/i) !== -1;

  let dataConfig = {};
  let dataStaticConfig = {};

  if (hexo.locals.get instanceof Function) {
    const data = hexo.locals.get('data');
    const themeOverrides = data && data.asterxu_config;
    const staticOverrides = data && data.asterxu_static_prefix;
    if (isNotEmptyObject(themeOverrides)) {
      dataConfig = themeOverrides;
    }
    if (isNotEmptyObject(staticOverrides)) {
      dataStaticConfig = staticOverrides;
    }

    const { language } = hexo.config;
    const { i18n } = hexo.theme;
    const langConfigMap = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (/^languages\/.+$/.test(key)) {
          langConfigMap[key.replace('languages/', '')] = data[key];
        }
      }
    }
    if (isNotEmptyObject(langConfigMap)) {
      const mergeLang = (lang) => {
        if (langConfigMap[lang]) {
          i18n.set(lang, objUtil.merge({}, i18n.get([lang]), langConfigMap[lang]));
        }
      };
      if (Array.isArray(language)) {
        for (const lang of language) {
          mergeLang(lang);
        }
      } else {
        mergeLang(language);
      }
      if (isZh) {
        hexo.log.debug('[AsterXu] 读取 source/_data/languages/*.yml 文件覆盖语言配置');
      } else {
        hexo.log.debug('[AsterXu] Merge language config from source/_data/languages/*.yml');
      }
    }
  }

  if (isNotEmptyObject(hexo.config.theme_config)) {
    hexo.theme.config = objUtil.merge({}, hexo.theme.config, hexo.config.theme_config);
    if (isZh) {
      hexo.log.debug('[AsterXu] 读取 _config.yml 中 theme_config 配置项覆盖主题配置');
    } else {
      hexo.log.debug('[AsterXu] Merge theme config from theme_config in _config.yml');
    }
  }

  if (isNotEmptyObject(dataStaticConfig)) {
    hexo.theme.config.static_prefix = objUtil.merge({}, hexo.theme.config.static_prefix, dataStaticConfig);
    if (isZh) {
      hexo.log.debug('[AsterXu] 读取 source/_data/asterxu_static_prefix.yml 文件覆盖主题配置');
    } else {
      hexo.log.debug('[AsterXu] Merge theme config from source/_data/asterxu_static_prefix.yml');
    }
  }

  if (isNotEmptyObject(dataConfig)) {
    hexo.theme.config = objUtil.merge({}, hexo.theme.config, dataConfig);
    if (isZh) {
      hexo.log.debug('[AsterXu] 读取 source/_data/asterxu_config.yml 文件覆盖主题配置');
    } else {
      hexo.log.debug('[AsterXu] Merge theme config from source/_data/asterxu_config.yml');
    }
  }

  hexo.log.debug('[AsterXu] Output theme config:\n', JSON.stringify(hexo.theme.config, undefined, 2));
};
