# 滴灌通产品定制化 Bible V2.1
## 完整版 · 可复现级别

> **版本**: V2.1 (深度升级版)  
> **日期**: 2026-03-26  
> **基线产品**: 中流通 V27 (22,000+ 行生产级代码)  
> **目的**: 上传本文档 + 描述任何场景 → 输出一套完整 Prompts → 在 GenSpark 全栈模式直接构建同等水平应用

---

## 第一章：定位与使用方法

### 1.1 本文档是什么
这是一份**产品定制化的完整方法论和技术蓝图**，从中流通 V27 的生产代码中提炼而来。它不是概念文档，而是可直接指导开发的**工程圣经**。

### 1.2 使用流程
1. 上传本 Bible V2.1 文档
2. 描述你的目标场景（行业、角色、核心功能）
3. AI 根据本文档生成一套完整的 Prompt 序列
4. 在 GenSpark 全栈模式中依次执行 Prompt
5. 购买域名 → 部署到 Cloudflare Pages → 上线

### 1.3 核心原则（7 条）
1. **场景优先**: 每个功能必须服务于场景中的具体角色需求
2. **数据即资产**: D1 数据库 + 审计日志 = 所有操作可追溯
3. **安全即产品**: Session + Cookie + 中间件 = 三层安全体系
4. **仪式感设计**: 关键节点（签署、回款、注册）必须有视觉庆典
5. **渐进式引导**: 新用户 Onboarding + Coach Mark + Smart Nudge
6. **多端适配**: 480px 手机 → 680px 平板 → 1200px 桌面，三套布局
7. **Demo → Production**: 所有功能先 Demo 可用，再平滑迁移到生产

---

## 第二章：九通理论 → 场景通 映射方法论

### 2.1 九通定义（从抽象到具体）

| 通 | 抽象定义 | 中流通具体实现 | 对应源文件 |
|---|---|---|---|
| **账通** | 用户身份与认证 | 手机号+密码登录、Session Cookie鉴权、角色分离(member/teacher/admin)、首次登录强制改密 | login.tsx, middleware.ts, db.ts(hashPassword/verifyPassword) |
| **项通** | 核心业务对象管理 | 项目发起→审核→募资→运营→完成 完整生命周期 | create.tsx, projects.tsx, project-detail.tsx, admin-api.ts |
| **合通** | 交易契约管理 | 认购→条款联动→班主任审批→双方签署→电子签约(桩) 全流程 | terms-connect.tsx, contract-sign.tsx, admin-api.ts |
| **款通** | 资金流转追踪 | CSV导入分账→按合同比例分配→累计回款→回收进度→回本庆祝 | repayments.tsx, investments.tsx, admin-api.ts(settlement/import) |
| **荐通** | 社交关系网络 | 学员→老师引荐请求→老师对接/暂缓→通知闭环 | project-detail.tsx(referral), teacher.tsx, admin-api.ts(referrals) |
| **知通** | 消息推送系统 | 7种通知类型(review/participation/repayment/referral/system/settlement/share) + 实时未读计数 | notifications.tsx, admin-api.ts(notifications), db.ts(createNotification) |
| **析通** | 数据分析展示 | 平台KPI + 个人投资统计 + 回收率仪表盘 + 趋势柱状图 | home.tsx, investments.tsx, admin.tsx, db.ts(platformStats/userInvestmentStats) |
| **治通** | 平台治理与管控 | 管理员后台(9个Tab) + 学员管理 + 班级管理 + 项目审核 + 分账导入 + 审计日志 | admin.tsx, admin-api.ts |
| **享通** | 传播与分享 | 6位分享码 + 一键复制(链接/文字/代码) + 微信分享卡 + 分享日志 | project-detail.tsx(share), share.tsx |

### 2.2 场景化改造方法（SURM 框架）
对任何新场景，依次分析：
- **S (Stakeholders)**: 列出所有利益相关方及其角色（对应 users 表的 role 字段）
- **U (User Journeys)**: 画出每个角色的核心使用旅程（对应路由文件）
- **R (Relationships)**: 定义角色间的关系链（对应 referrals, contracts, project_investors 表）
- **M (Medium)**: 确定信息媒介和传播方式（对应 notifications, share_logs 表）

---

## 第三章：角色系统深度定制

### 3.1 中流通的三角色体系

#### 角色 1: member (学员/投资人)
- **可访问页面**: /, /projects, /projects/:id, /create, /repayments, /investments/:id, /contracts/:id/terms, /contracts/:id/sign, /profile, /notifications, /share/:code
- **核心能力**: 浏览项目 → 认购份额 → 确认条款 → 签署合同 → 查看回款 → 请求引荐 → 分享项目
- **数据权限**: 只能看到自己参与的合同和回款记录
- **导航**: 底部 TabBar (首页/项目大厅/+发起/回款/我的)

#### 角色 2: teacher (老师/班主任)
- **可访问页面**: /teacher, /projects, /projects/:id, /create, /repayments, /profile, /notifications
- **核心能力**: 查看班级学员 → 处理引荐请求 → 审批合同 → 推荐项目
- **数据权限**: 只能看到自己负责班级的学员和相关数据
- **导航**: 底部 TabBar (我的班级/项目大厅/+发起/回款/我的)

#### 角色 3: admin (管理员)
- **可访问页面**: /admin, /profile
- **核心能力**: 全平台管理 → 学员注册 → 班级管理 → 项目审核 → 分账导入 → 邀请码 → 审计日志 → 密码重置
- **数据权限**: 全量数据
- **导航**: 底部 TabBar 隐藏，使用 admin 专属 Tab 导航

### 3.2 角色切换机制
- **Demo 模式**: 登录页有角色卡片快速切换（DEMO_ACCOUNTS 硬编码）
- **Session 隔离**: 每个角色独立 Session，Cookie 名 zlc_session
- **localStorage 双存**: zlc_user（原始登录用户）+ zlc_current_user（当前角色视图）
- **页面守卫**: AuthCheckScript 在每个需要鉴权的页面执行角色检查

### 3.3 定制化改造指南
改造角色时，需要同步修改：
1.  中的 UserRole 枚举
2.  中的 generateUserId 前缀
3.  中的角色校验逻辑
4.  中的 DEMO_ACCOUNTS
5.  中的桌面端侧边栏导航项
6.  中的 TabBar 配置
7.  中的 pageContextDB 角色分支
8.  中的角色引导内容

