#!/usr/bin/env python3
"""
滴灌通产品定制化 Bible V2.0 — Word 文档生成器
基于一亿中流私董会"中流通"全量生产版本（V27）的完整实践
"""
from docx import Document
from docx.shared import Pt, Inches, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
import datetime

doc = Document()

# ============================================================
# Style setup
# ============================================================
style = doc.styles['Normal']
style.font.name = 'Microsoft YaHei'
style.font.size = Pt(10.5)
style.paragraph_format.line_spacing = 1.5
style.paragraph_format.space_after = Pt(4)
style.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')

for level in range(1, 5):
    hs = doc.styles[f'Heading {level}']
    hs.font.name = 'Microsoft YaHei'
    hs.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
    hs.font.bold = True
    if level == 1:
        hs.font.size = Pt(18)
        hs.font.color.rgb = RGBColor(0xB9, 0x1C, 0x1C)
    elif level == 2:
        hs.font.size = Pt(14)
        hs.font.color.rgb = RGBColor(0x1C, 0x19, 0x17)
    elif level == 3:
        hs.font.size = Pt(12)
        hs.font.color.rgb = RGBColor(0x44, 0x40, 0x3C)

def add_para(text, bold=False, italic=False, size=None, color=None, align=None, space_after=None):
    p = doc.add_paragraph()
    if align:
        p.alignment = align
    if space_after is not None:
        p.paragraph_format.space_after = Pt(space_after)
    run = p.add_run(text)
    if bold:
        run.bold = True
    if italic:
        run.italic = True
    if size:
        run.font.size = Pt(size)
    if color:
        run.font.color.rgb = RGBColor(*color)
    return p

def add_bullet(text, level=0):
    p = doc.add_paragraph(text, style='List Bullet')
    return p

def add_table_simple(headers, rows):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = h
        for para in cell.paragraphs:
            for run in para.runs:
                run.bold = True
                run.font.size = Pt(9)
    for ri, row in enumerate(rows):
        for ci, val in enumerate(row):
            cell = table.rows[ri + 1].cells[ci]
            cell.text = str(val)
            for para in cell.paragraphs:
                for run in para.runs:
                    run.font.size = Pt(9)
    return table

# ============================================================
# COVER PAGE
# ============================================================
add_para('', space_after=80)
add_para('滴灌通产品定制化 Bible', bold=True, size=28, color=(0xB9, 0x1C, 0x1C), align=WD_ALIGN_PARAGRAPH.CENTER, space_after=8)
add_para('V2.0', bold=True, size=22, color=(0xD4, 0xA8, 0x53), align=WD_ALIGN_PARAGRAPH.CENTER, space_after=16)
add_para('基于收入分成模式的细分场景产品定制化方法论白皮书', size=12, color=(0x78, 0x71, 0x6C), align=WD_ALIGN_PARAGRAPH.CENTER, space_after=40)
add_para('——基于"一亿中流私董会"场景从 Demo 到全量生产的完整实践提炼', size=11, italic=True, color=(0xA8, 0xA2, 0x9E), align=WD_ALIGN_PARAGRAPH.CENTER, space_after=60)

cover_info = [
    ('版本', 'V2.0（对齐中流通生产版 V27）'),
    ('日期', '2026-03-26'),
    ('编制', '基于"一亿中流私董会"场景 Demo→GenSpark→Cloudflare D1 全量生产的完整实践'),
    ('配套文档', 'MicroConnect_Product_Bible_V3.0.docx（以下简称"产品 Bible"）'),
    ('线上地址', 'https://zhongliutong.net'),
    ('技术栈', 'Hono + TypeScript + Cloudflare D1 (SQLite) + Cloudflare Pages'),
]
for label, val in cover_info:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r1 = p.add_run(f'{label}：')
    r1.bold = True
    r1.font.size = Pt(10)
    r2 = p.add_run(val)
    r2.font.size = Pt(10)
    r2.font.color.rgb = RGBColor(0x57, 0x53, 0x4E)

doc.add_page_break()

# ============================================================
# TABLE OF CONTENTS
# ============================================================
doc.add_heading('目录', level=1)
toc_items = [
    '第一章 · 本白皮书的定位与使用方法',
    '第二章 · 定制化核心理论：从"九通"到"场景通"',
    '第三章 · 场景分析框架（SURM 四步法）',
    '第四章 · 角色体系定制化方法论',
    '第五章 · 数据架构定制化方法论 ★升级：D1云数据库',
    '第六章 · 功能映射矩阵：九通能力 → 场景功能',
    '第七章 · 用户界面定制化规范',
    '第八章 · 交互仪式感设计体系',
    '第九章 · 社交裂变与分享传播设计',
    '第十章 · 响应式与多端适配方法论',
    '第十一章 · 数据丰富度与真实感工程 ★升级：生产数据',
    '第十二章 · 演示引导与用户教育体系',
    '第十三章 · 从 Demo 到生产的技术演进路径 ★核心升级',
    '第十四章 · Prompt 工程方法论（核心章节）★升级：Phase 6',
    '第十五章 · 完整案例实录：一亿中流私董会场景 ★全量升级',
    '第十六章 · 安全体系与生产运维 ★V2.0新增章节',
    '第十七章 · 快速启动清单 ★升级版',
    '附录 A · Prompt 分类模板库（升级版）',
    '附录 B · 场景分析问卷模板',
    '附录 C · 数据模型标准字段对照表 ★升级：D1 Schema',
    '附录 D · API 接口完整清单 ★V2.0新增',
    '附录 E · 安全配置与审计清单 ★V2.0新增',
]
for item in toc_items:
    add_para(item, size=11)

doc.add_page_break()

# ============================================================
# CHAPTER 1
# ============================================================
doc.add_heading('第一章 · 本白皮书的定位与使用方法', level=1)

doc.add_heading('1.1 V2.0 升级说明：从 Demo 到生产', level=2)
add_para('V1.0 基于 GenSpark 全栈 Demo（localStorage + Mock 数据）的完整实践编写。V2.0 基于中流通生产版 V27 全面升级——系统已完成从 Demo 到 Cloudflare Workers + D1 云数据库的完整迁移，具备真实的多用户协作、Session 鉴权、密码安全、审计日志、CSV分账导入等生产级能力。')

add_para('V2.0 的核心变化：', bold=True)
changes_v2 = [
    '数据层：从 localStorage 升级到 Cloudflare D1（分布式 SQLite），13 张表、4 次 migration、完整索引与外键',
    '安全层：Session Cookie 鉴权（HttpOnly）、密码哈希（SHA-256 + salt）、登录限流（IP级 5次/分钟）、强制改密、安全 Headers（HSTS/XSS/CSRF）、审计日志',
    '功能层：四步项目创建向导、条款通（三维滑块联动 + RBF公式引擎 + IRR计算）、CSV分账导入、管理后台9个Tab、AI助理浮窗、自助注册审核',
    '部署层：Cloudflare Pages + Workers + 自定义域名（zhongliutong.net），月度成本 ¥0',
    '数据量：50 用户、31 项目、47 合同、103 分账记录、111 回款明细、28 通知',
]
for c in changes_v2:
    add_bullet(c)

doc.add_heading('1.2 这份文档解决什么问题', level=2)
add_para('滴灌通的产品 Bible（V3.0）定义了一个通用的收入分成投资基础设施，包含 9 个超级 Agent（"九通"）和 3 层底座。但在实际落地时，每一个细分场景都有自己独特的参与者、术语、流程和文化。')
add_para('比如"一亿中流私董会"场景中，参与者不是抽象的"融资者"和"投资者"，而是具体的"学员"、"班主任老师"和"管理员"；资金行为不是机构级的批量投资，而是同学之间基于信任的互助式投资；分享不是通过系统推送，而是通过微信群发送精美的图文卡片。')
add_para('产品 Bible 定义了"是什么"，本定制化 Bible 定义了"怎么变"——如何将通用能力针对具体场景进行定制，并实现从 Demo 到生产的完整技术路径。', bold=True)

