// ============================================================
// 中流通 ZhongLiu Connect — Admin Write API Routes
// 管理后台写入操作（分账导入、学员注册、项目审核等）
// ============================================================
import { Hono } from 'hono'
import type { HonoEnv } from './types'
import {
  logAudit, createNotification,
  hashPassword, generateUserId, generateInviteCode, generateInitialPassword,
  generateProjectId, generateContractId,
} from './db'

const adminApi = new Hono<HonoEnv>()

// ══════════════════════════════════════════════════════════
// 分账数据 CSV 导入 API
// ══════════════════════════════════════════════════════════

/**
 * POST /api/admin/settlement/import
 * Body: { rows: SettlementCSVRow[], fileName: string, adminId: string }
 * 预览+导入一步完成（管理员在前端确认后调用）
 */
adminApi.post('/settlement/import', async (c) => {
  const db = c.env.DB
  try {
    const { rows, fileName, adminId } = await c.req.json<{
      rows: Array<{
        settlement_date: string; period: string; project_id: string; project_name: string
        total_revenue: number; share_rate: number; total_share_amount: number
        participant_id: string; participant_name: string; share_amount: number
        arrival_status: string; external_ref?: string
      }>
      fileName: string; adminId: string
    }>()

    if (!rows || rows.length === 0) {
      return c.json({ ok: false, error: '没有可导入的数据' }, 400)
    }

    // 1. 创建批次
    const batchId = `batch-${Date.now()}`
    const totalAmount = rows.reduce((s, r) => s + (r.share_amount || 0), 0)

    await db.prepare(`
      INSERT INTO settlement_batches (id, imported_by, source, file_name, total_records, total_amount, status, confirmed_at)
      VALUES (?, ?, 'csv_import', ?, ?, ?, 'confirmed', datetime('now'))
    `).bind(batchId, adminId, fileName, rows.length, totalAmount).run()

    // 2. 按 project_id + period 分组，创建 settlement_records
    const srMap = new Map<string, string>() // key -> settlement_record_id
    for (const row of rows) {
      const key = `${row.project_id}|${row.period}`
      if (!srMap.has(key)) {
        const srId = `sr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        srMap.set(key, srId)
        await db.prepare(`
          INSERT INTO settlement_records (id, batch_id, project_id, project_name, period, total_revenue, share_rate, total_share_amount, settlement_date, source, external_ref)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'csv_import', ?)
        `).bind(
          srId, batchId, row.project_id, row.project_name, row.period,
          row.total_revenue, row.share_rate, row.total_share_amount,
          row.settlement_date, row.external_ref || null
        ).run()
      }
    }

    // 3. 创建 repayment_details
    let processedCount = 0
    const warnings: string[] = []

    for (const row of rows) {
      const key = `${row.project_id}|${row.period}`
      const srId = srMap.get(key)!

      // 查找对应合同
      const contract = await db.prepare(
        'SELECT id, total_repaid, recovery_cap FROM contracts WHERE project_id = ? AND participant_id = ? LIMIT 1'
      ).bind(row.project_id, row.participant_id).first<{ id: string; total_repaid: number; recovery_cap: number }>()

      if (!contract) {
        warnings.push(`未找到合同: 项目${row.project_id} 投资人${row.participant_id}(${row.participant_name})`)
        continue
      }

      const newCumulative = (contract.total_repaid || 0) + row.share_amount
      const recoveryProgress = contract.recovery_cap > 0
        ? Math.min(100, +(newCumulative / contract.recovery_cap * 100).toFixed(2))
        : 0

      const repId = `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      await db.prepare(`
        INSERT INTO repayment_details (id, settlement_record_id, contract_id, participant_id, project_name, date, project_revenue, share_amount, cumulative_share, recovery_progress, arrival_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        repId, srId, contract.id, row.participant_id, row.project_name,
        row.settlement_date, row.total_revenue, row.share_amount,
        newCumulative, recoveryProgress, row.arrival_status || 'arrived'
      ).run()

      // 4. 更新合同累计回款
      await db.prepare(
        'UPDATE contracts SET total_repaid = ?, updated_at = datetime(\'now\') WHERE id = ?'
      ).bind(newCumulative, contract.id).run()

      processedCount++
    }

    // 5. 审计日志
    await logAudit(db, {
      userId: adminId, action: 'settlement_import',
      entityType: 'settlement_batch', entityId: batchId,
      detail: { fileName, totalRecords: rows.length, processedCount, totalAmount, warnings },
    })

    // 6. 通知相关投资人
    const participantIds = [...new Set(rows.map(r => r.participant_id))]
    for (const pid of participantIds) {
      await createNotification(db, {
        type: 'repayment', title: '新回款到账',
        content: `您有新的分账回款，请在回款中心查看详情`,
        icon: '💰', link: '/repayments',
        targetId: pid,
      })
    }

    return c.json({
      ok: true,
      data: {
        batchId, processedCount, totalRecords: rows.length,
        totalAmount: +totalAmount.toFixed(2), warnings,
      },
    })
  } catch (e: any) {
    return c.json({ ok: false, error: '导入失败: ' + (e.message || '') }, 500)
  }
})

/**
 * GET /api/admin/settlement/batches
 * 获取所有分账批次
 */
adminApi.get('/settlement/batches', async (c) => {
  const db = c.env.DB
  const res = await db.prepare(
    'SELECT * FROM settlement_batches ORDER BY created_at DESC LIMIT 50'
  ).all()
  return c.json({ ok: true, data: res.results })
})

// ══════════════════════════════════════════════════════════
// 学员管理 API
// ══════════════════════════════════════════════════════════

/**
 * POST /api/admin/members/batch-register
 * Body: { members: Array<{name, phone, className}>, adminId: string }
 */
adminApi.post('/members/batch-register', async (c) => {
  const db = c.env.DB
  try {
    const { members, adminId } = await c.req.json<{
      members: Array<{ name: string; phone: string; className: string }>
      adminId: string
    }>()

    if (!members || members.length === 0) {
      return c.json({ ok: false, error: '没有可注册的学员' }, 400)
    }

    let registered = 0
    const skipped: string[] = []
    const password = generateInitialPassword()
    const passwordHash = await hashPassword(password)

    for (const m of members) {
      // 检查手机号是否已存在
      const existing = await db.prepare(
        'SELECT id FROM users WHERE phone = ?'
      ).bind(m.phone).first()

      if (existing) {
        skipped.push(`${m.name}(${m.phone}) - 手机号已注册`)
        continue
      }

      const userId = await generateUserId(db, 'member')
      const classId = 'class-' + m.className.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')

      await db.prepare(`
        INSERT INTO users (id, phone, name, password_hash, role, status, cohort, class_id, class_name, join_date, must_change_password)
        VALUES (?, ?, ?, ?, 'member', 'active', ?, ?, ?, date('now'), 1)
      `).bind(userId, m.phone, m.name, passwordHash, m.className, classId, m.className).run()

      // 生成邀请码
      const inviteCode = generateInviteCode()
      await db.prepare(`
        INSERT INTO invite_codes (code, created_by, target_phone, target_name, target_role, target_class_id, target_class_name, status, used_by, used_at)
        VALUES (?, ?, ?, ?, 'member', ?, ?, 'used', ?, datetime('now'))
      `).bind(inviteCode, adminId, m.phone, m.name, classId, m.className, userId).run()

      registered++
    }

    // 审计日志
    await logAudit(db, {
      userId: adminId, action: 'batch_register',
      entityType: 'user', detail: { registered, skipped, totalAttempted: members.length },
    })

    return c.json({
      ok: true,
      data: { registered, skipped, initialPassword: password },
      message: `成功注册 ${registered} 位学员` + (skipped.length > 0 ? `，跳过 ${skipped.length} 位` : ''),
    })
  } catch (e: any) {
    return c.json({ ok: false, error: '注册失败: ' + (e.message || '') }, 500)
  }
})

// ══════════════════════════════════════════════════════════
// 项目管理 API
// ══════════════════════════════════════════════════════════

/**
 * POST /api/admin/projects/:id/review
 * Body: { action: 'approve' | 'reject', note: string, adminId: string }
 */
adminApi.post('/projects/:id/review', async (c) => {
  const db = c.env.DB
  const projectId = c.req.param('id')
  try {
    const { action, note, adminId } = await c.req.json<{
      action: 'approve' | 'reject'; note?: string; adminId: string
    }>()

    const project = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first()
    if (!project) return c.json({ ok: false, error: '项目不存在' }, 404)

    const newStatus = action === 'approve' ? 'open' : 'draft'
    await db.prepare(`
      UPDATE projects SET status = ?, review_note = ?, reviewed_by = ?, reviewed_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).bind(newStatus, note || null, adminId, projectId).run()

    // 通知项目发起人
    await createNotification(db, {
      type: 'review',
      title: action === 'approve' ? '项目审核通过' : '项目审核未通过',
      content: action === 'approve'
        ? `您的项目已通过审核，现在可以接受投资了`
        : `您的项目审核未通过${note ? '：' + note : ''}，请修改后重新提交`,
      icon: action === 'approve' ? '✅' : '❌',
      link: `/projects/${projectId}`,
      targetId: (project as any).owner_id,
    })

    await logAudit(db, {
      userId: adminId, action: `project_${action}`,
      entityType: 'project', entityId: projectId,
      detail: { note, previousStatus: (project as any).status, newStatus },
    })

    return c.json({ ok: true, message: action === 'approve' ? '项目已批准上线' : '项目已驳回' })
  } catch (e: any) {
    return c.json({ ok: false, error: '审核失败: ' + (e.message || '') }, 500)
  }
})

// ══════════════════════════════════════════════════════════
// 参与项目 + 生成合同 API (学员操作)
// ══════════════════════════════════════════════════════════

/**
 * POST /api/projects/:id/participate
 * Body: { userId, shares }
 */
adminApi.post('/projects/:id/participate', async (c) => {
  const db = c.env.DB
  const projectId = c.req.param('id')
  try {
    const { userId, shares } = await c.req.json<{ userId: string; shares: number }>()

    // 获取项目
    const project = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first<any>()
    if (!project) return c.json({ ok: false, error: '项目不存在' }, 404)
    if (project.status !== 'open') return c.json({ ok: false, error: '项目当前不接受投资' }, 400)
    if (shares < project.min_shares) return c.json({ ok: false, error: `最低参与${project.min_shares}份` }, 400)
    if (project.raised_shares + shares > project.total_shares) {
      return c.json({ ok: false, error: '剩余份额不足' }, 400)
    }

    // 检查是否已参与
    const existing = await db.prepare(
      'SELECT id FROM project_investors WHERE project_id = ? AND investor_id = ?'
    ).bind(projectId, userId).first()
    if (existing) return c.json({ ok: false, error: '您已参与此项目' }, 400)

    // 获取用户和发起人信息
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<any>()
    const owner = await db.prepare('SELECT * FROM users WHERE id = ?').bind(project.owner_id).first<any>()
    if (!user || !owner) return c.json({ ok: false, error: '用户信息异常' }, 500)

    // 添加投资人
    await db.prepare(
      'INSERT INTO project_investors (project_id, investor_id) VALUES (?, ?)'
    ).bind(projectId, userId).run()

    // 更新项目募集进度
    const amount = shares * project.share_price
    const newRaised = project.raised_amount + amount
    const newRaisedShares = project.raised_shares + shares
    const newStatus = newRaisedShares >= project.total_shares ? 'funded' : 'open'

    await db.prepare(`
      UPDATE projects SET raised_amount = ?, raised_shares = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(newRaised, newRaisedShares, newStatus, projectId).run()

    // 计算投资人个人份额比例和回收上限
    const shareRatio = +(shares / project.total_shares * project.revenue_share_rate).toFixed(2)
    const recoveryCap = +(amount * project.recovery_multiple).toFixed(2)

    // 生成合同
    const contractId = await generateContractId(db)
    await db.prepare(`
      INSERT INTO contracts (id, project_id, project_name, initiator_id, initiator_name, initiator_company, participant_id, participant_name, amount, shares, revenue_share_ratio, cooperation_term, recovery_cap, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).bind(
      contractId, projectId, project.name,
      project.owner_id, owner.name, owner.company || '',
      userId, user.name,
      amount, shares, shareRatio, project.duration, recoveryCap
    ).run()

    // 通知发起人
    await createNotification(db, {
      type: 'participation', title: '新投资参与',
      content: `${user.name} 参与了您的项目「${project.name}」，投资 ${amount} 万元`,
      icon: '🤝', link: `/projects/${projectId}`,
      targetId: project.owner_id,
    })

    await logAudit(db, {
      userId, action: 'participate_project',
      entityType: 'project', entityId: projectId,
      detail: { shares, amount, contractId },
    })

    return c.json({
      ok: true,
      data: { contractId, amount, shares, shareRatio, recoveryCap },
      message: `成功参与项目，投资 ${amount} 万元`,
    })
  } catch (e: any) {
    return c.json({ ok: false, error: '参与失败: ' + (e.message || '') }, 500)
  }
})

/**
 * POST /api/contracts/:id/sign
 * Body: { userId, role: 'initiator' | 'participant' }
 */
adminApi.post('/contracts/:id/sign', async (c) => {
  const db = c.env.DB
  const contractId = c.req.param('id')
  try {
    const { userId, role } = await c.req.json<{ userId: string; role: 'initiator' | 'participant' }>()

    const contract = await db.prepare('SELECT * FROM contracts WHERE id = ?').bind(contractId).first<any>()
    if (!contract) return c.json({ ok: false, error: '合同不存在' }, 404)

    if (role === 'initiator') {
      await db.prepare(
        "UPDATE contracts SET signed_by_initiator = 1, updated_at = datetime('now') WHERE id = ?"
      ).bind(contractId).run()
    } else {
      await db.prepare(
        "UPDATE contracts SET signed_by_participant = 1, updated_at = datetime('now') WHERE id = ?"
      ).bind(contractId).run()
    }

    // 检查是否双方都已签署
    const updated = await db.prepare('SELECT * FROM contracts WHERE id = ?').bind(contractId).first<any>()
    if (updated.signed_by_initiator === 1 && updated.signed_by_participant === 1) {
      await db.prepare(
        "UPDATE contracts SET status = 'active', signed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?"
      ).bind(contractId).run()
    }

    await logAudit(db, {
      userId, action: 'sign_contract',
      entityType: 'contract', entityId: contractId,
      detail: { role },
    })

    return c.json({ ok: true, message: '签署成功' })
  } catch (e: any) {
    return c.json({ ok: false, error: '签署失败: ' + (e.message || '') }, 500)
  }
})

/**
 * POST /api/projects/create
 * Body: project data from create form
 */
adminApi.post('/projects/create', async (c) => {
  const db = c.env.DB
  try {
    const data = await c.req.json<any>()
    const { userId } = data

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<any>()
    if (!user) return c.json({ ok: false, error: '用户不存在' }, 404)

    const projectId = await generateProjectId(db)
    // 生成分享码
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let shareCode = ''
    for (let i = 0; i < 6; i++) shareCode += chars[Math.floor(Math.random() * chars.length)]

    await db.prepare(`
      INSERT INTO projects (id, name, owner_id, industry, description, target_amount, raised_amount, revenue_share_rate, duration, recovery_multiple, estimated_monthly_revenue, total_shares, raised_shares, share_price, min_shares, status, share_code, initiator_class_id, initiator_class_name, highlight_text, highlights, initiator_note)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, 0, ?, ?, 'pending_review', ?, ?, ?, ?, ?, ?)
    `).bind(
      projectId, data.name, userId, data.industry || '', data.description || '',
      data.targetAmount || 0, data.revenueShareRate || 0, data.duration || 0,
      data.recoveryMultiple || 1, data.estimatedMonthlyRevenue || 0,
      data.totalShares || 0, data.sharePrice || 0, data.minShares || 1,
      shareCode, user.class_id || null, user.class_name || null,
      data.highlightText || null,
      data.highlights ? JSON.stringify(data.highlights) : null,
      data.initiatorNote || null
    ).run()

    // 通知管理员
    await createNotification(db, {
      type: 'review', title: '新项目待审核',
      content: `${user.name} 提交了新项目「${data.name}」，请审核`,
      icon: '📋', link: '/admin#projects',
      targetRole: 'admin',
    })

    await logAudit(db, {
      userId, action: 'create_project',
      entityType: 'project', entityId: projectId,
      detail: { name: data.name, targetAmount: data.targetAmount },
    })

    return c.json({
      ok: true,
      data: { projectId, shareCode },
      message: '项目已提交，等待管理员审核',
    })
  } catch (e: any) {
    return c.json({ ok: false, error: '创建失败: ' + (e.message || '') }, 500)
  }
})

// ══════════════════════════════════════════════════════════
// 引荐 API
// ══════════════════════════════════════════════════════════

/**
 * POST /api/admin/referrals/create
 * Body: { projectId, requesterId, teacherId, message }
 */
adminApi.post('/referrals/create', async (c) => {
  const db = c.env.DB
  try {
    const { projectId, requesterId, teacherId, message } = await c.req.json<{
      projectId: string; requesterId: string; teacherId: string; message?: string
    }>()

    // Check for existing referral
    const existing = await db.prepare(
      'SELECT id FROM referrals WHERE project_id = ? AND requester_id = ?'
    ).bind(projectId, requesterId).first()
    if (existing) return c.json({ ok: false, error: '您已请求过引荐' }, 400)

    const refId = `ref-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    await db.prepare(`
      INSERT INTO referrals (id, project_id, requester_id, teacher_id, status, message)
      VALUES (?, ?, ?, ?, 'pending', ?)
    `).bind(refId, projectId, requesterId, teacherId, message || null).run()

    // Notify the teacher
    const requester = await db.prepare('SELECT name FROM users WHERE id = ?').bind(requesterId).first<{ name: string }>()
    const project = await db.prepare('SELECT name FROM projects WHERE id = ?').bind(projectId).first<{ name: string }>()
    await createNotification(db, {
      type: 'referral', title: '新引荐请求',
      content: `${requester?.name || '学员'}请求您帮助对接项目「${project?.name || ''}」`,
      icon: '🤝', link: '/teacher#referrals',
      targetId: teacherId,
    })

    await logAudit(db, {
      userId: requesterId, action: 'create_referral',
      entityType: 'referral', entityId: refId,
      detail: { projectId, teacherId, message },
    })

    return c.json({ ok: true, data: { referralId: refId }, message: '引荐请求已发送' })
  } catch (e: any) {
    return c.json({ ok: false, error: '请求失败: ' + (e.message || '') }, 500)
  }
})

// ══════════════════════════════════════════════════════════
// 引荐处理 API (老师操作)
// ══════════════════════════════════════════════════════════

/**
 * POST /api/admin/referrals/:id/handle
 * Body: { status: 'completed'|'declined', note?: string }
 */
adminApi.post('/referrals/:id/handle', async (c) => {
  const db = c.env.DB
  try {
    const refId = c.req.param('id')
    const { status, note } = await c.req.json<{ status: string; note?: string }>()
    if (!['completed', 'declined'].includes(status)) {
      return c.json({ ok: false, error: '无效状态' }, 400)
    }

    const ref = await db.prepare('SELECT * FROM referrals WHERE id = ?').bind(refId).first<any>()
    if (!ref) return c.json({ ok: false, error: '引荐记录不存在' }, 404)

    const now = new Date().toISOString()
    await db.prepare(`
      UPDATE referrals SET status = ?, completed_at = ?, completed_note = ? WHERE id = ?
    `).bind(status, now, note || (status === 'completed' ? '已完成对接' : '已暂缓'), refId).run()

    // Notify requester
    const teacher = await db.prepare('SELECT name FROM users WHERE id = ?').bind(ref.teacher_id).first<{ name: string }>()
    const project = await db.prepare('SELECT name FROM projects WHERE id = ?').bind(ref.project_id).first<{ name: string }>()
    await createNotification(db, {
      type: 'referral', title: status === 'completed' ? '引荐已对接' : '引荐已暂缓',
      content: `${teacher?.name || '老师'}${status === 'completed' ? '已帮您对接' : '暂缓了'}项目「${project?.name || ''}」的引荐`,
      icon: status === 'completed' ? '✅' : '⏸️', link: `/projects/${ref.project_id}`,
      targetId: ref.requester_id,
    })

    return c.json({ ok: true, message: status === 'completed' ? '已标记为已对接' : '已暂缓' })
  } catch (e: any) {
    return c.json({ ok: false, error: '操作失败: ' + (e.message || '') }, 500)
  }
})

// ══════════════════════════════════════════════════════════
// 营收报告提交 API
// ══════════════════════════════════════════════════════════

/**
 * POST /api/admin/revenue-report/submit
 * Body: { projectId, reportedBy, period, totalRevenue, note? }
 */
adminApi.post('/revenue-report/submit', async (c) => {
  const db = c.env.DB
  try {
    const { projectId, reportedBy, period, totalRevenue, note } = await c.req.json<{
      projectId: string; reportedBy: string; period: string
      totalRevenue: number; note?: string
    }>()

    // Check for duplicate
    const existing = await db.prepare(
      'SELECT id FROM settlement_records WHERE project_id = ? AND period = ?'
    ).bind(projectId, period).first()
    if (existing) return c.json({ ok: false, error: '该期已上报过，请选择其他月份' }, 400)

    // Get project and contracts
    const project = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first<any>()
    if (!project) return c.json({ ok: false, error: '项目不存在' }, 404)

    const shareRate = project.revenue_share_rate || 0
    const shareTotal = +(totalRevenue * (shareRate / 100)).toFixed(4)

    // Create settlement record
    const recordId = `sr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`
    await db.prepare(`
      INSERT INTO settlement_records (id, project_id, period, total_revenue, total_share_amount, share_rate, settlement_date, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'self_report')
    `).bind(recordId, projectId, period, totalRevenue, shareTotal, shareRate, new Date().toISOString().slice(0, 10)).run()

    // Get active contracts for this project
    const contracts = await db.prepare(
      `SELECT * FROM contracts WHERE project_id = ? AND status = 'active'`
    ).bind(projectId).all<any>()

    const totalInvested = contracts.results.reduce((s: number, c: any) => s + (c.amount || 0), 0)
    const repaymentDetails: any[] = []

    for (const ct of contracts.results) {
      const ratio = totalInvested > 0 ? ct.amount / totalInvested : 0
      let share = +(shareTotal * ratio).toFixed(4)

      // Get previous cumulative
      const prevRec = await db.prepare(
        `SELECT cumulative_share FROM repayment_details WHERE contract_id = ? ORDER BY created_at DESC LIMIT 1`
      ).bind(ct.id).first<{ cumulative_share: number }>()
      const prevCumulative = prevRec?.cumulative_share || ct.total_repaid || 0

      // Cap check
      let newCumulative = +(prevCumulative + share).toFixed(4)
      if (ct.recovery_cap && newCumulative > ct.recovery_cap) {
        share = +(ct.recovery_cap - prevCumulative).toFixed(4)
        if (share < 0) share = 0
        newCumulative = +(prevCumulative + share).toFixed(4)
      }

      const repId = `rep-${Date.now().toString(36)}-${ct.id}`
      await db.prepare(`
        INSERT INTO repayment_details (id, contract_id, settlement_record_id, participant_id, project_name, date, project_revenue, share_amount, cumulative_share, recovery_progress)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        repId, ct.id, recordId, ct.participant_id, project.name,
        new Date().toISOString().slice(0, 10),
        totalRevenue, share, newCumulative,
        ct.recovery_cap ? +(newCumulative / ct.recovery_cap * 100).toFixed(2) : 0
      ).run()

      // Update contract totalRepaid
      await db.prepare(
        'UPDATE contracts SET total_repaid = ? WHERE id = ?'
      ).bind(newCumulative, ct.id).run()

      repaymentDetails.push({ contractId: ct.id, share, cumulative: newCumulative })
    }

    // Notify project owner
    await createNotification(db, {
      type: 'settlement', title: '营收报告已提交',
      content: `项目「${project.name}」${period}营收报告已提交，总收入¥${totalRevenue}万，分账¥${shareTotal}万`,
      icon: '📊', link: `/repayments`,
      targetId: project.owner_id,
    })

    await logAudit(db, {
      userId: reportedBy, action: 'submit_revenue_report',
      entityType: 'settlement_record', entityId: recordId,
      detail: { projectId, period, totalRevenue, shareTotal, contracts: repaymentDetails.length },
    })

    return c.json({
      ok: true, data: { recordId, shareTotal, repayments: repaymentDetails.length },
      message: '营收报告已提交'
    })
  } catch (e: any) {
    return c.json({ ok: false, error: '提交失败: ' + (e.message || '') }, 500)
  }
})

