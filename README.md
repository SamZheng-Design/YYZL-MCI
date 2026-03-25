# 中流通 ZhongLiu Connect

一亿中流私董会学员专属的收入分成（RBF）投资协作平台。  
由滴灌通（Micro Connect）与一亿中流联合打造。

## 项目概览

- **名称**: 中流通 ZhongLiu Connect
- **目标**: 私域RBF协作平台，数据透明，分账体外执行，结果在平台展示
- **模式**: 投资人 → 第三方分账机构 → 融资方，分账结果推送至中流通平台
- **状态**: MVP 功能完整 (Phase 1~4 已完成)

## URLs

- **预览**: https://3000-i8ip8indu9123mne7hota-5634da27.sandbox.novita.ai
- **登录页**: /login
- **首页**: /
- **项目大厅**: /projects
- **项目详情**: /projects/:id
- **个人主页**: /profile
- **发起项目**: /create (3步骤表单)
- **合同签署**: /contracts/:id/sign
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

### 管理写入 API (10个)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/admin/settlement/import | CSV 分账导入 |
| POST | /api/admin/members/batch-register | 批量注册学员 |
| POST | /api/admin/projects/:id/review | 项目审核 |
| POST | /api/admin/projects/:id/participate | 参与投资 |
| POST | /api/admin/contracts/:id/sign | 合同签署 |
| POST | /api/admin/projects/create | 创建项目 |
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
> 首次登录会提示修改密码（可跳过）

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
├── guide.tsx        # 演示引导页
└── routes/          # 14个页面路由模块
    ├── login.tsx     # 登录 (密码+session cookie)
    ├── home.tsx      # 首页
    ├── projects.tsx  # 项目大厅
    ├── project-detail.tsx
    ├── create.tsx    # 发起项目 (3步骤表单)
    ├── contract-sign.tsx
    ├── repayments.tsx
    ├── investments.tsx
    ├── revenue-report.tsx  # 营收上报
    ├── admin.tsx     # 管理后台 (9个Tab)
    ├── teacher.tsx   # 老师工作台
    ├── profile.tsx   # 个人主页 + 改密
    ├── share.tsx
    └── notifications.tsx

migrations/
└── 0001_initial_schema.sql  # D1 数据库 DDL (13表)

seed.sql                      # Demo 数据 (484行)
wrangler.jsonc               # Cloudflare 配置
ecosystem.config.cjs         # PM2 配置
```

## 代码规模

| 分类 | 行数 |
|------|------|
| TypeScript/TSX 源码 | ~15,100 |
| SQL (migration+seed) | ~780 |
| API 端点总数 | 31 |
| 页面路由 | 14 |
| 打包大小 (dist/_worker.js) | ~638 KB |

## 待开发功能 (远期路线图)

### Phase 5 — 生产部署 (需用户操作)
1. 在 Deploy 标签页配置 Cloudflare API Token
2. 创建生产 D1 数据库 (`npx wrangler d1 create zhongliu-production`)
3. 运行生产迁移 + seed
4. 部署到 Cloudflare Pages
5. (可选) 绑定自定义域名

### Phase 6 — 外部集成 (远期)
- [ ] 第三方分账机构 Webhook API
- [ ] 短信验证码 (阿里云 SMS)
- [ ] 电子签章 (法大大/e签宝)
- [ ] 文件上传 (合同附件等, Cloudflare R2)

## 部署

- **平台**: Cloudflare Pages
- **数据库**: Cloudflare D1 (zhongliu-production)
- **状态**: MVP 完整, 待部署至生产环境
- **最后更新**: 2026-03-25

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
