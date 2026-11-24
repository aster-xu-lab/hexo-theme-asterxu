/* global CONFIG */

(function() {
  'use strict';

  var searchSelector = '#local-search-input';
  var resultSelector = '#local-search-result';
  var modal = jQuery('#modalSearch');
  var $input = jQuery(searchSelector);
  var $result = jQuery(resultSelector);
  var $status = jQuery('#local-search-status');

  if ($input.length === 0) {
    // eslint-disable-next-line no-console
    throw Error('No element selected by the searchSelector');
  }
  if ($result.length === 0) {
    // eslint-disable-next-line no-console
    throw Error('No element selected by the resultSelector');
  }

  var dataList = null;
  var loading = false;
  var failed = false;
  var inputBound = false;
  var debounceTimer = null;
  var focusReturn = null;

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, function(ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch];
    });
  }

  function setStatus(text) {
    $status.text(text);
  }

  function showLoading() {
    setStatus('正在加载搜索索引');
    $result.html('<div class="m-auto text-center"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div><br/>Loading...</div>');
  }

  function showError() {
    setStatus('搜索索引加载失败');
    $result.html('<div class="m-auto text-center local-search-error" role="alert">搜索索引加载失败，请稍后重试。</div>');
  }

  function showEmpty(term) {
    setStatus('未找到相关的内容');
    $result.html('<div class="local-search-empty">未找到与「' + escapeHTML(term) + '」相关的内容</div>');
  }

  // 0x01. perform local searching with the cached index
  function performSearch() {
    var content = $input.val();
    if (content.trim().length <= 0) {
      $result.html('');
      setStatus('');
      $input.removeClass('invalid').removeClass('valid');
      return;
    }
    if (!dataList) {
      if (failed) {
        showError();
      }
      return;
    }

      var keywords = Array.from(new Set(content.trim().toLowerCase().split(/[\s-]+/).filter(Boolean)));
    if (!keywords.length) {
      $result.empty();
      setStatus('');
      $input.removeClass('invalid valid');
      return;
    }

    var highlight = new RegExp(keywords.slice().sort(function(a, b) {
      return b.length - a.length;
    }).map(escapeRegExp).join('|'), 'gi');
    var matches = [];

    dataList.forEach(function(data) {
      var title = data.title.trim() || 'Untitled';
      var body = data.content.trim();
      var lowerTitle = title.toLowerCase();
      var lowerBody = body.toLowerCase();
      var titleHits = 0;
      var firstBodyHit = Infinity;

      for (var keyword of keywords) {
        var inTitle = lowerTitle.includes(keyword);
        var inBody = lowerBody.indexOf(keyword);
        if (!inTitle && inBody < 0) return;
        if (inTitle) titleHits += 1;
        if (inBody >= 0) firstBodyHit = Math.min(firstBodyHit, inBody);
      }

      matches.push({ title: title, body: body, url: data.url, titleHits: titleHits, firstBodyHit: firstBodyHit });
    });

    // 搜索索引按发布日期倒序，稳定排序保留同等级文章的顺序。
    matches.sort(function(a, b) { return b.titleHits - a.titleHits; });
    var resultHTML = matches.map(function(match) {
      var link = '<a href="' + escapeHTML(match.url) + '" class="list-group-item list-group-item-action font-weight-bolder search-list-title">' + escapeHTML(match.title) + '</a>';
      if (!match.body) return link;

      var start = Number.isFinite(match.firstBodyHit) ? Math.max(0, match.firstBodyHit - 20) : 0;
      var excerpt = match.body.slice(start, start + 100);
      var marked = '';
      var cursor = 0;
      for (var found of excerpt.matchAll(highlight)) {
        marked += escapeHTML(excerpt.slice(cursor, found.index));
        marked += '<span class="search-word">' + escapeHTML(found[0]) + '</span>';
        cursor = found.index + found[0].length;
      }
      marked += escapeHTML(excerpt.slice(cursor));
      return link + '<p class="search-list-content">' + (start ? '…' : '') + marked +
        (start + excerpt.length < match.body.length ? '…' : '') + '</p>';
    }).join('');

    if (!matches.length) {
      showEmpty(content.trim());
      return $input.addClass('invalid').removeClass('valid');
    }
    $input.addClass('valid').removeClass('invalid');
    $result.html(resultHTML);
    setStatus('找到 ' + matches.length + ' 条结果');
  }

  // 0x04. load the index once and cache it
  function loadIndex(path, callback) {
    if (dataList) {
      callback();
      return;
    }
    if (loading) {
      return;
    }
    loading = true;
    failed = false;
    showLoading();
    jQuery.ajax({
      url: path,
      dataType: 'xml',
      timeout: 10000
    }).done(function(xmlResponse) {
      dataList = jQuery('entry', xmlResponse).map(function() {
        return {
          title: jQuery('title', this).text(),
          content: jQuery('content', this).text(),
          url: jQuery('url', this).text()
        };
      }).get();
      loading = false;
      $result.html('');
      callback();
    }).fail(function() {
      loading = false;
      failed = true;
      showError();
    });
  }

  function resultLinks() {
    return $result.find('a.search-list-title');
  }

  // 0x05. bind input once, debounce the query
  function bindInput() {
    if (inputBound) {
      return;
    }
    inputBound = true;
    $input.on('input', function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(performSearch, 200);
    });
    $input.on('keydown', function(event) {
      if (event.key !== 'ArrowDown') {
        return;
      }
      var $links = resultLinks();
      if (!$links.length) {
        return;
      }
      event.preventDefault();
      $links.first().focus();
    });
    $result.on('keydown', 'a.search-list-title', function(event) {
      var $links = resultLinks();
      var index = $links.index(this);
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        $links.eq(Math.min(index + 1, $links.length - 1)).focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (index <= 0) {
          $input.focus();
        } else {
          $links.eq(index - 1).focus();
        }
      }
    });
  }

  document.addEventListener('keydown', function(event) {
    if (event.isComposing || event.shiftKey || event.altKey || !(event.ctrlKey || event.metaKey)) {
      return;
    }
    if (String(event.key).toLowerCase() !== 'k') {
      return;
    }
    event.preventDefault();
    if (modal.hasClass('show')) {
      $input.focus();
      return;
    }
    modal.modal('show');
  });

  modal.on('show.bs.modal', function(event) {
    var opener = event.relatedTarget || document.activeElement;
    focusReturn = jQuery(opener).closest('#mobile-grid-menu').length
      ? document.getElementById('navbar-toggler-btn') : opener;
    bindInput();
    var path = CONFIG.search_path || '/local-search.xml';
    loadIndex(path, performSearch);
  });
  modal.on('shown.bs.modal', function() {
    $input.focus();
  });
  modal.on('hidden.bs.modal', function() {
    clearTimeout(debounceTimer);
    $input.val('').removeClass('invalid').removeClass('valid');
    $result.html('');
    setStatus('');
    if (focusReturn && focusReturn.isConnected && jQuery(focusReturn).is(':visible')) {
      focusReturn.focus();
    }
    focusReturn = null;
  });
})();