// ══════════════════════════════════════════════════════════
// 老师推荐项目 API
// ══════════════════════════════════════════════════════════

/**
 * POST /api/admin/projects/:id/recommend
 * Body: { teacherId, action: 'add'|'remove' }
 */
adminApi.post('/projects/:id/recommend', async (c) => {
  const db = c.env.DB
  try {
    const projectId = c.req.param('id')
    const { teacherId, action } = await c.req.json<{ teacherId: string; action: 'add' | 'remove' }>()

    const project = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first<any>()
    if (!project) return c.json({ ok: false, error: '项目不存在' }, 404)

    let recs: string[] = project.recommended_by_teachers ? JSON.parse(project.recommended_by_teachers) : []

    if (action === 'add') {
      if (!recs.includes(teacherId)) recs.push(teacherId)
    } else {
      recs = recs.filter((t: string) => t !== teacherId)
    }

    await db.prepare(
      'UPDATE projects SET recommended_by_teachers = ? WHERE id = ?'
    ).bind(JSON.stringify(recs), projectId).run()

    return c.json({ ok: true, message: action === 'add' ? '已推荐' : '已取消推荐' })
  } catch (e: any) {
    return c.json({ ok: false, error: '操作失败: ' + (e.message || '') }, 500)
  }
})

// ══════════════════════════════════════════════════════════
// 通知已读 API
// ══════════════════════════════════════════════════════════

