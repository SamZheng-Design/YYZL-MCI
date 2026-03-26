#!/usr/bin/env python3
"""
从 Bible V2.1 生成 V2.2：新增「从 Demo 到生产」的完整方法论章节
基于中流通 zhongliutong.net 实战经验
"""
from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import copy

# ── 读取原始文档 ──
src = Document('/home/user/uploaded_files/bible_v2.1.docx')

# ── 创建新文档（基于原文档样式） ──
doc = Document('/home/user/uploaded_files/bible_v2.1.docx')

# ── 找到文档末尾（END OF BIBLE V2.1 之前）──
# 先更新标题和版本信息
for para in doc.paragraphs:
    if 'Bible V2.1' in para.text:
        for run in para.runs:
            if 'V2.1' in run.text:
                run.text = run.text.replace('V2.1', 'V2.2')
    if 'V2.1 (深度升级版)' in para.text:
        for run in para.runs:
            if 'V2.1' in run.text:
                run.text = run.text.replace('V2.1 (深度升级版)', 'V2.2 (生产就绪版)')
    if '中流通 V27 (22,000+ 行生产级代码)' in para.text:
        for run in para.runs:
            if '中流通 V27' in run.text:
                run.text = run.text.replace('中流通 V27 (22,000+ 行生产级代码)', '中流通 V28 (22,000+ 行生产级代码 + 生产级性能优化)')
    if 'END OF BIBLE V2.1' in para.text:
        for run in para.runs:
            if 'V2.1' in run.text:
                run.text = run.text.replace('V2.1', 'V2.2')
    if '本文档共计约 35,000 字' in para.text:
        for run in para.runs:
            run.text = run.text.replace('35,000', '50,000')

# ── 找到插入位置（附录 A 之前） ──
insert_before_idx = None
for i, para in enumerate(doc.paragraphs):
    if '附录 A' in para.text and para.style.name.startswith('Heading'):
        insert_before_idx = i
        break

if insert_before_idx is None:
    # Fallback: 在 END OF BIBLE 之前
    for i, para in enumerate(doc.paragraphs):
        if 'END OF BIBLE' in para.text:
            insert_before_idx = i
            break

print(f"Insert position: paragraph index {insert_before_idx}")

# ── 准备新增内容 ──
# 我们需要在 insert_before_idx 处的 XML element 之前插入新段落
# 获取目标段落的 XML element
target_element = doc.paragraphs[insert_before_idx]._element

def add_paragraph_before(text, style='Normal', bold=False, color=None, font_size=None):
    """在 target_element 之前插入一个段落"""
    new_para = OxmlElement('w:p')
    target_element.addprevious(new_para)
    # 获取 docx paragraph 对象
    from docx.text.paragraph import Paragraph
    p = Paragraph(new_para, doc.paragraphs[0]._element.getparent())
    
    # 设置样式
    if style in doc.styles:
        p.style = doc.styles[style]
    
    run = p.add_run(text)
    if bold:
        run.bold = True
    if color:
        run.font.color.rgb = color
    if font_size:
        run.font.size = font_size
    
    return p

def add_heading_before(text, level=1):
    """在 target_element 之前插入一个标题"""
    return add_paragraph_before(text, style=f'Heading {level}')

def add_list_item(text, style='List Bullet'):
    """在 target_element 之前插入一个列表项"""
    return add_paragraph_before(text, style=style)

def add_divider():
    """插入分隔线"""
    add_paragraph_before('────────────────────────────────────────────────────────────')

# ══════════════════════════════════════════════════════════════
# 新增章节：第十八章 到 第二十一章
# ══════════════════════════════════════════════════════════════

# ── 分隔线 ──
add_divider()

# ══════════════════════════════════════════════════════════════
# 第十八章：从 Demo 到生产 — 性能优化方法论
# ══════════════════════════════════════════════════════════════
add_heading_before('第十八章：从 Demo 到生产 — 性能优化方法论（V2.2 新增）', level=1)

add_heading_before('18.1 为什么 Demo 不等于 Production', level=2)
add_paragraph_before('中流通从 Demo 到 zhongliutong.net 上线的实战中，暴露了一个核心真相：Demo 阶段的全量 SSR 架构在真实用户规模下会产生严重性能瓶颈。本章将这次实战中提炼的方法论系统化，使其可直接复用于任何基于本 Bible 构建的产品。')

