import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children, title }) => {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>{title || '中流通'}</title>

        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><circle cx='44' cy='28' r='22' fill='%23DC2626'/><circle cx='36' cy='44' r='22' fill='%23991B1B' opacity='0.85'/></svg>" />

        {/* DNS Prefetch for CDN domains */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />

        {/* Tailwind CSS (locally built, production-ready) — loaded first, no network */}
        <link rel="stylesheet" href="/static/tailwind.css" />

        {/* Google Fonts — only essential weights, swap for instant text rendering */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* FontAwesome — deferred with media trick */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          media="print"
          onload="this.media='all'"
        />

        {/* Global Styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
/* ══════════════════════════════════════════════════
   Base
   ══════════════════════════════════════════════════ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', 'Segoe UI', 'Roboto', 'Noto Sans SC', sans-serif; background: #FAFAF9; }

/* ══════════════════════════════════════════════════
   Desktop 480px centered container
   ══════════════════════════════════════════════════ */
.app-container {
  max-width: 480px; margin: 0 auto; min-height: 100vh;
  background: #FAFAF9; position: relative;
  box-shadow: 0 0 40px rgba(0,0,0,0.08);
}
@media (max-width: 640px) {
  .app-container { max-width: 100%; box-shadow: none; }
}

/* ══════════════════════════════════════════════════
   Page Enter Animation
   ══════════════════════════════════════════════════ */
.page-enter {
  animation: pageEnter 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes pageEnter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ══════════════════════════════════════════════════
   Scroll Reveal (IntersectionObserver)
   ══════════════════════════════════════════════════ */
.reveal {
  opacity: 0; transform: translateY(24px);
  transition: opacity 0.5s cubic-bezier(0.19,1,0.22,1), transform 0.5s cubic-bezier(0.19,1,0.22,1);
}
.reveal.visible { opacity: 1; transform: translateY(0); }
.stagger-1 { transition-delay: 0.05s; }
.stagger-2 { transition-delay: 0.10s; }
.stagger-3 { transition-delay: 0.15s; }
.stagger-4 { transition-delay: 0.20s; }
.stagger-5 { transition-delay: 0.25s; }
.stagger-6 { transition-delay: 0.30s; }
.stagger-7 { transition-delay: 0.35s; }
.stagger-8 { transition-delay: 0.40s; }

/* ══════════════════════════════════════════════════
   Loading Spinner
   ══════════════════════════════════════════════════ */
.spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; vertical-align: middle; }
.page-spinner { width:32px; height:32px; border:3px solid #FEE2E2; border-top-color:#B91C1C; border-radius:50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════════════════════════
   Login Background
   ══════════════════════════════════════════════════ */
.login-bg {
  position: fixed; inset: 0;
  background: linear-gradient(160deg, #991B1B 0%, #B91C1C 25%, #7F1D1D 60%, #581C1C 100%);
  overflow: hidden;
}
.login-bg::before {
  content: '';
  position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 60%, rgba(255,255,255,0.05) 0%, transparent 40%);
  animation: silk-shimmer 15s ease-in-out infinite;
  pointer-events: none;
}
@keyframes silk-shimmer {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(3deg) scale(1.05); }
}
.login-bg::before { will-change: transform; }

/* Glass Card */
.glass-card {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(32px) saturate(120%);
  -webkit-backdrop-filter: blur(32px) saturate(120%);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 24px;
}

/* Login Inputs */
.login-input {
  width: 100%;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 12px;
  padding: 14px 16px 14px 44px;
  color: #FAFAF9;
  font-size: 15px;
  outline: none;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.login-input::placeholder { color: rgba(255,255,255,0.4); }
.login-input:focus {
  border-color: rgba(212,168,83,0.6);
  box-shadow: 0 0 0 3px rgba(212,168,83,0.15);
}

/* ══════════════════════════════════════════════════
   Buttons
   ══════════════════════════════════════════════════ */
.btn-gold {
  width: 100%; height: 48px;
  background: linear-gradient(135deg, #D4A853, #B8860B);
  color: #FAFAF9; font-weight: 700; font-size: 16px;
  border: none; border-radius: 12px; cursor: pointer;
  transition: transform 0.15s, box-shadow 0.25s, opacity 0.25s;
  position: relative; overflow: hidden;
}
.btn-gold:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(212,168,83,0.35); }
.btn-gold:active { transform: translateY(0); }
.btn-gold:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }

.btn-code {
  white-space: nowrap; background: transparent;
  border: 1px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.85);
  border-radius: 12px; padding: 0 16px; height: 48px; font-size: 13px;
  cursor: pointer; transition: background 0.2s, border-color 0.2s; flex-shrink: 0;
}
.btn-code:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.4); }
.btn-code:disabled { opacity: 0.45; cursor: not-allowed; background: transparent; }

.btn-secondary {
  flex: 1; height: 48px; background: #F5F5F4; color: #78716C;
  font-weight: 600; font-size: 15px; border: none; border-radius: 12px;
  cursor: pointer; transition: background 0.2s;
}
.btn-secondary:hover { background: #E7E5E4; }
.btn-primary {
  flex: 1; height: 48px; background: #B91C1C; color: #fff;
  font-weight: 600; font-size: 15px; border: none; border-radius: 12px;
  cursor: pointer; transition: background 0.2s, transform 0.15s;
}
.btn-primary:hover { background: #991B1B; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* ══════════════════════════════════════════════════
   Global Toast
   ══════════════════════════════════════════════════ */
.toast {
  position: fixed; top: 0; left: 50%; transform: translateX(-50%) translateY(-100%);
  z-index: 9999; padding: 12px 24px; border-radius: 0 0 12px 12px;
  font-size: 14px; font-weight: 500; color: white;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}
.toast.show { transform: translateX(-50%) translateY(0); pointer-events: auto; }
.toast-success { background: #16A34A; }
.toast-error { background: #DC2626; }
.toast-info { background: #3B82F6; }

/* ══════════════════════════════════════════════════
   Confirm Modal (unified)
   ══════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none;
  transition: opacity 0.2s;
  padding: 20px;
  will-change: opacity;
  contain: layout style;
}
.modal-overlay.show { opacity: 1; pointer-events: auto; }
.modal-box {
  background: #fff; border-radius: 20px; padding: 28px;
  max-width: 360px; width: 100%; text-align: center;
  transform: scale(0.95); opacity: 0;
  transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), opacity 0.2s;
  will-change: transform, opacity;
}
.modal-overlay.show .modal-box { transform: scale(1); opacity: 1; }
.modal-title { font-size: 18px; font-weight: 600; color: #1C1917; }
.modal-desc { font-size: 14px; color: #78716C; margin-top: 8px; }
.modal-btn-row { display: flex; gap: 12px; margin-top: 24px; }
.modal-btn {
  flex: 1; height: 44px; border-radius: 10px; font-size: 15px; font-weight: 600;
  border: none; cursor: pointer; transition: opacity 0.2s;
}
.modal-btn:hover { opacity: 0.88; }
.modal-btn-cancel { background: #F5F5F4; color: #78716C; border: 1px solid #E7E5E4; }
.modal-btn-confirm { background: linear-gradient(135deg, #D4A853, #B8860B); color: #fff; }
.modal-btn-danger { background: #DC2626; color: #fff; }

/* ══════════════════════════════════════════════════
   Success Modal (participate / sign)
   ══════════════════════════════════════════════════ */
.success-modal-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none;
  transition: opacity 0.2s;
  will-change: opacity;
  contain: layout style;
}
.success-modal-overlay.show { opacity: 1; pointer-events: auto; }
.success-modal-box {
  background: #fff; border-radius: 24px; padding: 32px;
  max-width: 320px; width: 90%; text-align: center;
}
.success-icon-green {
  font-size: 64px; color: #16A34A;
  animation: iconPop 0.5s cubic-bezier(0.16,1,0.3,1);
}
.success-icon-gold {
  font-size: 64px; color: #D4A853;
  animation: iconPop 0.5s cubic-bezier(0.16,1,0.3,1);
}
@keyframes iconPop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
.success-title { font-size: 20px; font-weight: 700; color: #1C1917; margin-top: 16px; }
.success-sub { font-size: 14px; color: #78716C; margin-top: 8px; }

/* Gold confetti for sign success */
.confetti-container { position: relative; overflow: hidden; width: 100%; height: 80px; margin-top: -40px; }
.confetti {
  position: absolute; width: 8px; height: 8px; border-radius: 2px;
  animation: confettiFall 2s ease-in forwards;
  opacity: 0;
}
@keyframes confettiFall {
  0% { opacity: 1; transform: translateY(-20px) rotate(0deg); }
  100% { opacity: 0; transform: translateY(100px) rotate(720deg); }
}

/* ══════════════════════════════════════════════════
   Empty State
   ══════════════════════════════════════════════════ */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 48px 20px; text-align: center;
}
.empty-state-icon { font-size: 48px; color: #D6D3D1; margin-bottom: 16px; }
.empty-state-text { font-size: 15px; color: #78716C; margin-bottom: 8px; }
.empty-state-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 24px; border-radius: 10px;
  background: #fff; color: #B91C1C; border: 1px solid #FECACA;
  font-size: 14px; font-weight: 600; text-decoration: none;
  margin-top: 12px; cursor: pointer;
  transition: background 0.2s;
}
.empty-state-btn:hover { background: #FEF2F2; }

/* ══════════════════════════════════════════════════
   Sticky Navbar
   ══════════════════════════════════════════════════ */
.app-navbar {
  position: sticky; top: 0; z-index: 50; height: 52px;
  background: rgba(255,255,255,0.97);
  border-bottom: 0.5px solid rgba(0,0,0,0.06);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px;
}
/* Admin navbar */
.app-navbar-admin {
  position: sticky; top: 0; z-index: 50; height: 52px;
  background: #1C1917;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px;
}

/* ══════════════════════════════════════════════════
   Bottom Tab Bar
   ══════════════════════════════════════════════════ */
.tab-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
  height: 60px;
  background: #fff;
  border-top: 1px solid rgba(0,0,0,0.06);
  display: flex; align-items: center; justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom, 0);
}
@media (min-width: 481px) {
  .tab-bar { max-width: 480px; left: 50%; transform: translateX(-50%); }
}
.tab-bar a, .tab-bar button {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  flex: 1; gap: 2px; text-decoration: none; background: none; border: none;
  cursor: pointer; padding: 6px 0; position: relative;
}
.tab-item-icon { font-size: 19px; transition: color 0.2s; }
.tab-item-label { font-size: 10px; font-weight: 500; transition: color 0.2s; }
.tab-inactive .tab-item-icon,
.tab-inactive .tab-item-label { color: #A8A29E; }
.tab-active .tab-item-icon,
.tab-active .tab-item-label { color: #B91C1C; }

/* Center "create" tab raised button */
.tab-center-btn {
  width: 42px; height: 42px; border-radius: 50%;
  background: linear-gradient(135deg, #DC2626, #B91C1C);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 20px;
  box-shadow: 0 4px 14px rgba(185,28,28,0.35);
  margin-top: -18px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.tab-center-btn:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(185,28,28,0.45); }

/* Body padding for tab bar */
.has-tabbar { padding-bottom: 72px; }

/* ══════════════════════════════════════════════════
   Cards / Shadows
   ══════════════════════════════════════════════════ */
.shadow-card { box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03); }
.shadow-card-hover { transition: transform 0.15s ease-out, box-shadow 0.15s ease-out; }
.shadow-card-hover:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

/* GPU acceleration hints for animated elements */
.toast, .nudge-bar, .coach-bubble, #help-float-btn, #faq-panel { transform: translateZ(0); }

/* ══════════════════════════════════════════════════
   Progress bars (with animation)
   ══════════════════════════════════════════════════ */
.progress-bar {
  height: 8px; border-radius: 99px;
  background: #F5F5F4; overflow: hidden;
}
.progress-fill {
  height: 100%; border-radius: 99px;
  background: linear-gradient(90deg, #D4A853, #B8860B);
  width: 0;
  transition: width 0.8s cubic-bezier(0.22,1,0.36,1);
}
.progress-bar-lg {
  height: 12px; border-radius: 99px;
  background: #F5F5F4; overflow: hidden;
}
.progress-bar-lg .progress-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #D4A853, #B8860B); width: 0; transition: width 0.8s cubic-bezier(0.22,1,0.36,1); }

/* ══════════════════════════════════════════════════
   Profile menu rows
   ══════════════════════════════════════════════════ */
.menu-row {
  display: flex; align-items: center; padding: 16px 20px; gap: 14px;
  cursor: pointer; transition: background 0.15s;
}
.menu-row:hover { background: #FAFAF9; }
.menu-row:not(:last-child) { border-bottom: 1px solid #F5F5F4; }

/* ══════════════════════════════════════════════════
   Quick action cards
   ══════════════════════════════════════════════════ */
.quick-card {
  border-radius: 16px; padding: 20px; height: 100px;
  display: flex; flex-direction: column; justify-content: space-between;
  cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none; color: #FAFAF9;
}
.quick-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.quick-card-brand { background: linear-gradient(135deg, #DC2626, #991B1B); }
.quick-card-gold { background: linear-gradient(135deg, #D4A853, #B8860B); }

/* ══════════════════════════════════════════════════
   KPI Banner
   ══════════════════════════════════════════════════ */
.kpi-banner {
  background: linear-gradient(135deg, #B91C1C, #7F1D1D);
  border-radius: 16px; padding: 20px;
  display: flex; gap: 0; overflow-x: auto; -webkit-overflow-scrolling: touch;
}
.kpi-banner::-webkit-scrollbar { display: none; }
.kpi-item {
  flex: 1; min-width: 0; text-align: center; position: relative; padding: 0 8px;
}
.kpi-item:not(:last-child)::after {
  content: ''; position: absolute; right: 0; top: 20%; height: 60%;
  width: 1px; background: rgba(255,255,255,0.15);
}
.kpi-val { color: #fff; font-weight: 800; font-size: 20px; line-height: 1.2; }
.kpi-label { color: rgba(255,255,255,0.65); font-size: 11px; margin-top: 4px; }

/* ══════════════════════════════════════════════════
   Filter bar
   ══════════════════════════════════════════════════ */
.filter-bar {
  position: sticky; top: 52px; z-index: 40;
  background: rgba(255,255,255,0.97);
  border-bottom: 0.5px solid rgba(0,0,0,0.06);
  padding: 10px 16px;
  display: flex; gap: 8px;
}
@media (max-width: 640px) {
  .filter-bar { flex-direction: column; }
}
.filter-select {
  flex: 1; min-width: 0;
  appearance: none; -webkit-appearance: none;
  background: #F5F5F4 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2378716C'/%3E%3C/svg%3E") no-repeat right 10px center;
  border: 1px solid #E7E5E4; border-radius: 8px;
  padding: 8px 28px 8px 10px;
  font-size: 13px; color: #1C1917;
  cursor: pointer; outline: none;
  transition: border-color 0.2s;
}
.filter-select:focus { border-color: #B91C1C; }

/* ══════════════════════════════════════════════════
   Status badges
   ══════════════════════════════════════════════════ */
.badge { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; border: 1px solid; }
.badge-open { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }
.badge-funded { background: #F0FDF4; color: #16a34a; border-color: #BBF7D0; }
.badge-active { background: #F0FDF4; color: #16a34a; border-color: #BBF7D0; }
.badge-completed { background: #F0FDF4; color: #16A34A; border-color: #BBF7D0; }

/* ══════════════════════════════════════════════════
   Detail page
   ══════════════════════════════════════════════════ */
.back-link {
  display: inline-flex; align-items: center; gap: 6px;
  color: #78716C; font-size: 14px; text-decoration: none;
  transition: color 0.2s; padding: 4px 0;
}
.back-link:hover { color: #B91C1C; }

/* Detail card — unified card container for project detail */
.detail-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03);
}
.detail-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  font-size: 16px;
  font-weight: 600;
  color: #1C1917;
}
.detail-card-header-icon {
  width: 28px; height: 28px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; flex-shrink: 0;
}
.detail-plain-lang-wrapper:empty { display: none; }

.terms-card {
  background: #fff; border-radius: 16px;
  border-left: 4px solid #B91C1C;
  overflow: hidden;
}
.terms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.terms-cell { padding: 14px 20px; border-bottom: 1px solid #F5F5F4; }
.terms-cell:nth-child(odd) { border-right: 1px solid #F5F5F4; }
.terms-label { font-size: 12px; color: #78716C; margin-bottom: 4px; }
.terms-value { font-size: 18px; font-weight: 700; color: #1C1917; }
.calc-highlight {
  background: #FEF2F2; padding: 16px 20px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}

/* Participate calculator */
.calc-card {
  background: #fff; border-radius: 16px;
  border: 2px solid transparent;
  background-clip: padding-box;
  position: relative; overflow: hidden;
}
.calc-card::before {
  content: ''; position: absolute; inset: -2px; z-index: -1;
  border-radius: 18px;
  background: linear-gradient(135deg, #D4A853, #B8860B);
}
.share-select {
  appearance: none; -webkit-appearance: none;
  background: #FAFAF9 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2378716C'/%3E%3C/svg%3E") no-repeat right 12px center;
  border: 1px solid #E7E5E4; border-radius: 10px;
  padding: 10px 36px 10px 14px;
  font-size: 15px; font-weight: 600; color: #1C1917;
  cursor: pointer; outline: none; min-width: 100px;
  transition: border-color 0.2s;
}
.share-select:focus { border-color: #D4A853; box-shadow: 0 0 0 3px rgba(212,168,83,0.12); }

/* Investor avatar row */
.avatar-stack { display: flex; align-items: center; }
.avatar-stack .av-circle {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600; color: #fff;
  border: 2px solid #fff;
  margin-left: -8px;
}
.avatar-stack .av-circle:first-child { margin-left: 0; }

/* ══════════════════════════════════════════════════
   Create Project — Stepper
   ══════════════════════════════════════════════════ */
.stepper { display: flex; align-items: center; justify-content: center; gap: 0; padding: 20px 24px 24px; }
.stepper-step { display: flex; align-items: center; gap: 0; }
.stepper-dot {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; transition: all 0.3s;
  flex-shrink: 0;
}
.stepper-dot-active { background: #B91C1C; color: #fff; box-shadow: 0 2px 8px rgba(185,28,28,0.35); }
.stepper-dot-done { background: #16a34a; color: #fff; }
.stepper-dot-pending { background: #E7E5E4; color: #A8A29E; }
.stepper-line { width: 48px; height: 2px; margin: 0 6px; transition: background 0.3s; }
.stepper-line-done { background: #16a34a; }
.stepper-line-pending { background: #E7E5E4; }
.stepper-label { font-size: 11px; color: #78716C; margin-top: 4px; text-align: center; white-space: nowrap; }
.stepper-label-active { color: #B91C1C; font-weight: 600; }
.stepper-label-done { color: #16a34a; }

/* ══════════════════════════════════════════════════
   Form Inputs
   ══════════════════════════════════════════════════ */
.form-label { font-size: 14px; font-weight: 500; color: #292524; margin-bottom: 6px; display: block; }
.form-label .req { color: #DC2626; }
.form-input {
  width: 100%; background: #fff;
  border: 1px solid rgba(0,0,0,0.12); border-radius: 12px;
  padding: 14px 16px; font-size: 15px; color: #1C1917;
  outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}
.form-input:focus { border-color: #B91C1C; box-shadow: 0 0 0 3px rgba(185,28,28,0.1); }
.form-input::placeholder { color: #A8A29E; }
.form-input-error { border-color: #DC2626; }
.form-error-text { font-size: 12px; color: #DC2626; margin-top: 4px; }

.form-select {
  width: 100%; background: #fff;
  appearance: none; -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2378716C'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 14px center;
  border: 1px solid rgba(0,0,0,0.12); border-radius: 12px;
  padding: 14px 36px 14px 16px; font-size: 15px; color: #1C1917;
  outline: none; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}
.form-select:focus { border-color: #B91C1C; box-shadow: 0 0 0 3px rgba(185,28,28,0.1); }

.form-textarea {
  width: 100%; background: #fff; resize: vertical; min-height: 80px;
  border: 1px solid rgba(0,0,0,0.12); border-radius: 12px;
  padding: 14px 16px; font-size: 15px; color: #1C1917; line-height: 1.6;
  outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}
.form-textarea:focus { border-color: #B91C1C; box-shadow: 0 0 0 3px rgba(185,28,28,0.1); }
.form-textarea::placeholder { color: #A8A29E; }

.char-count { font-size: 12px; color: #A8A29E; text-align: right; margin-top: 4px; }
.char-count-over { color: #DC2626; }

.upload-zone {
  border: 2px dashed rgba(0,0,0,0.12); border-radius: 12px;
  padding: 24px; text-align: center; cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.upload-zone:hover { border-color: #B91C1C; background: #FEF2F2; }

.input-unit-wrap { position: relative; }
.input-unit-wrap .form-input { padding-right: 52px; }
.input-unit {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  font-size: 13px; color: #78716C; pointer-events: none;
}

.auto-calc-card {
  background: #FEF2F2; border-radius: 12px; padding: 16px;
  border: 1px solid #FECACA;
}
.auto-calc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.auto-calc-item-label { font-size: 12px; color: #78716C; margin-bottom: 2px; }
.auto-calc-item-value { font-size: 16px; font-weight: 700; color: #B91C1C; }

.example-card {
  background: #F5F5F4; border-radius: 12px; padding: 14px 16px;
  font-size: 13px; color: #78716C; line-height: 1.6;
}

/* Step transition */
.step-panel {
  transition: opacity 0.3s, transform 0.3s;
  opacity: 1; transform: translateX(0);
}
.step-panel-enter-left { opacity: 0; transform: translateX(-40px); }
.step-panel-enter-right { opacity: 0; transform: translateX(40px); }
.btn-row { display: flex; gap: 12px; margin-top: 24px; }

/* Create page — card titles & term groups */
.create-card-title {
  font-size: 16px; font-weight: 600; color: #292524; margin-bottom: 16px;
  font-family: 'Noto Sans SC', sans-serif;
  display: flex; align-items: center;
}
.create-terms-group {
  padding-bottom: 16px; margin-bottom: 16px;
  border-bottom: 1px solid #F5F5F4;
}
.create-terms-group-label {
  font-size: 12px; font-weight: 600; color: #78716C;
  text-transform: uppercase; letter-spacing: 0.5px;
  margin-bottom: 12px; display: flex; align-items: center;
}

/* ══════════════════════════════════════════════════
   Contract Sign Page
   ══════════════════════════════════════════════════ */
.contract-card {
  background: #fff; border-radius: 16px; padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03);
}
.contract-title { font-size: 20px; font-weight: 700; text-align: center; color: #292524; margin-bottom: 8px; }
.contract-no { font-size: 13px; color: #78716C; text-align: center; margin-bottom: 20px; }
.contract-body { font-size: 14px; line-height: 1.8; color: #292524; }
.contract-body h4 { font-weight: 600; margin: 16px 0 8px; font-size: 15px; color: #1C1917; }
.contract-body p { margin-bottom: 8px; }
.contract-body .indent { text-indent: 2em; }
.contract-party { background: #FAFAF9; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; }
.contract-party-label { font-size: 12px; color: #78716C; margin-bottom: 4px; }
.contract-party-name { font-size: 15px; font-weight: 600; color: #1C1917; }

.sign-area {
  background: #fff; border-radius: 16px; overflow: hidden;
  border-top: 3px solid; border-image: linear-gradient(90deg, #D4A853, #B8860B) 1;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03);
  padding: 24px;
}
.checkbox-row { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
.checkbox-row input[type="checkbox"] { width: 20px; height: 20px; margin-top: 2px; accent-color: #B91C1C; cursor: pointer; flex-shrink: 0; }
.checkbox-row label { font-size: 14px; color: #292524; cursor: pointer; }
.verify-row { display: flex; gap: 10px; margin-top: 16px; }
.verify-input {
  flex: 1;
  background: #fff; border: 1px solid rgba(0,0,0,0.12); border-radius: 10px;
  padding: 12px 14px; font-size: 15px; color: #1C1917; outline: none;
  transition: border-color 0.2s;
}
.verify-input:focus { border-color: #B91C1C; box-shadow: 0 0 0 3px rgba(185,28,28,0.1); }
.verify-send-btn {
  white-space: nowrap; background: #F5F5F4; border: 1px solid #E7E5E4;
  border-radius: 10px; padding: 0 16px; font-size: 13px; font-weight: 500;
  color: #B91C1C; cursor: pointer; transition: background 0.2s;
}
.verify-send-btn:hover { background: #FEE2E2; }
.verify-send-btn:disabled { color: #A8A29E; cursor: not-allowed; background: #F5F5F4; }

.sign-status { display: flex; gap: 16px; margin-top: 20px; }
.sign-status-item { flex: 1; background: #FAFAF9; border-radius: 10px; padding: 12px; text-align: center; }
.sign-status-label { font-size: 12px; color: #78716C; margin-bottom: 4px; }
.sign-status-val { font-size: 14px; font-weight: 600; }
.sign-status-done { color: #16a34a; }
.sign-status-pending { color: #D4A853; }

/* Sign success overlay (legacy — keep for contract page) */
.sign-success-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(255,255,255,0.95);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none;
  transition: opacity 0.4s;
}
.sign-success-overlay.show { opacity: 1; pointer-events: auto; }
.sign-success-icon {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg, #D4A853, #B8860B);
  display: flex; align-items: center; justify-content: center;
  animation: success-pop 0.5s cubic-bezier(0.16,1,0.3,1);
}
@keyframes success-pop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
.sign-success-text {
  margin-top: 16px; font-size: 20px; font-weight: 700; color: #292524;
  animation: success-fade 0.5s 0.2s both;
}
.sign-success-sub {
  margin-top: 8px; font-size: 14px; color: #78716C;
  animation: success-fade 0.5s 0.4s both;
}
@keyframes success-fade {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* ══════════════════════════════════════════════════
   Contract Sign Ceremony Page (Task 1)
   ══════════════════════════════════════════════════ */
.ceremony-page {
  position: fixed; inset: 0; z-index: 2000;
  background: linear-gradient(160deg, #1C1917, #292524);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 40px 20px;
  opacity: 0; transition: opacity 800ms ease;
  pointer-events: none;
}
.ceremony-page.show { opacity: 1; pointer-events: auto; }
.ceremony-check-circle {
  width: 80px; height: 80px; border: 3px solid #D4A853; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transform: scale(0);
  animation: ceremonyCirclePop 300ms ease-out forwards;
}
.ceremony-check-circle.animate {
  box-shadow: 0 0 0 0 rgba(212,168,83,0.4);
  animation: ceremonyCirclePop 300ms ease-out forwards, ceremonyGlow 600ms ease-out forwards;
}
.ceremony-check-mark {
  font-size: 36px; color: #D4A853; font-weight: 700; line-height: 1;
  opacity: 0; transform: translateY(10px);
}
.ceremony-check-mark.animate {
  animation: ceremonyCheckFade 300ms 300ms ease-out forwards;
}
@keyframes ceremonyCirclePop {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}
@keyframes ceremonyGlow {
  0% { box-shadow: 0 0 0 0 rgba(212,168,83,0.4); }
  100% { box-shadow: 0 0 0 30px rgba(212,168,83,0); }
}
@keyframes ceremonyCheckFade {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
.ceremony-title {
  margin-top: 32px; text-align: center;
}
.ceremony-title h2 {
  font-size: 24px; font-weight: 800; color: #fff; letter-spacing: 2px;
}
.ceremony-title p {
  margin-top: 8px; font-size: 14px; color: rgba(255,255,255,0.5);
}
.ceremony-summary {
  margin-top: 28px; background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;
  padding: 20px 24px; width: 100%; max-width: 320px;
}
.ceremony-summary-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
}
.ceremony-summary-row:last-child { border-bottom: none; }
.ceremony-summary-label { font-size: 13px; color: rgba(255,255,255,0.4); }
.ceremony-summary-value { font-size: 14px; color: #fff; font-weight: 600; }
.ceremony-buttons { margin-top: 32px; width: 100%; max-width: 320px; }
.ceremony-btn-primary {
  background: linear-gradient(135deg, #D4A853, #B8860B); color: #1C1917;
  font-weight: 700; border-radius: 14px; padding: 16px; width: 100%;
  font-size: 16px; border: none; cursor: pointer; transition: opacity 0.2s;
}
.ceremony-btn-primary:active { opacity: 0.85; }
.ceremony-btn-secondary {
  margin-top: 10px; background: transparent; color: rgba(255,255,255,0.5);
  border: 1px solid rgba(255,255,255,0.15); border-radius: 14px;
  padding: 14px; width: 100%; font-size: 14px; cursor: pointer; transition: opacity 0.2s;
}
.ceremony-btn-secondary:active { opacity: 0.7; }
.ceremony-btn-tertiary {
  margin-top: 10px; background: transparent; color: rgba(255,255,255,0.3);
  border: none; font-size: 13px; padding: 10px; width: 100%; cursor: pointer;
  transition: opacity 0.2s;
}
.ceremony-btn-tertiary:active { opacity: 0.5; }

/* ══════════════════════════════════════════════════
   Payback Celebration Banner (Task 2)
   ══════════════════════════════════════════════════ */
.payback-banner {
  margin: 0 16px 16px; padding: 16px 20px;
  background: linear-gradient(135deg, #D4A853, #B8860B);
  border-radius: 16px; text-align: center; position: relative; overflow: visible;
  transform: scale(0.8); opacity: 0;
  animation: paybackBannerIn 500ms ease-out forwards;
}
@keyframes paybackBannerIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.payback-banner .emoji-row { font-size: 24px; }
.payback-banner .banner-title {
  margin-top: 6px; font-size: 18px; font-weight: 800; color: #1C1917;
}
.payback-banner .banner-sub {
  margin-top: 4px; font-size: 13px; color: rgba(28,25,23,0.7);
}

/* Confetti (pure CSS) */
.confetti-piece {
  position: absolute; width: 4px; height: 4px; top: 50%; left: 50%;
  animation-fill-mode: forwards; animation-iteration-count: 1;
}
@keyframes confetti-1 { 0%{transform:translate(0,0) rotate(0);opacity:1;} 100%{transform:translate(-40px,-60px) rotate(120deg);opacity:0;} }
@keyframes confetti-2 { 0%{transform:translate(0,0) rotate(0);opacity:1;} 100%{transform:translate(50px,-50px) rotate(-90deg);opacity:0;} }
@keyframes confetti-3 { 0%{transform:translate(0,0) rotate(0);opacity:1;} 100%{transform:translate(-60px,30px) rotate(200deg);opacity:0;} }
@keyframes confetti-4 { 0%{transform:translate(0,0) rotate(0);opacity:1;} 100%{transform:translate(35px,55px) rotate(-150deg);opacity:0;} }
@keyframes confetti-5 { 0%{transform:translate(0,0) rotate(0);opacity:1;} 100%{transform:translate(70px,-30px) rotate(80deg);opacity:0;} }
@keyframes confetti-6 { 0%{transform:translate(0,0) rotate(0);opacity:1;} 100%{transform:translate(-30px,-75px) rotate(-200deg);opacity:0;} }

/* ══════════════════════════════════════════════════
   Investment Overview Card (Task 3)
   ══════════════════════════════════════════════════ */
.invest-overview-card {
  margin: 12px 16px; padding: 20px; background: #fff; border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06); display: flex; align-items: center;
}
.invest-overview-left { width: 60%; }
.invest-overview-right { width: 40%; display: flex; justify-content: center; }
.invest-overview-total { font-size: 24px; font-weight: 800; color: #B91C1C; }
.invest-overview-repaid { font-size: 20px; font-weight: 700; color: #16A34A; margin-top: 8px; }
.invest-overview-count { font-size: 14px; color: #78716C; margin-top: 6px; }
.invest-overview-label { font-size: 12px; color: #A8A29E; margin-bottom: 2px; }

/* ══════════════════════════════════════════════════
   Initiator Note (Task 4)
   ══════════════════════════════════════════════════ */
.initiator-note {
  margin: 12px 16px; padding: 20px; background: #FAFAF9; border-radius: 14px;
}
.initiator-note-header {
  display: flex; align-items: center;
}
.initiator-note-avatar {
  width: 36px; height: 36px; border-radius: 50%; background: #FEE2E2;
  color: #B91C1C; font-weight: 600; display: flex; align-items: center;
  justify-content: center; font-size: 15px; flex-shrink: 0;
}
.initiator-note-name {
  font-size: 14px; font-weight: 600; color: #1C1917; margin-left: 10px;
}
.initiator-note-tag {
  font-size: 11px; background: rgba(185,28,28,0.08); color: #B91C1C;
  border-radius: 4px; padding: 2px 6px; margin-left: 6px;
}
.initiator-note-body {
  margin-top: 12px;
}
.initiator-note-quote {
  font-size: 32px; color: #E7E5E4; font-family: Georgia, serif;
  line-height: 1; float: left; margin-right: 6px; margin-top: -4px;
}
.initiator-note-text {
  font-size: 14px; color: #57534E; line-height: 1.7;
}

/* ══════════════════════════════════════════════════
   Repayment Tab Bar
   ══════════════════════════════════════════════════ */
.rep-tab-bar { position: sticky; top: 52px; z-index: 40; }
.rep-tab { transition: color 0.2s; }
.rep-tab-line { transition: opacity 0.2s; }

/* ══════════════════════════════════════════════════
   Admin Page
   ══════════════════════════════════════════════════ */
.admin-section {
  background: #fff; border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03);
  padding: 20px; margin-bottom: 16px;
}
.admin-section-title {
  font-size: 16px; font-weight: 600; color: #1C1917;
  margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;
}
.admin-kpi-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;
}
.admin-kpi-card {
  background: #FAFAF9; border-radius: 12px; padding: 14px; text-align: center;
}
.admin-kpi-val { font-size: 24px; font-weight: 800; color: #1C1917; }
.admin-kpi-label { font-size: 12px; color: #78716C; margin-top: 2px; }

.admin-table { width: 100%; border-collapse: collapse; }
.admin-table th {
  text-align: left; padding: 10px 12px; font-size: 12px; color: #78716C;
  font-weight: 500; border-bottom: 1px solid #F5F5F4;
}
.admin-table td {
  padding: 12px; font-size: 14px; color: #292524;
  border-bottom: 1px solid #F5F5F4;
}
.admin-table tr:hover td { background: #FAFAF9; }

.admin-invite-btn {
  padding: 8px 16px; background: #B91C1C; color: #fff;
  border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: background 0.2s;
}
.admin-invite-btn:hover { background: #991B1B; }

/* ══════════════════════════════════════════════════
   Help Icon ⓘ + Plain-language Block
   ══════════════════════════════════════════════════ */
.help-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 50%;
  background: #F5F5F4; color: #78716C;
  font-size: 9px; font-weight: 600; font-style: normal;
  cursor: pointer; flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
  user-select: none; line-height: 1;
}
.help-icon:hover { background: #E7E5E4; color: #57534E; }
.help-text {
  max-height: 0; opacity: 0; overflow: hidden;
  transition: max-height 200ms ease, opacity 200ms ease, margin 200ms ease;
  margin-top: 0;
  font-size: 12px; line-height: 1.5; color: #78716C;
  background: #FAFAF9; border-radius: 8px; padding: 0 12px;
}
.help-text.expanded {
  max-height: 200px; opacity: 1; padding: 10px 12px; margin-top: 6px;
}
.plain-lang-block {
  background: #FFFBEB; border: 1px solid #FDE68A;
  border-radius: 12px; padding: 16px; margin-top: 12px;
}
.plain-lang-title {
  font-size: 14px; font-weight: 600; color: #92400E; margin-bottom: 8px;
}
.plain-lang-body {
  font-size: 13px; line-height: 1.7; color: #78716C;
}
.plain-lang-warning { color: #DC2626; }

/* Reference cases card */
.case-toggle-card {
  background: #fff; border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.06);
  padding: 12px 16px; cursor: pointer;
  margin-bottom: 16px;
}
.case-toggle-header {
  display: flex; align-items: center; gap: 8px;
}
.case-toggle-arrow { transition: transform 280ms ease; color: #A8A29E; }
.case-toggle-arrow.rotate-180 { transform: rotate(180deg); }
#case-content {
  max-height: 0; opacity: 0; overflow: hidden;
  transition: max-height 280ms ease, opacity 280ms ease;
}
#case-content.expanded { max-height: 600px; opacity: 1; }
.case-item {
  background: #FAFAF9; border-radius: 8px; padding: 10px 12px;
}

/* ══════════════════════════════════════════════════
   Onboarding Carousel
   ══════════════════════════════════════════════════ */
.onboarding-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  z-index: 2000; background: #fff;
  transition: opacity 300ms ease;
}
.onboarding-viewport {
  width: 100%; height: calc(100% - 80px); overflow: hidden;
}
.onboarding-container {
  display: flex; height: 100%;
  transition: transform 300ms cubic-bezier(0.22,1,0.36,1);
}
.onboarding-page {
  min-width: 100%; flex-shrink: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 24px 32px;
}
.onboarding-skip {
  position: absolute; top: 16px; right: 16px;
  font-size: 13px; color: #A8A29E; background: none; border: none;
  cursor: pointer; padding: 8px 12px; z-index: 2001;
}
.onboarding-controls {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 24px 32px; display: flex; align-items: center; justify-content: space-between;
}
.onboarding-dots { display: flex; gap: 6px; align-items: center; }
.onboarding-dot {
  height: 6px; border-radius: 3px; background: #D6D3D1;
  width: 6px; transition: width 280ms ease, background 280ms ease;
}
.onboarding-dot-active { width: 24px; background: #B91C1C; }
.onboarding-next {
  font-size: 15px; font-weight: 600; color: #B91C1C;
  background: none; border: none; cursor: pointer;
}
.onboarding-start {
  background: linear-gradient(135deg, #D4A853, #B8860B);
  color: #fff; font-size: 15px; font-weight: 600;
  border: none; border-radius: 12px; padding: 10px 24px; cursor: pointer;
  transition: transform 0.15s, box-shadow 0.25s;
}
.onboarding-start:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(212,168,83,0.35); }

/* Onboarding page specific */
.ob-icon-row { display: flex; align-items: center; gap: 0; margin-bottom: 32px; }
.ob-icon-circle {
  width: 80px; height: 80px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ob-arrow { font-size: 16px; color: #D6D3D1; margin: 0 8px; }
.ob-title { font-size: 24px; font-weight: 800; color: #1C1917; text-align: center; }
.ob-title-brand { font-size: 24px; font-weight: 800; color: #B91C1C; text-align: center; }
.ob-desc { font-size: 15px; color: #78716C; text-align: center; }

.ob-card {
  background: #fff; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px;
  padding: 20px; display: flex; align-items: center; gap: 14px;
}
.ob-card-icon {
  width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.ob-card-title { font-size: 16px; font-weight: 600; color: #1C1917; }
.ob-card-desc { font-size: 13px; color: #78716C; margin-top: 2px; }

.ob-shield {
  width: 100px; height: 100px; border-radius: 50%;
  background: #FEE2E2; display: flex; align-items: center; justify-content: center;
  margin-bottom: 24px;
}
.ob-feature-row {
  display: flex; align-items: center; gap: 12px;
}
.ob-feature-text { font-size: 15px; color: #292524; }

/* ══════════════════════════════════════════════════
   Coach Mark (Focused Bubble Guide)
   ══════════════════════════════════════════════════ */
.coach-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  z-index: 1500; background: rgba(0,0,0,0.6);
  transition: opacity 200ms ease;
  will-change: opacity;
  contain: layout style;
}
.coach-bubble {
  position: fixed; z-index: 1502; background: #fff; border-radius: 12px;
  padding: 16px; max-width: 280px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  animation: coachFadeIn 200ms ease forwards;
}
@keyframes coachFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.coach-bubble-text { font-size: 14px; line-height: 1.5; color: #292524; }
.coach-dismiss-btn {
  font-size: 13px; font-weight: 600; color: #B91C1C;
  background: none; border: none; cursor: pointer;
  margin-top: 12px; float: right;
}
/* Arrow for coach bubble */
.coach-arrow-top {
  position: absolute; top: -8px; left: 50%;
  transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 8px solid transparent; border-right: 8px solid transparent;
  border-bottom: 8px solid #fff;
}
.coach-arrow-bottom {
  position: absolute; bottom: -8px; left: 50%;
  transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 8px solid transparent; border-right: 8px solid transparent;
  border-top: 8px solid #fff;
}

/* ══════════════════════════════════════════════════
   Responsive
   ══════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════
   Floating Help Button
   ══════════════════════════════════════════════════ */
#help-float-btn {
  position: fixed; bottom: 76px; right: 16px; z-index: 900;
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, #D4A853, #B8860B);
  color: #fff; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(212,168,83,0.3);
  transition: transform 200ms ease, box-shadow 200ms ease;
}
#help-float-btn:hover { transform: scale(1.1); box-shadow: 0 6px 16px rgba(212,168,83,0.45); }
#help-float-btn:active { transform: scale(0.95); }
#help-float-btn.help-pulse {
  animation: help-pulse 2.5s ease-in-out infinite;
}
@keyframes help-pulse {
  0%, 100% { box-shadow: 0 4px 12px rgba(212,168,83,0.3); }
  50% { box-shadow: 0 4px 12px rgba(212,168,83,0.3), 0 0 0 8px rgba(212,168,83,0.1); }
}
#help-float-btn.pulse-once {
  animation: help-pulse 2.5s ease-in-out 3;
}
@media (min-width: 481px) {
  #help-float-btn { right: calc(50% - 240px + 16px); }
}

/* ══════════════════════════════════════════════════
   FAQ Help Panel
   ══════════════════════════════════════════════════ */
#faq-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4); z-index: 1100;
  opacity: 0; pointer-events: none;
  transition: opacity 200ms ease;
  will-change: opacity;
  contain: layout style;
}
#faq-overlay.show { opacity: 1; pointer-events: auto; }

#faq-panel {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: #fff; border-radius: 20px 20px 0 0;
  max-height: 75vh; overflow-y: auto;
  padding: 24px;
  transform: translateY(100%);
  transition: transform 250ms cubic-bezier(0.32,0.72,0,1);
  will-change: transform;
}
#faq-overlay.show #faq-panel { transform: translateY(0); }
@media (min-width: 481px) {
  #faq-panel { max-width: 480px; left: 50%; right: auto; transform: translateX(-50%) translateY(100%); }
  #faq-overlay.show #faq-panel { transform: translateX(-50%) translateY(0); }
}

.faq-drag-bar {
  width: 40px; height: 4px; border-radius: 2px;
  background: #D6D3D1; margin: 0 auto 20px;
}
.faq-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.faq-title { font-size: 18px; font-weight: 600; color: #1C1917; }
.faq-close { font-size: 18px; color: #A8A29E; background: none; border: none; cursor: pointer; padding: 4px 8px; }

.faq-item { border-bottom: 1px solid #F5F5F4; }
.faq-q {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 0; cursor: pointer; gap: 8px;
}
.faq-q-text { font-size: 14px; font-weight: 500; color: #292524; flex: 1; }
.faq-q-icon { font-size: 12px; color: #A8A29E; transition: transform 200ms ease; flex-shrink: 0; }
.faq-q-icon.open { transform: rotate(180deg); }
.faq-a {
  max-height: 0; overflow: hidden; transition: max-height 200ms ease-out, padding 200ms ease-out;
  padding: 0;
}
.faq-a.open { max-height: 300px; padding: 0 0 16px 0; }
.faq-a-text { font-size: 13px; line-height: 1.6; color: #78716C; }

.faq-teacher-block {
  background: #fff; border: 1px solid rgba(0,0,0,0.06);
  border-radius: 12px; padding: 16px; margin-top: 24px;
}
.faq-teacher-title { font-size: 14px; font-weight: 600; color: #1C1917; margin-bottom: 10px; }
.faq-teacher-name { font-size: 14px; color: #292524; margin-bottom: 12px; }
.faq-teacher-btns { display: flex; gap: 10px; }
.faq-teacher-btn {
  flex: 1; padding: 8px 14px; border-radius: 10px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  text-align: center; transition: background 0.2s;
}
.faq-teacher-btn-msg {
  background: #fff; border: 1.5px solid #B91C1C; color: #B91C1C;
}
.faq-teacher-btn-msg:hover { background: #FEF2F2; }
.faq-teacher-btn-call {
  background: #fff; border: 1.5px solid #78716C; color: #78716C;
}
.faq-teacher-btn-call:hover { background: #FAFAF9; }

.faq-reset-guide {
  text-align: center; margin-top: 16px;
  font-size: 13px; color: #3B82F6; cursor: pointer;
}
.faq-reset-guide:hover { text-decoration: underline; }

/* ══════════════════════════════════════════════════
   Smart Nudge Bar
   ══════════════════════════════════════════════════ */
.nudge-bar {
  position: fixed; bottom: 76px; left: 16px; right: 16px; z-index: 800;
  background: #fff; border: 1px solid rgba(0,0,0,0.06);
  border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 12px 16px; display: flex; align-items: center; gap: 8px;
  transform: translateY(20px); opacity: 0;
  transition: transform 200ms ease, opacity 200ms ease;
  will-change: transform, opacity;
}
.nudge-bar.show { transform: translateY(0); opacity: 1; }
@media (min-width: 481px) {
  .nudge-bar { left: calc(50% - 240px + 16px); right: calc(50% - 240px + 16px); }
}
.nudge-icon { font-size: 16px; flex-shrink: 0; }
.nudge-text { font-size: 13px; color: #292524; flex: 1; }
.nudge-close { font-size: 14px; color: #A8A29E; cursor: pointer; background: none; border: none; padding: 2px 4px; flex-shrink: 0; }

/* ══════════════════════════════════════════════════
   Teacher Workbench
   ══════════════════════════════════════════════════ */
.teacher-header {
  background: linear-gradient(135deg, #B91C1C, #991B1B);
  border-radius: 20px; padding: 24px; color: #fff; margin-bottom: 16px;
}
.teacher-header-name { font-size: 22px; font-weight: 700; }
.teacher-header-sub { font-size: 14px; opacity: 0.8; margin-top: 4px; }

.teacher-card {
  background: #fff; border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03);
  padding: 20px; margin-bottom: 16px;
}
.teacher-card-title {
  font-size: 16px; font-weight: 600; color: #1C1917;
  margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;
}
.ref-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border-radius: 50%;
  background: #DC2626; color: #fff; font-size: 11px; font-weight: 700;
}
.ref-request-item {
  padding: 16px 0; border-bottom: 1px solid #F5F5F4;
}
.ref-request-item:last-child { border-bottom: none; }
.ref-person-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
}
.ref-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: #B91C1C; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
}
.ref-avatar-sm {
  width: 24px; height: 24px; border-radius: 50%;
  background: #D4A853; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; flex-shrink: 0;
}
.ref-msg-block {
  font-size: 13px; color: #78716C; font-style: italic;
  background: #FAFAF9; border-radius: 8px; padding: 8px;
  margin: 6px 0;
}
.ref-btn-row { display: flex; gap: 8px; margin-top: 10px; }
.ref-btn {
  padding: 6px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
  border: none; cursor: pointer; transition: background 0.2s, opacity 0.2s;
}
.ref-btn-connected { background: #B91C1C; color: #fff; }
.ref-btn-connected:hover { background: #991B1B; }
.ref-btn-decline { background: #F5F5F4; color: #78716C; }
.ref-btn-decline:hover { background: #E7E5E4; }

.class-expand-btn {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 12px 0; background: none; border: none; cursor: pointer;
  border-bottom: 1px solid #F5F5F4;
}
.class-expand-btn:last-child { border-bottom: none; }
.class-students { display: none; padding: 8px 0; }
.class-students.open { display: block; }
.class-student-row {
  display: flex; align-items: center; gap: 8px; padding: 6px 0;
  font-size: 13px; color: #292524;
}

.teacher-recommend-list { display: flex; flex-direction: column; gap: 8px; }
.teacher-recommend-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 0; border-bottom: 1px solid #F5F5F4;
}
.teacher-recommend-item:last-child { border-bottom: none; }
.teacher-recommend-text { font-size: 14px; color: #1C1917; }
.teacher-recommend-sub { font-size: 12px; color: #78716C; }
.teacher-recommend-remove {
  font-size: 13px; color: #DC2626; background: none; border: none; cursor: pointer;
  font-weight: 500;
}
.teacher-recommend-remove:hover { text-decoration: underline; }

.teacher-footer {
  text-align: center; padding: 24px 0 16px;
}
.teacher-logout-btn {
  background: none; border: none; color: #DC2626;
  font-size: 15px; font-weight: 600; cursor: pointer;
  margin-bottom: 12px;
}
.teacher-footer-text { font-size: 12px; color: #A8A29E; }

@media (max-width: 640px) {
  .glass-card { padding: 32px 24px !important; }
  .kpi-banner { flex-wrap: wrap; }
  .kpi-item { min-width: 50%; padding: 8px; }
  .kpi-item:not(:last-child)::after { display: none; }
}

/* ══════════════════════════════════════════════════════════
   RESPONSIVE — Mobile (≤768px)
   ══════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  /* Desktop-only elements: hide */
  .desktop-sidebar, .desktop-topbar { display: none !important; }

  /* Content breathing room */
  .app-container { max-width: 100%; box-shadow: none; }
  .app-container > main { padding-left: 16px !important; padding-right: 16px !important; }

  /* Navbar internal padding */
  .app-navbar { padding: 0 16px; }

  /* Welcome banner / flash bar margins */
  .invest-overview-card { margin-left: 0 !important; margin-right: 0 !important; }
  #repayment-flash-bar > div { margin-left: 0 !important; margin-right: 0 !important; border-radius: 12px; }
  .initiator-note { margin-left: 0 !important; margin-right: 0 !important; }
  .payback-banner { margin-left: 0 !important; margin-right: 0 !important; border-radius: 12px; }

  /* ═══════════════════════════════════════════════════
     MOBILE CARD REFINEMENTS (19C-2)
     All styles below are MOBILE-ONLY (≤768px).
     No HTML structure, data bindings, or events changed.
     ═══════════════════════════════════════════════════ */

  /* ──────────────────────────────────────
     一、手机端卡片基础样式（所有白色卡片共享）
     ────────────────────────────────────── */
  .bg-white.rounded-2xl.shadow-card,
  .bg-white.rounded-xl.shadow-card,
  .detail-card,
  .dk-home-project-grid > a,
  .dk-project-list > a,
  #panel-invest .bg-white,
  #panel-initiate .bg-white,
  .teacher-card,
  .admin-section {
    padding: 18px 20px;
    background: #FFFFFF;
    border-radius: 12px;
    border: 1px solid #F0EFED;
    box-shadow: 0 1px 4px rgba(0,0,0,0.03);
    margin-bottom: 12px;
  }
  /* Mobile: no hover (touch devices) */
  .bg-white.rounded-2xl.shadow-card:hover,
  .bg-white.rounded-xl.shadow-card:hover,
  .dk-home-project-grid > a:hover,
  .dk-project-list > a:hover,
  .teacher-card:hover,
  .admin-section:hover {
    transform: none !important;
    box-shadow: 0 1px 4px rgba(0,0,0,0.03) !important;
  }
  /* Mobile: active tap feedback */
  .bg-white.rounded-2xl.shadow-card:active,
  .bg-white.rounded-xl.shadow-card:active,
  .dk-home-project-grid > a:active,
  .dk-project-list > a:active,
  .teacher-card:active,
  .admin-section:active {
    background: #FAFAF9 !important;
    transition: background 0.1s !important;
  }

  /* ──────────────────────────────────────
     二、项目卡片（首页、大厅、我的发起、我的投资）
     ────────────────────────────────────── */

  /* 区域 A – 发起人信息行 */
  .dk-home-project-grid > a > div:first-child,
  .dk-project-list > a > div:first-child,
  #panel-invest .bg-white > div:first-child,
  #panel-initiate .bg-white > div:first-child {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    padding-bottom: 12px !important;
  }
  /* 头像 36px */
  .dk-home-project-grid > a > div:first-child > div:first-child,
  .dk-project-list > a > div:first-child > div:first-child,
  #panel-invest .bg-white > div:first-child > div:first-child,
  #panel-initiate .bg-white > div:first-child > div:first-child {
    width: 36px !important; height: 36px !important;
    font-size: 13px !important; flex-shrink: 0;
  }
  /* 姓名 */
  .dk-home-project-grid > a > div:first-child .text-text-primary,
  .dk-project-list > a > div:first-child .text-text-primary,
  #panel-invest .bg-white > div:first-child .text-text-primary,
  #panel-initiate .bg-white > div:first-child .text-text-primary {
    font-size: 14px !important; font-weight: 600 !important; color: #1C1917 !important;
  }
  /* 公司名 — with ellipsis for overflow */
  .dk-home-project-grid > a > div:first-child .text-text-tertiary,
  .dk-project-list > a > div:first-child .text-text-tertiary,
  #panel-invest .bg-white > div:first-child .text-text-tertiary,
  #panel-initiate .bg-white > div:first-child .text-text-tertiary {
    font-size: 12px !important; color: #78716C !important;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    max-width: 60%;
  }
  /* 班期标签 (span in the info row with bg color) */
  .dk-home-project-grid > a > div:first-child span[style*="background"],
  .dk-project-list > a > div:first-child span[style*="background"] {
    font-size: 10px; color: #78716C; background: #F5F5F4;
    padding: 2px 6px; border-radius: 4px; margin-left: auto;
    flex-shrink: 0; white-space: nowrap;
  }

  /* 区域 B – 项目核心信息 */
  /* 项目名称 */
  .dk-home-project-grid > a > .font-semibold.text-text-title,
  .dk-project-list > a > .font-semibold.text-text-title,
  #panel-invest .bg-white > .font-semibold,
  #panel-initiate .bg-white > .font-semibold {
    font-size: 16px !important; font-weight: 700 !important; color: #1C1917 !important;
    line-height: 1.4 !important; margin-bottom: 8px !important;
    display: -webkit-box !important; -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important; overflow: hidden !important;
  }

  /* 标签行 */
  .dk-home-project-grid > a > .flex.items-center.gap-2,
  .dk-project-list > a > .flex.items-center.gap-2 {
    display: flex !important; gap: 6px !important;
    flex-wrap: wrap !important; margin-bottom: 12px !important;
  }
  /* 行业标签 */
  .dk-home-project-grid > a .bg-brand-soft,
  .dk-project-list > a .bg-brand-soft {
    font-size: 10px !important; font-weight: 500 !important;
    color: #B91C1C !important;
    background: rgba(185,28,28,0.06) !important;
    padding: 3px 8px !important; border-radius: 5px !important;
  }

  /* 状态标签颜色映射 — 手机端 */
  .tag-recruiting {
    font-size: 10px !important; font-weight: 500 !important;
    color: #B45309 !important; background: rgba(180,83,9,0.08) !important;
    padding: 3px 8px !important; border-radius: 5px !important;
    border: none !important;
  }
  .tag-active {
    font-size: 10px !important; font-weight: 500 !important;
    color: #15803D !important; background: rgba(21,128,61,0.08) !important;
    padding: 3px 8px !important; border-radius: 5px !important;
    border: none !important;
  }
  .tag-completed {
    font-size: 10px !important; font-weight: 500 !important;
    color: #1D4ED8 !important; background: rgba(29,78,216,0.08) !important;
    padding: 3px 8px !important; border-radius: 5px !important;
    border: none !important;
  }
  .tag-terminated {
    font-size: 10px !important; font-weight: 500 !important;
    color: #78716C !important; background: #F5F5F4 !important;
    padding: 3px 8px !important; border-radius: 5px !important;
    border: none !important;
  }
  .tag-draft {
    font-size: 10px !important; font-weight: 500 !important;
    color: #78716C !important; background: #F5F5F4 !important;
    padding: 3px 8px !important; border-radius: 5px !important;
    border: 1px dashed #D6D3D1 !important;
  }

  /* 数据指标容器（三列数据）— 手机端 */
  .data-metric-box {
    background: #FAFAF9 !important;
    border-radius: 8px !important;
    padding: 12px 0 !important;
    display: grid !important;
    grid-template-columns: 1fr 1fr 1fr !important;
  }
  .data-metric-box > *:nth-child(2) {
    border-left: 1px solid #E7E5E4;
    border-right: 1px solid #E7E5E4;
  }
  .data-metric-box > * {
    text-align: center !important;
  }
  .data-metric-box .dm-value {
    font-size: 16px; font-weight: 700; color: #1C1917;
  }
  .data-metric-box .dm-value .dm-prefix,
  .data-metric-box .dm-value .dm-suffix {
    font-size: 11px; font-weight: 400;
  }
  .data-metric-box .dm-label {
    font-size: 10px; color: #A8A29E; margin-top: 3px;
  }

  /* 区域 C – 进度与操作 */
  /* 进度条 */
  .dk-home-project-grid > a .progress-bar,
  .dk-project-list > a .progress-bar,
  #panel-invest .bg-white .progress-bar,
  #panel-initiate .bg-white .progress-bar {
    height: 5px !important;
    background: #F0EFED !important;
    border-radius: 2.5px !important;
  }
  .dk-home-project-grid > a .progress-fill,
  .dk-project-list > a .progress-fill,
  #panel-invest .bg-white .progress-fill,
  #panel-initiate .bg-white .progress-fill {
    border-radius: 2.5px !important;
    background: linear-gradient(90deg, #B91C1C, #DC2626) !important;
    transition: width 0.6s ease !important;
  }
  /* 进度百分比文字 */
  .dk-home-project-grid > a .font-semibold.text-gold-dark,
  .dk-project-list > a .font-semibold.text-gold-dark {
    font-size: 12px !important; font-weight: 500 !important; color: #B91C1C !important;
  }
  /* "查看详情 →" text link within cards */
  .dk-home-project-grid > a .text-brand.font-medium,
  .dk-project-list > a .text-brand.font-medium {
    font-size: 12px !important; color: #B91C1C !important; font-weight: 500 !important;
  }
  /* 浏览统计行 */
  .dk-home-project-grid > a .text-text-tertiary[style*="font-size:11px"],
  .dk-project-list > a .text-text-tertiary[style*="font-size:11px"] {
    font-size: 10px !important; color: #A8A29E !important;
  }

  /* ──────────────────────────────────────
     三、回款记录行（回款页、首页回款动态）
     ────────────────────────────────────── */
  /* 首页回款动态容器 */
  .dk-home-right .bg-white.rounded-2xl.shadow-card {
    padding: 0 !important;
    border-radius: 12px !important;
    border: 1px solid #F0EFED !important;
    box-shadow: 0 1px 4px rgba(0,0,0,0.03) !important;
    overflow: hidden !important;
    margin-bottom: 12px !important;
  }
  /* 每行回款记录 */
  .dk-home-right .bg-white.rounded-2xl.shadow-card > div {
    padding: 12px 20px !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    border-bottom: 1px solid #F5F5F4 !important;
    min-height: 44px !important;
  }
  .dk-home-right .bg-white.rounded-2xl.shadow-card > div:last-child {
    border-bottom: none !important;
  }
  .dk-home-right .bg-white.rounded-2xl.shadow-card > div:active {
    background: #FAFAF9 !important;
  }
  /* 日期 */
  .dk-home-right .text-text-tertiary[style*="min-width"] {
    font-size: 11px !important; color: #A8A29E !important;
    min-width: 56px !important;
  }
  /* 项目名称 */
  .dk-home-right .text-text-primary.font-medium {
    font-size: 13px !important; font-weight: 500 !important; color: #1C1917 !important;
    overflow: hidden !important; text-overflow: ellipsis !important;
    white-space: nowrap !important;
    max-width: calc(100vw - 200px) !important;
  }
  /* 金额 */
  .dk-home-right .font-semibold[style*="color:#16a34a"] {
    font-size: 15px !important; font-weight: 700 !important;
    color: #16A34A !important;
    text-align: right !important; flex-shrink: 0 !important;
  }

  /* 首页回款动态标题行 */
  .dk-home-right > section > .flex.items-center.justify-between,
  .dk-home-right > section > h3 {
    padding: 0 20px !important;
    margin-bottom: 10px !important;
    display: flex !important; justify-content: space-between !important; align-items: center !important;
  }
  .dk-home-right > section > h3,
  .dk-home-right > section > .flex h3 {
    font-size: 14px !important; font-weight: 600 !important; color: #1C1917 !important;
  }
  .dk-home-right > section .text-brand.font-medium {
    font-size: 12px !important; color: #B91C1C !important;
  }

  /* ──────────────────────────────────────
     四、合同卡片（我的合同 Tab、投资详情页）
     ────────────────────────────────────── */
  .contract-card {
    padding: 16px 20px !important;
    border-radius: 12px !important;
    border: 1px solid #F0EFED !important;
    box-shadow: 0 1px 4px rgba(0,0,0,0.03) !important;
  }
  .contract-no {
    font-size: 11px !important; color: #A8A29E !important;
    font-family: monospace !important;
  }
  .contract-title {
    font-size: 14px !important; font-weight: 600 !important; color: #1C1917 !important;
  }

  /* ──────────────────────────────────────
     五、KPI 统计卡片（首页投资概览、管理后台、老师工作台）
     ────────────────────────────────────── */
  /* 首页统计卡 — 2列 */
  .dk-home-stats > div {
    padding: 16px 18px !important;
    background: #FFFFFF !important;
    border-radius: 10px !important;
    border: 1px solid #F0EFED !important;
    min-height: 80px !important;
  }
  .dk-home-stats > div > .font-extrabold {
    font-size: 22px !important; font-weight: 700 !important;
    color: #1C1917 !important; line-height: 1.2 !important;
  }
  .dk-home-stats > div > .text-text-tertiary {
    font-size: 11px !important; color: #A8A29E !important;
    margin-top: 6px !important;
  }

  /* 管理后台 KPI — 2列3行 */
  .admin-kpi-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 10px !important;
  }
  .admin-kpi-card,
  .admin-kpi-grid > div {
    padding: 16px 18px !important;
    background: #FFFFFF !important;
    border-radius: 10px !important;
    border: 1px solid #F0EFED !important;
    min-height: 80px !important;
    text-align: center !important;
  }
  .admin-kpi-val {
    font-size: 22px !important; font-weight: 700 !important;
    color: #1C1917 !important; line-height: 1.2 !important;
  }
  .admin-kpi-label {
    font-size: 11px !important; color: #A8A29E !important;
    margin-top: 6px !important;
  }
  /* 管理后台 KPI 顶部装饰线保持 */
  .admin-kpi-grid > div:nth-child(1) { border-top: 3px solid #B91C1C !important; }
  .admin-kpi-grid > div:nth-child(2) { border-top: 3px solid #D97706 !important; }
  .admin-kpi-grid > div:nth-child(3) { border-top: 3px solid #2563EB !important; }
  .admin-kpi-grid > div:nth-child(4) { border-top: 3px solid #16A34A !important; }
  .admin-kpi-grid > div:nth-child(5) { border-top: 3px solid #7C3AED !important; }
  .admin-kpi-grid > div:nth-child(6) { border-top: 3px solid #0891B2 !important; }

  /* 老师工作台统计条 */
  #teacher-stats-bar {
    border-radius: 10px !important;
    border: 1px solid #F0EFED !important;
    overflow: hidden !important;
  }
  #teacher-stats-bar > div {
    padding: 16px 18px !important;
    min-height: 80px !important;
    text-align: center !important;
  }

  /* 投资概览卡片 */
  .invest-overview-card {
    padding: 18px 20px !important;
    border-radius: 12px !important;
    border: 1px solid #F0EFED !important;
    box-shadow: 0 1px 4px rgba(0,0,0,0.03) !important;
  }
  .invest-overview-total {
    font-size: 22px !important; font-weight: 700 !important; line-height: 1.2 !important;
  }
  .invest-overview-repaid {
    font-size: 18px !important; font-weight: 700 !important;
  }
  .invest-overview-label {
    font-size: 11px !important; color: #A8A29E !important; margin-top: 6px !important;
  }

  /* ──────────────────────────────────────
     六、学员卡片（管理后台学员 Tab、老师工作台班级学员列表）
     ────────────────────────────────────── */
  .class-student-row {
    padding: 16px 20px !important;
    display: flex !important; align-items: center !important; gap: 10px !important;
    font-size: 13px !important;
    min-height: 44px !important;
  }
  .class-student-row > div:first-child {
    width: 40px !important; height: 40px !important; flex-shrink: 0;
  }

  /* ──────────────────────────────────────
     七、引荐请求卡片（老师工作台引荐列表）
     ────────────────────────────────────── */
  .ref-request-item {
    padding: 16px 20px !important;
  }
  /* 顶部行 */
  .ref-person-row {
    display: flex !important; align-items: center !important; gap: 8px !important;
    margin-bottom: 4px !important;
  }
  .ref-avatar {
    width: 32px !important; height: 32px !important;
    font-size: 11px !important; flex-shrink: 0;
  }
  /* 留言块 */
  .ref-msg-block {
    font-size: 12px !important; color: #57534E !important;
    margin-top: 10px !important; line-height: 1.5 !important;
    display: -webkit-box !important; -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important; overflow: hidden !important;
  }
  /* 操作按钮行 */
  .ref-btn-row {
    margin-top: 12px !important; padding-top: 12px !important;
    border-top: 1px solid #F5F5F4 !important;
  }
  .ref-btn-connected {
    width: 100% !important;
    background: linear-gradient(135deg, #B91C1C, #991B1B) !important;
    color: #FFFFFF !important; padding: 10px 0 !important;
    border-radius: 10px !important; font-size: 14px !important; font-weight: 500 !important;
    text-align: center !important;
    min-height: 44px !important;
  }
  .ref-btn-connected:active {
    background: linear-gradient(135deg, #991B1B, #7F1D1D) !important;
  }
  .ref-btn-connected:hover {
    transform: none !important;
  }
  .ref-btn-decline {
    display: none !important;
  }

  /* ──────────────────────────────────────
     八、通知消息行（/notifications 页面）
     ────────────────────────────────────── */
  #notification-list {
    background: #FFFFFF !important;
    border-radius: 12px !important;
    border: 1px solid #F0EFED !important;
    overflow: hidden !important;
    margin: 0 16px !important;
  }
  /* 每行通知 */
  #notification-list > div,
  #notification-list > .notif-item {
    padding: 14px 20px !important;
    border-bottom: 1px solid #F5F5F4 !important;
    min-height: 44px !important;
    position: relative !important;
  }
  #notification-list > div:last-child,
  #notification-list > .notif-item:last-child {
    border-bottom: none !important;
  }
  #notification-list > div:active,
  #notification-list > .notif-item:active {
    background: #FAFAF9 !important;
  }
  /* 通知标题 */
  #notification-list .notif-item > div > div:first-child span:first-child {
    font-size: 13px !important; font-weight: 500 !important;
    overflow: hidden !important; text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }
  /* 通知内容预览 */
  #notification-list .notif-item > div > div:nth-child(2) {
    font-size: 12px !important; color: #78716C !important;
    margin-top: 3px !important; line-height: 1.5 !important;
    display: -webkit-box !important; -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important; overflow: hidden !important;
  }
  /* 通知时间 */
  #notification-list .notif-item > div > div:last-child {
    font-size: 10px !important; color: #A8A29E !important;
    margin-top: 4px !important;
  }

  /* ──────────────────────────────────────
     九、回款速报条（首页绿色横幅）
     ────────────────────────────────────── */
  #repayment-flash-bar > div {
    padding: 14px 20px !important;
    border-radius: 10px !important;
    display: flex !important;
    flex-direction: column !important;
  }
  /* 第一行：标签+金额 */
  #repayment-flash-bar > div > div:first-child {
    display: flex !important;
    justify-content: space-between !important;
    align-items: baseline !important;
  }
  /* 第二行：项目数+详情 */
  #repayment-flash-bar > div > div:nth-child(2) {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-top: 6px !important;
  }

  /* ──────────────────────────────────────
     十、分享卡片预览（底部弹出面板内的品牌推介卡）
     ────────────────────────────────────── */
  #share-overlay #share-panel {
    border-radius: 24px 24px 0 0 !important;
    max-height: 85vh !important;
  }
  #share-overlay #share-panel > div {
    padding: 20px !important;
  }

  /* ──────────────────────────────────────
     十一、空状态展示（无数据时）
     ────────────────────────────────────── */
  .empty-state {
    padding: 40px 20px !important;
    text-align: center !important;
  }
  .empty-state-icon {
    font-size: 40px !important;
    margin-bottom: 12px !important;
  }
  .empty-state-text {
    font-size: 15px !important; font-weight: 500 !important;
    color: #57534E !important;
  }
  .empty-state-btn {
    margin-top: 16px !important;
    padding: 10px 24px !important;
    border-radius: 10px !important;
    font-size: 14px !important;
    min-height: 44px !important;
  }

  /* ──────────────────────────────────────
     十二、触摸优化（手机端专属）
     ────────────────────────────────────── */
  /* 确保按钮和可点击行最小触摸面积 44px */
  .btn-primary, .btn-secondary, .btn-gold,
  .modal-btn, .ref-btn,
  .empty-state-btn,
  .filter-select {
    min-height: 44px !important;
  }
  .menu-row {
    min-height: 44px !important;
  }
  /* 文字链接加大点击热区 */
  .dk-home-project-grid > a .text-brand,
  .dk-project-list > a .text-brand,
  .back-link {
    padding: 8px 12px !important;
    margin: -8px -12px !important;
  }
  /* 筛选标签 */
  .filter-select {
    min-height: 32px !important;
    padding: 6px 28px 6px 10px !important;
  }

  /* ──────────────────────────────────────
     追加：quick-card 紧凑化
     ────────────────────────────────────── */
  .quick-card {
    border-radius: 12px !important;
    padding: 16px 18px !important;
    height: 88px !important;
  }
  .quick-card:hover {
    transform: none !important;
    box-shadow: none !important;
  }
  .quick-card:active {
    opacity: 0.92;
    transition: opacity 0.1s;
  }

  /* ──────────────────────────────────────
     追加：KPI banner 紧凑化
     ────────────────────────────────────── */
  .kpi-banner {
    border-radius: 12px !important;
    padding: 16px 8px !important;
  }
  .kpi-val {
    font-size: 18px !important;
  }
  .kpi-label {
    font-size: 10px !important;
  }

  /* ──────────────────────────────────────
     追加：Payback 庆祝横幅紧凑化
     ────────────────────────────────────── */
  .payback-banner {
    padding: 14px 20px !important;
    border-radius: 12px !important;
  }
  .payback-banner .banner-title {
    font-size: 16px !important;
  }
  .payback-banner .banner-sub {
    font-size: 12px !important;
  }

  /* ──────────────────────────────────────
     追加：Menu Row 紧凑化
     ────────────────────────────────────── */
  .menu-row:hover {
    transform: none !important;
  }
  .menu-row:active {
    background: #FAFAF9 !important;
    transition: background 0.1s !important;
  }

  /* ──────────────────────────────────────
     追加：Shadow card hover disable on mobile
     ────────────────────────────────────── */
  .shadow-card-hover:hover {
    transform: none !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03) !important;
  }
  .dk-clickable-card:hover {
    transform: none !important;
    box-shadow: none !important;
  }

  /* ──────────────────────────────────────
     追加：320px 极窄屏保护
     ────────────────────────────────────── */
  @media (max-width: 340px) {
    .kpi-banner { flex-wrap: wrap; }
    .kpi-item { min-width: 50%; padding: 6px 4px; }
    .kpi-item:not(:last-child)::after { display: none; }
    .admin-kpi-grid { grid-template-columns: 1fr !important; }
    .dk-home-stats { grid-template-columns: 1fr !important; }
  }
}

/* ══════════════════════════════════════════════════════════
   RESPONSIVE — Tablet (769px – 1024px)
   ══════════════════════════════════════════════════════════ */
@media (min-width: 769px) and (max-width: 1024px) {
  /* Desktop-only elements: hide */
  .desktop-sidebar, .desktop-topbar { display: none !important; }

  /* Content area centered */
  .app-container {
    max-width: 680px; margin: 0 auto;
    box-shadow: 0 0 40px rgba(0,0,0,0.06);
  }
  .app-container > main { padding-left: 24px !important; padding-right: 24px !important; }

  /* Navbar: full width, but content centered */
  .app-navbar {
    max-width: 100%; padding: 0 24px;
  }

  /* TabBar follows content width */
  .tab-bar {
    max-width: 680px; left: 50%; transform: translateX(-50%);
  }

  /* Help button & nudge bar */
  #help-float-btn { right: calc(50% - 340px + 16px); }
  .nudge-bar { left: calc(50% - 340px + 16px); right: calc(50% - 340px + 16px); }
  #faq-panel { max-width: 680px; left: 50%; right: auto; transform: translateX(-50%) translateY(100%); }
  #faq-overlay.show #faq-panel { transform: translateX(-50%) translateY(0); }
}

/* ══════════════════════════════════════════════════════════
   RESPONSIVE — Desktop (≥1025px)
   ══════════════════════════════════════════════════════════ */
@media (min-width: 1025px) {
  /* ── Hide mobile elements ── */
  .app-navbar { display: none !important; }
  .app-navbar-admin { display: none !important; }
  .tab-bar { display: none !important; }
  .has-tabbar { padding-bottom: 0 !important; }

  /* ── Global layout ── */
  html, body { overflow: hidden; height: 100vh; }
  .app-container {
    max-width: none !important; box-shadow: none !important;
    margin: 0 !important; margin-left: 240px !important;
    min-height: 100vh; height: 100vh; overflow-y: auto;
    position: relative;
  }

  /* ── Desktop Sidebar ── */
  .desktop-sidebar {
    display: flex !important; flex-direction: column;
    position: fixed; left: 0; top: 0; bottom: 0;
    width: 240px; z-index: 200;
    background: linear-gradient(180deg, #1C1917 0%, #292524 100%);
    color: #fff; overflow-y: auto;
  }
  .desktop-sidebar::-webkit-scrollbar { width: 0; }

  .ds-brand {
    padding: 28px 24px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .ds-brand-logo { display: flex; align-items: center; gap: 10px; }
  .ds-brand-name { font-size: 20px; font-weight: 700; color: #fff; }
  .ds-brand-sub { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px; }

  .ds-nav {
    flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px;
  }
  .ds-nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; border-radius: 10px;
    color: rgba(255,255,255,0.6); font-size: 15px;
    cursor: pointer; transition: all 0.2s ease;
    text-decoration: none; border: none; background: none; width: 100%;
    position: relative;
  }
  .ds-nav-item:hover {
    background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85);
  }
  .ds-nav-item.ds-active {
    background: rgba(185,28,28,0.15); color: #FFFFFF; font-weight: 600;
  }
  .ds-nav-item.ds-active::before {
    content: ''; position: absolute; left: 0; top: 8px; bottom: 8px;
    width: 3px; background: #B91C1C; border-radius: 0 2px 2px 0;
  }
  .ds-nav-icon { width: 20px; text-align: center; font-size: 16px; flex-shrink: 0; }

  .ds-stats {
    padding: 16px 20px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .ds-stats-line {
    font-size: 12px; color: rgba(255,255,255,0.35);
    line-height: 1.8;
  }

  .ds-user {
    padding: 16px 20px;
    border-top: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; gap: 10px;
  }
  .ds-user-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: #B91C1C; color: #fff; font-size: 14px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .ds-user-info { flex: 1; min-width: 0; }
  .ds-user-name { font-size: 14px; color: #fff; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ds-user-role { font-size: 12px; color: rgba(255,255,255,0.4); }
  .ds-user-switch {
    font-size: 12px; color: rgba(255,255,255,0.5); cursor: pointer;
    background: none; border: none; padding: 4px 8px; flex-shrink: 0;
    transition: color 0.2s;
  }
  .ds-user-switch:hover { color: rgba(255,255,255,0.8); }

  /* ── Desktop Top Bar ── */
  .desktop-topbar {
    display: flex !important; align-items: center; justify-content: space-between;
    position: fixed; top: 0; left: 240px; right: 0; z-index: 100;
    height: 60px; padding: 0 32px;
    background: rgba(250,250,249,0.85);
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid #E7E5E4;
  }
  .dt-title { font-size: 18px; font-weight: 600; color: #1C1917; }
  .dt-actions { display: flex; align-items: center; gap: 12px; }
  .dt-demo-btn {
    font-size: 12px; color: #B91C1C; background: rgba(185,28,28,0.08);
    border-radius: 8px; padding: 6px 12px; cursor: pointer; border: none;
    font-weight: 500; transition: background 0.2s;
  }
  .dt-demo-btn:hover { background: rgba(185,28,28,0.15); }
  .dt-bell {
    position: relative; width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; background: none; border: none; transition: background 0.2s;
  }
  .dt-bell:hover { background: rgba(0,0,0,0.04); }
  .dt-bell-dot {
    position: absolute; top: 2px; right: 2px;
    min-width: 16px; height: 16px; background: #DC2626;
    color: #fff; font-size: 10px; font-weight: 700; border-radius: 8px;
    text-align: center; line-height: 16px; padding: 0 3px; display: none;
  }

  /* ── Content area ── */
  .app-container > main,
  .app-container > .page-enter {
    max-width: 1200px;
    padding: 84px 32px 32px !important;
  }
  .app-container > main.max-w-lg { max-width: 1200px; }

  /* Filter bar sticky offset adjusted (fixed topbar at 60px) */
  .filter-bar { top: 60px; }
  .rep-tab-bar { top: 60px; }
  #admin-tabs { top: 60px; }

  /* Help button & nudge for desktop */
  #help-float-btn { bottom: 24px; right: 32px; }
  .nudge-bar { bottom: 24px; left: 272px; right: 32px; }
  #faq-panel { max-width: 480px; left: auto; right: 32px; transform: translateY(100%); border-radius: 20px 20px 0 0; }
  #faq-overlay.show #faq-panel { transform: translateY(0); }

  /* ── Login page: no sidebar ── */
  body.is-login-page .desktop-sidebar { display: none !important; }
  body.is-login-page .desktop-topbar { display: none !important; }
  body.is-login-page .app-container {
    margin-left: 0 !important; max-width: none !important;
    height: auto; overflow: visible;
  }
  body.is-login-page { overflow: auto; height: auto; }

  /* Login split layout */
  .login-desktop-split {
    display: flex !important; min-height: 100vh;
  }
  .login-desktop-brand {
    display: flex !important; width: 50%; flex-direction: column;
    align-items: center; justify-content: center;
    background: linear-gradient(160deg, #7F1D1D 0%, #B91C1C 50%, #991B1B 100%);
    padding: 60px 40px; position: relative; overflow: hidden;
  }
  .login-desktop-brand::before {
    content: '';
    position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
    background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.06) 0%, transparent 50%);
    pointer-events: none;
  }
  .login-desktop-brand-inner { position: relative; z-index: 1; text-align: center; max-width: 400px; }
  .login-desktop-form {
    width: 50%; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(160deg, #7F1D1D 0%, #B91C1C 50%, #991B1B 100%);
    padding: 40px;
  }

  /* ── Guide page: no sidebar ── */
  body.is-guide-page .desktop-sidebar { display: none !important; }
  body.is-guide-page .desktop-topbar { display: none !important; }
  body.is-guide-page .app-container,
  body.is-guide-page .guide-page-wrap {
    margin-left: 0 !important; max-width: none !important;
    height: auto; overflow: visible;
  }
  body.is-guide-page { overflow: auto; height: auto; }
  body.is-guide-page .guide-timeline { max-width: 900px; margin: 0 auto; }
  body.is-guide-page .guide-section-title { max-width: 900px; margin-left: auto; margin-right: auto; }
  body.is-guide-page .guide-step-grid {
    display: grid !important; grid-template-columns: repeat(2, 1fr); gap: 24px;
  }

  /* ════════════════════════════════════════════════════════
     DESKTOP CONTENT LAYOUT OPTIMIZATIONS
     All below only active at ≥1025px
     ════════════════════════════════════════════════════════ */

  /* ── Global: clickable card hover (desktop only) ── */
  .dk-clickable-card {
    transition: all 0.25s ease !important;
    cursor: pointer;
  }
  .dk-clickable-card:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
  }
  .dk-clickable-card:active {
    transform: translateY(0) !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;
  }
  /* Apply hover to all project cards in lists */
  #project-list > a,
  .dk-home-project-grid > a,
  .dk-repayments-content a[href^="/investments/"],
  .teacher-card,
  .admin-section,
  .menu-row {
    transition: all 0.25s ease;
  }
  #project-list > a:hover,
  .dk-home-project-grid > a:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  }
  #project-list > a:active,
  .dk-home-project-grid > a:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  /* ═══════════════════════════════════════
     I. HOME PAGE — Two Column Layout
     ═══════════════════════════════════════ */
  .dk-home-main {
    display: grid !important;
    grid-template-columns: 1fr 380px !important;
    grid-template-rows: auto auto 1fr !important;
    gap: 24px !important;
    max-width: 1200px !important;
    align-items: start;
  }
  .dk-home-welcome {
    grid-column: 1 / 3 !important;
    margin-bottom: 0 !important;
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;
  }
  .dk-home-greeting {
    font-size: 24px !important;
  }
  .dk-home-share-input {
    margin: 0 !important; flex-shrink: 0; width: 360px;
  }
  .dk-home-left {
    grid-column: 1 / 2;
    grid-row: 2 / 4;
    min-width: 0;
  }
  .dk-home-right {
    grid-column: 2 / 3;
    grid-row: 2 / 4;
    position: sticky;
    top: 84px;
    align-self: start;
  }
  .dk-home-project-grid {
    display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important;
    flex-direction: initial !important;
  }
  .dk-home-project-grid > a {
    padding: 20px !important;
  }
  .dk-home-stats {
    grid-template-columns: repeat(4, 1fr) !important;
  }

  /* ═══════════════════════════════════════
     II. PROJECT HALL — Three Column Grid
     ═══════════════════════════════════════ */
  .dk-projects-main {
    max-width: 1200px !important;
  }
  .dk-projects-filter {
    flex-wrap: wrap !important;
    gap: 8px !important;
    padding: 12px 16px !important;
  }
  .dk-projects-filter .filter-select {
    flex: 0 0 auto !important;
    min-width: 140px !important;
  }
  .dk-project-list {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 20px !important;
    flex-direction: initial !important;
  }
  .dk-project-list > a {
    padding: 20px !important;
  }
  .dk-empty-state {
    grid-column: 1 / -1;
    max-width: 400px !important;
    margin: 0 auto !important;
  }
  /* Industry filter tags (flex-wrap) on desktop */
  .dk-projects-main .kpi-banner {
    flex-wrap: nowrap !important;
  }
  .dk-projects-main .kpi-item {
    min-width: 0 !important;
    padding: 0 8px !important;
  }

  /* ═══════════════════════════════════════
     III. PROJECT DETAIL — Left/Right Split
     ═══════════════════════════════════════ */
  .dk-detail-main {
    display: grid !important;
    grid-template-columns: 1fr 360px !important;
    gap: 24px 32px !important;
    max-width: 1100px !important;
    align-items: start;
  }
  /* Full row items */
  .dk-detail-fullrow {
    grid-column: 1 / -1 !important;
  }
  /* Left info column wrapper */
  .dk-detail-left {
    grid-column: 1 / 2;
    grid-row: 2 / 20;
    min-width: 0;
  }
  .dk-detail-left .dk-detail-info h1 {
    font-size: 26px !important;
  }
  /* Right action column (sticky) */
  .dk-detail-action-card {
    grid-column: 2 / 3 !important;
    grid-row: 2 / 3;
    position: sticky !important;
    top: 84px !important;
    background: #fff !important;
    border-radius: 16px !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.06) !important;
    padding: 24px !important;
    align-self: start;
    z-index: 10;
  }
  .dk-detail-action-card .grid-cols-3 {
    grid-template-columns: 1fr 1fr !important;
  }
  .dk-detail-action-card .grid-cols-3 > div:last-child {
    grid-column: 1 / -1;
    text-align: center;
  }
  .dk-detail-action-owner {
    display: block !important;
  }
  .dk-detail-action-card .btn-gold {
    height: 48px !important;
    background: linear-gradient(135deg, #DC2626, #B91C1C) !important;
    font-size: 16px !important;
  }
  .dk-detail-action-card .btn-gold:hover {
    background: linear-gradient(135deg, #B91C1C, #991B1B) !important;
  }
  /* Bottom items (investors, share buttons) flow in left col */
  .dk-detail-bottom {
    grid-column: 1 / 2;
  }

  /* ═══════════════════════════════════════
     IV. REPAYMENTS — Left/Right Layout
     ═══════════════════════════════════════ */
  .dk-repayments-main {
    max-width: 1200px !important;
  }
  .dk-repayments-content {
    max-width: none !important;
  }

  /* ═══════════════════════════════════════
     V. PROFILE — Horizontal Expand
     ═══════════════════════════════════════ */
  .dk-profile-main {
    max-width: 900px !important;
  }
  .dk-profile-card {
    text-align: left !important;
    display: flex !important;
    align-items: center !important;
    gap: 24px !important;
    padding: 24px 32px !important;
  }
  .dk-profile-card > #profile-avatar {
    margin: 0 !important;
    flex-shrink: 0;
    width: 64px !important;
    height: 64px !important;
    font-size: 28px !important;
  }
  .dk-profile-card > #profile-name {
    font-size: 20px !important;
  }
  .dk-profile-card > #edit-profile-btn {
    margin-left: auto;
    margin-top: 0 !important;
  }

  /* ═══════════════════════════════════════
     VI. ADMIN — Wide Tables & KPIs
     ═══════════════════════════════════════ */
  .dk-admin-main {
    max-width: 1200px !important;
  }
  /* KPI cards: 6 cols on desktop */
  .dk-admin-main .admin-kpi-grid {
    grid-template-columns: repeat(6, 1fr) !important;
  }
  /* Member/student list: table-style on desktop */
  .dk-admin-main .admin-section {
    padding: 24px !important;
  }

  /* ═══════════════════════════════════════
     VII. TEACHER — Two Column
     ═══════════════════════════════════════ */
  .dk-teacher-main {
    max-width: 1100px !important;
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 24px !important;
    align-items: start;
  }
  /* Welcome & stats span full width */
  .dk-teacher-main > #teacher-welcome-card,
  .dk-teacher-main > #teacher-stats-bar,
  .dk-teacher-main > .teacher-header,
  .dk-teacher-main > .teacher-footer {
    grid-column: 1 / -1;
  }
  /* Stats bar horizontal */
  .dk-teacher-main > #teacher-stats-bar {
    display: grid !important;
    grid-template-columns: repeat(4, 1fr) !important;
  }
  /* Referral section left, classes & recommend right */
  .dk-teacher-main > #referral-section {
    grid-column: 1 / 2;
  }
  .dk-teacher-main > #classes-section,
  .dk-teacher-main > #recommend-section {
    grid-column: 2 / 3;
  }

  /* ═══════════════════════════════════════
     VIII. MODAL & OVERLAY ADAPTATIONS
     ═══════════════════════════════════════ */
  /* Bottom sheets → centered modals on desktop.
     Key: We must NOT override display:none, only adjust when shown. 
     JS sets display:block/flex when opening; CSS converts bottom-sheet to center. */

  /* Share sheet: when shown (display:block), convert to centered flex */
  #share-overlay[style*="display:block"],
  #share-overlay[style*="display: block"] {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    backdrop-filter: blur(4px) !important;
    -webkit-backdrop-filter: blur(4px) !important;
  }
  #share-overlay #share-panel {
    position: relative !important;
    bottom: auto !important;
    left: auto !important;
    right: auto !important;
    max-width: 480px !important;
    max-height: 80vh !important;
    width: 92% !important;
    border-radius: 16px !important;
  }

  /* Recommend panel overlay */
  #recommend-overlay[style*="display:block"],
  #recommend-overlay[style*="display: block"] {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    backdrop-filter: blur(4px) !important;
  }
  #recommend-overlay #recommend-panel {
    position: relative !important;
    bottom: auto !important;
    left: auto !important;
    right: auto !important;
    max-width: 520px !important;
    max-height: 80vh !important;
    width: 92% !important;
    border-radius: 16px !important;
  }

  /* Member detail overlay → centered modal */
  #member-detail-overlay[style*="display:block"],
  #member-detail-overlay[style*="display: block"],
  #member-detail-overlay[style*="display:flex"],
  #member-detail-overlay[style*="display: flex"] {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    backdrop-filter: blur(4px) !important;
  }
  #member-detail-overlay > div {
    max-width: 640px !important;
    width: 92% !important;
    border-radius: 16px !important;
    max-height: 80vh !important;
    overflow-y: auto !important;
    position: relative !important;
    bottom: auto !important;
  }

  /* FAQ panel → right-side modal card */
  #faq-panel {
    max-width: 480px !important;
    border-radius: 16px !important;
    max-height: 80vh !important;
  }

  /* Referral overlay → centered with blur */
  #referral-overlay[style*="display:flex"],
  #referral-overlay[style*="display: flex"] {
    backdrop-filter: blur(4px) !important;
  }
  #referral-overlay #referral-modal {
    max-width: 480px !important;
  }

  /* Contract modal → centered on desktop */
  #rep-contract-modal[style*="display:block"] #rep-contract-modal-sheet,
  #rep-contract-modal[style*="display: block"] #rep-contract-modal-sheet {
    max-width: 640px !important;
    margin: 10vh auto 0 !important;
    border-radius: 16px !important;
    max-height: 80vh !important;
  }

  /* ════════════════════════════════════════════════════════════
     DESKTOP CARD TYPOGRAPHY & LAYOUT REFINEMENTS (19C)
     All styles below are DESKTOP-ONLY (≥1025px).
     No HTML structure, data bindings, or event logic is changed.
     ════════════════════════════════════════════════════════════ */

  /* ──────────────────────────────────────
     一、可复用组件：状态标签颜色映射
     ────────────────────────────────────── */
  .tag-recruiting {
    font-size: 11px !important; font-weight: 500 !important;
    color: #B45309 !important; background: rgba(180,83,9,0.08) !important;
    padding: 3px 10px !important; border-radius: 6px !important;
    border: none !important;
  }
  .tag-active {
    font-size: 11px !important; font-weight: 500 !important;
    color: #15803D !important; background: rgba(21,128,61,0.08) !important;
    padding: 3px 10px !important; border-radius: 6px !important;
    border: none !important;
  }
  .tag-completed {
    font-size: 11px !important; font-weight: 500 !important;
    color: #1D4ED8 !important; background: rgba(29,78,216,0.08) !important;
    padding: 3px 10px !important; border-radius: 6px !important;
    border: none !important;
  }
  .tag-terminated {
    font-size: 11px !important; font-weight: 500 !important;
    color: #78716C !important; background: #F5F5F4 !important;
    padding: 3px 10px !important; border-radius: 6px !important;
    border: none !important;
  }
  .tag-draft {
    font-size: 11px !important; font-weight: 500 !important;
    color: #78716C !important; background: #F5F5F4 !important;
    padding: 3px 10px !important; border-radius: 6px !important;
    border: 1px dashed #D6D3D1 !important;
  }

  /* ──────────────────────────────────────
     一、可复用组件：数据指标容器
     ────────────────────────────────────── */
  .data-metric-box {
    background: #FAFAF9 !important;
    border-radius: 10px !important;
    padding: 14px 0 !important;
    display: grid !important;
    grid-template-columns: 1fr 1fr 1fr !important;
  }
  .data-metric-box > *:nth-child(2) {
    border-left: 1px solid #E7E5E4;
    border-right: 1px solid #E7E5E4;
  }
  .data-metric-box > * {
    text-align: center !important;
  }
  .data-metric-box .dm-value {
    font-size: 18px; font-weight: 700; color: #1C1917;
  }
  .data-metric-box .dm-value .dm-prefix,
  .data-metric-box .dm-value .dm-suffix {
    font-size: 13px; font-weight: 400;
  }
  .data-metric-box .dm-label {
    font-size: 11px; color: #A8A29E; margin-top: 4px;
  }

  /* ──────────────────────────────────────
     一、电脑端卡片基础样式（所有白色卡片共享）
     ────────────────────────────────────── */
  .dk-home-project-grid > a,
  .dk-project-list > a,
  #panel-invest .bg-white,
  #panel-initiate .bg-white,
  .teacher-card,
  .admin-section {
    padding: 24px 28px !important;
    background: #FFFFFF !important;
    border-radius: 14px !important;
    border: 1px solid #F0EFED !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04) !important;
    transition: all 0.25s ease !important;
  }
  .dk-home-project-grid > a:hover,
  .dk-project-list > a:hover,
  .teacher-card:hover,
  .admin-section:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
  }
  .dk-home-project-grid > a:active,
  .dk-project-list > a:active,
  .teacher-card:active,
  .admin-section:active {
    transform: translateY(0) !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;
  }

  /* ──────────────────────────────────────
     二、项目卡片（首页、大厅、我的发起、我的投资）
     ────────────────────────────────────── */

  /* 区域 A – 发起人信息行 */
  .dk-home-project-grid > a > div:first-child,
  .dk-project-list > a > div:first-child {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    padding-bottom: 14px !important;
  }
  /* 头像圆形 40px */
  .dk-home-project-grid > a > div:first-child > div:first-child,
  .dk-project-list > a > div:first-child > div:first-child {
    width: 40px !important; height: 40px !important;
    font-size: 14px !important;
  }
  /* 姓名样式 */
  .dk-home-project-grid > a > div:first-child .text-text-primary,
  .dk-project-list > a > div:first-child .text-text-primary {
    font-size: 15px !important; font-weight: 600 !important; color: #1C1917 !important;
  }
  /* 公司名 */
  .dk-home-project-grid > a > div:first-child .text-text-tertiary,
  .dk-project-list > a > div:first-child .text-text-tertiary {
    font-size: 13px !important; color: #78716C !important;
  }

  /* 区域 B – 项目核心信息 */
  /* 项目名称 */
  .dk-home-project-grid > a > .font-semibold.text-text-title,
  .dk-project-list > a > .font-semibold.text-text-title {
    font-size: 17px !important; font-weight: 700 !important; color: #1C1917 !important;
    line-height: 1.4 !important; margin-bottom: 10px !important;
    display: -webkit-box !important; -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important; overflow: hidden !important;
  }

  /* 标签行 */
  .dk-home-project-grid > a > .flex.items-center.gap-2,
  .dk-project-list > a > .flex.items-center.gap-2 {
    display: flex !important; gap: 8px !important;
    flex-wrap: wrap !important; margin-bottom: 14px !important;
  }
  /* 行业标签 */
  .dk-home-project-grid > a .bg-brand-soft,
  .dk-project-list > a .bg-brand-soft {
    font-size: 11px !important; font-weight: 500 !important;
    color: #B91C1C !important;
    background: rgba(185,28,28,0.06) !important;
    padding: 3px 10px !important; border-radius: 6px !important;
  }

  /* 区域 C – 进度与操作 */
  /* 进度条容器 */
  .dk-home-project-grid > a .progress-bar,
  .dk-project-list > a .progress-bar {
    height: 6px !important;
    background: #F0EFED !important;
    border-radius: 3px !important;
  }
  .dk-home-project-grid > a .progress-fill,
  .dk-project-list > a .progress-fill {
    border-radius: 3px !important;
    background: linear-gradient(90deg, #B91C1C, #DC2626) !important;
    transition: width 0.6s ease !important;
  }
  /* 进度百分比文字 */
  .dk-home-project-grid > a .font-semibold.text-gold-dark,
  .dk-project-list > a .font-semibold.text-gold-dark {
    font-size: 13px !important; font-weight: 600 !important; color: #B91C1C !important;
  }

  /* ──────────────────────────────────────
     三、回款记录行（首页回款动态 + 回款页列表）
     ────────────────────────────────────── */
  /* 首页回款动态容器 */
  .dk-home-right .bg-white.rounded-2xl.shadow-card {
    padding: 0 !important;
    border-radius: 14px !important;
    border: 1px solid #F0EFED !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04) !important;
    overflow: hidden !important;
  }
  /* 每行回款记录 */
  .dk-home-right .bg-white.rounded-2xl.shadow-card > div {
    padding: 14px 24px !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    transition: background 0.15s !important;
  }
  .dk-home-right .bg-white.rounded-2xl.shadow-card > div:hover {
    background: #FAFAF9 !important;
  }
  /* 日期 */
  .dk-home-right .text-text-tertiary[style*="min-width"] {
    font-size: 12px !important; color: #A8A29E !important;
    min-width: 72px !important;
  }
  /* 项目名称 */
  .dk-home-right .text-text-primary.font-medium {
    font-size: 14px !important; font-weight: 500 !important; color: #1C1917 !important;
    overflow: hidden !important; text-overflow: ellipsis !important;
    white-space: nowrap !important; max-width: 320px !important;
  }
  /* 金额 */
  .dk-home-right .font-semibold[style*="color:#16a34a"] {
    font-size: 16px !important; font-weight: 700 !important;
    text-align: right !important; min-width: 100px !important;
  }

  /* 首页回款动态标题行 */
  .dk-home-right > section > h3 {
    font-size: 15px !important; font-weight: 600 !important; color: #1C1917 !important;
    margin-bottom: 14px !important;
  }

  /* ──────────────────────────────────────
     四、合同卡片（投资详情页中的独立卡片形态）
     ────────────────────────────────────── */
  .contract-card {
    padding: 22px 28px !important;
    border-radius: 14px !important;
    border: 1px solid #F0EFED !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04) !important;
  }
  .contract-title {
    font-size: 20px !important; font-weight: 700 !important;
  }
  .contract-no {
    font-size: 12px !important; color: #A8A29E !important;
    font-family: monospace !important; letter-spacing: 0.5px !important;
  }

  /* ──────────────────────────────────────
     五、KPI 统计卡片（首页投资概览、管理后台、老师工作台）
     ────────────────────────────────────── */
  /* 首页四格统计卡 */
  .dk-home-stats > div {
    padding: 20px 24px !important;
    background: #FFFFFF !important;
    border-radius: 12px !important;
    border: 1px solid #F0EFED !important;
    min-height: 100px !important;
    transition: box-shadow 0.25s ease !important;
  }
  .dk-home-stats > div:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.06) !important;
  }
  .dk-home-stats > div > .font-extrabold {
    font-size: 28px !important; font-weight: 700 !important;
    color: #1C1917 !important; line-height: 1.2 !important;
  }
  .dk-home-stats > div > .text-text-tertiary {
    font-size: 12px !important; color: #A8A29E !important;
    margin-top: 8px !important;
  }

  /* 管理后台 KPI 6卡片 */
  .dk-admin-main .admin-kpi-grid > div {
    padding: 20px 24px !important;
    background: #FFFFFF !important;
    border-radius: 12px !important;
    border: 1px solid #F0EFED !important;
    min-height: 100px !important;
    transition: box-shadow 0.25s ease !important;
  }
  .dk-admin-main .admin-kpi-grid > div:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.06) !important;
  }
  /* 管理后台 KPI 顶部装饰线 */
  .dk-admin-main .admin-kpi-grid > div:nth-child(1) { border-top: 3px solid #B91C1C !important; }
  .dk-admin-main .admin-kpi-grid > div:nth-child(2) { border-top: 3px solid #D97706 !important; }
  .dk-admin-main .admin-kpi-grid > div:nth-child(3) { border-top: 3px solid #2563EB !important; }
  .dk-admin-main .admin-kpi-grid > div:nth-child(4) { border-top: 3px solid #16A34A !important; }
  .dk-admin-main .admin-kpi-grid > div:nth-child(5) { border-top: 3px solid #7C3AED !important; }
  .dk-admin-main .admin-kpi-grid > div:nth-child(6) { border-top: 3px solid #0891B2 !important; }

  /* 老师工作台统计条 */
  #teacher-stats-bar {
    border-radius: 12px !important;
    border: 1px solid #F0EFED !important;
    overflow: hidden !important;
  }
  #teacher-stats-bar > div {
    padding: 20px 24px !important;
    min-height: 100px !important;
  }

  /* 投资概览卡片 */
  .invest-overview-card {
    padding: 20px 24px !important;
    border-radius: 14px !important;
    border: 1px solid #F0EFED !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04) !important;
    transition: box-shadow 0.25s ease !important;
  }
  .invest-overview-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.06) !important;
  }
  .invest-overview-total {
    font-size: 28px !important; font-weight: 700 !important; line-height: 1.2 !important;
  }
  .invest-overview-repaid {
    font-size: 20px !important; font-weight: 700 !important;
  }
  .invest-overview-label {
    font-size: 12px !important; color: #A8A29E !important; margin-top: 8px !important;
  }

  /* ──────────────────────────────────────
     六、学员卡片（老师工作台班级学员）
     ────────────────────────────────────── */
  .class-student-row {
    padding: 20px 24px !important;
    display: flex !important; align-items: center !important; gap: 14px !important;
  }
  .class-student-row > div:first-child {
    width: 44px !important; height: 44px !important;
  }

  /* ──────────────────────────────────────
     七、引荐请求卡片（老师工作台引荐列表）
     ────────────────────────────────────── */
  .ref-request-item {
    padding: 20px 24px !important;
  }
  /* 顶部行 */
  .ref-person-row {
    display: flex !important; align-items: center !important; gap: 10px !important;
  }
  .ref-avatar {
    width: 36px !important; height: 36px !important;
    font-size: 13px !important;
  }
  /* 留言块 */
  .ref-msg-block {
    font-size: 13px !important; color: #57534E !important;
    margin-top: 12px !important;
    line-height: 1.5 !important;
    display: -webkit-box !important; -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important; overflow: hidden !important;
  }
  /* 操作按钮 */
  .ref-btn-row {
    margin-top: 16px !important; padding-top: 16px !important;
    border-top: 1px solid #F5F5F4 !important;
  }
  .ref-btn-connected {
    background: linear-gradient(135deg, #B91C1C, #991B1B) !important;
    color: #FFFFFF !important; padding: 8px 24px !important;
    border-radius: 8px !important; font-size: 13px !important; font-weight: 500 !important;
    transition: all 0.2s !important;
  }
  .ref-btn-connected:hover {
    background: linear-gradient(135deg, #991B1B, #7F1D1D) !important;
  }

  /* ──────────────────────────────────────
     八、通知消息行（/notifications 页面）
     ────────────────────────────────────── */
  #notification-list {
    background: #FFFFFF !important;
    border-radius: 14px !important;
    border: 1px solid #F0EFED !important;
    overflow: hidden !important;
    margin: 16px !important;
    min-height: auto !important;
  }
  /* 每行通知 */
  #notification-list > div {
    padding: 16px 24px !important;
    border-bottom: 1px solid #F5F5F4 !important;
    transition: background 0.15s !important;
    cursor: pointer !important;
  }
  #notification-list > div:last-child {
    border-bottom: none !important;
  }
  #notification-list > div:hover {
    background: #FAFAF9 !important;
  }

  /* ──────────────────────────────────────
     九、回款速报条（首页绿色横幅）
     ────────────────────────────────────── */
  #repayment-flash-bar > div {
    padding: 18px 28px !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    border-radius: 14px !important;
  }

  /* ──────────────────────────────────────
     十、分享卡片预览（弹窗内的品牌推介卡）
     ────────────────────────────────────── */
  #share-overlay #share-panel {
    max-width: 480px !important;
    border-radius: 16px !important;
  }
  /* 分享面板内部卡片间距 */
  #share-overlay #share-panel > div {
    padding: 28px !important;
  }

  /* ──────────────────────────────────────
     十一、空状态展示（无数据时）
     ────────────────────────────────────── */
  .empty-state {
    max-width: 360px !important;
    margin: 60px auto !important;
    text-align: center !important;
  }
  .empty-state-icon {
    font-size: 48px !important;
    margin-bottom: 16px !important;
  }
  .empty-state-text {
    font-size: 16px !important;
    font-weight: 500 !important;
    color: #57534E !important;
  }
  .empty-state-btn {
    margin-top: 20px !important;
  }
  /* 网格内的空状态也居中 */
  .dk-project-list .empty-state,
  .dk-home-project-grid .empty-state {
    grid-column: 1 / -1 !important;
    max-width: 360px !important;
    margin: 60px auto !important;
  }

  /* ──────────────────────────────────────
     十二、Quick Action 卡片优化
     ────────────────────────────────────── */
  .quick-card {
    padding: 24px 28px !important;
    border-radius: 14px !important;
    height: auto !important;
    min-height: 100px !important;
  }

  /* ──────────────────────────────────────
     追加：Payback 庆祝横幅优化
     ────────────────────────────────────── */
  .payback-banner {
    padding: 18px 28px !important;
    border-radius: 14px !important;
    margin: 0 0 16px !important;
  }

  /* ──────────────────────────────────────
     追加：Menu Row (Profile) 优化
     ────────────────────────────────────── */
  .menu-row {
    padding: 16px 24px !important;
    transition: background 0.15s, transform 0.15s !important;
  }
  .menu-row:hover {
    background: #FAFAF9 !important;
    transform: translateX(2px) !important;
  }
}
`,
          }}
        />
      </head>
      <body class="bg-surface-page text-text-primary">

        {/* ══ Splash Screen ══ */}
        <div id="splash-screen" dangerouslySetInnerHTML={{__html: `
          <style>
            #splash-screen {
              position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;
              background:linear-gradient(160deg,#7F1D1D 0%,#B91C1C 40%,#991B1B 70%,#7F1D1D 100%);
              display:flex;align-items:center;justify-content:center;
              opacity:1;transition:none;
            }
            #splash-screen::before {
              content:'';position:absolute;inset:0;
              background-image:repeating-radial-gradient(circle at 1px 1px,rgba(255,255,255,0.07) 0px,transparent 1px);
              background-size:3px 3px;opacity:0.05;pointer-events:none;
            }
            #splash-screen .sp-line-top {
              position:absolute;top:0;left:50%;width:1px;height:80px;
              background:linear-gradient(180deg,transparent,rgba(255,255,255,0.3),transparent);
              transform:translateX(-50%) scaleY(0);transform-origin:top;
              animation:splash-line-grow 1000ms ease-out 200ms forwards;
            }
            #splash-screen .sp-line-bot {
              position:absolute;bottom:0;left:50%;width:1px;height:80px;
              background:linear-gradient(0deg,transparent,rgba(255,255,255,0.3),transparent);
              transform:translateX(-50%) scaleY(0);transform-origin:bottom;
              animation:splash-line-grow 1000ms ease-out 200ms forwards;
            }
            #splash-screen .sp-center {
              display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;
              position:relative;z-index:1;
            }
            #splash-screen .sp-brand {
              display:flex;align-items:center;justify-content:center;
              opacity:0;transform:translateY(20px);
              animation:splash-fade-in 800ms ease-out 0ms forwards;
            }
            #splash-screen .sp-brand-text {
              font-size:28px;font-weight:800;color:#fff;letter-spacing:4px;
              font-family:'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif;
            }
            #splash-screen .sp-brand-x {
              font-size:28px;font-weight:300;color:rgba(255,255,255,0.6);margin:0 12px;
            }
            #splash-screen .sp-product {
              font-size:18px;font-weight:500;color:rgba(255,255,255,0.5);letter-spacing:8px;margin-top:16px;
              font-family:'Noto Sans SC',sans-serif;
              opacity:0;transform:translateY(20px);
              animation:splash-fade-in 800ms ease-out 400ms forwards;
            }
            #splash-screen .sp-slogan {
              font-size:14px;font-weight:400;color:rgba(255,255,255,0.7);letter-spacing:3px;font-style:italic;margin-top:24px;
              font-family:'Inter',sans-serif;
              opacity:0;transform:translateY(20px);
              animation:splash-fade-in 800ms ease-out 800ms forwards;
            }
            #splash-screen .sp-dots {
              display:flex;gap:8px;justify-content:center;margin-top:40px;
              opacity:0;animation:splash-fade-in 500ms ease-out 1200ms forwards;
            }
            #splash-screen .sp-dot {
              width:6px;height:6px;border-radius:50%;background:#fff;
              animation:splash-dot-bounce 600ms ease-in-out infinite;
            }
            #splash-screen .sp-dot:nth-child(2){animation-delay:150ms;}
            #splash-screen .sp-dot:nth-child(3){animation-delay:300ms;}

            #splash-screen.sp-dots-hide .sp-dots {
              opacity:0 !important;transition:opacity 300ms ease;
            }
            #splash-screen.sp-out {
              opacity:0 !important;transition:opacity 500ms ease-in !important;
            }

            #zlc-page-wrap {opacity:0;transition:opacity 400ms ease;}
            #zlc-page-wrap.sp-visible {opacity:1;}

            @keyframes splash-fade-in {
              from {opacity:0;transform:translateY(20px);}
              to {opacity:1;transform:translateY(0);}
            }
            @keyframes splash-dot-bounce {
              0%,100% {transform:translateY(0);}
              50% {transform:translateY(-8px);}
            }
            @keyframes splash-line-grow {
              from {transform:translateX(-50%) scaleY(0);}
              to {transform:translateX(-50%) scaleY(1);}
            }
          </style>
          <div class="sp-line-top"></div>
          <div class="sp-line-bot"></div>
          <div class="sp-center">
            <div class="sp-brand">
              <span class="sp-brand-text">\u6EF4\u704C\u901A</span>
              <span class="sp-brand-x">\u00D7</span>
              <span class="sp-brand-text">\u4E00\u4EBF\u4E2D\u6D41</span>
            </div>
            <div class="sp-product">\u4E2D\u6D41\u901A</div>
            <div class="sp-slogan">Connect All Possibilities</div>
            <div class="sp-dots"><div class="sp-dot"></div><div class="sp-dot"></div><div class="sp-dot"></div></div>
          </div>
        `}} />

        {/* ══ Page Content (hidden until splash finishes) ══ */}
        <div id="zlc-page-wrap">
          {/* ══ Desktop Sidebar (hidden on mobile/tablet via CSS) ══ */}
          <aside class="desktop-sidebar" id="desktop-sidebar" style="display:none;">
            <div class="ds-brand">
              <div class="ds-brand-logo">
                <svg width="28" height="28" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="ds-gt" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#DC2626"/><stop offset="100%" stop-color="#B91C1C"/></linearGradient>
                    <linearGradient id="ds-gb" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#991B1B"/><stop offset="100%" stop-color="#DC2626"/></linearGradient>
                  </defs>
                  <circle cx="44" cy="28" r="22" fill="url(#ds-gt)"/>
                  <circle cx="36" cy="44" r="22" fill="url(#ds-gb)" opacity="0.85"/>
                </svg>
                <span class="ds-brand-name">中流通</span>
              </div>
              <div class="ds-brand-sub">滴灌通 × 一亿中流</div>
            </div>
            <nav class="ds-nav" id="ds-nav-menu">
              {/* Populated by JS based on role */}
            </nav>
            <div class="ds-stats" id="ds-stats">
              {/* Populated by JS */}
            </div>
            <div class="ds-user" id="ds-user-area">
              <div class="ds-user-avatar" id="ds-user-avatar">?</div>
              <div class="ds-user-info">
                <div class="ds-user-name" id="ds-user-name">用户</div>
                <div class="ds-user-role" id="ds-user-role">学员</div>
              </div>
              <button class="ds-user-switch" id="ds-user-switch">切换</button>
            </div>
          </aside>

          {/* ══ Desktop Top Bar (hidden on mobile/tablet via CSS) ══ */}
          <div class="desktop-topbar" id="desktop-topbar" style="display:none;">
            <div class="dt-title" id="dt-page-title">首页</div>
            <div class="dt-actions">
              <button class="dt-demo-btn" id="dt-demo-btn" style="display:none;">📖 演示</button>
              <button class="dt-bell" id="dt-bell" onclick="window.location.href='/notifications'">
                <i class="fas fa-bell" style="font-size:18px;color:#78716C;"></i>
                <span class="dt-bell-dot" id="dt-bell-dot"></span>
              </button>
              <button id="dt-user-btn" style="width:32px;height:32px;border-radius:50%;background:#B91C1C;color:white;font-size:14px;font-weight:700;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;"></button>
            </div>
          </div>

          {children}
        </div>

        {/* ══ Desktop Sidebar + TopBar init logic ══ */}
        <script dangerouslySetInnerHTML={{__html: `
(function(){
  // Only run on desktop (≥1025px)
  if(window.innerWidth < 1025) return;

  var path = window.location.pathname;

  // Mark body for login/guide pages
  if(path === '/login') { document.body.classList.add('is-login-page'); return; }
  if(path.indexOf('/guide') === 0) { document.body.classList.add('is-guide-page'); return; }

  // Show sidebar and topbar
  var sidebar = document.getElementById('desktop-sidebar');
  var topbar = document.getElementById('desktop-topbar');
  if(sidebar) sidebar.style.display = '';
  if(topbar) topbar.style.display = '';

  // ── Get user data ──
  var u = null, cu = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  try { cu = JSON.parse(localStorage.getItem('zlc_current_user')); } catch(e){}
  var role = (cu && cu.role) ? cu.role : 'member';

  // ── Build nav menu ──
  var memberTabs = [
    { icon:'🏠', label:'首页', href:'/', key:'/' },
    { icon:'🏛', label:'项目大厅', href:'/projects', key:'/projects' },
    { icon:'➕', label:'发起项目', href:'/create', key:'/create' },
    { icon:'💰', label:'回款', href:'/repayments', key:'/repayments' },
    { icon:'👤', label:'我的', href:'/profile', key:'/profile' }
  ];
  var teacherTabs = [
    { icon:'📋', label:'我的班级', href:'/teacher', key:'/teacher' },
    { icon:'🏛', label:'项目大厅', href:'/projects', key:'/projects' },
    { icon:'➕', label:'发起项目', href:'/create', key:'/create' },
    { icon:'💰', label:'回款', href:'/repayments', key:'/repayments' },
    { icon:'👤', label:'我的', href:'/profile', key:'/profile' }
  ];
  var adminTabs = [
    { icon:'📊', label:'管理工作台', href:'/admin', key:'/admin' },
    { icon:'⚙️', label:'个人设置', href:'/profile', key:'/profile' }
  ];

  var tabs = role === 'admin' ? adminTabs : (role === 'teacher' ? teacherTabs : memberTabs);
  var navEl = document.getElementById('ds-nav-menu');
  if(navEl){
    var html = '';
    tabs.forEach(function(t){
      var isActive = path === t.key || (t.key !== '/' && path.indexOf(t.key) === 0);
      // Special: for home, exact match only
      if(t.key === '/' && path !== '/') isActive = false;
      html += '<a class="ds-nav-item' + (isActive ? ' ds-active' : '') + '" href="' + t.href + '">';
      html += '<span class="ds-nav-icon">' + t.icon + '</span>';
      html += '<span>' + t.label + '</span></a>';
    });
    navEl.innerHTML = html;
  }

  // ── Stats ──
  var statsEl = document.getElementById('ds-stats');
  if(statsEl){
    // Fetch stats from API
    fetch('/api/projects').then(function(r){return r.json();}).then(function(d){
      if(!d.ok) return;
      var projects = d.projects || [];
      var active = projects.filter(function(p){return p.status==='open'||p.status==='active'||p.status==='funded';}).length;
      var totalAmt = 0;
      projects.forEach(function(p){ totalAmt += (p.targetAmount || 0); });
      fetch('/api/members').then(function(r2){return r2.json();}).then(function(d2){
        var memberCount = (d2.ok && d2.members) ? d2.members.length : 0;
        statsEl.innerHTML = '<div class="ds-stats-line">📦 ' + active + ' 个进行中项目</div>'
          + '<div class="ds-stats-line">👥 ' + memberCount + ' 位学员</div>'
          + '<div class="ds-stats-line">💰 累计融资 ¥' + Math.round(totalAmt) + '万</div>';
      });
    }).catch(function(){});
  }

  // ── User area ──
  if(u){
    var avatarEl = document.getElementById('ds-user-avatar');
    var nameEl = document.getElementById('ds-user-name');
    var roleEl = document.getElementById('ds-user-role');
    if(avatarEl) avatarEl.textContent = u.name ? u.name.charAt(0) : '?';
    if(nameEl) nameEl.textContent = u.name || '用户';
    var roleMap = {member:'学员',teacher:'老师',admin:'管理员'};
    if(roleEl) roleEl.textContent = roleMap[role] || '学员';
  }
  var switchBtn = document.getElementById('ds-user-switch');
  if(switchBtn){
    switchBtn.addEventListener('click', function(){
      localStorage.removeItem('zlc_current_user');
      localStorage.removeItem('zlc_user');
      localStorage.removeItem('zlc_token');
      window.location.href = '/login';
    });
  }

  // ── Page title ──
  var titleMap = {
    '/': '首页', '/projects': '项目大厅', '/create': '发起项目',
    '/repayments': '回款', '/profile': '我的', '/admin': '管理工作台',
    '/teacher': '我的班级', '/notifications': '通知中心',
    '/investments': '我的投资'
  };
  var titleEl = document.getElementById('dt-page-title');
  if(titleEl){
    var pageTitle = titleMap[path];
    if(!pageTitle && path.indexOf('/projects/') === 0) pageTitle = '项目详情';
    if(!pageTitle && path.indexOf('/contract') === 0) pageTitle = '合同签署';
    if(!pageTitle && path.indexOf('/revenue') === 0) pageTitle = '收入报告';
    if(!pageTitle && path.indexOf('/share') === 0) pageTitle = '分享';
    titleEl.textContent = pageTitle || '中流通';
  }

  // ── Demo button ──
  var demoBtn = document.getElementById('dt-demo-btn');
  if(demoBtn && cu){
    var guideMap = { member:'/guide/member', teacher:'/guide/teacher', admin:'/guide/admin' };
    var guideHref = guideMap[role] || '/guide/member';
    demoBtn.style.display = 'inline-block';
    demoBtn.addEventListener('click', function(){ window.location.href = guideHref; });
  }

  // ── Bell unread ──
  var bellDot = document.getElementById('dt-bell-dot');
  if(bellDot && u){
    var allNotifs = [];
    try { allNotifs = JSON.parse(localStorage.getItem('zlc_notifications') || '[]'); } catch(e){}
    var myNotifs = allNotifs.filter(function(n){
      if(n.targetRole === null && n.targetId === null) return true;
      if(n.targetId === u.id) return true;
      if(n.targetRole === u.role && n.targetId === null) return true;
      return false;
    });
    var unreadCount = myNotifs.filter(function(n){ return !n.read; }).length;
    if(unreadCount > 0){
      bellDot.style.display = 'block';
      bellDot.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
    }
  }

  // ── Desktop user btn ──
  var dtUserBtn = document.getElementById('dt-user-btn');
  if(dtUserBtn && u){
    dtUserBtn.textContent = u.name ? u.name.charAt(0) : '?';
    dtUserBtn.addEventListener('click', function(){ window.location.href = '/profile'; });
  }
})();
`}} />

        {/* ══ Splash dismiss logic ══ */}
        <script dangerouslySetInnerHTML={{__html: `
          (function(){
            var sp = document.getElementById('splash-screen');
            var pw = document.getElementById('zlc-page-wrap');
            if(!sp) { if(pw) pw.classList.add('sp-visible'); return; }
            if(sessionStorage.getItem('zlc_splash_done')){
              sp.style.display='none';
              if(pw) pw.classList.add('sp-visible');
              return;
            }
            sessionStorage.setItem('zlc_splash_done','1');
            setTimeout(function(){
              sp.classList.add('sp-dots-hide');
              setTimeout(function(){
                sp.classList.add('sp-out');
                if(pw) pw.classList.add('sp-visible');
                setTimeout(function(){ sp.style.display='none'; }, 520);
              }, 300);
            }, 3000);
          })();
        `}} />
      </body>
    </html>
  )
})
