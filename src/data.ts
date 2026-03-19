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
}

export const mockMembers: Member[] = [
  {
    id: 'm-001', phone: '13888888888', name: '张建国', company: '星火餐饮集团',
    industry: '餐饮连锁', title: '董事长',
    bio: '20年餐饮连锁经验，全国120家门店', cohort: '第12期', status: 'active', joinDate: '2024-03-15',
  },
  {
    id: 'm-002', phone: '13966666666', name: '李明远', company: '新锐智造科技',
    industry: '智能制造', title: '创始人/CEO',
    bio: '前华为供应链总监，专注工业自动化', cohort: '第10期', status: 'active', joinDate: '2023-09-20',
  },
  {
    id: 'm-003', phone: '13733333333', name: '王晓薇', company: '优学教育科技',
    industry: '教育培训', title: '创始人',
    bio: '前新东方区域总监，AI教育创业者', cohort: '第14期', status: 'active', joinDate: '2025-01-10',
  },
  {
    id: 'm-004', phone: '13611111111', name: '陈伟强', company: '鼎盛供应链',
    industry: '物流供应链', title: '董事长',
    bio: '华东地区冷链物流龙头，年营收5亿', cohort: '第8期', status: 'active', joinDate: '2023-03-08',
  },
  {
    id: 'm-005', phone: '13599999999', name: '赵丽华', company: '芙蓉美业集团',
    industry: '美容健康', title: '创始人/CEO',
    bio: '全国50+美容门店，年营收2亿', cohort: '第11期', status: 'active', joinDate: '2024-01-22',
  },
]

// ── 项目类型 ──────────────────────────────────────────────
export interface Project {
  id: string
  name: string
  ownerId: string        // 发起人 member ID
  industry: string
  description: string
  targetAmount: number   // 目标金额 (万)
  raisedAmount: number   // 已募金额 (万)
  revenueShareRate: number // 分成比例 %
  duration: number       // 回款周期 (月)
  status: 'open' | 'funded' | 'active' | 'completed'
  createdAt: string
  investors: string[]    // 参与投资的 member IDs
}

export const mockProjects: Project[] = [
  {
    id: 'p-001', name: '星火餐饮华南区20店扩张', ownerId: 'm-001',
    industry: '餐饮连锁',
    description: '计划在广深佛莞新开20家直营门店，单店面积80-120㎡，聚焦社区快餐赛道。',
    targetAmount: 500, raisedAmount: 380, revenueShareRate: 8.5, duration: 36,
    status: 'open', createdAt: '2026-03-10',
    investors: ['m-002', 'm-004', 'm-005'],
  },
  {
    id: 'p-002', name: '新锐智造产线升级项目', ownerId: 'm-002',
    industry: '智能制造',
    description: '引进第四代柔性产线，提升产能40%，降低人工成本30%。',
    targetAmount: 800, raisedAmount: 800, revenueShareRate: 7.0, duration: 48,
    status: 'funded', createdAt: '2026-02-18',
    investors: ['m-001', 'm-003', 'm-004', 'm-005'],
  },
  {
    id: 'p-003', name: '优学AI双师课堂全国推广', ownerId: 'm-003',
    industry: '教育培训',
    description: 'AI+真人双师模式，目标覆盖100个三四线城市学习中心。',
    targetAmount: 300, raisedAmount: 120, revenueShareRate: 10.0, duration: 24,
    status: 'open', createdAt: '2026-03-15',
    investors: ['m-001'],
  },
  {
    id: 'p-004', name: '鼎盛冷链华东仓网优化', ownerId: 'm-004',
    industry: '物流供应链',
    description: '新建3个智能冷库节点，覆盖长三角95%区域次日达。',
    targetAmount: 1200, raisedAmount: 900, revenueShareRate: 6.5, duration: 60,
    status: 'open', createdAt: '2026-03-05',
    investors: ['m-001', 'm-002', 'm-005'],
  },
  {
    id: 'p-005', name: '芙蓉美业旗舰店升级计划', ownerId: 'm-005',
    industry: '美容健康',
    description: '一线城市10家门店升级为旗舰体验中心，客单价提升60%。',
    targetAmount: 400, raisedAmount: 400, revenueShareRate: 9.0, duration: 30,
    status: 'active', createdAt: '2026-01-20',
    investors: ['m-001', 'm-002', 'm-003'],
  },
]

// ── 回款记录类型 ──────────────────────────────────────────
export interface Repayment {
  id: string
  projectId: string
  projectName: string
  amount: number       // 万元
  date: string
  investorId: string   // 收款人
}

export const mockRepayments: Repayment[] = [
  { id: 'r-001', projectId: 'p-005', projectName: '芙蓉美业旗舰店升级计划', amount: 3.60, date: '2026-03-18', investorId: 'm-001' },
  { id: 'r-002', projectId: 'p-002', projectName: '新锐智造产线升级项目', amount: 5.60, date: '2026-03-17', investorId: 'm-001' },
  { id: 'r-003', projectId: 'p-005', projectName: '芙蓉美业旗舰店升级计划', amount: 3.60, date: '2026-03-16', investorId: 'm-002' },
  { id: 'r-004', projectId: 'p-002', projectName: '新锐智造产线升级项目', amount: 5.60, date: '2026-03-15', investorId: 'm-003' },
  { id: 'r-005', projectId: 'p-005', projectName: '芙蓉美业旗舰店升级计划', amount: 3.60, date: '2026-03-14', investorId: 'm-003' },
  { id: 'r-006', projectId: 'p-002', projectName: '新锐智造产线升级项目', amount: 5.60, date: '2026-03-13', investorId: 'm-004' },
  { id: 'r-007', projectId: 'p-005', projectName: '芙蓉美业旗舰店升级计划', amount: 2.40, date: '2026-03-12', investorId: 'm-005' },
  { id: 'r-008', projectId: 'p-002', projectName: '新锐智造产线升级项目', amount: 5.60, date: '2026-03-11', investorId: 'm-005' },
  { id: 'r-009', projectId: 'p-005', projectName: '芙蓉美业旗舰店升级计划', amount: 3.20, date: '2026-03-10', investorId: 'm-001' },
  { id: 'r-010', projectId: 'p-002', projectName: '新锐智造产线升级项目', amount: 4.80, date: '2026-03-08', investorId: 'm-001' },
]

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

// Demo 验证码
export const DEMO_VERIFY_CODE = '888888'