---

## 第四章：安全体系完整实现

### 4.1 认证链（从请求到响应）


### 4.2 Session 管理
- **创建**: POST /api/login 成功后，生成随机 session ID，写入 D1 sessions 表
- **Cookie 配置**: HttpOnly=true, SameSite=Lax, Max-Age=604800(7天), Path=/
- **过期清理**: POST /api/admin/sessions/cleanup 或 Cron 触发
- **登出**: POST /api/logout → 删除 D1 中的 session 记录 + 清除 Cookie

### 4.3 登录限流
- **机制**: 基于 IP 的滑动窗口限流
- **存储**: D1 rate_limits 表
- **规则**: 1分钟内最多5次登录尝试，超限锁定5分钟
- **首次使用**: 自动创建 rate_limits 表

### 4.4 安全响应头


### 4.5 API 安全模式
- **所有写操作**: 从 c.get('user') 获取身份，不信任前端传来的 userId
- **管理员操作**: 二次校验 sessionUser.role === 'admin'
- **合同签署**: 验证当前用户确实是合同的发起人/参与人
- **项目投资**: 防止投自己的项目 + 管理员不可投资 + 乐观锁防并发超卖
- **密码修改**: 首次改密需验证手机后四位，后续改密需验证旧密码
- **审计日志**: 所有关键操作（登录/注册/审核/签署/投资/导入）记录 IP + 详情

---

## 第五章：数据架构完整蓝图

### 5.1 数据库 Schema（13 张表 + 4 次迁移）

#### 核心业务表
| 表名 | 核心字段 | 用途 | 关键索引 |
|---|---|---|---|
| **users** | id, phone, name, password_hash, role, status, company, industry, title, cohort, class_id, class_name, join_date, must_change_password | 统一用户表（学员+老师+管理员） | phone, role, class_id, status |
| **projects** | id, name, owner_id, industry, description, target_amount, raised_amount, revenue_share_rate, duration, annual_yield_rate, exit_mode, settlement_cycle, total_shares, share_price, min_shares, status, share_code, company_full_name, credit_code, data_transmit_mode, payment_mode, bank_* | 项目全生命周期 | owner_id, status, share_code |
| **project_investors** | project_id, investor_id | 项目-投资人多对多 | UNIQUE(project_id, investor_id) |
| **contracts** | id, project_id, initiator_id, participant_id, amount, shares, revenue_share_ratio, cooperation_term, recovery_cap, annual_yield_rate, exit_mode, cap_multiple_at_term, approval_status, signed_by_initiator, signed_by_participant, status, total_repaid | 投资合同 | project_id, participant_id, status |
| **settlement_batches** | id, imported_by, source, file_name, total_records, total_amount, status | 分账批次 | - |
| **settlement_records** | id, batch_id, project_id, period, total_revenue, share_rate, total_share_amount, settlement_date | 分账记录（项目级） | project_id, period, batch_id |
| **repayment_details** | id, settlement_record_id, contract_id, participant_id, date, project_revenue, share_amount, cumulative_share, recovery_progress | 回款明细（投资人级） | contract_id, participant_id, date |

#### 社交与运营表
| 表名 | 核心字段 | 用途 |
|---|---|---|
| **referrals** | id, project_id, requester_id, teacher_id, status, message | 引荐请求 |
| **notifications** | id, type, title, content, icon, link, target_role, target_id, is_read | 系统通知 |
| **invite_codes** | code, created_by, target_phone, target_role, status, used_by, expires_at | 邀请码 |
| **share_logs** | project_id, sharer_id, share_type | 分享日志 |
| **audit_logs** | user_id, action, entity_type, entity_id, detail, ip_address | 审计日志 |
| **sessions** | id, user_id, device_info, ip_address, expires_at | 会话管理 |

### 5.2 三层数据访问架构


### 5.3 数据层关键函数清单
- **密码**: hashPassword(SHA-256+salt), verifyPassword, Demo回退验证
- **用户**: getUserByPhone, getUserById, getActiveMembers, getTeachers, generateUserId(角色前缀)
- **项目**: getProjects, getProjectById, getProjectByShareCode, generateProjectId(顺序递增)
- **合同**: getContractsByProject, getContractById, generateContractId, generateContractNumber(ZLC-YYYY-PXXX-CXXX)
- **回款**: getRepaymentDetails, getSettlementRecords
- **通知**: createNotification(支持 targetId 或 targetRole)
- **统计**: getPlatformStats(6项), getUserInvestmentStats(4项)
- **审计**: logAudit(userId, action, entityType, entityId, detail, ip)
- **邀请码**: generateInviteCode, generateInitialPassword, validateInviteCode

### 5.4 Seed 数据设计原则
种子数据不是随机的，而是精心设计的**演示剧本**：
- **12 个学员**: 分布在 3 个班期（融通一期/二期/三期），各有真实公司名和行业
- **3 个老师**: 每人负责 1-2 个班期，有头像和职称
- **1 个管理员**: 全权限
- **6 个项目**: 覆盖所有状态（open/active/funded/completed/pending_review/draft），不同行业
- **多份合同**: 覆盖 pending/active/signed/completed 状态
- **回款记录**: 至少 2 个项目有多期回款，展示趋势图
- **引荐记录**: pending + completed + declined 各有案例
- **通知记录**: 覆盖全部 7 种通知类型

---

## 第六章：全功能矩阵（17个页面 × API × 交互）

### 6.1 登录页 (/login) — login.tsx, 787行
**渲染架构**: 全屏红色渐变背景 + 毛玻璃卡片
**桌面端**: 左右分栏（品牌面板 + 登录表单）
**核心交互**:
1. **角色卡片选择**: 3张卡片(学员/老师/管理员)，点击展示该角色的Demo账号
2. **Demo快速登录**: 每个角色2-3个快速登录按钮，显示姓名+简介
3. **手机号登录**: 手机号+密码表单，验证码按钮（预留桩）
4. **自注册**: 切换到注册表单，POST /api/self-register，状态为 pending
5. **首次改密弹窗**: 如果 needsPasswordChange=true，弹出改密Modal，需验证手机后四位
6. **密码强度检查**: 实时显示强度条
7. **视觉效果**: 粒子动画canvas + 浮动发光球 + 卡片入场动画
**API**: POST /api/login, POST /api/self-register, POST /api/change-password

