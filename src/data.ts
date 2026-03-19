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
  title?: string
  bio?: string
}

export const mockMembers: Member[] = [
  // ── 任务一：已有学员（更新 company/industry/title/bio） ──
  {
    id: 'm-001', phone: '13800001111', name: '张明远', company: '明远餐饮集团',
    industry: '餐饮连锁', title: '创始人兼CEO',
    bio: '深耕华南餐饮18年，旗下「明远·粤味」连锁品牌覆盖广深佛莞18家直营门店，年营收1.2亿',
    cohort: '第12期', status: 'active', joinDate: '2024-03-15',
    classId: 'class-12', className: '第12期',
  },
  {
    id: 'm-002', phone: '13800002222', name: '李芳华', company: '芳华供应链科技',
    industry: '供应链管理', title: '董事长',
    bio: '前顺丰供应链高管，2019年创立芳华供应链，专注生鲜冷链最后一公里，服务3000+商户',
    cohort: '第12期', status: 'active', joinDate: '2024-03-15',
    classId: 'class-12', className: '第12期',
  },
  {
    id: 'm-003', phone: '13800003333', name: '王建国', company: '建国智能装备',
    industry: '智能制造', title: '总经理',
    bio: '二代接班人，将传统五金厂转型为智能制造企业，年产值从3000万做到1.8亿，拥有12项专利',
    cohort: '第14期', status: 'active', joinDate: '2025-01-10',
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
    id: 'm-006', phone: '13800006666', name: '赵晓峰', company: '晓峰教育科技',
    industry: '教育培训', title: '创始人',
    bio: '原新东方区域校长，2020年创办素质教育品牌「小峰学堂」，全国8个城市23家校区，在读学员6000+',
    cohort: '第16期', status: 'active', joinDate: '2025-06-01',
    classId: 'class-16', className: '第16期',
  },
  {
    id: 'm-007', phone: '13800007777', name: '孙丽娜', company: '丽娜美妆集团',
    industry: '美妆个护', title: '创始人兼CEO',
    bio: '从微商起家到自有品牌「LINA」，年GMV破2亿，抖音美妆类目TOP20，自建化妆品工厂',
    cohort: '第16期', status: 'active', joinDate: '2025-06-01',
    classId: 'class-16', className: '第16期',
  },
  {
    id: 'm-008', phone: '13800008888', name: '周大伟', company: '大伟农业科技',
    industry: '现代农业', title: '董事长',
    bio: '返乡创业标杆，建成华中地区最大有机蔬菜基地，与盒马、山姆合作，年供应量8000吨',
    cohort: '第16期', status: 'active', joinDate: '2025-06-01',
    classId: 'class-16', className: '第16期',
  },
  // ── 任务三：新增学员第一批（m-009 ~ m-024） ──
  // 第12期补充
  {
    id: 'm-009', phone: '13800009999', name: '钱志强', company: '志强物流集团',
    industry: '智慧物流', title: '创始人',
    bio: '华南专线物流龙头，自有车辆200+台，年运输量120万吨，正在布局智慧物流数字化平台',
    cohort: '第12期', status: 'active', joinDate: '2024-03-15',
    classId: 'class-12', className: '第12期',
  },
  {
    id: 'm-010', phone: '13800101010', name: '林晓婷', company: '晓婷母婴连锁',
    industry: '母婴零售', title: '创始人兼CEO',
    bio: '从一家社区母婴店做到全省68家连锁，会员体系覆盖15万家庭，年营收1.5亿',
    cohort: '第12期', status: 'active', joinDate: '2024-03-15',
    classId: 'class-12', className: '第12期',
  },
  // 第14期补充
  {
    id: 'm-011', phone: '13800111111', name: '吴铭哲', company: '铭哲新材料',
    industry: '新材料', title: '总经理',
    bio: '专注汽车轻量化铝合金材料，比亚迪、吉利一级供应商，年产值2.3亿，净利润率18%',
    cohort: '第14期', status: 'active', joinDate: '2025-01-10',
    classId: 'class-14', className: '第14期',
  },
  {
    id: 'm-012', phone: '13800121212', name: '郑雅文', company: '雅文文化传媒',
    industry: '文化传媒', title: '创始人',
    bio: '短视频MCN机构，签约达人200+，全平台粉丝矩阵3亿+，年营收9000万，利润率25%',
    cohort: '第14期', status: 'active', joinDate: '2025-01-10',
    classId: 'class-14', className: '第14期',
  },
  // 第16期补充
  {
    id: 'm-013', phone: '13800131313', name: '黄嘉豪', company: '嘉豪健身管理',
    industry: '健身运动', title: 'CEO',
    bio: '「JOY FIT」连锁健身品牌，长三角地区15家门店，会员4.2万人，年营收8500万',
    cohort: '第16期', status: 'active', joinDate: '2025-06-01',
    classId: 'class-16', className: '第16期',
  },
  {
    id: 'm-014', phone: '13800141414', name: '许思颖', company: '思颖宠物医疗',
    industry: '宠物服务', title: '创始人兼首席兽医',
    bio: '连锁宠物医院品牌「爱宠优选」，全国12家医院，年接诊量18万例，营收1.1亿',
    cohort: '第16期', status: 'active', joinDate: '2025-06-01',
    classId: 'class-16', className: '第16期',
  },
  // 第18期（新增班级）
  {
    id: 'm-015', phone: '13800151515', name: '陈浩然', company: '浩然新能源',
    industry: '新能源', title: '董事长',
    bio: '光伏组件制造商，产能2GW，出口东南亚和中东，年营收4.5亿，获评国家专精特新企业',
    cohort: '第18期', status: 'active', joinDate: '2025-09-01',
    classId: 'class-18', className: '第18期',
  },
  {
    id: 'm-016', phone: '13800161616', name: '刘雨桐', company: '雨桐家居设计',
    industry: '家居建材', title: '创始人',
    bio: '原创设计师家居品牌「木与光」，线上年销2亿+，天猫家具类目TOP10，自有工厂3间',
    cohort: '第18期', status: 'active', joinDate: '2025-09-01',
    classId: 'class-18', className: '第18期',
  },
  {
    id: 'm-017', phone: '13800171717', name: '杨振宁', company: '振宁汽车服务',
    industry: '汽车后市场', title: 'CEO',
    bio: '「快修侠」连锁汽修品牌，华东地区42家门店，年服务车辆50万台次，营收1.8亿',
    cohort: '第18期', status: 'active', joinDate: '2025-09-01',
    classId: 'class-18', className: '第18期',
  },
  {
    id: 'm-018', phone: '13800181818', name: '何晓琳', company: '晓琳跨境电商',
    industry: '跨境电商', title: '总经理',
    bio: '亚马逊北美站大卖家，自有品牌3个，年GMV 2.5亿，FBA仓储面积5000平米',
    cohort: '第18期', status: 'active', joinDate: '2025-09-01',
    classId: 'class-18', className: '第18期',
  },
  // 第20期（新增班级）
  {
    id: 'm-019', phone: '13800191919', name: '马俊杰', company: '俊杰医疗器械',
    industry: '医疗健康', title: '创始人兼CEO',
    bio: '二类医疗器械研发制造，主打家用智能健康监测设备，进入2000+药房渠道，年营收7000万',
    cohort: '第20期', status: 'active', joinDate: '2026-01-15',
    classId: 'class-20', className: '第20期',
  },
  {
    id: 'm-020', phone: '13800202020', name: '胡雅静', company: '雅静食品科技',
    industry: '食品加工', title: '董事长',
    bio: '健康零食品牌「轻悦」，主打低糖低卡产品线，全渠道铺货8万+终端，年营收1.6亿',
    cohort: '第20期', status: 'active', joinDate: '2026-01-15',
    classId: 'class-20', className: '第20期',
  },
  {
    id: 'm-021', phone: '13800212121', name: '宋伟明', company: '伟明环保科技',
    industry: '环保科技', title: '总经理',
    bio: '工业废水处理解决方案提供商，服务客户包括中石化、宝钢等央企，年合同额1.2亿',
    cohort: '第20期', status: 'active', joinDate: '2026-01-15',
    classId: 'class-20', className: '第20期',
  },
  {
    id: 'm-022', phone: '13800222222', name: '田甜', company: '甜蜜旅行社',
    industry: '文旅', title: '创始人',
    bio: '定制化高端旅行品牌，专注企业家私人旅行和商务考察，年服务客户5000+，营收6000万',
    cohort: '第20期', status: 'active', joinDate: '2026-01-15',
    classId: 'class-20', className: '第20期',
  },
  // 第22期（新增班级）
  {
    id: 'm-023', phone: '13800232323', name: '冯子轩', company: '子轩物联网科技',
    industry: '物联网', title: 'CTO兼联合创始人',
    bio: '工业物联网平台，为制造企业提供设备监控和预测维护SaaS，接入设备10万+台，ARR 3000万',
    cohort: '第22期', status: 'active', joinDate: '2026-03-01',
    classId: 'class-22', className: '第22期',
  },
  {
    id: 'm-024', phone: '13800242424', name: '曹美玲', company: '美玲服饰集团',
    industry: '服装零售', title: '董事长',
    bio: '女装品牌「MAYLINE」，全国180家专柜/门店，年营收3.2亿，正在推进线上数字化转型',
    cohort: '第22期', status: 'active', joinDate: '2026-03-01',
    classId: 'class-22', className: '第22期',
  },
  // ── 管理员 ──
  {
    id: 'm-admin', phone: '18000000000', name: '管理员', company: '一亿中流',
    industry: '平台管理', title: '平台管理员',
    bio: '一亿中流平台管理员', cohort: '管理团队', status: 'active', joinDate: '2023-01-01', role: 'admin',
    classId: 'class-admin', className: '管理组',
  },
]