/**
 * POST /api/admin/notifications/mark-read
 * Body: { userId, notificationIds?: string[] } — 不传ids则标记全部
 */
adminApi.post('/notifications/mark-read', async (c) => {
  const db = c.env.DB
  try {
    const { userId, notificationIds } = await c.req.json<{
      userId: string; notificationIds?: string[]
    }>()

    if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications
      const placeholders = notificationIds.map(() => '?').join(',')
      await db.prepare(
        `UPDATE notifications SET is_read = 1 WHERE id IN (${placeholders}) AND (target_id = ? OR target_id IS NULL)`
      ).bind(...notificationIds, userId).run()
    } else {
      // Mark all as read for user
      await db.prepare(
        `UPDATE notifications SET is_read = 1 WHERE (target_id = ? OR target_id IS NULL OR target_role IN (SELECT role FROM users WHERE id = ?)) AND is_read = 0`
      ).bind(userId, userId).run()
    }

    return c.json({ ok: true, message: '已标为已读' })
  } catch (e: any) {
    return c.json({ ok: false, error: '操作失败: ' + (e.message || '') }, 500)
  }
})

// ══════════════════════════════════════════════════════════
// 浏览量 API
// ══════════════════════════════════════════════════════════

/**
 * POST /api/admin/projects/:id/view
 * Body: { userId? }
 */
