# 中流通 ZhongLiu Connect

一亿中流私董会学员专属的收入分成（RBF）投资协作平台。  
由滴灌通（Micro Connect）与一亿中流联合打造。

## 项目概览

- **名称**: 中流通 ZhongLiu Connect
- **目标**: 私域RBF协作平台，数据透明，分账体外执行，结果在平台展示
- **模式**: 投资人→第三方分账机构→融资方，分账结果推送至中流通平台

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
- **管理后台**: /admin (仅管理员可访问)
- **老师工作台**: /teacher
- **分享码跳转**: /share/:code

## 架构演进记录

### Phase 1 — D1 数据持久化 + 认证重构 ✅ (2026-03-25)

**核心变化：从 localStorage + Mock 数据 → Cloudflare D1 云端数据库**

#### 数据库层
- **13张表**: users, projects, project_investors, contracts, settlement_batches, settlement_records, repayment_details, referrals, notifications, invite_codes, share_logs, audit_logs, sessions
- **Migration**: `migrations/0001_initial_schema.sql` (51条DDL命令)
- **Seed**: `seed.sql` (484行) — 从原 data.ts 完整迁移
  - 43名学员 + 6名老师 + 1名管理员
  - 30个项目 + 46份合同
  - 101条分账记录 + 110条回款明细
  - 8条引荐 + 21条通知

#### 新增文件
| 文件 | 作用 |
|------|------|
| `src/types.ts` | 统一 TypeScript 类型定义，1:1 映射 D1 schema |
| `src/db.ts` | D1 数据库访问层（密码验证、CRUD、统计查询） |
| `src/db-bridge.ts` | D1 → camelCase 桥接层（让前端路由无缝切换数据源） |

#### API 重构
- `/api/login` → 从 D1 验证密码（支持 `$demo$` 和 `$sha256$` 双模式）
- `/api/members` → 从 D1 读取活跃学员
- `/api/projects` → 从 D1 读取项目列表（含投资人关联）
- `/api/user-stats/:id` → 从 D1 计算用户统计

#### 新增数据 API（18个端点）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/data/members | 全部学员（camelCase） |
| GET | /api/data/teachers | 全部老师 |
| GET | /api/data/projects | 全部项目 |
| GET | /api/data/projects/:id | 单个项目详情 |
| GET | /api/data/contracts | 全部合同 |
| GET | /api/data/contracts/project/:id | 项目合同 |
| GET | /api/data/revenue-reports | 分账记录 |
| GET | /api/data/repayment-records | 回款明细 |
| GET | /api/data/repayments | 简化回款列表 |
| GET | /api/data/referrals | 引荐记录 |
| GET | /api/data/notifications | 通知列表 |
| GET | /api/data/share-logs | 分享记录 |
| GET | /api/data/share-code/:code | 分享码查询 |
| GET | /api/platform-stats | 平台统计 |

#### 登录页重构
- 从"手机号+验证码(888888)"改为"手机号+密码"
- 快速登录按钮改为通过 API 验证（不再前端硬编码）
- 密码存储：`$demo$zhongliu2026`（demo模式）

### V1.0 ~ V1.7 (UI/UX) — 已完成

详见下方功能列表。

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

## 数据架构

### 数据库表结构 (Cloudflare D1)

| 表 | 说明 | 记录数(seed) |
|----|------|-------------|
| users | 用户(学员+老师+管理员) | 50 |
| projects | 项目 | 30 |
| project_investors | 项目-投资人关联 | ~90 |
| contracts | 合同 | 46 |
| settlement_batches | 分账批次 | — |
| settlement_records | 分账记录 | 101 |
| repayment_details | 回款明细 | 110 |
| referrals | 引荐 | 8 |
| notifications | 通知 | 21 |
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
│  融资方: 查看分账结果、项目状态          │
│  投资方: 查看回款明细、收益图表          │
└────────────────────────────────────────┘
```

## 技术栈

- **框架**: Hono + TypeScript + JSX (SSR)
- **数据库**: Cloudflare D1 (SQLite, --local 开发模式)
- **部署**: Cloudflare Pages (wrangler)
- **样式**: Tailwind CSS + 自定义 CSS
- **图标**: FontAwesome 6.4 (CDN)
- **字体**: Inter + Montserrat + Noto Sans SC
- **交互**: 原生 JavaScript
- **图表**: SVG圆环 + 纯CSS柱状图
- **动画**: CSS @keyframes + IntersectionObserver

## 项目结构

```
src/
├── index.tsx        # Hono 入口 + API 路由 (D1)
├── renderer.tsx     # JSX 渲染器
├── types.ts         # D1 类型定义
├── db.ts            # 数据库访问层
├── db-bridge.ts     # D1 → camelCase 桥接层
├── data.ts          # Mock 数据 (SSR 兼容层，将渐进废弃)
├── components.tsx   # 全局组件
├── guide.tsx        # 引导页
└── routes/          # 14个页面路由模块
    ├── login.tsx     # 登录 (已重构→密码认证)
    ├── home.tsx      # 首页
    ├── projects.tsx  # 项目大厅
    ├── project-detail.tsx
    ├── create.tsx    # 发起项目
    ├── contract-sign.tsx
    ├── repayments.tsx
    ├── investments.tsx
    ├── revenue-report.tsx
    ├── admin.tsx     # 管理后台
    ├── teacher.tsx   # 老师工作台
    ├── profile.tsx
    ├── share.tsx
    └── notifications.tsx

migrations/
└── 0001_initial_schema.sql  # D1 数据库 DDL

seed.sql                      # Demo 数据
wrangler.jsonc               # Cloudflare 配置
ecosystem.config.cjs         # PM2 配置
```

## 待开发功能 (MVP 路线图)

### Phase 2 — 写入操作 + SSR 迁移
- [ ] 管理员创建项目 → 写入 D1
- [ ] 学员参与项目 → 写入 project_investors + contracts
- [ ] 合同签署 → 更新 contracts
- [ ] 分账数据 CSV 导入 → settlement_batches/records + repayment_details
- [ ] 前端 SSR 从 data.ts → D1 读取（渐进式）

### Phase 3 — 管理后台增强
- [ ] CSV 上传预览 + 确认导入分账数据
- [ ] 项目审核工作流（待审核→通过/驳回）
- [ ] 邀请码管理（生成、发放、查看使用状态）
- [ ] 平台数据大盘（图表）
- [ ] 审计日志查看

### Phase 4 — 认证增强
- [ ] 首次登录强制修改密码
- [ ] Session 管理（D1 sessions 表）
- [ ] 密码重置功能

### Phase 5 — 外部集成（远期）
- [ ] 第三方分账机构 Webhook API
- [ ] 短信验证码（阿里云SMS）
- [ ] 电子签章（法大大/e签宝）

## 部署

- **平台**: Cloudflare Pages
- **数据库**: Cloudflare D1 (zhongliu-production)
- **状态**: 开发中 (Phase 1 完成)
- **最后更新**: 2026-03-25