### 6.2 首页 (/) — home.tsx, 402行
**数据加载**: 并行加载 members, projects, repayments, contracts, repayment_records, teachers
**SSR**: 服务端预渲染前3个open项目 + 最近5条回款
**角色重定向**: admin→/admin, teacher→/teacher
**核心区块**:
1. **欢迎卡片**: 时间问候语(早安/午安/晚安) + 装饰emoji + 渐变背景
2. **分享码输入框**: 6位大写字母数字，查找项目 → 跳转详情页
3. **快捷操作双卡**: 发起项目(红色渐变) + 项目大厅(金色渐变)，带动画
4. **统计四宫格**: 我发起/我参与/累计投资(万)/累计回款(万)，数字count-up动画
5. **回款速报条**: 本周回款总额 + 涉及项目数，绿色横幅
6. **投资概览卡**: 总投资 + 已回款 + 参与项目数 + 回收率SVG圆环仪表盘
7. **我的项目列表**: 最多3个open项目卡片，含发起人头像/项目名/行业标签/融资进度条
8. **回款动态**: 右侧/底部，最近5条回款记录（日期/项目名/金额），自动滚动ticker
9. **首次访问引导**: Onboarding Carousel (3页滑动教学) + Coach Mark气泡提示
**桌面端**: 二列布局（左侧项目区 + 右侧sticky回款动态）
**API**: GET /api/user-stats/:id, GET /api/data/share-code?code=XXX

### 6.3 项目大厅 (/projects) — projects.tsx, 266行
**数据加载**: 并行 members, projects, contracts, repayment_records, teachers
**核心区块**:
1. **KPI横幅**: 募资中项目数/运营中项目数/累计融资(万)/累计回款(万)
2. **三维筛选器**: 行业(全部/8个行业) + 状态(全部/募资中/运营中/已完成) + 排序(默认/金额/分成率/最新)
3. **项目卡片列表**: 每张卡含 发起人信息行 + 项目名 + 标签行(行业/状态/关系标签) + 数据三列(目标/分成/期限) + 进度条
**特色功能**:
- **关系标签算法**: 基于当前用户的class_id，计算「老师推荐」「同班同学」标签
- **相关性排序**: 先显示与用户有关系的项目，再按发布时间
- **已完成项目**: 卡片底部显示实际回报率百分比
- **30秒Nudge**: 如果用户30秒没有点击任何项目，弹出底部提示条
**桌面端**: 三列网格布局
**API**: 无额外API，全部SSR

### 6.4 项目详情 (/projects/:id) — project-detail.tsx, 1206行
**数据加载**: 项目 + 发起人 + 投资人列表 + 合同列表 + 回款记录 + 老师列表
**核心区块**:
1. **返回按钮 + 项目头部**: 项目名 + 状态Badge + 发起人卡片(头像/姓名/公司/班期)
2. **项目描述**: 简介文字 + 展开/收起
3. **分成条款卡片**: 左侧红色竖线 + 网格布局(目标金额/分成比例/合作期限/年化收益率) + 底部高亮区(退出模式/结算周期/估算月收入/回本周期/封顶倍数)
4. **项目亮点**: 卡片列表，有图标+标题+描述
5. **发起人心声**: 引用风格卡片（大引号 + 发起人头像 + 发起人寄语）
6. **认购计算器**: 份额选择下拉 → 实时计算投资金额/预计月回款/年化收益/分成比例 → 「参与」按钮
7. **投资人列表**: 头像堆叠 + 投资人数量
8. **浏览计数**: 火眼图标 + 浏览次数
9. **引荐流程**: 选择老师 → 写留言 → 提交引荐请求(底部弹出面板)
10. **分享面板**: 底部弹出(Share Sheet) → 复制分享码/复制链接/复制推介文案
11. **底部固定操作栏**: 移动端，滚动到达后显示「参与项目」按钮
**参与项目流程**:
POST /api/admin/projects/:id/participate → 创建合同 + 更新份额 + 通知发起人
成功后: 显示庆祝弹窗(金色✓ + confetti) → 跳转到条款确认页或签署页
**乐观锁**: raised_shares 作为版本号，WHERE raised_shares = 旧值
**桌面端**: 左右分栏（左侧信息 + 右侧sticky操作卡）

### 6.5 发起项目 (/create) — create.tsx, 1534行
**四步Stepper**: 圆点+连线 + 步骤标签(基础信息/条款/企业/预览)
**Step 1 基础信息**:
- 项目名称 + 行业选择(8个) + 简介 + 亮点(可添加多条) + 发起人寄语 + 附件上传区(预留)
**Step 2 条款设定**:
- **退出模式选择**: 3张Radio卡(双通道/仅封顶/仅到期)，影响后续字段可见性
- **核心参数**: 预估月营收 → 期限 → 年化收益率 → 分成比例 ↔ 融资金额(双滑块联动)
- **联动计算**: 分成比例 = 金额 / (月营收 × 期限 × 分成率)，迭代求解
- **自动计算区**: 封顶金额 / 回本周期 / 份额数 / 每份价格
- **参考案例**: 可展开的真实RBF案例卡片
**Step 3 企业信息**:
- 企业全称 + 统一信用代码 + 注册地址 + 法定代表人 + 实际控制人
- 数据传输方式(API/手工) + 收款方式 + 银行账户信息
**Step 4 预览发布**:
- 自动生成的项目预览卡(完整展示所有填写信息)
- 保存草稿 / 提交审核 两个按钮
- 提交后显示成功弹窗(分享码 + 查看项目 + 返回首页)
**管理员拦截**: admin角色无法发起项目
**API**: POST /api/admin/projects/create

### 6.6 条款通 (/contracts/:id/terms) — terms-connect.tsx, 716行
**核心理念**: 三滑块联动确认投资条款
**RBF公式英雄卡**: 黑底金字，展示核心公式