adminApi.post('/projects/:id/view', async (c) => {
  const db = c.env.DB
  try {
    const projectId = c.req.param('id')
    await db.prepare(
      'UPDATE projects SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ?'
    ).bind(projectId).run()
    const proj = await db.prepare('SELECT view_count FROM projects WHERE id = ?').bind(projectId).first<{ view_count: number }>()
    return c.json({ ok: true, viewCount: proj?.view_count || 0 })
  } catch (e: any) {
    return c.json({ ok: false, error: '操作失败' }, 500)
  }
})

// ══════════════════════════════════════════════════════════
// 用户合同查询 API (for contract-sign page)
// ══════════════════════════════════════════════════════════

/**
 * GET /api/admin/contracts/:id
 * Returns single contract with full details
 */
adminApi.get('/contracts/:id', async (c) => {
  const db = c.env.DB
  try {
    const contractId = c.req.param('id')
    const contract = await db.prepare('SELECT * FROM contracts WHERE id = ?').bind(contractId).first<any>()
    if (!contract) return c.json({ ok: false, error: '合同不存在' }, 404)

    const project = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(contract.project_id).first<any>()
    const initiator = await db.prepare('SELECT id, name, company FROM users WHERE id = ?').bind(contract.initiator_id).first<any>()
    const participant = await db.prepare('SELECT id, name, company FROM users WHERE id = ?').bind(contract.participant_id).first<any>()

    return c.json({
      ok: true, data: {
        id: contract.id,
        projectId: contract.project_id,
        projectName: contract.project_name || project?.name,
        initiatorId: contract.initiator_id,
        initiatorName: contract.initiator_name || initiator?.name,
        initiatorCompany: contract.initiator_company || initiator?.company,
        participantId: contract.participant_id,
        participantName: contract.participant_name || participant?.name,
        amount: contract.amount,
        shares: contract.shares,
        revenueShareRatio: contract.revenue_share_ratio,
        cooperationTerm: contract.cooperation_term,
        recoveryCap: contract.recovery_cap,
        signedByInitiator: !!contract.signed_by_initiator,
        signedByParticipant: !!contract.signed_by_participant,
        signedAt: contract.signed_at,
        status: contract.status,
        totalRepaid: contract.total_repaid || 0,
        createdAt: contract.created_at,
        project: project ? {
          id: project.id, name: project.name,
          targetAmount: project.target_amount,
          revenueShareRate: project.revenue_share_rate,
          recoveryMultiple: project.recovery_multiple,
          duration: project.duration,
        } : null,
        ownerName: initiator?.name || '发起人',
      }
    })
  } catch (e: any) {
    return c.json({ ok: false, error: '查询失败: ' + (e.message || '') }, 500)
  }
})

