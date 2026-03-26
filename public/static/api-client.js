// ═══════════════════════════════════════════════════════════
// 中流通 API Client — 统一错误处理 + 超时 + 重试
// 所有前端 fetch 调用替代方案
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  var DEFAULT_TIMEOUT = 5000;  // 5秒超时
  var MAX_RETRIES = 1;         // 重试1次
  var RETRY_DELAY = 800;       // 重试间隔 ms

  // ── Toast 提示 ──
  function showToast(msg, type) {
    type = type || 'error';
    var existing = document.getElementById('zlc-api-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'zlc-api-toast';
    toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999;'
      + 'padding:12px 24px;border-radius:12px;font-size:14px;font-weight:500;'
      + 'box-shadow:0 8px 32px rgba(0,0,0,0.15);transition:opacity 0.3s ease;'
      + 'max-width:90vw;text-align:center;'
      + (type === 'error'
        ? 'background:#FEE2E2;color:#991B1B;border:1px solid #FECACA;'
        : type === 'warn'
          ? 'background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;'
          : 'background:#D1FAE5;color:#065F46;border:1px solid #A7F3D0;');
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(function () {
      toast.style.opacity = '0';
      setTimeout(function () { toast.remove(); }, 300);
    }, 3500);
  }

  // ── 核心请求函数 ──
  function zlcFetch(url, options, retryCount) {
    options = options || {};
    retryCount = retryCount || 0;
    var timeout = options.timeout || DEFAULT_TIMEOUT;

    // 构造 AbortController 用于超时
    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, timeout);

    var fetchOpts = {
      method: options.method || 'GET',
      headers: options.headers || {},
      signal: controller.signal,
    };
    if (options.body) {
      fetchOpts.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      if (!fetchOpts.headers['Content-Type']) {
        fetchOpts.headers['Content-Type'] = 'application/json';
      }
    }

    return fetch(url, fetchOpts)
      .then(function (res) {
        clearTimeout(timeoutId);

        // Session 过期处理
        if (res.status === 401) {
          return res.json().then(function (data) {
            if (data.code === 'SESSION_EXPIRED' || data.code === 'UNAUTHENTICATED') {
              localStorage.removeItem('zlc_user');
              localStorage.removeItem('zlc_current_user');
              localStorage.removeItem('zlc_token');
              showToast('登录已过期，请重新登录', 'warn');
              setTimeout(function () { window.location.href = '/login'; }, 1500);
            }
            return data;
          });
        }

        // 429 Rate Limit
        if (res.status === 429) {
          return res.json().then(function (data) {
            showToast(data.error || '请求过于频繁，请稍后再试', 'warn');
            return data;
          });
        }

        // 5xx 服务器错误 — 可重试
        if (res.status >= 500 && retryCount < MAX_RETRIES) {
          return new Promise(function (resolve) {
            setTimeout(function () {
              resolve(zlcFetch(url, options, retryCount + 1));
            }, RETRY_DELAY);
          });
        }

        return res.json().catch(function () {
          return { ok: false, error: '响应解析失败', code: 'PARSE_ERROR' };
        });
      })
      .catch(function (err) {
        clearTimeout(timeoutId);

        // 超时
        if (err.name === 'AbortError') {
          if (retryCount < MAX_RETRIES) {
            return new Promise(function (resolve) {
              setTimeout(function () {
                resolve(zlcFetch(url, options, retryCount + 1));
              }, RETRY_DELAY);
            });
          }
          showToast('网络请求超时，请检查网络后重试', 'error');
          return { ok: false, error: '请求超时', code: 'TIMEOUT' };
        }

        // 网络错误
        if (retryCount < MAX_RETRIES) {
          return new Promise(function (resolve) {
            setTimeout(function () {
              resolve(zlcFetch(url, options, retryCount + 1));
            }, RETRY_DELAY);
          });
        }
        showToast('网络连接异常，请重试', 'error');
        return { ok: false, error: '网络异常', code: 'NETWORK_ERROR' };
      });
  }

  // ── 便捷方法 ──
  function zlcGet(url, opts) {
    return zlcFetch(url, Object.assign({ method: 'GET' }, opts || {}));
  }

  function zlcPost(url, body, opts) {
    return zlcFetch(url, Object.assign({ method: 'POST', body: body }, opts || {}));
  }

  // ── 全局暴露 ──
  window.zlcFetch = zlcFetch;
  window.zlcGet = zlcGet;
  window.zlcPost = zlcPost;
  window.zlcToast = showToast;

})();
