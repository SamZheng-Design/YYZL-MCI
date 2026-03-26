// ═══════════════════════════════════════════════════════════════
// 中流通 SPA Router — Phase 2A
// Intercepts internal <a> clicks, fetches target page HTML,
// extracts #zlc-page-content, replaces current content.
// Keeps sidebar / topbar intact, updates sidebar highlight,
// re-executes scripts, handles popstate.
// ═══════════════════════════════════════════════════════════════
(function () {
  'use strict';

  // ── Config ──
  var CONTENT_ID = 'zlc-page-content';
  var PROGRESS_ID = 'zlc-spa-progress';
  var SKELETON_CLASS = 'zlc-spa-skeleton';

  // Routes that must do a full page load (no SPA)
  var FULL_RELOAD_PATHS = ['/login', '/guide'];

  // ── State ──
  var isNavigating = false;
  var currentAbort = null; // AbortController for in-flight fetch

  // ══════════════════════════════════════════════════
  // 1. Progress Bar
  // ══════════════════════════════════════════════════
  function getProgressBar() {
    var bar = document.getElementById(PROGRESS_ID);
    if (!bar) {
      bar = document.createElement('div');
      bar.id = PROGRESS_ID;
      bar.innerHTML = '<div class="zlc-spa-progress-inner"></div>';
      document.body.appendChild(bar);
    }
    return bar;
  }

  function showProgress() {
    var bar = getProgressBar();
    var inner = bar.querySelector('.zlc-spa-progress-inner');
    // Reset
    inner.style.transition = 'none';
    inner.style.width = '0%';
    inner.style.opacity = '1';
    bar.style.display = 'block';
    // Animate to 70% quickly
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        inner.style.transition = 'width 8s cubic-bezier(0.1,0.5,0.3,1)';
        inner.style.width = '70%';
      });
    });
  }

  function finishProgress() {
    var bar = getProgressBar();
    var inner = bar.querySelector('.zlc-spa-progress-inner');
    inner.style.transition = 'width 200ms ease-out';
    inner.style.width = '100%';
    setTimeout(function () {
      inner.style.transition = 'opacity 300ms ease';
      inner.style.opacity = '0';
      setTimeout(function () {
        bar.style.display = 'none';
        inner.style.width = '0%';
        inner.style.opacity = '1';
      }, 300);
    }, 200);
  }

  function hideProgress() {
    var bar = document.getElementById(PROGRESS_ID);
    if (bar) bar.style.display = 'none';
  }

  // ══════════════════════════════════════════════════
  // 2. Skeleton placeholder (shown while fetching)
  // ══════════════════════════════════════════════════
  function showSkeleton(container) {
    container.innerHTML =
      '<div class="' + SKELETON_CLASS + '" style="padding:16px;max-width:640px;margin:0 auto;">' +
        '<div class="animate-pulse" style="margin-bottom:16px;">' +
          '<div style="height:24px;background:#E7E5E4;border-radius:8px;width:45%;margin-bottom:12px;"></div>' +
          '<div style="height:14px;background:#F5F5F4;border-radius:4px;width:70%;margin-bottom:8px;"></div>' +
          '<div style="height:14px;background:#F5F5F4;border-radius:4px;width:55%;margin-bottom:20px;"></div>' +
        '</div>' +
        '<div class="animate-pulse" style="background:#fff;border-radius:16px;padding:20px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
          '<div style="height:18px;background:#F5F5F4;border-radius:6px;width:60%;margin-bottom:12px;"></div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">' +
            '<div><div style="height:24px;background:#F5F5F4;border-radius:6px;margin-bottom:6px;"></div><div style="height:10px;background:#F5F5F4;border-radius:4px;width:60%;"></div></div>' +
            '<div><div style="height:24px;background:#F5F5F4;border-radius:6px;margin-bottom:6px;"></div><div style="height:10px;background:#F5F5F4;border-radius:4px;width:60%;"></div></div>' +
            '<div><div style="height:24px;background:#F5F5F4;border-radius:6px;margin-bottom:6px;"></div><div style="height:10px;background:#F5F5F4;border-radius:4px;width:60%;"></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="animate-pulse" style="background:#fff;border-radius:16px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
          '<div style="height:16px;background:#F5F5F4;border-radius:6px;width:50%;margin-bottom:10px;"></div>' +
          '<div style="height:12px;background:#F5F5F4;border-radius:4px;width:80%;margin-bottom:6px;"></div>' +
          '<div style="height:12px;background:#F5F5F4;border-radius:4px;width:65%;"></div>' +
        '</div>' +
      '</div>';
  }

  // ══════════════════════════════════════════════════
  // 3. Sidebar / TopBar highlight update
  // ══════════════════════════════════════════════════
  function updateSidebarHighlight(path) {
    var navMenu = document.getElementById('ds-nav-menu');
    if (!navMenu) return;
    var links = navMenu.querySelectorAll('.ds-nav-item');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      var isActive = false;
      if (href === '/') {
        isActive = path === '/';
      } else if (href) {
        isActive = path === href || path.indexOf(href + '/') === 0;
      }
      if (isActive) {
        links[i].classList.add('ds-active');
      } else {
        links[i].classList.remove('ds-active');
      }
    }
  }

  function updateTopbarTitle(path) {
    var titleEl = document.getElementById('dt-page-title');
    if (!titleEl) return;
    var titleMap = {
      '/': '首页', '/projects': '项目大厅', '/create': '发起项目',
      '/repayments': '回款', '/profile': '我的', '/admin': '管理工作台',
      '/teacher': '我的班级', '/notifications': '通知中心',
      '/investments': '我的投资'
    };
    var pageTitle = titleMap[path];
    if (!pageTitle && path.indexOf('/projects/') === 0) pageTitle = '项目详情';
    if (!pageTitle && path.indexOf('/contract') === 0) pageTitle = '合同签署';
    if (!pageTitle && path.indexOf('/initiated') === 0) pageTitle = '收入报告';
    if (!pageTitle && path.indexOf('/share') === 0) pageTitle = '分享';
    titleEl.textContent = pageTitle || '中流通';
  }

  // ══════════════════════════════════════════════════
  // 4. Update TabBar highlight
  // ══════════════════════════════════════════════════
  function updateTabBarHighlight(path) {
    var tabBar = document.getElementById('zlc-tabbar');
    if (!tabBar) return;
    var links = tabBar.querySelectorAll('a[href]');
    // Determine active key from path
    var keyMap = {
      '/': 'home', '/projects': 'projects', '/create': 'create',
      '/repayments': 'repayments', '/profile': 'profile',
      '/admin': 'admin', '/teacher': 'teacher'
    };
    var activeKey = keyMap[path] || '';
    // Fallback for sub-pages
    if (!activeKey) {
      if (path.indexOf('/projects/') === 0) activeKey = 'projects';
      else if (path.indexOf('/investments') === 0 || path.indexOf('/contracts') === 0) activeKey = 'repayments';
      else if (path.indexOf('/initiated') === 0) activeKey = 'repayments';
    }
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      var tabKey = '';
      for (var k in keyMap) { if (keyMap[k] && href === k) { tabKey = keyMap[k]; break; } }
      if (tabKey === activeKey) {
        links[i].className = links[i].className.replace('tab-inactive', 'tab-active');
      } else {
        links[i].className = links[i].className.replace('tab-active', 'tab-inactive');
      }
    }
  }

  // ══════════════════════════════════════════════════
  // 5. Script re-execution
  // ══════════════════════════════════════════════════
  function executeScripts(container) {
    var scripts = container.querySelectorAll('script');
    var promises = [];
    for (var i = 0; i < scripts.length; i++) {
      var oldScript = scripts[i];
      var newScript = document.createElement('script');
      // Copy attributes
      for (var j = 0; j < oldScript.attributes.length; j++) {
        newScript.setAttribute(oldScript.attributes[j].name, oldScript.attributes[j].value);
      }
      if (oldScript.src) {
        // External script — load it
        var p = new Promise(function (resolve) {
          newScript.onload = resolve;
          newScript.onerror = resolve;
        });
        promises.push(p);
      }
      // Inline script
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    }
    return Promise.all(promises);
  }

  // ══════════════════════════════════════════════════
  // 6. Should this link be SPA-routed?
  // ══════════════════════════════════════════════════
  function shouldIntercept(anchor) {
    // Must be an <a> with href
    if (!anchor || !anchor.href) return false;
    // Skip if modifier keys
    // Skip target="_blank"
    if (anchor.target === '_blank') return false;
    // Skip download
    if (anchor.hasAttribute('download')) return false;
    // Must be same origin
    if (anchor.origin !== window.location.origin) return false;
    var path = anchor.pathname;
    // Skip /api/* paths
    if (path.indexOf('/api/') === 0) return false;
    // Skip full-reload paths
    for (var i = 0; i < FULL_RELOAD_PATHS.length; i++) {
      if (path === FULL_RELOAD_PATHS[i] || path.indexOf(FULL_RELOAD_PATHS[i] + '/') === 0) return false;
    }
    // Skip hash-only links (same page)
    if (anchor.pathname === window.location.pathname && anchor.hash) return false;
    return true;
  }

  // ══════════════════════════════════════════════════
  // 7. Cleanup before navigation
  // ══════════════════════════════════════════════════
  function cleanupBeforeNav() {
    // Close any open modals/overlays
    var modals = document.querySelectorAll('.modal-overlay.show, .contract-modal.show, .success-modal-overlay.show');
    for (var i = 0; i < modals.length; i++) {
      modals[i].classList.remove('show');
    }
    // Remove dynamically added toast/nudge/overlay elements outside content area
    var floats = document.querySelectorAll('.toast, .nudge-bar, .faq-overlay, .onboarding-overlay, .coach-overlay');
    for (var i = 0; i < floats.length; i++) {
      floats[i].remove();
    }
    // Reset body overflow (some modals set it)
    document.body.style.overflow = '';
    // Reset any global flags set by page scripts
    if (typeof window._helpIconsBound !== 'undefined') window._helpIconsBound = false;
  }

  // ══════════════════════════════════════════════════
  // 8. Core navigation function
  // ══════════════════════════════════════════════════
  function navigateTo(url, opts) {
    opts = opts || {};
    if (isNavigating) {
      // Abort previous in-flight request
      if (currentAbort) {
        try { currentAbort.abort(); } catch (e) {}
      }
    }

    isNavigating = true;
    var contentEl = document.getElementById(CONTENT_ID);
    if (!contentEl) {
      // Fallback: full reload
      window.location.href = url;
      return;
    }

    // ── 1) Show progress bar immediately (<300 ms feedback) ──
    showProgress();

    // ── 2) Fade out current content ──
    contentEl.style.transition = 'opacity 150ms ease';
    contentEl.style.opacity = '0.4';

    // ── 3) After brief fade, show skeleton ──
    setTimeout(function () {
      showSkeleton(contentEl);
      contentEl.style.opacity = '1';
    }, 100);

    // ── 4) Fetch new page ──
    currentAbort = new AbortController();
    fetch(url, {
      credentials: 'same-origin',
      signal: currentAbort.signal,
      headers: { 'X-SPA': '1' } // optional hint to server
    }).then(function (resp) {
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.text();
    }).then(function (html) {
      // ── 5) Parse and extract #zlc-page-content ──
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      var newContent = doc.getElementById(CONTENT_ID);
      var newTitle = doc.querySelector('title');

      if (!newContent) {
        // Page doesn't have our content wrapper — full reload
        window.location.href = url;
        return;
      }

      // ── 6) Cleanup and swap ──
      cleanupBeforeNav();

      // Update document title
      if (newTitle) document.title = newTitle.textContent;

      // Swap content with fade-in
      contentEl.style.transition = 'none';
      contentEl.style.opacity = '0';
      contentEl.innerHTML = newContent.innerHTML;

      // ── 7) Push state (unless popstate) ──
      if (!opts.popstate) {
        history.pushState({ zlcSpa: true, url: url }, '', url);
      }

      // ── 8) Execute scripts in new content ──
      executeScripts(contentEl).then(function () {
        // ── 9) Fade in ──
        requestAnimationFrame(function () {
          contentEl.style.transition = 'opacity 250ms ease';
          contentEl.style.opacity = '1';
        });

        // ── 10) Update sidebar/topbar/tabbar ──
        var path = new URL(url, window.location.origin).pathname;
        updateSidebarHighlight(path);
        updateTopbarTitle(path);
        updateTabBarHighlight(path);

        // ── 11) Re-init shared utilities ──
        reinitGlobalScripts();

        // ── 12) Scroll to top ──
        window.scrollTo(0, 0);

        finishProgress();
        isNavigating = false;
        currentAbort = null;
      });
    }).catch(function (err) {
      if (err.name === 'AbortError') return; // Aborted, new nav in progress
      console.warn('[SPA Router] fetch error:', err);
      hideProgress();
      isNavigating = false;
      currentAbort = null;
      // Fallback to full page load
      window.location.href = url;
    });
  }

  // ══════════════════════════════════════════════════
  // 9. Re-init global scripts after SPA swap
  // ══════════════════════════════════════════════════
  function reinitGlobalScripts() {
    // Re-init IntersectionObserver-based features
    if (typeof initReveal === 'function') initReveal();
    if (typeof initProgressBars === 'function') initProgressBars();
    if (typeof initHelpIcons === 'function') {
      window._helpIconsBound = false;
      initHelpIcons();
    }
    // Re-init ripple
    // (delegated on document, so it survives — no re-init needed)
    // Re-init navbar user dropdown (already delegated, but re-run for new content)
    if (typeof initNavUserDropdown === 'function') initNavUserDropdown();
    // Re-init bell shake
    if (typeof _initBellShake === 'function') setTimeout(_initBellShake, 200);
    // Re-init help button
    if (typeof initHelpButton === 'function') setTimeout(initHelpButton, 100);
  }

  // ══════════════════════════════════════════════════
  // 10. Event listeners
  // ══════════════════════════════════════════════════

  // ── Link click delegation ──
  document.addEventListener('click', function (e) {
    // Skip if modifier keys are pressed
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    // Find closest <a>
    var anchor = e.target.closest ? e.target.closest('a[href]') : null;
    if (!anchor) {
      // IE11 fallback
      var el = e.target;
      while (el && el !== document) {
        if (el.tagName === 'A' && el.href) { anchor = el; break; }
        el = el.parentNode;
      }
    }
    if (!anchor) return;
    if (!shouldIntercept(anchor)) return;

    e.preventDefault();
    var href = anchor.href;

    // If same URL, just scroll to top
    if (href === window.location.href) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    navigateTo(href);
  });

  // ── Popstate (back/forward) ──
  window.addEventListener('popstate', function (e) {
    var url = window.location.href;
    var path = window.location.pathname;

    // Check if it's a full-reload path
    for (var i = 0; i < FULL_RELOAD_PATHS.length; i++) {
      if (path === FULL_RELOAD_PATHS[i] || path.indexOf(FULL_RELOAD_PATHS[i] + '/') === 0) {
        window.location.reload();
        return;
      }
    }

    navigateTo(url, { popstate: true });
  });

  // ── Replace window.location assignments for SPA ──
  // Intercept common patterns: window.location.href = '...'
  // We patch this by providing a helper function
  window.__zlcNavigate = function (url) {
    if (typeof url !== 'string') return;
    // Check if should intercept
    try {
      var a = document.createElement('a');
      a.href = url;
      if (shouldIntercept(a)) {
        navigateTo(a.href);
        return;
      }
    } catch (e) {}
    window.location.href = url;
  };

  // ── Mark initial state ──
  if (!history.state || !history.state.zlcSpa) {
    history.replaceState({ zlcSpa: true, url: window.location.href }, '');
  }

  // ── Expose for programmatic navigation ──
  window.zlcRouter = {
    navigate: navigateTo,
    updateHighlight: function () {
      var p = window.location.pathname;
      updateSidebarHighlight(p);
      updateTopbarTitle(p);
      updateTabBarHighlight(p);
    }
  };

  console.log('[SPA Router] initialized');
})();
