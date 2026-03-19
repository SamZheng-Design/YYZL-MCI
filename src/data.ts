// ============================================================
// 中流通 ZhongLiu Connect — Mock 数据层
// ============================================================

// ── 学员类型 ──────────────────────────────────────────────
export interface Member {
  id: string
  phone: string
  name: string
  company: string
  industry: string
  title: string
  bio: string
  cohort: string
  status: 'active' | 'inactive'
  joinDate: string
  role?: 'member' | 'admin'
  classId?: string
  className?: string
}

// ── 老师类型 ──────────────────────────────────────────────
export interface Teacher {
  id: string
  name: string
  phone: string
  avatar: string | null
  classIds: string[]
  role: 'teacher'
  status: 'active' | 'inactive'
}

export const mockMembers: Member[] = [
  {
    id: 'm-001', phone: '13888888888', name: '张建国', company: '星火餐饮集团',
    industry: '餐饮连锁', title: '董事长',
    bio: '20年餐饮连锁经验，全国120家门店', cohort: '第12期', status: 'active', joinDate: '2024-03-15',
    classId: 'class-12', className: '第12期',
  },
  {
    id: 'm-002', phone: '13966666666', name: '李明远', company: '新锐智造科技',
    industry: '智能制造', title: '创始人/CEO',
    bio: '前华为供应链总监，专注工业自动化', cohort: '第10期', status: 'active', joinDate: '2023-09-20',
    classId: 'class-10', className: '第10期',
  },
  {
    id: 'm-003', phone: '13733333333', name: '王晓薇', company: '优学教育科技',
    industry: '教育培训', title: '创始人',
    bio: '前新东方区域总监，AI教育创业者', cohort: '第14期', status: 'active', joinDate: '2025-01-10',
    classId: 'class-14', className: '第14期',
  },
  {
    id: 'm-004', phone: '13611111111', name: '陈伟强', company: '鼎盛供应链',
    industry: '物流供应链', title: '董事长',
    bio: '华东地区冷链物流龙头，年营收5亿', cohort: '第8期', status: 'active', joinDate: '2023-03-08',
    classId: 'class-08', className: '第8期',
  },
  {
    id: 'm-005', phone: '13599999999', name: '赵丽华', company: '芙蓉美业集团',
    industry: '美容健康', title: '创始人/CEO',
    bio: '全国50+美容门店，年营收2亿', cohort: '第11期', status: 'active', joinDate: '2024-01-22',
    classId: 'class-11', className: '第11期',
  },
  {
    id: 'm-admin', phone: '18000000000', name: '管理员', company: '一亿中流',
    industry: '平台管理', title: '平台管理员',
    bio: '一亿中流平台管理员', cohort: '管理团队', status: 'active', joinDate: '2023-01-01', role: 'admin',
    classId: 'class-admin', className: '管理组',
  },
]

// ── 老师数据 ──────────────────────────────────────────────
export const mockTeachers: Teacher[] = [
  { id: 't-001', name: '刘老师', phone: '18011111111', avatar: null, classIds: ['class-12', 'class-14'], role: 'teacher', status: 'active' },
  { id: 't-002', name: '陈老师', phone: '18022222222', avatar: null, classIds: ['class-10', 'class-11'], role: 'teacher', status: 'active' },
  { id: 't-003', name: '周老师', phone: '18033333333', avatar: null, classIds: ['class-08'], role: 'teacher', status: 'active' },
]

// ── 班级工具函数 ─────────────────────────────────────────
export function getTeacherForMember(member: Member): Teacher | null {
  return mockTeachers.find(t => member.classId ? t.classIds.includes(member.classId) : false) || null
}

export function isSameClass(memberA: Member, memberB: Member): boolean {
  return !!memberA.classId && memberA.classId === memberB.classId
}

// ── 项目类型 ──────────────────────────────────────────────
export interface Project {
  id: string
  name: string
  ownerId: string
  industry: string
  description: string
  targetAmount: number        // 目标金额 (万)
  raisedAmount: number        // 已募金额 (万)
  revenueShareRate: number    // 分成比例 %
  duration: number            // 联营期限 (月)
  recoveryMultiple: number    // 回收倍数
  estimatedMonthlyRevenue: number // 预估月收入 (万)
  totalShares: number         // 总份数
  raisedShares: number        // 已募份数
  sharePrice: number          // 每份金额 (万)
  minShares: number           // 最低参与份数
  status: 'open' | 'funded' | 'active' | 'completed'
  createdAt: string
  investors: string[]
  shareCode?: string
  initiatorClassId?: string
  initiatorClassName?: string
  recommendedByTeacher?: string[]
  viewCount?: number
}