add_paragraph_before('Demo 架构的性能特征（中流通实测数据）：', bold=True)
add_list_item('无 DB 查询的页面（/login, /create）: TTFB 130ms — 可接受')
add_list_item('4-6 次 DB 查询的页面（/home, /projects）: TTFB 600-880ms — 不可接受')
add_list_item('全量数据序列化的页面（/repayments）: HTML 812KB — 严重不可接受')
add_list_item('Worker 冷启动: 918KB bundle + 6次 D1 查询 = 首次访问 > 1秒')

add_heading_before('18.2 性能瓶颈诊断方法（四步法）', level=2)

add_paragraph_before('Step 1: TTFB 全站扫描', bold=True)
add_paragraph_before('对所有路由执行 curl 测量 TTFB，建立基线数据。关键命令：')
add_paragraph_before('for path in /login / /projects /repayments /admin; do curl -s -o /dev/null -w "TTFB: %{time_starttransfer}s | Size: %{size_download}" https://your-domain$path; done')

add_paragraph_before('Step 2: 查询分析', bold=True)
add_paragraph_before('对每个路由文件，统计 D1 查询次数和 JSON.stringify 嵌入次数。TTFB 与查询次数呈线性关系：每次 D1 查询约增加 50-100ms。')

add_paragraph_before('Step 3: HTML 体积分析', bold=True)
add_paragraph_before('检查每个页面的 HTML 大小。超过 200KB 的页面必须优化。812KB 的 repayments 页面意味着所有还款记录被内联到 HTML 中。')

add_paragraph_before('Step 4: Bundle 分析', bold=True)
add_paragraph_before('分析 _worker.js 的组成。中流通原始 918KB 中 63%（541KB）是 dangerouslySetInnerHTML 内联的 HTML/CSS/JS。提取内联 CSS 到外部文件后降至 743KB（-19%）。')

add_heading_before('18.3 三阶段优化框架', level=2)

add_paragraph_before('Phase 1: 立竿见影（TTFB 降 80%）', bold=True, color=RGBColor(0xB9, 0x1C, 0x1C))

add_paragraph_before('1A. 内联资源外置化', bold=True)
add_list_item('将 renderer.tsx 中的大块内联 CSS（125KB+）提取到 /static/app.css')
add_list_item('Cloudflare CDN 自动缓存静态文件（max-age=14400），repeat visit 零传输')
add_list_item('Brotli 压缩：154KB CSS → 25KB 传输')
add_list_item('效果：Worker bundle -19%，HTML -54%，传输 -42%')

add_paragraph_before('1B. N+1 查询修复', bold=True)
add_list_item('典型症状：loadProjects 先查 projects 表，再逐个查 project_investors')
add_list_item('修复方案：改为两次查询（SELECT * FROM projects + SELECT * FROM project_investors），在 JS 端 merge')
add_list_item('或使用 JOIN + GROUP_CONCAT：SELECT p.*, GROUP_CONCAT(pi.investor_id) FROM projects p LEFT JOIN project_investors pi ON p.id = pi.project_id GROUP BY p.id')
add_list_item('效果：N+1 次查询 → 1-2 次查询')

add_paragraph_before('1C. API 化改造 + 骨架屏', bold=True)
add_list_item('核心思路：路由不做 DB 查询，只返回 HTML 骨架 + 骨架屏（loading 状态）')
add_list_item('数据通过 /api/data/* 端点异步加载，前端 JS 渲染替换骨架屏')
add_list_item('所有页面 TTFB 统一降至 ~130ms（等同于无 DB 查询的页面）')
add_list_item('骨架屏使用 Tailwind animate-pulse，形状和布局与实际内容一致')
add_list_item('关键：已有的 /api/data/* 端点可直接复用，不需要重新开发')

add_paragraph_before('Phase 2: 用户体验质变', bold=True, color=RGBColor(0xB9, 0x1C, 0x1C))

