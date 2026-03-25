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

export default adminApi