**三维滑块**:
1. **红色滑块(金额)**: 调整投资金额 → 自动联动分成比例
2. **蓝色滑块(比例)**: 调整分成比例 → 自动联动投资金额
3. **绿色滑块(期限)**: 调整合作期限(50%~150%的项目期限范围内)
**实时计算面板**:
- 每份价格 × 认购份数 = 投资金额
- 封顶金额 = 本金 × (1 + 年化 × 期限/12)
- 预估月回款 = 月营收 × 分成比例
- 预估回本期 = 投资金额 / 月回款
- IRR 简化计算
**企业信息只读展示**: 公司名/法人/地址
**确认按钮**: POST /api/admin/contracts/:id/confirm-terms → 推进到 pending_approval
**状态Banner**: draft→可编辑 / pending_approval→等待审批 / approved→可签署 / rejected→可重新修改

### 6.7 合同签署 (/contracts/:id/sign) — contract-sign.tsx, 503行
**合同正文生成**: 服务端调用 generateContractHTML()，生成结构化HTML合同文本
**合同内容**:
- 甲方(发起人)信息块 + 乙方(投资人)信息块
- 投资标的条款 + 分成比例 + 合作期限 + 回收上限 + 退出条件
- 双方权责条款 + 违约条款 + 争议解决
**签署流程**:
1. 阅读合同全文(可展开/收起)
2. 勾选「已阅读并同意」
3. 手机验证码确认(预留桩)
4. 点击签署 → POST /api/admin/contracts/:id/sign → 签署状态更新
5. 如果双方都已签署 → 合同状态变为 active
**签署仪式页(Ceremony Page)**:
- 全屏暗色背景
- 金色圆圈弹出 + ✓勾号淡入 + 光晕扩散
- 合同摘要卡(项目名/金额/比例/期限)
- 三个按钮: 查看条款 / 查看项目 / 返回首页
**签署状态显示**: 发起方(已签/待签) + 参与方(已签/待签)

### 6.8 回款中心 (/repayments) — repayments.tsx, 356行
**Tab切换**: 我的投资 / 我的发起
**我的投资 Tab**:
- 投资项目列表，每个项目显示: 项目名 + 投资金额 + 已回款 + 回收进度条 + 状态
- 点击跳转到 /investments/:contractId
**我的发起 Tab**:
- 发起的项目列表 + 营收上报入口
- 点击跳转到 /revenue-report/:projectId

### 6.9 投资详情 (/investments/:contractId) — investments.tsx, 257行
**核心区块**:
1. **回本庆祝Banner**: 如果累计回款≥本金，显示金色横幅+confetti动画
2. **项目信息卡**: 项目名+状态Badge+发起人
3. **投资数据三列**: 投资金额/分成比例/回收上限
4. **回收进度SVG圆环**: 160px直径，金色(运营中)/绿色(已完成) 进度环
5. **回款趋势柱状图**: 纯CSS实现，每月一根柱子
6. **回款明细表**: 日期/项目收入/我的分成/累计回款 四列
7. **查看合同按钮**: 弹出底部Modal显示合同全文

### 6.10 营收报告 (/revenue-report/:projectId) — revenue-report.tsx, 283行
**发起人用**: 上报项目月度营收
- 项目选择(自动填充) + 期间选择(YYYY-MM) + 营收金额 + 备注
- 重复上报检测
- 自动计算分账金额并写入 settlement_records + repayment_details
- API: POST /api/admin/revenue-report/submit

### 6.11 管理后台 (/admin) — admin.tsx, 1594行
**9个Tab面板**:
1. **概览**: 6个KPI卡(学员/老师/项目/融资/回款/合同) + 最近动态
2. **分账管理**: CSV上传区 + 预览表格 + 确认导入按钮 + 历史批次列表
3. **学员管理**: 学员列表(搜索+筛选) + 状态切换(启用/禁用) + 待审批区 + 批量注册 + 单独编辑
4. **班级管理**: 班级列表 + 新建班级 + 批量导入(CSV)
5. **老师管理**: 老师列表 + 老师详情
6. **项目管理**: 项目列表 + 状态筛选
7. **审核管理**: 待审核项目 + 审批通过/驳回 + 审批意见
8. **邀请码**: 生成邀请码 + 邀请码列表(状态/使用者)
9. **审计日志**: 完整操作日志列表(用户/操作/实体/时间/IP)

### 6.12 老师工作台 (/teacher) — teacher.tsx, 477行
**核心区块**:
1. **欢迎卡**: 老师姓名 + 职称 + 负责班级
2. **统计条**: 班级学员数/引荐请求数/推荐项目数/活跃项目数
3. **引荐请求列表**: 每个请求含 学员头像+姓名+项目名+留言+时间+对接/暂缓按钮
4. **班级学员列表**: 按班级分组展开 + 学员基本信息
5. **推荐项目列表**: 老师推荐的项目列表 + 取消推荐按钮
6. **退出登录 + 切换账号**

### 6.13 个人中心 (/profile) — profile.tsx, 227行
**核心区块**:
1. **个人卡片**: 头像(首字母) + 姓名 + 公司·职位 + 班期·加入日期
2. **菜单列表**: 管理后台(admin可见) / 我的合同(即将上线) / 使用帮助 / 重新查看引导 / 联系管理员 / 修改密码 / 服务条款 / 隐私政策
3. **修改密码弹窗**: 当前密码 + 新密码 + 确认密码 → POST /api/change-password
4. **退出登录**: 确认弹窗 → 清除Session/Cookie/localStorage

### 6.14 消息通知 (/notifications) — notifications.tsx, 147行
- 从 D1 API 加载通知列表
- 按用户角色和ID过滤
- 未读红点 + 标题+内容+相对时间
- 点击跳转到对应页面 + 标记已读
- 「全部已读」按钮

### 6.15 分享页 (/share/:code) — share.tsx, 42行
- 6位分享码 → 查找项目 → 301重定向到项目详情
- 找不到 → 友好错误页面

### 6.16 引导系统 (/guide) — guide.tsx, 1154行
- 三种角色引导: /guide/member, /guide/teacher, /guide/admin
- 时间线布局 + 步骤卡片 + 动画效果
- 每个步骤: 图标+标题+描述+操作提示

---

## 第七章：UI 设计系统完整规范