export const mockProjects: Project[] = [
  {
    id: 'p-001', name: '星火餐饮华南区20店扩张', ownerId: 'm-001',
    industry: '餐饮连锁', shareCode: 'TH2K9A', initiatorClassId: 'class-12', initiatorClassName: '第12期',
    description: '计划在广深佛莞新开20家直营门店，单店面积80-120㎡，聚焦社区快餐赛道。已完成选址和团队组建，预计6个月内全部开业。',
    targetAmount: 500, raisedAmount: 380, revenueShareRate: 8.5, duration: 36,
    recoveryMultiple: 1.4, estimatedMonthlyRevenue: 180,
    totalShares: 50, raisedShares: 38, sharePrice: 10, minShares: 1,
    status: 'open', createdAt: '2026-03-10',
    investors: ['m-002', 'm-004', 'm-005'],
    viewCount: 47,
  },
  {
    id: 'p-002', name: '工业视觉检测新产线', ownerId: 'm-002',
    industry: '智能制造', shareCode: 'MF7R3B', initiatorClassId: 'class-10', initiatorClassName: '第10期',
    recommendedByTeacher: ['t-002'],
    description: '引进第四代柔性产线，提升产能40%，降低人工成本30%。已与德国设备商签订采购意向书，预计产线3个月内投产。',
    targetAmount: 150, raisedAmount: 150, revenueShareRate: 15.0, duration: 36,
    recoveryMultiple: 1.5, estimatedMonthlyRevenue: 320,
    totalShares: 6, raisedShares: 6, sharePrice: 25, minShares: 1,
    status: 'active', createdAt: '2026-01-15',
    investors: ['m-001', 'm-004', 'm-005'],
    viewCount: 128,
  },
  {
    id: 'p-003', name: '优学AI双师课堂全国推广', ownerId: 'm-003',
    industry: '教育培训', shareCode: 'HG4N8C', initiatorClassId: 'class-11', initiatorClassName: '第11期',
    description: 'AI+真人双师模式，目标覆盖100个三四线城市学习中心。已在15个城市验证模型，单中心月均营收8万，利润率40%。',
    targetAmount: 300, raisedAmount: 120, revenueShareRate: 10.0, duration: 24,
    recoveryMultiple: 1.6, estimatedMonthlyRevenue: 95,
    totalShares: 30, raisedShares: 12, sharePrice: 10, minShares: 1,
    status: 'open', createdAt: '2026-03-15',
    investors: ['m-001'],
    viewCount: 35,
  },
  {
    id: 'p-004', name: '鼎盛冷链华东仓网优化', ownerId: 'm-004',
    industry: '物流供应链', shareCode: 'CL9P5D', initiatorClassId: 'class-08', initiatorClassName: '第8期',
    description: '新建3个智能冷库节点，覆盖长三角95%区域次日达。已获得土地审批和环评通过，一期仓库预计8个月建成投产。',
    targetAmount: 1200, raisedAmount: 900, revenueShareRate: 6.5, duration: 60,
    recoveryMultiple: 1.3, estimatedMonthlyRevenue: 480,
    totalShares: 60, raisedShares: 45, sharePrice: 20, minShares: 1,
    status: 'open', createdAt: '2026-03-05',
    investors: ['m-001', 'm-002', 'm-005'],
    viewCount: 89,
  },
  {
    id: 'p-005', name: 'AI英语口语APP开发', ownerId: 'm-003',
    industry: '教育培训', shareCode: 'ED6W2E', initiatorClassId: 'class-14', initiatorClassName: '第14期',
    description: '基于大模型的英语口语练习APP，目标覆盖K12和成人学习群体。已完成MVP开发，用户增长迅速。',
    targetAmount: 25, raisedAmount: 25, revenueShareRate: 8.0, duration: 24,
    recoveryMultiple: 1.5, estimatedMonthlyRevenue: 12,
    totalShares: 5, raisedShares: 5, sharePrice: 5, minShares: 1,
    status: 'active', createdAt: '2026-02-10',
    investors: ['m-001', 'm-004'],
    viewCount: 62,
  },
]