add_paragraph_before('2A. 客户端路由（SPA 化）', bold=True)
add_list_item('当前问题：每次点击导航 = 完整页面重载（白屏 → 等待 → 渲染）')
add_list_item('方案：拦截 <a> 标签 click → fetch 目标页面 HTML → 提取内容区域 → 替换 DOM')
add_list_item('保留侧边栏/顶栏不变，只替换 #zlc-page-wrap 内的内容')
add_list_item('更新 history.pushState + document.title')
add_list_item('处理 popstate（浏览器前进/后退）')
add_list_item('排除项：外部链接、/api/* 路径、/login 页面')
add_list_item('效果：页面切换从 "白屏 1-2 秒" 变为 "即时过渡 + 数据 200ms 加载"')

add_paragraph_before('2B. 分页 + 按需加载', bold=True)
add_list_item('后端：所有列表 API 添加 ?page=1&limit=20 参数，使用 LIMIT/OFFSET + COUNT(*)')
add_list_item('响应格式：{ ok, data[], total, page, limit, total_pages }（types.ts 已定义 PaginatedResponse）')
add_list_item('前端：底部分页控件或无限滚动')
add_list_item('重点页面 /repayments：按月份 + 项目筛选，每页 API 响应 < 10KB（原 812KB）')

add_paragraph_before('Phase 3: 规模化保障', bold=True, color=RGBColor(0xB9, 0x1C, 0x1C))

add_paragraph_before('3A. 缓存策略', bold=True)
add_list_item('静态资源：Cloudflare CDN 自动缓存（app.css, tailwind.css, router.js）')
add_list_item('API 数据：Cache-Control 头 + stale-while-revalidate 模式')
add_list_item('高频数据（教师列表、项目列表）：考虑 Cloudflare KV 缓存，TTL 60 秒')
add_list_item('前端 localStorage 缓存不常变数据')

add_paragraph_before('3B. 前端性能监控', bold=True)
add_list_item('采集 Web Vitals：LCP, FCP, CLS, TTFB')
add_list_item('通过 /api/metrics POST 上报到 Worker，存入 D1 或 KV')
add_list_item('建立性能基线，设置告警阈值')

add_heading_before('18.4 优化效果对照表（中流通实测）', level=2)
add_paragraph_before('以下为中流通 zhongliutong.net 实际优化数据：')
add_list_item('Login TTFB: 225ms → 200ms (-11%)')
add_list_item('Login HTML: 291KB → 134KB (-54%)')
add_list_item('Login 传输: 60KB → 35KB (-42%)')
add_list_item('Home TTFB: 787ms → 510ms (-35%)，API化后目标 130ms (-83%)')
add_list_item('Worker bundle: 918KB → 743KB (-19%)')
add_list_item('app.css CDN 缓存: max-age=14400, Brotli 25KB')
add_list_item('API 化后所有页面 TTFB 目标: < 200ms')

add_heading_before('18.5 通用优化检查清单', level=2)
add_list_item('[ ] 所有 > 200ms TTFB 的页面已改为 API 化 + 骨架屏')
add_list_item('[ ] 所有 > 200KB HTML 的页面已做数据分页')
add_list_item('[ ] 内联 CSS 已提取到外部文件并通过 CDN 缓存')
add_list_item('[ ] N+1 查询已全部修复')
add_list_item('[ ] Worker bundle < 800KB（gzip < 200KB）')
add_list_item('[ ] 静态资源有 Cache-Control 头')
add_list_item('[ ] 列表页支持分页（默认 20 条）')
add_list_item('[ ] 客户端路由已实现（可选但强烈推荐）')

add_divider()

# ══════════════════════════════════════════════════════════════
# 第十九章：生产环境安全加固
# ══════════════════════════════════════════════════════════════
add_heading_before('第十九章：生产环境安全加固（V2.2 新增）', level=1)

add_heading_before('19.1 从 Demo 安全到生产安全的差距', level=2)
add_paragraph_before('Bible V2.1 的第四章已覆盖了安全体系基础（Session/Cookie/限流/审计），但在 1000+ 用户的生产环境中，还需要额外的安全加固措施。')

add_heading_before('19.2 API 端点权限矩阵', level=2)
add_paragraph_before('生产环境必须对每个 API 端点做严格的权限控制：')
add_list_item('公开端点（无需登录）: POST /api/login, POST /api/self-register')
add_list_item('登录端点（需要 Session）: GET /api/auth/me, POST /api/logout, POST /api/change-password')
add_list_item('数据端点（需要 Session + 数据过滤）: GET /api/data/* — 必须根据用户角色过滤数据')
add_list_item('管理端点（需要 Admin 角色）: POST /api/admin/* — 二次校验 role === "admin"')
add_list_item('教师端点（需要 Teacher 角色）: 引荐处理、项目推荐')
add_list_item('当事人端点（需要身份验证）: 合同签署、条款确认 — 验证当前用户是合同当事人')

