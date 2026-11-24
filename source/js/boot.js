/* global AsterXuTheme */

AsterXuTheme.boot = {};

AsterXuTheme.boot.registerEvents = function() {
  AsterXuTheme.events.billboard();
  AsterXuTheme.events.registerNavbarEvent();
  AsterXuTheme.events.registerParallaxEvent();
  AsterXuTheme.events.registerScrollDownArrowEvent();
  AsterXuTheme.events.registerScrollTopArrowEvent();
  AsterXuTheme.events.registerImageLoadedEvent();
};

AsterXuTheme.boot.refresh = function() {
  AsterXuTheme.plugins.fancyBox();
  AsterXuTheme.plugins.codeWidget();
  AsterXuTheme.events.refresh();
};

document.addEventListener('DOMContentLoaded', function() {
  AsterXuTheme.boot.registerEvents();
});