### 7.1 品牌色系
| 用途 | 色值 | CSS变量/类名 |
|---|---|---|
| 品牌红(主色) | #B91C1C | .bg-brand, .text-brand |
| 品牌深红 | #991B1B | hover状态 |
| 品牌浅红 | #DC2626 | 渐变起始色 |
| 金色(强调) | #D4A853 → #B8860B | .btn-gold, 进度条 |
| 成功绿 | #16A34A | 已签署/已完成/回款 |
| 背景灰 | #FAFAF9 | body背景 |
| 卡片白 | #FFFFFF | 所有卡片 |
| 标题黑 | #1C1917 | 一级标题 |
| 正文灰 | #292524 | 正文文字 |
| 辅助灰 | #78716C | 标签/说明文字 |
| 弱辅助灰 | #A8A29E | 时间戳/占位符 |
| 分隔线 | #F5F5F4 / #E7E5E4 | 卡片内分隔 |

### 7.2 字体系统
- **英文**: Inter → SF Pro Display → Segoe UI → system
- **中文**: Noto Sans SC → PingFang SC → Microsoft YaHei → sans-serif
- **等宽**: SF Mono → Fira Code → Courier New (合同编号/公式)
- **加载策略**: Google Fonts 异步加载（media=print → onload=all），本地Tailwind优先

### 7.3 圆角系统
- 卡片: 16px (border-radius: 16px)
- 按钮: 12px
- 输入框: 12px
- Badge: 4px
- 头像: 50%
- 底部弹出面板: 24px 24px 0 0

### 7.4 阴影系统


### 7.5 动画系统（完整清单）
| 动画名 | 用途 | 时长 | 缓动 |
|---|---|---|---|
| pageEnterV2 | 页面进入 | 0.45s | cubic-bezier(0.22,1,0.36,1) |
| reveal/visible | 滚动渐入 | 0.5s | cubic-bezier(0.19,1,0.22,1) |
| stagger-1~8 | 错位延迟 | 0.05s递增 | - |
| spin | 加载旋转 | 0.6s/0.8s | linear |
| loginCardIn | 登录卡片入场 | - | - |
| orbFloat | 浮动球体 | 15s | ease-in-out |
| silk-shimmer | 背景光泽 | 15s | ease-in-out |
| iconPop | 成功图标弹出 | 0.5s | cubic-bezier(0.16,1,0.3,1) |
| confettiFall | 彩纸飘落 | 2s | ease-in |
| paybackBannerIn | 回本横幅入场 | 500ms | ease-out |
| ceremonyCirclePop | 签署仪式圆圈 | 300ms | ease-out |
| ceremonyGlow | 签署光晕 | 600ms | ease-out |
| coachFadeIn | 引导气泡 | 200ms | ease |
| rippleExpand | 按钮涟漪 | 0.5s | ease-out |
| numBounce | 数字跳动 | 0.6s | ease-out |
| shimmerSlide | 骨架屏闪烁 | 1.5s | ease-in-out |
| toastBounceIn | Toast弹入 | 0.4s | cubic-bezier(0.34,1.56,0.64,1) |
| kpiFlash | KPI数字闪光 | 0.6s | ease-out |
| progressGlow | 进度条光晕 | 2s | ease-in-out |
| badgePulse | Badge脉冲 | 3s | ease-in-out |
| gradientShift | 渐变流动 | 6s | ease |
| tabIconPop | Tab图标弹出 | 0.3s | cubic-bezier(0.34,1.56,0.64,1) |
| bellShake | 铃铛摇晃 | 0.5s | ease-in-out |
| borderGlowSweep | 卡片边缘光 | 2s | ease-in-out |
| livePulse | 实时绿点 | 2s | ease-in-out |
| welcomeCardIn | 欢迎卡入场 | 0.6s | cubic-bezier(0.22,1,0.36,1) |
| welcomeOrbFloat | 欢迎装饰浮动 | 6~8s | ease-in-out |
| decoFloat | 装饰元素浮动 | 3s | ease-in-out |
| arrowBounce | 箭头弹跳 | 0.4s | ease |
| statIconBob | 统计图标浮动 | 3s | ease-in-out |
| projectTopLine | 卡片顶部流光 | 3s | linear |
| splashFadeIn | 启动屏渐入 | 800ms | ease-out |
| splashDotBounce | 启动屏加载点 | 600ms | ease-in-out |
| splashLineGrow | 启动屏装饰线 | 1000ms | ease-out |

### 7.6 组件系统 (components.tsx, 933行)
| 组件 | 功能 | 特点 |
|---|---|---|
| LogoSVG | 品牌Logo(双圆交叠) | 可配大小 |
| Navbar | 顶部导航栏 | Logo + 中心标题 + 通知铃铛(带未读数) + 用户下拉 |
| TabBar | 底部标签栏 | 5个Tab + 中心凸起按钮(发起项目) |
| AuthCheckScript | 鉴权检查脚本 | 检查 zlc_user + 调用 /api/auth/me 验证Session |
| GlobalScripts | 全局工具脚本 | fetch拦截(401跳转) + showToast + showConfirm + showSuccessModal + scroll reveal + ripple effect |
| StatusBadge | 项目状态Badge | 5种状态颜色映射 |
| statusLabel | 状态文字转中文 | open→募资中 / active→运营中 等 |
| generateContractHTML | 合同HTML生成 | 服务端调用，生成结构化合同文本 |

### 7.7 Splash 启动屏
- 全屏红色渐变 + 品牌名(滴灌通 × 一亿中流) + 产品名(中流通) + 英文标语(Connect All Possibilities)
- 3个跳动加载点
- 首次访问显示3秒，后续 sessionStorage 跳过
- 淡出过渡到主内容

---

## 第八章：交互仪式系统

### 8.1 仪式节点清单
| 节点 | 触发条件 | 视觉效果 | 实现位置 |
|---|---|---|---|
| 注册成功 | 自注册提交成功 | Toast + 等待审核Banner | login.tsx |
| 首次登录 | needsPasswordChange=true | 全屏改密Modal | login.tsx |
| 参与项目 | 认购成功 | 金色成功弹窗 + ✓图标弹出 | project-detail.tsx |
| 合同签署 | 双方都已签 | 全屏仪式页(Ceremony Page) + 金色光晕 + 合同摘要 | contract-sign.tsx |
| 回款到账 | 新回款通知 | 通知铃铛摇晃 + Toast | notifications, home |
| 回本达成 | 累计回款≥本金 | 金色横幅 + 6色confetti + 投资回报率 | investments.tsx |
| 项目满额 | raised_shares=total_shares | 系统通知 + 发起人收到🎉 | admin-api.ts |
| 引荐对接 | 老师完成引荐 | 通知 + ✅状态更新 | teacher.tsx |

