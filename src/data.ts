// ============================================================
// 中流通 ZhongLiu Connect — Mock 学员数据
// ============================================================

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
}

export const mockMembers: Member[] = [
  {
    id: 'm-001',
    phone: '13888888888',
    name: '张建国',
    company: '星火餐饮集团',
    industry: '餐饮连锁',
    title: '董事长',
    bio: '20年餐饮连锁经验，全国120家门店',
    cohort: '第12期',
    status: 'active',
  },
  {
    id: 'm-002',
    phone: '13966666666',
    name: '李明远',
    company: '新锐智造科技',
    industry: '智能制造',
    title: '创始人/CEO',
    bio: '前华为供应链总监，专注工业自动化',
    cohort: '第10期',
    status: 'active',
  },
  {
    id: 'm-003',
    phone: '13733333333',
    name: '王晓薇',
    company: '优学教育科技',
    industry: '教育培训',
    title: '创始人',
    bio: '前新东方区域总监，AI教育创业者',
    cohort: '第14期',
    status: 'active',
  },
  {
    id: 'm-004',
    phone: '13611111111',
    name: '陈伟强',
    company: '鼎盛供应链',
    industry: '物流供应链',
    title: '董事长',
    bio: '华东地区冷链物流龙头，年营收5亿',
    cohort: '第8期',
    status: 'active',
  },
  {
    id: 'm-005',
    phone: '13599999999',
    name: '赵丽华',
    company: '芙蓉美业集团',
    industry: '美容健康',
    title: '创始人/CEO',
    bio: '全国50+美容门店，年营收2亿',
    cohort: '第11期',
    status: 'active',
  },
]

// Demo 验证码
export const DEMO_VERIFY_CODE = '888888'