// ══════════════════════════════════════════════════════════
// 邀请码生成 API
// ══════════════════════════════════════════════════════════

/**
 * POST /api/admin/invite-codes/generate
 * Body: { adminId, count?: number }
 */
adminApi.post('/invite-codes/generate', async (c) => {
  const db = c.env.DB
  try {
    const { adminId, count = 1 } = await c.req.json<{ adminId: string; count?: number }>()
    const codes: string[] = []
    for (let i = 0; i < Math.min(count, 20); i++) {
      const code = generateInviteCode()
      await db.prepare(
        `INSERT INTO invite_codes (code, created_by, status) VALUES (?, ?, 'active')`
      ).bind(code, adminId).run()
      codes.push(code)
    }

    await logAudit(db, {
      userId: adminId, action: 'generate_invite',
      entityType: 'invite_code', entityId: codes.join(','),
      detail: { count: codes.length },
    })

    return c.json({ ok: true, data: { codes }, message: `已生成 ${codes.length} 个邀请码` })
  } catch (e: any) {
    return c.json({ ok: false, error: '生成失败: ' + (e.message || '') }, 500)
  }
})

// ══════════════════════════════════════════════════════════
// 学员管理 API — Phase 5B
// ══════════════════════════════════════════════════════════

/**
 * POST /api/admin/members/:id/toggle-status
 * Body: { adminId: string }
 * 启用/禁用学员账号
 */