// ── 回款记录类型（首页动态用） ─────────────────────────────
export interface Repayment {
  id: string
  projectId: string
  projectName: string
  amount: number
  date: string
  investorId: string
}

export const mockRepayments: Repayment[] = [
  { id: 'r-001', projectId: 'p-005', projectName: '芙蓉美业旗舰店升级计划', amount: 3.60, date: '2026-03-18', investorId: 'm-001' },
  { id: 'r-002', projectId: 'p-002', projectName: '工业视觉检测新产线', amount: 5.60, date: '2026-03-17', investorId: 'm-001' },
  { id: 'r-003', projectId: 'p-005', projectName: '芙蓉美业旗舰店升级计划', amount: 3.60, date: '2026-03-16', investorId: 'm-002' },
  { id: 'r-004', projectId: 'p-002', projectName: '工业视觉检测新产线', amount: 5.60, date: '2026-03-15', investorId: 'm-003' },
  { id: 'r-005', projectId: 'p-005', projectName: '芙蓉美业旗舰店升级计划', amount: 3.60, date: '2026-03-14', investorId: 'm-003' },
  { id: 'r-006', projectId: 'p-002', projectName: '工业视觉检测新产线', amount: 5.60, date: '2026-03-13', investorId: 'm-004' },
  { id: 'r-007', projectId: 'p-005', projectName: '芙蓉美业旗舰店升级计划', amount: 2.40, date: '2026-03-12', investorId: 'm-005' },
  { id: 'r-008', projectId: 'p-002', projectName: '工业视觉检测新产线', amount: 5.60, date: '2026-03-11', investorId: 'm-005' },
  { id: 'r-009', projectId: 'p-005', projectName: '芙蓉美业旗舰店升级计划', amount: 3.20, date: '2026-03-10', investorId: 'm-001' },
  { id: 'r-010', projectId: 'p-002', projectName: '工业视觉检测新产线', amount: 4.80, date: '2026-03-08', investorId: 'm-001' },
]

// ── 合同类型 ──────────────────────────────────────────────
export interface Contract {
  id: string
  projectId: string
  projectName: string
  initiatorId: string
  initiatorName: string
  initiatorCompany?: string
  participantId: string
  participantName: string
  amount: number
  shares: number
  revenueShareRatio: number
  cooperationTerm: number
  recoveryCap: number
  signedByInitiator: boolean
  signedByParticipant: boolean
  signedAt: string
  totalRepaid: number
  status: 'pending' | 'active' | 'completed'
}

export const mockContracts: Contract[] = [
  {
    id: 'c-001', projectId: 'p-002', projectName: '工业视觉检测新产线',
    initiatorId: 'm-002', initiatorName: '李明远', initiatorCompany: '新锐智造科技',
    participantId: 'm-004', participantName: '陈伟强',
    amount: 50, shares: 2, revenueShareRatio: 15, cooperationTerm: 36,
    recoveryCap: 75, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2026-02-01', totalRepaid: 2.85, status: 'active',
  },
  {
    id: 'c-002', projectId: 'p-002', projectName: '工业视觉检测新产线',
    initiatorId: 'm-002', initiatorName: '李明远', initiatorCompany: '新锐智造科技',
    participantId: 'm-005', participantName: '赵丽华',
    amount: 25, shares: 1, revenueShareRatio: 15, cooperationTerm: 36,
    recoveryCap: 37.5, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2026-02-01', totalRepaid: 1.425, status: 'active',
  },
  {
    id: 'c-003', projectId: 'p-002', projectName: '工业视觉检测新产线',
    initiatorId: 'm-002', initiatorName: '李明远', initiatorCompany: '新锐智造科技',
    participantId: 'm-001', participantName: '张建国',
    amount: 75, shares: 3, revenueShareRatio: 15, cooperationTerm: 36,
    recoveryCap: 112.5, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2026-02-01', totalRepaid: 4.275, status: 'active',
  },
  {
    id: 'c-004', projectId: 'p-005', projectName: 'AI英语口语APP开发',
    initiatorId: 'm-003', initiatorName: '王晓薇', initiatorCompany: '优学教育科技',
    participantId: 'm-001', participantName: '张建国',
    amount: 10, shares: 2, revenueShareRatio: 8, cooperationTerm: 24,
    recoveryCap: 15, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2026-02-20', totalRepaid: 0.192, status: 'active',
  },
  {
    id: 'c-005', projectId: 'p-005', projectName: 'AI英语口语APP开发',
    initiatorId: 'm-003', initiatorName: '王晓薇', initiatorCompany: '优学教育科技',
    participantId: 'm-004', participantName: '陈伟强',
    amount: 15, shares: 3, revenueShareRatio: 8, cooperationTerm: 24,
    recoveryCap: 22.5, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2026-02-20', totalRepaid: 0.288, status: 'active',
  },
]

