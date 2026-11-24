'use strict';

module.exports = (hexo) => {
  if (hexo.theme.has_hello) {
    return;
  }

  hexo.log.info('AsterXu Theme');

  hexo.theme.has_hello = true;
};
