// ============================================================
// Guide Pages — Apple-style immersive long-scroll demos
// /guide/member  /guide/teacher  /guide/admin
// ============================================================
import { Hono } from 'hono'

const guide = new Hono()

// ── Shared CSS for all guide pages ──────────────────────────
const GuideStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
/* ── Reset & Base ── */
*{box-sizing:border-box;margin:0;padding:0}
body{background:#FAFAF9;font-family:-apple-system,BlinkMacSystemFont,'Inter','SF Pro Display','Segoe UI','Roboto','Noto Sans SC',sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;overflow-x:hidden}
a{text-decoration:none;color:inherit}

/* ── Top Navbar ── */
.guide-nav{position:fixed;top:0;left:0;right:0;z-index:100;height:48px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,0,0,0.04)}
.guide-nav-left{display:flex;align-items:center;gap:8px;cursor:pointer}
.guide-nav-left svg{width:18px;height:18px;color:#44403C}
.guide-nav-left span{font-size:14px;color:#44403C;font-weight:500}
.guide-nav-right{font-size:13px;color:#A8A29E;cursor:pointer;transition:color 0.2s}
.guide-nav-right:hover{color:#78716C}

/* ── Hero ── */
.guide-hero{min-height:max(50vh,320px);background:linear-gradient(160deg,#7F1D1D,#B91C1C,#991B1B);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:88px 32px 40px;opacity:0;transform:translateY(30px);animation:guideHeroIn 800ms ease-out forwards}
.guide-hero-tag{font-size:12px;color:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.2);border-radius:20px;padding:4px 14px;margin-bottom:16px;display:inline-block}
.guide-hero-title{font-size:28px;font-weight:800;color:white;line-height:1.3}
.guide-hero-sub{margin-top:12px;font-size:15px;color:rgba(255,255,255,0.7)}
.guide-hero-arrow{margin-top:28px;animation:guideArrowBounce 2s ease-in-out infinite}
.guide-hero-arrow svg{width:24px;height:24px;color:rgba(255,255,255,0.5)}

@keyframes guideHeroIn{to{opacity:1;transform:translateY(0)}}
@keyframes guideArrowBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(10px)}}

/* ── Section Title ── */
.guide-section-title{padding:32px 16px 16px}
.guide-section-tag{font-size:12px;color:#D4A853;font-weight:600}
.guide-section-h2{font-size:22px;font-weight:800;color:#1C1917;margin-top:4px}
.guide-section-desc{font-size:14px;color:#78716C;margin-top:6px}

/* ── Timeline ── */
.guide-timeline{padding:0 16px 0 16px}
.guide-step{padding-left:36px;position:relative;opacity:0;transform:translateY(40px);transition:opacity 500ms ease-out,transform 500ms ease-out}
.guide-step.visible{opacity:1;transform:translateY(0)}

/* circle */
.guide-step-circle{position:absolute;left:0;top:0;width:36px;height:36px;background:#B91C1C;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;font-weight:700;box-shadow:0 2px 8px rgba(185,28,28,0.3);z-index:2}

/* vertical line */
.guide-step-line{position:absolute;left:17px;top:36px;bottom:0;width:2px;background:linear-gradient(180deg,#B91C1C,#D4A853)}
.guide-step:last-child .guide-step-line{display:none}

/* card */
.guide-step-card{margin-left:20px;background:white;border-radius:18px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,0.04);margin-bottom:32px}
.guide-step-card h3{font-size:18px;font-weight:700;color:#1C1917}
.guide-step-card .step-desc{font-size:14px;color:#57534E;line-height:1.7;margin-top:8px}

/* UI mock area */
.guide-mock{margin-top:16px;background:#F8F7F6;border-radius:14px;padding:16px;border:1px solid #E7E5E4;overflow:hidden}

/* tip */
.guide-tip{margin-top:12px;font-size:12px;color:#B91C1C;background:rgba(185,28,28,0.05);border-radius:8px;padding:8px 12px;line-height:1.5}

/* ── Result Card ── */
.guide-result{background:linear-gradient(135deg,rgba(212,168,83,0.1),rgba(212,168,83,0.05));border:1px solid rgba(212,168,83,0.3);border-radius:16px;padding:20px;text-align:center;margin:0 16px 0 16px;opacity:0;transform:translateY(40px);transition:opacity 500ms ease-out,transform 500ms ease-out}
.guide-result.visible{opacity:1;transform:translateY(0)}
.guide-result-icon{font-size:28px}
.guide-result-text{font-size:15px;color:#44403C;font-weight:500;margin-top:8px;line-height:1.6}

/* ── Divider ── */
.guide-divider{height:1px;width:60px;margin:40px auto;background:linear-gradient(90deg,transparent,#D4A853,transparent)}

/* ── CTA ── */
.guide-cta{padding:40px 16px 60px;text-align:center}
.guide-cta-text{font-size:16px;color:#44403C;font-weight:500}
.guide-cta-sub{font-size:13px;color:#78716C;margin-top:4px}
.guide-cta-btn{display:inline-block;margin-top:16px;background:linear-gradient(135deg,#B91C1C,#991B1B);color:white;border-radius:14px;padding:16px 32px;font-size:16px;font-weight:700;box-shadow:0 4px 16px rgba(185,28,28,0.3);border:none;cursor:pointer;transition:transform 0.15s,box-shadow 0.15s}
.guide-cta-btn:active{transform:scale(0.97);box-shadow:0 2px 8px rgba(185,28,28,0.3)}
.guide-cta-brand{margin-top:12px;font-size:12px;color:#A8A29E}

/* ── Admin module card ── */
.guide-module{margin:0 16px 24px;background:white;border-radius:18px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,0.04);opacity:0;transform:translateY(40px);transition:opacity 500ms ease-out,transform 500ms ease-out}
.guide-module.visible{opacity:1;transform:translateY(0)}
.guide-module-num{font-size:48px;font-weight:800;color:rgba(185,28,28,0.1);line-height:1}
.guide-module h3{font-size:20px;font-weight:700;color:#1C1917;margin-top:4px}
.guide-module .mod-desc{font-size:14px;color:#57534E;line-height:1.7;margin-top:8px}

/* ── Wireframe helpers ── */
.wf-line{height:8px;border-radius:4px;background:#D6D3D1}
.wf-line-dark{height:8px;border-radius:4px;background:#A8A29E}
.wf-line-white{height:6px;border-radius:3px;background:rgba(255,255,255,0.7)}
.wf-btn{border-radius:8px;padding:8px 16px;font-size:11px;font-weight:600;text-align:center;color:white;background:#B91C1C}
.wf-btn-outline{border-radius:8px;padding:6px 12px;font-size:11px;font-weight:600;text-align:center;color:#B91C1C;background:transparent;border:1.5px solid #B91C1C}
.wf-avatar{width:28px;height:28px;border-radius:50%;background:#D6D3D1;flex-shrink:0}
.wf-avatar-sm{width:20px;height:20px;border-radius:50%;background:#D6D3D1;flex-shrink:0}
.wf-input{background:#EEECEB;border-radius:8px;height:32px;width:100%;border:none;display:block}
.wf-badge{font-size:9px;padding:2px 6px;border-radius:4px;font-weight:600;display:inline-block}
.wf-card-mini{background:white;border-radius:10px;padding:12px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border:1px solid #F0EDEB}

/* ── Teacher wide card ── */
.guide-wide-card{background:linear-gradient(135deg,rgba(185,28,28,0.05),rgba(212,168,83,0.05));border-radius:18px;padding:28px;margin:0 16px;text-align:center;opacity:0;transform:translateY(40px);transition:opacity 500ms ease-out,transform 500ms ease-out}
.guide-wide-card.visible{opacity:1;transform:translateY(0)}
.guide-wide-card h3{font-size:18px;font-weight:700;color:#1C1917}
.guide-icon-circle{width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px}

/* scrollbar */
::-webkit-scrollbar{width:0;height:0}
` }} />
)

// ── Shared observer script ──────────────────────────────────
const GuideObserverScript = () => (
  <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var items = document.querySelectorAll('.guide-step, .guide-result, .guide-module, .guide-wide-card');
  if(!items.length) return;
  var delay = 0;
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var el = e.target;
        var d = parseInt(el.dataset.delay||'0',10);
        setTimeout(function(){ el.classList.add('visible'); }, d);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15 });
  var idx = 0;
  items.forEach(function(el){
    el.dataset.delay = String(idx * 100);
    observer.observe(el);
    idx++;
  });
})();
` }} />
)

// ── GuideNav component ──────────────────────────────────────
const GuideNav = ({ skipTo }: { skipTo: string }) => (
  <nav class="guide-nav">
    <div class="guide-nav-left" onclick="history.back()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      <span>使用指南</span>
    </div>
    <a class="guide-nav-right" href={skipTo}>跳过</a>
  </nav>
)

// ════════════════════════════════════════════════════════════
// PAGE 1: Member Guide  (/guide/member)
// ════════════════════════════════════════════════════════════
guide.get('/member', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<title>学员使用指南 — 中流通</title>
<link rel="icon" type="image/svg+xml" href="/favicon.ico">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#FAFAF9;font-family:-apple-system,BlinkMacSystemFont,'Inter','SF Pro Display','Segoe UI','Roboto','Noto Sans SC',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{text-decoration:none;color:inherit}

/* Nav */
.guide-nav{position:fixed;top:0;left:0;right:0;z-index:100;height:48px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,0,0,0.04)}
.guide-nav-left{display:flex;align-items:center;gap:8px;cursor:pointer}
.guide-nav-left svg{width:18px;height:18px;color:#44403C}
.guide-nav-left span{font-size:14px;color:#44403C;font-weight:500}
.guide-nav-right{font-size:13px;color:#A8A29E;cursor:pointer;transition:color 0.2s}
.guide-nav-right:hover{color:#78716C}

/* Hero */
.guide-hero{min-height:max(50vh,320px);background:linear-gradient(160deg,#7F1D1D,#B91C1C,#991B1B);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:88px 32px 40px;opacity:0;transform:translateY(30px);animation:heroIn 800ms ease-out forwards}
.guide-hero-tag{font-size:12px;color:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.2);border-radius:20px;padding:4px 14px;margin-bottom:16px;display:inline-block}
.guide-hero-title{font-size:28px;font-weight:800;color:white;line-height:1.3}
.guide-hero-sub{margin-top:12px;font-size:15px;color:rgba(255,255,255,0.7)}
.guide-hero-arrow{margin-top:28px;animation:arrowBounce 2s ease-in-out infinite}
.guide-hero-arrow svg{width:24px;height:24px;color:rgba(255,255,255,0.5)}
@keyframes heroIn{to{opacity:1;transform:translateY(0)}}
@keyframes arrowBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(10px)}}

/* Section Title */
.section-title{padding:32px 16px 16px}
.section-tag{font-size:12px;color:#D4A853;font-weight:600}
.section-h2{font-size:22px;font-weight:800;color:#1C1917;margin-top:4px}
.section-desc{font-size:14px;color:#78716C;margin-top:6px}

/* Timeline */
.timeline{padding:0 16px}
.step{padding-left:36px;position:relative;opacity:0;transform:translateY(40px);transition:opacity 500ms ease-out,transform 500ms ease-out}
.step.visible{opacity:1;transform:translateY(0)}
.step-circle{position:absolute;left:0;top:0;width:36px;height:36px;background:#B91C1C;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;font-weight:700;box-shadow:0 2px 8px rgba(185,28,28,0.3);z-index:2}
.step-line{position:absolute;left:17px;top:36px;bottom:0;width:2px;background:linear-gradient(180deg,#B91C1C,#D4A853)}
.step:last-child .step-line{display:none}
.step-card{margin-left:20px;background:white;border-radius:18px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,0.04);margin-bottom:32px}
.step-card h3{font-size:18px;font-weight:700;color:#1C1917}
.step-desc{font-size:14px;color:#57534E;line-height:1.7;margin-top:8px}

/* Mock area */
.mock{margin-top:16px;background:#F8F7F6;border-radius:14px;padding:16px;border:1px solid #E7E5E4;overflow:hidden}
.tip{margin-top:12px;font-size:12px;color:#B91C1C;background:rgba(185,28,28,0.05);border-radius:8px;padding:8px 12px;line-height:1.5}

/* Result */
.result{background:linear-gradient(135deg,rgba(212,168,83,0.1),rgba(212,168,83,0.05));border:1px solid rgba(212,168,83,0.3);border-radius:16px;padding:20px;text-align:center;margin:0 16px;opacity:0;transform:translateY(40px);transition:opacity 500ms ease-out,transform 500ms ease-out}
.result.visible{opacity:1;transform:translateY(0)}
.result-icon{font-size:28px}
.result-text{font-size:15px;color:#44403C;font-weight:500;margin-top:8px;line-height:1.6}

/* Divider */
.divider{height:1px;width:60px;margin:40px auto;background:linear-gradient(90deg,transparent,#D4A853,transparent)}

/* CTA */
.cta{padding:40px 16px 60px;text-align:center}
.cta-text{font-size:16px;color:#44403C;font-weight:500}
.cta-btn{display:inline-block;margin-top:16px;background:linear-gradient(135deg,#B91C1C,#991B1B);color:white;border-radius:14px;padding:16px 32px;font-size:16px;font-weight:700;box-shadow:0 4px 16px rgba(185,28,28,0.3);border:none;cursor:pointer;transition:transform 0.15s}
.cta-btn:active{transform:scale(0.97)}
.cta-brand{margin-top:12px;font-size:12px;color:#A8A29E}

/* Wireframe helpers */
.wf{height:8px;border-radius:4px;background:#D6D3D1}
.wf-dark{height:8px;border-radius:4px;background:#A8A29E}
.wf-white{height:6px;border-radius:3px;background:rgba(255,255,255,0.7)}
.wf-btn{border-radius:8px;padding:8px 16px;font-size:11px;font-weight:600;text-align:center;color:white;background:#B91C1C}
.wf-input{background:#EEECEB;border-radius:8px;height:32px;width:100%;display:block}
.wf-avatar{width:28px;height:28px;border-radius:50%;background:#D6D3D1;flex-shrink:0}
.wf-avatar-sm{width:20px;height:20px;border-radius:50%;background:#D6D3D1;flex-shrink:0}

::-webkit-scrollbar{width:0;height:0}
</style>
</head>
<body>

<!-- Nav -->
<nav class="guide-nav">
  <div class="guide-nav-left" onclick="history.back()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
    <span>使用指南</span>
  </div>
  <a class="guide-nav-right" href="/">跳过</a>
</nav>

<!-- Hero -->
<section class="guide-hero">
  <span class="guide-hero-tag">学员指南</span>
  <h1 class="guide-hero-title">作为学员，<br>您可以做这些事</h1>
  <p class="guide-hero-sub">发起项目 · 参与投资 · 追踪回款 · 分享给同学</p>
  <div class="guide-hero-arrow">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
  </div>
</section>

<!-- ═══ Line 1: 发起一个项目募资 ═══ -->
<div class="section-title">
  <div class="section-tag">主线一</div>
  <h2 class="section-h2">发起一个项目募资</h2>
  <p class="section-desc">从创建到收到第一笔回款，只需四步</p>
</div>

<div class="timeline">

  <!-- Step 1 -->
  <div class="step" data-delay="0">
    <div class="step-circle">1</div>
    <div class="step-line"></div>
    <div class="step-card">
      <h3>📝 第一步：填写项目信息</h3>
      <p class="step-desc">设定融资金额、收入分成比例、联营期限，系统自动计算回报指标。</p>
      <div class="mock">
        <!-- Form wireframe -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div style="font-size:12px;color:#78716C;font-weight:600">新建项目</div>
          <div style="width:20px;height:20px;background:#EEECEB;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#A8A29E">🧮</div>
        </div>
        <div style="margin-bottom:10px">
          <div style="font-size:10px;color:#A8A29E;margin-bottom:4px">融资金额</div>
          <div class="wf-input" style="position:relative"><div style="position:absolute;left:10px;top:8px;width:60%;height:8px;border-radius:4px;background:#D6D3D1"></div></div>
        </div>
        <div style="margin-bottom:10px">
          <div style="font-size:10px;color:#A8A29E;margin-bottom:4px">收入分成比例</div>
          <div class="wf-input" style="position:relative"><div style="position:absolute;left:10px;top:8px;width:40%;height:8px;border-radius:4px;background:#D6D3D1"></div></div>
        </div>
        <div style="margin-bottom:14px">
          <div style="font-size:10px;color:#A8A29E;margin-bottom:4px">联营期限</div>
          <div class="wf-input" style="position:relative"><div style="position:absolute;left:10px;top:8px;width:50%;height:8px;border-radius:4px;background:#D6D3D1"></div></div>
        </div>
        <div class="wf-btn" style="width:100%;padding:10px 0;border-radius:10px;font-size:12px">提交项目</div>
      </div>
      <div class="tip">💡 新增「项目亮点」和「一句话推介」，让您的项目更有吸引力</div>
    </div>
  </div>

  <!-- Step 2 -->
  <div class="step" data-delay="100">
    <div class="step-circle">2</div>
    <div class="step-line"></div>
    <div class="step-card">
      <h3>🚀 第二步：发布并分享</h3>
      <p class="step-desc">项目发布后自动生成专属分享码和精美分享卡片。一键复制文字版，直接粘贴到微信群。</p>
      <div class="mock">
        <div style="display:flex;gap:12px;align-items:stretch">
          <!-- Share card thumbnail -->
          <div style="width:45%;background:linear-gradient(135deg,#1C1917,#292524);border-radius:10px;padding:12px;display:flex;flex-direction:column;justify-content:space-between;min-height:100px">
            <div>
              <div class="wf-white" style="width:70%;margin-bottom:6px"></div>
              <div class="wf-white" style="width:50%;margin-bottom:6px"></div>
              <div class="wf-white" style="width:85%;margin-bottom:6px;opacity:0.5"></div>
              <div class="wf-white" style="width:60%;opacity:0.5"></div>
            </div>
            <div style="margin-top:8px;background:rgba(212,168,83,0.3);border:1px solid rgba(212,168,83,0.5);border-radius:6px;padding:6px;text-align:center">
              <div style="font-size:9px;color:#D4A853;font-weight:700;letter-spacing:2px">ABCD1234</div>
            </div>
          </div>
          <!-- Phone mockup -->
          <div style="width:45%;border:2px solid #D6D3D1;border-radius:14px;padding:8px;display:flex;flex-direction:column;gap:6px;min-height:100px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <div style="width:14px;height:14px;border-radius:50%;background:#4CAF50"></div>
              <div style="font-size:9px;color:#A8A29E">微信群</div>
            </div>
            <!-- chat bubbles -->
            <div style="background:#95EC69;border-radius:8px;padding:6px 8px;align-self:flex-end;max-width:85%">
              <div style="height:5px;border-radius:3px;background:rgba(0,0,0,0.15);width:80%;margin-bottom:3px"></div>
              <div style="height:5px;border-radius:3px;background:rgba(0,0,0,0.15);width:60%"></div>
            </div>
            <div style="background:#EEECEB;border-radius:8px;padding:6px 8px;align-self:flex-start;max-width:75%">
              <div style="height:5px;border-radius:3px;background:#D6D3D1;width:90%"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="tip">💡 高端邀请函风格分享卡片，金色分享码，让项目推介更有质感</div>
    </div>
  </div>

  <!-- Step 3 -->
  <div class="step" data-delay="200">
    <div class="step-circle">3</div>
    <div class="step-line"></div>
    <div class="step-card">
      <h3>🤝 第三步：同学们参与</h3>
      <p class="step-desc">其他学员通过三种方式发现您的项目：大厅浏览、分享码直达、或老师引荐。参与后系统自动生成投资合同，电子签署。</p>
      <div class="mock">
        <!-- Three entry cards -->
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <div style="flex:1;background:white;border-radius:8px;padding:10px 8px;text-align:center;border:1px solid #E7E5E4">
            <div style="font-size:16px;margin-bottom:4px">🏛️</div>
            <div style="font-size:10px;color:#44403C;font-weight:600">大厅</div>
          </div>
          <div style="flex:1;background:white;border-radius:8px;padding:10px 8px;text-align:center;border:1px solid #E7E5E4">
            <div style="font-size:16px;margin-bottom:4px">🔗</div>
            <div style="font-size:10px;color:#44403C;font-weight:600">分享码</div>
          </div>
          <div style="flex:1;background:white;border-radius:8px;padding:10px 8px;text-align:center;border:1px solid #E7E5E4">
            <div style="font-size:16px;margin-bottom:4px">👨‍🏫</div>
            <div style="font-size:10px;color:#44403C;font-weight:600">老师</div>
          </div>
        </div>
        <!-- Arrow down -->
        <div style="text-align:center;color:#D6D3D1;font-size:18px;margin-bottom:8px">↓</div>
        <!-- Contract icon -->
        <div style="display:flex;justify-content:center">
          <div style="background:white;border:1px solid #E7E5E4;border-radius:10px;padding:14px 20px;display:flex;align-items:center;gap:10px">
            <div style="width:30px;height:38px;background:#F5F5F4;border-radius:4px;border:1px solid #E7E5E4;position:relative;display:flex;align-items:flex-start;justify-content:center;padding-top:6px">
              <div style="width:18px;height:3px;background:#D6D3D1;border-radius:2px;margin-bottom:3px"></div>
            </div>
            <div style="width:18px;height:18px;border-radius:50%;border:2px solid #B91C1C;position:relative">
              <div style="position:absolute;inset:3px;border-radius:50%;background:rgba(185,28,28,0.15)"></div>
            </div>
            <div style="font-size:10px;color:#78716C;font-weight:500">自动合同</div>
          </div>
        </div>
      </div>
      <div class="tip">💡 合同签署完成后有全屏仪式感动效，投资金额、预估回款一目了然</div>
    </div>
  </div>

  <!-- Step 4 -->
  <div class="step" data-delay="300">
    <div class="step-circle">4</div>
    <div class="step-line" style="display:none"></div>
    <div class="step-card">
      <h3>💰 第四步：每月回款</h3>
      <p class="step-desc">您定期上报项目营收，系统自动按投资比例分配给每位参与人。全程透明，每人实时可查。</p>
      <div class="mock">
        <!-- Flow diagram -->
        <div style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:nowrap">
          <!-- Revenue box -->
          <div style="background:white;border:1px solid #E7E5E4;border-radius:8px;padding:8px 10px;text-align:center;flex-shrink:0">
            <div style="font-size:9px;color:#A8A29E">项目收入</div>
            <div style="font-size:13px;color:#1C1917;font-weight:700;margin-top:2px">¥30万</div>
          </div>
          <!-- Arrow -->
          <div style="color:#D4A853;font-size:14px;flex-shrink:0">→</div>
          <!-- Platform -->
          <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#B91C1C,#D4A853);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <div style="font-size:10px;color:white;font-weight:700;text-align:center;line-height:1.1">自动<br>分配</div>
          </div>
          <!-- Arrow -->
          <div style="color:#D4A853;font-size:14px;flex-shrink:0">→</div>
          <!-- People -->
          <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">
            <div style="display:flex;align-items:center;gap:4px"><div class="wf-avatar-sm"></div><div style="font-size:9px;color:#57534E">¥9万</div></div>
            <div style="display:flex;align-items:center;gap:4px"><div class="wf-avatar-sm"></div><div style="font-size:9px;color:#57534E">¥12万</div></div>
            <div style="display:flex;align-items:center;gap:4px"><div class="wf-avatar-sm"></div><div style="font-size:9px;color:#57534E">¥9万</div></div>
          </div>
        </div>
      </div>
      <div class="tip">💡 回款超过本金时，系统自动触发庆祝动效 🎉</div>
    </div>
  </div>

</div>

<!-- Result 1 -->
<div class="result" data-delay="0">
  <div class="result-icon">🏆</div>
  <p class="result-text">您的项目成功募集 ¥200万，12位同学参与投资，<br>每月系统自动分配回款，全程透明可追踪</p>
</div>

<!-- Divider -->
<div class="divider"></div>

<!-- ═══ Line 2: 参与别人的项目投资 ═══ -->
<div class="section-title">
  <div class="section-tag">主线二</div>
  <h2 class="section-h2">参与别人的项目投资</h2>
  <p class="section-desc">从发现项目到收到回款，轻松四步</p>
</div>

<div class="timeline">

  <!-- Step 1 -->
  <div class="step" data-delay="0">
    <div class="step-circle">1</div>
    <div class="step-line"></div>
    <div class="step-card">
      <h3>🔍 第一步：发现项目</h3>
      <p class="step-desc">三种方式找到值得投资的项目——<br>① 在项目大厅浏览，同班项目优先展示<br>② 收到同学分享的项目码，直接输入查看<br>③ 老师推荐的优质项目，带金色标签</p>
      <div class="mock">
        <div style="display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:28px;height:28px;background:#EEECEB;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">📋</div>
            <div><div style="font-size:11px;color:#1C1917;font-weight:600">项目大厅</div><div style="font-size:9px;color:#A8A29E;margin-top:1px">同班项目优先展示</div></div>
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:28px;height:28px;background:#EEECEB;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">🔗</div>
            <div><div style="font-size:11px;color:#1C1917;font-weight:600">分享码输入</div><div style="font-size:9px;color:#A8A29E;margin-top:1px">输入 6 位码直达项目</div></div>
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:28px;height:28px;background:rgba(212,168,83,0.15);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">⭐</div>
            <div><div style="font-size:11px;color:#1C1917;font-weight:600">老师推荐</div><div style="font-size:9px;color:#D4A853;margin-top:1px;font-weight:500">金色标签优质项目</div></div>
          </div>
        </div>
      </div>
      <div class="tip">💡 系统智能排序「与我相关」的项目，同班和老师推荐优先展示</div>
    </div>
  </div>

  <!-- Step 2 -->
  <div class="step" data-delay="100">
    <div class="step-circle">2</div>
    <div class="step-line"></div>
    <div class="step-card">
      <h3>📊 第二步：深入了解</h3>
      <p class="step-desc">查看项目条款、发起人说、项目亮点。用内置计算器输入您想投资的金额，实时查看预估月回款和回本周期。</p>
      <div class="mock">
        <div style="display:flex;align-items:center;gap:8px">
          <!-- Input -->
          <div style="flex:1;background:white;border:1.5px solid #E7E5E4;border-radius:8px;padding:8px 10px;text-align:center">
            <div style="font-size:9px;color:#A8A29E;margin-bottom:2px">投资金额</div>
            <div style="font-size:15px;color:#1C1917;font-weight:700">¥10万</div>
          </div>
          <!-- Arrow -->
          <div style="color:#B91C1C;font-size:16px;flex-shrink:0">→</div>
          <!-- Result -->
          <div style="flex:1.3;background:white;border:1.5px solid rgba(185,28,28,0.15);border-radius:8px;padding:8px 10px">
            <div style="font-size:10px;color:#B91C1C;font-weight:600">月回 ¥0.18万</div>
            <div style="font-size:9px;color:#78716C;margin-top:3px">预计56个月回本</div>
          </div>
        </div>
      </div>
      <div class="tip">💡 不确定？可以点击「请老师引荐」，先线下见面聊一聊再决定</div>
    </div>
  </div>

  <!-- Step 3 -->
  <div class="step" data-delay="200">
    <div class="step-circle">3</div>
    <div class="step-line"></div>
    <div class="step-card">
      <h3>✍️ 第三步：签署合同</h3>
      <p class="step-desc">确认投资金额后，系统自动生成标准化收入分成合同，手机验证码签署，快捷安全。</p>
      <div class="mock">
        <div style="display:flex;gap:10px;align-items:stretch">
          <!-- Contract doc -->
          <div style="flex:1;background:white;border:1px solid #E7E5E4;border-radius:10px;padding:12px;display:flex;flex-direction:column;justify-content:space-between;min-height:90px">
            <div>
              <div style="font-size:10px;color:#1C1917;font-weight:600;margin-bottom:6px">收入分成合同</div>
              <div class="wf" style="width:90%;margin-bottom:4px"></div>
              <div class="wf" style="width:75%;margin-bottom:4px"></div>
              <div class="wf" style="width:85%;margin-bottom:4px"></div>
              <div class="wf" style="width:60%"></div>
            </div>
            <div class="wf-btn" style="margin-top:10px;width:100%;padding:8px 0;border-radius:8px;font-size:11px">签署合同</div>
          </div>
          <!-- SMS -->
          <div style="flex:0.7;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:8px">
            <div style="background:#EEECEB;border-radius:10px;padding:10px;text-align:center;width:100%">
              <div style="font-size:8px;color:#A8A29E;margin-bottom:3px">短信验证码</div>
              <div style="font-size:16px;color:#1C1917;font-weight:700;letter-spacing:3px">888888</div>
            </div>
            <div style="font-size:8px;color:#A8A29E">📱 手机验证</div>
          </div>
        </div>
      </div>
      <div class="tip">💡 签署成功后的全屏仪式感页面，展示您的投资关键信息和分享入口</div>
    </div>
  </div>

  <!-- Step 4 -->
  <div class="step" data-delay="300">
    <div class="step-circle">4</div>
    <div class="step-line" style="display:none"></div>
    <div class="step-card">
      <h3>📈 第四步：追踪回款</h3>
      <p class="step-desc">在「我的投资」中实时查看每笔投资的回款进度、月度趋势、累计回收率。投资回本时系统庆祝通知。</p>
      <div class="mock">
        <div style="display:flex;align-items:center;gap:14px;justify-content:center">
          <!-- Circular progress -->
          <div style="position:relative;width:72px;height:72px;flex-shrink:0">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="#EEECEB" stroke-width="5"/>
              <circle cx="36" cy="36" r="30" fill="none" stroke="#B91C1C" stroke-width="5" stroke-dasharray="126 189" stroke-linecap="round" transform="rotate(-90 36 36)"/>
            </svg>
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#1C1917">67%</div>
          </div>
          <!-- Bar chart -->
          <div style="display:flex;align-items:flex-end;gap:5px;height:56px">
            <div style="width:14px;background:linear-gradient(180deg,#B91C1C,#D4A853);border-radius:3px 3px 0 0;height:25px"></div>
            <div style="width:14px;background:linear-gradient(180deg,#B91C1C,#D4A853);border-radius:3px 3px 0 0;height:35px"></div>
            <div style="width:14px;background:linear-gradient(180deg,#B91C1C,#D4A853);border-radius:3px 3px 0 0;height:45px"></div>
            <div style="width:14px;background:linear-gradient(180deg,#B91C1C,#D4A853);border-radius:3px 3px 0 0;height:38px"></div>
            <div style="width:14px;background:linear-gradient(180deg,#B91C1C,#D4A853);border-radius:3px 3px 0 0;height:56px"></div>
            <div style="width:14px;background:#EEECEB;border-radius:3px 3px 0 0;height:20px"></div>
          </div>
        </div>
      </div>
      <div class="tip">💡 半圆仪表盘直观展示您的整体投资回收率，首页一眼可见</div>
    </div>
  </div>

</div>

<!-- Result 2 -->
<div class="result" data-delay="0">
  <div class="result-icon">🏆</div>
  <p class="result-text">您投资了3个项目共 ¥30万，平均月回款 ¥0.8万，<br>预计14个月回本，全程透明追踪</p>
</div>

<!-- CTA -->
<div class="cta">
  <p class="cta-text">已经了解了？开始使用吧！</p>
  <a href="/" class="cta-btn">开始使用</a>
  <p class="cta-brand">一亿中流 · 私董会项目投资平台</p>
</div>

<script>
(function(){
  var items = document.querySelectorAll('.step, .result');
  if(!items.length) return;
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var d = parseInt(e.target.dataset.delay||'0',10);
        setTimeout(function(){ e.target.classList.add('visible'); }, d);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  var idx = 0;
  items.forEach(function(el){
    el.dataset.delay = String(idx * 100);
    observer.observe(el);
    idx++;
  });
})();
</script>

</body>
</html>`)
})


// ════════════════════════════════════════════════════════════
// PAGE 2: Teacher Guide  (/guide/teacher)
// ════════════════════════════════════════════════════════════
guide.get('/teacher', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<title>老师使用指南 — 中流通</title>
<link rel="icon" type="image/svg+xml" href="/favicon.ico">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#FAFAF9;font-family:-apple-system,BlinkMacSystemFont,'Inter','SF Pro Display','Segoe UI','Roboto','Noto Sans SC',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{text-decoration:none;color:inherit}

.guide-nav{position:fixed;top:0;left:0;right:0;z-index:100;height:48px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,0,0,0.04)}
.guide-nav-left{display:flex;align-items:center;gap:8px;cursor:pointer}
.guide-nav-left svg{width:18px;height:18px;color:#44403C}
.guide-nav-left span{font-size:14px;color:#44403C;font-weight:500}
.guide-nav-right{font-size:13px;color:#A8A29E;cursor:pointer}

.guide-hero{min-height:max(50vh,320px);background:linear-gradient(160deg,#7F1D1D,#B91C1C,#991B1B);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:88px 32px 40px;opacity:0;transform:translateY(30px);animation:heroIn 800ms ease-out forwards}
.guide-hero-tag{font-size:12px;color:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.2);border-radius:20px;padding:4px 14px;margin-bottom:16px;display:inline-block}
.guide-hero-title{font-size:28px;font-weight:800;color:white;line-height:1.3}
.guide-hero-sub{margin-top:12px;font-size:15px;color:rgba(255,255,255,0.7)}
.guide-hero-arrow{margin-top:28px;animation:arrowBounce 2s ease-in-out infinite}
.guide-hero-arrow svg{width:24px;height:24px;color:rgba(255,255,255,0.5)}
@keyframes heroIn{to{opacity:1;transform:translateY(0)}}
@keyframes arrowBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(10px)}}

.section-title{padding:32px 16px 16px}
.section-tag{font-size:12px;color:#D4A853;font-weight:600}
.section-h2{font-size:22px;font-weight:800;color:#1C1917;margin-top:4px}
.section-desc{font-size:14px;color:#78716C;margin-top:6px}

.timeline{padding:0 16px}
.step{padding-left:36px;position:relative;opacity:0;transform:translateY(40px);transition:opacity 500ms ease-out,transform 500ms ease-out}
.step.visible{opacity:1;transform:translateY(0)}
.step-circle{position:absolute;left:0;top:0;width:36px;height:36px;background:#B91C1C;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;font-weight:700;box-shadow:0 2px 8px rgba(185,28,28,0.3);z-index:2}
.step-line{position:absolute;left:17px;top:36px;bottom:0;width:2px;background:linear-gradient(180deg,#B91C1C,#D4A853)}
.step:last-child .step-line{display:none}
.step-card{margin-left:20px;background:white;border-radius:18px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,0.04);margin-bottom:32px}
.step-card h3{font-size:18px;font-weight:700;color:#1C1917}
.step-desc{font-size:14px;color:#57534E;line-height:1.7;margin-top:8px}
.mock{margin-top:16px;background:#F8F7F6;border-radius:14px;padding:16px;border:1px solid #E7E5E4;overflow:hidden}
.tip{margin-top:12px;font-size:12px;color:#B91C1C;background:rgba(185,28,28,0.05);border-radius:8px;padding:8px 12px;line-height:1.5}

.result{background:linear-gradient(135deg,rgba(212,168,83,0.1),rgba(212,168,83,0.05));border:1px solid rgba(212,168,83,0.3);border-radius:16px;padding:20px;text-align:center;margin:0 16px;opacity:0;transform:translateY(40px);transition:opacity 500ms ease-out,transform 500ms ease-out}
.result.visible{opacity:1;transform:translateY(0)}
.result-icon{font-size:28px}
.result-text{font-size:15px;color:#44403C;font-weight:500;margin-top:8px;line-height:1.6}

.divider{height:1px;width:60px;margin:40px auto;background:linear-gradient(90deg,transparent,#D4A853,transparent)}

.wide-card{background:linear-gradient(135deg,rgba(185,28,28,0.05),rgba(212,168,83,0.05));border-radius:18px;padding:28px;margin:0 16px;text-align:center;opacity:0;transform:translateY(40px);transition:opacity 500ms ease-out,transform 500ms ease-out}
.wide-card.visible{opacity:1;transform:translateY(0)}
.wide-card h3{font-size:18px;font-weight:700;color:#1C1917}
.icon-circle{width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px}

.cta{padding:40px 16px 60px;text-align:center}
.cta-text{font-size:16px;color:#44403C;font-weight:500}
.cta-btn{display:inline-block;margin-top:16px;background:linear-gradient(135deg,#B91C1C,#991B1B);color:white;border-radius:14px;padding:16px 32px;font-size:16px;font-weight:700;box-shadow:0 4px 16px rgba(185,28,28,0.3);border:none;cursor:pointer;transition:transform 0.15s}
.cta-btn:active{transform:scale(0.97)}
.cta-brand{margin-top:12px;font-size:12px;color:#A8A29E}

.wf{height:8px;border-radius:4px;background:#D6D3D1}
.wf-avatar{width:28px;height:28px;border-radius:50%;background:#D6D3D1;flex-shrink:0}
.wf-avatar-sm{width:20px;height:20px;border-radius:50%;background:#D6D3D1;flex-shrink:0}
.wf-btn{border-radius:8px;padding:8px 16px;font-size:11px;font-weight:600;text-align:center;color:white;background:#B91C1C}

::-webkit-scrollbar{width:0;height:0}
</style>
</head>
<body>

<!-- Nav -->
<nav class="guide-nav">
  <div class="guide-nav-left" onclick="history.back()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
    <span>使用指南</span>
  </div>
  <a class="guide-nav-right" href="/teacher">跳过</a>
</nav>

<!-- Hero -->
<section class="guide-hero">
  <span class="guide-hero-tag">老师指南</span>
  <h1 class="guide-hero-title">作为老师，<br>您是信任的桥梁</h1>
  <p class="guide-hero-sub">管理班级 · 引荐对接 · 推荐项目 · 参与投资</p>
  <div class="guide-hero-arrow">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
  </div>
</section>

<!-- ═══ Line 1: 班级管理日常 ═══ -->
<div class="section-title">
  <div class="section-tag">主线一</div>
  <h2 class="section-h2">班级管理日常</h2>
  <p class="section-desc">从工作台到引荐再到推荐，三步闭环</p>
</div>

<div class="timeline">

  <!-- Step 1 -->
  <div class="step" data-delay="0">
    <div class="step-circle">1</div>
    <div class="step-line"></div>
    <div class="step-card">
      <h3>📋 查看班级概况</h3>
      <p class="step-desc">登录后首页即是您的班级工作台。一眼看到待处理引荐、推荐项目数、班级活跃项目。</p>
      <div class="mock">
        <!-- 3 KPI blocks -->
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <div style="flex:1;background:white;border-radius:8px;padding:10px;text-align:center;border:1px solid #E7E5E4">
            <div style="font-size:20px;font-weight:800;color:#B91C1C">3</div>
            <div style="font-size:9px;color:#78716C;margin-top:2px">待引荐</div>
          </div>
          <div style="flex:1;background:white;border-radius:8px;padding:10px;text-align:center;border:1px solid #E7E5E4">
            <div style="font-size:20px;font-weight:800;color:#D4A853">5</div>
            <div style="font-size:9px;color:#78716C;margin-top:2px">已推荐</div>
          </div>
          <div style="flex:1;background:white;border-radius:8px;padding:10px;text-align:center;border:1px solid #E7E5E4">
            <div style="font-size:20px;font-weight:800;color:#1C1917">8</div>
            <div style="font-size:9px;color:#78716C;margin-top:2px">活跃项目</div>
          </div>
        </div>
        <!-- List -->
        <div style="display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;align-items:center;gap:8px;background:white;border-radius:6px;padding:8px;border:1px solid #F0EDEB"><div class="wf-avatar-sm"></div><div class="wf" style="flex:1;height:6px"></div><div style="width:6px;height:6px;border-radius:50%;background:#B91C1C"></div></div>
          <div style="display:flex;align-items:center;gap:8px;background:white;border-radius:6px;padding:8px;border:1px solid #F0EDEB"><div class="wf-avatar-sm"></div><div class="wf" style="flex:1;height:6px"></div></div>
          <div style="display:flex;align-items:center;gap:8px;background:white;border-radius:6px;padding:8px;border:1px solid #F0EDEB"><div class="wf-avatar-sm"></div><div class="wf" style="flex:1;height:6px"></div></div>
        </div>
      </div>
      <div class="tip">💡 工作台顶部实时显示待处理事项数量，不漏掉任何学员请求</div>
    </div>
  </div>

  <!-- Step 2 -->
  <div class="step" data-delay="100">
    <div class="step-circle">2</div>
    <div class="step-line"></div>
    <div class="step-card">
      <h3>🤝 处理引荐请求</h3>
      <p class="step-desc">学员 A 看到学员 B 的项目，想了解更多，请您帮忙引荐。您收到通知后安排线下对接——咖啡会、微信拉群或电话介绍，灵活选择。对接完成后在系统中标记即可。</p>
      <div class="mock">
        <!-- Referral request card -->
        <div style="background:white;border-radius:10px;padding:14px;border:1px solid #E7E5E4;display:flex;align-items:center;gap:12px">
          <div class="wf-avatar" style="width:36px;height:36px"></div>
          <div style="flex:1">
            <div style="font-size:12px;color:#1C1917;font-weight:600">张学员 → 李学员的项目</div>
            <div style="font-size:10px;color:#A8A29E;margin-top:2px">希望老师帮忙介绍对接</div>
          </div>
          <div style="background:#B91C1C;color:white;font-size:10px;font-weight:600;padding:6px 12px;border-radius:8px;flex-shrink:0">已对接</div>
        </div>
      </div>
      <div class="tip">💡 线上发起，线下完成——系统只做记录，不干预您的对接方式</div>
    </div>
  </div>

  <!-- Step 3 -->
  <div class="step" data-delay="200">
    <div class="step-circle">3</div>
    <div class="step-line" style="display:none"></div>
    <div class="step-card">
      <h3>⭐ 推荐优质项目</h3>
      <p class="step-desc">发现学员的好项目后，标记为「老师推荐」。您班级的学员在项目大厅中会优先看到这些项目，并带有醒目的金色推荐标签。</p>
      <div class="mock">
        <!-- Project card with gold badge -->
        <div style="background:white;border-radius:10px;padding:14px;border:1px solid #E7E5E4;position:relative">
          <div style="position:absolute;top:10px;right:10px;display:flex;align-items:center;gap:4px;background:rgba(212,168,83,0.12);border:1px solid rgba(212,168,83,0.3);border-radius:6px;padding:3px 8px">
            <span style="font-size:10px">⭐</span>
            <span style="font-size:9px;color:#B8860B;font-weight:600">老师推荐</span>
          </div>
          <div style="font-size:13px;color:#1C1917;font-weight:700;margin-bottom:6px">智能制造产业园项目</div>
          <div class="wf" style="width:80%;margin-bottom:4px;height:6px"></div>
          <div class="wf" style="width:65%;height:6px;margin-bottom:10px"></div>
          <div style="display:flex;gap:12px">
            <div><div style="font-size:9px;color:#A8A29E">融资额</div><div style="font-size:12px;color:#1C1917;font-weight:700">¥200万</div></div>
            <div><div style="font-size:9px;color:#A8A29E">分成比例</div><div style="font-size:12px;color:#B91C1C;font-weight:700">2.1%</div></div>
          </div>
        </div>
      </div>
      <div class="tip">💡 您的推荐是学员信任决策的重要参考</div>
    </div>
  </div>

</div>

<!-- Result -->
<div class="result" data-delay="0">
  <div class="result-icon">🏆</div>
  <p class="result-text">您管理2个班级共38位学员，完成5次引荐对接，<br>推荐了3个优质项目</p>
</div>

<!-- Divider -->
<div class="divider"></div>

<!-- ═══ Line 2: 您也是企业家 ═══ -->
<div class="section-title" style="padding-bottom:24px">
  <div class="section-tag">主线二</div>
  <h2 class="section-h2">您也是企业家</h2>
</div>

<div class="wide-card" data-delay="0">
  <h3>作为企业家，您同样可以</h3>
  <div style="display:flex;justify-content:center;gap:24px;margin-top:20px">
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <div class="icon-circle" style="background:rgba(185,28,28,0.1)">📝</div>
      <div style="font-size:12px;color:#44403C;font-weight:600">发起项目</div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <div class="icon-circle" style="background:rgba(212,168,83,0.15)">💰</div>
      <div style="font-size:12px;color:#44403C;font-weight:600">参与投资</div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <div class="icon-circle" style="background:rgba(34,197,94,0.1)">📈</div>
      <div style="font-size:12px;color:#44403C;font-weight:600">追踪回款</div>
    </div>
  </div>
  <p style="margin-top:16px;font-size:13px;color:#78716C">流程与学员完全一致，您不仅是桥梁，也是参与者</p>
</div>

<!-- CTA -->
<div class="cta">
  <p class="cta-text">已经了解了？进入工作台吧！</p>
  <a href="/teacher" class="cta-btn">进入我的工作台</a>
  <p class="cta-brand">一亿中流 · 私董会项目投资平台</p>
</div>

<script>
(function(){
  var items = document.querySelectorAll('.step, .result, .wide-card');
  if(!items.length) return;
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var d = parseInt(e.target.dataset.delay||'0',10);
        setTimeout(function(){ e.target.classList.add('visible'); }, d);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  var idx = 0;
  items.forEach(function(el){
    el.dataset.delay = String(idx * 100);
    observer.observe(el);
    idx++;
  });
})();
</script>

</body>
</html>`)
})


// ════════════════════════════════════════════════════════════
// PAGE 3: Admin Guide  (/guide/admin)
// ════════════════════════════════════════════════════════════
guide.get('/admin', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<title>管理员使用指南 — 中流通</title>
<link rel="icon" type="image/svg+xml" href="/favicon.ico">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#FAFAF9;font-family:-apple-system,BlinkMacSystemFont,'Inter','SF Pro Display','Segoe UI','Roboto','Noto Sans SC',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{text-decoration:none;color:inherit}

.guide-nav{position:fixed;top:0;left:0;right:0;z-index:100;height:48px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,0,0,0.04)}
.guide-nav-left{display:flex;align-items:center;gap:8px;cursor:pointer}
.guide-nav-left svg{width:18px;height:18px;color:#44403C}
.guide-nav-left span{font-size:14px;color:#44403C;font-weight:500}
.guide-nav-right{font-size:13px;color:#A8A29E;cursor:pointer}

.guide-hero{min-height:max(50vh,320px);background:linear-gradient(160deg,#7F1D1D,#B91C1C,#991B1B);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:88px 32px 40px;opacity:0;transform:translateY(30px);animation:heroIn 800ms ease-out forwards}
.guide-hero-tag{font-size:12px;color:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.2);border-radius:20px;padding:4px 14px;margin-bottom:16px;display:inline-block}
.guide-hero-title{font-size:28px;font-weight:800;color:white;line-height:1.3}
.guide-hero-sub{margin-top:12px;font-size:15px;color:rgba(255,255,255,0.7)}
.guide-hero-arrow{margin-top:28px;animation:arrowBounce 2s ease-in-out infinite}
.guide-hero-arrow svg{width:24px;height:24px;color:rgba(255,255,255,0.5)}
@keyframes heroIn{to{opacity:1;transform:translateY(0)}}
@keyframes arrowBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(10px)}}

.section-title{padding:32px 16px 16px}
.section-tag{font-size:12px;color:#D4A853;font-weight:600}
.section-h2{font-size:22px;font-weight:800;color:#1C1917;margin-top:4px}

/* Module cards */
.mod{margin:0 16px 24px;background:white;border-radius:18px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,0.04);opacity:0;transform:translateY(40px);transition:opacity 500ms ease-out,transform 500ms ease-out}
.mod.visible{opacity:1;transform:translateY(0)}
.mod-num{font-size:48px;font-weight:800;color:rgba(185,28,28,0.1);line-height:1}
.mod h3{font-size:20px;font-weight:700;color:#1C1917;margin-top:4px}
.mod-desc{font-size:14px;color:#57534E;line-height:1.7;margin-top:8px}
.mock{margin-top:16px;background:#F8F7F6;border-radius:14px;padding:16px;border:1px solid #E7E5E4;overflow:hidden}
.tip{margin-top:12px;font-size:12px;color:#B91C1C;background:rgba(185,28,28,0.05);border-radius:8px;padding:8px 12px;line-height:1.5}

.cta{padding:40px 16px 60px;text-align:center}
.cta-sub{font-size:13px;color:#78716C;margin-bottom:4px}
.cta-btn{display:inline-block;margin-top:16px;background:linear-gradient(135deg,#B91C1C,#991B1B);color:white;border-radius:14px;padding:16px 32px;font-size:16px;font-weight:700;box-shadow:0 4px 16px rgba(185,28,28,0.3);border:none;cursor:pointer;transition:transform 0.15s}
.cta-btn:active{transform:scale(0.97)}
.cta-brand{margin-top:12px;font-size:12px;color:#A8A29E}

.wf{height:8px;border-radius:4px;background:#D6D3D1}
.wf-avatar{width:28px;height:28px;border-radius:50%;background:#D6D3D1;flex-shrink:0}
.wf-avatar-sm{width:20px;height:20px;border-radius:50%;background:#D6D3D1;flex-shrink:0}
.wf-avatar-lg{width:40px;height:40px;border-radius:50%;background:#D6D3D1;flex-shrink:0}
.wf-btn{border-radius:8px;padding:8px 16px;font-size:11px;font-weight:600;text-align:center;color:white;background:#B91C1C}
.wf-input{background:#EEECEB;border-radius:8px;height:32px;width:100%;display:block}
.wf-badge{font-size:9px;padding:2px 6px;border-radius:4px;font-weight:600;display:inline-block}

::-webkit-scrollbar{width:0;height:0}
</style>
</head>
<body>

<!-- Nav -->
<nav class="guide-nav">
  <div class="guide-nav-left" onclick="history.back()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
    <span>使用指南</span>
  </div>
  <a class="guide-nav-right" href="/admin">跳过</a>
</nav>

<!-- Hero -->
<section class="guide-hero">
  <span class="guide-hero-tag">管理员指南</span>
  <h1 class="guide-hero-title">作为管理员，<br>您掌握全局</h1>
  <p class="guide-hero-sub">学员注册 · 班级管理 · 老师分配 · 平台监控</p>
  <div class="guide-hero-arrow">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
  </div>
</section>

<div class="section-title">
  <div class="section-tag">功能模块</div>
  <h2 class="section-h2">五大核心管理能力</h2>
</div>

<!-- ═══ Module 1: 批量注册学员 ═══ -->
<div class="mod" data-delay="0">
  <div class="mod-num">01</div>
  <h3>批量注册学员</h3>
  <p class="mod-desc">输入学员姓名和手机号，选择所属班级，一键批量创建账户。学员收到邀请后即可登录使用。</p>
  <div class="mock">
    <!-- Dropdown -->
    <div style="margin-bottom:10px">
      <div style="font-size:10px;color:#A8A29E;margin-bottom:4px">选择班级</div>
      <div style="background:white;border:1px solid #E7E5E4;border-radius:8px;height:32px;display:flex;align-items:center;padding:0 10px;justify-content:space-between">
        <div style="font-size:11px;color:#1C1917">一期班 — 北京</div>
        <div style="font-size:10px;color:#A8A29E">▼</div>
      </div>
    </div>
    <!-- Multi-line input area -->
    <div style="margin-bottom:10px">
      <div style="font-size:10px;color:#A8A29E;margin-bottom:4px">学员信息（每行一位）</div>
      <div style="background:white;border:1px solid #E7E5E4;border-radius:8px;padding:8px 10px;min-height:60px">
        <div style="font-size:10px;color:#57534E;line-height:1.8">张三 138****1234<br>李四 139****5678<br>王五 136****9012</div>
      </div>
    </div>
    <div class="wf-btn" style="width:100%;padding:10px 0;border-radius:10px;font-size:12px">一键注册 3 人</div>
  </div>
  <div class="tip">💡 支持一次注册多位学员，也可随时新建班级</div>
</div>

<!-- ═══ Module 2: 班级全景管理 ═══ -->
<div class="mod" data-delay="100">
  <div class="mod-num">02</div>
  <h3>班级全景管理</h3>
  <p class="mod-desc">查看每个班级的学员数、项目数、融资额、投资额。点击展开查看班级成员详情。为班级分配负责老师。</p>
  <div class="mock">
    <div style="display:flex;flex-direction:column;gap:10px">
      <!-- Class card 1 -->
      <div style="background:white;border-radius:10px;padding:12px;border:1px solid #E7E5E4">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div style="font-size:13px;color:#1C1917;font-weight:700">一期班 — 北京</div>
          <div style="font-size:9px;color:#A8A29E">张老师 负责</div>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:8px">
          <div><div style="font-size:9px;color:#A8A29E">学员</div><div style="font-size:14px;color:#1C1917;font-weight:700">18</div></div>
          <div><div style="font-size:9px;color:#A8A29E">项目</div><div style="font-size:14px;color:#B91C1C;font-weight:700">6</div></div>
          <div><div style="font-size:9px;color:#A8A29E">融资额</div><div style="font-size:14px;color:#D4A853;font-weight:700">¥850万</div></div>
        </div>
        <div style="display:flex;gap:4px">
          <div class="wf-avatar-sm"></div><div class="wf-avatar-sm"></div><div class="wf-avatar-sm"></div><div class="wf-avatar-sm"></div><div class="wf-avatar-sm"></div>
          <div style="width:20px;height:20px;border-radius:50%;background:#EEECEB;display:flex;align-items:center;justify-content:center;font-size:8px;color:#A8A29E">+13</div>
        </div>
      </div>
      <!-- Class card 2 -->
      <div style="background:white;border-radius:10px;padding:12px;border:1px solid #E7E5E4">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div style="font-size:13px;color:#1C1917;font-weight:700">二期班 — 上海</div>
          <div style="font-size:9px;color:#A8A29E">李老师 负责</div>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:8px">
          <div><div style="font-size:9px;color:#A8A29E">学员</div><div style="font-size:14px;color:#1C1917;font-weight:700">20</div></div>
          <div><div style="font-size:9px;color:#A8A29E">项目</div><div style="font-size:14px;color:#B91C1C;font-weight:700">8</div></div>
          <div><div style="font-size:9px;color:#A8A29E">融资额</div><div style="font-size:14px;color:#D4A853;font-weight:700">¥1200万</div></div>
        </div>
        <div style="display:flex;gap:4px">
          <div class="wf-avatar-sm"></div><div class="wf-avatar-sm"></div><div class="wf-avatar-sm"></div><div class="wf-avatar-sm"></div><div class="wf-avatar-sm"></div><div class="wf-avatar-sm"></div>
          <div style="width:20px;height:20px;border-radius:50%;background:#EEECEB;display:flex;align-items:center;justify-content:center;font-size:8px;color:#A8A29E">+14</div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ═══ Module 3: 老师团队管理 ═══ -->
<div class="mod" data-delay="200">
  <div class="mod-num">03</div>
  <h3>老师团队管理</h3>
  <p class="mod-desc">查看每位老师负责的班级、管理的学员数、引荐对接记录、推荐项目数。全面了解老师的工作贡献。</p>
  <div class="mock">
    <div style="background:white;border-radius:10px;padding:14px;border:1px solid #E7E5E4;display:flex;align-items:center;gap:14px">
      <div class="wf-avatar-lg"></div>
      <div style="flex:1;display:flex;flex-wrap:wrap;gap:8px 16px">
        <div><div style="font-size:9px;color:#A8A29E">负责班级</div><div style="font-size:14px;color:#1C1917;font-weight:700">2个</div></div>
        <div><div style="font-size:9px;color:#A8A29E">管理学员</div><div style="font-size:14px;color:#1C1917;font-weight:700">38人</div></div>
        <div><div style="font-size:9px;color:#A8A29E">引荐对接</div><div style="font-size:14px;color:#B91C1C;font-weight:700">5次</div></div>
        <div><div style="font-size:9px;color:#A8A29E">推荐项目</div><div style="font-size:14px;color:#D4A853;font-weight:700">3个</div></div>
      </div>
    </div>
  </div>
</div>

<!-- ═══ Module 4: 实时数据总览 ═══ -->
<div class="mod" data-delay="300">
  <div class="mod-num">04</div>
  <h3>实时数据总览</h3>
  <p class="mod-desc">总学员数、总项目数、总融资规模、总回款金额、项目状态分布——所有关键指标一个页面掌握。</p>
  <div class="mock">
    <!-- 6 KPI grid -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
      <div style="background:white;border-radius:8px;padding:10px;text-align:center;border:1px solid #E7E5E4">
        <div style="font-size:18px;font-weight:800;color:#1C1917">58</div>
        <div style="font-size:9px;color:#78716C;margin-top:1px">总学员</div>
      </div>
      <div style="background:white;border-radius:8px;padding:10px;text-align:center;border:1px solid #E7E5E4">
        <div style="font-size:18px;font-weight:800;color:#B91C1C">14</div>
        <div style="font-size:9px;color:#78716C;margin-top:1px">总项目</div>
      </div>
      <div style="background:white;border-radius:8px;padding:10px;text-align:center;border:1px solid #E7E5E4">
        <div style="font-size:18px;font-weight:800;color:#D4A853">3</div>
        <div style="font-size:9px;color:#78716C;margin-top:1px">总老师</div>
      </div>
      <div style="background:white;border-radius:8px;padding:10px;text-align:center;border:1px solid #E7E5E4">
        <div style="font-size:14px;font-weight:800;color:#1C1917">¥2050万</div>
        <div style="font-size:9px;color:#78716C;margin-top:1px">融资规模</div>
      </div>
      <div style="background:white;border-radius:8px;padding:10px;text-align:center;border:1px solid #E7E5E4">
        <div style="font-size:14px;font-weight:800;color:#22C55E">¥340万</div>
        <div style="font-size:9px;color:#78716C;margin-top:1px">总回款</div>
      </div>
      <div style="background:white;border-radius:8px;padding:10px;text-align:center;border:1px solid #E7E5E4">
        <div style="font-size:14px;font-weight:800;color:#1C1917">32</div>
        <div style="font-size:9px;color:#78716C;margin-top:1px">总合同</div>
      </div>
    </div>
    <!-- Stacked bar chart -->
    <div style="background:white;border-radius:8px;padding:10px;border:1px solid #E7E5E4">
      <div style="font-size:10px;color:#78716C;margin-bottom:6px">项目状态分布</div>
      <div style="height:16px;border-radius:8px;overflow:hidden;display:flex">
        <div style="width:40%;background:#22C55E"></div>
        <div style="width:25%;background:#D4A853"></div>
        <div style="width:20%;background:#B91C1C"></div>
        <div style="width:15%;background:#A8A29E"></div>
      </div>
      <div style="display:flex;gap:10px;margin-top:6px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:3px"><div style="width:6px;height:6px;border-radius:50%;background:#22C55E"></div><div style="font-size:8px;color:#78716C">进行中</div></div>
        <div style="display:flex;align-items:center;gap:3px"><div style="width:6px;height:6px;border-radius:50%;background:#D4A853"></div><div style="font-size:8px;color:#78716C">募资中</div></div>
        <div style="display:flex;align-items:center;gap:3px"><div style="width:6px;height:6px;border-radius:50%;background:#B91C1C"></div><div style="font-size:8px;color:#78716C">已完成</div></div>
        <div style="display:flex;align-items:center;gap:3px"><div style="width:6px;height:6px;border-radius:50%;background:#A8A29E"></div><div style="font-size:8px;color:#78716C">已终止</div></div>
      </div>
    </div>
  </div>
  <div class="tip">💡 所有数字动态计算，实时反映平台最新状态</div>
</div>

<!-- ═══ Module 5: 项目全量监控 ═══ -->
<div class="mod" data-delay="400">
  <div class="mod-num">05</div>
  <h3>项目全量监控</h3>
  <p class="mod-desc">以表格视图查看所有项目的状态、融资进度、回款金额、参与人数。支持按状态筛选，点击展开查看详情。</p>
  <div class="mock" style="overflow-x:auto">
    <table style="width:100%;border-collapse:collapse;font-size:10px;min-width:300px">
      <thead>
        <tr style="border-bottom:1px solid #E7E5E4">
          <th style="text-align:left;padding:6px 4px;color:#A8A29E;font-weight:500">项目名称</th>
          <th style="text-align:left;padding:6px 4px;color:#A8A29E;font-weight:500">状态</th>
          <th style="text-align:left;padding:6px 4px;color:#A8A29E;font-weight:500">进度</th>
          <th style="text-align:right;padding:6px 4px;color:#A8A29E;font-weight:500">参与人</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid #F5F5F4">
          <td style="padding:8px 4px;color:#1C1917;font-weight:600">智能制造园</td>
          <td style="padding:8px 4px"><span class="wf-badge" style="background:rgba(34,197,94,0.12);color:#16A34A">进行中</span></td>
          <td style="padding:8px 4px"><div style="width:60px;height:5px;background:#EEECEB;border-radius:3px;overflow:hidden"><div style="width:75%;height:100%;background:#22C55E;border-radius:3px"></div></div></td>
          <td style="padding:8px 4px;text-align:right;color:#57534E">8人</td>
        </tr>
        <tr style="border-bottom:1px solid #F5F5F4">
          <td style="padding:8px 4px;color:#1C1917;font-weight:600">连锁餐饮品牌</td>
          <td style="padding:8px 4px"><span class="wf-badge" style="background:rgba(212,168,83,0.15);color:#B8860B">募资中</span></td>
          <td style="padding:8px 4px"><div style="width:60px;height:5px;background:#EEECEB;border-radius:3px;overflow:hidden"><div style="width:40%;height:100%;background:#D4A853;border-radius:3px"></div></div></td>
          <td style="padding:8px 4px;text-align:right;color:#57534E">3人</td>
        </tr>
        <tr>
          <td style="padding:8px 4px;color:#1C1917;font-weight:600">医疗科技项目</td>
          <td style="padding:8px 4px"><span class="wf-badge" style="background:rgba(185,28,28,0.08);color:#B91C1C">已完成</span></td>
          <td style="padding:8px 4px"><div style="width:60px;height:5px;background:#EEECEB;border-radius:3px;overflow:hidden"><div style="width:100%;height:100%;background:#B91C1C;border-radius:3px"></div></div></td>
          <td style="padding:8px 4px;text-align:right;color:#57534E">12人</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<!-- CTA -->
<div class="cta">
  <p class="cta-sub">管理员专注于平台运营与监控，不参与项目发起和投资</p>
  <a href="/admin" class="cta-btn">进入管理工作台</a>
  <p class="cta-brand">一亿中流 · 私董会项目投资平台</p>
</div>

<script>
(function(){
  var items = document.querySelectorAll('.mod');
  if(!items.length) return;
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var d = parseInt(e.target.dataset.delay||'0',10);
        setTimeout(function(){ e.target.classList.add('visible'); }, d);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  var idx = 0;
  items.forEach(function(el){
    el.dataset.delay = String(idx * 100);
    observer.observe(el);
    idx++;
  });
})();
</script>

</body>
</html>`)
})

export default guide