// ── 老师数据 ──────────────────────────────────────────────
export const mockTeachers: Teacher[] = [
  // 任务二：已有老师（更新 name/title/bio/classIds）
  { id: 't-001', name: '刘海涛', phone: '18011111111', avatar: null, classIds: ['class-12', 'class-14'], role: 'teacher', status: 'active', title: '战略导师', bio: '前波士顿咨询合伙人，专注消费与制造业战略咨询20年，辅导超60家企业完成战略升级' },
  { id: 't-002', name: '陈敏芝', phone: '18022222222', avatar: null, classIds: ['class-16'], role: 'teacher', status: 'active', title: '资本导师', bio: '原中金资本副总裁，主导投资项目30+，累计管理资金规模超50亿，擅长产融结合与上市辅导' },
  // 任务四：新增老师第一批
  { id: 't-003', name: '张文博', phone: '18033333333', avatar: null, classIds: ['class-18'], role: 'teacher', status: 'active', title: '产业导师', bio: '前美的集团副总裁，专注制造业数字化转型咨询，辅导企业50+家实现智能化升级' },
  { id: 't-004', name: '王丽华', phone: '18044444444', avatar: null, classIds: ['class-20'], role: 'teacher', status: 'active', title: '增长导师', bio: '连续创业者，曾将两家公司从0做到10亿营收并成功退出，现专注企业增长战略辅导' },
  { id: 't-005', name: '李国栋', phone: '18055555555', avatar: null, classIds: ['class-22'], role: 'teacher', status: 'active', title: '资本导师', bio: '原达晨财智合伙人，主导投资上市公司7家，专注消费和科技赛道早中期投资' },
  // 原周老师，负责早期班级
  { id: 't-006', name: '周老师', phone: '18066666666', avatar: null, classIds: ['class-08', 'class-10', 'class-11'], role: 'teacher', status: 'active', title: '运营导师', bio: '资深企业运营顾问，专注中小企业精细化运营管理，累计服务企业100+家' },
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
  highlightText?: string
  highlights?: string[]
  initiatorNote?: string
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
    highlightText: '华南餐饮龙头品牌，月均流水稳定300万',
    highlights: ['18家直营门店，运营超5年', '月均流水300万+', '已获两轮机构投资'],
    initiatorNote: '我从2018年开始做餐饮连锁，目前华南区已经有18家店。这次融资主要用于新开5家店，每家店预计3个月回本。欢迎同学们一起参与，有任何问题随时联系我。',
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
    highlightText: '智能制造赛道，政府重点扶持项目',
    highlights: ['国家高新技术企业', '3项核心发明专利', '年产值增长率40%'],
    initiatorNote: '智能制造是我做了12年的老本行，这个项目是我们的第三条产线扩建。产品供不应求，产能是唯一瓶颈。',
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
    highlightText: '社区生鲜万亿赛道，轻资产高周转模式',
    highlights: ['覆盖12个社区，3万+家庭用户', '月复购率78%', '冷链仓配自建完成'],
    initiatorNote: '社区生鲜是未来10年最大的零售机会。我们已经跑通了单点模型，现在需要资金加速复制。',
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
    highlightText: '教育培训刚需市场，续费率行业领先',
    highlights: ['在读学员2000+', '年续费率85%', '已签约5个新校区'],
    initiatorNote: '',
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
    highlightText: '跨境电商蓝海机会，东南亚市场爆发期',
    highlights: ['Shopee/Lazada双平台运营', '月GMV突破500万', '自有供应链优势'],
    initiatorNote: '东南亚电商正处于2015年中国电商的爆发期，我们团队在当地运营3年，已经建立了完整的供应链和运营体系。',
  },
  {
    id: 'p-006', name: '华南社区团购联营试点', ownerId: 'm-001',
    industry: '社区零售', shareCode: 'FIN001', initiatorClassId: 'class-12', initiatorClassName: '第12期',
    description: '与华南地区3个社区团购站点进行收入分成联营合作，项目已于2025年11月顺利完成全部回款，实际回报率达1.38倍。',
    targetAmount: 50, raisedAmount: 50, revenueShareRate: 15.0, duration: 12,
    recoveryMultiple: 1.5, estimatedMonthlyRevenue: 32,
    totalShares: 10, raisedShares: 10, sharePrice: 5, minShares: 1,
    status: 'completed', createdAt: '2024-11-15',
    investors: ['m-002'],
    viewCount: 156,
    highlightText: '社区团购试点项目，已成功完成全部回款',
    highlights: ['3个站点，覆盖8000+家庭', '项目已完成，回报率117%', '12个月完整回款记录'],
    initiatorNote: '这个项目已经圆满完成，感谢各位同学的信任与支持！12个月117%的回报，是我们共同创造的成绩。',
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
  {
    id: 'c-006', projectId: 'p-006', projectName: '华南社区团购联营试点',
    initiatorId: 'm-001', initiatorName: '张建国', initiatorCompany: '星火餐饮集团',
    participantId: 'm-002', participantName: '李明远',
    amount: 10, shares: 2, revenueShareRatio: 15, cooperationTerm: 12,
    recoveryCap: 15, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2024-11-20', totalRepaid: 11.73, status: 'completed',
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
  // m-002 在 p-006 华南社区团购联营试点 的回款 (10万投资, 15%分成, 回收上限15万)
  { id: 'rep-100', contractId: 'c-006', revenueReportId: 'rr-p006-01', participantId: 'm-002', projectName: '华南社区团购联营试点', date: '2024-12-18', projectRevenue: 28, shareAmount: 0.84, cumulativeShare: 0.84, recoveryProgress: 5.60 },
  { id: 'rep-101', contractId: 'c-006', revenueReportId: 'rr-p006-02', participantId: 'm-002', projectName: '华南社区团购联营试点', date: '2025-01-18', projectRevenue: 32, shareAmount: 0.96, cumulativeShare: 1.80, recoveryProgress: 12.00 },
  { id: 'rep-102', contractId: 'c-006', revenueReportId: 'rr-p006-03', participantId: 'm-002', projectName: '华南社区团购联营试点', date: '2025-02-18', projectRevenue: 25, shareAmount: 0.75, cumulativeShare: 2.55, recoveryProgress: 17.00 },
  { id: 'rep-103', contractId: 'c-006', revenueReportId: 'rr-p006-04', participantId: 'm-002', projectName: '华南社区团购联营试点', date: '2025-03-18', projectRevenue: 35, shareAmount: 1.05, cumulativeShare: 3.60, recoveryProgress: 24.00 },
  { id: 'rep-104', contractId: 'c-006', revenueReportId: 'rr-p006-05', participantId: 'm-002', projectName: '华南社区团购联营试点', date: '2025-04-18', projectRevenue: 30, shareAmount: 0.90, cumulativeShare: 4.50, recoveryProgress: 30.00 },
  { id: 'rep-105', contractId: 'c-006', revenueReportId: 'rr-p006-06', participantId: 'm-002', projectName: '华南社区团购联营试点', date: '2025-05-18', projectRevenue: 38, shareAmount: 1.14, cumulativeShare: 5.64, recoveryProgress: 37.60 },
  { id: 'rep-106', contractId: 'c-006', revenueReportId: 'rr-p006-07', participantId: 'm-002', projectName: '华南社区团购联营试点', date: '2025-06-18', projectRevenue: 33, shareAmount: 0.99, cumulativeShare: 6.63, recoveryProgress: 44.20 },
  { id: 'rep-107', contractId: 'c-006', revenueReportId: 'rr-p006-08', participantId: 'm-002', projectName: '华南社区团购联营试点', date: '2025-07-18', projectRevenue: 36, shareAmount: 1.08, cumulativeShare: 7.71, recoveryProgress: 51.40 },
  { id: 'rep-108', contractId: 'c-006', revenueReportId: 'rr-p006-09', participantId: 'm-002', projectName: '华南社区团购联营试点', date: '2025-08-18', projectRevenue: 29, shareAmount: 0.87, cumulativeShare: 8.58, recoveryProgress: 57.20 },
  { id: 'rep-109', contractId: 'c-006', revenueReportId: 'rr-p006-10', participantId: 'm-002', projectName: '华南社区团购联营试点', date: '2025-09-18', projectRevenue: 34, shareAmount: 1.02, cumulativeShare: 9.60, recoveryProgress: 64.00 },
  { id: 'rep-110', contractId: 'c-006', revenueReportId: 'rr-p006-11', participantId: 'm-002', projectName: '华南社区团购联营试点', date: '2025-10-18', projectRevenue: 31, shareAmount: 0.93, cumulativeShare: 10.53, recoveryProgress: 70.20 },
  { id: 'rep-111', contractId: 'c-006', revenueReportId: 'rr-p006-12', participantId: 'm-002', projectName: '华南社区团购联营试点', date: '2025-11-18', projectRevenue: 40, shareAmount: 1.20, cumulativeShare: 11.73, recoveryProgress: 78.20 },
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