doc.add_heading('1.3 使用方法（V2.0升级）', level=2)
add_para('V2.0 的使用场景扩展为两种：')
add_para('场景A：新场景 Demo 搭建', bold=True)
add_para('当出现一个新的细分场景需要基于滴灌通模型搭建定制化系统时，按 V1.0 的流程操作——上传产品 Bible + 本定制化 Bible → SURM分析 → Prompt序列生成 → GenSpark执行。')
add_para('场景B：Demo 升级为生产系统', bold=True)
add_para('当 Demo 验证成功、需要升级为真实可用的生产系统时，按第十三章的"6阶段迁移路径"操作——D1数据库设计 → API层搭建 → 前端API改造 → 安全加固 → 管理后台扩展 → 生产部署。')

doc.add_heading('1.4 核心原则（V2.0 增补）', level=2)
principles = [
    ('原则一：场景驱动，不是功能驱动。', '不是把九通的功能平移过来，而是从场景中的人、事、物出发，按需映射九通的能力。'),
    ('原则二：术语翻译，不是概念强加。', '每个场景有自己的语言。"融资者"在私董会场景叫"发起人"，在演出场景可能叫"主办方"。'),
    ('原则三：渐进式构建，不是一次交付。', '所有定制化系统必须拆解为多个可独立执行的 Prompt，按依赖关系排序执行。'),
    ('原则四：Demo 先行，生产跟进。', '先用 localStorage + Mock 数据快速搭建完整可演示的 Demo，验证场景逻辑后再迁移到云端数据库。'),
    ('原则五：品质感贯穿始终。', '即使是 Demo，每一个界面、每一个动效、每一张分享卡片都要达到"可以给客户看"的水准。'),
    ('原则六（V2.0新增）：安全即产品。', '生产系统必须具备完整的认证、授权、审计能力。密码不能明文存储，Session 必须有过期和清理机制，关键操作必须有审计日志。'),
    ('原则七（V2.0新增）：数据即资产。', '从 Demo 到生产的迁移，核心是数据层的升级。数据模型设计决定了系统的可扩展性和运维成本。'),
]
for title, desc in principles:
    p = doc.add_paragraph()
    r1 = p.add_run(title)
    r1.bold = True
    r1.font.size = Pt(10.5)
    r2 = p.add_run(' ' + desc)
    r2.font.size = Pt(10.5)

doc.add_page_break()

# ============================================================
# CHAPTER 2
# ============================================================
doc.add_heading('第二章 · 定制化核心理论：从"九通"到"场景通"', level=1)

doc.add_heading('2.1 什么是"场景通"', level=2)
add_para('产品 Bible 中的"九通"是按投资流程的环节抽象出来的通用能力模块。"场景通"是将这些通用能力重新组合、裁剪、包装后，形成的面向具体场景的应用系统。一个场景通不一定对应九通中的某一个。它可能融合了多个通的部分能力，也可能只用到了某个通的一小部分功能。')

doc.add_heading('2.2 九通能力的本质抽象', level=2)
nine_tong = [
    ('身份通', '人的识别与权限管理', '中流通实现：三角色（学员/老师/管理员）+ D1 sessions表 + Cookie鉴权 + 角色中间件'),
    ('发起通', '信息的结构化采集与展示', '中流通实现：四步创建向导（基本信息→条款设定→企业收款→预览发布）+ 20+字段采集'),
    ('评估通', '自定义的筛选与评分', '中流通实现：项目大厅智能排序（与我相关 > 同班 > 老师推荐 > 最新）+ 行业/状态/金额筛选'),
    ('风控通', '信息的验真与合规检查', '中流通实现：项目审核流程（管理员review）+ 亏损终止条件（连续低收入月数+金额门槛）'),
    ('参与通', '项目的浏览与决策', '中流通实现：项目详情页 + RBF计算器 + 份额选择 + 实时预估 + 大白话解读'),
    ('条款通', '多方条件的协商与计算', '中流通实现：Terms Connect 三维滑块联动（金额↔比例↔期限）+ 三种退出模式 + IRR计算 + 审批流'),
    ('合约通', '协议的生成与签署', '中流通实现：合同生成 + 双方签署（甲方/乙方独立签名）+ 签约仪式页 + 电子签约预留'),
    ('结算通', '资金流转的记录与对账', '中流通实现：CSV分账导入 + 批次管理 + 自动回款分配 + 累计回收进度跟踪'),
    ('履约通', '持续的监控与预警', '中流通实现：回款中心（我的投资/我的发起双视角）+ 回款进度条 + 回本庆祝横幅'),
]
add_table_simple(
    ['九通模块', '本质能力', '中流通生产版实现'],
    [(n, a, i) for n, a, i in nine_tong]
)

doc.add_heading('2.3 定制化的三个层次', level=2)
add_para('第一层：术语与品牌定制。改名字、改颜色、改Logo、改文案。对用户感知影响最大。中流通品牌色 #B91C1C（品牌红）+ #D4A853（金色辅助）。')
add_para('第二层：流程与角色定制。根据场景裁剪或重组九通的流程，定义场景专属角色和权限。中流通将"融资者路径"变为"学员发起项目"，"投资者路径"变为"同学浏览并参与投资"。')
add_para('第三层：交互与体验定制。根据场景的文化和使用习惯，设计独特的交互仪式、分享方式、引导流程。中流通的合同签署是有动效和仪式感的"签约典礼"页面。')
add_para('第四层（V2.0新增）：技术架构定制。根据场景的用户规模、数据敏感度、合规要求，选择合适的技术栈和部署方案。中流通选择 Cloudflare Workers + D1，实现零成本全球部署。', bold=True)

doc.add_page_break()

# ============================================================
# CHAPTER 3 - SURM
# ============================================================
doc.add_heading('第三章 · 场景分析框架（SURM 四步法）', level=1)

doc.add_heading('3.1 什么是 SURM', level=2)
add_para('SURM 是定制化启动前必须完成的场景分析框架，四个字母分别代表：')
surm = [
    ('S — Stakeholders（利益相关者）', '这个场景中有哪些角色？他们之间是什么关系？谁发起、谁参与、谁管理、谁监督？'),
    ('U — User Journeys（用户旅程）', '每个角色从进入系统到完成目标，经历哪些步骤？关键决策点在哪里？'),
    ('R — Relationships（关系网络）', '角色之间如何互动？信任是怎么建立的——通过平台背书、熟人关系还是数据验证？'),
    ('M — Medium（传播介质）', '信息在什么渠道传播？用户在什么设备上使用？分享通过什么方式？'),
]
for title, desc in surm:
    p = doc.add_paragraph()
    r1 = p.add_run(title + '：')
    r1.bold = True
    r2 = p.add_run(desc)

doc.add_heading('3.2 SURM 分析如何驱动开发', level=2)
add_para('S（利益相关者）→ 决定角色体系（数据库 users.role）+ 权限中间件（requireAuth/requireAdmin/requireTeacher）')
add_para('U（用户旅程）→ 决定功能页面和 API 端点的数量和顺序')
add_para('R（关系网络）→ 决定社交功能（引荐、分享、班级、通知）+ 智能排序（与我相关）')
add_para('M（传播介质）→ 决定分享卡片设计、响应式断点、多端适配方案')

doc.add_page_break()

# ============================================================
# CHAPTER 4 - Roles
# ============================================================
doc.add_heading('第四章 · 角色体系定制化方法论', level=1)

doc.add_heading('4.1 中流通的三角色体系（生产版）', level=2)
add_para('中流通在 V1.0 的基础上，通过 D1 数据库实现了真正的角色隔离：')