add_heading_before('19.3 生产安全加固清单', level=2)
add_list_item('[ ] API 数据过滤：/api/data/contracts 只返回与当前用户相关的合同，不返回全量')
add_list_item('[ ] 密码哈希：确认 SHA-256 + salt（如需更强，升级到 bcrypt via WebCrypto）')
add_list_item('[ ] Session 有效期：生产环境缩短到 24 小时（Demo 可以 7 天）')
add_list_item('[ ] 登录限流：生产环境收紧到 3 次/分钟（Demo 5 次/分钟）')
add_list_item('[ ] CORS 配置：只允许 zhongliutong.net 域名，禁止通配符 *')
add_list_item('[ ] 敏感字段脱敏：API 返回中不包含 password_hash')
add_list_item('[ ] 并发防护：投资操作的乐观锁 + 合同签署的幂等性检查')
add_list_item('[ ] 审计日志：所有写操作记录 IP + 详情 + 时间戳')
add_list_item('[ ] 定期清理：过期 Session、过期邀请码、过期限流记录')

add_heading_before('19.4 错误处理标准', level=2)
add_paragraph_before('生产环境所有 API 端点必须：')
add_list_item('用 try-catch 包裹所有数据库操作')
add_list_item('返回统一错误格式：{ ok: false, error: "描述", code: "ERROR_CODE" }')
add_list_item('前端 API 调用添加 5 秒超时 + 1 次重试')
add_list_item('网络错误时显示友好提示（"网络连接异常，请重试"），不暴露技术细节')
add_list_item('D1 数据库错误记录到审计日志，但不向前端暴露 SQL 信息')

add_divider()

# ══════════════════════════════════════════════════════════════
# 第二十章：上线部署方法论
# ══════════════════════════════════════════════════════════════
add_heading_before('第二十章：上线部署方法论（V2.2 新增）', level=1)

add_heading_before('20.1 Cloudflare Pages 生产部署完整流程', level=2)
add_paragraph_before('中流通的部署流程（已验证可复用）：')

add_list_item('1. 配置 Cloudflare API Token → 环境变量 CLOUDFLARE_API_TOKEN', style='List Number')
add_list_item('2. 创建 Pages 项目: npx wrangler pages project create <project-name> --production-branch main', style='List Number')
add_list_item('3. 构建: npm run build（Vite + TailwindCSS → dist/）', style='List Number')
add_list_item('4. 部署到生产: npx wrangler pages deploy dist --project-name <name> --branch main', style='List Number')
add_list_item('5. 绑定自定义域名: npx wrangler pages domain add example.com --project-name <name>', style='List Number')
add_list_item('6. 设置 Secrets: npx wrangler pages secret put API_KEY --project-name <name>', style='List Number')

add_heading_before('20.2 分支部署策略', level=2)
add_paragraph_before('Cloudflare Pages 的分支部署机制（中流通踩坑经验）：')
add_list_item('main 分支 → 生产环境（绑定自定义域名）')
add_list_item('其他分支（如 V22）→ Preview 环境（不更新生产）')
add_list_item('踩坑：不指定 --branch main 会部署到当前 git 分支的 Preview 环境')
add_list_item('关键命令：npx wrangler pages deploy dist --project-name <name> --branch main')

add_heading_before('20.3 D1 数据库迁移策略', level=2)
add_list_item('本地开发：npx wrangler d1 migrations apply <db-name> --local（自动使用本地 SQLite）')
add_list_item('生产部署前：npx wrangler d1 migrations apply <db-name>（执行到生产 D1）')
add_list_item('迁移文件命名：0001_initial_schema.sql, 0002_xxx.sql（顺序递增）')
add_list_item('只做增量迁移，不修改已执行的迁移文件')
add_list_item('每次迁移先在本地测试，再推到生产')

