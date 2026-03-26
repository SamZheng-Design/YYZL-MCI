# 中流通 ZhongLiu Connect

一亿中流私董会学员专属的收入分成（RBF）投资协作平台。  
由滴灌通（Micro Connect）与一亿中流联合打造。

## 项目概览

- **名称**: 中流通 ZhongLiu Connect
- **目标**: 私域RBF协作平台，数据透明，分账体外执行，结果在平台展示
- **模式**: 投资人 → 第三方分账机构 → 融资方，分账结果推送至中流通平台
- **状态**: **已上线** ✅ (Phase 1~5 + V22 条款通 + V23 P0升级 + V24 AI助理 + V25/V25.1 视觉升级 + 生产部署 + 方案C改密)

## URLs

- **生产环境**: https://zhongliutong.net (自定义域名)
- **生产环境(www)**: https://www.zhongliutong.net
- **Pages域名**: https://zhongliu-connect.pages.dev
- **登录页**: /login
- **首页**: /
- **项目大厅**: /projects
- **项目详情**: /projects/:id
- **个人主页**: /profile
- **发起项目**: /create (4步骤表单: 基本信息→条款→企业信息→预览)
- **条款通**: /contracts/:id/terms (滑块联动、退出条件确认、审批流)
- **合同签署**: /contracts/:id/sign (审批通过后才可签署)
- **回款中心**: /repayments (双Tab: 我的投资+我的发起)
- **投资详情**: /investments/:contractId
- **营收上报**: /initiated/:projectId/report
- **管理后台**: /admin (仅管理员可访问, 9个Tab)
- **老师工作台**: /teacher
- **通知中心**: /notifications
- **分享码跳转**: /share/:code

## 架构演进记录

### Phase 1 — D1 数据持久化 + 认证重构 (2026-03-25)

**核心变化：从 localStorage + Mock 数据 → Cloudflare D1 云端数据库**

- **13张表**: users, projects, project_investors, contracts, settlement_batches, settlement_records, repayment_details, referrals, notifications, invite_codes, share_logs, audit_logs, sessions
- **Seed**: 50名用户, 31个项目, 47份合同, 103条分账, 111条回款
- 登录改为"手机号+密码"认证，从 D1 验证

### Phase 2A — 路由迁移 + 管理后台写入 (2026-03-25)

- 12个页面路由从 mock 数据切换到 D1 SSR 注入
- 管理员 CSV 分账导入 (settlement_batches + settlement_records + repayment_details)
- 8个管理写入 API (分账导入、批量注册、项目审核、参与投资、合同签署、项目创建、引荐创建)

### Phase 2B — 前端写操作迁移 (2026-03-25)

- 全部前端写操作从 localStorage → D1 API
- 项目创建、投资参与、合同签署、引荐请求 — 全部通过 API 持久化

### Phase 2C — localStorage 数据依赖清理 (2026-03-25)

- localStorage 数据读取从 38 处降至 2 处（仅登出清理）
- 新增 7 个 API 端点: 浏览量追踪、教师推荐、通知已读、合同详情、引荐状态、营收上报
- revenue-report.tsx 上报全部走 D1 API (settlement_records + repayment_details)

### Phase 3A+3B — 管理后台增强 + KPI (2026-03-25)

- 管理后台新增 3 个 Tab: 项目审核、邀请码管理、审计日志
- KPI 概览卡片从占位数字 → D1 聚合实时数据
- 最近动态从硬编码 → 审计日志 API 实时获取
- 新增 API: 邀请码生成、邀请码列表、审计日志列表

### Phase 4 — 认证增强 (2026-03-25)

