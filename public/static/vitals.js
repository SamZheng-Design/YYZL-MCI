// ═══════════════════════════════════════════════════════════
// 中流通 Web Vitals 监控 — LCP / FCP / CLS
// 采集核心 Web Vitals 指标并通过 /api/metrics POST 上报
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  var ENDPOINT = '/api/metrics';
  var BATCH_DELAY = 5000; // 5秒后批量上报
  var queue = [];
  var sent = false;

  // ── 通用上报函数 ──
  function report(name, value, extra) {
    queue.push({
      name: name,
      value: Math.round(value),
      ts: Date.now(),
      path: location.pathname,
      ua: navigator.userAgent.slice(0, 120),
      extra: extra || null,
    });
  }

  // ── 批量发送 ──
  function flush() {
    if (sent || queue.length === 0) return;
    sent = true;
    var payload = JSON.stringify({ metrics: queue });
    // Prefer sendBeacon for reliability during page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(function () {});
    }
  }

  // ── FCP (First Contentful Paint) ──
  function observeFCP() {
    try {
      var observer = new PerformanceObserver(function (list) {
        var entries = list.getEntries();
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].name === 'first-contentful-paint') {
            report('FCP', entries[i].startTime);
            observer.disconnect();
            break;
          }
        }
      });
      observer.observe({ type: 'paint', buffered: true });
    } catch (e) {}
  }

  // ── LCP (Largest Contentful Paint) ──
  function observeLCP() {
    try {
      var lastLCP = 0;
      var observer = new PerformanceObserver(function (list) {
        var entries = list.getEntries();
        // LCP continuously updates; take the last one
        if (entries.length > 0) {
          lastLCP = entries[entries.length - 1].startTime;
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });

      // Report LCP when user interacts or page hides
      function finalizeLCP() {
        if (lastLCP > 0) {
          report('LCP', lastLCP);
          lastLCP = 0;
        }
        observer.disconnect();
      }
      // Interaction stops LCP tracking
      ['keydown', 'click', 'scroll'].forEach(function (evt) {
        document.addEventListener(evt, function onAct() {
          finalizeLCP();
          document.removeEventListener(evt, onAct, { capture: true });
        }, { capture: true, once: true });
      });
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') finalizeLCP();
      });
    } catch (e) {}
  }

  // ── CLS (Cumulative Layout Shift) ──
  function observeCLS() {
    try {
      var clsValue = 0;
      var sessionEntries = [];
      var sessionValue = 0;
      var observer = new PerformanceObserver(function (list) {
        var entries = list.getEntries();
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          // Only count shifts without recent input
          if (!entry.hadRecentInput) {
            var firstEntry = sessionEntries.length > 0 ? sessionEntries[0] : null;
            var lastEntry = sessionEntries.length > 0 ? sessionEntries[sessionEntries.length - 1] : null;

            // If gap > 1s or session > 5s, start a new window
            if (firstEntry && (entry.startTime - lastEntry.startTime > 1000 || entry.startTime - firstEntry.startTime > 5000)) {
              if (sessionValue > clsValue) clsValue = sessionValue;
              sessionEntries = [];
              sessionValue = 0;
            }
            sessionEntries.push(entry);
            sessionValue += entry.value;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });

      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') {
          if (sessionValue > clsValue) clsValue = sessionValue;
          report('CLS', clsValue * 1000); // *1000 for integer precision
          observer.disconnect();
        }
      });
    } catch (e) {}
  }

  // ── TTFB from Navigation Timing ──
  function reportTTFB() {
    try {
      var nav = performance.getEntriesByType('navigation')[0];
      if (nav && nav.responseStart > 0) {
        report('TTFB', nav.responseStart - nav.requestStart);
      }
    } catch (e) {}
  }

  // ── Init ──
  observeFCP();
  observeLCP();
  observeCLS();

  // TTFB after page load
  if (document.readyState === 'complete') {
    reportTTFB();
  } else {
    window.addEventListener('load', reportTTFB);
  }

  // Flush after delay or on page hide
  setTimeout(flush, BATCH_DELAY);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('pagehide', flush);
})();