add_heading_before('20.4 上线前检查清单', level=2)
add_paragraph_before('功能检查：', bold=True)
add_list_item('[ ] 所有页面可正常加载（HTTP 200）')
add_list_item('[ ] 登录/注册/改密流程正常')
add_list_item('[ ] 三种角色的页面访问权限正确')
add_list_item('[ ] 核心业务流程可走通（发起→认购→条款→签署→回款）')
add_list_item('[ ] 移动端 + 桌面端布局正确')

add_paragraph_before('性能检查：', bold=True)
add_list_item('[ ] 所有页面 TTFB < 200ms')
add_list_item('[ ] 首屏可交互 (TTI) < 1.5s')
add_list_item('[ ] 静态资源 CDN 缓存已验证（cf-cache-status: HIT/REVALIDATED）')

add_paragraph_before('安全检查：', bold=True)
add_list_item('[ ] Demo 账号已移除或禁用（如保留 Demo 模式，需明确标注）')
add_list_item('[ ] 所有 API 有权限校验')
add_list_item('[ ] 密码哈希存储（无明文密码）')
add_list_item('[ ] Session Cookie 配置 HttpOnly + SameSite')

add_paragraph_before('运维准备：', bold=True)
add_list_item('[ ] D1 自动备份已确认（Cloudflare 默认 30 天）')
add_list_item('[ ] 回滚方案：保留上一次成功部署的 dist/，可随时重新部署')
add_list_item('[ ] 错误监控：前端 try-catch + 后端 audit_logs')
add_list_item('[ ] 容量评估：D1 免费版 5GB 存储 + 5M 行读/天，评估是否足够')

add_heading_before('20.5 容量规划参考', level=2)
add_paragraph_before('以中流通为例（1000 学员 + 30 老师 + 1 管理员）：')
add_list_item('D1 读取量：假设每人每天访问 5 个页面 × 3 次 API 调用 = 1030 × 5 × 3 = 15,450 次/天（免费版 5M 次/天，绰绰有余）')
add_list_item('D1 写入量：假设每天 100 次写入操作（登录/投资/签署等） = 远低于免费限额')
add_list_item('D1 存储：1000 用户 + 500 项目 + 2000 合同 + 10000 回款记录 ≈ < 50MB（免费版 5GB）')
add_list_item('Worker 执行：免费版 10 万次/天请求，付费版不限。1000 用户日活估算 5 万次请求/天。')
add_list_item('结论：1000 用户规模在 Cloudflare 免费版即可支撑，但建议上付费版（$5/月）以获得更好的 CPU 时间和请求上限')

add_divider()

# ══════════════════════════════════════════════════════════════
# 第二十一章：Prompt 工程升级 — 性能优化 Prompt 模板
# ══════════════════════════════════════════════════════════════
add_heading_before('第二十一章：Prompt 工程升级 — 生产就绪 Prompt 模板（V2.2 新增）', level=1)

add_heading_before('21.1 新增 Prompt 分类', level=2)
add_paragraph_before('在 V2.1 的 8 类 Prompt 基础上，V2.2 新增 2 类：')
add_list_item('**Performance (Perf)**: 性能优化类 — CSS 外置、API 化改造、N+1 修复、分页、SPA 路由')
add_list_item('**Production (Prod)**: 生产就绪类 — 安全加固、错误处理、监控、部署验证')

add_heading_before('21.2 标准 Prompt 执行序列（V2.2 更新为 16 步）', level=2)
add_paragraph_before('Phase 1: 基础搭建 (F1-F2) — 不变')
add_paragraph_before('Phase 2: 数据层 (D1-D3) — 不变')
add_paragraph_before('Phase 3: 安全层 (S1-S2) — 不变')
add_paragraph_before('Phase 4: 核心页面 (P1-P8) — 不变')
add_paragraph_before('Phase 5: 管理与角色 (P9-P12) — 不变')
add_paragraph_before('Phase 6: 增强与打磨 (E1-E5) — 不变')
add_paragraph_before('Phase 7: 性能优化 (Perf1-Perf3) — V2.2 新增', bold=True, color=RGBColor(0xB9, 0x1C, 0x1C))
add_paragraph_before('Phase 8: 生产就绪 (Prod1-Prod2) — V2.2 新增', bold=True, color=RGBColor(0xB9, 0x1C, 0x1C))

