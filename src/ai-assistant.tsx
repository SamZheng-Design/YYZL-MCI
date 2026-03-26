// ============================================================
// 中流通 ZhongLiu Connect — AI Assistant (智能助理浮窗)
// 参考 Notion AI / Stripe Copilot / Linear 风格
// 纯前端、无外部 AI 调用、文案预置、角色区分
// ============================================================

/**
 * AIAssistantScript — 注入 AI 助理的全部 JS 逻辑
 * 在 GlobalScripts 之后、页面 </body> 之前引入
 */
export const AIAssistantScript = () => (
  <script dangerouslySetInnerHTML={{ __html: `
// ── AI Assistant: Master Init ──
(function(){
  // 只在非 /login 页面显示
  if(window.location.pathname === '/login') return;
  // 等 DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', _initAIAssistant);
  } else {
    setTimeout(_initAIAssistant, 200);
  }
})();

function _initAIAssistant(){
  // 防重复
  if(document.getElementById('ai-assistant-fab')) return;

  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if(!u) return;

  var role = u.role || 'member';
  var path = window.location.pathname;
  var userName = u.name || '';

  // ═══════════════════════════════════════════════════
  // 1. 页面上下文知识库 — 15 routes × 3 roles
  // ═══════════════════════════════════════════════════
  var pageContextDB = {
    // ── 首页 ──
    '/': {
      member: {
        title: '首页概览',
        explain: '这是你的投资仪表盘。上方显示本周回款速报、投资概览（总投资、总回款、回收率），下方是你参与的项目和最新回款动态。',
        suggestions: [
          { icon: '🏪', text: '去项目大厅看看同学的项目', action: '/projects' },
          { icon: '🚀', text: '发起我自己的项目', action: '/create' },
          { icon: '💰', text: '查看我的回款详情', action: '/repayments' },
        ],
        tips: '回收率超过 100% 意味着你已经赚回本金并开始盈利了！'
      },
      teacher: {
        title: '首页（老师视角）',
        explain: '老师登录后会自动跳转到工作台。如果你看到这个页面，说明系统正在加载。',
        suggestions: [
          { icon: '📋', text: '前往老师工作台', action: '/teacher' },
        ],
        tips: '你可以在工作台处理引荐请求和管理班级学员。'
      },
      admin: {
        title: '首页（管理员视角）',
        explain: '管理员登录后会自动跳转到管理后台。如果你看到这个页面，说明系统正在加载。',
        suggestions: [
          { icon: '🖥️', text: '前往管理后台', action: '/admin' },
        ],
        tips: '管理后台可以审核项目、管理学员、查看平台数据。'
      }
    },

    // ── 项目大厅 ──
    '/projects': {
      member: {
        title: '项目大厅',
        explain: '这里展示所有同学发起的项目。顶部统计了募集中/运营中项目数和累计金额。你可以按行业、状态筛选，也可以按"与我相关"智能排序——同班同学和老师推荐的项目会排在前面。',
        suggestions: [
          { icon: '🔍', text: '按"分成最高"排序看看', action: 'sort:rate' },
          { icon: '🏷️', text: '只看"募集中"的项目', action: 'filter:open' },
          { icon: '📊', text: '了解什么是 RBF', action: 'term:rbf' },
        ],
        tips: '绿色标签 = 同班同学的项目，金色标签 = 老师推荐的项目。优先关注这些！'
      },
      teacher: {
        title: '项目大厅（老师视角）',
        explain: '你可以浏览所有项目，为你认可的项目点击"推荐"，推荐后项目会在你班级学员的列表中获得金色标签。',
        suggestions: [
          { icon: '⭐', text: '去工作台管理我的推荐', action: '/teacher' },
          { icon: '🏪', text: '浏览全部项目', action: 'scroll:top' },
        ],
        tips: '推荐是你对项目质量的背书，请谨慎选择推荐项目。'
      },
      admin: {
        title: '项目大厅（管理员视角）',
        explain: '管理员可以查看所有项目的状态，待审核的项目需要在管理后台操作。',
        suggestions: [
          { icon: '🖥️', text: '去管理后台审核项目', action: '/admin' },
        ],
        tips: '项目审核通过后会变为"募集中"状态，所有学员都能看到。'
      }
    },

    // ── 项目详情（匹配 /projects/ 开头） ──
    '/projects/': {
      member: {
        title: '项目详情',
        explain: '这里是项目的完整信息：发起人简介、融资条款（金额、分成比例、期限、封顶倍数）、预估回报计算、已参与的投资人列表。底部可以选择份数并参与投资。',
        suggestions: [
          { icon: '📐', text: '了解"分成比例"怎么算', action: 'term:share_ratio' },
          { icon: '🔒', text: '了解"封顶倍数"是什么', action: 'term:cap' },
          { icon: '🧮', text: '了解"预估回本时间"', action: 'term:payback' },
          { icon: '🤝', text: '不认识发起人？请老师引荐', action: 'term:referral' },
        ],
        tips: '参与投资前，建议先了解发起人的公司背景。不确定的话，可以请老师帮你和发起人对接。'
      },
      teacher: {
        title: '项目详情（老师视角）',
        explain: '查看项目完整条款。如果你认可这个项目，可以在工作台将其加入推荐列表。',
        suggestions: [
          { icon: '⭐', text: '去工作台推荐这个项目', action: '/teacher' },
        ],
        tips: '你的推荐会影响学员的投资决策，请确保充分了解项目后再推荐。'
      },
      admin: {
        title: '项目详情（管理员视角）',
        explain: '查看项目完整信息。如果项目状态为"待审核"，可以在管理后台进行审核。',
        suggestions: [
          { icon: '✅', text: '去管理后台审核', action: '/admin' },
        ],
        tips: '审核时重点关注融资金额合理性和发起人资质。'
      }
    },

    // ── 发起项目 ──
    '/create': {
      member: {
        title: '发起项目',
        explain: '四步流程：① 填写项目基本信息（名称、行业、描述）→ ② 设定融资条款（目标金额、分成比例、期限）→ ③ 预览自动计算结果（份数、份价、封顶倍数）→ ④ 确认提交，等待管理员审核。',
        suggestions: [
          { icon: '📋', text: '看看别人怎么写项目描述', action: '/projects' },
          { icon: '📊', text: '了解"分成比例"怎么设', action: 'term:share_ratio' },
          { icon: '⏱️', text: '了解"联营期限"怎么选', action: 'term:duration' },
        ],
        tips: '目标融资金额建议 20-200 万，分成比例通常 5%-15%，期限 12-36 个月。提交后管理员会在 1-2 个工作日内审核。'
      },
      teacher: {
        title: '发起项目（老师视角）',
        explain: '老师也可以发起项目。流程和学员一样，提交后等待管理员审核。',
        suggestions: [],
        tips: '作为老师，你发起的项目会自带信任度加成。'
      },
      admin: {
        title: '发起项目',
        explain: '管理员不能直接发起项目，需要切换到学员或老师账号。',
        suggestions: [
          { icon: '🔄', text: '切换到学员账号', action: '/login' },
        ],
        tips: '管理员可以在管理后台帮学员创建项目。'
      }
    },

    // ── 回款中心 ──
    '/repayments': {
      member: {
        title: '回款中心',
        explain: '左边"我的投资"显示你参与的所有合同的回款情况：每个项目的投资金额、累计回款、回收进度。点击可查看详细回款流水。右边"我的发起"显示你发起的项目的收入和分成情况。',
        suggestions: [
          { icon: '📊', text: '了解"回收率"怎么算', action: 'term:recovery' },
          { icon: '💡', text: '了解"到账状态"的含义', action: 'term:arrival' },
          { icon: '📝', text: '去提交营收报告', action: 'term:revenue_report' },
        ],
        tips: '回收率 = 累计回款 ÷ 投资金额 × 100%。超过 100% 表示已赚回本金。'
      },
      teacher: {
        title: '回款中心（老师视角）',
        explain: '如果你有参与投资或发起项目，这里会显示你的回款数据。',
        suggestions: [],
        tips: '老师也可以参与投资，享受和学员同等的回款权益。'
      },
      admin: {
        title: '回款中心（管理员视角）',
        explain: '管理员查看平台整体回款数据。导入分账数据请到管理后台。',
        suggestions: [
          { icon: '📤', text: '去管理后台导入分账数据', action: '/admin' },
        ],
        tips: '分账数据由滴灌通系统导出，管理员通过 CSV 格式导入。'
      }
    },

    // ── 条款通 ──
    '/contracts/': {
      member: {
        title: '条款确认',
        explain: '这是 RBF 条款联动确认页。三个滑块相互关联：调整投资金额会同步变化分成比例和期限。下方显示 IRR（内部收益率）和退出条件。确认条款后等待老师/管理员审批。',
        suggestions: [
          { icon: '🧮', text: '了解 IRR 是什么', action: 'term:irr' },
          { icon: '📊', text: '了解 RBF 核心公式', action: 'term:rbf' },
          { icon: '🔒', text: '了解退出条件', action: 'term:exit' },
        ],
        tips: '滑块联动的核心公式：金额 = 比例 × k（锚点），调整其一另两个自动适配。IRR 越高说明投资回报越好。'
      },
      teacher: {
        title: '条款审批',
        explain: '你负责审批学员之间的合同条款。请确认条款的合理性后点击"通过"或"退回"。',
        suggestions: [],
        tips: '审批时重点关注分成比例和期限是否合理，保护双方利益。'
      },
      admin: {
        title: '条款审批',
        explain: '管理员可以审批合同条款。请确认条款参数在合理范围内。',
        suggestions: [],
        tips: '管理员审批具有最终效力，通过后双方即可进入签约流程。'
      }
    },

    // ── 管理后台 ──
    '/admin': {
      admin: {
        title: '管理后台',
        explain: '管理后台包含六大模块：① 平台数据看板（学员数、项目数、融资总额等 KPI）② 待审核项目列表 ③ 学员管理（批量注册、启用/禁用）④ 分账数据导入 ⑤ 邀请码管理 ⑥ 合同管理。',
        suggestions: [
          { icon: '📋', text: '查看待审核的项目', action: 'scroll:#admin-review' },
          { icon: '👥', text: '批量注册新学员', action: 'scroll:#admin-members' },
          { icon: '📤', text: '导入分账数据', action: 'scroll:#admin-settlement' },
          { icon: '🔑', text: '生成邀请码', action: 'scroll:#admin-invite' },
        ],
        tips: '建议每日检查：待审核项目、待处理注册申请、分账数据更新。'
      },
      member: {
        title: '管理后台',
        explain: '你没有管理员权限，无法访问此页面。',
        suggestions: [
          { icon: '🏠', text: '返回首页', action: '/' },
        ],
        tips: ''
      },
      teacher: {
        title: '管理后台',
        explain: '老师没有管理员权限。',
        suggestions: [
          { icon: '📋', text: '前往老师工作台', action: '/teacher' },
        ],
        tips: ''
      }
    },

    // ── 老师工作台 ──
    '/teacher': {
      teacher: {
        title: '老师工作台',
        explain: '你的工作中心：① 班级概览（学员数、项目参与情况）② 引荐请求处理（学员请你帮忙对接项目发起人）③ 项目推荐管理（你推荐的项目列表）④ 班级学员详情。',
        suggestions: [
          { icon: '🤝', text: '处理待办的引荐请求', action: 'scroll:#teacher-referrals' },
          { icon: '⭐', text: '管理我的推荐项目', action: 'scroll:#teacher-recommend' },
          { icon: '👥', text: '查看班级学员列表', action: 'scroll:#teacher-students' },
        ],
        tips: '引荐请求建议 24 小时内处理，学员在等待你的回复。'
      },
      member: {
        title: '老师工作台',
        explain: '你没有老师权限，无法访问此页面。',
        suggestions: [
          { icon: '🏠', text: '返回首页', action: '/' },
        ],
        tips: ''
      },
      admin: {
        title: '老师工作台',
        explain: '管理员可以查看但不能操作老师工作台。',
        suggestions: [
          { icon: '🖥️', text: '返回管理后台', action: '/admin' },
        ],
        tips: ''
      }
    },

    // ── 个人主页 ──
    '/profile': {
      member: {
        title: '个人主页',
        explain: '这里显示你的个人信息：姓名、公司、行业、班期。你可以修改密码，也可以查看你的老师信息。',
        suggestions: [
          { icon: '🔒', text: '修改密码', action: 'scroll:#profile-password' },
          { icon: '📊', text: '查看我的投资统计', action: '/' },
        ],
        tips: '第一次登录建议立即修改密码，默认密码是公共的。'
      },
      teacher: {
        title: '个人主页',
        explain: '查看和管理你的个人信息。',
        suggestions: [],
        tips: ''
      },
      admin: {
        title: '设置',
        explain: '管理员设置页面，可以修改密码和查看账号信息。',
        suggestions: [],
        tips: ''
      }
    },

    // ── 通知 ──
    '/notifications': {
      member: {
        title: '通知中心',
        explain: '这里是你的所有消息：项目审核结果、合同签署通知、回款到账通知、引荐进展。未读消息有蓝色标记。',
        suggestions: [
          { icon: '✅', text: '全部标记已读', action: 'action:markAllRead' },
        ],
        tips: '重要的投资机会和回款信息会通过通知推送给你，建议经常查看。'
      },
      teacher: {
        title: '通知中心',
        explain: '引荐请求、合同审批等需要你处理的事项会出现在这里。',
        suggestions: [
          { icon: '✅', text: '全部标记已读', action: 'action:markAllRead' },
        ],
        tips: ''
      },
      admin: {
        title: '通知中心',
        explain: '新注册申请、项目提交等需要审核的事项通知。',
        suggestions: [
          { icon: '✅', text: '全部标记已读', action: 'action:markAllRead' },
        ],
        tips: ''
      }
    },

    // ── 投资详情 ──
    '/investments/': {
      member: {
        title: '投资详情',
        explain: '查看单笔投资的完整信息：合同条款、回款流水（每期金额、累计回收）、回收进度图表。你也可以查看合同全文。',
        suggestions: [
          { icon: '📊', text: '了解"回收进度"怎么算', action: 'term:recovery' },
          { icon: '📄', text: '查看合同全文', action: 'action:viewContract' },
        ],
        tips: '每期回款金额 = 当月项目收入 × 分成比例 × 你的份额占比。'
      },
      teacher: { title: '投资详情', explain: '查看投资合同的回款明细。', suggestions: [], tips: '' },
      admin: { title: '投资详情', explain: '管理员查看合同回款明细。', suggestions: [], tips: '' }
    },

    // ── 营收报告 ──
    '/initiated/': {
      member: {
        title: '营收报告',
        explain: '作为项目发起人，你需要定期提交项目的月营收数据。系统会自动计算每位投资人应得的分成金额。',
        suggestions: [
          { icon: '📊', text: '了解分成计算公式', action: 'term:share_formula' },
        ],
        tips: '请如实填写月营收数据。虚报收入会影响你的信用评级。'
      },
      teacher: { title: '营收报告', explain: '查看项目营收报告。', suggestions: [], tips: '' },
      admin: { title: '营收报告', explain: '管理员查看营收报告数据。', suggestions: [], tips: '' }
    },

    // ── 分享码页面 ──
    '/share/': {
      member: { title: '分享跳转', explain: '通过分享码直接跳转到项目详情。', suggestions: [], tips: '' },
      teacher: { title: '分享跳转', explain: '通过分享码直接跳转到项目详情。', suggestions: [], tips: '' },
      admin: { title: '分享跳转', explain: '通过分享码直接跳转到项目详情。', suggestions: [], tips: '' }
    },

    // ── 引导页 ──
    '/guide': {
      member: { title: '使用引导', explain: '查看中流通的功能演示和操作指南。', suggestions: [{ icon: '🏠', text: '返回首页开始使用', action: '/' }], tips: '' },
      teacher: { title: '使用引导', explain: '查看中流通的功能演示和操作指南。', suggestions: [{ icon: '📋', text: '返回工作台', action: '/teacher' }], tips: '' },
      admin: { title: '使用引导', explain: '查看中流通的功能演示和操作指南。', suggestions: [{ icon: '🖥️', text: '返回管理后台', action: '/admin' }], tips: '' }
    }
  };

  // ── 路径匹配（支持前缀匹配）──
  function getPageContext(){
    // 精确匹配
    if(pageContextDB[path] && pageContextDB[path][role]) return pageContextDB[path][role];
    // 前缀匹配（/projects/:id, /contracts/:id/terms, etc.）
    var prefixes = ['/investments/', '/initiated/', '/contracts/', '/projects/', '/share/', '/guide'];
    for(var i=0; i<prefixes.length; i++){
      if(path.startsWith(prefixes[i]) && pageContextDB[prefixes[i]] && pageContextDB[prefixes[i]][role]){
        return pageContextDB[prefixes[i]][role];
      }
    }
    // 回退
    return { title: '当前页面', explain: '欢迎使用中流通智能助理。有任何疑问，可以输入关键词或选择下方快捷入口。', suggestions: [], tips: '' };
  }

  // ═══════════════════════════════════════════════════
  // 2. 术语解释库
  // ═══════════════════════════════════════════════════
  var termDB = {
    'rbf': { title: 'RBF（收入分成融资）', body: 'Revenue-Based Financing 的缩写。核心逻辑：投资人出资参与项目，项目每月按收入的一定比例给投资人回款，直到合同期限结束或达到封顶金额。\\n\\n和借贷的区别：没有固定月还款额，赚多分多、赚少分少。\\n和入股的区别：不涉及股权变更，合同到期自动结束。' },
    'share_ratio': { title: '分成比例', body: '项目每月营业收入中分给所有投资人的百分比。\\n\\n举例：分成比例 10%，月收入 50 万，则当月所有投资人共分 5 万。你分到多少取决于你占总投资额的比例。\\n\\n通常范围：5%-15%，比例越高投资人回报越快，但发起人压力越大。' },
    'cap': { title: '封顶倍数', body: '投资人最多能拿回投资金额的几倍。\\n\\n举例：投了 10 万，封顶倍数 1.5 倍，则最多拿回 15 万。达到上限后合同自动终止。\\n\\n通常范围：1.2-2.0 倍。倍数越高对投资人越有利。' },
    'irr': { title: 'IRR（内部收益率）', body: '衡量投资回报的年化利率。考虑了资金的时间价值。\\n\\n通俗理解：相当于把这笔投资理解为"存了一笔定期"，IRR 就是它的年利率。\\n\\nIRR 15% ≈ 每投 100 万，一年净赚 15 万（复利计算）。\\nIRR > 12% 通常认为是不错的投资。' },
    'payback': { title: '预估回本时间', body: '根据预估月营收和分成条款，大约需要多久才能收回全部本金。\\n\\n计算公式：投资金额 ÷ 每月预估回款额\\n\\n注意：这只是预估值，实际取决于项目真实营收。' },
    'recovery': { title: '回收率', body: '已收到的累计回款 ÷ 投资金额 × 100%。\\n\\n回收率 < 100%：还没收回本金\\n回收率 = 100%：刚好回本\\n回收率 > 100%：已开始盈利\\n\\n封顶倍数决定了回收率的最大值（如 1.5 倍 = 最高 150%）。' },
    'duration': { title: '联营期限', body: '合同的有效时长，以月为单位。期限到了合同自动终止，不管是否收回投资。\\n\\n通常范围：12-36 个月。期限越长，回本概率越高，但资金锁定时间也越长。' },
    'exit': { title: '退出条件', body: '合同提前终止的两个触发条件：\\n\\n① 到期退出：合同期限到了，不管回收率多少，合同结束。\\n② 封顶退出：累计回款达到封顶金额（投资额 × 封顶倍数），合同提前结束。\\n\\n先到的条件先触发。' },
    'referral': { title: '老师引荐', body: '如果你对某个项目感兴趣但不认识发起人，可以点"请老师引荐"。你的班级老师会收到通知，帮你和发起人建立联系。线下沟通确认后，再回到平台操作投资。\\n\\n这是中流通的核心机制——基于熟人信任的投资。' },
    'arrival': { title: '到账状态', body: '回款记录的资金到账情况：\\n\\n✅ 已到账：资金已转入你的账户\\n⏳ 处理中：正在结算，通常 1-3 个工作日\\n❌ 异常：需要联系管理员处理' },
    'share_formula': { title: '分成计算公式', body: '你的月回款 = 项目当月收入 × 分成比例 × (你的投资额 ÷ 项目融资总额)\\n\\n举例：\\n项目月收入 50 万\\n分成比例 10%\\n你投了 10 万（总融资 100 万）\\n\\n你的月回款 = 50 × 10% × (10/100) = 0.5 万' },
    'revenue_report': { title: '营收报告', body: '项目发起人需要定期提交项目的月营收数据。管理员导入滴灌通系统数据后，系统自动计算每位投资人的回款金额。\\n\\n发起人有义务如实报告营收，这是合同约定的义务。' }
  };

  // ═══════════════════════════════════════════════════
  // 3. FAQ 问答库（关键词匹配）
  // ═══════════════════════════════════════════════════
  var faqDB = [
    { keywords: ['怎么投', '怎么参与', '如何投资', '参与投资', '怎么买'], answer: '三种方式参与投资：\\n1. 在首页输入分享码直接查看项目\\n2. 在项目大厅浏览，点击感兴趣的项目后选择份数参与\\n3. 在项目详情页点"请老师引荐"，让老师帮你对接发起人\\n\\n参与后需要完成条款确认和合同签署。' },
    { keywords: ['怎么发起', '发布项目', '创建项目', '怎么融资'], answer: '点击底部"发起"按钮，按步骤填写：\\n① 项目基本信息（名称、行业、描述）\\n② 融资条款（目标金额、分成比例、期限）\\n③ 预览确认\\n\\n提交后等管理员审核（1-2 个工作日）。审核通过后自动进入"募集中"状态。' },
    { keywords: ['回款怎么算', '回款计算', '分多少钱', '怎么分钱', '收益'], answer: '你的月回款 = 项目当月收入 × 分成比例 × 你的份额占比。\\n\\n例如项目月收入 50 万、分成比例 10%、你占 5%，则你当月回款 = 50 × 10% × 5% = 0.25 万。' },
    { keywords: ['安全', '靠谱', '有保障', '风险', '亏了', '赔钱'], answer: '收入分成的特点：赚多分多、赚少分少。\\n\\n风险提示：\\n• 如果项目收入下降，回款也会减少\\n• 合同到期未回本，投资即结束\\n• 封顶倍数限制了最大收益\\n\\n安全保障：\\n• 仅限一亿中流认证学员\\n• 标准化电子合同\\n• 滴灌通基础设施\\n• 老师引荐 + 同学信任' },
    { keywords: ['分享码', '分享', '邀请', '推荐给朋友'], answer: '每个项目都有一个 6 位分享码。你可以：\\n• 复制分享码发到微信群\\n• 复制分享链接\\n• 保存分享卡片\\n\\n其他同学输入分享码后能直接看到项目。' },
    { keywords: ['合同', '签约', '签署', '法律效力'], answer: '平台使用标准化电子合同：\\n1. 双方确认条款（在"条款通"页面）\\n2. 老师/管理员审批\\n3. 双方在线签署\\n\\n签署后合同即刻生效，具有法律效力。' },
    { keywords: ['老师', '引荐', '对接', '不认识'], answer: '在项目详情页点"请老师引荐"按钮。你的班级老师会收到通知，帮你和发起人建立联系。线下见面聊清楚后，再回平台操作。\\n\\n这是中流通的核心——基于熟人信任的投资。' },
    { keywords: ['密码', '登录', '忘记密码', '改密码'], answer: '登录后在"我的"页面可以修改密码。如果忘记密码，请联系管理员重置。\\n\\n首次登录默认密码为 zhongliu2026，系统会提示你修改。' },
    { keywords: ['条款通', '滑块', '调整条款', '条款'], answer: '"条款通"是投资双方确认合作条款的互动页面。三个滑块联动：\\n\\n• 投资金额 ↔ 分成比例 ↔ 合作期限\\n• 调整一个，另外两个自动适配\\n\\n核心公式：金额 = 比例 × 锚点k\\n\\n确认后等待老师/管理员审批。' },
    { keywords: ['irr', 'IRR', '内部收益率', '年化'], answer: 'IRR（内部收益率）是衡量投资回报的指标，考虑了资金时间价值。\\n\\n简单理解：相当于把投资看作一笔定期存款，IRR 就是年利率。\\n\\nIRR 15% ≈ 每投 100 万一年净赚 15 万。\\nIRR > 12% 通常是不错的回报。' }
  ];

  // ═══════════════════════════════════════════════════
  // 4. 动态智能建议（基于页面数据状态）
  // ═══════════════════════════════════════════════════
  function getDynamicSuggestions(){
    var suggestions = [];
    // 检查页面上是否有特定的数据状态元素
    if(path === '/' || path === ''){
      // 首页：检查投资概览卡
      var overviewCard = document.getElementById('invest-overview-card');
      if(overviewCard && overviewCard.innerHTML === '') {
        suggestions.push({ icon: '💡', text: '你还没有参与任何投资，去项目大厅看看？', action: '/projects' });
      }
      // 检查统计数字
      var statInit = document.getElementById('stat-initiated');
      if(statInit && statInit.textContent === '0') {
        suggestions.push({ icon: '🚀', text: '还没发起过项目？试试发起你的第一个项目', action: '/create' });
      }
    }
    if(path === '/projects') {
      var emptyState = document.getElementById('empty-state');
      if(emptyState && emptyState.style.display !== 'none') {
        suggestions.push({ icon: '🔄', text: '没找到项目？试试调整筛选条件', action: 'filter:reset' });
      }
    }
    return suggestions;
  }

  // ═══════════════════════════════════════════════════
  // 5. 构建 UI
  // ═══════════════════════════════════════════════════

  // -- Floating Action Button --
  var fab = document.createElement('button');
  fab.id = 'ai-assistant-fab';
  fab.setAttribute('aria-label', '智能助理');
  fab.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a5 5 0 015 5v3a5 5 0 01-10 0V7a5 5 0 015-5z"/><path d="M19 10v1a7 7 0 01-14 0v-1"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
  document.body.appendChild(fab);

  // -- Panel Overlay --
  var overlay = document.createElement('div');
  overlay.id = 'ai-assistant-overlay';
  overlay.innerHTML = buildPanelHTML();
  document.body.appendChild(overlay);

  // -- Event Bindings --
  var isOpen = false;

  fab.addEventListener('click', function(e){
    e.stopPropagation();
    if(isOpen) closePanel();
    else openPanel();
  });

  overlay.addEventListener('click', function(e){
    if(e.target === overlay) closePanel();
  });

  var closeBtn = document.getElementById('ai-close-btn');
  if(closeBtn) closeBtn.addEventListener('click', closePanel);

  // Shortcut buttons
  overlay.querySelectorAll('.ai-shortcut-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var action = btn.getAttribute('data-action');
      handleAction(action);
    });
  });

  // Input box
  var inputEl = document.getElementById('ai-input');
  var sendBtn = document.getElementById('ai-send-btn');
  if(inputEl){
    inputEl.addEventListener('keydown', function(e){
      if(e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleQuery(inputEl.value.trim());
      }
    });
  }
  if(sendBtn){
    sendBtn.addEventListener('click', function(){
      if(inputEl) handleQuery(inputEl.value.trim());
    });
  }

  // Term links inside panel
  overlay.addEventListener('click', function(e){
    var termBtn = e.target.closest('.ai-term-link');
    if(termBtn){
      e.preventDefault();
      var termKey = termBtn.getAttribute('data-term');
      showTermCard(termKey);
    }
  });

  // ── Open / Close ──
  function openPanel(){
    isOpen = true;
    fab.classList.remove('ai-fab-idle');
    fab.classList.add('ai-fab-active');
    overlay.classList.add('show');
    // Refresh dynamic suggestions
    refreshDynamicSuggestions();
    // Focus input
    setTimeout(function(){ if(inputEl) inputEl.focus(); }, 300);
  }

  function closePanel(){
    isOpen = false;
    fab.classList.remove('ai-fab-active');
    overlay.classList.remove('show');
    setTimeout(function(){ if(!isOpen) fab.classList.add('ai-fab-idle'); }, 400);
  }

  // ═══════════════════════════════════════════════════
  // 6. 构建面板 HTML
  // ═══════════════════════════════════════════════════
  function buildPanelHTML(){
    var ctx = getPageContext();
    var roleLabel = { member: '学员', teacher: '老师', admin: '管理员' }[role] || '学员';
    var roleIcon = { member: '🎓', teacher: '👨‍🏫', admin: '⚙️' }[role] || '🎓';

    // Build shortcut buttons
    var shortcutsHTML = '';
    if(ctx.suggestions && ctx.suggestions.length > 0){
      ctx.suggestions.forEach(function(s){
        shortcutsHTML += '<button class="ai-shortcut-btn" data-action="' + s.action + '">'
          + '<span class="ai-shortcut-icon">' + s.icon + '</span>'
          + '<span class="ai-shortcut-text">' + s.text + '</span>'
          + '<i class="fas fa-chevron-right ai-shortcut-arrow"></i>'
          + '</button>';
      });
    }

    // Tips section
    var tipsHTML = '';
    if(ctx.tips){
      tipsHTML = '<div class="ai-tips-card">'
        + '<span class="ai-tips-icon">💡</span>'
        + '<span class="ai-tips-text">' + ctx.tips + '</span>'
        + '</div>';
    }

    return '<div id="ai-panel">'
      // Drag bar
      + '<div class="ai-drag-bar"></div>'
      // Header
      + '<div class="ai-header">'
      + '<div class="ai-header-left">'
      + '<div class="ai-header-avatar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a5 5 0 015 5v3a5 5 0 01-10 0V7a5 5 0 015-5z"/><path d="M19 10v1a7 7 0 01-14 0v-1"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></div>'
      + '<div>'
      + '<div class="ai-header-title">智能助理</div>'
      + '<div class="ai-header-sub">' + roleIcon + ' ' + roleLabel + ' · ' + ctx.title + '</div>'
      + '</div>'
      + '</div>'
      + '<button id="ai-close-btn" class="ai-close-btn">✕</button>'
      + '</div>'
      // Page explanation
      + '<div class="ai-section">'
      + '<div class="ai-section-label"><i class="fas fa-book-open ai-section-icon"></i> 当前页面说明</div>'
      + '<div class="ai-explain-text">' + ctx.explain + '</div>'
      + '</div>'
      // Smart suggestions
      + (shortcutsHTML ? '<div class="ai-section">'
        + '<div class="ai-section-label"><i class="fas fa-compass ai-section-icon"></i> 推荐操作</div>'
        + '<div class="ai-shortcuts-list">' + shortcutsHTML + '</div>'
        + '</div>' : '')
      // Dynamic suggestions area
      + '<div id="ai-dynamic-area"></div>'
      // Tips
      + tipsHTML
      // Term card area (hidden by default)
      + '<div id="ai-term-area"></div>'
      // Answer area (for FAQ results)
      + '<div id="ai-answer-area"></div>'
      // Input
      + '<div class="ai-input-section">'
      + '<div class="ai-input-wrap">'
      + '<input id="ai-input" type="text" placeholder="输入关键词提问..." autocomplete="off" />'
      + '<button id="ai-send-btn"><i class="fas fa-paper-plane"></i></button>'
      + '</div>'
      + '<div class="ai-input-hint">试试输入：分成比例、回款、安全、合同、IRR</div>'
      + '</div>'
      + '</div>';
  }

  // ═══════════════════════════════════════════════════
  // 7. 交互处理
  // ═══════════════════════════════════════════════════
  function handleAction(action){
    if(!action) return;

    // Navigation
    if(action.startsWith('/')) {
      closePanel();
      window.location.href = action;
      return;
    }

    // Term card
    if(action.startsWith('term:')) {
      showTermCard(action.replace('term:', ''));
      return;
    }

    // Scroll to element
    if(action.startsWith('scroll:')) {
      closePanel();
      var selector = action.replace('scroll:', '');
      var el = document.querySelector(selector);
      if(el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Filter actions for projects page
    if(action.startsWith('sort:')) {
      closePanel();
      var sortVal = action.replace('sort:', '');
      var sortSelect = document.getElementById('filter-sort');
      if(sortSelect) { sortSelect.value = sortVal; sortSelect.dispatchEvent(new Event('change')); }
      return;
    }
    if(action.startsWith('filter:')) {
      closePanel();
      var filterVal = action.replace('filter:', '');
      if(filterVal === 'reset') {
        var fInd = document.getElementById('filter-industry');
        var fSta = document.getElementById('filter-status');
        var fSort = document.getElementById('filter-sort');
        if(fInd) { fInd.value = '全部'; fInd.dispatchEvent(new Event('change')); }
        if(fSta) { fSta.value = '全部'; fSta.dispatchEvent(new Event('change')); }
        if(fSort) { fSort.value = 'relevant'; fSort.dispatchEvent(new Event('change')); }
      } else {
        var statusSelect = document.getElementById('filter-status');
        if(statusSelect) { statusSelect.value = filterVal; statusSelect.dispatchEvent(new Event('change')); }
      }
      return;
    }

    // Mark all notifications read
    if(action === 'action:markAllRead') {
      closePanel();
      var markAllBtn = document.querySelector('[id*="mark-all"]') || document.querySelector('button[onclick*="markAllRead"]');
      if(markAllBtn) markAllBtn.click();
      else if(typeof showToast === 'function') showToast('请点击页面顶部的"全部已读"按钮');
      return;
    }

    // View contract
    if(action === 'action:viewContract') {
      closePanel();
      var contractBtn = document.querySelector('[onclick*="openContractModal"]') || document.querySelector('.contract-view-btn');
      if(contractBtn) contractBtn.click();
      return;
    }
  }

  function showTermCard(termKey){
    var term = termDB[termKey];
    if(!term) return;

    var area = document.getElementById('ai-term-area');
    if(!area) return;

    // Format body with line breaks
    var bodyHTML = term.body.replace(/\\n/g, '<br>');

    area.innerHTML = '<div class="ai-term-card ai-term-expandable">'
      + '<div class="ai-term-header ai-term-toggle">'
      + '<span class="ai-term-title">' + term.title + '</span>'
      + '<div style="display:flex;gap:8px;align-items:center;">'
      + '<button class="ai-term-collapse-btn" title="收起/展开"><i class="fas fa-chevron-up ai-collapse-icon"></i></button>'
      + '<button class="ai-term-close" onclick="document.getElementById(\'ai-term-area\').innerHTML=\'\'">✕</button>'
      + '</div>'
      + '</div>'
      + '<div class="ai-term-body ai-term-collapsible">' + bodyHTML + '</div>'
      + '</div>';

    // Collapse/expand toggle
    var toggleBtn = area.querySelector('.ai-term-collapse-btn');
    if(toggleBtn){
      toggleBtn.addEventListener('click', function(e){
        e.stopPropagation();
        var card = area.querySelector('.ai-term-expandable');
        var body = area.querySelector('.ai-term-collapsible');
        var icon = area.querySelector('.ai-collapse-icon');
        if(card && body){
          var isCollapsed = body.classList.toggle('ai-collapsed');
          if(icon) icon.style.transform = isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)';
        }
      });
    }
    // Also allow header click to toggle
    var headerToggle = area.querySelector('.ai-term-toggle');
    if(headerToggle){
      headerToggle.style.cursor = 'pointer';
      headerToggle.addEventListener('click', function(e){
        if(e.target.closest('.ai-term-close')) return;
        if(toggleBtn) toggleBtn.click();
      });
    }

    // Scroll term into view
    area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ── Typewriter Effect ──
  function typewriterEffect(el, html, speed){
    speed = speed || 15;
    // Strip HTML tags for plain text, then re-inject with <br>
    var plainText = html.replace(/<br>/g, '\\n').replace(/<[^>]*>/g, '');
    var i = 0;
    el.textContent = '';
    el.style.minHeight = '40px';
    function type(){
      if(i < plainText.length){
        if(plainText[i] === '\\\\' && plainText[i+1] === 'n'){
          el.innerHTML += '<br>';
          i += 2;
        } else {
          el.innerHTML += plainText[i];
          i++;
        }
        setTimeout(type, speed);
      }
    }
    type();
  }

  function handleQuery(query){
    if(!query) return;

    var inputEl = document.getElementById('ai-input');
    if(inputEl) inputEl.value = '';

    // Show thinking indicator
    var area = document.getElementById('ai-answer-area');
    if(!area) return;
    area.innerHTML = '<div class="ai-answer-card"><div class="ai-answer-header"><span class="ai-thinking-dots">🔍 思考中<span class="ai-dot-anim">...</span></span></div><div class="ai-answer-body" id="ai-typing-target" style="min-height:40px;"></div></div>';

    // Search terms first
    var lowerQuery = query.toLowerCase();
    for(var key in termDB){
      if(lowerQuery.indexOf(key) !== -1 || termDB[key].title.toLowerCase().indexOf(lowerQuery) !== -1){
        area.innerHTML = ''; // Clear thinking
        showTermCard(key);
        return;
      }
    }

    // Search FAQ
    var bestMatch = null;
    var bestScore = 0;
    faqDB.forEach(function(faq){
      var score = 0;
      faq.keywords.forEach(function(kw){
        if(lowerQuery.indexOf(kw.toLowerCase()) !== -1) score += 2;
        // Partial match
        for(var ci=0; ci<kw.length-1; ci++){
          if(lowerQuery.indexOf(kw.substring(ci, ci+2).toLowerCase()) !== -1) score += 0.5;
        }
      });
      if(score > bestScore) { bestScore = score; bestMatch = faq; }
    });

    // Simulate a brief "thinking" delay for natural feel
    setTimeout(function(){
      if(bestMatch && bestScore >= 1.5){
        var answerText = bestMatch.answer;
        area.innerHTML = '<div class="ai-answer-card ai-answer-appear">'
          + '<div class="ai-answer-header">📎 回答</div>'
          + '<div class="ai-answer-body" id="ai-typing-target"></div>'
          + '</div>';
        var target = document.getElementById('ai-typing-target');
        if(target) typewriterEffect(target, answerText, 18);
      } else {
        area.innerHTML = '<div class="ai-answer-card ai-answer-appear">'
          + '<div class="ai-answer-header">🤔 没有找到精确匹配</div>'
          + '<div class="ai-answer-body">试试以下关键词：<br><br>'
          + '<span class="ai-term-link" data-term="rbf" style="cursor:pointer;color:#B91C1C;font-weight:500;">RBF</span> · '
          + '<span class="ai-term-link" data-term="share_ratio" style="cursor:pointer;color:#B91C1C;font-weight:500;">分成比例</span> · '
          + '<span class="ai-term-link" data-term="cap" style="cursor:pointer;color:#B91C1C;font-weight:500;">封顶倍数</span> · '
          + '<span class="ai-term-link" data-term="irr" style="cursor:pointer;color:#B91C1C;font-weight:500;">IRR</span> · '
          + '<span class="ai-term-link" data-term="recovery" style="cursor:pointer;color:#B91C1C;font-weight:500;">回收率</span> · '
          + '<span class="ai-term-link" data-term="duration" style="cursor:pointer;color:#B91C1C;font-weight:500;">期限</span> · '
          + '<span class="ai-term-link" data-term="exit" style="cursor:pointer;color:#B91C1C;font-weight:500;">退出条件</span> · '
          + '<span class="ai-term-link" data-term="referral" style="cursor:pointer;color:#B91C1C;font-weight:500;">老师引荐</span>'
          + '<br><br>或者换一个关键词重新搜索。</div>'
          + '</div>';
      }
      area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 400);
  }

  function refreshDynamicSuggestions(){
    var area = document.getElementById('ai-dynamic-area');
    if(!area) return;
    var dynamic = getDynamicSuggestions();
    if(dynamic.length === 0){ area.innerHTML = ''; return; }
    var html = '<div class="ai-section"><div class="ai-section-label"><i class="fas fa-lightbulb ai-section-icon" style="color:#D97706;"></i> 智能建议</div>';
    dynamic.forEach(function(s){
      html += '<button class="ai-shortcut-btn" data-action="' + s.action + '">'
        + '<span class="ai-shortcut-icon">' + s.icon + '</span>'
        + '<span class="ai-shortcut-text">' + s.text + '</span>'
        + '<i class="fas fa-chevron-right ai-shortcut-arrow"></i>'
        + '</button>';
    });
    html += '</div>';
    area.innerHTML = html;
    // Bind events for dynamic buttons
    area.querySelectorAll('.ai-shortcut-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        handleAction(btn.getAttribute('data-action'));
      });
    });
  }

  // ── First-time bounce animation ──
  var fabSeen = localStorage.getItem('zlc_ai_fab_seen_' + (u.id || ''));
  if(!fabSeen){
    fab.classList.add('ai-fab-bounce');
    setTimeout(function(){ fab.classList.remove('ai-fab-bounce'); }, 3000);
    localStorage.setItem('zlc_ai_fab_seen_' + (u.id || ''), 'true');
  }

  // ── Idle FAB subtle floating ──
  fab.classList.add('ai-fab-idle');
}
`}} />
)

