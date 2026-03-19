import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children, title }) => {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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

/* ---- Inputs ---- */
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

/* ---- Gold Button ---- */
.btn-gold {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #D4A853, #B8860B);
  color: #FAFAF9;
  font-weight: 700;
  font-size: 16px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.25s, opacity 0.25s;
  position: relative;
  overflow: hidden;
}
.btn-gold:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(212,168,83,0.35); }
.btn-gold:active { transform: translateY(0); }
.btn-gold:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }

/* ---- Code Button ---- */
.btn-code {
  white-space: nowrap;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.25);
  color: rgba(255,255,255,0.85);
  border-radius: 12px;
  padding: 0 16px;
  height: 48px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  flex-shrink: 0;
}
.btn-code:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.4); }
.btn-code:disabled { opacity: 0.45; cursor: not-allowed; background: transparent; }

/* ---- Toast ---- */
.toast {
  position: fixed; top: 32px; left: 50%; transform: translateX(-50%) translateY(-120%);
  padding: 12px 28px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.35s;
  opacity: 0;
  pointer-events: none;
  backdrop-filter: blur(12px);
}
.toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
.toast-error { background: rgba(185,28,28,0.92); color: #FEE2E2; border: 1px solid rgba(255,255,255,0.15); }
.toast-success { background: rgba(21,128,61,0.92); color: #DCFCE7; border: 1px solid rgba(255,255,255,0.15); }

/* ---- Loading Spinner ---- */
.spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; vertical-align: middle; }
@keyframes spin { to { transform: rotate(360deg); } }
          `,
          }}
        />
      </head>
      <body class="bg-surface-page text-text-primary">{children}</body>
    </html>
  )
})