role_table = [
    ('学员 member', 'investor + borrower', '发起项目、浏览大厅、参与投资、查看回款、个人中心、请老师引荐', 'requireAuth', '首页 / → 项目大厅 /projects → 回款中心 /repayments'),
    ('老师 teacher', '新增角色（连接者）', '班级概览、学员管理、引荐处理、项目推荐、也可发起/投资', 'requireTeacher', '老师工作台 /teacher'),
    ('管理员 admin', 'shared (管理者)', '9Tab后台（总览/分账/学员/班级/老师/项目/审核/邀请码/日志）', 'requireAdmin', '管理后台 /admin'),
]
add_table_simple(
    ['角色', '对应产品Bible', '核心功能', '权限中间件', '专属页面'],
    role_table
)

doc.add_heading('4.2 角色权限隔离的技术实现', level=2)
add_para('V1.0 通过 localStorage 中的角色标识做前端分流。V2.0 升级为服务端 Session 鉴权链：', bold=True)
auth_chain = [
    '登录 → POST /api/login → 验证密码（SHA-256 hash）→ 创建 D1 session → Set-Cookie: zlc_session',
    'API请求 → Cookie中读取 zlc_session → D1 JOIN sessions+users → 注入 c.set("user", SessionUser)',
    '角色守卫 → requireAuth（所有登录态路由）→ requireAdmin（管理后台）→ requireTeacher（老师接口）',
    '会话管理 → 7天过期 → 过期自动清理 → 账号禁用即时踢出 → 支持管理员手动清理',
]
for step in auth_chain:
    add_bullet(step)

doc.add_heading('4.3 登录页设计（V2.0 生产版）', level=2)
add_para('登录页是品牌的第一印象，中流通的登录页包含以下设计元素：')
login_features = [
    '全屏品牌渐变背景（#7F1D1D → #B91C1C → #991B1B）+ 毛玻璃卡片',
    '粒子动画 Canvas 背景 + 3个径向光晕动画球体',
    '三角色选择卡片（学员🎓 / 老师👨‍🏫 / 管理员⚙️）带3D提升 + 光泽扫过动效',
    '快捷体验账号（按角色分组，点击一键登录）',
    '手机号+密码登录（折叠面板）',
    '自助注册入口（需填写姓名、手机号、班主任名称、密码，提交后状态为 pending，需管理员审核）',
    '首次登录强制改密（两步验证：先验证完整手机号 → 再设置新密码 + 密码强度检测）',
    '桌面端左右分屏（左侧品牌展示 50% + 右侧登录卡片 50%）',
]
for f in login_features:
    add_bullet(f)

doc.add_page_break()

# ============================================================
# CHAPTER 5 - Data Architecture
# ============================================================
doc.add_heading('第五章 · 数据架构定制化方法论 ★核心升级', level=1)

doc.add_heading('5.1 从 localStorage 到 Cloudflare D1', level=2)
add_para('V1.0 的数据全部存储在浏览器 localStorage 中，每个用户的数据完全隔离在本地。V2.0 将所有数据迁移到 Cloudflare D1（分布式 SQLite），实现了真正的多用户协作和数据持久化。')
add_para('迁移路径：localStorage Mock 数据 → D1 Schema 设计 → seed.sql 数据导入 → API 层封装 → 前端 fetch 替换 localStorage 读写。')

doc.add_heading('5.2 数据库 Schema 设计（13张表）', level=2)
tables = [
    ('users', '50', '统一用户表（学员+老师+管理员），含密码哈希、角色、班级关联、状态控制'),
    ('projects', '31', '项目表，含融资参数（20+字段）、企业主体信息、风控条款、退出条件、分享码'),
    ('project_investors', '~90', '项目-投资人多对多关联表'),
    ('contracts', '47', '合同表，含双方信息、商业条款、签署状态、审批流、电子签约预留'),
    ('settlement_batches', '5', '分账批次表（每次CSV导入为一个批次）'),
    ('settlement_records', '103', '分账记录表（项目维度，每期一条）'),
    ('repayment_details', '111', '回款明细表（投资人维度）'),
    ('referrals', '9', '引荐记录表'),
    ('notifications', '28', '通知表（系统/参与/回款/引荐/审核 五类）'),
    ('invite_codes', '~20', '邀请码管理表'),
    ('share_logs', '20', '分享行为记录表'),
    ('audit_logs', '100+', '审计日志表（所有关键操作的IP、时间、详情记录）'),
    ('sessions', '动态', '用户会话表（Session token + 过期时间 + 设备信息 + IP）'),
]
add_table_simple(['表名', '记录数', '说明'], tables)

doc.add_heading('5.3 Migration 管理（4次迭代）', level=2)
migrations = [
    ('0001_initial_schema', '13张核心表 + 全部索引和外键约束'),
    ('0002_seed_data', '种子数据：50用户、31项目、47合同、103分账、111回款...'),
    ('0003_terms_connect', '为 projects 表新增20列（企业主体+退出条件+风控+收款），contracts 表新增11列（年化收益率+退出模式+审批流+电子签约）'),
    ('0004_security', '用户密码字段、must_change_password 标志、sessions 表创建'),
]
add_table_simple(['Migration', '内容'], migrations)

doc.add_heading('5.4 数据访问层架构', level=2)
add_para('中流通采用三层数据访问架构：', bold=True)
add_para('第一层：db.ts — 直接 D1 查询层。提供类型安全的 CRUD 操作（getUserByPhone、getProjectById、createNotification 等）。包含密码哈希/验证函数（Web Crypto API SHA-256）。')
add_para('第二层：db-bridge.ts — 兼容桥接层。将 D1 查询结果转为与 V1.0 localStorage 相同的数据格式，使前端代码几乎无需修改。提供 loadMembers、loadProjects、calculateRBF 等业务函数。')
add_para('第三层：admin-api.tsx — 管理写入层。13个管理员API端点，处理复杂的业务逻辑（CSV分账导入→批次创建→回款分配→合同更新→通知→审计日志）。')

doc.add_page_break()

# ============================================================
# CHAPTER 6 - Feature Mapping
# ============================================================
doc.add_heading('第六章 · 功能映射矩阵：九通能力 → 场景功能', level=1)

doc.add_heading('6.1 中流通功能完整清单（V27 生产版）', level=2)
features = [
    ('P0 核心', '登录/鉴权', '三角色登录 + Session Cookie + 密码哈希 + 限流 + 强制改密 + 自助注册审核', '/login, POST /api/login'),
    ('P0 核心', '首页仪表盘', '时段问候 + 本周回款速报 + 投资概览（SVG半圆仪表盘）+ 快捷入口 + 项目列表 + 回款动态', '/ (GET)'),
    ('P0 核心', '项目大厅', '行业/状态/排序筛选 + KPI横幅 + 智能排序（与我相关） + 关系标签（同班/老师推荐）', '/projects'),
    ('P0 核心', '项目详情', '发起人信息 + RBF条款卡 + 募集进度 + 份额计算器 + 大白话解读 + 浏览计数 + 参与/引荐/分享', '/projects/:id'),
    ('P0 核心', '项目创建', '四步向导（基本信息→条款设定→企业收款→预览发布）+ 三种退出模式 + 双滑块联动', '/create'),
    ('P0 核心', '条款通', '三维滑块联动（金额↔比例↔期限）+ RBF核心公式卡 + IRR计算 + 审批流 + 条款确认', '/contracts/:id/terms'),
    ('P0 核心', '合同签署', '双方独立签署 + 签约仪式页（金色对勾动画 + 条款摘要）+ 审批状态追踪', '/contracts/:id/sign'),
    ('P0 核心', '回款中心', '双Tab（我的投资/我的发起）+ 投资概览 + 合同列表 + 回款时间线 + 回本庆祝 + 收入报告', '/repayments'),
    ('P1 体验', '管理后台', '9个Tab（总览/分账/学员/班级/老师/项目/审核/邀请码/日志）+ CSV分账导入 + 批量注册', '/admin'),
    ('P1 体验', '老师工作台', '班级概览 + 学员列表 + 引荐处理 + 项目推荐', '/teacher'),
    ('P1 体验', '通知系统', '5类通知（系统/参与/回款/引荐/审核）+ 未读计数 + 实时刷新', '/notifications'),
    ('P1 体验', '分享传播', '品牌分享卡片（6区域设计）+ 复制分享码/链接/文字版 + 分享行为记录', '分享面板'),
    ('P1 体验', '引荐系统', '请老师引荐 + 引荐状态追踪 + 老师处理（对接/拒绝）+ 通知流转', '引荐模态框'),
    ('P2 锦上添花', 'AI 助理', '智能浮窗 + 页面上下文感知（15路由×3角色）+ 预置建议 + 常见问题', '全局浮窗'),
    ('P2 锦上添花', '演示引导', '角色专属指南页（苹果风格时间轴）+ 首次登录气泡提示 + 30秒无操作引导', '/guide/*'),
    ('P2 锦上添花', '个人中心', '个人信息展示 + 密码修改 + 投资统计', '/profile'),
    ('P2 锦上添花', '投资管理', '我的投资列表 + 合同详情 + 回款跟踪', '/investments'),
]
add_table_simple(
    ['优先级', '功能模块', '详细描述', '对应路由/入口'],
    features
)

