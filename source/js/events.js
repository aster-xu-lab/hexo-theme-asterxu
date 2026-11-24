/* global AsterXuTheme */

HTMLElement.prototype.wrap = function(wrapper) {
  this.parentNode.insertBefore(wrapper, this);
  this.parentNode.removeChild(this);
  wrapper.appendChild(this);
};

AsterXuTheme.events = {

  registerNavbarEvent: function() {
    var navbar = jQuery('#navbar');
    if (navbar.length === 0) {
      return;
    }
    var submenu = jQuery('#navbar .dropdown-menu');
    if (navbar.offset().top > 0) {
      navbar.removeClass('navbar-dark');
      submenu.removeClass('navbar-dark');
    }
    AsterXuTheme.utils.listenScroll(function() {
      navbar[navbar.offset().top > 50 ? 'addClass' : 'removeClass']('top-nav-collapse');
      submenu[navbar.offset().top > 50 ? 'addClass' : 'removeClass']('dropdown-collapse');
      if (navbar.offset().top > 0) {
        navbar.removeClass('navbar-dark');
        submenu.removeClass('navbar-dark');
      } else {
        navbar.addClass('navbar-dark');
        submenu.removeClass('navbar-dark');
      }
    });

    var mobileGridMenu = jQuery('#mobile-grid-menu');
    var navbarToggler = jQuery('#navbar-toggler-btn');
    var background = jQuery('body > main, body > footer');
    var searchModal = jQuery('#modalSearch');

    function setMobileGridMenu(open) {
      mobileGridMenu.toggleClass('show', open);
      mobileGridMenu.attr('aria-hidden', open ? 'false' : 'true');
      mobileGridMenu[0].inert = !open;
      background.prop('inert', open);
      navbarToggler.attr('aria-expanded', open ? 'true' : 'false');
      jQuery('.animated-icon').toggleClass('open', open);
      jQuery('body').toggleClass('mobile-menu-open', open);
      navbar.toggleClass('top-nav-collapse', open);
      if (open) {
        mobileGridMenu.find('a[href]').first().trigger('focus');
        // Apply staggered animation delays when opening
        mobileGridMenu.find('.mobile-grid-cell, .mobile-grid-group-header').each(function(i, el) {
          el.style.animationDelay = (i * 20) + 'ms';
        });
      }
    }

    navbarToggler.on('click', function() {
      var $this = jQuery(this);
      if ($this.data('animating')) {
        return;
      }
      $this.data('animating', true);

      // On mobile use grid menu; on desktop keep original collapse behavior
      if (window.innerWidth < 992) {
        var open = !mobileGridMenu.hasClass('show');
        setMobileGridMenu(open);
        if (!open) navbarToggler.trigger('focus');
      } else {
        jQuery('.animated-icon').toggleClass('open');
        jQuery('#navbar').toggleClass('navbar-col-show');
      }

      setTimeout(function() {
        $this.data('animating', false);
      }, 300);
    });

    // Close grid menu when a link inside it is clicked
    mobileGridMenu.on('click', 'a[href]:not([href="javascript:;"])', function() {
      setMobileGridMenu(false);
      navbarToggler.data('animating', false);
    });

    // Close grid menu on resize to desktop
    jQuery(window).on('resize', function() {
      if (window.innerWidth >= 992 && mobileGridMenu.hasClass('show')) {
        setMobileGridMenu(false);
      }
    });

    searchModal.on('show.bs.modal', function() {
      if (mobileGridMenu.hasClass('show')) {
        navbarToggler.trigger('focus');
        setMobileGridMenu(false);
      }
    });

    jQuery(document).on('keydown', function(e) {
      if (!mobileGridMenu.hasClass('show')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        navbarToggler.trigger('focus');
        setMobileGridMenu(false);
      } else if (e.key === 'Tab') {
        var links = mobileGridMenu.find('a[href]:visible');
        if (e.shiftKey && document.activeElement === navbarToggler[0]) {
          e.preventDefault();
          links.last().trigger('focus');
        } else if (!e.shiftKey && document.activeElement === links.last()[0]) {
          e.preventDefault();
          navbarToggler.trigger('focus');
        }
      }
    });
  },

  registerParallaxEvent: function() {
    var ph = jQuery('#banner[parallax="true"]');
    if (ph.length === 0) {
      return;
    }
    var board = jQuery('#board');
    if (board.length === 0) {
      return;
    }
    var parallax = function() {
      var pxv = jQuery(window).scrollTop() / 5;
      var offset = parseInt(board.css('margin-top'), 10);
      var max = 96 + offset;
      if (pxv > max) {
        pxv = max;
      }
      ph.css({
        transform: 'translate3d(0,' + pxv + 'px,0)'
      });
      var sideCol = jQuery('.side-col');
      if (sideCol) {
        sideCol.css({
          'padding-top': pxv + 'px'
        });
      }
    };
    AsterXuTheme.utils.listenScroll(parallax);
  },

  registerScrollDownArrowEvent: function() {
    var scrollbar = jQuery('.scroll-down-bar');
    if (scrollbar.length === 0) {
      return;
    }
    scrollbar.on('click', function() {
      AsterXuTheme.utils.scrollToElement('#board', -jQuery('#navbar').height());
    });
  },

  registerScrollTopArrowEvent: function() {
    var topArrow = jQuery('#scroll-top-button');
    if (topArrow.length === 0) {
      return;
    }
    var board = jQuery('#board');
    if (board.length === 0) {
      return;
    }
    var posDisplay = false;
    var scrollDisplay = false;
    // Position
    var setTopArrowPos = function() {
      var boardRight = board[0].getClientRects()[0].right;
      var bodyWidth = document.body.offsetWidth;
      var right = bodyWidth - boardRight;
      posDisplay = right >= 50;
      topArrow.css({
        'bottom': posDisplay && scrollDisplay ? '20px' : '-60px',
        'right' : right - 64 + 'px'
      });
    };
    setTopArrowPos();
    jQuery(window).resize(setTopArrowPos);
    // Display
    var headerHeight = board.offset().top;
    AsterXuTheme.utils.listenScroll(function() {
      var scrollHeight = document.body.scrollTop + document.documentElement.scrollTop;
      scrollDisplay = scrollHeight >= headerHeight;
      topArrow.css({
        'bottom': posDisplay && scrollDisplay ? '20px' : '-60px'
      });
    });
    // Click
    topArrow.on('click', function() {
      jQuery('body,html').animate({
        scrollTop: 0,
        easing   : 'swing'
      });
    });
  },

  registerImageLoadedEvent: function() {
    if (!('NProgress' in window)) { return; }

    var bg = document.getElementById('banner');
    if (bg) {
      var src = bg.style.backgroundImage;
      var url = src.match(/\((.*?)\)/)[1].replace(/(['"])/g, '');
      var img = new Image();
      img.onload = function() {
        window.NProgress && window.NProgress.status !== null && window.NProgress.inc(0.2);
      };
      img.src = url;
      if (img.complete) { img.onload(); }
    }

    var notLazyImages = jQuery('main img:not([lazyload])');
    var total = notLazyImages.length;
    for (const img of notLazyImages) {
      const old = img.onload;
      img.onload = function() {
        old && old();
        window.NProgress && window.NProgress.status !== null && window.NProgress.inc(0.5 / total);
      };
      if (img.complete) { img.onload(); }
    }
  },

  registerRefreshCallback: function(callback) {
    if (!Array.isArray(AsterXuTheme.events._refreshCallbacks)) {
      AsterXuTheme.events._refreshCallbacks = [];
    }
    AsterXuTheme.events._refreshCallbacks.push(callback);
  },

  refresh: function() {
    if (Array.isArray(AsterXuTheme.events._refreshCallbacks)) {
      for (var callback of AsterXuTheme.events._refreshCallbacks) {
        if (callback instanceof Function) {
          callback();
        }
      }
    }
  },

  billboard: function() {
    if (!('console' in window)) {
      return;
    }
    // eslint-disable-next-line no-console
    console.log('AsterXu Theme · Hexo');
  }
};