adminApi.post('/members/:id/toggle-status', async (c) => {
  const db = c.env.DB
  const userId = c.req.param('id')
  try {
    const { adminId } = await c.req.json<{ adminId: string }>()

    // Verify admin
    const admin = await db.prepare('SELECT role FROM users WHERE id = ?').bind(adminId).first<{ role: string }>()
    if (!admin || admin.role !== 'admin') return c.json({ ok: false, error: '无管理员权限' }, 403)

    // Get current status
    const user = await db.prepare('SELECT id, name, status FROM users WHERE id = ?').bind(userId).first<{ id: string; name: string; status: string }>()
    if (!user) return c.json({ ok: false, error: '用户不存在' }, 404)

    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    await db.prepare('UPDATE users SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').bind(newStatus, userId).run()

    await logAudit(db, {
      userId: adminId, action: 'toggle_user_status',
      entityType: 'user', entityId: userId,
      detail: { userName: user.name, from: user.status, to: newStatus },
    })

    return c.json({ ok: true, data: { newStatus }, message: newStatus === 'active' ? '已启用' : '已禁用' })
  } catch (e: any) {
    return c.json({ ok: false, error: '操作失败: ' + (e.message || '') }, 500)
  }
})

/**
 * POST /api/admin/members/:id/approve
 * Body: { adminId: string }
 * 审核通过待审批的自注册学员
 */