/**
 * AIAssistantStyles — 注入 AI 助理的全部 CSS
 * 应在 <head> 的 <style> 块中包含
 */
export const aiAssistantCSS = `
/* ══════════════════════════════════════════════════
   AI Assistant — Floating Action Button
   ══════════════════════════════════════════════════ */
#ai-assistant-fab {
  position: fixed;
  bottom: 76px;
  right: 68px;
  z-index: 950;
  width: 48px; height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #B91C1C, #991B1B);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(185,28,28,0.35), 0 0 0 0 rgba(185,28,28,0);
  transition: transform 200ms ease, box-shadow 200ms ease, background 200ms ease;
}
#ai-assistant-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(185,28,28,0.45);
}
#ai-assistant-fab:active {
  transform: scale(0.95);
}
#ai-assistant-fab.ai-fab-active {
  background: linear-gradient(135deg, #991B1B, #7F1D1D);
  transform: rotate(45deg) scale(1.05);
}
#ai-assistant-fab.ai-fab-bounce {
  animation: aiFabBounce 2s ease-in-out infinite;
}
@keyframes aiFabBounce {
  0%, 100% { transform: translateY(0); box-shadow: 0 4px 16px rgba(185,28,28,0.35); }
  25% { transform: translateY(-8px); box-shadow: 0 8px 24px rgba(185,28,28,0.45); }
  50% { transform: translateY(0); }
  75% { transform: translateY(-4px); }
}
@media (min-width: 481px) {
  #ai-assistant-fab { right: calc(50% - 240px + 68px); }
}

/* ══════════════════════════════════════════════════
   AI Assistant — Panel Overlay
   ══════════════════════════════════════════════════ */
#ai-assistant-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1200;
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms ease;
  will-change: opacity;
}
#ai-assistant-overlay.show {
  opacity: 1;
  pointer-events: auto;
}

#ai-panel {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: #fff;
  border-radius: 24px 24px 0 0;
  max-height: 72vh;
  overflow-y: auto;
  padding: 0 0 env(safe-area-inset-bottom, 0) 0;
  transform: translateY(100%);
  transition: transform 300ms cubic-bezier(0.32, 0.72, 0, 1);
  will-change: transform;
}
#ai-assistant-overlay.show #ai-panel {
  transform: translateY(0);
}
@media (min-width: 481px) {
  #ai-panel {
    max-width: 480px;
    left: 50%; right: auto;
    transform: translateX(-50%) translateY(100%);
  }
  #ai-assistant-overlay.show #ai-panel {
    transform: translateX(-50%) translateY(0);
  }
}

/* ── Drag bar ── */
.ai-drag-bar {
  width: 40px; height: 4px; border-radius: 2px;
  background: #D6D3D1;
  margin: 12px auto 0;
}

/* ── Header ── */
.ai-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid #F5F5F4;
}
.ai-header-left {
  display: flex; align-items: center; gap: 12px;
}
.ai-header-avatar {
  width: 36px; height: 36px; border-radius: 12px;
  background: linear-gradient(135deg, #FEE2E2, #FECACA);
  display: flex; align-items: center; justify-content: center;
  color: #B91C1C; flex-shrink: 0;
}
.ai-header-title {
  font-size: 16px; font-weight: 700; color: #1C1917;
  font-family: 'Noto Sans SC', sans-serif;
}
.ai-header-sub {
  font-size: 12px; color: #78716C; margin-top: 2px;
}
.ai-close-btn {
  font-size: 16px; color: #A8A29E; background: none;
  border: none; cursor: pointer; padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.15s;
}
.ai-close-btn:hover { background: #F5F5F4; }

/* ── Sections ── */
.ai-section {
  padding: 16px 20px 0;
}
.ai-section-label {
  font-size: 11px; font-weight: 600; color: #A8A29E;
  text-transform: uppercase; letter-spacing: 0.5px;
  margin-bottom: 10px;
  display: flex; align-items: center; gap: 6px;
}
.ai-section-icon {
  font-size: 12px; color: #B91C1C;
}

/* ── Page Explain ── */
.ai-explain-text {
  font-size: 14px; line-height: 1.7; color: #44403C;
  background: #FAFAF9; border-radius: 12px;
  padding: 14px 16px;
  border-left: 3px solid #B91C1C;
}

/* ── Shortcut Buttons ── */
.ai-shortcuts-list {
  display: flex; flex-direction: column; gap: 6px;
}
.ai-shortcut-btn {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 12px 14px;
  background: #fff; border: 1px solid #F0EFED;
  border-radius: 12px; cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  text-align: left;
  font-family: inherit;
}
.ai-shortcut-btn:hover {
  background: #FAFAF9; border-color: #E7E5E4;
}
.ai-shortcut-btn:active {
  background: #F5F5F4;
}
.ai-shortcut-icon {
  font-size: 16px; flex-shrink: 0; width: 24px; text-align: center;
}
.ai-shortcut-text {
  font-size: 14px; color: #292524; flex: 1;
}
.ai-shortcut-arrow {
  font-size: 10px; color: #D6D3D1; flex-shrink: 0;
  transition: color 0.15s;
}
.ai-shortcut-btn:hover .ai-shortcut-arrow { color: #B91C1C; }

/* ── Tips Card ── */
.ai-tips-card {
  margin: 16px 20px 0;
  padding: 12px 14px;
  background: #FFFBEB; border: 1px solid #FDE68A;
  border-radius: 12px;
  display: flex; align-items: flex-start; gap: 8px;
}
.ai-tips-icon { flex-shrink: 0; font-size: 14px; }
.ai-tips-text {
  font-size: 13px; line-height: 1.6; color: #92400E;
}

/* ── Term Card ── */
.ai-term-card {
  margin: 16px 20px 0;
  background: #fff; border: 1px solid #E7E5E4;
  border-radius: 14px; overflow: hidden;
  animation: aiSlideIn 200ms ease-out;
}
@keyframes aiSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.ai-term-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #FEF2F2, #FFF1F2);
  border-bottom: 1px solid #FECACA;
}
.ai-term-title {
  font-size: 15px; font-weight: 700; color: #B91C1C;
}
.ai-term-close {
  font-size: 14px; color: #A8A29E; background: none;
  border: none; cursor: pointer; padding: 2px 6px;
  border-radius: 4px;
}
.ai-term-close:hover { background: rgba(0,0,0,0.05); }
.ai-term-body {
  padding: 14px 16px;
  font-size: 13px; line-height: 1.8; color: #44403C;
}

/* ── Answer Card ── */
.ai-answer-card {
  margin: 16px 20px 0;
  background: #fff; border: 1px solid #E7E5E4;
  border-radius: 14px; overflow: hidden;
  animation: aiSlideIn 200ms ease-out;
}
.ai-answer-header {
  padding: 12px 16px;
  font-size: 13px; font-weight: 600; color: #1C1917;
  background: #FAFAF9; border-bottom: 1px solid #F5F5F4;
}
.ai-answer-body {
  padding: 14px 16px;
  font-size: 13px; line-height: 1.8; color: #44403C;
}

/* ── Input Section ── */
.ai-input-section {
  position: sticky; bottom: 0;
  padding: 12px 20px 16px;
  background: #fff;
  border-top: 1px solid #F5F5F4;
  margin-top: 16px;
}
.ai-input-wrap {
  display: flex; align-items: center; gap: 8px;
  background: #F5F5F4; border-radius: 12px;
  padding: 4px 4px 4px 14px;
  border: 1px solid transparent;
  transition: border-color 0.2s;
}
.ai-input-wrap:focus-within {
  border-color: #B91C1C;
  background: #FAFAF9;
}
#ai-input {
  flex: 1; background: transparent; border: none;
  outline: none; font-size: 14px; color: #1C1917;
  padding: 10px 0; font-family: inherit;
}
#ai-input::placeholder { color: #A8A29E; }
#ai-send-btn {
  width: 36px; height: 36px; border-radius: 10px;
  background: #B91C1C; color: #fff;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0;
  transition: background 0.15s, transform 0.15s;
}
#ai-send-btn:hover { background: #991B1B; transform: scale(1.05); }
#ai-send-btn:active { transform: scale(0.95); }
.ai-input-hint {
  font-size: 11px; color: #A8A29E; margin-top: 6px; text-align: center;
}

/* ══ V25 AI Assistant Enhancements ══ */

/* Thinking dots animation */
.ai-dot-anim {
  display: inline-block;
  animation: dotPulse 1.2s ease-in-out infinite;
}
@keyframes dotPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* Answer card appear */
.ai-answer-appear {
  animation: aiAnswerIn 0.3s ease-out;
}
@keyframes aiAnswerIn {
  from { opacity: 0; transform: translateY(10px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Shortcut button stagger */
.ai-shortcuts-list .ai-shortcut-btn {
  opacity: 0; animation: aiShortcutIn 0.3s ease-out forwards;
}
.ai-shortcuts-list .ai-shortcut-btn:nth-child(1) { animation-delay: 0.05s; }
.ai-shortcuts-list .ai-shortcut-btn:nth-child(2) { animation-delay: 0.1s; }
.ai-shortcuts-list .ai-shortcut-btn:nth-child(3) { animation-delay: 0.15s; }
.ai-shortcuts-list .ai-shortcut-btn:nth-child(4) { animation-delay: 0.2s; }
@keyframes aiShortcutIn {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Input box breathing glow */
.ai-input-wrap:focus-within {
  box-shadow: 0 0 0 3px rgba(185,28,28,0.08), 0 0 16px rgba(185,28,28,0.06);
  animation: aiInputGlow 2s ease-in-out infinite;
}
@keyframes aiInputGlow {
  0%, 100% { box-shadow: 0 0 0 3px rgba(185,28,28,0.08), 0 0 16px rgba(185,28,28,0.06); }
  50% { box-shadow: 0 0 0 4px rgba(185,28,28,0.12), 0 0 20px rgba(185,28,28,0.08); }
}

/* Send button micro-rotation on hover */
#ai-send-btn:hover i {
  transform: rotate(-25deg);
  transition: transform 0.2s ease;
}

/* FAB floating animation upgrade */
#ai-assistant-fab {
  box-shadow: 0 4px 16px rgba(185,28,28,0.35), 0 0 0 0 rgba(185,28,28,0);
  transition: transform 200ms ease, box-shadow 200ms ease, background 200ms ease;
}
#ai-assistant-fab::before {
  content: ''; position: absolute; inset: -4px;
  border-radius: 50%; border: 2px solid rgba(185,28,28,0.2);
  opacity: 0; transition: opacity 0.3s;
}
#ai-assistant-fab:hover::before {
  opacity: 1; animation: fabRingPulse 1.5s ease-in-out infinite;
}
@keyframes fabRingPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.15); opacity: 0; }
}

/* Panel slide-up enhancement */
#ai-panel {
  transition: transform 350ms cubic-bezier(0.32, 0.72, 0, 1);
}

/* Term card open animation enhanced */
.ai-term-card {
  animation: aiTermCardIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes aiTermCardIn {
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Tips card subtle bounce */
.ai-tips-card {
  animation: aiTipsBounce 0.4s ease-out;
}
@keyframes aiTipsBounce {
  0% { opacity: 0; transform: translateY(8px); }
  70% { transform: translateY(-2px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* ══ V25.1 AI Assistant — Collapsible Term Cards ══ */
.ai-term-collapsible {
  max-height: 400px;
  overflow: hidden;
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              padding 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.25s ease;
}
.ai-term-collapsible.ai-collapsed {
  max-height: 0;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  opacity: 0.5;
}
.ai-collapse-icon {
  font-size: 11px; color: #A8A29E;
  transition: transform 0.3s ease;
}
.ai-term-collapse-btn {
  background: none; border: none; cursor: pointer;
  padding: 2px 6px; border-radius: 4px;
  transition: background 0.15s;
}
.ai-term-collapse-btn:hover {
  background: rgba(0,0,0,0.05);
}

/* ══ V25.1 AI — FAB Idle Float ══ */
#ai-assistant-fab.ai-fab-idle {
  animation: aiFabIdle 4s ease-in-out infinite;
}
@keyframes aiFabIdle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
#ai-assistant-fab.ai-fab-idle:hover {
  animation: none;
}

/* ══ V25.1 AI — Dynamic Suggestion Enter ══ */
#ai-dynamic-area .ai-shortcut-btn {
  opacity: 0;
  animation: aiDynamicBtnIn 0.4s ease-out forwards;
}
#ai-dynamic-area .ai-shortcut-btn:nth-child(1) { animation-delay: 0.15s; }
#ai-dynamic-area .ai-shortcut-btn:nth-child(2) { animation-delay: 0.25s; }
#ai-dynamic-area .ai-shortcut-btn:nth-child(3) { animation-delay: 0.35s; }
@keyframes aiDynamicBtnIn {
  from { opacity: 0; transform: translateX(-12px) scale(0.95); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}

/* ══ V25.1 AI — Panel header glow ══ */
.ai-header-avatar {
  position: relative;
  overflow: visible;
}
.ai-header-avatar::after {
  content: ''; position: absolute; inset: -3px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(185,28,28,0.15), rgba(212,168,83,0.15));
  opacity: 0;
  transition: opacity 0.3s;
  z-index: -1;
}
#ai-assistant-overlay.show .ai-header-avatar::after {
  opacity: 1;
  animation: aiAvatarGlow 3s ease-in-out infinite;
}
@keyframes aiAvatarGlow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

/* ══ V25.1 AI — Page explain fade-in ══ */
.ai-explain-text {
  animation: aiExplainIn 0.4s ease-out 0.1s both;
}
@keyframes aiExplainIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
`