- **Session 管理**: 登录创建 D1 session + Set-Cookie (HttpOnly, 7天有效)
- **首次改密**: 检测 `$demo$` 密码，弹出强制修改密码弹窗
- **用户改密**: /api/change-password (SHA-256+salt 存储)
- **管理员重置**: /api/admin/reset-password (生成临时密码)
- **登出**: /api/logout (清除 D1 session + 清除 cookie)
- **Navbar**: 登出/切换调用 API；铃铛未读数从 D1 API 实时获取
- **Profile**: 新增「修改密码」菜单项
- 移除 GlobalScripts 中 mock 数据 localStorage 种子注入

### V22 — 条款通 (Terms Connect) (2026-03-25)

**核心变更：引入「条款通」滑块联动确认 + 审批流 + 四步项目创建表单**

#### 新增页面
- **条款通** `/contracts/:id/terms`
  - 融资额 ↔ 分成比例 等比滑块联动（锚点 k = 融资额/分成比例）
  - 退出条件可视化卡片（期限到期 / 封顶倍数 / 双条件先到为准）
  - 实时计算面板（每月预估分成、回本月数、回收上限、等效封顶倍数）
  - 简明大白话摘要（"简单来说"）
  - 审批状态横幅（draft → pending_approval → approved/rejected）

#### 新增 API（3个）
- `POST /api/admin/contracts/:id/confirm-terms` — 投资人确认条款
- `POST /api/admin/contracts/:id/approve` — 班主任审批（approve/reject）
- `POST /api/admin/contracts/:id/send-to-esign` — 电子签约桩接口

#### 数据库升级（migration 0003）
- **projects 表新增 20 列**: 企业主体（company_full_name, credit_code, registered_address, legal_representative 等）、退出条件（annual_yield_rate, exit_mode）、风控阈值、数据传输模式、收款银行信息
- **contracts 表新增 11 列**: annual_yield_rate, exit_mode, end_date, cap_multiple_at_term, approval_status, approved_by/at/note, terms_confirmed_at, esign_url/status

#### 项目创建表单升级
- 从 3 步扩展为 4 步: ① 基本信息 → ② 条款与退出 → ③ 企业+银行 → ④ 预览
- 新增年化收益率滑块（8%~24%，默认12%）
- 新增退出条件选择（期限到期/封顶倍数/先到为准）
- 新增风控阈值（连续亏损月数/金额）
- 新增企业主体信息（全称、信用代码、法人、注册地址等）
- 新增收款银行信息

#### 合同签署页升级
- 新增审批状态门禁（draft/pending_approval → 跳转条款通；rejected → 重新修改）
- approved 状态显示绿色横幅后才允许签署

#### 合同模板升级
- 完整联合经营协议 HTML（含甲方企业信息、信用代码、退出条件条款）
- 退出条件根据 exit_mode 动态生成（期限到期 / 封顶倍数 / 双条件先到为准）
- 封顶公式：联营资金 × (1 + 年收益率 ÷ 360 × 联营天数)

#### 业务流程
```
会员认购项目
  → 跳转条款通 /contracts/:id/terms
  → 三维滑块调整融资额/分成比例/合作期限（金额↔比例等比联动）
  → 确认条款（approval_status: draft → pending_approval）
  → 通知班主任审批
  → 班主任审批（approved / rejected）
  → 通过后跳转合同签署 /contracts/:id/sign
```

### V23 — 条款通 P0 升级 (2026-03-25)

**核心变更：三滑块联动 + RBF公式Hero Card + IRR计算 + 弹窗优化**

#### 条款通升级
- **RBF 核心公式 Hero Card**: 页面顶部黑色卡片展示公式
  - `月回款 = 月收入 × 分成%`
  - `封顶 = 融资额 × (1 + 年化率 × 期限/12)`
- **三维滑块联动**: 融资额(红) ↔ 分成比例(蓝) 等比联动 + 合作期限(绿)独立调整
  - 期限范围: 项目期限的50%~150%（最小6个月、最大60个月）
  - 期限变化实时影响封顶倍数和 IRR
- **IRR 计算引擎**: 牛顿迭代法计算预估年化内部收益率
  - 暗色 IRR 展示面板（年化IRR、投资总回报、净利润）
  - 在"简单来说"摘要中也展示 IRR 数据