### 8.2 渐进式引导系统
1. **Onboarding Carousel**: 首次登录，3页全屏滑动教学（账通/项通/款通 概念介绍）
2. **Coach Mark**: 首次进入特定页面，高亮目标元素 + 气泡解释
3. **Smart Nudge**: 30秒无操作，底部弹出建议条（如点击任意项目了解详情）
4. **FAQ Help Panel**: 悬浮帮助按钮 → 底部弹出FAQ面板（按页面上下文展示不同问题）+ 班主任联系卡
5. **引导状态存储**: localStorage 按 userId 隔离，可在 Profile 页重置

---

## 第九章：多端响应式架构

### 9.1 三套布局方案
| 断点 | 布局 | 容器宽度 | 导航方式 |
|---|---|---|---|
| ≤768px (手机) | 单列 | 100% | 底部TabBar + 顶部Navbar |
| 769-1024px (平板) | 单列居中 | 680px | 底部TabBar + 顶部Navbar |
| ≥1025px (桌面) | 侧边栏+主内容 | 1200px | 左侧固定侧边栏(240px) + 顶部TopBar |

### 9.2 桌面端特殊处理
- **侧边栏**: 深色渐变背景 + Logo区 + 导航项(角色感知) + 平台统计 + 用户信息 + 切换按钮
- **顶栏**: 毛玻璃效果 + 页面标题 + Demo按钮 + 通知铃铛(含未读数) + 用户头像按钮
- **内容区**: margin-left:240px + max-width:1200px
- **登录页/引导页**: 不显示侧边栏和顶栏
- **Modal适配**: 手机端底部弹出(Sheet) → 桌面端居中弹窗(带backdrop-filter:blur)
- **布局适配**:
  - 首页: 二列(项目2×2网格 + sticky回款)
  - 项目大厅: 三列网格
  - 项目详情: 左右分栏(信息 + sticky操作卡)
  - 管理后台: 宽版表格 + 6列KPI
  - 老师工作台: 二列网格

### 9.3 手机端特殊处理(≤768px)
- 所有卡片: 紧凑padding(18px 20px) + 细border + 轻阴影
- 禁用hover效果，改用:active反馈
- 最小触摸面积: 44px
- 文字溢出: ellipsis + line-clamp
- 320px极窄屏保护: KPI自动换行 + 单列布局
- safe-area-inset-bottom 适配iPhone底部

---

## 第十章：AI 智能助手

### 10.1 系统架构 (ai-assistant.tsx, 1309行)
- **浮动按钮(FAB)**: 底部右下角，金色渐变圆形，进入时脉冲动画3次
- **弹出面板**: 底部弹出(手机)/右下角浮窗(桌面)
- **角色×页面矩阵**: pageContextDB[15个路由][3个角色] → 每个组合有 title/explanation/suggestions
- **建议项**: 每项包含文字+链接，点击可直接跳转

### 10.2 上下文感知
AI助手根据当前页面+用户角色动态展示不同内容。例如：
- 首页+学员: 投资概览说明 + 建议去项目大厅看看/发起新项目/查看回款
- 项目详情+学员: 分成条款解释 + 建议参与项目/请求引荐/查看合同
- 管理后台+管理员: 后台功能说明 + 建议导入分账/审核项目/管理学员

---

## 第十一章：社交分享系统

### 11.1 分享码机制
- 6位大写字母+数字（排除易混淆字符I/O/0/1）
- 项目创建时自动生成
- 首页和项目详情页都可输入分享码
- /share/:code 路由：查找项目 → 301重定向

### 11.2 分享面板
项目详情页底部弹出面板，包含3种分享方式：
1. **复制分享码**: 大号字体展示6位码 + 一键复制
2. **复制链接**: 完整URL + 一键复制
3. **复制推介文案**: 预生成的营销文案(项目名/行业/金额/分成/码)

### 11.3 分享追踪
share_logs 表记录: project_id, sharer_id, share_type, timestamp

---

## 第十二章：Demo → Production 迁移路径

### 12.1 六阶段迁移路线
| 阶段 | 内容 | 预估工时 |
|---|---|---|
| Phase 0 | Demo 上线（当前状态），硬编码账号，所有功能可用 | 已完成 |
| Phase 1 | 真实认证：接入短信验证码服务(如阿里云/腾讯云)，替换密码登录 | 2-3天 |
| Phase 2 | 真实支付：接入电子签约(如法大大/上上签)，替换签署桩 | 3-5天 |
| Phase 3 | 真实分账：接入银行/支付宝分账API，替换CSV导入 | 5-7天 |
| Phase 4 | 域名+备案：购买域名 → 工信部ICP备案 → Cloudflare自定义域名 | 1-2周 |
| Phase 5 | 运营工具：数据导出 / 报表 / 统计面板增强 | 持续迭代 |

### 12.2 技术架构决策记录
| 决策 | 选择 | 原因 |
|---|---|---|
| 框架 | Hono + Cloudflare Pages | 轻量(< 10MB)、全球边缘部署、免运维 |
| 数据库 | Cloudflare D1 (SQLite) | 零成本、自动备份、全球复制 |
| 前端 | SSR + 原生JS | 零前端构建、首屏极快、SEO友好 |
| 样式 | 本地Tailwind + 内联CSS | 避免CDN延迟、完全可控 |
| 认证 | Session Cookie + D1 | 无需第三方服务 |
| 部署 | Wrangler CLI → Cloudflare Pages | 一键部署、自动HTTPS |

### 12.3 前端代码复用率分析
- **renderer.tsx(3915行)**: 100%可复用，只需替换品牌色值和品牌名
- **components.tsx(933行)**: 90%可复用，TabBar和Navbar需要修改导航项
- **middleware.ts(328行)**: 100%可复用
- **db.ts(472行)**: 80%可复用，需修改表名和字段
- **各路由文件**: 50%可复用（交互模式/动画/布局框架可复用，业务逻辑需重写）

---

## 第十三章：Prompt 工程方法论