doc.add_page_break()

# ============================================================
# CHAPTER 7 - UI Spec
# ============================================================
doc.add_heading('第七章 · 用户界面定制化规范', level=1)

doc.add_heading('7.1 品牌色系（中流通实际使用）', level=2)
colors = [
    ('品牌红（主色）', '#B91C1C', '导航栏、主按钮、CTA、状态标签、渐变背景起始色'),
    ('金色辅助', '#D4A853', '签约仪式、分享卡片数据区、进度条、登录选中卡片'),
    ('深红', '#7F1D1D / #991B1B', '登录渐变背景、深色文字强调'),
    ('成功绿', '#16A34A', '回款速报、回本庆祝、审核通过'),
    ('警告黄', '#D97706 / #B45309', '金色辅助、老师推荐标签、参考案例'),
    ('文字层次', '#1C1917 / #78716C / #A8A29E', '标题/正文/辅助文字三级层次'),
    ('背景', '#FAFAF9 / #FFFFFF / #F5F5F4', '页面背景/卡片背景/分区背景'),
    ('边框', '#F0EFED / #E7E5E4', '卡片边框、分割线'),
]
add_table_simple(['色系', '色值', '使用场景'], colors)

doc.add_heading('7.2 卡片设计规范（三区域分层）', level=2)
add_para('所有卡片组件遵循三区域分层原则：')
add_para('区域 A（顶部） — 身份信息：谁发起/谁参与的。圆形头像 + 姓名 + 公司/期数。')
add_para('区域 B（中部） — 核心内容：项目名称 + 关键数据指标（融资额/分成比例/期限）+ 行业标签 + 状态标签。')
add_para('区域 C（底部） — 操作引导：进度条 + 操作按钮 + 统计信息。')
add_para('数据指标容器始终使用独立的浅色背景圆角框包裹（grid 3列布局），和其他文字信息明确区分。')

doc.add_page_break()

# ============================================================
# CHAPTER 8 - Ceremony
# ============================================================
doc.add_heading('第八章 · 交互仪式感设计体系', level=1)

doc.add_heading('8.1 中流通已实现的仪式节点', level=2)
ceremonies = [
    ('项目发起成功', '全屏成功模态框 + 绿色对勾放大动画 + 分享码展示 + "分享给同学"按钮 + "查看项目"按钮', '✅ 已实现'),
    ('投资参与确认', '确认模态框（项目名+金额）→ 成功蒙层（金色主题 2秒后跳转条款确认）', '✅ 已实现'),
    ('合同签署完成', '全屏签约仪式页：深色背景 + 金色文字 + 动效对勾 + 条款摘要 + 双方信息 + 分享/查看按钮', '✅ 已实现'),
    ('首次收到回款', '回款中心特殊标记 + 回款速报闪烁（首页绿色横幅滑入动画）', '✅ 已实现'),
    ('累计回款回本', '金色庆祝横幅 + CSS撒花动画（纯CSS confetti）+ 回收率仪表盘变绿', '✅ 已实现'),
    ('首次登录改密', '两步引导模态框：身份验证（手机号全号）→ 设置新密码（强度检测 + 眼睛切换）', '✅ 已实现'),
]
add_table_simple(['仪式节点', '实现方式', '状态'], ceremonies)

doc.add_heading('8.2 动效规范', level=2)
add_para('所有动效纯 CSS 实现，不依赖外部库。时长控制在 300ms-1500ms。')
add_para('登录页：卡片入场 600ms ease-out + 粒子Canvas 60fps + 光晕球体 12-18s 浮动循环 + 角色选中 emoji 弹跳 400ms')
add_para('页面转场：page-enter 淡入上移 300ms + step-panel 左右滑入 300ms')
add_para('交互反馈：按钮 :active scale(0.98) + Toast 3秒自动消失 + 进度条动画')
add_para('仪式动效：成功对勾 iconPop 500ms cubic-bezier(0.16,1,0.3,1) + 回本撒花 CSS particles')

doc.add_page_break()

# ============================================================
# CHAPTER 9 - Share
# ============================================================
doc.add_heading('第九章 · 社交裂变与分享传播设计', level=1)

doc.add_heading('9.1 分享卡片设计（6区域结构）', level=2)
add_para('中流通的分享卡片是一个完整的品牌传播物料，采用深红渐变背景 + 金色强调的高端设计：')
share_zones = [
    ('A. 品牌区', '金色线条 + "中流通 · 项目推介"文字 + 信封式布局'),
    ('B. 项目名', '白色大字标题 + 金色一句话推介语'),
    ('C. 发起人', '姓名 + 班级期数（半透明白色文字）'),
    ('D. 数据网格', '2×2 网格：融资规模/收入分成/联营期限/预估月回款（半透明白色背景框）'),
    ('E. 项目亮点', '金色菱形符号 + 亮点文字列表'),
    ('F. 分享码区', '6位大写分享码（金色 32px 等宽字体 + 虚线边框）+ QR占位'),
    ('G. 品牌footer', '金色分割线 + "一亿中流 · 私董会项目投资平台"'),
]
add_table_simple(['区域', '内容'], share_zones)

doc.add_heading('9.2 四种分享方式', level=2)
add_para('复制分享码 → navigator.clipboard + 即时"已复制✓"反馈 2秒恢复')
add_para('复制链接 → https://zhongliutong.net/share/{shareCode}')
add_para('复制文字版 → 格式化推介文字（📢标题+👤发起人+💰融资+📊分成+⏱期限+📈回款+✅亮点+🔗链接+🔑分享码）')
add_para('保存卡片 → 长按截图提示（Web端暂无原生导出图片能力）')

doc.add_page_break()

# ============================================================
# CHAPTER 10 - Responsive
# ============================================================
doc.add_heading('第十章 · 响应式与多端适配方法论', level=1)

doc.add_heading('10.1 中流通的响应式实现', level=2)
add_para('一套代码 + CSS 媒体查询 + dk-* 类名前缀实现桌面端适配。三个断点：手机（≤768px）、平板（769-1024px）、电脑（≥1025px）。')

doc.add_heading('10.2 桌面端布局（已实现）', level=2)
desktop_layouts = [
    ('登录页', '左右分屏（50%品牌展示 + 50%登录卡片），左侧隐藏移动端背景'),
    ('首页', '双栏（左主内容区 dk-home-left + 右侧回款动态 dk-home-right sticky）'),
    ('项目大厅', '三列卡片网格，筛选标签完整展开'),
    ('项目详情', '左右分栏（左信息区 dk-detail-left 60% + 右行动卡片 dk-detail-action-card 40% sticky）'),
    ('管理后台', 'KPI卡片单行排列，数据列表表格化展示'),
    ('老师工作台', '双栏（左学员列表 + 右详情面板）'),
    ('弹窗/模态框', '居中弹窗 max-width 520px + scale动画（替代手机端底部滑出）'),
]
add_table_simple(['页面', '桌面端布局'], desktop_layouts)