- **confirm-terms API 升级**: 支持 `cooperationTerm` 参数，投资人可自定义合作期限

#### 弹窗/引导系统审视
- 首次登录密码弹窗：保留，增加 Enter 键提交 + 自动聚焦
- Onboarding 三页轮播：保留不变
- Coach Mark 聚焦气泡：保留定义
- Smart Nudge 提示条：保留不变（3处使用）
- FAQ 帮助面板：保留不变

### V24 — AI 智能助理浮窗 (2026-03-25)

**核心变更：全局 AI 助理浮窗，上下文感知、角色区分、术语解释、智能建议**

#### 功能模块
- **浮动按钮**: 右下角红色渐变圆形按钮（SVG 麦克风图标），首次使用弹跳动画提醒
- **半屏面板**: 底部滑出，24px 圆角，最高 72vh，含拖动手柄
- **页面解释**: 15 个路由 × 3 种角色 = 45 套上下文说明文案
- **推荐操作**: 基于当前页面和用户角色的快捷操作按钮（导航、筛选、滚动定位）
- **智能建议**: 基于页面 DOM 状态的动态建议（如"还没有投资项目"、"试试调整筛选"）
- **术语卡片**: 12 个 RBF 核心术语的白话解释（RBF、分成比例、封顶倍数、IRR、回收率等）
- **FAQ 匹配**: 10 个常见问题的关键词匹配回答引擎
- **搜索输入框**: 输入关键词搜索术语或 FAQ
- **角色区分**: 学员看投资建议、老师看班级管理提醒、管理员看运营摘要

#### 技术实现
- **纯前端**: 无外部 AI 调用，文案全部预置在代码中
- **零依赖**: 无新增 CSS/JS 库，使用内联 CSS
- **渲染器级集成**: 通过 `renderer.tsx` 注入，自动出现在所有页面
- **登录页隔离**: `/login` 路径自动跳过初始化
- **体积影响**: +49 KB（749KB → 798KB），远低于 CF 10MB 限制

#### 文件
- `src/ai-assistant.tsx` — AI 助理组件（JS 逻辑 + CSS 导出）
- `src/renderer.tsx` — 引入 AI 助理 CSS 和 Script

## API 端点清单

### 认证 API
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/login | 手机号+密码登录, 返回 session cookie |
| POST | /api/logout | 登出, 清除 session |
| POST | /api/change-password | 用户改密 |
| POST | /api/admin/reset-password | 管理员重置用户密码 |

### 数据查询 API (18个)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/data/members | 全部学员 |
| GET | /api/data/teachers | 全部老师 |
| GET | /api/data/projects | 全部项目 |
| GET | /api/data/projects/:id | 单个项目详情 |
| GET | /api/data/contracts | 全部合同 |
| GET | /api/data/contracts/project/:id | 项目合同 |
| GET | /api/data/contracts/:id | 单个合同详情 |
| GET | /api/data/revenue-reports | 分账记录 |
| GET | /api/data/repayment-records | 回款明细 |
| GET | /api/data/repayments | 简化回款列表 |
| GET | /api/data/referrals | 引荐记录 |
| GET | /api/data/notifications | 通知列表 |
| GET | /api/data/notifications/unread-count | 未读通知数 |
| GET | /api/data/share-logs | 分享记录 |
| GET | /api/data/share-code/:code | 分享码查询 |
| GET | /api/data/invite-codes | 邀请码列表 |
| GET | /api/data/audit-logs | 审计日志列表 |
| GET | /api/platform-stats | 平台统计 |
| GET | /api/user-stats/:id | 用户投资统计 |