// ── 收入上报记录 ──────────────────────────────────────────
export interface RevenueReport {
  id: string
  projectId: string
  reportedBy: string
  period: string
  periodType: 'monthly' | 'daily'
  totalRevenue: number
  totalShareAmount: number
  reportedAt: string
  note?: string
}

export const mockRevenueReports: RevenueReport[] = [
  { id: 'rr-001', projectId: 'p-002', reportedBy: 'm-002', period: '2025-12', periodType: 'monthly', totalRevenue: 32, totalShareAmount: 4.8, reportedAt: '2025-12-31' },
  { id: 'rr-002', projectId: 'p-002', reportedBy: 'm-002', period: '2026-01', periodType: 'monthly', totalRevenue: 48, totalShareAmount: 7.2, reportedAt: '2026-01-31' },
  { id: 'rr-003', projectId: 'p-002', reportedBy: 'm-002', period: '2026-02', periodType: 'monthly', totalRevenue: 52, totalShareAmount: 7.8, reportedAt: '2026-02-28' },
  { id: 'rr-004', projectId: 'p-002', reportedBy: 'm-002', period: '2026-03', periodType: 'monthly', totalRevenue: 58, totalShareAmount: 8.7, reportedAt: '2026-03-15' },
  { id: 'rr-005', projectId: 'p-005', reportedBy: 'm-003', period: '2026-03', periodType: 'monthly', totalRevenue: 12, totalShareAmount: 0.96, reportedAt: '2026-03-15' },
]

// ── 回款明细记录 ──────────────────────────────────────────
export interface RepaymentRecord {
  id: string
  contractId: string
  revenueReportId: string
  participantId: string
  projectName: string
  date: string
  projectRevenue: number
  shareAmount: number
  cumulativeShare: number
  recoveryProgress: number
}