doc.add_page_break()

# ============================================================
# CHAPTER 11 - Data Richness
# ============================================================
doc.add_heading('第十一章 · 数据丰富度与真实感工程 ★升级', level=1)

doc.add_heading('11.1 从 Mock 数据到 D1 种子数据', level=2)
add_para('V1.0 的 Mock 数据存储在 localStorage，通过 JavaScript 初始化。V2.0 的种子数据通过 seed.sql 导入到 D1 数据库，所有用户共享同一份真实数据。')

doc.add_heading('11.2 中流通种子数据规模', level=2)
seed_data = [
    ('用户', '50', '学员40人（分布在6个班级）+ 老师2人 + 管理员1人 + 特殊测试用户'),
    ('项目', '31', '覆盖8个行业、7种状态（draft/pending_review/open/funded/active/completed/terminated）'),
    ('合同', '47', '每个进行中项目2-5份合同，涵盖pending/signed/active/completed状态'),
    ('分账记录', '103', '覆盖2025年10月-2026年3月共6个月的分账数据'),
    ('回款明细', '111', '精确到每个投资人每期的分账金额、累计回款、回收进度'),
    ('引荐记录', '9', '覆盖pending/connected/completed状态'),
    ('通知', '28', '覆盖系统/参与/回款/引荐/审核五类'),
    ('分享记录', '20', '覆盖text_copy/card_save/code_copy/link_copy'),
]
add_table_simple(['数据类型', '数量', '覆盖范围'], seed_data)

doc.add_heading('11.3 数据真实感关键细节', level=2)
add_para('每个用户有完整画像：真实姓名、公司名（如"星火餐饮管理"、"智造科技"等）、行业、职位、一句话简介。')
add_para('每个项目有完整业务描述：项目名体现具体业务（如"华南区20店扩张"）、行业标签、合理的融资金额范围、符合行业惯例的分成比例。')
add_para('时间数据连续分布：分账记录覆盖6个月、回款按月递增、最新回款日期贴近当前。')
add_para('企业主体信息完整：企业全称、统一社会信用代码（18位）、法定代表人、注册地址、开户银行等。')

doc.add_page_break()

# ============================================================
# CHAPTER 12 - Guide
# ============================================================
doc.add_heading('第十二章 · 演示引导与用户教育体系', level=1)

doc.add_heading('12.1 中流通的三层引导体系', level=2)
guide_system = [
    ('苹果风格演示指南', '独立路由 /guide/member、/guide/teacher、/guide/admin。全屏品牌渐变 Hero + 时间轴布局 + IntersectionObserver滚动渐现 + 最终CTA按钮。每个角色展示完整使用流程。', '已实现'),
    ('首次登录内联提示', '各页面首次访问时显示黄色提示卡片（FFFBEB背景 + FDE68A边框），含操作引导文字和"我知道了"按钮。localStorage记录是否已看过，带userId后缀避免角色切换干扰。', '已实现'),
    ('30秒无操作温和引导', '用户在关键页面停留30秒无操作时，从底部滑入一个温和的提示条（showNudge函数）。如：大厅30秒未点项目→"点击任意项目查看详细条款"。用户操作后自动取消。', '已实现'),
]
add_table_simple(['引导方式', '实现方式', '状态'], guide_system)

doc.add_heading('12.2 AI 助理浮窗（V24 新增）', level=2)
add_para('AI助理是纯前端实现的智能引导浮窗，约49KB代码。核心特点：')
ai_features = [
    '页面上下文感知：15个路由 × 3种角色 = 45种上下文组合，每种组合有专属的解释文案和操作建议',
    '角色区分：学员看到投资相关建议，老师看到班级管理建议，管理员看到运营管理建议',
    '快捷操作：每个建议带有 action 属性（页面跳转URL），点击即可直接导航',
    '常见问题库：预置场景相关FAQ，无需调用外部AI接口',
    '非侵入式：右下角浮动按钮 + 展开面板 + 自动收起，不影响主流程',
]
for f in ai_features:
    add_bullet(f)

doc.add_page_break()

# ============================================================
# CHAPTER 13 - Demo to Production ★★★
# ============================================================
doc.add_heading('第十三章 · 从 Demo 到生产的技术演进路径 ★核心升级', level=1)

doc.add_heading('13.1 中流通的完整演进历程', level=2)
add_para('中流通是产品 Bible "从Demo到生产"路径的第一个完整实践案例。以下是实际走过的6个阶段：')

phases = [
    ('Phase 1: GenSpark Demo', 'Prompt 1-33', 'GenSpark全栈模式 + localStorage + Mock数据 + 纯前端', '完整的可演示系统，验证场景逻辑'),
    ('Phase 2: D1 迁移', 'V20-V21', '设计13张表Schema → 种子数据导入 → db.ts + db-bridge.ts → 前端API改造', '数据持久化 + 多用户共享'),
    ('Phase 3: API层构建', 'V21', '34个API端点 → 读写分离 → 管理员写入API → 分账CSV导入', '完整的后端业务逻辑'),
    ('Phase 4: 条款通升级', 'V22-V23', '三维滑块联动 + 三种退出模式 + RBF公式引擎 + IRR计算 + 四步创建向导', '核心业务逻辑的精确计算'),
    ('Phase 5: 安全加固', 'V26', 'Session Cookie + 密码哈希 + 登录限流 + 安全Headers + 审计日志 + 强制改密', '生产级安全能力'),
    ('Phase 6: 生产部署', 'V27', 'Cloudflare Pages 部署 + 自定义域名 + D1 production + SSL + 缓存策略', '全球可访问的生产系统'),
]
add_table_simple(['阶段', '版本', '核心工作', '产出'], phases)

doc.add_heading('13.2 技术栈选择依据', level=2)
tech_choices = [
    ('Hono Framework', '轻量（14KB）、TypeScript原生、Cloudflare Workers原生支持、中间件机制完善'),
    ('Cloudflare D1', '分布式SQLite、全球低延迟、SQL语法熟悉、Migration管理简单、免费额度充足'),
    ('Cloudflare Pages', '全球CDN、自动SSL、自定义域名、Workers集成、每月免费10万请求'),
    ('Vite + TSX', '快速构建、HMR开发体验、SSR支持、Tree-shaking'),
    ('Tailwind CSS (CDN)', '零构建成本、快速原型、与品牌色系高度可定制'),
    ('纯JavaScript前端', '无框架依赖（无React/Vue）、SSR + 客户端hydration、最小bundle size'),
]
add_table_simple(['技术选择', '选择理由'], tech_choices)

doc.add_heading('13.3 API 架构设计', level=2)
add_para('中流通的 API 分为四层：', bold=True)
add_para('公开端点（无鉴权）：POST /api/login, POST /api/self-register, POST /api/logout, GET /api/auth/me')
add_para('数据读取层（requireAuth）：18个 GET /api/data/* 端点，提供前端页面按需加载数据。使用 Cache-Control: private, max-age=30 优化性能。')
add_para('管理写入层（requireAuth + 业务逻辑验证）：13个 POST /api/admin/* 端点，处理 CSV分账导入、项目创建、合同签署、引荐处理等复杂业务。')
add_para('管理员专属层（requireAdmin）：POST /api/admin/reset-password, POST /api/admin/sessions/cleanup 等。')

doc.add_heading('13.4 前端代码可复用性（实证）', level=2)
add_para('中流通证实了 V1.0 的预判——GenSpark 生成的前端代码在迁移时几乎完整保留。实际改动量：')
add_para('需要改动的：将 localStorage 读写替换为 fetch API 调用（约 30% 的 JS 代码）。')
add_para('完全保留的：所有 HTML 结构、CSS 样式、动效代码、UI 组件、页面布局（约 70%）。')
add_para('新增的：db.ts（200行）、db-bridge.ts（300行）、middleware.ts（200行）、admin-api.tsx（600行）。')