add_heading_before('21.3 模板 Perf1: 内联资源外置 + N+1 修复', level=2)
add_paragraph_before('触发条件：Demo 阶段完成，准备上线前')
add_paragraph_before('Prompt 结构：')
add_list_item('1. 分析 renderer.tsx 中的内联 CSS 大小，如 > 50KB 则提取到 /static/app.css')
add_list_item('2. 扫描所有 load* 函数，识别 N+1 查询模式')
add_list_item('3. 修复为 JOIN 或批量查询')
add_list_item('4. 构建 + 测试 + 对比 bundle 大小和 TTFB')

add_heading_before('21.4 模板 Perf2: API 化改造', level=2)
add_paragraph_before('触发条件：有页面 TTFB > 300ms')
add_paragraph_before('Prompt 结构：')
add_list_item('1. 列出所有 TTFB > 300ms 的页面及其 DB 查询数')
add_list_item('2. 将路由改为只返回 HTML 骨架 + 骨架屏')
add_list_item('3. 利用已有 /api/data/* 端点，前端 JS 异步加载数据')
add_list_item('4. 骨架屏设计：animate-pulse + 和实际布局一致的形状')
add_list_item('5. 测试所有页面 TTFB < 200ms')

add_heading_before('21.5 模板 Perf3: SPA 路由 + 分页', level=2)
add_paragraph_before('触发条件：用户体验要求更高（页面切换不能有白屏）')
add_paragraph_before('Prompt 结构：')
add_list_item('1. 创建全局路由拦截器（拦截 <a> click → fetch → DOM 替换）')
add_list_item('2. 保持侧边栏/顶栏不变，只替换内容区')
add_list_item('3. 添加顶部进度条过渡动画')
add_list_item('4. 所有列表 API 添加分页参数 (?page=1&limit=20)')
add_list_item('5. 前端分页 UI（无限滚动或翻页器）')

add_heading_before('21.6 模板 Prod1: 安全加固', level=2)
add_paragraph_before('触发条件：准备对外开放注册前')
add_paragraph_before('Prompt 结构：')
add_list_item('1. 扫描所有 API 端点，确认权限校验完备')
add_list_item('2. 数据过滤：API 只返回当前用户有权查看的数据')
add_list_item('3. 统一错误处理：try-catch + 标准错误格式')
add_list_item('4. 前端超时 + 重试 + 友好提示')
add_list_item('5. 输出安全检查清单')

add_heading_before('21.7 模板 Prod2: 部署验证', level=2)
add_paragraph_before('触发条件：代码完成，准备推到生产')
add_paragraph_before('Prompt 结构：')
add_list_item('1. npm run build + 确认 dist/ 内容正确')
add_list_item('2. 部署: npx wrangler pages deploy dist --project-name <name> --branch main')
add_list_item('3. 全站 TTFB 测试 + 功能验证')
add_list_item('4. CDN 缓存检查（cf-cache-status）')
add_list_item('5. 浏览器端验证（Playwright 截图）')
add_list_item('6. 输出完整的上线报告')

add_divider()

# ══════════════════════════════════════════════════════════════
# 第二十二章：已知陷阱与解决方案
# ══════════════════════════════════════════════════════════════
add_heading_before('第二十二章：已知陷阱与解决方案（V2.2 新增）', level=1)

add_heading_before('22.1 Cloudflare Workers 运行时限制', level=2)
add_list_item('陷阱: 不能使用 Node.js API（fs, path, crypto 的 Node 版本）')
add_list_item('解决: 使用 Web Crypto API 替代 crypto，使用 Hono 内置工具替代 fs/path')
add_list_item('陷阱: serveStatic 必须从 hono/cloudflare-workers 导入，不能从 @hono/node-server')
add_list_item('解决: import { serveStatic } from "hono/cloudflare-workers"')

add_heading_before('22.2 CSS 与样式陷阱', level=2)
add_list_item('陷阱: html { overflow: hidden } 在全局 CSS 中会阻止所有页面滚动')
add_list_item('解决: 用 JS 在特定页面（如登录页）强制覆盖 document.documentElement.style.overflow = "auto"')
add_list_item('陷阱: CSS :has() 选择器在部分浏览器不支持')
add_list_item('解决: 使用 JS 添加 body class 作为 fallback')
add_list_item('陷阱: 深色主题弹窗内的输入框文字不可见')
add_list_item('解决: 显式设置输入框 color: white, placeholder color: rgba(255,255,255,0.35)')

