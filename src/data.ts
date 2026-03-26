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
  // ── 新增学员第二批（m-025 ~ m-042） ──
  // 第12期补充
  {
    id: 'm-025', phone: '13800252525', name: '罗志远', company: '志远传媒集团',
    industry: '广告传媒', title: '创始人',
    bio: '户外广告行业15年，拥有华南地区3万+广告位资源，年营收2.1亿，正布局数字化广告',
    cohort: '第12期', status: 'active', joinDate: '2024-03-15',
    classId: 'class-12', className: '第12期',
  },
  {
    id: 'm-026', phone: '13800262626', name: '蔡小凤', company: '小凤烘焙连锁',
    industry: '烘焙食品', title: '创始人兼CEO',
    bio: '「凤凰麦坊」中式烘焙品牌，全国52家门店，主打国潮糕点，年营收9500万',
    cohort: '第12期', status: 'active', joinDate: '2024-03-15',
    classId: 'class-12', className: '第12期',
  },
  // 第14期补充
  {
    id: 'm-027', phone: '13800272727', name: '谢文斌', company: '文斌印刷包装',
    industry: '包装印刷', title: '总经理',
    bio: '二代接班后推动绿色印刷转型，成为茅台、农夫山泉指定包装供应商，年产值2.8亿',
    cohort: '第14期', status: 'active', joinDate: '2025-01-10',
    classId: 'class-14', className: '第14期',
  },
  {
    id: 'm-028', phone: '13800282828', name: '邓晓雯', company: '晓雯大药房连锁',
    industry: '医药零售', title: '董事长',
    bio: '华中地区连锁药房品牌，86家门店，年营收4.2亿，会员体系200万人',
    cohort: '第14期', status: 'active', joinDate: '2025-01-10',
    classId: 'class-14', className: '第14期',
  },
  {
    id: 'm-029', phone: '13800292929', name: '韩启明', company: '启明安防科技',
    industry: '安防科技', title: 'CEO',
    bio: 'AI视觉安防解决方案，服务500+企业园区和200+社区，年合同额6000万，续约率95%',
    cohort: '第14期', status: 'active', joinDate: '2025-01-10',
    classId: 'class-14', className: '第14期',
  },
  // 第16期补充
  {
    id: 'm-030', phone: '13800303030', name: '唐颖', company: '唐颖酒业',
    industry: '酒水饮料', title: '创始人',
    bio: '精酿啤酒品牌「唐酿」，自建酒厂年产能5000吨，进入3000+餐饮终端，年营收8000万',
    cohort: '第16期', status: 'active', joinDate: '2025-06-01',
    classId: 'class-16', className: '第16期',
  },
  {
    id: 'm-031', phone: '13800313131', name: '梁俊豪', company: '俊豪地产服务',
    industry: '物业管理', title: '总经理',
    bio: '商业物业管理公司，在管面积800万平米，服务写字楼和商场60+个，年营收1.3亿',
    cohort: '第16期', status: 'active', joinDate: '2025-06-01',
    classId: 'class-16', className: '第16期',
  },
  // 第18期补充
  {
    id: 'm-032', phone: '13800323232', name: '魏子涵', company: '子涵少儿编程',
    industry: '少儿教育', title: '创始人',
    bio: '「码上未来」少儿编程品牌，线上线下结合模式，全国15城28家校区，学员2.5万人',
    cohort: '第18期', status: 'active', joinDate: '2025-09-01',
    classId: 'class-18', className: '第18期',
  },
  {
    id: 'm-033', phone: '13800333333', name: '沈雅婷', company: '雅婷护肤科技',
    industry: '美妆研发', title: '创始人兼首席配方师',
    bio: '专注功效护肤的ODM企业，为50+品牌代工，自有实验室和工厂，年产值1.4亿',
    cohort: '第18期', status: 'active', joinDate: '2025-09-01',
    classId: 'class-18', className: '第18期',
  },
  {
    id: 'm-034', phone: '13800343434', name: '姜海波', company: '海波水产集团',
    industry: '水产养殖', title: '董事长',
    bio: '南美白对虾工厂化养殖，年产量6000吨，出口日韩和欧盟，年营收2.6亿',
    cohort: '第18期', status: 'active', joinDate: '2025-09-01',
    classId: 'class-18', className: '第18期',
  },
  // 第20期补充
  {
    id: 'm-035', phone: '13800353535', name: '邱晓明', company: '晓明智慧停车',
    industry: '智慧城市', title: 'CEO',
    bio: '智慧停车运营商，管理车位15万个，覆盖50+城市，年交易额3.2亿，平台抽成模式',
    cohort: '第20期', status: 'active', joinDate: '2026-01-15',
    classId: 'class-20', className: '第20期',
  },
  {
    id: 'm-036', phone: '13800363636', name: '廖婉清', company: '婉清月子中心',
    industry: '母婴服务', title: '创始人',
    bio: '高端月子护理品牌「馨月湾」，华南6家直营店，客单价8-15万，年营收7500万，入住率92%',
    cohort: '第20期', status: 'active', joinDate: '2026-01-15',
    classId: 'class-20', className: '第20期',
  },
  {
    id: 'm-037', phone: '13800373737', name: '段鹏飞', company: '鹏飞冷链物流',
    industry: '冷链物流', title: '总经理',
    bio: '生鲜冷链专线运输，自有冷藏车80台，冷库面积2万平米，年营收1.1亿',
    cohort: '第20期', status: 'active', joinDate: '2026-01-15',
    classId: 'class-20', className: '第20期',
  },
  // 第22期补充
  {
    id: 'm-038', phone: '13800383838', name: '夏天宇', company: '天宇体育文化',
    industry: '体育产业', title: '创始人',
    bio: '青少年体育培训连锁「天宇体育」，足球/篮球/游泳三大品类，全国40家校区，学员3万人',
    cohort: '第22期', status: 'active', joinDate: '2026-03-01',
    classId: 'class-22', className: '第22期',
  },
  {
    id: 'm-039', phone: '13800393939', name: '方雨欣', company: '雨欣数字营销',
    industry: '数字营销', title: 'CEO',
    bio: '品牌全案数字营销服务商，服务客户包括安踏、波司登、蜜雪冰城，年营收6500万',
    cohort: '第22期', status: 'active', joinDate: '2026-03-01',
    classId: 'class-22', className: '第22期',
  },
  {
    id: 'm-040', phone: '13800404040', name: '崔明浩', company: '明浩建材贸易',
    industry: '建材贸易', title: '董事长',
    bio: '钢材和水泥贸易商，年贸易额12亿，下游客户300+家建筑企业，净利润率3.5%',
    cohort: '第22期', status: 'active', joinDate: '2026-03-01',
    classId: 'class-22', className: '第22期',
  },
  {
    id: 'm-041', phone: '13800414141', name: '董小燕', company: '小燕茶业',
    industry: '茶叶', title: '创始人',
    bio: '福建白茶品牌「燕归来」，自有茶园500亩，线上年销8000万，复购率45%',
    cohort: '第22期', status: 'active', joinDate: '2026-03-01',
    classId: 'class-22', className: '第22期',
  },
  {
    id: 'm-042', phone: '13800424242', name: '范文杰', company: '文杰装修平台',
    industry: '家装服务', title: 'CEO',
    bio: '互联网家装平台「好装家」，连接2000+装修师傅和业主，年GMV 1.8亿，平台抽佣模式',
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
  recoveryMultiple: number    // 回收倍数（兼容旧逻辑，新项目通过年化+平息计算）
  annualYieldRate?: number    // 年化收益率 %（封顶/先到为准模式）
  expectMultiple?: number     // 预期收益倍数（仅期限模式）
  exitMode?: 'both' | 'cap_only' | 'term_only'  // 退出方式
  settlementCycle?: 'monthly' | 'weekly' | 'daily'  // 平息口径
  estimatedMonthlyRevenue: number // 预估月收入 (万)
  totalShares: number         // 总份数
  raisedShares: number        // 已募份数
  sharePrice: number          // 每份金额 (万)
  minShares: number           // 最低参与份数
  status: 'open' | 'funded' | 'active' | 'completed' | 'draft' | 'terminated'
  createdAt: string
  completedAt?: string
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
    description: '明远餐饮集团旗下「明远·粤味」品牌，深耕广式茶点和粤菜快餐赛道。本次联营项目针对深圳和广州的5家新开门店，选址均在日均客流量5万+的核心商圈。单店投资约40万，根据现有门店数据，平均3个月实现盈亏平衡，6个月回本。集团提供统一供应链、品牌运营和人员培训支持。',
    targetAmount: 500, raisedAmount: 380, revenueShareRate: 8.5, duration: 36,
    recoveryMultiple: 1.4, estimatedMonthlyRevenue: 180,
    annualYieldRate: 12, exitMode: 'both', settlementCycle: 'monthly',
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
    description: '建国智能装备的第三条CNC精密加工产线扩建项目。目前两条产线满负荷运转，订单排期已到6个月后。本次融资用于采购5台五轴联动加工中心及配套检测设备，产能提升60%。核心客户包括比亚迪、大疆和华为的二级供应商体系，合同锁定率超过80%。',
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
    description: '芳华供应链科技运营的社区生鲜前置仓项目。已在深圳南山区完成12个社区站点布局，覆盖3.2万家庭用户，月复购率78%。本次融资用于新增8个站点并升级冷链仓配体系，目标覆盖5万家庭。采用产地直采模式，毛利率稳定在32%。',
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
    description: '「小峰学堂」素质教育品牌的华南区域扩张计划。现有23家校区运营成熟，平均满班率88%，续费率85%。本次融资用于新开5家校区，选址在深圳、东莞、佛山的优质社区商业体。单校区投入约60万，根据历史数据8个月可达盈亏平衡。',
    targetAmount: 1200, raisedAmount: 900, revenueShareRate: 6.5, duration: 60,
    recoveryMultiple: 1.3, estimatedMonthlyRevenue: 480,
    annualYieldRate: 0, exitMode: 'term_only', expectMultiple: 1.3,
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
    description: '晓琳跨境电商的北美市场备货融资项目。公司在亚马逊北美站运营3个自有品牌，2024年旺季GMV突破5000万。本次融资用于2025年Q3旺季备货（库存周转约45天），预计带来8000万GMV。FBA仓储和物流体系成熟，退货率控制在5%以内。',
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
    description: '已完成的标杆项目。与华南地区3个社区团购站点进行收入分成联营合作，运营周期12个月。项目期间站点月均GMV从20万提升至40万，实现117.3%的投资回报率。该项目验证了收入分成模式在社区零售场景的可行性，为后续规模化提供了数据基础。',
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
  // ── 新增项目 p-007 ~ p-018 ──
  {
    id: 'p-007', name: '精酿啤酒产能扩建', ownerId: 'm-030',
    industry: '酒水饮料', shareCode: 'BER7K2', initiatorClassId: 'class-16', initiatorClassName: '第16期',
    description: '「唐酿」精酿啤酒品牌产能扩建项目。现有酒厂年产能5000吨，已满产。本次融资用于新建年产能3000吨的二期车间，引进德国酿造设备。产品已进入3000+餐饮终端和200+精品超市，扩产后可满足快速增长的市场需求。',
    targetAmount: 300, raisedAmount: 35, revenueShareRate: 10, duration: 24,
    recoveryMultiple: 1.5, estimatedMonthlyRevenue: 25,
    totalShares: 30, raisedShares: 4, sharePrice: 10, minShares: 1,
    status: 'open', createdAt: '2025-08-10',
    investors: ['m-013', 'm-006'],
    viewCount: 89,
    highlightText: '精酿啤酒赛道年增长30%，产品供不应求',
    highlights: ['自建酒厂，德国进口设备', '已进入3000+餐饮终端', '复购率62%，远超行业平均'],
    initiatorNote: '精酿啤酒在中国还处于爆发前夜，我们已经验证了产品和渠道，现在需要的就是产能。扩产后预计18个月收回投资。',
    recommendedByTeacher: ['t-002'],
  },
  {
    id: 'p-008', name: '宠物医院连锁扩张', ownerId: 'm-014',
    industry: '宠物服务', shareCode: 'PET8M3', initiatorClassId: 'class-16', initiatorClassName: '第16期',
    description: '「爱宠优选」宠物医院品牌的长三角扩张计划。现有12家医院运营成熟，平均单店月营收45万。本次融资用于新开4家医院，选址在杭州、南京、苏州的宠物密度最高社区。单店投入约80万，根据历史数据6个月达盈亏平衡。',
    targetAmount: 320, raisedAmount: 75, revenueShareRate: 12, duration: 18,
    recoveryMultiple: 1.4, estimatedMonthlyRevenue: 55,
    totalShares: 32, raisedShares: 8, sharePrice: 10, minShares: 1,
    status: 'active', createdAt: '2025-05-20',
    investors: ['m-007', 'm-013', 'm-025'],
    viewCount: 156,
    highlightText: '宠物医疗刚需赛道，单店模型已验证',
    highlights: ['12家门店成熟运营', '年接诊量18万例', '单店6个月盈亏平衡'],
    initiatorNote: '中国宠物数量已超1亿只，宠物医疗是最刚需的赛道。我们的连锁化管理体系是核心壁垒。',
    recommendedByTeacher: [],
  },
  {
    id: 'p-009', name: '智慧停车平台城市扩张', ownerId: 'm-035',
    industry: '智慧城市', shareCode: 'PKG9N4', initiatorClassId: 'class-20', initiatorClassName: '第20期',
    description: '智慧停车运营平台扩张项目。已在50+城市管理15万个车位，年交易额3.2亿。本次融资用于新签约20个城市的停车场资源，部署智能硬件和支付系统。平台抽佣模式，边际成本递减，规模效应显著。',
    targetAmount: 500, raisedAmount: 30, revenueShareRate: 8, duration: 36,
    recoveryMultiple: 1.6, estimatedMonthlyRevenue: 40,
    annualYieldRate: 15, exitMode: 'cap_only', settlementCycle: 'monthly',
    totalShares: 25, raisedShares: 2, sharePrice: 20, minShares: 1,
    status: 'open', createdAt: '2025-09-01',
    investors: ['m-021'],
    viewCount: 203,
    highlightText: '智慧城市基础设施，政策红利叠加',
    highlights: ['50+城市，15万车位在管', '年交易额3.2亿', '平台抽佣，边际成本递减'],
    initiatorNote: '停车是城市刚需，每个车位都是一个持续产生收入的资产。我们的技术和运营壁垒在于规模效应。',
    recommendedByTeacher: ['t-004'],
  },
  {
    id: 'p-010', name: '有机蔬菜基地二期', ownerId: 'm-008',
    industry: '现代农业', shareCode: 'VEG0A5', initiatorClassId: 'class-14', initiatorClassName: '第14期',
    description: '华中最大有机蔬菜基地的二期扩建项目。一期基地年供应8000吨有机蔬菜，与盒马、山姆、Ole等高端渠道建立稳定合作。二期计划新增500亩种植面积和2条净菜加工线，预计年增产4000吨，重点拓展净菜和预制菜方向。',
    targetAmount: 400, raisedAmount: 60, revenueShareRate: 10, duration: 24,
    recoveryMultiple: 1.5, estimatedMonthlyRevenue: 35,
    totalShares: 27, raisedShares: 4, sharePrice: 15, minShares: 1,
    status: 'active', createdAt: '2025-04-15',
    investors: ['m-002', 'm-027', 'm-020'],
    viewCount: 134,
    highlightText: '盒马山姆核心供应商，有机认证壁垒',
    highlights: ['华中最大有机蔬菜基地', '盒马、山姆稳定订单', '净菜加工毛利率提升至45%'],
    initiatorNote: '有机农业前期投入大但壁垒极高，认证周期3年让竞争对手很难追赶。我们的渠道关系和品质口碑是最大的护城河。',
    recommendedByTeacher: ['t-001'],
  },
  {
    id: 'p-011', name: '光伏组件东南亚产能', ownerId: 'm-015',
    industry: '新能源', shareCode: 'SOL1B6', initiatorClassId: 'class-18', initiatorClassName: '第18期',
    description: '浩然新能源在越南的光伏组件代工厂建设项目。国内产能2GW已满产，客户包括中东和东南亚的电站开发商。越南工厂可以规避贸易壁垒，直接服务欧美市场。一期规划500MW产能，土地和厂房已签约。',
    targetAmount: 800, raisedAmount: 0, revenueShareRate: 8, duration: 36,
    recoveryMultiple: 1.6, estimatedMonthlyRevenue: 60,
    totalShares: 27, raisedShares: 0, sharePrice: 30, minShares: 1,
    status: 'open', createdAt: '2025-10-05',
    investors: [],
    viewCount: 178,
    highlightText: '光伏出海，越南产能布局抢占先机',
    highlights: ['国内产能2GW满产', '越南工厂规避贸易壁垒', '已获欧美客户意向订单'],
    initiatorNote: '光伏产业链出海是未来5年最确定的趋势。越南工厂建成后，我们可以直接拿到欧美市场30%的价格溢价。',
    recommendedByTeacher: ['t-003'],
  },
  {
    id: 'p-012', name: '设计师家居品牌线下体验店', ownerId: 'm-016',
    industry: '家居建材', shareCode: 'HOM2C7', initiatorClassId: 'class-18', initiatorClassName: '第18期',
    description: '「木与光」原创设计师家居品牌的线下体验店计划。线上年销2亿+，但家居品类线下体验是成交关键环节。计划在深圳、杭州、成都开设3家400平米体验店，结合场景化展示和即时零售，目标线下带动线上转化率提升30%。',
    targetAmount: 250, raisedAmount: 0, revenueShareRate: 12, duration: 18,
    recoveryMultiple: 1.4, estimatedMonthlyRevenue: 20,
    totalShares: 25, raisedShares: 0, sharePrice: 10, minShares: 1,
    status: 'draft', createdAt: '2025-11-20',
    investors: [],
    viewCount: 0,
    highlightText: '天猫家具TOP10品牌，线下体验驱动增长',
    highlights: ['线上年销2亿+，天猫TOP10', '自有工厂3间，成本可控', '线下体验店模型已在深圳验证'],
    initiatorNote: '',
    recommendedByTeacher: [],
  },
  {
    id: 'p-013', name: '连锁汽修品牌华东扩张', ownerId: 'm-017',
    industry: '汽车后市场', shareCode: 'CAR3D8', initiatorClassId: 'class-18', initiatorClassName: '第18期',
    description: '「快修侠」连锁汽修品牌华东区域扩张。现有42家门店年服务车辆50万台次。本次融资用于新开15家社区店，采用「中心店+卫星店」模式降低单店投入。平均单店日均服务30台车，客单价380元，2个月可盈亏平衡。',
    targetAmount: 350, raisedAmount: 50, revenueShareRate: 11, duration: 18,
    recoveryMultiple: 1.4, estimatedMonthlyRevenue: 30,
    totalShares: 35, raisedShares: 5, sharePrice: 10, minShares: 1,
    status: 'active', createdAt: '2025-06-10',
    investors: ['m-015', 'm-032'],
    viewCount: 142,
    highlightText: '汽车后市场万亿赛道，连锁化率仅5%',
    highlights: ['42家门店，标准化运营体系', '单店2个月盈亏平衡', '客户留存率75%'],
    initiatorNote: '中国汽车保有量3.2亿辆，但连锁化率只有5%。这是一个用标准化打败夫妻店的机会。',
    recommendedByTeacher: ['t-003'],
  },
  {
    id: 'p-014', name: '线下剧本杀连锁', ownerId: 'm-012',
    industry: '文化传媒', shareCode: 'DRM4E9', initiatorClassId: 'class-14', initiatorClassName: '第14期',
    description: '剧本杀连锁品牌扩张项目。原计划在5个城市开设10家门店，但2025年下半年行业整体下滑，单店营收较峰值下降40%。经与投资参与人协商，决定终止项目并启动清算。已完成部分回款，剩余资金按比例退还。',
    targetAmount: 200, raisedAmount: 25, revenueShareRate: 15, duration: 12,
    recoveryMultiple: 1.5, estimatedMonthlyRevenue: 0,
    totalShares: 40, raisedShares: 5, sharePrice: 5, minShares: 1,
    status: 'terminated', createdAt: '2025-02-01',
    investors: ['m-011', 'm-009'],
    viewCount: 92,
    highlightText: '（项目已终止）',
    highlights: [],
    initiatorNote: '很遗憾这个项目没能按预期完成。行业变化超出预判，感谢各位同学的理解和支持，我们已经尽最大努力减少损失。',
    recommendedByTeacher: [],
  },
  {
    id: 'p-015', name: '健康零食品牌渠道铺货', ownerId: 'm-020',
    industry: '食品加工', shareCode: 'SNK5F0', initiatorClassId: 'class-20', initiatorClassName: '第20期',
    description: '「轻悦」健康零食品牌的全渠道铺货融资项目。项目已圆满完成，18个月内将铺货终端从5万个拓展到8万个，品牌年营收从1.2亿增长至1.6亿。投资参与人获得135%的投资回报。',
    targetAmount: 200, raisedAmount: 45, revenueShareRate: 10, duration: 18,
    recoveryMultiple: 1.5, estimatedMonthlyRevenue: 12,
    totalShares: 40, raisedShares: 9, sharePrice: 5, minShares: 1,
    status: 'completed', createdAt: '2024-06-01', completedAt: '2025-12-01',
    investors: ['m-019', 'm-037', 'm-022'],
    viewCount: 210,
    highlightText: '全渠道零食品牌，项目已完成135%回报',
    highlights: ['铺货终端从5万拓至8万', '年营收增长33%', '18个月完成全部回款'],
    initiatorNote: '感谢各位同学的信任！这个项目的成功让我更加坚信收入分成模式的价值。「轻悦」会继续成长，期待下一次合作。',
    recommendedByTeacher: ['t-004'],
  },
  {
    id: 'p-016', name: '工业物联网平台扩容', ownerId: 'm-023',
    industry: '物联网', shareCode: 'IOT6G1', initiatorClassId: 'class-22', initiatorClassName: '第22期',
    description: '工业物联网SaaS平台的客户拓展融资。平台已接入10万+台工业设备，为制造企业提供设备监控和预测维护。本次融资用于扩大销售团队和云服务器集群，目标年内新增200家企业客户，ARR从3000万增长至5000万。',
    targetAmount: 250, raisedAmount: 15, revenueShareRate: 10, duration: 24,
    recoveryMultiple: 1.5, estimatedMonthlyRevenue: 20,
    totalShares: 25, raisedShares: 2, sharePrice: 10, minShares: 1,
    status: 'open', createdAt: '2025-10-15',
    investors: ['m-038'],
    viewCount: 97,
    highlightText: '工业互联网SaaS，高续费率高毛利',
    highlights: ['10万+设备接入', '年续费率92%', '毛利率75%'],
    initiatorNote: '工业互联网是一个慢生意但好生意。我们每接入一台设备，就相当于种下一棵持续产出的果树。',
    recommendedByTeacher: ['t-005'],
  },
  {
    id: 'p-017', name: '高端月子中心新店', ownerId: 'm-036',
    industry: '母婴服务', shareCode: 'MOM7H2', initiatorClassId: 'class-20', initiatorClassName: '第20期',
    description: '「馨月湾」高端月子护理中心的广州新店项目。现有6家店平均入住率92%，客单价8-15万。广州新店选址在珠江新城核心区，面积1200平米，28间套房，定位城市旗舰店。预计开业3个月达到80%入住率。',
    targetAmount: 280, raisedAmount: 35, revenueShareRate: 13, duration: 18,
    recoveryMultiple: 1.4, estimatedMonthlyRevenue: 25,
    totalShares: 28, raisedShares: 4, sharePrice: 10, minShares: 1,
    status: 'active', createdAt: '2025-07-01',
    investors: ['m-010', 'm-036'],
    viewCount: 165,
    highlightText: '高端月子护理，92%入住率验证模型',
    highlights: ['6家店平均入住率92%', '客单价8-15万', '珠江新城旗舰店选址'],
    initiatorNote: '中国每年1000万新生儿，月子中心渗透率不到8%。我们的服务品质和口碑是最好的获客方式，80%的新客来自老客推荐。',
    recommendedByTeacher: [],
  },
  {
    id: 'p-018', name: '女装品牌数字化转型', ownerId: 'm-024',
    industry: '服装零售', shareCode: 'FAS8I3', initiatorClassId: 'class-22', initiatorClassName: '第22期',
    description: '「MAYLINE」女装品牌的线上数字化转型项目。现有180家专柜/门店，但线上占比仅15%。本次融资用于搭建私域运营体系、直播团队和小程序商城，目标12个月内线上占比提升至40%，带动整体营收增长25%。',
    targetAmount: 200, raisedAmount: 20, revenueShareRate: 12, duration: 18,
    recoveryMultiple: 1.5, estimatedMonthlyRevenue: 18,
    totalShares: 25, raisedShares: 3, sharePrice: 8, minShares: 1,
    status: 'open', createdAt: '2025-09-20',
    investors: ['m-039'],
    viewCount: 118,
    highlightText: '180家门店女装品牌，线上增量空间巨大',
    highlights: ['全国180家专柜/门店', '年营收3.2亿', '线上占比仅15%，增长空间大'],
    initiatorNote: '传统服装品牌的数字化不是选择题，是必答题。我们有品牌和供应链基础，缺的只是线上运营能力的投入。',
    recommendedByTeacher: ['t-005'],
  },
  // ── 新增项目 p-019 ~ p-030 ──
  {
    id: 'p-019', name: '青少年体育培训全国加盟', ownerId: 'm-038',
    industry: '体育产业', shareCode: 'SPT9J4', initiatorClassId: 'class-22', initiatorClassName: '第22期',
    description: '「天宇体育」青少年体育培训品牌的加盟扩张项目。足球、篮球、游泳三大品类，现有40家校区。本次融资用于搭建加盟管理体系和教练培训基地，目标年内新增30家加盟校区，进入10个新城市。',
    targetAmount: 300, raisedAmount: 60, revenueShareRate: 10, duration: 24,
    recoveryMultiple: 1.5, estimatedMonthlyRevenue: 66,
    totalShares: 30, raisedShares: 6, sharePrice: 10, minShares: 1,
    status: 'active', createdAt: '2025-06-20',
    investors: ['m-040', 'm-023', 'm-041'],
    viewCount: 134,
    highlightText: '双减政策后体育培训爆发，加盟模式轻资产',
    highlights: ['40家校区，3万学员', '足球/篮球/游泳三大品类', '加盟模式，轻资产快速扩张'],
    initiatorNote: '双减之后，体育培训的需求翻了3倍。我们用标准化教案和教练培训体系，确保每家加盟校都能保持品质。',
    recommendedByTeacher: ['t-005'],
  },
  {
    id: 'p-020', name: '白茶品牌渠道拓展', ownerId: 'm-041',
    industry: '茶叶', shareCode: 'TEA0K5', initiatorClassId: 'class-22', initiatorClassName: '第22期',
    description: '「燕归来」福建白茶品牌的渠道拓展融资。自有茶园500亩，线上年销8000万。本次融资用于开拓企业礼品定制渠道和高端茶室体验店，目标进入500家企业的福利采购清单。',
    targetAmount: 150, raisedAmount: 10, revenueShareRate: 12, duration: 18,
    recoveryMultiple: 1.4, estimatedMonthlyRevenue: 15,
    totalShares: 30, raisedShares: 2, sharePrice: 5, minShares: 1,
    status: 'open', createdAt: '2025-10-01',
    investors: ['m-042'],
    viewCount: 76,
    highlightText: '自有茶园，45%复购率，企业礼品蓝海市场',
    highlights: ['自有茶园500亩', '线上年销8000万，复购率45%', '企业礼品定制客单价高'],
    initiatorNote: '好茶不怕巷子深，但好渠道能让好茶卖出好价钱。企业礼品市场的客单价是C端的10倍。',
    recommendedByTeacher: [],
  },
  {
    id: 'p-021', name: '数字营销AI工具平台', ownerId: 'm-039',
    industry: '数字营销', shareCode: 'AIM1L6', initiatorClassId: 'class-22', initiatorClassName: '第22期',
    description: '基于服务品牌客户积累的营销经验，开发AI自动化营销工具。已完成MVP产品开发，内部测试效果显著：广告素材生成效率提升5倍，投放ROI平均提升40%。计划面向中小品牌商SaaS化运营。',
    targetAmount: 180, raisedAmount: 0, revenueShareRate: 10, duration: 24,
    recoveryMultiple: 1.6, estimatedMonthlyRevenue: 12,
    totalShares: 23, raisedShares: 0, sharePrice: 8, minShares: 1,
    status: 'draft', createdAt: '2025-11-25',
    investors: [],
    viewCount: 0,
    highlightText: 'AI+营销，用技术杠杆放大服务能力',
    highlights: ['已服务安踏、波司登等一线品牌', 'AI素材生成效率提升5倍', 'SaaS模式，边际成本趋近于零'],
    initiatorNote: '',
    recommendedByTeacher: [],
  },
  {
    id: 'p-022', name: '冷链物流华南网络', ownerId: 'm-037',
    industry: '冷链物流', shareCode: 'CLD2M7', initiatorClassId: 'class-20', initiatorClassName: '第20期',
    description: '鹏飞冷链物流的华南区域网络扩张。现有冷藏车80台、冷库2万平米。本次融资用于新增30台冷藏车和1个5000平米的分拣中心，打通广深佛莞的冷链配送网络，将配送时效从24小时缩短至6小时。',
    targetAmount: 350, raisedAmount: 45, revenueShareRate: 9, duration: 24,
    recoveryMultiple: 1.5, estimatedMonthlyRevenue: 35,
    totalShares: 23, raisedShares: 3, sharePrice: 15, minShares: 1,
    status: 'open', createdAt: '2025-09-15',
    investors: ['m-002', 'm-034'],
    viewCount: 88,
    highlightText: '生鲜冷链基础设施，需求刚性增长',
    highlights: ['80台冷藏车，2万平米冷库', '目标6小时配送时效', '服务3000+商户'],
    initiatorNote: '冷链物流是生鲜零售的基础设施，谁掌握了最后一公里的冷链能力，谁就掌握了这个市场。',
    recommendedByTeacher: ['t-004'],
  },
  {
    id: 'p-023', name: '中式烘焙品牌出海', ownerId: 'm-026',
    industry: '烘焙食品', shareCode: 'BAK3N8', initiatorClassId: 'class-12', initiatorClassName: '第12期',
    description: '「凤凰麦坊」国潮中式烘焙品牌的东南亚市场拓展。国内52家门店运营成熟，品牌IP深受年轻消费者喜爱。本次融资用于在新加坡和吉隆坡开设首批3家海外门店，测试东南亚华人市场的接受度。',
    targetAmount: 200, raisedAmount: 35, revenueShareRate: 12, duration: 18,
    recoveryMultiple: 1.5, estimatedMonthlyRevenue: 45,
    totalShares: 25, raisedShares: 5, sharePrice: 8, minShares: 1,
    status: 'active', createdAt: '2025-05-15',
    investors: ['m-001', 'm-018'],
    viewCount: 145,
    highlightText: '国潮出海，东南亚华人市场巨大',
    highlights: ['国内52家门店成熟运营', '国潮IP，年轻人复购率55%', '新加坡首店已签约选址'],
    initiatorNote: '中式烘焙出海是一个全新的蓝海市场。东南亚6亿人口中有4000万华人，国潮文化在年轻一代中非常受欢迎。',
    recommendedByTeacher: ['t-001'],
  },
  {
    id: 'p-024', name: '共享办公空间运营', ownerId: 'm-031',
    industry: '物业管理', shareCode: 'OFC4O9', initiatorClassId: 'class-16', initiatorClassName: '第16期',
    description: '商务共享办公空间扩张项目。原计划利用物业管理资源开设5个共享办公点，但受远程办公趋势影响，入驻率持续低于预期。运营6个月后与参与人协商终止，已退还未使用资金。',
    targetAmount: 250, raisedAmount: 35, revenueShareRate: 12, duration: 18,
    recoveryMultiple: 1.4, estimatedMonthlyRevenue: 0,
    totalShares: 25, raisedShares: 4, sharePrice: 10, minShares: 1,
    status: 'terminated', createdAt: '2025-03-01',
    investors: ['m-030', 'm-014'],
    viewCount: 67,
    highlightText: '（项目已终止）',
    highlights: [],
    initiatorNote: '市场变化超出预期，远程办公对共享办公的冲击比我想象的更大。感谢各位的理解。',
    recommendedByTeacher: [],
  },
  {
    id: 'p-025', name: '母婴连锁会员体系升级', ownerId: 'm-010',
    industry: '母婴零售', shareCode: 'BBY5P0', initiatorClassId: 'class-12', initiatorClassName: '第12期',
    description: '晓婷母婴连锁的会员数字化升级项目，已圆满完成。项目周期15个月，投入资金用于搭建会员小程序、积分体系和精准营销系统。实施后会员月均消费提升28%，整体营收增长22%。投资回报率128%。',
    targetAmount: 120, raisedAmount: 37, revenueShareRate: 12, duration: 15,
    recoveryMultiple: 1.4, estimatedMonthlyRevenue: 45,
    totalShares: 24, raisedShares: 8, sharePrice: 5, minShares: 1,
    status: 'completed', createdAt: '2024-04-01', completedAt: '2025-07-01',
    investors: ['m-009', 'm-026', 'm-002'],
    viewCount: 189,
    highlightText: '会员数字化标杆案例，128%回报率',
    highlights: ['68家门店，15万会员', '会员月均消费提升28%', '15个月完成全部回款'],
    initiatorNote: '这个项目让我深刻体会到数字化对实体零售的价值。感谢各位同学的支持，68家门店的15万会员都在享受更好的服务。',
    recommendedByTeacher: ['t-001'],
  },
  {
    id: 'p-026', name: '工业废水处理新技术推广', ownerId: 'm-021',
    industry: '环保科技', shareCode: 'H2O6Q1', initiatorClassId: 'class-20', initiatorClassName: '第20期',
    description: '自主研发的膜生物反应器（MBR）技术在化工行业的推广应用。该技术处理效率比传统方案高40%，成本降低25%。已在3家化工厂验证效果，本次融资用于建设标准化设备生产线和市场推广。',
    targetAmount: 300, raisedAmount: 20, revenueShareRate: 9, duration: 24,
    recoveryMultiple: 1.5, estimatedMonthlyRevenue: 25,
    totalShares: 25, raisedShares: 2, sharePrice: 12, minShares: 1,
    status: 'open', createdAt: '2025-10-20',
    investors: ['m-015'],
    viewCount: 92,
    highlightText: '环保刚需，自研技术壁垒高',
    highlights: ['服务中石化、宝钢等央企', '自研MBR技术，处理效率高40%', '3家化工厂验证通过'],
    initiatorNote: '环保法规只会越来越严，工业废水处理是永远的刚需。我们的技术优势在于效率高、成本低、出水标准稳定。',
    recommendedByTeacher: [],
  },
  {
    id: 'p-027', name: '医疗器械药房渠道拓展', ownerId: 'm-019',
    industry: '医疗健康', shareCode: 'MED7R2', initiatorClassId: 'class-20', initiatorClassName: '第20期',
    description: '家用智能健康监测设备的药房渠道拓展。已进入2000+药房，主打血压仪、血糖仪和睡眠监测设备。本次融资用于拓展至5000家药房，并推出新品家用尿液分析仪。药房渠道毛利率55%，复购率高。',
    targetAmount: 180, raisedAmount: 35, revenueShareRate: 12, duration: 18,
    recoveryMultiple: 1.4, estimatedMonthlyRevenue: 46,
    totalShares: 23, raisedShares: 5, sharePrice: 8, minShares: 1,
    status: 'active', createdAt: '2025-07-15',
    investors: ['m-036', 'm-028'],
    viewCount: 108,
    highlightText: '家用医疗器械，老龄化社会长期刚需',
    highlights: ['已进入2000+药房渠道', '毛利率55%', '新品家用尿液分析仪即将上市'],
    initiatorNote: '中国60岁以上人口2.8亿，家用健康监测设备的渗透率不到10%。这是一个确定性极高的长期赛道。',
    recommendedByTeacher: ['t-004'],
  },
  {
    id: 'p-028', name: '高端定制旅行产品升级', ownerId: 'm-022',
    industry: '文旅', shareCode: 'TRV8S3', initiatorClassId: 'class-20', initiatorClassName: '第20期',
    description: '甜蜜旅行社的产品升级计划。拟开发3条企业家专属旅行线路（以色列创新考察、日本精益制造研学、北欧设计灵感之旅），融合商务考察与高端休闲，客单价15-25万/人。',
    targetAmount: 100, raisedAmount: 0, revenueShareRate: 15, duration: 12,
    recoveryMultiple: 1.4, estimatedMonthlyRevenue: 15,
    totalShares: 20, raisedShares: 0, sharePrice: 5, minShares: 1,
    status: 'draft', createdAt: '2025-12-01',
    investors: [],
    viewCount: 0,
    highlightText: '企业家高端商旅，年服务5000+客户基础',
    highlights: ['年服务企业家5000+', '客单价15-25万', '融合商务考察与高端休闲'],
    initiatorNote: '',
    recommendedByTeacher: [],
  },
  {
    id: 'p-029', name: '互联网家装平台升级', ownerId: 'm-042',
    industry: '家装服务', shareCode: 'DEC9T4', initiatorClassId: 'class-22', initiatorClassName: '第22期',
    description: '「好装家」互联网家装平台的技术升级和城市扩张。现有平台连接2000+装修师傅，年GMV 1.8亿。本次融资用于开发AI智能报价系统、3D效果预览功能，并拓展至5个新城市。',
    targetAmount: 220, raisedAmount: 15, revenueShareRate: 10, duration: 24,
    recoveryMultiple: 1.5, estimatedMonthlyRevenue: 18,
    totalShares: 28, raisedShares: 2, sharePrice: 8, minShares: 1,
    status: 'open', createdAt: '2025-11-01',
    investors: ['m-023'],
    viewCount: 83,
    highlightText: '家装平台，AI赋能传统行业',
    highlights: ['2000+装修师傅，年GMV 1.8亿', 'AI智能报价+3D效果预览', '平台抽佣模式，毛利率高'],
    initiatorNote: '家装行业的信息不对称是最大的痛点。我们用平台化和AI工具，让业主和装修师傅都能获益。',
    recommendedByTeacher: ['t-005'],
  },
  {
    id: 'p-030', name: '短视频MCN机构内容升级', ownerId: 'm-012',
    industry: '文化传媒', shareCode: 'MCN0U5', initiatorClassId: 'class-14', initiatorClassName: '第14期',
    description: '雅文传媒MCN机构的内容升级项目，已圆满完成。12个月内孵化了5个百万粉丝账号，签约达人从200人增至350人，整体营收增长55%。投资参与人获得142%的回报率。',
    targetAmount: 150, raisedAmount: 45, revenueShareRate: 13, duration: 12,
    recoveryMultiple: 1.5, estimatedMonthlyRevenue: 78,
    totalShares: 30, raisedShares: 9, sharePrice: 5, minShares: 1,
    status: 'completed', createdAt: '2024-08-01', completedAt: '2025-08-01',
    investors: ['m-003', 'm-029', 'm-011'],
    viewCount: 198,
    highlightText: 'MCN内容升级标杆，142%回报率',
    highlights: ['新增5个百万粉丝账号', '签约达人增至350人', '12个月营收增长55%'],
    initiatorNote: '内容行业的核心是人才和创意。这笔融资让我们有能力签约更优质的达人，形成了正向飞轮。感谢各位同学！',
    recommendedByTeacher: ['t-001'],
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
  status: 'pending' | 'active' | 'completed' | 'signed' | 'terminated'
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
  // ── 新增合同 p-007 ~ p-018 ──
  // p-007 精酿啤酒（open，2份合同）
  {
    id: 'c-007', projectId: 'p-007', projectName: '精酿啤酒产能扩建',
    initiatorId: 'm-030', initiatorName: '唐颖', initiatorCompany: '唐颖酒业',
    participantId: 'm-013', participantName: '黄嘉豪',
    amount: 20, shares: 2, revenueShareRatio: 10, cooperationTerm: 24,
    recoveryCap: 30, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-08-15', totalRepaid: 0, status: 'signed',
  },
  {
    id: 'c-008', projectId: 'p-007', projectName: '精酿啤酒产能扩建',
    initiatorId: 'm-030', initiatorName: '唐颖', initiatorCompany: '唐颖酒业',
    participantId: 'm-006', participantName: '赵晓峰',
    amount: 15, shares: 2, revenueShareRatio: 10, cooperationTerm: 24,
    recoveryCap: 22.5, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-08-18', totalRepaid: 0, status: 'signed',
  },
  // p-008 宠物医院（active，3份合同）
  {
    id: 'c-009', projectId: 'p-008', projectName: '宠物医院连锁扩张',
    initiatorId: 'm-014', initiatorName: '许思颖', initiatorCompany: '思颖宠物医疗',
    participantId: 'm-007', participantName: '孙丽娜',
    amount: 30, shares: 3, revenueShareRatio: 12, cooperationTerm: 18,
    recoveryCap: 42, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-05-25', totalRepaid: 3.86, status: 'active',
  },
  {
    id: 'c-010', projectId: 'p-008', projectName: '宠物医院连锁扩张',
    initiatorId: 'm-014', initiatorName: '许思颖', initiatorCompany: '思颖宠物医疗',
    participantId: 'm-013', participantName: '黄嘉豪',
    amount: 20, shares: 2, revenueShareRatio: 12, cooperationTerm: 18,
    recoveryCap: 28, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-05-28', totalRepaid: 0, status: 'active',
  },
  {
    id: 'c-011', projectId: 'p-008', projectName: '宠物医院连锁扩张',
    initiatorId: 'm-014', initiatorName: '许思颖', initiatorCompany: '思颖宠物医疗',
    participantId: 'm-025', participantName: '罗志远',
    amount: 25, shares: 3, revenueShareRatio: 12, cooperationTerm: 18,
    recoveryCap: 35, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-06-01', totalRepaid: 0, status: 'active',
  },
  // p-009 智慧停车（open，1份合同）
  {
    id: 'c-012', projectId: 'p-009', projectName: '智慧停车平台城市扩张',
    initiatorId: 'm-035', initiatorName: '邱晓明', initiatorCompany: '晓明智慧停车',
    participantId: 'm-021', participantName: '宋伟明',
    amount: 30, shares: 2, revenueShareRatio: 8, cooperationTerm: 36,
    recoveryCap: 48, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-09-10', totalRepaid: 0, status: 'signed',
  },
  // p-010 有机蔬菜（active，3份合同）
  {
    id: 'c-013', projectId: 'p-010', projectName: '有机蔬菜基地二期',
    initiatorId: 'm-008', initiatorName: '周大伟', initiatorCompany: '大伟农业科技',
    participantId: 'm-002', participantName: '李芳华',
    amount: 25, shares: 2, revenueShareRatio: 10, cooperationTerm: 24,
    recoveryCap: 37.5, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-04-20', totalRepaid: 3.52, status: 'active',
  },
  {
    id: 'c-014', projectId: 'p-010', projectName: '有机蔬菜基地二期',
    initiatorId: 'm-008', initiatorName: '周大伟', initiatorCompany: '大伟农业科技',
    participantId: 'm-027', participantName: '谢文斌',
    amount: 20, shares: 1, revenueShareRatio: 10, cooperationTerm: 24,
    recoveryCap: 30, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-04-22', totalRepaid: 0, status: 'active',
  },
  {
    id: 'c-015', projectId: 'p-010', projectName: '有机蔬菜基地二期',
    initiatorId: 'm-008', initiatorName: '周大伟', initiatorCompany: '大伟农业科技',
    participantId: 'm-020', participantName: '胡雅静',
    amount: 15, shares: 1, revenueShareRatio: 10, cooperationTerm: 24,
    recoveryCap: 22.5, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-04-25', totalRepaid: 0, status: 'active',
  },
  // p-013 连锁汽修（active，2份合同）
  {
    id: 'c-016', projectId: 'p-013', projectName: '连锁汽修品牌华东扩张',
    initiatorId: 'm-017', initiatorName: '杨振宁', initiatorCompany: '振宁汽车服务',
    participantId: 'm-015', participantName: '陈浩然',
    amount: 30, shares: 3, revenueShareRatio: 11, cooperationTerm: 18,
    recoveryCap: 42, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-06-15', totalRepaid: 4.17, status: 'active',
  },
  {
    id: 'c-017', projectId: 'p-013', projectName: '连锁汽修品牌华东扩张',
    initiatorId: 'm-017', initiatorName: '杨振宁', initiatorCompany: '振宁汽车服务',
    participantId: 'm-032', participantName: '魏子涵',
    amount: 20, shares: 2, revenueShareRatio: 11, cooperationTerm: 18,
    recoveryCap: 28, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-06-18', totalRepaid: 0, status: 'active',
  },
  // p-014 剧本杀（terminated，2份合同）
  {
    id: 'c-018', projectId: 'p-014', projectName: '线下剧本杀连锁',
    initiatorId: 'm-012', initiatorName: '郑雅文', initiatorCompany: '雅文文化传媒',
    participantId: 'm-011', participantName: '吴铭哲',
    amount: 15, shares: 3, revenueShareRatio: 15, cooperationTerm: 12,
    recoveryCap: 22.5, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-02-10', totalRepaid: 0, status: 'terminated',
  },
  {
    id: 'c-019', projectId: 'p-014', projectName: '线下剧本杀连锁',
    initiatorId: 'm-012', initiatorName: '郑雅文', initiatorCompany: '雅文文化传媒',
    participantId: 'm-009', participantName: '钱志强',
    amount: 10, shares: 2, revenueShareRatio: 15, cooperationTerm: 12,
    recoveryCap: 15, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-02-12', totalRepaid: 0, status: 'terminated',
  },
  // p-015 健康零食（completed，3份合同）
  {
    id: 'c-020', projectId: 'p-015', projectName: '健康零食品牌渠道铺货',
    initiatorId: 'm-020', initiatorName: '胡雅静', initiatorCompany: '雅静食品科技',
    participantId: 'm-019', participantName: '马俊杰',
    amount: 20, shares: 4, revenueShareRatio: 10, cooperationTerm: 18,
    recoveryCap: 30, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2024-06-10', totalRepaid: 20.76, status: 'completed',
  },
  {
    id: 'c-021', projectId: 'p-015', projectName: '健康零食品牌渠道铺货',
    initiatorId: 'm-020', initiatorName: '胡雅静', initiatorCompany: '雅静食品科技',
    participantId: 'm-037', participantName: '段鹏飞',
    amount: 15, shares: 3, revenueShareRatio: 10, cooperationTerm: 18,
    recoveryCap: 22.5, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2024-06-12', totalRepaid: 0, status: 'completed',
  },
  {
    id: 'c-022', projectId: 'p-015', projectName: '健康零食品牌渠道铺货',
    initiatorId: 'm-020', initiatorName: '胡雅静', initiatorCompany: '雅静食品科技',
    participantId: 'm-022', participantName: '田甜',
    amount: 10, shares: 2, revenueShareRatio: 10, cooperationTerm: 18,
    recoveryCap: 15, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2024-06-15', totalRepaid: 0, status: 'completed',
  },
  // p-016 工业物联网（open，1份合同）
  {
    id: 'c-023', projectId: 'p-016', projectName: '工业物联网平台扩容',
    initiatorId: 'm-023', initiatorName: '冯子轩', initiatorCompany: '子轩物联网科技',
    participantId: 'm-038', participantName: '夏天宇',
    amount: 15, shares: 2, revenueShareRatio: 10, cooperationTerm: 24,
    recoveryCap: 22.5, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-10-20', totalRepaid: 0, status: 'signed',
  },
  // p-017 月子中心（active，2份合同）
  {
    id: 'c-024', projectId: 'p-017', projectName: '高端月子中心新店',
    initiatorId: 'm-036', initiatorName: '廖婉清', initiatorCompany: '婉清月子中心',
    participantId: 'm-010', participantName: '林晓婷',
    amount: 20, shares: 2, revenueShareRatio: 13, cooperationTerm: 18,
    recoveryCap: 28, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-07-08', totalRepaid: 2.91, status: 'active',
  },
  {
    id: 'c-025', projectId: 'p-017', projectName: '高端月子中心新店',
    initiatorId: 'm-036', initiatorName: '廖婉清', initiatorCompany: '婉清月子中心',
    participantId: 'm-036', participantName: '廖婉清',
    amount: 15, shares: 2, revenueShareRatio: 13, cooperationTerm: 18,
    recoveryCap: 21, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-07-10', totalRepaid: 0, status: 'active',
  },
  // p-018 女装数字化（open，1份合同）
  {
    id: 'c-026', projectId: 'p-018', projectName: '女装品牌数字化转型',
    initiatorId: 'm-024', initiatorName: '曹美玲', initiatorCompany: '美玲服饰集团',
    participantId: 'm-039', participantName: '方雨欣',
    amount: 20, shares: 3, revenueShareRatio: 12, cooperationTerm: 18,
    recoveryCap: 30, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-09-25', totalRepaid: 0, status: 'signed',
  },
  // ── 新增合同 p-019 ~ p-030 ──
  // p-019 青少年体育（active，3份）
  {
    id: 'c-027', projectId: 'p-019', projectName: '青少年体育培训全国加盟',
    initiatorId: 'm-038', initiatorName: '夏天宇', initiatorCompany: '天宇体育文化',
    participantId: 'm-040', participantName: '崔明浩',
    amount: 25, shares: 3, revenueShareRatio: 10, cooperationTerm: 24,
    recoveryCap: 37.5, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-06-25', totalRepaid: 2.76, status: 'active',
  },
  {
    id: 'c-028', projectId: 'p-019', projectName: '青少年体育培训全国加盟',
    initiatorId: 'm-038', initiatorName: '夏天宇', initiatorCompany: '天宇体育文化',
    participantId: 'm-023', participantName: '冯子轩',
    amount: 20, shares: 2, revenueShareRatio: 10, cooperationTerm: 24,
    recoveryCap: 30, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-06-28', totalRepaid: 0, status: 'signed',
  },
  {
    id: 'c-029', projectId: 'p-019', projectName: '青少年体育培训全国加盟',
    initiatorId: 'm-038', initiatorName: '夏天宇', initiatorCompany: '天宇体育文化',
    participantId: 'm-041', participantName: '董小燕',
    amount: 15, shares: 2, revenueShareRatio: 10, cooperationTerm: 24,
    recoveryCap: 22.5, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-07-01', totalRepaid: 0, status: 'signed',
  },
  // p-020 白茶（open，1份）
  {
    id: 'c-030', projectId: 'p-020', projectName: '白茶品牌渠道拓展',
    initiatorId: 'm-041', initiatorName: '董小燕', initiatorCompany: '小燕茶业',
    participantId: 'm-042', participantName: '范文杰',
    amount: 10, shares: 2, revenueShareRatio: 12, cooperationTerm: 18,
    recoveryCap: 14, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-10-08', totalRepaid: 0, status: 'signed',
  },
  // p-022 冷链物流（open，2份）
  {
    id: 'c-031', projectId: 'p-022', projectName: '冷链物流华南网络',
    initiatorId: 'm-037', initiatorName: '段鹏飞', initiatorCompany: '鹏飞冷链物流',
    participantId: 'm-002', participantName: '李芳华',
    amount: 25, shares: 2, revenueShareRatio: 9, cooperationTerm: 24,
    recoveryCap: 37.5, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-09-20', totalRepaid: 0, status: 'signed',
  },
  {
    id: 'c-032', projectId: 'p-022', projectName: '冷链物流华南网络',
    initiatorId: 'm-037', initiatorName: '段鹏飞', initiatorCompany: '鹏飞冷链物流',
    participantId: 'm-034', participantName: '姜海波',
    amount: 20, shares: 1, revenueShareRatio: 9, cooperationTerm: 24,
    recoveryCap: 30, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-09-22', totalRepaid: 0, status: 'signed',
  },
  // p-023 中式烘焙出海（active，2份）
  {
    id: 'c-033', projectId: 'p-023', projectName: '中式烘焙品牌出海',
    initiatorId: 'm-026', initiatorName: '蔡小凤', initiatorCompany: '小凤烘焙连锁',
    participantId: 'm-001', participantName: '张明远',
    amount: 20, shares: 3, revenueShareRatio: 12, cooperationTerm: 18,
    recoveryCap: 30, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-05-20', totalRepaid: 3.94, status: 'active',
  },
  {
    id: 'c-034', projectId: 'p-023', projectName: '中式烘焙品牌出海',
    initiatorId: 'm-026', initiatorName: '蔡小凤', initiatorCompany: '小凤烘焙连锁',
    participantId: 'm-018', participantName: '何晓琳',
    amount: 15, shares: 2, revenueShareRatio: 12, cooperationTerm: 18,
    recoveryCap: 22.5, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-05-22', totalRepaid: 0, status: 'active',
  },
  // p-024 共享办公（terminated，2份）
  {
    id: 'c-035', projectId: 'p-024', projectName: '共享办公空间运营',
    initiatorId: 'm-031', initiatorName: '梁俊豪', initiatorCompany: '俊豪地产服务',
    participantId: 'm-030', participantName: '唐颖',
    amount: 20, shares: 2, revenueShareRatio: 12, cooperationTerm: 18,
    recoveryCap: 28, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-03-10', totalRepaid: 0, status: 'terminated',
  },
  {
    id: 'c-036', projectId: 'p-024', projectName: '共享办公空间运营',
    initiatorId: 'm-031', initiatorName: '梁俊豪', initiatorCompany: '俊豪地产服务',
    participantId: 'm-014', participantName: '许思颖',
    amount: 15, shares: 2, revenueShareRatio: 12, cooperationTerm: 18,
    recoveryCap: 21, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-03-12', totalRepaid: 0, status: 'terminated',
  },
  // p-025 母婴会员升级（completed，3份）
  {
    id: 'c-037', projectId: 'p-025', projectName: '母婴连锁会员体系升级',
    initiatorId: 'm-010', initiatorName: '林晓婷', initiatorCompany: '晓婷母婴连锁',
    participantId: 'm-009', participantName: '钱志强',
    amount: 15, shares: 3, revenueShareRatio: 12, cooperationTerm: 15,
    recoveryCap: 21, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2024-04-08', totalRepaid: 10.34, status: 'completed',
  },
  {
    id: 'c-038', projectId: 'p-025', projectName: '母婴连锁会员体系升级',
    initiatorId: 'm-010', initiatorName: '林晓婷', initiatorCompany: '晓婷母婴连锁',
    participantId: 'm-026', participantName: '蔡小凤',
    amount: 10, shares: 2, revenueShareRatio: 12, cooperationTerm: 15,
    recoveryCap: 14, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2024-04-10', totalRepaid: 0, status: 'completed',
  },
  {
    id: 'c-039', projectId: 'p-025', projectName: '母婴连锁会员体系升级',
    initiatorId: 'm-010', initiatorName: '林晓婷', initiatorCompany: '晓婷母婴连锁',
    participantId: 'm-002', participantName: '李芳华',
    amount: 12, shares: 2, revenueShareRatio: 12, cooperationTerm: 15,
    recoveryCap: 16.8, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2024-04-12', totalRepaid: 0, status: 'completed',
  },
  // p-026 废水处理（open，1份）
  {
    id: 'c-040', projectId: 'p-026', projectName: '工业废水处理新技术推广',
    initiatorId: 'm-021', initiatorName: '宋伟明', initiatorCompany: '伟明环保科技',
    participantId: 'm-015', participantName: '陈浩然',
    amount: 20, shares: 2, revenueShareRatio: 9, cooperationTerm: 24,
    recoveryCap: 30, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-10-25', totalRepaid: 0, status: 'signed',
  },
  // p-027 医疗器械（active，2份）
  {
    id: 'c-041', projectId: 'p-027', projectName: '医疗器械药房渠道拓展',
    initiatorId: 'm-019', initiatorName: '马俊杰', initiatorCompany: '俊杰医疗器械',
    participantId: 'm-036', participantName: '廖婉清',
    amount: 15, shares: 2, revenueShareRatio: 12, cooperationTerm: 18,
    recoveryCap: 21, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-07-20', totalRepaid: 1.85, status: 'active',
  },
  {
    id: 'c-042', projectId: 'p-027', projectName: '医疗器械药房渠道拓展',
    initiatorId: 'm-019', initiatorName: '马俊杰', initiatorCompany: '俊杰医疗器械',
    participantId: 'm-028', participantName: '邓晓雯',
    amount: 20, shares: 3, revenueShareRatio: 12, cooperationTerm: 18,
    recoveryCap: 28, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-07-22', totalRepaid: 0, status: 'active',
  },
  // p-029 家装平台（open，1份）
  {
    id: 'c-043', projectId: 'p-029', projectName: '互联网家装平台升级',
    initiatorId: 'm-042', initiatorName: '范文杰', initiatorCompany: '文杰装修平台',
    participantId: 'm-023', participantName: '冯子轩',
    amount: 15, shares: 2, revenueShareRatio: 10, cooperationTerm: 24,
    recoveryCap: 22.5, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2025-11-05', totalRepaid: 0, status: 'signed',
  },
  // p-030 MCN内容升级（completed，3份）
  {
    id: 'c-044', projectId: 'p-030', projectName: '短视频MCN机构内容升级',
    initiatorId: 'm-012', initiatorName: '郑雅文', initiatorCompany: '雅文文化传媒',
    participantId: 'm-003', participantName: '王建国',
    amount: 20, shares: 4, revenueShareRatio: 13, cooperationTerm: 12,
    recoveryCap: 30, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2024-08-10', totalRepaid: 15.29, status: 'completed',
  },
  {
    id: 'c-045', projectId: 'p-030', projectName: '短视频MCN机构内容升级',
    initiatorId: 'm-012', initiatorName: '郑雅文', initiatorCompany: '雅文文化传媒',
    participantId: 'm-029', participantName: '韩启明',
    amount: 15, shares: 3, revenueShareRatio: 13, cooperationTerm: 12,
    recoveryCap: 22.5, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2024-08-12', totalRepaid: 0, status: 'completed',
  },
  {
    id: 'c-046', projectId: 'p-030', projectName: '短视频MCN机构内容升级',
    initiatorId: 'm-012', initiatorName: '郑雅文', initiatorCompany: '雅文文化传媒',
    participantId: 'm-011', participantName: '吴铭哲',
    amount: 10, shares: 2, revenueShareRatio: 13, cooperationTerm: 12,
    recoveryCap: 15, signedByInitiator: true, signedByParticipant: true,
    signedAt: '2024-08-15', totalRepaid: 0, status: 'completed',
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
  // ── p-008 宠物医院 回款（c-009 孙丽娜，6个月） ──
  { id: 'rep-020', contractId: 'c-009', revenueReportId: 'rr-p008-01', participantId: 'm-007', projectName: '宠物医院连锁扩张', date: '2025-06-18', projectRevenue: 45, shareAmount: 0.56, cumulativeShare: 0.56, recoveryProgress: 1.33 },
  { id: 'rep-021', contractId: 'c-009', revenueReportId: 'rr-p008-02', participantId: 'm-007', projectName: '宠物医院连锁扩张', date: '2025-07-18', projectRevenue: 52, shareAmount: 0.65, cumulativeShare: 1.21, recoveryProgress: 2.88 },
  { id: 'rep-022', contractId: 'c-009', revenueReportId: 'rr-p008-03', participantId: 'm-007', projectName: '宠物医院连锁扩张', date: '2025-08-18', projectRevenue: 48, shareAmount: 0.60, cumulativeShare: 1.81, recoveryProgress: 4.31 },
  { id: 'rep-023', contractId: 'c-009', revenueReportId: 'rr-p008-04', participantId: 'm-007', projectName: '宠物医院连锁扩张', date: '2025-09-18', projectRevenue: 55, shareAmount: 0.69, cumulativeShare: 2.50, recoveryProgress: 5.95 },
  { id: 'rep-024', contractId: 'c-009', revenueReportId: 'rr-p008-05', participantId: 'm-007', projectName: '宠物医院连锁扩张', date: '2025-10-18', projectRevenue: 50, shareAmount: 0.63, cumulativeShare: 3.13, recoveryProgress: 7.45 },
  { id: 'rep-025', contractId: 'c-009', revenueReportId: 'rr-p008-06', participantId: 'm-007', projectName: '宠物医院连锁扩张', date: '2025-11-18', projectRevenue: 58, shareAmount: 0.73, cumulativeShare: 3.86, recoveryProgress: 9.19 },
  // ── p-010 有机蔬菜 回款（c-013 李芳华，8个月） ──
  { id: 'rep-030', contractId: 'c-013', revenueReportId: 'rr-p010-01', participantId: 'm-002', projectName: '有机蔬菜基地二期', date: '2025-05-18', projectRevenue: 60, shareAmount: 0.38, cumulativeShare: 0.38, recoveryProgress: 1.01 },
  { id: 'rep-031', contractId: 'c-013', revenueReportId: 'rr-p010-02', participantId: 'm-002', projectName: '有机蔬菜基地二期', date: '2025-06-18', projectRevenue: 72, shareAmount: 0.45, cumulativeShare: 0.83, recoveryProgress: 2.21 },
  { id: 'rep-032', contractId: 'c-013', revenueReportId: 'rr-p010-03', participantId: 'm-002', projectName: '有机蔬菜基地二期', date: '2025-07-18', projectRevenue: 55, shareAmount: 0.34, cumulativeShare: 1.17, recoveryProgress: 3.12 },
  { id: 'rep-033', contractId: 'c-013', revenueReportId: 'rr-p010-04', participantId: 'm-002', projectName: '有机蔬菜基地二期', date: '2025-08-18', projectRevenue: 80, shareAmount: 0.50, cumulativeShare: 1.67, recoveryProgress: 4.45 },
  { id: 'rep-034', contractId: 'c-013', revenueReportId: 'rr-p010-05', participantId: 'm-002', projectName: '有机蔬菜基地二期', date: '2025-09-18', projectRevenue: 68, shareAmount: 0.43, cumulativeShare: 2.10, recoveryProgress: 5.60 },
  { id: 'rep-035', contractId: 'c-013', revenueReportId: 'rr-p010-06', participantId: 'm-002', projectName: '有机蔬菜基地二期', date: '2025-10-18', projectRevenue: 75, shareAmount: 0.47, cumulativeShare: 2.57, recoveryProgress: 6.85 },
  { id: 'rep-036', contractId: 'c-013', revenueReportId: 'rr-p010-07', participantId: 'm-002', projectName: '有机蔬菜基地二期', date: '2025-11-18', projectRevenue: 82, shareAmount: 0.51, cumulativeShare: 3.08, recoveryProgress: 8.21 },
  { id: 'rep-037', contractId: 'c-013', revenueReportId: 'rr-p010-08', participantId: 'm-002', projectName: '有机蔬菜基地二期', date: '2025-12-18', projectRevenue: 70, shareAmount: 0.44, cumulativeShare: 3.52, recoveryProgress: 9.39 },
  // ── p-013 连锁汽修 回款（c-016 陈浩然，5个月） ──
  { id: 'rep-040', contractId: 'c-016', revenueReportId: 'rr-p013-01', participantId: 'm-015', projectName: '连锁汽修品牌华东扩张', date: '2025-07-18', projectRevenue: 80, shareAmount: 0.75, cumulativeShare: 0.75, recoveryProgress: 1.79 },
  { id: 'rep-041', contractId: 'c-016', revenueReportId: 'rr-p013-02', participantId: 'm-015', projectName: '连锁汽修品牌华东扩张', date: '2025-08-18', projectRevenue: 92, shareAmount: 0.87, cumulativeShare: 1.62, recoveryProgress: 3.86 },
  { id: 'rep-042', contractId: 'c-016', revenueReportId: 'rr-p013-03', participantId: 'm-015', projectName: '连锁汽修品牌华东扩张', date: '2025-09-18', projectRevenue: 85, shareAmount: 0.80, cumulativeShare: 2.42, recoveryProgress: 5.76 },
  { id: 'rep-043', contractId: 'c-016', revenueReportId: 'rr-p013-04', participantId: 'm-015', projectName: '连锁汽修品牌华东扩张', date: '2025-10-18', projectRevenue: 98, shareAmount: 0.92, cumulativeShare: 3.34, recoveryProgress: 7.95 },
  { id: 'rep-044', contractId: 'c-016', revenueReportId: 'rr-p013-05', participantId: 'm-015', projectName: '连锁汽修品牌华东扩张', date: '2025-11-18', projectRevenue: 88, shareAmount: 0.83, cumulativeShare: 4.17, recoveryProgress: 9.93 },
  // ── p-015 健康零食 回款（c-020 马俊杰，18个月完整） ──
  { id: 'rep-050', contractId: 'c-020', revenueReportId: 'rr-p015-01', participantId: 'm-019', projectName: '健康零食品牌渠道铺货', date: '2024-07-18', projectRevenue: 95, shareAmount: 0.95, cumulativeShare: 0.95, recoveryProgress: 3.17 },
  { id: 'rep-051', contractId: 'c-020', revenueReportId: 'rr-p015-02', participantId: 'm-019', projectName: '健康零食品牌渠道铺货', date: '2024-08-18', projectRevenue: 102, shareAmount: 1.02, cumulativeShare: 1.97, recoveryProgress: 6.57 },
  { id: 'rep-052', contractId: 'c-020', revenueReportId: 'rr-p015-03', participantId: 'm-019', projectName: '健康零食品牌渠道铺货', date: '2024-09-18', projectRevenue: 88, shareAmount: 0.88, cumulativeShare: 2.85, recoveryProgress: 9.50 },
  { id: 'rep-053', contractId: 'c-020', revenueReportId: 'rr-p015-04', participantId: 'm-019', projectName: '健康零食品牌渠道铺货', date: '2024-10-18', projectRevenue: 110, shareAmount: 1.10, cumulativeShare: 3.95, recoveryProgress: 13.17 },
  { id: 'rep-054', contractId: 'c-020', revenueReportId: 'rr-p015-05', participantId: 'm-019', projectName: '健康零食品牌渠道铺货', date: '2024-11-18', projectRevenue: 98, shareAmount: 0.98, cumulativeShare: 4.93, recoveryProgress: 16.43 },
  { id: 'rep-055', contractId: 'c-020', revenueReportId: 'rr-p015-06', participantId: 'm-019', projectName: '健康零食品牌渠道铺货', date: '2024-12-18', projectRevenue: 125, shareAmount: 1.25, cumulativeShare: 6.18, recoveryProgress: 20.60 },
  { id: 'rep-056', contractId: 'c-020', revenueReportId: 'rr-p015-07', participantId: 'm-019', projectName: '健康零食品牌渠道铺货', date: '2025-01-18', projectRevenue: 105, shareAmount: 1.05, cumulativeShare: 7.23, recoveryProgress: 24.10 },
  { id: 'rep-057', contractId: 'c-020', revenueReportId: 'rr-p015-08', participantId: 'm-019', projectName: '健康零食品牌渠道铺货', date: '2025-02-18', projectRevenue: 92, shareAmount: 0.92, cumulativeShare: 8.15, recoveryProgress: 27.17 },
  { id: 'rep-058', contractId: 'c-020', revenueReportId: 'rr-p015-09', participantId: 'm-019', projectName: '健康零食品牌渠道铺货', date: '2025-03-18', projectRevenue: 118, shareAmount: 1.18, cumulativeShare: 9.33, recoveryProgress: 31.10 },
  { id: 'rep-059', contractId: 'c-020', revenueReportId: 'rr-p015-10', participantId: 'm-019', projectName: '健康零食品牌渠道铺货', date: '2025-04-18', projectRevenue: 108, shareAmount: 1.08, cumulativeShare: 10.41, recoveryProgress: 34.70 },
  { id: 'rep-060', contractId: 'c-020', revenueReportId: 'rr-p015-11', participantId: 'm-019', projectName: '健康零食品牌渠道铺货', date: '2025-05-18', projectRevenue: 130, shareAmount: 1.30, cumulativeShare: 11.71, recoveryProgress: 39.03 },
  { id: 'rep-061', contractId: 'c-020', revenueReportId: 'rr-p015-12', participantId: 'm-019', projectName: '健康零食品牌渠道铺货', date: '2025-06-18', projectRevenue: 112, shareAmount: 1.12, cumulativeShare: 12.83, recoveryProgress: 42.77 },
  { id: 'rep-062', contractId: 'c-020', revenueReportId: 'rr-p015-13', participantId: 'm-019', projectName: '健康零食品牌渠道铺货', date: '2025-07-18', projectRevenue: 125, shareAmount: 1.25, cumulativeShare: 14.08, recoveryProgress: 46.93 },
  { id: 'rep-063', contractId: 'c-020', revenueReportId: 'rr-p015-14', participantId: 'm-019', projectName: '健康零食品牌渠道铺货', date: '2025-08-18', projectRevenue: 135, shareAmount: 1.35, cumulativeShare: 15.43, recoveryProgress: 51.43 },
  { id: 'rep-064', contractId: 'c-020', revenueReportId: 'rr-p015-15', participantId: 'm-019', projectName: '健康零食品牌渠道铺货', date: '2025-09-18', projectRevenue: 120, shareAmount: 1.20, cumulativeShare: 16.63, recoveryProgress: 55.43 },
  { id: 'rep-065', contractId: 'c-020', revenueReportId: 'rr-p015-16', participantId: 'm-019', projectName: '健康零食品牌渠道铺货', date: '2025-10-18', projectRevenue: 140, shareAmount: 1.40, cumulativeShare: 18.03, recoveryProgress: 60.10 },
  { id: 'rep-066', contractId: 'c-020', revenueReportId: 'rr-p015-17', participantId: 'm-019', projectName: '健康零食品牌渠道铺货', date: '2025-11-18', projectRevenue: 128, shareAmount: 1.28, cumulativeShare: 19.31, recoveryProgress: 64.37 },
  { id: 'rep-067', contractId: 'c-020', revenueReportId: 'rr-p015-18', participantId: 'm-019', projectName: '健康零食品牌渠道铺货', date: '2025-12-18', projectRevenue: 145, shareAmount: 1.45, cumulativeShare: 20.76, recoveryProgress: 69.20 },
  // ── p-017 月子中心 回款（c-024 林晓婷，4个月） ──
  { id: 'rep-070', contractId: 'c-024', revenueReportId: 'rr-p017-01', participantId: 'm-010', projectName: '高端月子中心新店', date: '2025-08-18', projectRevenue: 65, shareAmount: 0.60, cumulativeShare: 0.60, recoveryProgress: 2.14 },
  { id: 'rep-071', contractId: 'c-024', revenueReportId: 'rr-p017-02', participantId: 'm-010', projectName: '高端月子中心新店', date: '2025-09-18', projectRevenue: 78, shareAmount: 0.72, cumulativeShare: 1.32, recoveryProgress: 4.71 },
  { id: 'rep-072', contractId: 'c-024', revenueReportId: 'rr-p017-03', participantId: 'm-010', projectName: '高端月子中心新店', date: '2025-10-18', projectRevenue: 82, shareAmount: 0.76, cumulativeShare: 2.08, recoveryProgress: 7.43 },
  { id: 'rep-073', contractId: 'c-024', revenueReportId: 'rr-p017-04', participantId: 'm-010', projectName: '高端月子中心新店', date: '2025-11-18', projectRevenue: 90, shareAmount: 0.83, cumulativeShare: 2.91, recoveryProgress: 10.39 },
  // ── p-019 青少年体育 回款（c-027 崔明浩，5个月） ──
  { id: 'rep-080', contractId: 'c-027', revenueReportId: 'rr-p019-01', participantId: 'm-040', projectName: '青少年体育培训全国加盟', date: '2025-07-18', projectRevenue: 55, shareAmount: 0.46, cumulativeShare: 0.46, recoveryProgress: 1.23 },
  { id: 'rep-081', contractId: 'c-027', revenueReportId: 'rr-p019-02', participantId: 'm-040', projectName: '青少年体育培训全国加盟', date: '2025-08-18', projectRevenue: 62, shareAmount: 0.52, cumulativeShare: 0.98, recoveryProgress: 2.61 },
  { id: 'rep-082', contractId: 'c-027', revenueReportId: 'rr-p019-03', participantId: 'm-040', projectName: '青少年体育培训全国加盟', date: '2025-09-18', projectRevenue: 70, shareAmount: 0.58, cumulativeShare: 1.56, recoveryProgress: 4.16 },
  { id: 'rep-083', contractId: 'c-027', revenueReportId: 'rr-p019-04', participantId: 'm-040', projectName: '青少年体育培训全国加盟', date: '2025-10-18', projectRevenue: 68, shareAmount: 0.57, cumulativeShare: 2.13, recoveryProgress: 5.68 },
  { id: 'rep-084', contractId: 'c-027', revenueReportId: 'rr-p019-05', participantId: 'm-040', projectName: '青少年体育培训全国加盟', date: '2025-11-18', projectRevenue: 75, shareAmount: 0.63, cumulativeShare: 2.76, recoveryProgress: 7.36 },
  // ── p-023 中式烘焙出海 回款（c-033 张明远，7个月） ──
  { id: 'rep-085', contractId: 'c-033', revenueReportId: 'rr-p023-01', participantId: 'm-001', projectName: '中式烘焙品牌出海', date: '2025-06-18', projectRevenue: 35, shareAmount: 0.42, cumulativeShare: 0.42, recoveryProgress: 1.40 },
  { id: 'rep-086', contractId: 'c-033', revenueReportId: 'rr-p023-02', participantId: 'm-001', projectName: '中式烘焙品牌出海', date: '2025-07-18', projectRevenue: 42, shareAmount: 0.50, cumulativeShare: 0.92, recoveryProgress: 3.07 },
  { id: 'rep-087', contractId: 'c-033', revenueReportId: 'rr-p023-03', participantId: 'm-001', projectName: '中式烘焙品牌出海', date: '2025-08-18', projectRevenue: 38, shareAmount: 0.46, cumulativeShare: 1.38, recoveryProgress: 4.60 },
  { id: 'rep-088', contractId: 'c-033', revenueReportId: 'rr-p023-04', participantId: 'm-001', projectName: '中式烘焙品牌出海', date: '2025-09-18', projectRevenue: 50, shareAmount: 0.60, cumulativeShare: 1.98, recoveryProgress: 6.60 },
  { id: 'rep-089', contractId: 'c-033', revenueReportId: 'rr-p023-05', participantId: 'm-001', projectName: '中式烘焙品牌出海', date: '2025-10-18', projectRevenue: 55, shareAmount: 0.66, cumulativeShare: 2.64, recoveryProgress: 8.80 },
  { id: 'rep-090', contractId: 'c-033', revenueReportId: 'rr-p023-06', participantId: 'm-001', projectName: '中式烘焙品牌出海', date: '2025-11-18', projectRevenue: 48, shareAmount: 0.58, cumulativeShare: 3.22, recoveryProgress: 10.73 },
  { id: 'rep-091', contractId: 'c-033', revenueReportId: 'rr-p023-07', participantId: 'm-001', projectName: '中式烘焙品牌出海', date: '2025-12-18', projectRevenue: 60, shareAmount: 0.72, cumulativeShare: 3.94, recoveryProgress: 13.13 },
  // ── p-025 母婴会员升级 回款（c-037 钱志强，15个月完整） ──
  { id: 'rep-120', contractId: 'c-037', revenueReportId: 'rr-p025-01', participantId: 'm-009', projectName: '母婴连锁会员体系升级', date: '2024-05-18', projectRevenue: 30, shareAmount: 0.45, cumulativeShare: 0.45, recoveryProgress: 2.14 },
  { id: 'rep-121', contractId: 'c-037', revenueReportId: 'rr-p025-02', participantId: 'm-009', projectName: '母婴连锁会员体系升级', date: '2024-06-18', projectRevenue: 35, shareAmount: 0.53, cumulativeShare: 0.98, recoveryProgress: 4.67 },
  { id: 'rep-122', contractId: 'c-037', revenueReportId: 'rr-p025-03', participantId: 'm-009', projectName: '母婴连锁会员体系升级', date: '2024-07-18', projectRevenue: 32, shareAmount: 0.48, cumulativeShare: 1.46, recoveryProgress: 6.95 },
  { id: 'rep-123', contractId: 'c-037', revenueReportId: 'rr-p025-04', participantId: 'm-009', projectName: '母婴连锁会员体系升级', date: '2024-08-18', projectRevenue: 40, shareAmount: 0.60, cumulativeShare: 2.06, recoveryProgress: 9.81 },
  { id: 'rep-124', contractId: 'c-037', revenueReportId: 'rr-p025-05', participantId: 'm-009', projectName: '母婴连锁会员体系升级', date: '2024-09-18', projectRevenue: 38, shareAmount: 0.57, cumulativeShare: 2.63, recoveryProgress: 12.52 },
  { id: 'rep-125', contractId: 'c-037', revenueReportId: 'rr-p025-06', participantId: 'm-009', projectName: '母婴连锁会员体系升级', date: '2024-10-18', projectRevenue: 42, shareAmount: 0.63, cumulativeShare: 3.26, recoveryProgress: 15.52 },
  { id: 'rep-126', contractId: 'c-037', revenueReportId: 'rr-p025-07', participantId: 'm-009', projectName: '母婴连锁会员体系升级', date: '2024-11-18', projectRevenue: 45, shareAmount: 0.68, cumulativeShare: 3.94, recoveryProgress: 18.76 },
  { id: 'rep-127', contractId: 'c-037', revenueReportId: 'rr-p025-08', participantId: 'm-009', projectName: '母婴连锁会员体系升级', date: '2024-12-18', projectRevenue: 50, shareAmount: 0.75, cumulativeShare: 4.69, recoveryProgress: 22.33 },
  { id: 'rep-128', contractId: 'c-037', revenueReportId: 'rr-p025-09', participantId: 'm-009', projectName: '母婴连锁会员体系升级', date: '2025-01-18', projectRevenue: 48, shareAmount: 0.72, cumulativeShare: 5.41, recoveryProgress: 25.76 },
  { id: 'rep-129', contractId: 'c-037', revenueReportId: 'rr-p025-10', participantId: 'm-009', projectName: '母婴连锁会员体系升级', date: '2025-02-18', projectRevenue: 52, shareAmount: 0.78, cumulativeShare: 6.19, recoveryProgress: 29.48 },
  { id: 'rep-130', contractId: 'c-037', revenueReportId: 'rr-p025-11', participantId: 'm-009', projectName: '母婴连锁会员体系升级', date: '2025-03-18', projectRevenue: 55, shareAmount: 0.83, cumulativeShare: 7.02, recoveryProgress: 33.43 },
  { id: 'rep-131', contractId: 'c-037', revenueReportId: 'rr-p025-12', participantId: 'm-009', projectName: '母婴连锁会员体系升级', date: '2025-04-18', projectRevenue: 50, shareAmount: 0.75, cumulativeShare: 7.77, recoveryProgress: 37.00 },
  { id: 'rep-132', contractId: 'c-037', revenueReportId: 'rr-p025-13', participantId: 'm-009', projectName: '母婴连锁会员体系升级', date: '2025-05-18', projectRevenue: 58, shareAmount: 0.87, cumulativeShare: 8.64, recoveryProgress: 41.14 },
  { id: 'rep-133', contractId: 'c-037', revenueReportId: 'rr-p025-14', participantId: 'm-009', projectName: '母婴连锁会员体系升级', date: '2025-06-18', projectRevenue: 53, shareAmount: 0.80, cumulativeShare: 9.44, recoveryProgress: 44.95 },
  { id: 'rep-134', contractId: 'c-037', revenueReportId: 'rr-p025-15', participantId: 'm-009', projectName: '母婴连锁会员体系升级', date: '2025-07-18', projectRevenue: 60, shareAmount: 0.90, cumulativeShare: 10.34, recoveryProgress: 49.24 },
  // ── p-027 医疗器械 回款（c-041 廖婉清，4个月） ──
  { id: 'rep-140', contractId: 'c-041', revenueReportId: 'rr-p027-01', participantId: 'm-036', projectName: '医疗器械药房渠道拓展', date: '2025-08-18', projectRevenue: 40, shareAmount: 0.40, cumulativeShare: 0.40, recoveryProgress: 1.90 },
  { id: 'rep-141', contractId: 'c-041', revenueReportId: 'rr-p027-02', participantId: 'm-036', projectName: '医疗器械药房渠道拓展', date: '2025-09-18', projectRevenue: 48, shareAmount: 0.48, cumulativeShare: 0.88, recoveryProgress: 4.19 },
  { id: 'rep-142', contractId: 'c-041', revenueReportId: 'rr-p027-03', participantId: 'm-036', projectName: '医疗器械药房渠道拓展', date: '2025-10-18', projectRevenue: 52, shareAmount: 0.52, cumulativeShare: 1.40, recoveryProgress: 6.67 },
  { id: 'rep-143', contractId: 'c-041', revenueReportId: 'rr-p027-04', participantId: 'm-036', projectName: '医疗器械药房渠道拓展', date: '2025-11-18', projectRevenue: 45, shareAmount: 0.45, cumulativeShare: 1.85, recoveryProgress: 8.81 },
  // ── p-030 MCN内容升级 回款（c-044 王建国，12个月完整） ──
  { id: 'rep-150', contractId: 'c-044', revenueReportId: 'rr-p030-01', participantId: 'm-003', projectName: '短视频MCN机构内容升级', date: '2024-09-18', projectRevenue: 50, shareAmount: 0.87, cumulativeShare: 0.87, recoveryProgress: 2.90 },
  { id: 'rep-151', contractId: 'c-044', revenueReportId: 'rr-p030-02', participantId: 'm-003', projectName: '短视频MCN机构内容升级', date: '2024-10-18', projectRevenue: 58, shareAmount: 1.00, cumulativeShare: 1.87, recoveryProgress: 6.23 },
  { id: 'rep-152', contractId: 'c-044', revenueReportId: 'rr-p030-03', participantId: 'm-003', projectName: '短视频MCN机构内容升级', date: '2024-11-18', projectRevenue: 62, shareAmount: 1.07, cumulativeShare: 2.94, recoveryProgress: 9.80 },
  { id: 'rep-153', contractId: 'c-044', revenueReportId: 'rr-p030-04', participantId: 'm-003', projectName: '短视频MCN机构内容升级', date: '2024-12-18', projectRevenue: 70, shareAmount: 1.21, cumulativeShare: 4.15, recoveryProgress: 13.83 },
  { id: 'rep-154', contractId: 'c-044', revenueReportId: 'rr-p030-05', participantId: 'm-003', projectName: '短视频MCN机构内容升级', date: '2025-01-18', projectRevenue: 65, shareAmount: 1.12, cumulativeShare: 5.27, recoveryProgress: 17.57 },
  { id: 'rep-155', contractId: 'c-044', revenueReportId: 'rr-p030-06', participantId: 'm-003', projectName: '短视频MCN机构内容升级', date: '2025-02-18', projectRevenue: 75, shareAmount: 1.30, cumulativeShare: 6.57, recoveryProgress: 21.90 },
  { id: 'rep-156', contractId: 'c-044', revenueReportId: 'rr-p030-07', participantId: 'm-003', projectName: '短视频MCN机构内容升级', date: '2025-03-18', projectRevenue: 80, shareAmount: 1.38, cumulativeShare: 7.95, recoveryProgress: 26.50 },
  { id: 'rep-157', contractId: 'c-044', revenueReportId: 'rr-p030-08', participantId: 'm-003', projectName: '短视频MCN机构内容升级', date: '2025-04-18', projectRevenue: 72, shareAmount: 1.25, cumulativeShare: 9.20, recoveryProgress: 30.67 },
  { id: 'rep-158', contractId: 'c-044', revenueReportId: 'rr-p030-09', participantId: 'm-003', projectName: '短视频MCN机构内容升级', date: '2025-05-18', projectRevenue: 85, shareAmount: 1.47, cumulativeShare: 10.67, recoveryProgress: 35.57 },
  { id: 'rep-159', contractId: 'c-044', revenueReportId: 'rr-p030-10', participantId: 'm-003', projectName: '短视频MCN机构内容升级', date: '2025-06-18', projectRevenue: 90, shareAmount: 1.56, cumulativeShare: 12.23, recoveryProgress: 40.77 },
  { id: 'rep-160', contractId: 'c-044', revenueReportId: 'rr-p030-11', participantId: 'm-003', projectName: '短视频MCN机构内容升级', date: '2025-07-18', projectRevenue: 82, shareAmount: 1.42, cumulativeShare: 13.65, recoveryProgress: 45.50 },
  { id: 'rep-161', contractId: 'c-044', revenueReportId: 'rr-p030-12', participantId: 'm-003', projectName: '短视频MCN机构内容升级', date: '2025-08-18', projectRevenue: 95, shareAmount: 1.64, cumulativeShare: 15.29, recoveryProgress: 50.97 },
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
  requesterClass: string
  teacherId: string
  teacherName: string
  message: string
  status: 'pending' | 'completed' | 'connected' | 'declined'
  createdAt: string
  completedAt: string | null
  completedNote: string | null
  // legacy fields for backward compat
  requesterClassName?: string
  initiatorId?: string
  initiatorName?: string
  initiatorClassName?: string
  requestedAt?: string
  connectedAt?: string | null
}

export const mockReferrals: Referral[] = [
  {
    id: 'ref-001', projectId: 'p-007', projectName: '精酿啤酒产能扩建',
    requesterId: 'm-011', requesterName: '吴铭哲', requesterClass: '第14期',
    teacherId: 't-002', teacherName: '陈敏芝',
    message: '陈老师好，我对唐颖同学的精酿啤酒项目很感兴趣，我们铭哲新材料也在给食品设备做配件，想了解一下合作可能性，麻烦帮忙引荐。',
    status: 'completed', createdAt: '2025-08-12', completedAt: '2025-08-14',
    completedNote: '已拉微信群，双方约了下周三下午茶'
  },
  {
    id: 'ref-002', projectId: 'p-009', projectName: '智慧停车平台城市扩张',
    requesterId: 'm-015', requesterName: '陈浩然', requesterClass: '第18期',
    teacherId: 't-004', teacherName: '王丽华',
    message: '王老师，邱晓明同学的智慧停车项目跟我们新能源充电桩业务有协同空间，希望能认识一下，聊聊合作。',
    status: 'completed', createdAt: '2025-09-05', completedAt: '2025-09-07',
    completedNote: '已安排线下咖啡会面，双方达成初步合作意向'
  },
  {
    id: 'ref-003', projectId: 'p-011', projectName: '光伏组件东南亚产能',
    requesterId: 'm-018', requesterName: '何晓琳', requesterClass: '第18期',
    teacherId: 't-003', teacherName: '张文博',
    message: '张老师好，陈浩然同学的光伏越南工厂项目我很有兴趣，我们在东南亚有成熟的物流和渠道资源，想先见面聊聊。',
    status: 'completed', createdAt: '2025-10-08', completedAt: '2025-10-10',
    completedNote: '已拉三方群，何晓琳当天就决定参与投资'
  },
  {
    id: 'ref-004', projectId: 'p-016', projectName: '工业物联网平台扩容',
    requesterId: 'm-003', requesterName: '王建国', requesterClass: '第14期',
    teacherId: 't-005', teacherName: '李国栋',
    message: '李老师，冯子轩同学的物联网平台跟我们智能制造业务高度相关，我们工厂正好需要设备监控方案，希望能对接一下。',
    status: 'pending', createdAt: '2025-11-15', completedAt: null, completedNote: null
  },
  {
    id: 'ref-005', projectId: 'p-018', projectName: '女装品牌数字化转型',
    requesterId: 'm-007', requesterName: '孙丽娜', requesterClass: '第16期',
    teacherId: 't-005', teacherName: '李国栋',
    message: '李老师好，曹美玲同学的女装数字化项目和我们美妆品牌的私域运营逻辑很像，想交流一下经验，也考虑参与投资。',
    status: 'pending', createdAt: '2025-11-18', completedAt: null, completedNote: null
  },
  {
    id: 'ref-006', projectId: 'p-022', projectName: '冷链物流华南网络',
    requesterId: 'm-010', requesterName: '林晓婷', requesterClass: '第12期',
    teacherId: 't-001', teacherName: '刘海涛',
    message: '刘老师，段鹏飞同学的冷链物流网络跟我们母婴连锁的配送需求完全匹配，想先聊聊业务合作再考虑投资。',
    status: 'pending', createdAt: '2025-11-20', completedAt: null, completedNote: null
  },
  {
    id: 'ref-007', projectId: 'p-029', projectName: '互联网家装平台升级',
    requesterId: 'm-016', requesterName: '刘雨桐', requesterClass: '第18期',
    teacherId: 't-005', teacherName: '李国栋',
    message: '李老师好，范文杰同学的家装平台AI报价功能很有意思，我们家居品牌「木与光」想探讨入驻合作。',
    status: 'pending', createdAt: '2025-11-22', completedAt: null, completedNote: null
  },
  {
    id: 'ref-008', projectId: 'p-023', projectName: '中式烘焙品牌出海',
    requesterId: 'm-034', requesterName: '姜海波', requesterClass: '第18期',
    teacherId: 't-001', teacherName: '刘海涛',
    message: '刘老师，蔡小凤同学的烘焙出海项目，我们在东南亚有水产出口渠道，物流可以共享，想认识一下。',
    status: 'completed', createdAt: '2025-06-01', completedAt: '2025-06-03',
    completedNote: '已电话介绍，双方加了微信深聊中'
  }
]

// ── 分享记录 ────────────────────────────────────────────
export interface ShareLog {
  id: string
  projectId: string
  sharerId: string
  shareType: string
  createdAt: string
}

export const mockShareLogs: ShareLog[] = [
  { id:'sl-001', projectId:'p-001', sharerId:'m-001', shareType:'text_copy', createdAt:'2025-03-10' },
  { id:'sl-002', projectId:'p-001', sharerId:'m-001', shareType:'card_save', createdAt:'2025-03-10' },
  { id:'sl-003', projectId:'p-007', sharerId:'m-030', shareType:'text_copy', createdAt:'2025-08-12' },
  { id:'sl-004', projectId:'p-007', sharerId:'m-030', shareType:'code_copy', createdAt:'2025-08-12' },
  { id:'sl-005', projectId:'p-007', sharerId:'m-030', shareType:'text_copy', createdAt:'2025-08-15' },
  { id:'sl-006', projectId:'p-009', sharerId:'m-035', shareType:'text_copy', createdAt:'2025-09-02' },
  { id:'sl-007', projectId:'p-009', sharerId:'m-035', shareType:'card_save', createdAt:'2025-09-02' },
  { id:'sl-008', projectId:'p-009', sharerId:'m-035', shareType:'link_copy', createdAt:'2025-09-05' },
  { id:'sl-009', projectId:'p-011', sharerId:'m-015', shareType:'text_copy', createdAt:'2025-10-06' },
  { id:'sl-010', projectId:'p-011', sharerId:'m-015', shareType:'text_copy', createdAt:'2025-10-08' },
  { id:'sl-011', projectId:'p-016', sharerId:'m-023', shareType:'code_copy', createdAt:'2025-10-16' },
  { id:'sl-012', projectId:'p-016', sharerId:'m-023', shareType:'text_copy', createdAt:'2025-10-18' },
  { id:'sl-013', projectId:'p-018', sharerId:'m-024', shareType:'text_copy', createdAt:'2025-09-21' },
  { id:'sl-014', projectId:'p-018', sharerId:'m-024', shareType:'card_save', createdAt:'2025-09-22' },
  { id:'sl-015', projectId:'p-020', sharerId:'m-041', shareType:'text_copy', createdAt:'2025-10-02' },
  { id:'sl-016', projectId:'p-022', sharerId:'m-037', shareType:'text_copy', createdAt:'2025-09-16' },
  { id:'sl-017', projectId:'p-022', sharerId:'m-037', shareType:'link_copy', createdAt:'2025-09-18' },
  { id:'sl-018', projectId:'p-023', sharerId:'m-026', shareType:'text_copy', createdAt:'2025-05-16' },
  { id:'sl-019', projectId:'p-023', sharerId:'m-026', shareType:'text_copy', createdAt:'2025-05-20' },
  { id:'sl-020', projectId:'p-029', sharerId:'m-042', shareType:'code_copy', createdAt:'2025-11-02' }
]

// ── 通知数据 ────────────────────────────────────────────
export interface Notification {
  id: string
  type: string
  title: string
  content: string
  time: string
  read: boolean
  icon: string
  link: string | null
  targetRole: string | null
  targetId: string | null
}

export const mockNotifications: Notification[] = [
  // ====== 全局通知 ======
  { id:'n-001', type:'system', title:'平台公告', content:'中流通平台 V1.0 正式上线，欢迎各位学员体验！点击右上角「📖 演示」查看完整功能指南。', time:'2025-08-01', read:true, icon:'📢', link:null, targetRole:null, targetId:null },
  { id:'n-002', type:'system', title:'新功能上线', content:'项目分享卡片全新升级，高端深色设计，支持一键复制文字版到微信群，快去试试吧！', time:'2025-10-15', read:true, icon:'✨', link:null, targetRole:null, targetId:null },

  // ====== 学员 m-001 张明远的通知 ======
  { id:'n-010', type:'participation', title:'新投资参与', content:'李芳华（第12期）参与了您发起的项目「华南餐饮连锁联营」，投资金额 ¥10万', time:'2025-03-15', read:true, icon:'💰', link:'/projects/p-001', targetRole:'member', targetId:'m-001' },
  { id:'n-011', type:'participation', title:'新投资参与', content:'蔡小凤（第12期）参与了您发起的项目「中式烘焙品牌出海」，投资金额 ¥20万', time:'2025-05-20', read:true, icon:'💰', link:'/projects/p-023', targetRole:'member', targetId:'m-001' },
  { id:'n-012', type:'repayment', title:'回款到账', content:'项目「中式烘焙品牌出海」第7期回款已分配，您收到 ¥0.72万', time:'2025-12-18', read:false, icon:'📈', link:'/repayments', targetRole:'member', targetId:'m-001' },

  // ====== 学员 m-002 李芳华的通知 ======
  { id:'n-020', type:'repayment', title:'回款到账', content:'项目「有机蔬菜基地二期」第8期回款已分配，您收到 ¥0.44万', time:'2025-12-18', read:false, icon:'📈', link:'/repayments', targetRole:'member', targetId:'m-002' },
  { id:'n-021', type:'repayment', title:'回款到账', content:'项目「华南社区团购联营试点」已完成全部回款，累计回收 ¥11.73万，恭喜！', time:'2025-11-18', read:true, icon:'🎉', link:'/investments/c-006', targetRole:'member', targetId:'m-002' },
  { id:'n-022', type:'system', title:'项目状态更新', content:'您参与的项目「冷链物流华南网络」已获得新的投资参与，目前募集进度 12.9%', time:'2025-09-22', read:true, icon:'📋', link:'/projects/p-022', targetRole:'member', targetId:'m-002' },

  // ====== 学员 m-003 王建国的通知 ======
  { id:'n-030', type:'referral', title:'引荐进行中', content:'您请李国栋老师引荐的「工业物联网平台扩容」项目，老师已收到请求，请耐心等待', time:'2025-11-15', read:false, icon:'🤝', link:'/projects/p-016', targetRole:'member', targetId:'m-003' },
  { id:'n-031', type:'repayment', title:'回款到账', content:'项目「短视频MCN机构内容升级」已完成全部回款，累计回收 ¥15.29万，投资回报率 142%！', time:'2025-08-18', read:true, icon:'🎉', link:'/investments/c-044', targetRole:'member', targetId:'m-003' },

  // ====== 老师 t-001 刘海涛的通知 ======
  { id:'n-040', type:'referral', title:'新引荐请求', content:'林晓婷（第12期）希望您引荐认识段鹏飞，了解「冷链物流华南网络」项目的业务合作机会', time:'2025-11-20', read:false, icon:'🤝', link:'/teacher', targetRole:'teacher', targetId:'t-001' },
  { id:'n-041', type:'referral', title:'引荐完成', content:'姜海波与蔡小凤的引荐已完成，双方就「中式烘焙品牌出海」达成了物流合作意向', time:'2025-06-03', read:true, icon:'✅', link:'/teacher', targetRole:'teacher', targetId:'t-001' },
  { id:'n-042', type:'system', title:'班级动态', content:'您负责的第12期本月有2位学员发起新项目，3位参与投资，班级活跃度排名第2', time:'2025-11-01', read:true, icon:'📊', link:'/teacher', targetRole:'teacher', targetId:'t-001' },

  // ====== 老师 t-005 李国栋的通知 ======
  { id:'n-050', type:'referral', title:'新引荐请求', content:'王建国（第14期）希望您引荐认识冯子轩，了解「工业物联网平台扩容」项目', time:'2025-11-15', read:false, icon:'🤝', link:'/teacher', targetRole:'teacher', targetId:'t-005' },
  { id:'n-051', type:'referral', title:'新引荐请求', content:'孙丽娜（第16期）希望您引荐认识曹美玲，了解「女装品牌数字化转型」项目', time:'2025-11-18', read:false, icon:'🤝', link:'/teacher', targetRole:'teacher', targetId:'t-005' },
  { id:'n-052', type:'referral', title:'新引荐请求', content:'刘雨桐（第18期）希望您引荐认识范文杰，探讨「互联网家装平台升级」的入驻合作', time:'2025-11-22', read:false, icon:'🤝', link:'/teacher', targetRole:'teacher', targetId:'t-005' },
  { id:'n-053', type:'system', title:'班级动态', content:'您负责的第22期本月新增3个项目，5位学员参与投资，班级活跃度排名第1！', time:'2025-11-01', read:true, icon:'📊', link:'/teacher', targetRole:'teacher', targetId:'t-005' },

  // ====== 管理员通知 ======
  { id:'n-060', type:'system', title:'平台周报', content:'本周新增项目3个，新增投资参与8笔，累计回款 ¥12.5万，平台运营正常', time:'2025-11-17', read:false, icon:'📊', link:'/admin', targetRole:'admin', targetId:'m-admin' },
  { id:'n-061', type:'system', title:'学员注册提醒', content:'第22期新增注册学员3人（夏天宇、方雨欣、崔明浩），请关注新学员的首次活跃情况', time:'2025-11-10', read:true, icon:'🎓', link:'/admin#members', targetRole:'admin', targetId:'m-admin' },
  { id:'n-062', type:'system', title:'项目终止通知', content:'项目「共享办公空间运营」已终止，发起人梁俊豪已启动清算流程，请持续关注', time:'2025-09-15', read:true, icon:'⚠️', link:'/admin#projects', targetRole:'admin', targetId:'m-admin' },
  { id:'n-063', type:'system', title:'回款里程碑', content:'项目「短视频MCN机构内容升级」已完成全部回款，回报率142%，为平台第4个成功案例', time:'2025-08-18', read:true, icon:'🏆', link:'/admin#projects', targetRole:'admin', targetId:'m-admin' }
]

// ── 数据初始化函数（供前端使用） ─────────────────────────
// 这个函数会在 index.tsx 中被导出为 JSON 注入前端
export function getInitDataScript(): string {
  return `
(function(){
  // 初始化引荐数据
  if(!localStorage.getItem('zlc_referrals')){
    localStorage.setItem('zlc_referrals', ${JSON.stringify(JSON.stringify(mockReferrals))});
  }
  // 初始化分享记录
  if(!localStorage.getItem('zlc_share_logs')){
    localStorage.setItem('zlc_share_logs', ${JSON.stringify(JSON.stringify(mockShareLogs))});
  }
  // 初始化通知数据
  if(!localStorage.getItem('zlc_notifications')){
    localStorage.setItem('zlc_notifications', ${JSON.stringify(JSON.stringify(mockNotifications))});
  }
})();
`
}

// ── 合同全文 HTML 生成函数 ─────────────────────────────────
export function generateContractHTML(
  contract: Contract,
  project: Project,
  participant: Member | null,
  initiator: Member | null,
): string {
  const cId = contract.id || ''
  const investmentAmount = contract.amount || 0
  const sharePercentage = contract.revenueShareRatio || 0
  const recoveryCap = contract.recoveryCap || 0
  const signedAt = contract.signedAt || '—'
  const pName = project.name || ''
  const pDesc = project.description || ''
  const revenueShareRate = project.revenueShareRate || 0
  const termMonths = project.duration || 0
  const returnMultiple = project.recoveryMultiple || 0
  const descTruncated = pDesc.length > 100 ? pDesc.substring(0, 100) + '...' : pDesc
  const iName = initiator ? initiator.name : (contract.initiatorName || '发起人')
  const iCompany = initiator ? (initiator.company || '一亿中流学员') : (contract.initiatorCompany || '一亿中流学员')
  const iClassName = initiator ? (initiator.className || '') : ''
  const pName2 = participant ? participant.name : (contract.participantName || '参与人')
  const pCompany = participant ? (participant.company || '一亿中流学员') : '一亿中流学员'
  const pClassName = participant ? (participant.className || '') : ''

  return `<div style="font-family:'SimSun','Songti SC',serif;color:#1C1917;line-height:1.8;font-size:14px;">
  <div style="text-align:center;padding-bottom:24px;border-bottom:2px solid #B91C1C;">
    <div style="font-size:11px;color:#A8A29E;letter-spacing:2px;">合同编号：${cId}</div>
    <div style="font-size:22px;font-weight:800;color:#B91C1C;margin-top:12px;letter-spacing:4px;">联合经营协议</div>
    <div style="font-size:12px;color:#78716C;margin-top:6px;">（收入分成模式 · 简化版）</div>
  </div>
  <div style="margin-top:24px;">
    <div style="font-size:15px;font-weight:700;color:#1C1917;margin-bottom:12px;">签署各方</div>
    <div style="background:#FAFAF9;border-radius:10px;padding:16px;margin-bottom:10px;">
      <div style="font-size:12px;color:#B91C1C;font-weight:600;">甲方（项目发起人）</div>
      <div style="font-size:14px;font-weight:600;margin-top:6px;">${iName}</div>
      <div style="font-size:12px;color:#78716C;margin-top:2px;">${iCompany} · ${iClassName}</div>
    </div>
    <div style="background:#FAFAF9;border-radius:10px;padding:16px;margin-bottom:10px;">
      <div style="font-size:12px;color:#3B82F6;font-weight:600;">乙方（投资参与人）</div>
      <div style="font-size:14px;font-weight:600;margin-top:6px;">${pName2}</div>
      <div style="font-size:12px;color:#78716C;margin-top:2px;">${pCompany} · ${pClassName}</div>
    </div>
    <div style="background:#FAFAF9;border-radius:10px;padding:16px;">
      <div style="font-size:12px;color:#D4A853;font-weight:600;">平台见证方</div>
      <div style="font-size:14px;font-weight:600;margin-top:6px;">中流通平台</div>
      <div style="font-size:12px;color:#78716C;margin-top:2px;">滴灌通 × 一亿中流 · 联合出品</div>
    </div>
  </div>
  <div style="margin-top:24px;">
    <div style="font-size:15px;font-weight:700;color:#1C1917;margin-bottom:8px;">鉴于</div>
    <div style="font-size:13px;color:#57534E;">甲方经营${pName}相关业务，乙方拟通过收入分成的联合经营方式参与该项目。各方经友好协商，根据中国相关法律法规，就联营合作达成一致，特订立如下条款。</div>
  </div>
  <div style="margin-top:24px;">
    <div style="font-size:15px;font-weight:700;color:#B91C1C;margin-bottom:12px;">第一条 联营合作商业安排</div>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <tr style="border-bottom:1px solid #E7E5E4;"><td style="padding:10px 0;color:#78716C;width:35%;">项目名称</td><td style="padding:10px 0;font-weight:600;">${pName}</td></tr>
      <tr style="border-bottom:1px solid #E7E5E4;"><td style="padding:10px 0;color:#78716C;">联营资金金额</td><td style="padding:10px 0;font-weight:600;color:#B91C1C;">人民币 ${investmentAmount} 万元整</td></tr>
      <tr style="border-bottom:1px solid #E7E5E4;"><td style="padding:10px 0;color:#78716C;">乙方占比份额</td><td style="padding:10px 0;font-weight:600;">${sharePercentage}%</td></tr>
      <tr style="border-bottom:1px solid #E7E5E4;"><td style="padding:10px 0;color:#78716C;">收入分成比例</td><td style="padding:10px 0;font-weight:600;">${revenueShareRate}%</td></tr>
      <tr style="border-bottom:1px solid #E7E5E4;"><td style="padding:10px 0;color:#78716C;">联营期限</td><td style="padding:10px 0;font-weight:600;">${termMonths} 个月</td></tr>
      <tr style="border-bottom:1px solid #E7E5E4;"><td style="padding:10px 0;color:#78716C;">退出方式</td><td style="padding:10px 0;font-weight:600;">${project.exitMode === 'term_only' ? '仅期限到期' : project.exitMode === 'cap_only' ? '仅封顶' : '先到为准'}</td></tr>
      <tr style="border-bottom:1px solid #E7E5E4;"><td style="padding:10px 0;color:#78716C;">${project.exitMode === 'term_only' ? '预期收益倍数' : '封顶倍数'}</td><td style="padding:10px 0;font-weight:600;">${returnMultiple.toFixed(2)} x</td></tr>
      <tr style="border-bottom:1px solid #E7E5E4;"><td style="padding:10px 0;color:#78716C;">回收上限金额</td><td style="padding:10px 0;font-weight:600;color:#B91C1C;">人民币 ${recoveryCap.toFixed(2)} 万元整</td></tr>
      <tr><td style="padding:10px 0;color:#78716C;">联营资金用途</td><td style="padding:10px 0;">${descTruncated}</td></tr>
    </table>
  </div>
  <div style="margin-top:24px;">
    <div style="font-size:15px;font-weight:700;color:#B91C1C;margin-bottom:12px;">第二条 收入分成及回款安排</div>
    <div style="font-size:13px;color:#57534E;">
      <p style="margin-bottom:8px;"><strong>2.1 分成起始日：</strong>自本协议签署之日（${signedAt}）起计算。</p>
      <p style="margin-bottom:8px;"><strong>2.2 分成方式：</strong>甲方应按月向平台上报项目营业收入，平台根据乙方投资占比（${sharePercentage}%）自动计算乙方应得的分成金额，并进行分配。</p>
      <p style="margin-bottom:8px;"><strong>2.3 分成付款频率：</strong>每自然月结算一次，甲方应在每月 18 日前完成上月收入上报。</p>
      <p style="margin-bottom:8px;"><strong>2.4 分成终止：</strong>当乙方累计实际取得的分成金额达到回收上限金额（人民币 ${recoveryCap} 万元）时，收入分成自动终止。</p>
      <p style="margin-bottom:8px;"><strong>2.5 联营方收入定义：</strong>指甲方就本项目扣除所有税项及费用前的全部营业收入（包含主营业务收入及其他业务收入）。</p>
    </div>
  </div>
  <div style="margin-top:24px;">
    <div style="font-size:15px;font-weight:700;color:#B91C1C;margin-bottom:12px;">第三条 各方权利义务</div>
    <div style="font-size:13px;color:#57534E;">
      <p style="margin-bottom:8px;"><strong>3.1 甲方义务：</strong>（1）按时、如实上报项目营业收入；（2）确保收入数据真实、准确、完整；（3）不得挪用联营资金；（4）如发生影响项目运营的重大事项，应在 5 个自然日内书面通知平台及乙方。</p>
      <p style="margin-bottom:8px;"><strong>3.2 乙方义务：</strong>（1）按本协议约定支付联营资金；（2）配合完成电子签署流程；（3）理解并接受收入分成模式的风险特征。</p>
      <p style="margin-bottom:8px;"><strong>3.3 平台义务：</strong>（1）提供合同生成与电子签署服务；（2）提供收入上报与回款分配的技术支持；（3）提供项目全生命周期的数据追踪服务；（4）合同文件托管与存证。</p>
      <p style="margin-bottom:8px;"><strong>3.4 经营独立性：</strong>甲方负责项目的日常经营并以自身名义对外经营，乙方不参与甲方的日常经营决策。本协议不构成各方之间的合伙、合资、代理或借贷关系。</p>
    </div>
  </div>
  <div style="margin-top:24px;">
    <div style="font-size:15px;font-weight:700;color:#B91C1C;margin-bottom:12px;">第四条 陈述、保证与承诺</div>
    <div style="font-size:13px;color:#57534E;">
      <p style="margin-bottom:8px;"><strong>4.1</strong> 各方均具有适当的法律资格和法律能力签署、交付并履行本协议。</p>
      <p style="margin-bottom:8px;"><strong>4.2</strong> 甲方保证其合法合规经营，已取得经营业务所需的全部批准、许可及政府授权。</p>
      <p style="margin-bottom:8px;"><strong>4.3</strong> 甲方保证向平台及乙方提供的所有信息真实、准确、完整，不存在重大遗漏或隐瞒。</p>
      <p style="margin-bottom:8px;"><strong>4.4</strong> 甲方保证不存在与本协议项下联营合作相冲突的其他安排。</p>
    </div>
  </div>
  <div style="margin-top:24px;">
    <div style="font-size:15px;font-weight:700;color:#B91C1C;margin-bottom:12px;">第五条 违约责任与协议终止</div>
    <div style="font-size:13px;color:#57534E;">
      <p style="margin-bottom:8px;"><strong>5.1 违约责任：</strong>任何一方违反本协议约定的，违约方应承担损失赔偿责任。</p>
      <p style="margin-bottom:8px;"><strong>5.2 严重违约：</strong>如甲方出现挪用资金、虚报收入、擅自终止经营等严重违约情形，乙方有权要求退还全部联营资金，并要求支付联营资金 20% 的违约金。</p>
      <p style="margin-bottom:8px;"><strong>5.3 提前终止：</strong>任何一方需提前终止本协议的，应提前 7 个自然日书面通知另一方，并按约定支付相应补偿金。</p>
      <p style="margin-bottom:8px;"><strong>5.4 自动终止：</strong>${project.exitMode === 'term_only' ? '联营期限届满时' : project.exitMode === 'cap_only' ? '当乙方累计回款达到回收上限金额时' : '当乙方累计回款达到回收上限金额，或联营期限届满（以先到者为准）时'}，本协议自动终止。</p>
    </div>
  </div>
  <div style="margin-top:24px;">
    <div style="font-size:15px;font-weight:700;color:#B91C1C;margin-bottom:12px;">第六条 其他条款</div>
    <div style="font-size:13px;color:#57534E;">
      <p style="margin-bottom:8px;"><strong>6.1 保密：</strong>未经披露方书面同意，任何一方不得向第三方披露本协议内容及因履行本协议而获知的商业信息。</p>
      <p style="margin-bottom:8px;"><strong>6.2 争议解决：</strong>因本协议引起的争议，各方应友好协商解决；协商不成的，提交深圳国际仲裁院仲裁。</p>
      <p style="margin-bottom:8px;"><strong>6.3 协议效力：</strong>本协议自各方电子签署后生效，具有同等法律效力。</p>
    </div>
  </div>
  <div style="margin-top:32px;border-top:1px solid #E7E5E4;padding-top:24px;">
    <div style="font-size:15px;font-weight:700;color:#1C1917;margin-bottom:16px;">签署确认</div>
    <div style="display:flex;gap:16px;">
      <div style="flex:1;background:#FAFAF9;border-radius:10px;padding:16px;">
        <div style="font-size:12px;color:#78716C;">甲方（项目发起人）</div>
        <div style="font-size:14px;font-weight:600;margin-top:8px;">${iName}</div>
        <div style="font-size:12px;color:#78716C;margin-top:4px;">${iCompany}</div>
        <div style="margin-top:12px;border-bottom:1px solid #D6D3D1;padding-bottom:4px;">
          <span style="font-size:11px;color:#A8A29E;">签字：</span>
          <span style="font-size:14px;font-weight:600;color:#B91C1C;font-style:italic;">${iName}</span>
        </div>
        <div style="font-size:11px;color:#A8A29E;margin-top:6px;">签署日期：${signedAt}</div>
      </div>
      <div style="flex:1;background:#FAFAF9;border-radius:10px;padding:16px;">
        <div style="font-size:12px;color:#78716C;">乙方（投资参与人）</div>
        <div style="font-size:14px;font-weight:600;margin-top:8px;">${pName2}</div>
        <div style="font-size:12px;color:#78716C;margin-top:4px;">${pCompany}</div>
        <div style="margin-top:12px;border-bottom:1px solid #D6D3D1;padding-bottom:4px;">
          <span style="font-size:11px;color:#A8A29E;">签字：</span>
          <span style="font-size:14px;font-weight:600;color:#3B82F6;font-style:italic;">${pName2}</span>
        </div>
        <div style="font-size:11px;color:#A8A29E;margin-top:6px;">签署日期：${signedAt}</div>
      </div>
    </div>
    <div style="margin-top:12px;background:#FAFAF9;border-radius:10px;padding:16px;text-align:center;">
      <div style="font-size:12px;color:#78716C;">平台见证</div>
      <div style="font-size:14px;font-weight:600;margin-top:4px;">中流通平台 · 滴灌通 × 一亿中流</div>
      <div style="margin-top:8px;">
        <span style="display:inline-block;width:48px;height:48px;border-radius:50%;border:2px solid #B91C1C;line-height:48px;text-align:center;font-size:11px;color:#B91C1C;font-weight:700;">见证章</span>
      </div>
    </div>
  </div>
  <div style="margin-top:24px;text-align:center;font-size:11px;color:#A8A29E;">
    <div>本协议一式两份，甲乙双方各执一份，具有同等法律效力</div>
    <div style="margin-top:4px;">中流通平台提供电子签署与合同托管服务</div>
  </div>
</div>`
}

// Demo 验证码
export const DEMO_VERIFY_CODE = '888888'
