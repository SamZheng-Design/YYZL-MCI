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

        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Montserrat:wght@700;800;900&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* FontAwesome */}
        <link
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        {/* Tailwind CSS */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system','BlinkMacSystemFont','Inter','SF Pro Display','Segoe UI','Roboto','Noto Sans SC','sans-serif'],
        display: ['Montserrat','Inter','Futura','Helvetica Neue','sans-serif'],
      },
      colors: {
        brand: { DEFAULT:'#B91C1C', light:'#DC2626', dark:'#991B1B', darker:'#7F1D1D', soft:'#FEE2E2' },
        gold: { DEFAULT:'#D4A853', light:'#F5DEB3', dark:'#B8860B' },
        text: { primary:'#1C1917', title:'#292524', secondary:'#78716C', tertiary:'#A8A29E', onDark:'#FAFAF9' },
        surface: { page:'#FAFAF9', card:'rgba(255,255,255,0.92)', divider:'#F5F5F4' }
      },
      borderRadius: { xs:'4px', sm:'8px', md:'12px', lg:'16px', xl:'20px', '2xl':'24px' }
    }
  }
}
`,
          }}
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
  transition: opacity 0.25s;
  padding: 20px;
}
.modal-overlay.show { opacity: 1; pointer-events: auto; }
.modal-box {
  background: #fff; border-radius: 20px; padding: 28px;
  max-width: 360px; width: 100%; text-align: center;
  transform: scale(0.9); opacity: 0;
  transition: transform 0.28s cubic-bezier(0.16,1,0.3,1), opacity 0.28s;
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
  transition: opacity 0.3s;
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
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
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
.shadow-card-hover { transition: transform 0.2s, box-shadow 0.2s; }
.shadow-card-hover:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

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
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
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
.badge-completed { background: #F5F5F4; color: #78716C; border-color: #E7E5E4; }

/* ══════════════════════════════════════════════════
   Detail page
   ══════════════════════════════════════════════════ */
.back-link {
  display: inline-flex; align-items: center; gap: 6px;
  color: #78716C; font-size: 14px; text-decoration: none;
  transition: color 0.2s; padding: 4px 0;
}
.back-link:hover { color: #B91C1C; }

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
   Responsive
   ══════════════════════════════════════════════════ */
@media (max-width: 640px) {
  .glass-card { padding: 32px 24px !important; }
  .kpi-banner { flex-wrap: wrap; }
  .kpi-item { min-width: 50%; padding: 8px; }
  .kpi-item:not(:last-child)::after { display: none; }
}
`,
          }}
        />
      </head>
      <body class="bg-surface-page text-text-primary">{children}</body>
    </html>
  )
})
