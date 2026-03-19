import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children, title }) => {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>{title || '中流通 ZhongLiu Connect'}</title>

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
/* ---- Base ---- */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', 'Segoe UI', 'Roboto', 'Noto Sans SC', sans-serif; }

/* ---- Login Background ---- */
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

/* ---- Glass Card ---- */
.glass-card {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(32px) saturate(120%);
  -webkit-backdrop-filter: blur(32px) saturate(120%);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 24px;
}

/* ---- Login Inputs ---- */
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

/* ---- Buttons ---- */
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

/* ---- Toast ---- */
.toast {
  position: fixed; top: 32px; left: 50%; transform: translateX(-50%) translateY(-120%);
  padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 500;
  z-index: 9999;
  transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.35s;
  opacity: 0; pointer-events: none; backdrop-filter: blur(12px);
}
.toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
.toast-error { background: rgba(185,28,28,0.92); color: #FEE2E2; border: 1px solid rgba(255,255,255,0.15); }
.toast-success { background: rgba(21,128,61,0.92); color: #DCFCE7; border: 1px solid rgba(255,255,255,0.15); }

/* ---- Spinner ---- */
.spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; vertical-align: middle; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ---- Sticky Navbar ---- */
.app-navbar {
  position: sticky; top: 0; z-index: 50; height: 52px;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-bottom: 0.5px solid rgba(0,0,0,0.06);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px;
}

/* ---- Bottom Tab Bar ---- */
.tab-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
  height: 60px;
  background: #fff;
  border-top: 1px solid rgba(0,0,0,0.06);
  display: flex; align-items: center; justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom, 0);
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

/* ---- Card Shadows ---- */
.shadow-card { box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03); }
.shadow-card-hover { transition: transform 0.2s, box-shadow 0.2s; }
.shadow-card-hover:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

/* ---- Progress bar ---- */
.progress-bar {
  height: 8px; border-radius: 99px;
  background: #F5F5F4; overflow: hidden;
}
.progress-fill {
  height: 100%; border-radius: 99px;
  background: linear-gradient(90deg, #D4A853, #B8860B);
  transition: width 0.6s cubic-bezier(0.22,1,0.36,1);
}

/* ---- Profile menu rows ---- */
.menu-row {
  display: flex; align-items: center; padding: 16px 20px; gap: 14px;
  cursor: pointer; transition: background 0.15s;
}
.menu-row:hover { background: #FAFAF9; }
.menu-row:not(:last-child) { border-bottom: 1px solid #F5F5F4; }

/* ---- Body padding for tab bar ---- */
.has-tabbar { padding-bottom: 72px; }

/* ---- Quick action cards ---- */
.quick-card {
  border-radius: 16px; padding: 20px; height: 100px;
  display: flex; flex-direction: column; justify-content: space-between;
  cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none; color: #FAFAF9;
}
.quick-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.quick-card-brand { background: linear-gradient(135deg, #DC2626, #991B1B); }
.quick-card-gold { background: linear-gradient(135deg, #D4A853, #B8860B); }

/* ---- KPI Banner ---- */
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

/* ---- Filter bar ---- */
.filter-bar {
  position: sticky; top: 52px; z-index: 40;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border-bottom: 0.5px solid rgba(0,0,0,0.06);
  padding: 10px 16px;
  display: flex; gap: 8px;
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

/* ---- Status badges ---- */
.badge { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; border: 1px solid; }
.badge-open { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }
.badge-funded { background: #F0FDF4; color: #16a34a; border-color: #BBF7D0; }
.badge-active { background: #F0FDF4; color: #16a34a; border-color: #BBF7D0; }
.badge-completed { background: #F5F5F4; color: #78716C; border-color: #E7E5E4; }

/* ---- Detail page ---- */
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

.terms-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0;
}
.terms-cell {
  padding: 14px 20px;
  border-bottom: 1px solid #F5F5F4;
}
.terms-cell:nth-child(odd) { border-right: 1px solid #F5F5F4; }
.terms-label { font-size: 12px; color: #78716C; margin-bottom: 4px; }
.terms-value { font-size: 18px; font-weight: 700; color: #1C1917; }

.calc-highlight {
  background: #FEF2F2; padding: 16px 20px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}

/* ---- Progress bar large ---- */
.progress-bar-lg {
  height: 12px; border-radius: 99px;
  background: #F5F5F4; overflow: hidden;
}
.progress-bar-lg .progress-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #D4A853, #B8860B); transition: width 0.6s cubic-bezier(0.22,1,0.36,1); }

/* ---- Participate calculator ---- */
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

/* ---- Confirm modal ---- */
.modal-overlay {
  position: fixed; inset: 0; z-index: 9000;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none;
  transition: opacity 0.25s;
  padding: 20px;
}
.modal-overlay.show { opacity: 1; pointer-events: auto; }
.modal-box {
  background: #fff; border-radius: 20px; padding: 32px 28px;
  max-width: 360px; width: 100%; text-align: center;
  transform: translateY(20px) scale(0.96);
  transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
}
.modal-overlay.show .modal-box { transform: translateY(0) scale(1); }
.modal-btn-row { display: flex; gap: 12px; margin-top: 24px; }
.modal-btn {
  flex: 1; height: 44px; border-radius: 10px; font-size: 15px; font-weight: 600;
  border: none; cursor: pointer; transition: opacity 0.2s;
}
.modal-btn:hover { opacity: 0.88; }
.modal-btn-cancel { background: #F5F5F4; color: #78716C; }
.modal-btn-confirm { background: linear-gradient(135deg, #D4A853, #B8860B); color: #fff; }

/* ---- Investor avatar row ---- */
.avatar-stack { display: flex; align-items: center; }
.avatar-stack .av-circle {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600; color: #fff;
  border: 2px solid #fff;
  margin-left: -8px;
}
.avatar-stack .av-circle:first-child { margin-left: 0; }
`,
          }}
        />
      </head>
      <body class="bg-surface-page text-text-primary">{children}</body>
    </html>
  )
})
