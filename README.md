# 中流通 ZhongLiu Connect

一亿中流私董会学员专属的收入分成（RBF）投资协作平台。  
由滴灌通（Micro Connect）与一亿中流联合打造。

## URLs

- **预览**: https://3000-i8ip8indu9123mne7hota-5634da27.sandbox.novita.ai
- **登录页**: /login
- **首页**: /

## 已完成功能

### V1.0 — 登录页
- 全屏深红渐变背景 + 丝绸光影动画
- 毛玻璃（frosted glass）中央登录卡片
- 手机号 + 验证码登录（SMS OTP 模式）
- 60 秒倒计时获取验证码
- 金色渐变登录按钮
- Mock 学员身份验证（5 位 Demo 学员）
- localStorage 登录态持久化
- 首页未登录自动跳转 /login
- 登出功能
- 响应式设计（移动端 + 桌面端）
- 品牌双圆 Logo SVG（内联 favicon）

### API 端点
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/login | 手机号+验证码登录 |
| GET | /api/members | 获取活跃学员列表 |

### Demo 账号
| 手机号 | 姓名 | 公司 | 验证码 |
|--------|------|------|--------|
| 13888888888 | 张建国 | 星火餐饮集团 | 888888 |
| 13966666666 | 李明远 | 新锐智造科技 | 888888 |
| 13733333333 | 王晓薇 | 优学教育科技 | 888888 |
| 13611111111 | 陈伟强 | 鼎盛供应链 | 888888 |
| 13599999999 | 赵丽华 | 芙蓉美业集团 | 888888 |

## 技术栈

- **框架**: Hono + TypeScript + JSX (SSR)
- **部署**: Cloudflare Pages (wrangler)
- **样式**: Tailwind CSS (CDN) + 自定义 CSS
- **图标**: FontAwesome 6.4 (CDN)
- **字体**: Inter + Montserrat + Noto Sans SC (Google Fonts)
- **交互**: 原生 JavaScript (inline script)
- **数据**: localStorage (客户端)

## 品牌色系

| 用途 | 颜色 |
|------|------|
| 主品牌色 | #B91C1C (深中国红) |
| Hover | #DC2626 |
| Pressed | #991B1B |
| 渐变终点 | #7F1D1D |
| 金色点缀 | #D4A853 |

## 项目结构

```
src/
├── index.tsx      # Hono 入口 + 路由 + 页面
├── renderer.tsx   # JSX 渲染器（HTML 骨架 + CDN + 样式）
└── data.ts        # Mock 学员数据
```

## 待开发功能

- [ ] 投资机会列表页
- [ ] 企业画像详情页
- [ ] 学员协作社区
- [ ] 我的投资组合
- [ ] 账户设置
- [ ] Cloudflare D1 数据持久化

## 部署

- **平台**: Cloudflare Pages
- **状态**: 开发中
- **最后更新**: 2026-03-19