adminApi.post('/members/:id/approve', async (c) => {
  const db = c.env.DB
  const userId = c.req.param('id')
  try {
    const { adminId } = await c.req.json<{ adminId: string }>()

    const admin = await db.prepare('SELECT role FROM users WHERE id = ?').bind(adminId).first<{ role: string }>()
    if (!admin || admin.role !== 'admin') return c.json({ ok: false, error: '无管理员权限' }, 403)

    const user = await db.prepare('SELECT id, name, status, phone FROM users WHERE id = ?').bind(userId).first<{ id: string; name: string; status: string; phone: string }>()
    if (!user) return c.json({ ok: false, error: '用户不存在' }, 404)
    if (user.status !== 'pending') return c.json({ ok: false, error: '该用户不在待审核状态' }, 400)

    await db.prepare('UPDATE users SET status = \'active\', updated_at = datetime(\'now\') WHERE id = ?').bind(userId).run()

    await logAudit(db, {
      userId: adminId, action: 'approve_registration',
      entityType: 'user', entityId: userId,
      detail: { userName: user.name, phone: user.phone },
    })

    // Create notification for the user
    await createNotification(db, {
      type: 'system',
      title: '注册审核通过',
      content: '您的账号已通过审核，可以登录使用中流通平台了',
      targetId: userId,
      icon: '✅',
    })

    return c.json({ ok: true, message: '已通过 ' + user.name + ' 的注册申请' })
  } catch (e: any) {
    return c.json({ ok: false, error: '审核失败: ' + (e.message || '') }, 500)
  }
})