### 管理写入 API (13个)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/admin/settlement/import | CSV 分账导入 |
| POST | /api/admin/members/batch-register | 批量注册学员 |
| POST | /api/admin/projects/:id/review | 项目审核 |
| POST | /api/admin/projects/:id/participate | 参与投资 |
| POST | /api/admin/contracts/:id/sign | 合同签署 |
| POST | /api/admin/contracts/:id/confirm-terms | 投资人确认条款（V22） |
| POST | /api/admin/contracts/:id/approve | 班主任审批合同（V22） |
| POST | /api/admin/contracts/:id/send-to-esign | 电子签约桩接口（V22） |
| POST | /api/admin/projects/create | 创建项目（含企业+银行信息） |
| POST | /api/admin/referrals/create | 发起引荐请求 |
| POST | /api/admin/invite-codes/generate | 生成邀请码 |
| POST | /api/admin/projects/:id/recommend | 教师推荐项目 |
| POST | /api/admin/revenue-report/submit | 营收上报 |

### 用户操作 API (3个)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/projects/:id/view | 项目浏览量+1 |
| POST | /api/notifications/:id/read | 标记通知已读 |
| POST | /api/referrals/:id/handle | 处理引荐请求 |

## Demo 账号

| 手机号 | 姓名 | 角色 | 密码 |
|--------|------|------|------|
| 13800001111 | 张明远 | 学员(第12期) | zhongliu2026 |
| 13800002222 | 李芳华 | 学员(第12期) | zhongliu2026 |
| 13800003333 | 王建国 | 学员(第14期) | zhongliu2026 |
| **18000000000** | **管理员** | **admin** | **zhongliu2026** |
| 18011111111 | 刘老师 | teacher | zhongliu2026 |
| 18022222222 | 陈老师 | teacher | zhongliu2026 |

> 所有 demo 账号密码统一为 `zhongliu2026`  
> **首次登录流程（方案C）**:  
> 1. 用手机号 + 默认密码登录  
> 2. 弹出身份验证弹窗 → 输入手机号后4位  
> 3. 验证通过后设置新密码（不能与默认密码相同）  
> 4. 完成后自动进入平台，后续用新密码登录

## 数据架构

### 数据库表结构 (Cloudflare D1)

| 表 | 说明 | 记录数(seed) |
|----|------|-------------|
| users | 用户(学员+老师+管理员) | 50 |
| projects | 项目 | 31 |
| project_investors | 项目-投资人关联 | ~90 |
| contracts | 合同 | 47 |
| settlement_batches | 分账批次 | — |
| settlement_records | 分账记录 | 103 |
| repayment_details | 回款明细 | 111 |
| referrals | 引荐 | 9 |
| notifications | 通知 | 28 |
| invite_codes | 邀请码 | — |
| share_logs | 分享记录 | 20 |
| audit_logs | 审计日志 | — |
| sessions | 用户会话 | — |

### 数据流向

```
                     ┌─────────────┐
                     │ 第三方分账   │
                     │ 机构 (体外)  │
                     └──────┬──────┘
                            │ CSV/API 推送分账结果
                            ▼
┌────────────────────────────────────────┐
│           中流通平台 (体内)              │
│                                        │
│  管理员导入CSV → settlement_batches     │
│                → settlement_records     │
│                → repayment_details      │
│                → 更新 contracts.total_   │
│                  repaid                 │
│                                        │
│  融资方: 上报营收、查看分账结果           │
│  投资方: 查看回款明细、收益图表          │
│  老师: 管理班级、处理引荐               │
│  管理员: 全面数据管理+KPI监控            │
└────────────────────────────────────────┘
```

## 技术栈

- **框架**: Hono + TypeScript + JSX (SSR)
- **数据库**: Cloudflare D1 (SQLite, --local 开发模式)
- **部署目标**: Cloudflare Pages (wrangler)
- **认证**: 密码($demo$ / $sha256$+salt) + D1 Session + HttpOnly Cookie
- **样式**: Tailwind CSS + 自定义 CSS
- **图标**: FontAwesome 6.4 (CDN)
- **字体**: Inter + Montserrat + Noto Sans SC
- **交互**: 原生 JavaScript (无框架)
- **图表**: SVG圆环 + 纯CSS柱状图
- **动画**: CSS @keyframes + IntersectionObserver

