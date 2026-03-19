// Route: /share/:code
import { Hono } from 'hono'
import {
  findProjectByShareCode,
} from '../data'
import type { Project } from '../data'
import {
  GlobalScripts, LogoSVG, Navbar,
} from '../components'

export function registerShareRoute(app: Hono) {
app.get('/share/:code', (c) => {
  const code = c.req.param('code').toUpperCase()
  const project = findProjectByShareCode(code)
  if (project) {
    return c.redirect('/projects/' + project.id + '?from=share')
  }
  // Project not found — show error page
  return c.render(
    <div class="app-container">
      <GlobalScripts />
      <Navbar />
      <main class="max-w-lg mx-auto px-4 pt-16 pb-8 text-center page-enter">
        <div class="flex justify-center mb-4">
          <LogoSVG size={48} />
        </div>
        <div class="flex items-center justify-center mb-4">
          <div class="flex items-center justify-center rounded-full" style="width:64px;height:64px;background:#FEE2E2;">
            <i class="fas fa-circle-xmark" style="font-size:28px;color:#DC2626;" />
          </div>
        </div>
        <h2 class="font-bold text-text-title mb-2" style="font-size:20px;font-family:'Noto Sans SC',sans-serif;">该项目不存在或已关闭</h2>
        <p class="text-text-secondary mb-2" style="font-size:14px;">分享码 <span style="font-weight:700;color:#B91C1C;letter-spacing:2px;font-family:Montserrat,sans-serif;">{code}</span> 未匹配到任何项目</p>
        <p class="text-text-tertiary mb-8" style="font-size:13px;">请检查分享码是否正确，或联系分享人确认</p>
        <a href="/" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white font-semibold" style="text-decoration:none;font-size:15px;">
          <i class="fas fa-home" style="font-size:13px;" /> 返回首页
        </a>
      </main>
    </div>,
    { title: '中流通 - 项目不存在' }
  )
})
}