### 13.1 Prompt 分类体系（8类）
| 类别 | 代码 | 说明 | 典型数量 |
|---|---|---|---|
| Foundation | F | 项目创建、技术栈初始化 | 1-2 |
| Database | D | 数据库Schema + Seed数据 | 2-3 |
| Security | S | 认证、中间件、安全头 | 1-2 |
| Page | P | 页面路由实现（每个主要页面一个Prompt） | 8-15 |
| Component | C | 共享组件、工具函数 | 2-3 |
| Enhancement | E | 动画、响应式、引导系统 | 3-5 |
| Migration | M | 从Demo到生产的迁移桩接口 | 1-2 |
| Operations | O | 部署、域名、监控 | 1-2 |

### 13.2 标准 Prompt 执行序列（12步）

**Phase 1: 基础搭建 (F1-F2)**


**Phase 2: 数据层 (D1-D3)**


**Phase 3: 安全层 (S1-S2)**


**Phase 4: 核心页面 (P1-P8)**


**Phase 5: 管理与角色 (P9-P12)**


**Phase 6: 增强与打磨 (E1-E5)**


### 13.3 每个 Prompt 的标准结构


---

## 第十四章：API 完整接口清单

### 14.1 认证类 (4个)
| 方法 | 路径 | 功能 | 鉴权 |
|---|---|---|---|
| POST | /api/login | 手机号+密码登录 | 无需 |
| POST | /api/logout | 退出登录 | Session |
| POST | /api/change-password | 修改密码 | Session |
| GET | /api/auth/me | 验证当前Session | Cookie |
| POST | /api/self-register | 自助注册 | 限流 |
| POST | /api/admin/reset-password | 管理员重置密码 | Admin |

### 14.2 数据查询类 (15个)
| 方法 | 路径 | 功能 |
|---|---|---|
| GET | /api/members | 获取活跃学员列表 |
| GET | /api/projects | 获取项目列表 |
| GET | /api/user-stats/:id | 用户投资统计 |
| GET | /api/platform-stats | 平台KPI |
| GET | /api/data/members | 全量学员数据 |
| GET | /api/data/teachers | 全量老师数据 |
| GET | /api/data/projects | 全量项目数据 |
| GET | /api/data/contracts | 全量合同数据 |
| GET | /api/data/revenue-reports | 营收报告数据 |
| GET | /api/data/repayment-records | 回款明细数据 |
| GET | /api/data/repayments | 回款汇总数据 |
| GET | /api/data/referrals | 引荐数据 |
| GET | /api/data/notifications | 通知列表 |
| GET | /api/data/notifications/unread-count | 未读通知计数 |
| GET | /api/data/share-logs | 分享日志 |
| GET | /api/data/share-code | 按分享码查项目 |
| GET | /api/data/invite-codes | 邀请码列表 |
| GET | /api/data/audit-logs | 审计日志 |

### 14.3 写操作类 (17个)
| 方法 | 路径 | 功能 | 鉴权 |
|---|---|---|---|
| POST | /api/admin/projects/create | 创建项目 | Session |
| POST | /api/admin/projects/:id/participate | 参与项目(含乐观锁) | Session |
| POST | /api/admin/projects/:id/review | 审核项目(批准/驳回) | Admin |
| POST | /api/admin/projects/:id/recommend | 推荐/取消推荐项目 | Teacher |
| POST | /api/admin/projects/:id/view | 增加浏览量 | Session |
| POST | /api/admin/contracts/:id/sign | 签署合同 | Session(当事人) |
| POST | /api/admin/contracts/:id/confirm-terms | 确认条款 | Session(参与人) |
| POST | /api/admin/contracts/:id/approve | 审批合同 | Teacher/Admin |
| POST | /api/admin/contracts/:id/send-to-esign | 发送电子签约(桩) | Session |
| GET | /api/admin/contracts/:id | 查询单个合同详情 | Session |
| POST | /api/admin/settlement/import | CSV分账导入 | Admin |
| GET | /api/admin/settlement/batches | 分账批次列表 | Admin |
| POST | /api/admin/revenue-report/submit | 营收报告提交 | Session |
| POST | /api/admin/members/batch-register | 批量注册学员 | Admin |
| POST | /api/admin/members/:id/toggle-status | 启用/禁用学员 | Admin |
| POST | /api/admin/members/:id/approve | 审批注册 | Admin |
| POST | /api/admin/members/:id/reject | 拒绝注册 | Admin |
| POST | /api/admin/members/:id/update | 编辑学员信息 | Admin |
| POST | /api/admin/referrals/create | 创建引荐请求 | Session |
| POST | /api/admin/referrals/:id/handle | 处理引荐(对接/暂缓) | Teacher |
| POST | /api/admin/notifications/mark-read | 标记通知已读 | Session |
| POST | /api/admin/invite-codes/generate | 生成邀请码 | Admin |
| POST | /api/admin/sessions/cleanup | 清理过期Session | Admin |
| POST | /api/admin/classes/create | 新建班级 | Admin |
| POST | /api/admin/classes/batch-create | 批量导入班级 | Admin |

---

## 第十五章：场景改造实战清单

### 15.1 改造时需要替换的文件和内容