## 项目结构

```
src/
├── index.tsx        # Hono 入口 + API 路由 (D1)
├── admin-api.ts     # 管理后台写入 API
├── renderer.tsx     # JSX 渲染器
├── types.ts         # D1 类型定义
├── db.ts            # 数据库访问层 (密码哈希/验证/CRUD/统计)
├── db-bridge.ts     # D1 → camelCase 桥接层
├── data.ts          # 历史 Mock 数据 (渐进废弃中)
├── components.tsx   # 全局组件 (Navbar/TabBar/AuthCheck/Toast等)
├── ai-assistant.tsx # AI 智能助理浮窗 (V24)
├── guide.tsx        # 演示引导页
└── routes/          # 14个页面路由模块
    ├── login.tsx     # 登录 (密码+session cookie)
    ├── home.tsx      # 首页
    ├── projects.tsx  # 项目大厅
    ├── project-detail.tsx
    ├── create.tsx    # 发起项目 (4步骤: 基本→条款→企业→预览)
    ├── terms-connect.tsx  # 条款通 (滑块联动+审批流) [V22]
    ├── contract-sign.tsx  # 合同签署 (含审批门禁)
    ├── repayments.tsx
    ├── investments.tsx
    ├── revenue-report.tsx  # 营收上报
    ├── admin.tsx     # 管理后台 (9个Tab)
    ├── teacher.tsx   # 老师工作台
    ├── profile.tsx   # 个人主页 + 改密
    ├── share.tsx
    └── notifications.tsx

migrations/
├── 0001_initial_schema.sql  # D1 数据库 DDL (13表)
├── 0002_rate_limits.sql     # 登录限流表
└── 0003_contract_terms_upgrade.sql  # 条款通字段升级 (V22)

seed.sql                      # Demo 数据 (484行)
wrangler.jsonc               # Cloudflare 配置
ecosystem.config.cjs         # PM2 配置
```

## 代码规模

| 分类 | 行数 |
|------|------|
| TypeScript/TSX 源码 | ~19,700 |
| SQL (migration+seed) | ~850 |
| API 端点总数 | 34 |
| 页面路由 | 15（含条款通） |
| AI 助理知识库 | 45 套页面上下文 + 12 术语 + 10 FAQ |
| 打包大小 (dist/_worker.js) | ~847 KB |

## 待开发功能 (远期路线图)

### Phase 5 — 生产部署 ✅ (2026-03-26)
- ✅ Cloudflare D1 生产数据库 `zhongliu-production` (ID: 887cd767-4078-4332-83cc-e1b4f0531673)
- ✅ 3个迁移文件已执行 + 种子数据已导入 (49用户, 30项目, 46合同, 110回款)
- ✅ 部署到 Cloudflare Pages (项目名: zhongliu-connect)
- ✅ D1 绑定到 Pages 项目 (binding: DB)
- ✅ 自定义域名 zhongliutong.net + www.zhongliutong.net (CNAME → zhongliu-connect.pages.dev)
- ✅ SSL 证书自动配置

### V26 — 方案C首次登录安全验证 (2026-03-26)
- **首次登录两步验证**: Step1 手机尾号验证 → Step2 设置新密码
- **密码强度检测**: 实时显示弱/中/强
- **密码显示切换**: 眼睛图标显示/隐藏密码
- **防暴力破解**: 最多5次尾号验证机会
- **新密码限制**: 不能与默认密码相同
- **后端双验证**: 前端校验 + API 端也校验手机尾号
- **批量注册升级**: 每个学员独立密码（不再共享）
- **密码列表下载**: 注册成功后弹出密码表格 + CSV下载 + 一键复制