add_heading_before('22.3 部署陷阱', level=2)
add_list_item('陷阱: wrangler pages deploy 默认使用当前 git 分支，不一定是 main')
add_list_item('解决: 始终显式指定 --branch main 确保部署到生产')
add_list_item('陷阱: 自定义域名（如 zhongliutong.net）绑定到 Production 分支，Preview 部署不会更新')
add_list_item('解决: 确认 production-branch 设置为 main，部署时使用 --branch main')
add_list_item('陷阱: D1 迁移只在第一次 deploy 时自动执行（如果配置了），后续新迁移需手动执行')
add_list_item('解决: 每次新增迁移后，先执行 wrangler d1 migrations apply <db-name>')

add_heading_before('22.4 性能陷阱', level=2)
add_list_item('陷阱: Worker 冷启动不可避免（bundle 越大越慢）')
add_list_item('解决: 减小 bundle 体积 + 使用 Cloudflare 付费版的 0ms 冷启动')
add_list_item('陷阱: D1 查询延迟在边缘节点比 dashboard 控制台高')
add_list_item('解决: 减少查询次数 > 减少数据量 > 添加索引（优先级顺序）')
add_list_item('陷阱: 全量 SELECT * 在数据量增长后会越来越慢')
add_list_item('解决: 只 SELECT 需要的字段 + 分页 + WHERE 过滤')

add_heading_before('22.5 前端陷阱', level=2)
add_list_item('陷阱: Google Fonts 加载慢（中国用户可能无法访问）')
add_list_item('解决: 使用系统字体栈，或通过本地 Tailwind 内联字体')
add_list_item('陷阱: SPA 路由切换后，页面内的 <script> 不会自动执行')
add_list_item('解决: DOM 替换后手动 eval 新页面中的 <script> 标签内容')
add_list_item('陷阱: localStorage 数据在不同域名间不共享')
add_list_item('解决: Demo 环境和生产环境使用相同的 localStorage key 前缀（如 zlc_）')

add_divider()

# ── 更新核心原则：从 7 条更新为 9 条 ──
# 找到 1.3 核心原则部分，在最后一条后添加新原则
found_demo_prod = False
for i, para in enumerate(doc.paragraphs):
    if 'Demo → Production' in para.text and '所有功能先 Demo 可用' in para.text:
        found_demo_prod = True
        # 在这个段落后面添加两条新原则
        target_for_principles = doc.paragraphs[i+1]._element if i+1 < len(doc.paragraphs) else None
        break

# 更新 1.3 标题
for para in doc.paragraphs:
    if '核心原则（7 条）' in para.text:
        for run in para.runs:
            if '7 条' in run.text:
                run.text = run.text.replace('7 条', '9 条')

# 在分隔线之前插入两条新原则
if found_demo_prod and target_for_principles:
    new_p1 = OxmlElement('w:p')
    target_for_principles.addprevious(new_p1)
    from docx.text.paragraph import Paragraph
    p1 = Paragraph(new_p1, doc.paragraphs[0]._element.getparent())
    p1.style = doc.styles['List Number']
    run1 = p1.add_run('**性能即功能**: TTFB < 200ms + API 化 + 骨架屏 = 用户可感知的流畅体验')
    
    new_p2 = OxmlElement('w:p')
    target_for_principles.addprevious(new_p2)
    p2 = Paragraph(new_p2, doc.paragraphs[0]._element.getparent())
    p2.style = doc.styles['List Number']
    run2 = p2.add_run('**渐进上线**: 先 Demo 验证 → CSS 外置 → API 化 → SPA 化 → 分页 → 监控 → 全量开放')

# ── 保存 ──
output_path = '/home/user/webapp/bible_v2.2.docx'
doc.save(output_path)
print(f'Bible V2.2 已生成: {output_path}')

# 统计新增内容
import os
v21_size = os.path.getsize('/home/user/uploaded_files/bible_v2.1.docx')
v22_size = os.path.getsize(output_path)
print(f'V2.1 大小: {v21_size:,} bytes')
print(f'V2.2 大小: {v22_size:,} bytes')
print(f'新增: {v22_size - v21_size:,} bytes (+{(v22_size/v21_size - 1)*100:.1f}%)')
