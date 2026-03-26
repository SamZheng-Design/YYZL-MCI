/**
 * ZLC Pagination Utility — Phase 2B
 * Reusable pagination component for all list pages.
 * Usage:
 *   var pager = new ZlcPagination({
 *     container: '#my-list',
 *     pagerContainer: '#my-pager',
 *     endpoint: '/api/data/members',
 *     params: { status: 'active' },
 *     limit: 20,
 *     renderItem: function(item, index) { return '<div>...</div>'; },
 *     renderEmpty: function() { return '<div>No data</div>'; },
 *     onLoad: function(result) { // { data, total, page, limit, totalPages } },
 *     skeleton: '<div class="animate-pulse">...</div>',
 *   });
 *   pager.load(1);
 *   pager.setParams({ search: 'xxx' }); // resets to page 1
 */
(function () {
  'use strict';

  // ── Skeleton templates ──
  var SKELETON_CARD = '<div style="margin:8px 16px;background:white;border-radius:14px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);" class="animate-pulse">'
    + '<div style="display:flex;gap:14px;align-items:center;">'
    + '<div style="width:48px;height:48px;border-radius:50%;background:#F5F5F4;flex-shrink:0;"></div>'
    + '<div style="flex:1;">'
    + '<div style="height:14px;background:#F5F5F4;border-radius:6px;width:40%;margin-bottom:8px;"></div>'
    + '<div style="height:10px;background:#F5F5F4;border-radius:4px;width:60%;"></div>'
    + '</div></div></div>';

  var SKELETON_ROW = '<div style="padding:12px 0;border-bottom:1px solid #F5F5F4;" class="animate-pulse">'
    + '<div style="display:flex;gap:8px;align-items:center;">'
    + '<div style="width:28px;height:28px;border-radius:6px;background:#F5F5F4;flex-shrink:0;"></div>'
    + '<div style="flex:1;">'
    + '<div style="height:12px;background:#F5F5F4;border-radius:4px;width:50%;margin-bottom:6px;"></div>'
    + '<div style="height:10px;background:#F5F5F4;border-radius:4px;width:35%;"></div>'
    + '</div></div></div>';

  window.ZLC_SKELETON = {
    card: function (n) { var s = ''; for (var i = 0; i < (n || 3); i++) s += SKELETON_CARD; return s; },
    row: function (n) { var s = ''; for (var i = 0; i < (n || 5); i++) s += SKELETON_ROW; return s; },
  };

  function ZlcPagination(opts) {
    this.container = typeof opts.container === 'string' ? document.querySelector(opts.container) : opts.container;
    this.pagerContainer = typeof opts.pagerContainer === 'string' ? document.querySelector(opts.pagerContainer) : opts.pagerContainer;
    this.endpoint = opts.endpoint;
    this.params = opts.params || {};
    this.limit = opts.limit || 20;
    this.renderItem = opts.renderItem;
    this.renderEmpty = opts.renderEmpty || function () {
      return '<div style="text-align:center;padding:40px 20px;"><div style="font-size:48px;color:#D6D3D1;margin-bottom:8px;">📭</div><p style="font-size:14px;color:#A8A29E;">暂无数据</p></div>';
    };
    this.onLoad = opts.onLoad || null;
    this.onError = opts.onError || null;
    this.skeleton = opts.skeleton || ZLC_SKELETON.card(3);
    this.currentPage = 1;
    this.totalPages = 1;
    this.total = 0;
    this._abortCtrl = null;
    this._loading = false;
    // summary renderer (e.g. show "共 43 位学员")
    this.renderSummary = opts.renderSummary || null;
    // optional: extra data to pass through
    this.extraData = opts.extraData || null;
  }

  ZlcPagination.prototype.load = function (page) {
    if (this._loading && this._abortCtrl) {
      this._abortCtrl.abort();
    }
    this._loading = true;
    this.currentPage = page || 1;

    // Show skeleton
    if (this.container) this.container.innerHTML = this.skeleton;
    if (this.pagerContainer) this.pagerContainer.innerHTML = '';

    // Build URL
    var url = this.endpoint + '?page=' + this.currentPage + '&limit=' + this.limit;
    var params = this.params;
    for (var key in params) {
      if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== '' && params[key] !== null) {
        url += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      }
    }

    this._abortCtrl = new AbortController();
    var self = this;

    fetch(url, { signal: this._abortCtrl.signal })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        self._loading = false;
        if (!res.ok) {
          if (self.container) self.container.innerHTML = '<div style="text-align:center;padding:40px;color:#DC2626;font-size:14px;">加载失败: ' + (res.error || '未知错误') + '</div>';
          return;
        }

        self.total = res.total || 0;
        self.totalPages = res.totalPages || 1;
        self.currentPage = res.page || 1;

        // Callback
        if (self.onLoad) self.onLoad(res);

        // Render items
        if (!res.data || res.data.length === 0) {
          if (self.container) self.container.innerHTML = self.renderEmpty();
        } else {
          var html = '';
          res.data.forEach(function (item, idx) {
            html += self.renderItem(item, idx, res);
          });
          // Summary
          if (self.renderSummary) {
            html += self.renderSummary(self.total, self.currentPage, self.totalPages);
          }
          if (self.container) self.container.innerHTML = html;
        }

        // Render pager
        if (self.pagerContainer && self.totalPages > 1) {
          self.pagerContainer.innerHTML = self._renderPager();
          self._bindPagerEvents();
        }
      })
      .catch(function (err) {
        self._loading = false;
        if (err.name === 'AbortError') return;
        console.error('[Pagination] fetch error:', err);
        if (self.onError) self.onError(err);
        if (self.container) self.container.innerHTML = '<div style="text-align:center;padding:40px;color:#DC2626;font-size:14px;">网络错误，请重试</div>';
      });
  };

  ZlcPagination.prototype.setParams = function (newParams) {
    for (var key in newParams) {
      if (newParams.hasOwnProperty(key)) {
        this.params[key] = newParams[key];
      }
    }
    this.load(1);
  };

  ZlcPagination.prototype.refresh = function () {
    this.load(this.currentPage);
  };

  ZlcPagination.prototype._renderPager = function () {
    var p = this.currentPage, tp = this.totalPages;
    var h = '<div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:16px 0;flex-wrap:wrap;">';

    // Previous button
    h += '<button class="zlc-page-btn" data-page="' + (p - 1) + '" ' + (p <= 1 ? 'disabled' : '') + ' style="padding:6px 12px;border-radius:8px;border:1px solid ' + (p <= 1 ? '#E7E5E4' : '#D6D3D1') + ';background:white;color:' + (p <= 1 ? '#D6D3D1' : '#44403C') + ';font-size:13px;cursor:' + (p <= 1 ? 'default' : 'pointer') + ';">'
      + '<i class="fas fa-chevron-left" style="font-size:10px;"></i></button>';

    // Page numbers — show max 5 pages with ellipsis
    var pages = this._getPageNumbers(p, tp);
    pages.forEach(function (pg) {
      if (pg === '...') {
        h += '<span style="padding:6px 4px;color:#A8A29E;font-size:13px;">...</span>';
      } else {
        var isActive = pg === p;
        h += '<button class="zlc-page-btn" data-page="' + pg + '" style="min-width:36px;padding:6px 10px;border-radius:8px;border:1px solid ' + (isActive ? '#B91C1C' : '#E7E5E4') + ';background:' + (isActive ? '#B91C1C' : 'white') + ';color:' + (isActive ? 'white' : '#44403C') + ';font-size:13px;font-weight:' + (isActive ? '600' : '400') + ';cursor:pointer;">' + pg + '</button>';
      }
    });

    // Next button
    h += '<button class="zlc-page-btn" data-page="' + (p + 1) + '" ' + (p >= tp ? 'disabled' : '') + ' style="padding:6px 12px;border-radius:8px;border:1px solid ' + (p >= tp ? '#E7E5E4' : '#D6D3D1') + ';background:white;color:' + (p >= tp ? '#D6D3D1' : '#44403C') + ';font-size:13px;cursor:' + (p >= tp ? 'default' : 'pointer') + ';">'
      + '<i class="fas fa-chevron-right" style="font-size:10px;"></i></button>';

    // Page info
    h += '<span style="font-size:12px;color:#A8A29E;margin-left:8px;">' + p + '/' + tp + ' · 共' + this.total + '条</span>';
    h += '</div>';
    return h;
  };

  ZlcPagination.prototype._getPageNumbers = function (current, total) {
    if (total <= 7) {
      var arr = [];
      for (var i = 1; i <= total; i++) arr.push(i);
      return arr;
    }
    var pages = [1];
    if (current > 3) pages.push('...');
    var start = Math.max(2, current - 1);
    var end = Math.min(total - 1, current + 1);
    for (var j = start; j <= end; j++) pages.push(j);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  };

  ZlcPagination.prototype._bindPagerEvents = function () {
    var self = this;
    if (!this.pagerContainer) return;
    var btns = this.pagerContainer.querySelectorAll('.zlc-page-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pg = parseInt(btn.dataset.page);
        if (isNaN(pg) || pg < 1 || pg > self.totalPages || pg === self.currentPage) return;
        self.load(pg);
        // Scroll container into view
        if (self.container) {
          self.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  };

  // Expose globally
  window.ZlcPagination = ZlcPagination;

})();