### V25 — 视觉体验升级 (2026-03-26)

**登录页升级:**
- Canvas 粒子背景动画（40个粒子 + 连线效果）
- 3 个浮动光晕球体（radial gradient + float animation）
- 角色卡片 3D 抬升效果 + 金色边缘微光（shimmer）
- 快捷账号行 stagger 滑入动画
- 输入框聚焦时金色光晕
- 登录按钮呼吸脉冲
- 玻璃卡片网格纹理

**全局微交互:**
- 按钮点击涟漪效果（Material Design ripple）
- 数字计数动画增强（bounce + flash）
- 页面进入动画升级（scale + fade）
- 进度条尾部发光脉冲
- 状态徽章（募集中）微脉冲
- 快速操作卡片渐变流动
- Tab 切换图标弹跳
- 通知铃铛摇晃动画
- 项目卡片箭头 hover 位移

**AI 助手升级:**
- 打字机效果回答（逐字输出）
- "思考中"动画指示器
- 建议按钮 stagger 滑入
- 输入框聚焦呼吸光晕
- 发送按钮 hover 旋转
- FAB 按钮外环脉冲
- 术语卡片弹性入场动画
- 提示卡片反弹动画

**技术指标:**
- Bundle 增长: +37KB (798KB → 835KB), 仍远在 10MB 限制内
- 纯 CSS 动画为主，Canvas 仅用于登录页粒子

### V25.1 — 首页视觉打磨 + AI助手交互增强 (2026-03-26)

**首页视觉打磨:**
- 欢迎卡片渐变背景（白→浅红→浅橙）+ 浮动光晕装饰球
- 时间感知装饰图标（🌅上午/☀️下午/🌙晚上）
- 分享码输入框聚焦边框高亮 + 阴影
- 统计卡片升级：emoji 图标 + IntersectionObserver 交错入场 + hover 抬升
- 项目卡片顶部渐变线条（hover 时显示红→金流动线）
- "查看全部"链接 hover 位移 + 箭头弹跳
- 回款动态区域：Live 绿色脉冲圆点 + 行 hover 高亮 + 金额缩放
- 回款列表自动滚动 ticker（3秒循环，hover 暂停）

**AI 助手交互增强:**
- 术语卡片折叠/展开：点击标题头部可收起术语内容，chevron 旋转动画
- 动态建议按钮滑入动画（stagger 延迟 + 缩放 + 平移）
- FAB 浮动球空闲时微浮动动画（4秒缓动上下）
- 面板头部 avatar 光晕脉冲
- 页面说明文字淡入动画

**技术指标:**
- Bundle: 847KB (+12KB)，纯 CSS 动画新增约 150 行
- 全部 11 个核心页面返回 HTTP 200，无回归
- 无外部动画库依赖

### Phase 6 — 外部集成 (远期)
- [ ] 第三方分账机构 Webhook API
- [ ] 短信验证码 (阿里云 SMS)
- [ ] 电子签章 (法大大/e签宝)
- [ ] 文件上传 (合同附件等, Cloudflare R2)

## 部署

- **平台**: Cloudflare Pages (zhongliu-connect)
- **数据库**: Cloudflare D1 (zhongliu-production, ID: 887cd767-4078-4332-83cc-e1b4f0531673)
- **域名**: zhongliutong.net + www.zhongliutong.net
- **状态**: ✅ **已上线** — MVP + V22~V26 全部完成
- **月度成本**: $0 (Cloudflare 免费额度)
- **最后更新**: 2026-03-26 (V26 方案C首次登录安全验证 + 生产部署)

## 本地开发

```bash
# 安装依赖
npm install

# 初始化本地数据库
npx wrangler d1 migrations apply zhongliu-production --local
npx wrangler d1 execute zhongliu-production --local --file=./seed.sql

# 构建 + 启动
npm run build
pm2 start ecosystem.config.cjs

# 访问
open http://localhost:3000
```