doc.add_page_break()

# ============================================================
# CHAPTER 14 - Prompt Engineering ★★★
# ============================================================
doc.add_heading('第十四章 · Prompt 工程方法论（核心章节）★升级', level=1)

doc.add_heading('14.1 V2.0 的 Prompt 分类体系（扩展）', level=2)
add_para('V1.0 定义了 F/P/C/D/S/E 六类 Prompt。V2.0 新增两类：')
prompt_types = [
    ('F类 Foundation', '登录页、全局框架、路由系统、数据模型初始化', '最先执行'),
    ('P类 Page', '具体页面的完整实现（首页、大厅、详情、回款等）', '依赖F类'),
    ('C类 Component', '跨页面共享组件（分享卡片、合同模板、通知系统）', '依赖P类'),
    ('D类 Data', 'Mock 数据添加（V1.0）或 种子数据 SQL（V2.0）', '纯数据'),
    ('S类 Style', '纯样式优化（响应式适配、卡片精细化、动效增强）', '不改逻辑'),
    ('E类 Enhancement', '功能增强（角色权限、交互模拟、演示引导）', '依赖P+C'),
    ('M类 Migration ★新增', '数据库迁移（Schema设计 → API层 → 前端改造 → 安全加固）', '依赖全部'),
    ('O类 Operations ★新增', '运维部署（Cloudflare配置、域名绑定、缓存策略、监控）', '最后执行'),
]
add_table_simple(['类型', '说明', '执行时机'], prompt_types)

doc.add_heading('14.2 标准 Prompt 执行序列（V2.0 完整版）', level=2)
add_para('Phase 1 — 基础搭建（Prompt 1-5）：登录页 → 全局导航 → 首页 → 项目大厅+详情 → 核心交易流程', bold=True)
add_para('Phase 2 — 功能补全（Prompt 6-10）：回款页 → 分享功能 → 个人中心 → 通知系统 → Onboarding')
add_para('Phase 3 — 角色丰富（Prompt 11-14）：老师工作台 → 管理后台 → 管理扩展 → 权限隔离')
add_para('Phase 4 — 数据丰富（Prompt 15-16）：分批Mock数据 → 模拟交互数据')
add_para('Phase 5 — 品质提升（Prompt 17-19）：开屏动画 → 分享卡片升级 → 响应式适配')
add_para('Phase 6 — 生产升级（V2.0 新增）', bold=True, color=(0xB9, 0x1C, 0x1C))
phase6_prompts = [
    'M-01：D1 Schema 设计（13张表 + 索引 + 外键 + 种子数据）',
    'M-02：数据访问层（db.ts + db-bridge.ts 兼容层）',
    'M-03：API 端点构建（34个端点 + 中间件链）',
    'M-04：前端 API 改造（localStorage → fetch，SSR 数据注入）',
    'M-05：管理写入 API（CSV分账 + 批量注册 + 项目审核 + 合同签署等 13个端点）',
    'M-06：条款通升级（三维滑块联动 + 三种退出模式 + RBF公式引擎 + IRR计算）',
    'M-07：四步创建向导（基本信息→条款→企业收款→预览，新增20+字段）',
    'M-08：安全加固（Session Cookie + 密码哈希 + 限流 + 安全Headers + 审计日志）',
    'M-09：自助注册 + 管理员审核流',
    'M-10：AI 助理浮窗（15路由 × 3角色上下文感知）',
    'O-01：Cloudflare Pages 部署 + D1 production + 自定义域名',
    'O-02：缓存策略（静态资源7天 + API数据30秒 + stale-while-revalidate）',
]
for p in phase6_prompts:
    add_bullet(p)

doc.add_page_break()

# ============================================================
# CHAPTER 15 - Case Study ★★★
# ============================================================
doc.add_heading('第十五章 · 完整案例实录：一亿中流私董会场景 ★全量升级', level=1)

doc.add_heading('15.1 场景描述', level=2)
add_para('一亿中流是一个企业家私董会组织。学员都是年营收过亿的企业主。学员分班级学习，每个班级有一位班主任老师。学员可以将自己企业的项目发布到平台上，同班或跨班的同学可以基于收入分成模式投资这些项目。平台名为"中流通"，品牌联名"滴灌通 × 一亿中流"。')

doc.add_heading('15.2 SURM 分析（生产版验证）', level=2)
add_para('S（利益相关者）：学员（双重身份 borrower+investor）、老师（连接者，可发起/投资）、管理员（全局管理）。实际数据：50用户 = 40学员 + 6老师 + 2管理员 + 2特殊。')
add_para('U（用户旅程）：学员发起→四步表单→审核→发布→同学浏览→参与→条款确认→签约→月度分账→回款。老师工作：班级概览→引荐处理→项目推荐。管理员：总览KPI→分账导入→学员管理→项目审核→日志审计。')
add_para('R（关系网络）：同班同学先验信任（绿色标签）、老师推荐强化信任（金色标签）、班级归属感（期数标识）、智能排序（与我相关优先）。')
add_para('M（传播介质）：微信群分享（品牌卡片 + 分享码 + 格式化文字）、手机端日常使用、电脑端演示展示。')

doc.add_heading('15.3 品牌色系', level=2)
add_para('品牌主色：#B91C1C（中国红）。辅助色：#D4A853（金色）。渐变方向：135deg。登录渐变：#7F1D1D → #B91C1C → #991B1B。签约仪式：深色背景 + 金色文字。')

doc.add_heading('15.4 版本演进全记录', level=2)
versions = [
    ('Phase 1 (P1-P19)', 'GenSpark Demo', '33个Prompt完成完整Demo'),
    ('V20', 'D1 数据库迁移', '13表Schema + 种子数据 + db-bridge兼容层'),
    ('V21', 'API层+前端改造', '34个API + 所有页面从localStorage切换到API'),
    ('V22', '条款通 Terms Connect', '滑动条款 + 审批流 + 四步创建向导 + 20+新字段'),
    ('V23', 'P0条款引擎升级', '三维滑块联动 + RBF公式卡 + IRR Newton法 + 三种退出模式'),
    ('V24', 'AI助理浮窗', '15路由×3角色上下文 + 预置FAQ + 操作建议'),
    ('V25', '视觉全面升级', '登录页粒子动画 + 品牌卡片精细化 + 桌面端适配'),
    ('V25.1', '引导体系优化', '内联提示替代Coach Marks + 30秒温和引导 + Nudge系统'),
    ('V26', '安全加固', 'Session Cookie + SHA-256密码 + 限流 + 安全Headers + 审计 + 强制改密 + 自助注册'),
    ('V27', '生产部署', 'Cloudflare Pages + D1 production + zhongliutong.net + SSL + 缓存'),
]
add_table_simple(['版本', '主题', '核心内容'], versions)

doc.add_heading('15.5 关键经验总结（V2.0 增补）', level=2)
lessons = [
    'GenSpark 生成的前端代码可复用率约 70%，迁移的核心工作量在数据层和安全层。',
    'D1 的 Migration 机制非常适合渐进式开发——每个版本一个 migration 文件，--local 本地调试 + 生产自动应用。',
    'db-bridge 兼容层是关键创新——让前端代码几乎不需要修改即可从 localStorage 切换到 D1。',
    '安全加固不能在最后才做——Session 鉴权和密码哈希应该在 API 层搭建时就一起实现。',
    '管理后台是运营的基础——9个Tab看似复杂，但每个Tab解决一个真实的运营痛点。',
    '条款通（Terms Connect）是业务核心——三种退出模式 × 三种平息口径 = 9种计算组合，必须精确到小数点后3位。',
    'AI助理的 ROI 超预期——49KB代码换来显著降低的用户学习成本和支持工作量。',
    '月度成本 ¥0 不是梦——Cloudflare Pages + D1 的免费额度足以支撑初创期流量。',
]
for i, lesson in enumerate(lessons):
    p = doc.add_paragraph()
    r = p.add_run(f'经验{i+1}：')
    r.bold = True
    p.add_run(lesson)