export const mockRepaymentRecords: RepaymentRecord[] = [
  // m-004 在 p-002 的回款 (50万/150万 = 1/3 of 15% share)
  { id: 'rep-001', contractId: 'c-001', revenueReportId: 'rr-001', participantId: 'm-004', projectName: '工业视觉检测新产线', date: '2025-12-31', projectRevenue: 32, shareAmount: 1.60, cumulativeShare: 1.60, recoveryProgress: 2.13 },
  { id: 'rep-002', contractId: 'c-001', revenueReportId: 'rr-002', participantId: 'm-004', projectName: '工业视觉检测新产线', date: '2026-01-31', projectRevenue: 48, shareAmount: 2.40, cumulativeShare: 4.00, recoveryProgress: 5.33 },
  { id: 'rep-003', contractId: 'c-001', revenueReportId: 'rr-003', participantId: 'm-004', projectName: '工业视觉检测新产线', date: '2026-02-28', projectRevenue: 52, shareAmount: 2.60, cumulativeShare: 6.60, recoveryProgress: 8.80 },
  { id: 'rep-004', contractId: 'c-001', revenueReportId: 'rr-004', participantId: 'm-004', projectName: '工业视觉检测新产线', date: '2026-03-15', projectRevenue: 58, shareAmount: 2.90, cumulativeShare: 9.50, recoveryProgress: 12.67 },
  // m-005 在 p-002 的回款 (25万/150万 = 1/6)
  { id: 'rep-005', contractId: 'c-002', revenueReportId: 'rr-001', participantId: 'm-005', projectName: '工业视觉检测新产线', date: '2025-12-31', projectRevenue: 32, shareAmount: 0.80, cumulativeShare: 0.80, recoveryProgress: 2.13 },
  { id: 'rep-006', contractId: 'c-002', revenueReportId: 'rr-002', participantId: 'm-005', projectName: '工业视觉检测新产线', date: '2026-01-31', projectRevenue: 48, shareAmount: 1.20, cumulativeShare: 2.00, recoveryProgress: 5.33 },
  { id: 'rep-007', contractId: 'c-002', revenueReportId: 'rr-003', participantId: 'm-005', projectName: '工业视觉检测新产线', date: '2026-02-28', projectRevenue: 52, shareAmount: 1.30, cumulativeShare: 3.30, recoveryProgress: 8.80 },
  { id: 'rep-008', contractId: 'c-002', revenueReportId: 'rr-004', participantId: 'm-005', projectName: '工业视觉检测新产线', date: '2026-03-15', projectRevenue: 58, shareAmount: 1.45, cumulativeShare: 4.75, recoveryProgress: 12.67 },
  // m-001 在 p-002 的回款 (75万/150万 = 1/2)
  { id: 'rep-009', contractId: 'c-003', revenueReportId: 'rr-001', participantId: 'm-001', projectName: '工业视觉检测新产线', date: '2025-12-31', projectRevenue: 32, shareAmount: 2.40, cumulativeShare: 2.40, recoveryProgress: 2.13 },
  { id: 'rep-010', contractId: 'c-003', revenueReportId: 'rr-002', participantId: 'm-001', projectName: '工业视觉检测新产线', date: '2026-01-31', projectRevenue: 48, shareAmount: 3.60, cumulativeShare: 6.00, recoveryProgress: 5.33 },
  { id: 'rep-011', contractId: 'c-003', revenueReportId: 'rr-003', participantId: 'm-001', projectName: '工业视觉检测新产线', date: '2026-02-28', projectRevenue: 52, shareAmount: 3.90, cumulativeShare: 9.90, recoveryProgress: 8.80 },
  { id: 'rep-012', contractId: 'c-003', revenueReportId: 'rr-004', participantId: 'm-001', projectName: '工业视觉检测新产线', date: '2026-03-15', projectRevenue: 58, shareAmount: 4.35, cumulativeShare: 14.25, recoveryProgress: 12.67 },
  // m-001 在 p-005 的回款 (10万/25万 = 2/5)
  { id: 'rep-013', contractId: 'c-004', revenueReportId: 'rr-005', participantId: 'm-001', projectName: 'AI英语口语APP开发', date: '2026-03-15', projectRevenue: 12, shareAmount: 0.384, cumulativeShare: 0.384, recoveryProgress: 2.56 },
  // m-004 在 p-005 的回款 (15万/25万 = 3/5)
  { id: 'rep-014', contractId: 'c-005', revenueReportId: 'rr-005', participantId: 'm-004', projectName: 'AI英语口语APP开发', date: '2026-03-15', projectRevenue: 12, shareAmount: 0.576, cumulativeShare: 0.576, recoveryProgress: 2.56 },
]

// ── 回款分配计算 ─────────────────────────────────────────
export interface DistributionResult {
  contractId: string
  participantId: string
  participantName: string
  investAmount: number
  shareAmount: number
  newCumulative: number
  recoveryProgress: number
  isCompleted: boolean
}

export function distributeRevenue(
  projectRevenue: number,
  revenueShareRatio: number,
  contracts: Contract[]
): DistributionResult[] {
  const totalShareAmount = projectRevenue * (revenueShareRatio / 100)
  const totalInvested = contracts.reduce((s, c) => s + c.amount, 0)
  return contracts.map(c => {
    const ratio = c.amount / totalInvested
    let share = +(totalShareAmount * ratio).toFixed(4)
    const newCumulative = +(c.totalRepaid + share).toFixed(4)
    if (newCumulative > c.recoveryCap) {
      share = +(c.recoveryCap - c.totalRepaid).toFixed(4)
      if (share < 0) share = 0
    }
    return {
      contractId: c.id,
      participantId: c.participantId,
      participantName: c.participantName,
      investAmount: c.amount,
      shareAmount: share,
      newCumulative: +(c.totalRepaid + share).toFixed(4),
      recoveryProgress: +((c.totalRepaid + share) / c.recoveryCap * 100).toFixed(2),
      isCompleted: (c.totalRepaid + share) >= c.recoveryCap,
    }
  })
}

