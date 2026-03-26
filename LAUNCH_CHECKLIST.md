# 中流通 (ZhongLiu Connect) — 上线检查清单

> 上线日期：2026-03-26
> 版本：Phase 3 (V22)
> 生产 URL：https://zhongliutong.net
> Cloudflare Pages：zhongliu-connect

---

## 一、安全检查清单

### 1. 身份认证与授权

| 检查项 | 状态 | 说明 |
|--------|------|------|
| Session Cookie HttpOnly | ✅ | 防 XSS 窃取 |
| Session Cookie Secure | ✅ | 仅 HTTPS 传输 |
| Session Cookie SameSite=Lax | ✅ | 防 CSRF |
| Session 7 天有效期 | ✅ | Max-Age=604800 |
| 过期 Session 自动清理 | ✅ | /api/admin/sessions/cleanup |
| 登录限流 (5次/分钟) | ✅ | IP 级限流，锁定 5 分钟 |
| Session 随机 UUID | ✅ | crypto.randomUUID() |

### 2. API 权限验证

| 端点类别 | 中间件 | 状态 |
|----------|--------|------|
| /api/data/* | requireAuth | ✅ |
| /api/members | requireAuth | ✅ |
| /api/projects | requireAuth | ✅ |
| /api/user-stats/* | requireAuth | ✅ |
| /api/platform-stats | requireAuth | ✅ |
| /api/change-password | requireAuth | ✅ |
| /api/admin/* | requireAuth | ✅ |
| 管理员写操作 | requireAuth + role=admin 验证 | ✅ |
| /api/login | 无需认证 + loginRateLimit | ✅ |
| /api/logout | 无需认证 | ✅ |
| /api/self-register | 无需认证 + loginRateLimit | ✅ |
| /api/auth/me | 无需认证（验证 session） | ✅ |
| /api/metrics | 无需认证（只写监控数据） | ✅ |

### 3. 管理员端点角色检查

| 端点 | 角色检查 | 状态 |
|------|----------|------|
| /api/admin/reset-password | role=admin | ✅ |
| /api/admin/settlement/import | role=admin | ✅ |
| /api/admin/members/batch-register | role=admin | ✅ |
| /api/admin/projects/:id/review | role=admin | ✅ |
| /api/admin/invite-codes/generate | role=admin | ✅ |
| /api/admin/members/:id/toggle-status | role=admin | ✅ |
| /api/admin/members/:id/approve | role=admin | ✅ |
| /api/admin/members/:id/reject | role=admin | ✅ |
| /api/admin/members/:id/update | role=admin | ✅ |
| /api/admin/contracts/:id/approve | role=teacher/admin | ✅ |
| /api/admin/sessions/cleanup | role=admin | ✅ |
| /api/admin/classes/create | role=admin | ✅ |
| /api/admin/classes/batch-create | role=admin | ✅ |

### 4. SQL 注入防护

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 所有 SQL 使用参数化查询 (.bind()) | ✅ | 无字符串拼接 SQL |
| IN 子句使用动态占位符 | ✅ | `'?'.join(',')` 方式生成 |
| LIKE 使用参数绑定 | ✅ | `LIKE '%' \|\| ? \|\| '%'` |
| 无 raw SQL 拼接 | ✅ | grep 确认无 `${var}` 在 SQL 中 |

### 5. 密码安全

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 密码 SHA-256 + Salt 哈希 | ✅ | Web Crypto API |
| Salt 随机 16 字符 | ✅ | crypto.randomUUID() |
| Demo 密码强制修改标记 | ✅ | must_change_password=1 |
| 密码最低 6 位 | ✅ | 前后端双重验证 |
| 密码不记入审计日志 | ✅ | 仅记录操作，不记录明文 |

### 6. 安全 Headers

| Header | 值 | 状态 |
|--------|-------|------|
| X-Frame-Options | DENY | ✅ |
| X-Content-Type-Options | nosniff | ✅ |
| X-XSS-Protection | 1; mode=block | ✅ |
| Referrer-Policy | strict-origin-when-cross-origin | ✅ |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | ✅ |
| Strict-Transport-Security | max-age=31536000 | ✅ |
| CORS | 未启用（同源保护） | ✅ |

### 7. 业务安全逻辑

| 检查项 | 状态 |
|--------|------|
| 不能投资自己的项目 | ✅ |
| 管理员不可投资 | ✅ |
| 乐观锁防并发超卖 | ✅ |
| 合同签署身份验证（发起人/参与人） | ✅ |
| 老师只能审批自己班级的合同 | ✅ |
| 账号禁用后 Session 自动清除 | ✅ |

---

## 二、性能监控方案

### 前端 Web Vitals 采集
- **FCP** (First Contentful Paint) — PerformanceObserver
- **LCP** (Largest Contentful Paint) — 持续更新取最终值
- **CLS** (Cumulative Layout Shift) — 会话窗口算法
- **TTFB** — Navigation Timing API
- 上报端点：`POST /api/metrics`
- 存储：D1 `web_vitals` 表
- 批量上报：页面隐藏时或 5 秒后自动 flush
- 使用 sendBeacon API 确保可靠上报

### API 错误监控
- 全局 try-catch 中间件捕获所有 /api/* 错误
- console.error 记录错误详情（Cloudflare Dashboard 可查看）
- 审计日志 (audit_logs 表) 记录所有关键操作

### 管理员监控查询
```sql
-- 最近 24 小时 Web Vitals 概览
SELECT name,
       COUNT(*) as samples,
       ROUND(AVG(value), 0) as avg_ms,
       ROUND(MIN(value), 0) as min_ms,
       ROUND(MAX(value), 0) as max_ms
FROM web_vitals
WHERE created_at > datetime('now', '-1 day')
GROUP BY name;

-- 最近登录失败（安全监控）
SELECT detail, created_at
FROM audit_logs
WHERE action = 'login_failed'
ORDER BY created_at DESC
LIMIT 20;

-- 活跃 Session 数
SELECT COUNT(*) as active_sessions
FROM sessions
WHERE expires_at > datetime('now');
```

---

## 三、数据库备份方案

### D1 备份策略
- **Cloudflare D1 自动备份**：Cloudflare 自动为 D1 数据库创建 point-in-time 恢复点
- **手动导出**（推荐每周）：
  ```bash
  # 导出所有表数据
  npx wrangler d1 export zhongliu-production --remote --output=backup_$(date +%Y%m%d).sql
  ```
- **备份验证**：导出后在本地 D1 恢复验证
  ```bash
  npx wrangler d1 execute zhongliu-production --local --file=backup_YYYYMMDD.sql
  ```

### 关键表
| 表名 | 预估行数 | 重要性 |
|------|---------|--------|
| users | ~1,000 | 极高 |
| projects | ~100 | 极高 |
| contracts | ~500 | 极高 |
| repayment_details | ~5,000 | 高 |
| settlement_records | ~200 | 高 |
| notifications | ~10,000 | 中 |
| audit_logs | ~50,000 | 中（可裁剪） |
| sessions | ~200 | 低（可重建） |

---

## 四、回滚方案

### 代码回滚
```bash
# 1. 查看历史部署
npx wrangler pages deployment list --project-name zhongliu-connect

# 2. 回滚到上一个版本
npx wrangler pages deployment rollback --project-name zhongliu-connect

# 3. 或部署指定 commit
git checkout <previous-commit-hash>
npm run build
npx wrangler pages deploy dist --project-name zhongliu-connect --branch main
```

### 数据库回滚
```bash
# D1 Time Travel（回到某个时间点）
npx wrangler d1 time-travel restore zhongliu-production --timestamp=<ISO-timestamp>

# 或从手动备份恢复
npx wrangler d1 execute zhongliu-production --remote --file=backup_YYYYMMDD.sql
```

### 紧急措施
1. **服务不可用** → Cloudflare Pages Dashboard 回滚上一版本
2. **数据异常** → D1 Time Travel 恢复到出问题前
3. **安全事件** → 清除所有 Session：`DELETE FROM sessions`
4. **限流异常** → 清除限流表：`DELETE FROM rate_limits`

---

## 五、容量评估

### 用户规模预估
- 学员：~1,000 人
- 老师：~30 人
- 管理员：3-5 人
- 峰值并发：~100 人（假设 10% 同时在线）

### D1 QPS 预估

| 场景 | 请求/秒 | D1 查询/请求 | D1 QPS |
|------|---------|-------------|--------|
| 页面浏览 | 20 | 0（SSR 无 DB） | 0 |
| 登录 | 2 | 3（user + session + audit） | 6 |
| API 数据获取 | 30 | 1-2 | 45 |
| 写操作（投资/签约） | 1 | 5-8 | 8 |
| 监控上报 | 10 | 1 | 10 |
| **合计** | **~63** | | **~69** |

### Cloudflare 限制评估

| 资源 | 免费额度 | 预估使用 | 评估 |
|------|---------|---------|------|
| Workers 请求 | 100K/天 | ~50K/天 | ✅ 充裕 |
| D1 读取 | 5M/天 | ~500K/天 | ✅ 充裕 |
| D1 写入 | 100K/天 | ~20K/天 | ✅ 充裕 |
| D1 存储 | 5 GB | ~100 MB | ✅ 充裕 |
| Worker CPU | 10ms/请求 | ~5ms/请求 | ✅ 充裕 |

> **结论**: 1,000 学员 + 30 老师的规模，Cloudflare 免费计划完全可以承载。即使用户翻倍到 2,000，仍有大量余量。

---

## 六、需要告知学生/老师的注意事项

### 给学员的通知模板

```
【中流通平台上线通知】

各位一亿中流学员您好：

中流通平台（zhongliutong.net）已正式上线，请注意以下事项：

1. 访问地址：https://zhongliutong.net
2. 登录方式：使用您的手机号 + 初始密码登录
3. 首次登录请务必修改密码（系统会强制引导）
4. 密码要求：至少 6 位，建议包含字母和数字

功能简介：
- 查看和参与投资项目
- 查看回款记录和收益
- 在线签署联营合同
- 接收平台通知

如有问题请联系班主任老师。

滴灌通 × 一亿中流
```

### 给老师的通知模板

```
【中流通平台 — 班主任操作指南】

1. 登录地址：https://zhongliutong.net
2. 您的角色：老师（可切换查看学员视角）
3. 核心功能：
   - 审批合同：学员确认条款后需要您审批
   - 引荐对接：学员可向您请求引荐项目资源
   - 推荐项目：您可以为学员推荐优质项目
4. 如有学员反馈问题，请及时联系管理员
5. 请妥善保管您的账号密码
```

### 管理员注意事项
- 定期执行 Session 清理（/api/admin/sessions/cleanup）
- 每周导出一次 D1 数据库备份
- 关注 Cloudflare Dashboard 的 Workers 分析面板
- 新学员注册后及时审核（/admin 管理后台）
- 分账数据导入前请仔细核对 CSV 格式

---

## 七、上线后持续监控

### 第一周重点监控
- [ ] 每日检查 Web Vitals 数据（FCP < 1.8s, LCP < 2.5s, CLS < 0.1）
- [ ] 每日检查审计日志中的 login_failed 次数
- [ ] 每日检查 Cloudflare Analytics 的请求量和错误率
- [ ] 收集学员反馈，记录 bug

### 每周例行
- [ ] 导出 D1 备份
- [ ] 清理过期 Session
- [ ] 查看 Cloudflare Workers 用量是否接近限额
- [ ] 查看 web_vitals 表的性能趋势

### 告警阈值
| 指标 | 正常范围 | 告警阈值 |
|------|---------|---------|
| TTFB | < 200ms | > 500ms |
| 错误率 | < 1% | > 5% |
| 登录失败/小时 | < 10 | > 50 |
| D1 请求/天 | < 500K | > 2M |

---

*文档版本：1.0 | 最后更新：2026-03-26*