doc.add_page_break()

# ============================================================
# CHAPTER 16 - Security ★NEW
# ============================================================
doc.add_heading('第十六章 · 安全体系与生产运维 ★V2.0 新增章节', level=1)

doc.add_heading('16.1 认证与授权', level=2)
add_para('密码存储：SHA-256 + 随机16位salt，格式 $sha256${salt}${hash}。兼容 Demo 密码（$demo$前缀）。')
add_para('Session管理：Cookie名 zlc_session，HttpOnly + SameSite=Lax + 7天过期。D1 sessions 表存储 session_id → user_id 映射，含 IP 和设备信息。')
add_para('登录限流：基于IP的滑动窗口限流。每分钟最多5次登录尝试，超限锁定5分钟。使用 D1 rate_limits 表持久化（Workers 无内存持久化）。')
add_para('强制改密：首次登录的 Demo 账号必须修改初始密码。两步验证：先验证完整手机号 → 再设置新密码（最少6位 + 强度检测）。')

doc.add_heading('16.2 安全 Headers', level=2)
headers_list = [
    ('X-Frame-Options', 'DENY', '防点击劫持'),
    ('X-Content-Type-Options', 'nosniff', '防 MIME 嗅探'),
    ('X-XSS-Protection', '1; mode=block', 'XSS 保护（旧浏览器）'),
    ('Referrer-Policy', 'strict-origin-when-cross-origin', '控制 Referrer 泄露'),
    ('Permissions-Policy', 'camera=(), microphone=(), geolocation=()', '禁用不需要的浏览器特性'),
    ('Strict-Transport-Security', 'max-age=31536000; includeSubDomains', 'HSTS 强制 HTTPS（仅 CF 代理）'),
]
add_table_simple(['Header', '值', '作用'], headers_list)

doc.add_heading('16.3 审计日志', level=2)
add_para('所有关键操作记录审计日志（audit_logs 表），包含：操作人ID、操作类型、操作对象、详情JSON、IP地址、时间戳。')
audit_actions = [
    'login_success / login_failed / login_blocked',
    'change_password / admin_reset_password',
    'self_register',
    'project_create / project_review',
    'participate / contract_sign',
    'settlement_import / revenue_report_submit',
    'referral_create / referral_handle',
    'member_batch_register / member_toggle_status',
    'session_cleanup',
]
for a in audit_actions:
    add_bullet(a)

doc.add_heading('16.4 缓存策略', level=2)
add_para('静态资源（/static/*）：Cache-Control: public, max-age=604800, immutable（7天）')
add_para('API 数据（/api/data/*）：Cache-Control: private, max-age=30, stale-while-revalidate=60（30秒新鲜 + 60秒陈旧可用）')
add_para('Favicon：Cache-Control: public, max-age=86400（1天）')

doc.add_page_break()

# ============================================================
# CHAPTER 17 - Quick Start
# ============================================================
doc.add_heading('第十七章 · 快速启动清单 ★升级版', level=1)

add_para('场景A：新场景 Demo 搭建', bold=True, size=12)
demo_steps = [
    'Step 1：场景信息收集（10分钟）— SURM 问卷',
    'Step 2：角色映射（5分钟）— 第四章模板',
    'Step 3：功能映射（10分钟）— 第六章矩阵',
    'Step 4：数据模型设计（10分钟）— 第五章模板',
    'Step 5：品牌色定义（5分钟）— 第七章模板',
    'Step 6：Prompt 序列生成（30分钟）— 第十四章 Phase 1-5',
    'Step 7：GenSpark 逐个执行 — 每 3-5 个 Prompt 验证一次',
]
for s in demo_steps:
    add_bullet(s)

add_para('\n场景B：Demo 升级为生产系统', bold=True, size=12)
prod_steps = [
    'Step 1：D1 Schema 设计 — 将 localStorage 数据结构转为 SQL 表',
    'Step 2：种子数据准备 — 从 Mock 数据生成 seed.sql',
    'Step 3：数据访问层 — 编写 db.ts + db-bridge.ts 兼容层',
    'Step 4：API 端点构建 — 34 个标准化 REST API',
    'Step 5：前端 API 改造 — localStorage 读写 → fetch 调用',
    'Step 6：安全加固 — Session Cookie + 密码哈希 + 限流 + 审计',
    'Step 7：管理后台扩展 — CSV导入 + 批量操作 + 日志审计',
    'Step 8：Cloudflare 部署 — Pages + D1 production + 自定义域名',
    'Step 9：验收测试 — 全流程走通 + 安全测试 + 性能测试',
]
for s in prod_steps:
    add_bullet(s)

doc.add_page_break()

# ============================================================
# APPENDIX A - Prompt Templates
# ============================================================
doc.add_heading('附录 A · Prompt 分类模板库（升级版）', level=1)

doc.add_heading('A.1 M 类模板 — D1 数据库迁移（V2.0 新增）', level=2)
add_para('Prompt [N] — D1 Schema 设计 + 种子数据', italic=True)
add_para('基于已有 localStorage Mock 数据结构，设计 Cloudflare D1（SQLite）数据库 Schema。')
add_para('要求：1）为每个数据实体创建独立的表 2）使用合理的字段类型和默认值 3）建立外键约束和索引 4）创建 seed.sql 导入已有 Mock 数据 5）创建 db-bridge.ts 兼容层，使前端代码无需修改。')

doc.add_heading('A.2 M 类模板 — 安全加固（V2.0 新增）', level=2)
add_para('Prompt [N] — P0 安全加固：Session Cookie + 密码哈希 + 限流', italic=True)
add_para('将现有的 token-based 认证升级为 Cookie-based Session 认证。要求：1）使用 Web Crypto API 实现 SHA-256+salt 密码哈希 2）创建 sessions 表存储会话 3）实现 requireAuth/requireAdmin/requireTeacher 中间件链 4）实现 IP 级登录限流 5）添加全局安全 Headers 6）创建审计日志记录。')

doc.add_heading('A.3 原有模板（F/P/C/D/S/E类）', level=2)
add_para('F类（基础）、P类（页面）、C类（组件）、D类（数据）、S类（样式）、E类（增强）的模板与 V1.0 相同，请参考 V1.0 文档。')

doc.add_page_break()

# ============================================================
# APPENDIX B - Questionnaire
# ============================================================
doc.add_heading('附录 B · 场景分析问卷模板', level=1)
add_para('（与 V1.0 相同，增加生产化相关问题）')
add_para('生产化追加问题：', bold=True)
prod_questions = [
    '预期用户规模（初期/1年后/3年后）？',
    '数据敏感度级别（可公开/内部使用/严格保密）？',
    '是否需要合规认证（等保/SOC2/GDPR）？',
    '预算范围（月度运营成本）？',
    '是否需要与现有系统集成（SSO/ERP/CRM）？',
    '是否需要电子签章（法大大/e签宝）？',
    '是否需要支付通道（银联/微信/支付宝）？',
]
for q in prod_questions:
    add_bullet(q)

doc.add_page_break()

# ============================================================
# APPENDIX C - Data Model
# ============================================================
doc.add_heading('附录 C · 数据模型标准字段对照表 ★升级：D1 Schema', level=1)
add_para('以下是中流通 D1 数据库的核心表字段对照：')