// ── RBF 计算函数 ─────────────────────────────────────────
export interface RBFResult {
  recoveryCap: number     // 回收上限 (万)
  monthlyShare: number    // 月回款 (万)
  paybackMonths: number   // 预估回收期 (月)
}

export function calculateRBF(
  totalAmount: number,
  revenueShareRate: number,
  estimatedMonthlyRevenue: number,
  recoveryMultiple: number
): RBFResult {
  const recoveryCap = totalAmount * recoveryMultiple
  const monthlyShare = estimatedMonthlyRevenue * (revenueShareRate / 100)
  const paybackMonths = monthlyShare > 0 ? Math.ceil(totalAmount / monthlyShare) : 0
  return { recoveryCap, monthlyShare, paybackMonths }
}

// ── 项目大厅统计 ─────────────────────────────────────────
export function getProjectStats() {
  const openCount = mockProjects.filter(p => p.status === 'open').length
  const activeCount = mockProjects.filter(p => p.status === 'active' || p.status === 'funded').length
  const totalRaised = mockProjects.reduce((s, p) => s + p.raisedAmount, 0)
  const totalRepaid = mockRepayments.reduce((s, r) => s + r.amount, 0)
  return {
    openCount,
    activeCount,
    totalRaised: Math.round(totalRaised),
    totalRepaid: Math.round(totalRepaid * 100) / 100,
  }
}

// ── 用户统计 helper ──────────────────────────────────────
export function getUserStats(userId: string) {
  const initiated = mockProjects.filter(p => p.ownerId === userId).length
  const invested = mockProjects.filter(p => p.investors.includes(userId)).length
  const totalInvested = mockProjects
    .filter(p => p.investors.includes(userId))
    .reduce((sum, p) => sum + Math.round(p.raisedAmount / p.investors.length), 0)
  const totalRepaid = mockRepayments
    .filter(r => r.investorId === userId)
    .reduce((sum, r) => sum + r.amount, 0)
  return { initiated, invested, totalInvested, totalRepaid: Math.round(totalRepaid * 100) / 100 }
}

// ── 分享码查找 ──────────────────────────────────────────
export function findProjectByShareCode(code: string): Project | null {
  return mockProjects.find(p => p.shareCode === code.toUpperCase()) || null
}

// ── 关系标签 ────────────────────────────────────────────
export interface RelationTag {
  text: string
  type: 'gold' | 'green' | 'gray'
}

export function getRelationTag(project: Project, currentUser: { classId?: string }): RelationTag {
  const myTeacher = currentUser.classId
    ? mockTeachers.find(t => t.classIds.includes(currentUser.classId!))
    : null
  // 优先级1: 老师推荐
  if (myTeacher && project.recommendedByTeacher && project.recommendedByTeacher.includes(myTeacher.id)) {
    return { text: '🌟 老师推荐', type: 'gold' }
  }
  // 优先级2: 同班同学
  if (project.initiatorClassId && project.initiatorClassId === currentUser.classId) {
    return { text: '同班 · ' + (project.initiatorClassName || ''), type: 'green' }
  }
  // 优先级3: 其他期
  return { text: project.initiatorClassName || '', type: 'gray' }
}

// ── 智能排序 ────────────────────────────────────────────
export function getRelevanceScore(
  project: Project,
  currentUser: { classId?: string },
  myTeacher: Teacher | null
): number {
  let score = 0
  if (project.initiatorClassId === currentUser.classId) score += 30
  if (myTeacher && project.recommendedByTeacher && project.recommendedByTeacher.includes(myTeacher.id)) score += 20
  if (project.status === 'open') score += 10
  if (project.status === 'active') score += 5
  return score
}

// ── 引荐数据模型 ────────────────────────────────────────
export interface Referral {
  id: string
  projectId: string
  projectName: string
  requesterId: string
  requesterName: string
  requesterClassName: string
  initiatorId: string
  initiatorName: string
  initiatorClassName: string
  teacherId: string
  teacherName: string
  message: string
  status: 'pending' | 'connected' | 'declined'
  requestedAt: string
  connectedAt: string | null
}

export const mockReferrals: Referral[] = []

// Demo 验证码
export const DEMO_VERIFY_CODE = '888888'
