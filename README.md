# 中流通 ZhongLiu Connect

一亿中流私董会学员专属的收入分成（RBF）投资协作平台。  
由滴灌通（Micro Connect）与一亿中流联合打造。

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
- **投资详情**: /investments/:contractId (SVG圆环+柱状图+明细)
- **上报收入**: /initiated/:projectId/report (表单+历史+分配明细)
- **管理后台**: /admin (仅管理员可访问)

## 已完成功能

### V1.0 ~ V1.4 (前5次迭代)
- 登录页、首页、项目大厅、项目详情、参与功能
- 发起项目(3步表单)、合同签署(双方签署+验证码)
- 回款总览(双Tab)、投资详情(SVG圆环+柱状图)、上报收入(自动分配)

### V1.5 — 全局优化 + 动画 + 管理员入口

#### 全局动画优化
- **页面切换过渡**: 所有页面内容区添加淡入上滑动画 (page-enter, 0.35s cubic-bezier)
- **卡片滚动渐现**: IntersectionObserver + stagger延迟 (reveal + visible class)
- **数字递增动画**: 首页KPI数字从0递增到目标值 (animateNumber, 600ms easeOutCubic)
- **进度条动画**: 使用data-width属性，IntersectionObserver触发从0→目标宽度 (800ms)

#### 全局 Toast 通知
- 从屏幕顶部滑入的通知组件
- 支持 success (绿色) / error (红色) / info (蓝色) 三种类型
- 自动3秒消失，全局可用 `showToast(message, type, duration)`

#### 统一确认弹窗 (showConfirm)
- 全屏半透明遮罩 rgba(0,0,0,0.5)
- 弹窗卡片: 白色圆角20px, 缩放弹出动画 scale(0.9→1)
- 标题 + 描述 + 双按钮 (取消/确认)
- 点击遮罩可关闭
- 使用场景: 确认参与项目、确认退出登录

#### 参与成功动画
- 全屏遮罩 + 白色卡片
- 绿色 ✓ 图标 (fa-check-circle, 缩放弹出 scale 0→1)
- "参与成功！" + "即将进入合同签署"
- 2秒后自动关闭跳转

#### 签约成功动画
- 金色主题 ✓ 图标 (#D4A853)
- "合同签署成功！"
- 金色纸屑飘落效果 (CSS keyframes, 20个小方块)

#### 空状态设计
- 统一空状态样式: 居中灰色图标 + 提示文字 + 引导按钮
- 项目大厅无匹配、我的投资/发起为空、回款明细为空

#### 管理员后台 (/admin)
- 仅 role='admin' 可访问，个人主页显示 [管理后台] 入口
- 黑色导航栏 (#1C1917) 区分前台
- **平台数据概览**: 学员总数、项目总数、累计融资、累计回款、活跃项目
- **学员管理**: 表格列表 + [邀请新学员] 弹窗 (输入手机号+姓名)
- **项目列表**: 全部项目，可按状态筛选

#### 响应式优化
- **桌面端**: 480px居中容器 + 两侧阴影 (模拟手机应用体验)
- **移动端**: 底部Tab全宽，卡片全宽，筛选栏竖排，登录页减padding
- **Tab Bar**: 桌面端限制在480px宽度内居中

#### 其他优化
- **Favicon**: 品牌红色双圆SVG图标
- **Title**: 统一 "中流通 - {页面名}" 格式
- **Loading**: 品牌红色旋转圆环 (page-spinner)

## Demo 账号

| 手机号 | 姓名 | 公司 | 角色 | 验证码 |
|--------|------|------|------|--------|
| 13888888888 | 张建国 | 星火餐饮集团 | 学员 | 888888 |
| 13966666666 | 李明远 | 新锐智造科技 | 学员 | 888888 |
| 13733333333 | 王晓薇 | 优学教育科技 | 学员 | 888888 |
| 13611111111 | 陈伟强 | 鼎盛供应链 | 学员 | 888888 |
| 13599999999 | 赵丽华 | 芙蓉美业集团 | 学员 | 888888 |
| **18000000000** | **管理员** | **一亿中流** | **admin** | **888888** |

**测试建议**:
- 用 `18000000000 管理员` 登录 → 个人主页 → 管理后台入口 → /admin
- 用 `13611111111 陈伟强` 登录 → 回款中心 → 可看到2个投资项目
- 用 `13966666666 李明远` 登录 → 回款中心 → 我的发起 → 上报收入

## 最终路由总览

| 路径 | 说明 | 认证 |
|------|------|------|
| / | 首页 | 需登录 |
| /login | 登录页 | — |
| /projects | 项目大厅 | 需登录 |
| /projects/:id | 项目详情 | 需登录 |
| /create | 发起项目 | 需登录 |
| /contracts/:id/sign | 合同签署 | 需登录 |
| /repayments | 回款中心 | 需登录 |
| /investments/:contractId | 投资详情 | 需登录 |
| /initiated/:projectId/report | 上报收入 | 需登录 |
| /profile | 个人主页 | 需登录 |
| /admin | 管理后台 | 仅admin |

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/login | 手机号+验证码登录 (返回含role字段) |
| GET | /api/members | 获取活跃学员列表 |
| GET | /api/projects | 获取项目列表 |
| GET | /api/user-stats/:id | 获取用户统计数据 |

## 数据架构

### localStorage 数据键
| Key | 说明 |
|-----|------|
| zlc_user | 当前登录用户信息 (含role字段) |
| zlc_token | 登录 token |
| zlc_investments | 投资记录数组 |
| zlc_user_projects | 用户创建的项目数组 |
| zlc_contracts | 合同记录数组 |
| zlc_revenue_reports | 收入上报记录数组 |
| zlc_repayment_records | 回款明细记录数组 |

## 技术栈

- **框架**: Hono + TypeScript + JSX (SSR)
- **部署**: Cloudflare Pages (wrangler)
- **样式**: Tailwind CSS (CDN) + 自定义 CSS
- **图标**: FontAwesome 6.4 (CDN)
- **字体**: Inter + Montserrat + Noto Sans SC
- **交互**: 原生 JavaScript (全局工具函数 + inline script)
- **数据**: localStorage (客户端) + Mock 数据 (服务端)
- **图表**: SVG圆环 + 纯CSS柱状图 (无第三方库)
- **动画**: CSS @keyframes + IntersectionObserver + requestAnimationFrame

## 项目结构

```
src/
├── index.tsx      # Hono 入口 + 路由 + 所有页面 + 交互 + Admin
├── renderer.tsx   # JSX 渲染器 (HTML + CDN + 全局样式 + 响应式)
└── data.ts        # Mock 数据 + RBF 计算 + 统计函数 + 分配算法 + Admin账号
```

## 待开发功能

- [ ] Cloudflare D1 数据持久化
- [ ] 合同列表/管理页面
- [ ] 消息通知系统
- [ ] 数据导出/报表下载
- [ ] 管理后台完整功能 (编辑/删除学员、审核项目)

## 部署

- **平台**: Cloudflare Pages
- **状态**: 开发中
- **最后更新**: 2026-03-19