doc.add_heading('C.1 users 表（50条记录）', level=2)
user_fields = [
    ('id', 'TEXT PK', "'m-001', 't-001' 等"),
    ('phone', 'TEXT UNIQUE', '手机号（登录凭证）'),
    ('name', 'TEXT', '姓名'),
    ('password_hash', 'TEXT', '$sha256${salt}${hash} 或 $demo${password}'),
    ('role', 'TEXT', "'member' | 'teacher' | 'admin'"),
    ('status', 'TEXT', "'active' | 'inactive' | 'pending'"),
    ('company / industry / title / bio', 'TEXT', '学员档案信息'),
    ('cohort / class_id / class_name', 'TEXT', '班级归属'),
    ('class_ids', 'TEXT (JSON)', '老师负责的班级列表'),
    ('must_change_password', 'INTEGER', '0或1，强制改密标志'),
]
add_table_simple(['字段', '类型', '说明'], user_fields)

doc.add_heading('C.2 projects 表（31条记录，40+字段）', level=2)
project_fields = [
    ('基础', 'id, name, owner_id, industry, description'),
    ('融资参数', 'target_amount, raised_amount, revenue_share_rate, duration, recovery_multiple'),
    ('退出条件', 'annual_yield_rate, exit_mode, settlement_cycle'),
    ('份额', 'total_shares, raised_shares, share_price, min_shares'),
    ('企业主体', 'company_full_name, credit_code, legal_representative, registered_address...'),
    ('风控', 'loss_threshold_months, loss_threshold_amount'),
    ('收款', 'bank_account_name, bank_account_number, bank_name, bank_branch'),
    ('数据传输', 'data_transmit_mode, report_frequency, payment_mode'),
    ('展示', 'share_code, view_count, highlight_text, highlights, initiator_note'),
]
add_table_simple(['类别', '字段列表'], project_fields)

doc.add_page_break()

# ============================================================
# APPENDIX D - API Catalog ★NEW
# ============================================================
doc.add_heading('附录 D · API 接口完整清单 ★V2.0 新增', level=1)

doc.add_heading('D.1 认证接口（4个）', level=2)
auth_apis = [
    ('POST /api/login', '登录', '限流 + 密码验证 + Session创建 + Cookie设置'),
    ('POST /api/logout', '登出', '删除Session + 清除Cookie'),
    ('POST /api/self-register', '自助注册', '限流 + 状态pending + 待管理员审核'),
    ('GET /api/auth/me', '验证Session', '检查Cookie有效性 + 返回用户信息'),
]
add_table_simple(['端点', '功能', '说明'], auth_apis)

doc.add_heading('D.2 数据读取接口（18个）', level=2)
data_apis = [
    'GET /api/data/members — 成员列表',
    'GET /api/data/teachers — 老师列表',
    'GET /api/data/projects — 项目列表',
    'GET /api/data/projects/:id — 项目详情',
    'GET /api/data/contracts — 合同列表',
    'GET /api/data/contracts/project/:id — 项目的合同',
    'GET /api/data/revenue-reports — 收入报告',
    'GET /api/data/repayment-records — 回款记录',
    'GET /api/data/repayments — 回款汇总',
    'GET /api/data/referrals — 引荐记录',
    'GET /api/data/notifications — 通知列表',
    'GET /api/data/notifications/unread-count — 未读数',
    'GET /api/data/share-logs — 分享记录',
    'GET /api/data/share-code/:code — 分享码查项目',
    'GET /api/data/invite-codes — 邀请码列表',
    'GET /api/data/audit-logs — 审计日志',
    'GET /api/user-stats/:id — 用户投资统计',
    'GET /api/platform-stats — 平台总览统计',
]
for api in data_apis:
    add_bullet(api)

doc.add_heading('D.3 管理写入接口（13个）', level=2)
admin_apis = [
    'POST /api/admin/settlement/import — CSV分账导入（含批次创建、回款分配、合同更新、通知）',
    'POST /api/admin/members/batch-register — 批量注册学员',
    'POST /api/admin/projects/:id/review — 项目审核（通过/拒绝）',
    'POST /api/admin/projects/:id/participate — 投资参与（含乐观锁份额验证）',
    'POST /api/admin/contracts/:id/sign — 合同签署（双方独立签名）',
    'POST /api/admin/projects/create — 创建项目（40+字段）',
    'POST /api/admin/referrals/create — 创建引荐',
    'POST /api/admin/referrals/:id/handle — 处理引荐',
    'POST /api/admin/revenue-report/submit — 提交收入报告（含回款分配）',
    'POST /api/admin/invite-codes/generate — 生成邀请码',
    'POST /api/admin/contracts/:id/confirm-terms — 确认条款',
    'POST /api/admin/contracts/:id/approve — 审批合同',
    'POST /api/change-password — 修改密码（需Session + 手机尾号验证）',
]
for api in admin_apis:
    add_bullet(api)

doc.add_page_break()

# ============================================================
# APPENDIX E - Security Checklist ★NEW
# ============================================================
doc.add_heading('附录 E · 安全配置与审计清单 ★V2.0 新增', level=1)

security_checklist = [
    ('密码不明文存储', '✅', 'SHA-256 + 16位随机salt'),
    ('Session Cookie HttpOnly', '✅', '防 XSS 窃取'),
    ('Session 7天过期', '✅', '自动清理'),
    ('登录限流', '✅', 'IP级 5次/分钟'),
    ('安全Headers全套', '✅', 'HSTS/XSS/CSRF/CSP'),
    ('审计日志', '✅', '所有关键操作'),
    ('角色权限中间件', '✅', 'requireAuth/Admin/Teacher'),
    ('全局fetch拦截器', '✅', '401自动跳登录'),
    ('强制改密（首次登录）', '✅', '手机号验证 + 密码强度'),
    ('自助注册需审核', '✅', 'pending状态 + 管理员批准'),
    ('密码强度检测', '✅', '弱/中/强 实时反馈'),
    ('敏感操作二次确认', '✅', 'confirm模态框'),
]
add_table_simple(['检查项', '状态', '实现方式'], security_checklist)

doc.add_page_break()

# ============================================================
# VERSION HISTORY
# ============================================================
doc.add_heading('版本历史', level=1)
add_para('V1.0（2026-03-20）：初始版本，基于"一亿中流私董会"场景从 Prompt 1 到 Prompt 19C-2 的完整 Demo 实践提炼。涵盖定制化理论、SURM 场景分析框架、角色体系方法论、数据架构方法论（localStorage）、功能映射矩阵、UI 定制化规范、交互仪式感设计、社交裂变设计、响应式适配方法论、数据丰富度工程、演示引导体系、Demo 到生产路径规划、Prompt 工程方法论（含 33 个实际 Prompt 的完整序列）、快速启动清单、模板库。')

add_para('V2.0（2026-03-26）：全量升级版，基于"一亿中流私董会"场景从 Demo 到 Cloudflare D1 全量生产（V27）的完整实践。核心升级：', bold=True)
v2_changes = [
    '第五章完全重写：从 localStorage 到 D1 云数据库（13张表 + 4次migration + 三层数据访问架构）',
    '第十三章完全重写：6阶段演进路径（Demo → D1迁移 → API层 → 条款引擎 → 安全加固 → 生产部署）+ 技术栈选择依据 + API架构设计 + 前端可复用性实证',
    '第十四章大幅升级：新增 M类（Migration）和 O类（Operations）Prompt分类 + Phase 6 完整 Prompt 序列',
    '第十五章全量升级：版本演进全记录（V20-V27）+ 8条生产级关键经验',
    '新增第十六章：安全体系与生产运维（认证授权 + 安全Headers + 审计日志 + 缓存策略）',
    '新增附录D：34个API接口完整清单（认证4 + 数据读取18 + 管理写入13）',
    '新增附录E：安全配置与审计清单（12项安全检查全部✅）',
    '所有章节补充了中流通生产版的实际代码引用、API端点、数据库字段对照',
]
for ch in v2_changes:
    add_bullet(ch)

# ============================================================
# SAVE
# ============================================================
output_path = '/home/user/webapp/bible_v2.0.docx'
doc.save(output_path)
print(f'✅ Bible V2.0 generated: {output_path}')

import os
size = os.path.getsize(output_path)
print(f'📄 File size: {size:,} bytes ({size/1024:.1f} KB)')