/**
 * POST /api/admin/members/:id/reject
 * Body: { adminId: string, reason?: string }
 * 拒绝待审批的自注册学员
 */
adminApi.post('/members/:id/reject', async (c) => {
  const db = c.env.DB
  const userId = c.req.param('id')
  try {
    const { adminId, reason } = await c.req.json<{ adminId: string; reason?: string }>()

    const admin = await db.prepare('SELECT role FROM users WHERE id = ?').bind(adminId).first<{ role: string }>()
    if (!admin || admin.role !== 'admin') return c.json({ ok: false, error: '无管理员权限' }, 403)

    const user = await db.prepare('SELECT id, name, status, phone FROM users WHERE id = ?').bind(userId).first<{ id: string; name: string; status: string; phone: string }>()
    if (!user) return c.json({ ok: false, error: '用户不存在' }, 404)
    if (user.status !== 'pending') return c.json({ ok: false, error: '该用户不在待审核状态' }, 400)

    // Delete related records first (audit logs, notifications), then user
    // Or safer: just delete the user and clean up FKs
    try {
      await db.prepare('DELETE FROM audit_logs WHERE user_id = ?').bind(userId).run()
      await db.prepare('DELETE FROM notifications WHERE target_id = ?').bind(userId).run()
      await db.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId).run()
      await db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run()
    } catch (fkErr: any) {
      // If FK still fails, just mark as rejected/inactive instead of deleting
      await db.prepare("UPDATE users SET status = 'inactive', bio = ? WHERE id = ?")
        .bind('已拒绝: ' + (reason || '管理员拒绝') + ' | 原: ' + (user.bio || ''), userId).run()
    }

    await logAudit(db, {
      userId: adminId, action: 'reject_registration',
      entityType: 'user', entityId: userId,
      detail: { userName: user.name, phone: user.phone, reason: reason || '' },
    })

    return c.json({ ok: true, message: '已拒绝 ' + user.name + ' 的注册申请' })
  } catch (e: any) {
    return c.json({ ok: false, error: '操作失败: ' + (e.message || '') }, 500)
  }
})

/**
 * POST /api/admin/members/:id/update
 * Body: { adminId: string, name?: string, company?: string, title?: string, className?: string }
 * 管理员编辑学员信息
 */
adminApi.post('/members/:id/update', async (c) => {
  const db = c.env.DB
  const userId = c.req.param('id')
  try {
    const { adminId, name, company, title, className, industry } = await c.req.json<{
      adminId: string; name?: string; company?: string; title?: string; className?: string; industry?: string
    }>()

    const admin = await db.prepare('SELECT role FROM users WHERE id = ?').bind(adminId).first<{ role: string }>()
    if (!admin || admin.role !== 'admin') return c.json({ ok: false, error: '无管理员权限' }, 403)

    const user = await db.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first()
    if (!user) return c.json({ ok: false, error: '用户不存在' }, 404)

    const updates: string[] = []
    const values: any[] = []

    if (name) { updates.push('name = ?'); values.push(name) }
    if (company !== undefined) { updates.push('company = ?'); values.push(company) }
    if (title !== undefined) { updates.push('title = ?'); values.push(title) }
    if (industry !== undefined) { updates.push('industry = ?'); values.push(industry) }
    if (className) {
      const classId = 'class-' + className.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')
      updates.push('class_name = ?'); values.push(className)
      updates.push('class_id = ?'); values.push(classId)
      updates.push('cohort = ?'); values.push(className)
    }

    if (updates.length === 0) return c.json({ ok: false, error: '没有要更新的字段' }, 400)

    updates.push("updated_at = datetime('now')")
    values.push(userId)

    await db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run()

    return c.json({ ok: true, message: '更新成功' })
  } catch (e: any) {
    return c.json({ ok: false, error: '更新失败: ' + (e.message || '') }, 500)
  }
})

export default adminApi