| 需替换内容 | 涉及文件 | 替换指引 |
|---|---|---|
| 品牌名和Logo | renderer.tsx, components.tsx, login.tsx | 搜索「中流通」「滴灌通」「一亿中流」|
| 品牌色值 | renderer.tsx(全局CSS) | #B91C1C → 新主色, #D4A853 → 新强调色 |
| 角色名称 | types.ts, login.tsx, middleware.ts, components.tsx | member/teacher/admin → 新角色 |
| Demo账号 | login.tsx(DEMO_ACCOUNTS), seed.sql | 替换为新场景的角色数据 |
| 数据表结构 | migrations/*.sql, types.ts, db.ts | 根据新场景重新设计 |
| 行业列表 | create.tsx | 8个行业 → 新场景的分类 |
| 导航项 | renderer.tsx(侧边栏), components.tsx(TabBar) | 按新功能调整 |
| AI助手上下文 | ai-assistant.tsx(pageContextDB) | 15路由×3角色全部重写 |
| 引导内容 | guide.tsx | 完全重写 |
| FAQ内容 | components.tsx(FAQ面板) | 按新场景编写 |

### 15.2 不需要替换的基础设施（直接复用）
- renderer.tsx 的 CSS 框架（3500+ 行）：动画/布局/组件样式
- middleware.ts 的安全中间件
- db.ts 的密码处理和ID生成机制
- GlobalScripts 的 showToast/showConfirm/fetch拦截
- 所有的响应式断点逻辑
- Splash 启动屏骨架
- 签署仪式页骨架
- 回本庆祝动效骨架

---

## 第十六章：质量保证清单

### 16.1 安全检查清单（12项）
- [x] Session Cookie: HttpOnly + SameSite=Lax
- [x] 登录限流: IP-based 5次/分钟
- [x] 安全响应头: 6个标准安全头
- [x] API鉴权: 所有写操作从Session取身份
- [x] 管理员二次校验: role === 'admin'
- [x] 合同签署: 当事人身份验证
- [x] 并发防超卖: 乐观锁(raised_shares)
- [x] 密码安全: SHA-256 + salt
- [x] XSS防护: X-XSS-Protection
- [x] 点击劫持: X-Frame-Options: DENY
- [x] 审计日志: 所有关键操作+IP
- [x] Session过期: 7天TTL + 清理机制

### 16.2 UX 检查清单（15项）
- [x] 首屏加载: Splash → 淡出 → 主内容
- [x] 新用户引导: Onboarding(3页) + Coach Mark + Smart Nudge
- [x] 空状态设计: 所有列表都有空状态(图标+文字+操作按钮)
- [x] 加载状态: Spinner + 骨架屏shimmer
- [x] 成功反馈: Toast + 成功弹窗 + 仪式页
- [x] 错误处理: Toast错误提示 + API错误码映射
- [x] 触摸优化: 44px最小触摸面积
- [x] 三端适配: 手机+平板+桌面
- [x] 密码可见: 登录表单密码显示/隐藏切换
- [x] 返回导航: 每个详情页都有返回链接
- [x] 确认弹窗: 危险操作(退出/删除)都有二次确认
- [x] 实时计算: 条款通三滑块实时联动
- [x] 进度可视: 进度条 + 百分比文字 + SVG圆环
- [x] 时间人性化: 相对时间(刚刚/3分钟前/2天前)
- [x] 数字格式: 金额带¥和万，百分比带%

---

## 第十七章：Prompt 模板库（场景无关的通用模板）

### 模板 T1: 项目初始化


### 模板 T2: 数据库设计


### 模板 T3: 安全中间件


### 模板 T4: 全局样式系统


### 模板 T5: 页面路由模板


---

## 附录 A：场景调查问卷

回答以下问题，即可生成完整的 Prompt 序列：

1. **场景名称**是什么？（如：一亿中流私董会、健身房联营、餐饮加盟...）
2. **有哪些角色**？每个角色的核心职责是什么？
3. **核心业务对象**是什么？（相当于中流通的「项目」）
4. **核心交易**是什么？（相当于中流通的「投资+合同」）
5. **核心资金流**是什么？（相当于中流通的「分账回款」）
6. **角色间的社交关系**是什么？（相当于中流通的「引荐」）
7. **品牌名**和**主色/强调色**是什么？
8. **是否需要Demo模式**？（推荐是）
9. **预计的数据规模**？（用户数/业务对象数/交易数）
10. **特殊的业务公式**？（相当于中流通的RBF公式）
11. **是否需要管理后台**？管理员需要哪些功能？
12. **是否需要多端适配**？（手机/平板/桌面）

---

## 附录 B：文件清单与行数统计

| 文件路径 | 行数 | 核心职责 |
|---|---|---|
| src/renderer.tsx | 3,915 | 全局HTML框架+CSS系统+Splash+桌面端侧边栏 |
| src/data.ts | 1,934 | 数据类型定义和转换（已弃用，被db-bridge.ts替代）|
| src/routes/admin.tsx | 1,594 | 管理后台(9个Tab面板) |
| src/routes/create.tsx | 1,534 | 项目发起(4步表单) |
| src/admin-api.ts | 1,514 | 全部写操作API(25个接口) |
| src/ai-assistant.tsx | 1,309 | AI智能助手(角色×页面矩阵) |
| src/routes/project-detail.tsx | 1,206 | 项目详情(参与/引荐/分享) |
| src/guide.tsx | 1,154 | 引导系统(3种角色引导) |
| src/components.tsx | 933 | 共享组件(Navbar/TabBar/GlobalScripts等) |
| src/routes/login.tsx | 787 | 登录页(角色切换/Demo/注册/改密) |
| src/routes/terms-connect.tsx | 716 | 条款通(三滑块联动) |
| src/db-bridge.ts | 685 | D1数据桥接层 |
| src/index.tsx | 554 | 主入口(路由注册+API端点) |
| src/routes/contract-sign.tsx | 503 | 合同签署+仪式页 |
| src/routes/teacher.tsx | 477 | 老师工作台 |
| src/db.ts | 472 | D1数据访问层 |
| src/types.ts | 426 | TypeScript类型定义 |
| src/routes/home.tsx | 402 | 首页(欢迎卡+统计+项目+回款) |
| src/routes/repayments.tsx | 356 | 回款中心(双Tab) |
| src/middleware.ts | 328 | 安全中间件(Session/限流/安全头) |
| src/routes/revenue-report.tsx | 283 | 营收报告(发起人上报) |
| src/routes/projects.tsx | 266 | 项目大厅(筛选+排序+卡片) |
| src/routes/investments.tsx | 257 | 投资详情(进度环+趋势图+明细) |
| src/routes/profile.tsx | 227 | 个人中心(资料+菜单+改密) |
| src/routes/notifications.tsx | 147 | 通知中心(列表+已读) |
| src/routes/share.tsx | 42 | 分享码路由(重定向) |
| **合计** | **~22,000** | |
| migrations/0001_initial_schema.sql | 389 | 数据库完整Schema |
| migrations/0002_rate_limits.sql | 15 | 限流表 |
| migrations/0003_contract_terms_upgrade.sql | 57 | 合同条款升级 |
| migrations/0004_expect_multiple.sql | 2 | 预期倍数字段 |
| seed.sql | 496 | 演示数据 |

---

## 附录 C：关键业务公式

### C.1 RBF (Revenue-Based Financing) 核心公式


### C.2 份额计算


### C.3 合同编号规则


### C.4 锚点 k 值（条款通联动核心）


---

*END OF BIBLE V2.1*
*本文档共计约 35,000 字，覆盖 22,000 行生产代码的完整设计思路。*
*上传此文档 + 描述场景 → 输出一套 Prompt → 构建同等水平应用。*
