// Route: /projects/:id
import { Hono } from 'hono'
import {
  mockMembers, mockProjects, mockContracts, mockTeachers, isSameClass, calculateRBF,
} from '../data'
import type { Member, Teacher, Project, Contract, Referral } from '../data'
import {
  GlobalScripts, Navbar, AuthCheckScript, StatusBadge, statusLabel,
} from '../components'

export function registerProjectDetailRoute(app: Hono) {
app.get('/projects/:id', (c) => {
  const id = c.req.param('id')
  const proj = mockProjects.find(p => p.id === id)

  // If project not found in mock data, serve a client-side lookup page
  if (!proj) {
    return c.render(
      <div class="app-container">
        <AuthCheckScript />
        <GlobalScripts />
        <Navbar />
        <main class="max-w-lg mx-auto px-4 pt-3 pb-8">
          <a href="/projects" class="back-link mb-4 inline-flex">
            <i class="fas fa-arrow-left" style="font-size:13px;" /> 返回项目大厅
          </a>
          <div id="dynamic-project-content" class="text-center py-12">
            <div class="spinner" style="border-color:rgba(185,28,28,0.2);border-top-color:#B91C1C;width:32px;height:32px;" />
            <p class="text-text-secondary mt-3" style="font-size:14px;">加载项目中...</p>
          </div>
        </main>
        <div id="toast" class="toast" />
        <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;
  var projectId = '${id}';
  var userProjects = [];
  try { userProjects = JSON.parse(localStorage.getItem('zlc_user_projects') || '[]'); } catch(e){}
  var proj = userProjects.find(function(p){ return p.id === projectId; });
  var el = document.getElementById('dynamic-project-content');
  if(!proj){
    el.innerHTML = '<div style="padding:40px 0;text-align:center;"><div style="width:56px;height:56px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class="fas fa-circle-xmark" style="font-size:24px;color:#DC2626;"></i></div><p style="font-size:16px;font-weight:600;color:#292524;">项目未找到</p><p style="font-size:14px;color:#78716C;margin-top:4px;">该项目不存在或已被删除</p></div>';
    return;
  }
  // Render project detail
  var pct = proj.targetAmount > 0 ? Math.round(proj.raisedAmount / proj.targetAmount * 100) : 0;
  var cap = proj.targetAmount * proj.recoveryMultiple;
  var monthly = proj.estimatedMonthlyRevenue * (proj.revenueShareRate / 100);
  var payback = monthly > 0 ? Math.ceil(proj.targetAmount / monthly) : 0;
  var remainShares = proj.totalShares - proj.raisedShares;
  var statusLabel = {open:'募集中',funded:'已满额',active:'运营中',completed:'已完成',draft:'草稿'}[proj.status]||proj.status;

  var html = '<div class="bg-white rounded-2xl shadow-card p-5 mb-4">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">';
  html += '<span style="background:#FEE2E2;color:#B91C1C;padding:2px 10px;border-radius:6px;font-size:12px;font-weight:600;">' + proj.industry + '</span>';
  html += '<span class="badge badge-' + proj.status + '">' + statusLabel + '</span></div>';
  html += '<h1 style="font-size:22px;font-weight:700;color:#292524;margin-bottom:12px;font-family:\\'Noto Sans SC\\',sans-serif;">' + proj.name + '</h1>';
  html += '<div style="display:flex;align-items:center;gap:10px;padding:12px;background:#FAFAF9;border-radius:12px;margin-bottom:12px;">';
  html += '<div style="width:40px;height:40px;border-radius:50%;background:#B91C1C;color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;">' + (u.name||'?').charAt(0) + '</div>';
  html += '<div><div style="font-size:14px;font-weight:600;color:#1C1917;">' + u.name + ' · ' + (u.title||'') + '</div>';
  html += '<div style="font-size:12px;color:#78716C;">' + (u.company||'') + ' · ' + (u.cohort||'') + '</div></div></div>';
  html += '<p style="font-size:15px;line-height:1.7;color:#292524;">' + proj.description + '</p>';
  if(proj.detail){ html += '<p style="font-size:13px;line-height:1.7;color:#78716C;margin-top:8px;">' + proj.detail + '</p>'; }
  html += '</div>';

  // Terms
  html += '<div class="terms-card shadow-card mb-4"><div style="padding:12px 20px;border-bottom:1px solid #F5F5F4;"><h3 style="font-size:16px;font-weight:600;color:#292524;"><i class="fas fa-file-contract" style="color:#B91C1C;margin-right:8px;font-size:14px;"></i>收入分成条款</h3></div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;">';
  var terms = [["融资总额","¥"+proj.targetAmount+"万"],["分成比例",proj.revenueShareRate+"%"],["联营期限",proj.duration+"月"],["回收倍数",proj.recoveryMultiple+"x"],["回收上限","¥"+cap.toFixed(1)+"万"],["预估月收入","¥"+proj.estimatedMonthlyRevenue+"万"]];
  terms.forEach(function(t,i){ html += "<div style=\\"padding:14px 20px;border-bottom:1px solid #F5F5F4;"+(i%2===0?"border-right:1px solid #F5F5F4;":"")+"\\"><div style=\\"font-size:12px;color:#78716C;margin-bottom:4px;\\">"+t[0]+"</div><div style=\\"font-size:18px;font-weight:700;color:#1C1917;\\">"+t[1]+"</div></div>"; });
  html += '</div><div style="background:#FEF2F2;padding:16px 20px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
  html += '<div><div style="font-size:12px;color:#78716C;">预估月回款</div><div style="font-size:18px;font-weight:700;color:#B91C1C;">¥'+monthly.toFixed(1)+'万</div></div>';
  html += '<div><div style="font-size:12px;color:#78716C;">预估回收期</div><div style="font-size:18px;font-weight:700;color:#B91C1C;">约'+payback+'月</div></div>';
  html += '</div></div>';

  // Progress
  html += '<div class="bg-white rounded-2xl shadow-card p-5 mb-4">';
  html += '<h3 style="font-size:16px;font-weight:600;color:#292524;margin-bottom:12px;"><i class="fas fa-chart-pie" style="color:#D4A853;margin-right:8px;font-size:14px;"></i>募集进度</h3>';
  html += '<div style="height:12px;border-radius:99px;background:#F5F5F4;overflow:hidden;margin-bottom:12px;"><div style="height:100%;border-radius:99px;background:linear-gradient(90deg,#D4A853,#B8860B);width:'+pct+'%;"></div></div>';
  html += '<div style="font-size:16px;font-weight:600;color:#292524;">已募 ¥'+proj.raisedAmount+'万 / ¥'+proj.targetAmount+'万 <span style="color:#B8860B;">('+pct+'%)</span></div>';
  html += '<div style="font-size:13px;color:#78716C;margin-top:4px;">总 '+proj.totalShares+' 份 · 剩余 '+remainShares+' 份</div></div>';
  html += '<p style="text-align:center;font-size:13px;color:#78716C;margin-top:16px;">发布于 '+proj.createdAt+'</p>';

  el.innerHTML = html;
})();
`}} />
      </div>,
      { title: '中流通 - 项目详情' }
    )
  }

  const owner = mockMembers.find(m => m.id === proj.ownerId)!
  const rbf = calculateRBF(proj.targetAmount, proj.revenueShareRate, proj.estimatedMonthlyRevenue, proj.recoveryMultiple)
  const pct = Math.round((proj.raisedAmount / proj.targetAmount) * 100)
  const remainShares = proj.totalShares - proj.raisedShares
  const investorMembers = proj.investors.map(iid => mockMembers.find(m => m.id === iid)).filter(Boolean) as Member[]
  const bgColors = ['#B91C1C','#D4A853','#991B1B','#B8860B','#7F1D1D']

  return c.render(
    <div class="app-container">
      <AuthCheckScript />
      <GlobalScripts />
      <Navbar />

      <main class="px-4 pt-3 pb-8 max-w-lg mx-auto page-enter">
        {/* Back link */}
        <a href="/projects" class="back-link mb-4 inline-flex">
          <i class="fas fa-arrow-left" style="font-size:13px;" /> 返回项目大厅
        </a>

        {/* From share banner — shown via JS if ?from=share */}
        <div id="share-from-banner" style="display:none;background:#EFF6FF;color:#2563EB;border-radius:8px;padding:8px 12px;font-size:12px;margin-bottom:12px;font-weight:500;">
          🔗 通过分享码查看
        </div>

        {/* Relation Tag — rendered via client JS based on current user's classId */}
        <div id="detail-relation-tag" style="display:none;margin-bottom:12px;" />

        {/* 1. Project Header Card */}
        <div class="bg-white rounded-2xl shadow-card p-5 mb-4">
          <div class="flex items-center justify-between mb-3">
            <span class="bg-brand-soft text-brand px-2.5 py-0.5 rounded font-semibold" style="font-size:11px;">{proj.industry}</span>
            <StatusBadge status={proj.status} />
          </div>
          <h1 class="font-bold text-text-title mb-1" style="font-size:24px;font-family:'Noto Sans SC',sans-serif;line-height:1.3;">{proj.name}</h1>
          {/* 推介语 */}
          {proj.highlightText && (
            <div style="font-size:14px;color:#B91C1C;font-style:italic;margin-top:6px;line-height:1.5;">{proj.highlightText}</div>
          )}
          {/* View / Participant Count (Task 3) */}
          <div id="detail-view-count" style="font-size:12px;color:#A8A29E;margin-top:4px;margin-bottom:12px;" />

          {/* Owner */}
          <div class="flex items-start gap-3 mb-4 p-3 rounded-xl" style="background:#FAFAF9;">
            <div class="flex items-center justify-center rounded-full bg-brand text-white font-bold flex-shrink-0" style="width:44px;height:44px;font-size:18px;">
              {owner.name.charAt(0)}
            </div>
            <div>
              <div class="font-semibold text-text-title" style="font-size:15px;">{owner.name} <span class="text-text-tertiary font-normal" style="font-size:13px;">· {owner.title}</span></div>
              <div class="text-text-secondary" style="font-size:13px;">{owner.company} · {owner.cohort}</div>
              <div class="text-text-tertiary mt-1" style="font-size:12px;">{owner.bio}</div>
            </div>
          </div>

          <p class="text-text-title" style="font-size:15px;line-height:1.7;">{proj.description}</p>
        </div>

        {/* 2. RBF Terms Card */}
        <div class="terms-card shadow-card mb-3">
          <div class="px-5 py-4" style="border-bottom:1px solid #F5F5F4;">
            <h3 class="font-semibold text-text-title" style="font-size:16px;">
              <i class="fas fa-file-contract text-brand mr-2" style="font-size:14px;" />
              收入分成条款
            </h3>
          </div>
          <div class="terms-grid">
            <div class="terms-cell">
              <div class="flex items-center gap-1">
                <span class="terms-label" style="margin-bottom:0;">融资总额</span>
                <span class="help-icon" data-help-id="totalAmount">?</span>
              </div>
              <div class="help-text">这个项目总共需要多少资金。所有参与人的投资加起来等于这个数。</div>
              <div class="terms-value">¥{proj.targetAmount}<span class="text-text-tertiary" style="font-size:13px;font-weight:400;">万</span></div>
            </div>
            <div class="terms-cell">
              <div class="flex items-center gap-1">
                <span class="terms-label" style="margin-bottom:0;">分成比例</span>
                <span class="help-icon" data-help-id="revenueShareRatio">?</span>
              </div>
              <div class="help-text">发起人愿意把项目月收入的多少拿出来分给参与人。比例越高，参与人回款越快，但发起人让出的越多。同类项目一般在8%-20%。</div>
              <div class="terms-value">{proj.revenueShareRate}<span class="text-text-tertiary" style="font-size:13px;font-weight:400;">%</span></div>
            </div>
            <div class="terms-cell">
              <div class="flex items-center gap-1">
                <span class="terms-label" style="margin-bottom:0;">联营期限</span>
                <span class="help-icon" data-help-id="cooperationTerm">?</span>
              </div>
              <div class="help-text">合作持续多长时间。到期后无论是否收回投资，合同自动结束。</div>
              <div class="terms-value">{proj.duration}<span class="text-text-tertiary" style="font-size:13px;font-weight:400;">月</span></div>
            </div>
            <div class="terms-cell">
              <div class="flex items-center gap-1">
                <span class="terms-label" style="margin-bottom:0;">回收倍数</span>
                <span class="help-icon" data-help-id="recoveryMultiple">?</span>
              </div>
              <div class="help-text">参与人最多能拿回投资额的多少倍。1.5倍意味着投10万最多拿回15万。达到上限后合同自动结束。</div>
              <div class="terms-value">{proj.recoveryMultiple}<span class="text-text-tertiary" style="font-size:13px;font-weight:400;">x</span></div>
            </div>
            <div class="terms-cell">
              <div class="flex items-center gap-1">
                <span class="terms-label" style="margin-bottom:0;">回收上限</span>
                <span class="help-icon" data-help-id="recoveryCap">?</span>
              </div>
              <div class="help-text">你最多能拿回的总金额 = 投资额 × 回收倍数。</div>
              <div class="terms-value">¥{rbf.recoveryCap}<span class="text-text-tertiary" style="font-size:13px;font-weight:400;">万</span></div>
            </div>
            <div class="terms-cell">
              <div class="flex items-center gap-1">
                <span class="terms-label" style="margin-bottom:0;">预估月收入</span>
                <span class="help-icon" data-help-id="estimatedMonthlyRevenue">?</span>
              </div>
              <div class="help-text">发起人对项目月度收入的预估。这只是预估，实际回款取决于真实经营情况。</div>
              <div class="terms-value">¥{proj.estimatedMonthlyRevenue}<span class="text-text-tertiary" style="font-size:13px;font-weight:400;">万</span></div>
            </div>
          </div>
          <div class="calc-highlight">
            <div>
              <div class="terms-label">预估月回款</div>
              <div class="font-bold text-brand" style="font-size:18px;">¥{rbf.monthlyShare.toFixed(1)}万</div>
            </div>
            <div>
              <div class="terms-label">预估回收期</div>
              <div class="font-bold text-brand" style="font-size:18px;">约{rbf.paybackMonths}月</div>
            </div>
          </div>
        </div>

        {/* 2.5 项目亮点 — 仅当 highlights 存在时显示 */}
        {proj.highlights && proj.highlights.length > 0 && (
          <div style="margin:12px 0px;padding:16px 20px;background:#fff;border-radius:14px;border-left:3px solid #D4A853;" class="shadow-card">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-size:14px;font-weight:600;color:#1C1917;">项目亮点</span>
              <span style="font-size:14px;">⭐</span>
            </div>
            <div style="margin-top:10px;">
              {proj.highlights.map((h: string) => (
                <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;">
                  <span style="width:6px;height:6px;background:#D4A853;border-radius:50%;flex-shrink:0;margin-top:6px;" />
                  <span style="font-size:14px;color:#44403C;line-height:1.6;">{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2.5a 发起人说 — 仅当 initiatorNote 非空时显示 (Task 4) */}
        {proj.initiatorNote && proj.initiatorNote.trim() && (
          <div class="initiator-note">
            <div class="initiator-note-header">
              <div class="initiator-note-avatar">{owner.name.charAt(0)}</div>
              <span class="initiator-note-name">{owner.name}</span>
              <span class="initiator-note-tag">发起人</span>
            </div>
            <div class="initiator-note-body">
              <span class="initiator-note-quote">"</span>
              <span class="initiator-note-text">{proj.initiatorNote}</span>
            </div>
          </div>
        )}

        {/* 2.5b Plain Language Block */}
        <div class="plain-lang-block mb-4" id="plain-lang-detail" />

        {/* 3. Fundraising Progress */}
        <div class="bg-white rounded-2xl shadow-card p-5 mb-4">
          <h3 class="font-semibold text-text-title mb-3" style="font-size:16px;">
            <i class="fas fa-chart-pie text-gold mr-2" style="font-size:14px;" />
            募集进度
          </h3>
          <div class="progress-bar-lg mb-3">
            <div class="progress-fill" data-width={`${pct}%`} />
          </div>
          <div class="font-semibold text-text-title mb-1" style="font-size:16px;">
            已募 ¥{proj.raisedAmount}万 / ¥{proj.targetAmount}万 <span class="text-gold-dark">({pct}%)</span>
          </div>
          <div class="text-text-secondary" style="font-size:13px;">
            已参与 {proj.investors.length} 位同学 · {remainShares > 0 ? `剩余 ${remainShares} 份` : '已满额'}
          </div>
        </div>

        {/* 4. Participate Calculator (open only, not owner) */}
        {proj.status === 'open' && remainShares > 0 && (
          <div id="participate-calculator" class="calc-card shadow-card p-5 mb-4">
            <h3 class="font-semibold text-text-title mb-4" style="font-size:16px;">
              <i class="fas fa-calculator text-gold mr-2" style="font-size:14px;" />
              我要参与
            </h3>
            <div class="flex items-center gap-3 mb-4">
              <select id="share-select" class="share-select">
                {Array.from({ length: Math.min(remainShares, 10) }, (_, i) => i + 1).map(n => (
                  <option value={String(n)}>{n} 份</option>
                ))}
              </select>
              <span class="text-text-tertiary" style="font-size:15px;">=</span>
              <span id="share-amount" class="font-bold text-text-title" style="font-size:22px;">¥{proj.sharePrice}万</span>
            </div>
            <div class="grid grid-cols-3 gap-3 mb-3 p-3 rounded-xl" style="background:#FAFAF9;">
              <div class="text-center">
                <div class="text-text-tertiary" style="font-size:11px;">月回款预估</div>
                <div id="calc-monthly" class="font-bold text-text-title" style="font-size:15px;">—</div>
              </div>
              <div class="text-center">
                <div class="text-text-tertiary" style="font-size:11px;">回收上限</div>
                <div id="calc-cap" class="font-bold text-text-title" style="font-size:15px;">—</div>
              </div>
              <div class="text-center">
                <div class="text-text-tertiary" style="font-size:11px;">预估回收期</div>
                <div id="calc-months" class="font-bold text-text-title" style="font-size:15px;">—</div>
              </div>
            </div>
            {/* Calculator plain-language hint */}
            <div id="calc-plain-hint" style="font-size:12px;line-height:1.6;color:#78716C;margin-bottom:16px;" />
            <button id="participate-btn" class="btn-gold" style="font-size:16px;">
              确认参与 ¥{proj.sharePrice}万
            </button>
            <p id="owner-hint" class="text-center text-text-tertiary mt-3" style="font-size:12px;display:none;">
              您是项目发起人，无法参与自己的项目
            </p>
          </div>
        )}

        {/* 5. Investors */}
        <div class="bg-white rounded-2xl shadow-card p-5 mb-4">
          <h3 class="font-semibold text-text-title mb-3" style="font-size:16px;">
            <i class="fas fa-users text-brand-dark mr-2" style="font-size:14px;" />
            已参与学员
          </h3>
          <div class="avatar-stack mb-2">
            {investorMembers.slice(0, 6).map((m, i) => (
              <div class="av-circle" style={`background:${bgColors[i % bgColors.length]};`}>{m.name.charAt(0)}</div>
            ))}
            {investorMembers.length > 6 && (
              <div class="av-circle" style="background:#78716C;">+{investorMembers.length - 6}</div>
            )}
          </div>
          <p class="text-text-secondary" style="font-size:13px;">共 {investorMembers.length} 位同学参与</p>
        </div>

        {/* 6. Share / Referral Buttons */}
        <div style="margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div style="flex:1;height:1px;background:#D6D3D1;" />
            <span style="font-size:12px;color:#A8A29E;white-space:nowrap;">或者</span>
            <div style="flex:1;height:1px;background:#D6D3D1;" />
          </div>
          <div style="display:flex;gap:12px;">
            <button id="btn-referral" style="flex:1;height:44px;background:#fff;border:1.5px solid #B91C1C;border-radius:12px;color:#B91C1C;font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:background 0.2s;">
              <i class="fas fa-user-tie" style="font-size:13px;" /> 请老师引荐
            </button>
            <button id="btn-share-project" style="flex:1;height:44px;background:#fff;border:1.5px solid #78716C;border-radius:12px;color:#78716C;font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:background 0.2s;">
              <i class="fas fa-share-alt" style="font-size:13px;" /> 分享项目
            </button>
          </div>
          {/* Referral status line — rendered via client JS */}
          <div id="referral-status-line" style="display:none;margin-top:10px;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:500;" />
        </div>
      </main>

      {/* Share Sheet Overlay (Task 1 — Premium Share Card) */}
      <div id="share-overlay" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;">
        <div id="share-panel" style="position:absolute;bottom:0;left:0;right:0;background:#fff;border-radius:24px 24px 0 0;padding:24px;transform:translateY(100%);transition:transform 300ms ease-out;max-height:85vh;overflow-y:auto;">
          {/* Drag indicator */}
          <div style="width:40px;height:4px;border-radius:2px;background:#D6D3D1;margin:0 auto 20px;" />

          {/* Premium Share Card Preview — 高端邀请函风格 */}
          <div id="share-card-preview" style="width:100%;max-width:320px;margin:0 auto;border-radius:20px;overflow:hidden;background:linear-gradient(160deg,#7F1D1D 0%,#B91C1C 35%,#991B1B 65%,#7F1D1D 100%);box-shadow:0 8px 32px rgba(185,28,28,0.3);">
            {/* A. 品牌头部 */}
            <div style="padding:20px 24px 16px;">
              <div style="width:40px;height:2px;background:linear-gradient(90deg,#D4A853,#F5DEB3);margin-bottom:12px;" />
              <div style="font-size:12px;color:#D4A853;letter-spacing:3px;">中流通 · 项目推介</div>
            </div>
            {/* B. 项目名称区 */}
            <div style="padding:0 24px;">
              <div style="font-size:24px;font-weight:800;color:#fff;line-height:1.3;">{proj.name}</div>
              {proj.highlightText && (
                <div style="margin-top:8px;font-size:14px;color:rgba(212,168,83,0.9);font-style:italic;line-height:1.5;">{proj.highlightText}</div>
              )}
            </div>
            {/* C. 发起人信息 */}
            <div style="padding:12px 24px 0;">
              <div style="font-size:13px;color:rgba(255,255,255,0.5);">发起人 {owner.name} · {owner.className || owner.cohort}</div>
            </div>
            {/* D. 核心数据区 */}
            <div style="margin:20px 24px;padding:20px;background:rgba(255,255,255,0.12);border-radius:14px;border:1px solid rgba(255,255,255,0.15);">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div style="text-align:center;"><div style="font-size:22px;font-weight:800;color:#fff;">¥{proj.targetAmount}万</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;letter-spacing:1px;">融资规模</div></div>
                <div style="text-align:center;"><div style="font-size:22px;font-weight:800;color:#fff;">{proj.revenueShareRate}%</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;letter-spacing:1px;">收入分成</div></div>
                <div style="text-align:center;"><div style="font-size:22px;font-weight:800;color:#fff;">{proj.duration}个月</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;letter-spacing:1px;">联营期限</div></div>
                <div style="text-align:center;"><div style="font-size:22px;font-weight:800;color:#fff;">≈¥{(proj.estimatedMonthlyRevenue * proj.revenueShareRate / 100).toFixed(1)}万</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;letter-spacing:1px;">预估月回款</div></div>
              </div>
            </div>
            {/* E. 项目亮点区 */}
            {proj.highlights && proj.highlights.length > 0 && (
              <div style="padding:0 24px;margin-top:4px;">
                {proj.highlights.map((h: string) => (
                  <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;">
                    <span style="color:#D4A853;font-size:13px;flex-shrink:0;line-height:1.5;">◆</span>
                    <span style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.5;">{h}</span>
                  </div>
                ))}
              </div>
            )}
            {/* F. 分享码区域 */}
            <div style="padding:24px;text-align:center;">
              <div style="border:1px dashed rgba(212,168,83,0.4);border-radius:12px;padding:16px;margin:0 24px;">
                <div style="font-size:32px;font-weight:800;letter-spacing:8px;color:#D4A853;font-family:monospace;">{proj.shareCode || '------'}</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:8px;">输入分享码 或 扫码查看</div>
                <div style="margin:10px auto 0;width:80px;height:80px;background:rgba(255,255,255,0.12);border-radius:8px;display:flex;align-items:center;justify-content:center;">
                  <span style="font-size:14px;color:rgba(255,255,255,0.2);">QR</span>
                </div>
              </div>
            </div>
            {/* G. 底部 */}
            <div style="padding:12px 24px 20px;text-align:center;">
              <div style="width:40px;height:1px;background:rgba(212,168,83,0.3);margin:0 auto 8px;" />
              <div style="font-size:10px;color:rgba(255,255,255,0.35);letter-spacing:2px;">一亿中流 · 私董会项目投资平台</div>
            </div>
          </div>

          {/* Action Buttons 2x2 Grid */}
          <div style="margin-top:20px;padding:0 8px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <button id="btn-copy-code" style="background:#FAFAF9;border:1px solid #E7E5E4;border-radius:12px;padding:14px;text-align:center;font-size:14px;color:#44403C;cursor:pointer;transition:background 0.2s;">复制分享码</button>
            <button id="btn-copy-link" style="background:#FAFAF9;border:1px solid #E7E5E4;border-radius:12px;padding:14px;text-align:center;font-size:14px;color:#44403C;cursor:pointer;transition:background 0.2s;">复制链接</button>
            <button id="btn-copy-text" style="background:linear-gradient(135deg,#B91C1C,#991B1B);border:none;border-radius:12px;padding:14px;text-align:center;font-size:14px;color:#fff;cursor:pointer;transition:opacity 0.2s;">复制文字版</button>
            <button id="btn-save-card" style="background:#FAFAF9;border:1px solid #E7E5E4;border-radius:12px;padding:14px;text-align:center;font-size:14px;color:#44403C;cursor:pointer;transition:background 0.2s;">保存卡片</button>
          </div>
        </div>
      </div>

      {/* Referral Modal Overlay */}
      <div id="referral-overlay" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.45);z-index:1100;align-items:center;justify-content:center;">
        <div id="referral-modal" style="background:#fff;border-radius:16px;width:92%;max-width:400px;margin:auto;padding:0;overflow:hidden;transform:scale(0.95);opacity:0;transition:transform 250ms ease-out,opacity 250ms ease-out;">
          {/* Header */}
          <div style="background:linear-gradient(135deg,#B91C1C 0%,#991B1B 100%);padding:20px 24px;color:#fff;">
            <div style="font-size:17px;font-weight:600;margin-bottom:4px;">请老师引荐</div>
            <div style="font-size:12px;opacity:0.85;">请您的班主任老师帮忙引荐对接项目发起人</div>
          </div>
          <div style="padding:20px 24px;">
            {/* Teacher info */}
            <div id="ref-teacher-info" style="display:flex;align-items:center;gap:12px;padding:12px;background:#FAFAF9;border-radius:12px;margin-bottom:16px;">
              <div style="width:44px;height:44px;border-radius:50%;background:#B91C1C;color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;">
                <i class="fas fa-user-tie" />
              </div>
              <div>
                <div id="ref-teacher-name" style="font-size:15px;font-weight:600;color:#1C1917;">老师</div>
                <div style="font-size:12px;color:#78716C;">将帮你对接 <span id="ref-initiator-name" style="font-weight:600;">{owner.name}</span></div>
              </div>
            </div>
            {/* Project info mini */}
            <div style="padding:10px 12px;background:#FEF2F2;border-radius:8px;margin-bottom:16px;">
              <div style="font-size:13px;font-weight:600;color:#1C1917;margin-bottom:2px;">{proj.name}</div>
              <div style="font-size:11px;color:#78716C;">¥{proj.targetAmount}万 · {proj.revenueShareRate}% 分成 · {proj.duration}月</div>
            </div>
            {/* Message textarea */}
            <div style="margin-bottom:16px;">
              <label style="font-size:13px;font-weight:500;color:#57534E;display:block;margin-bottom:6px;">留言（选填）</label>
              <textarea id="ref-message" placeholder="可以写上你对项目的关注点，方便老师引荐..." style="width:100%;height:72px;border:1px solid #D6D3D1;border-radius:10px;padding:10px 12px;font-size:13px;resize:none;outline:none;font-family:inherit;transition:border-color 0.2s;" onfocus="this.style.borderColor='#B91C1C'" onblur="this.style.borderColor='#D6D3D1'" />
            </div>
            {/* Buttons */}
            <div style="display:flex;gap:12px;">
              <button id="ref-cancel-btn" style="flex:1;height:44px;background:#F5F5F4;border:none;border-radius:12px;color:#78716C;font-weight:600;font-size:14px;cursor:pointer;">取消</button>
              <button id="ref-submit-btn" style="flex:1;height:44px;background:#B91C1C;border:none;border-radius:12px;color:#fff;font-weight:600;font-size:14px;cursor:pointer;">提交引荐请求</button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div id="toast" class="toast" />

      {/* Client script */}
      <script dangerouslySetInnerHTML={{ __html: `
window.__ZLC_TEACHERS__ = ${JSON.stringify(mockTeachers.map(t => ({ id:t.id, name:t.name, phone:t.phone, classIds:t.classIds })))};
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  var PROJ = ${JSON.stringify({
    id: proj.id, name: proj.name, ownerId: proj.ownerId, status: proj.status,
    sharePrice: proj.sharePrice, totalShares: proj.totalShares, raisedShares: proj.raisedShares,
    targetAmount: proj.targetAmount, raisedAmount: proj.raisedAmount,
    revenueShareRate: proj.revenueShareRate, estimatedMonthlyRevenue: proj.estimatedMonthlyRevenue,
    recoveryMultiple: proj.recoveryMultiple, duration: proj.duration,
    industry: proj.industry, description: proj.description,
    shareCode: proj.shareCode || '',
    initiatorClassId: proj.initiatorClassId || '',
    initiatorClassName: proj.initiatorClassName || '',
    recommendedByTeacher: proj.recommendedByTeacher || [],
    viewCount: proj.viewCount || 0,
    highlightText: proj.highlightText || '',
    highlights: proj.highlights || [],
  })};
  var OWNER = ${JSON.stringify({ name: owner.name, className: owner.className || owner.cohort || '' })};
  var MOCK_CONTRACTS_FOR_COUNT = ${JSON.stringify(mockContracts.filter(c => c.projectId === proj.id && c.status === 'active').length)};
  var MEMBERS = ${JSON.stringify(mockMembers.map(m => ({ id:m.id, name:m.name, classId:m.classId||'' })))};
  var TEACHERS = ${JSON.stringify(mockTeachers.map(t => ({ id:t.id, name:t.name, classIds:t.classIds })))};

  // Show from=share banner
  if(window.location.search.indexOf('from=share') !== -1){
    var banner = document.getElementById('share-from-banner');
    if(banner) banner.style.display = 'block';
  }

  // ── Task 3: viewCount increment + display ──
  (function(){
    // Read stored view counts from localStorage
    var viewCounts = {};
    try { viewCounts = JSON.parse(localStorage.getItem('zlc_view_counts') || '{}'); } catch(e){}
    var currentCount = viewCounts[PROJ.id] !== undefined ? viewCounts[PROJ.id] : PROJ.viewCount;
    currentCount++;
    viewCounts[PROJ.id] = currentCount;
    localStorage.setItem('zlc_view_counts', JSON.stringify(viewCounts));

    // Get participant count (signed contracts)
    var participantCount = MOCK_CONTRACTS_FOR_COUNT;
    // Also check localStorage contracts
    var lsContracts = [];
    try { lsContracts = JSON.parse(localStorage.getItem('zlc_contracts') || '[]'); } catch(e){}
    var lsSignedCount = lsContracts.filter(function(c){ return c.projectId === PROJ.id && c.status === 'active'; }).length;
    participantCount = Math.max(participantCount, participantCount + lsSignedCount);

    var vcEl = document.getElementById('detail-view-count');
    if(vcEl) vcEl.textContent = currentCount + '人浏览 · ' + participantCount + '人参与';
  })();

  // Render relation tag on detail page
  (function(){
    var myClassId = u.classId || '';
    var myTeacher = null;
    if(myClassId){
      myTeacher = TEACHERS.find(function(t){ return t.classIds.indexOf(myClassId) !== -1; }) || null;
    }
    var tag = null;
    if(myTeacher && PROJ.recommendedByTeacher && PROJ.recommendedByTeacher.indexOf(myTeacher.id) !== -1){
      tag = { text: '\\u{1F31F} 老师推荐', type: 'gold' };
    } else if(PROJ.initiatorClassId && PROJ.initiatorClassId === myClassId){
      tag = { text: '同班 · ' + (PROJ.initiatorClassName || ''), type: 'green' };
    } else if(PROJ.initiatorClassName){
      tag = { text: PROJ.initiatorClassName, type: 'gray' };
    }
    if(tag){
      var styles = {
        gold: 'background:#FFFBEB;color:#B45309;border:1px solid #FDE68A;',
        green: 'background:#ECFDF5;color:#047857;border:1px solid #A7F3D0;',
        gray: 'background:#F5F5F4;color:#78716C;border:1px solid #E7E5E4;'
      };
      var el = document.getElementById('detail-relation-tag');
      if(el){
        el.innerHTML = '<span style="display:inline-flex;align-items:center;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:600;' + styles[tag.type] + '">' + tag.text + '</span>';
        el.style.display = 'block';
      }
    }
  })();

  // Hide calculator if owner
  var ownerHint = document.getElementById('owner-hint');
  var partBtn = document.getElementById('participate-btn');
  if (u.id === PROJ.ownerId && partBtn) {
    partBtn.style.display = 'none';
    if (ownerHint) ownerHint.style.display = 'block';
  }

  // Admin cannot invest — disable participate button (Task 4)
  (function(){
    try {
      var cu = JSON.parse(localStorage.getItem('zlc_current_user'));
      if(cu && cu.role === 'admin' && partBtn){
        partBtn.disabled = true;
        partBtn.style.background = '#E7E5E4';
        partBtn.style.color = '#A8A29E';
        partBtn.style.cursor = 'not-allowed';
        partBtn.style.boxShadow = 'none';
        partBtn.textContent = '管理员不可参与投资';
        partBtn.onclick = function(e){ e.preventDefault(); e.stopPropagation(); };
      }
    } catch(e){}
  })();

  // Share calculator
  var sel = document.getElementById('share-select');
  var amtEl = document.getElementById('share-amount');
  var calcM = document.getElementById('calc-monthly');
  var calcC = document.getElementById('calc-cap');
  var calcMo = document.getElementById('calc-months');

  function updateCalc(){
    if(!sel) return;
    var n = parseInt(sel.value) || 1;
    var cost = n * PROJ.sharePrice;
    if(amtEl) amtEl.textContent = '¥' + cost + '万';
    var ratio = cost / PROJ.targetAmount;
    var monthly = PROJ.estimatedMonthlyRevenue * (PROJ.revenueShareRate / 100) * ratio;
    var cap = cost * PROJ.recoveryMultiple;
    var months = monthly > 0 ? Math.ceil(cost / monthly) : 0;
    if(calcM) calcM.textContent = '¥' + monthly.toFixed(2) + '万';
    if(calcC) calcC.textContent = '¥' + cap.toFixed(1) + '万';
    if(calcMo) calcMo.textContent = '约' + months + '月';
    if(partBtn && partBtn.style.display !== 'none') partBtn.textContent = '确认参与 ¥' + cost + '万';
    // Update calculator plain-language hint
    var hintEl = document.getElementById('calc-plain-hint');
    if(hintEl && monthly > 0){
      hintEl.innerHTML = '\\uD83D\\uDCA1 你投入 ' + cost + ' 万参与这个项目。按预估，你每月大约拿到 ' + monthly.toFixed(2) + ' 万。约 ' + months + ' 个月收回本金，最多拿回 ' + cap.toFixed(2) + ' 万。';
    }
  }
  if(sel) { sel.addEventListener('change', updateCalc); updateCalc(); }

  // Render plain-language block for project detail page
  (function(){
    var plEl = document.getElementById('plain-lang-detail');
    if(!plEl) return;
    var totalAmount = PROJ.targetAmount;
    var ratio = PROJ.revenueShareRate;
    var estRevenue = PROJ.estimatedMonthlyRevenue;
    var multiple = PROJ.recoveryMultiple;
    var minPart = PROJ.sharePrice;
    var monthlyShare = estRevenue * ratio / 100;
    var perShareMonthly = monthlyShare * (minPart / totalAmount);
    var paybackMonths = perShareMonthly > 0 ? Math.ceil(minPart / perShareMonthly) : 0;
    var perShareCap = minPart * multiple;

    plEl.innerHTML = '<div class="plain-lang-title">\\uD83D\\uDCAC 简单来说</div>'
      + '<div class="plain-lang-body">'
      + '这个项目总共需要 ' + totalAmount + ' 万资金。发起人承诺把项目每月收入的 ' + ratio + '% 分给所有参与人。按目前预估每月收入 ' + estRevenue + ' 万计算，每月总共分出约 ' + monthlyShare.toFixed(2) + ' 万。'
      + '<br/><br/>如果你参与 ' + minPart + ' 万（1份），你每月大约能拿到 ' + perShareMonthly.toFixed(2) + ' 万，大概 ' + paybackMonths + ' 个月收回本金，最多能拿回 ' + perShareCap.toFixed(2) + ' 万（投资额的 ' + multiple + ' 倍）。'
      + '<br/><br/><span class="plain-lang-warning">\\u26A0\\uFE0F 以上基于预估收入，实际回款取决于项目真实经营情况。</span>'
      + '</div>';
  })();

  // Participate with confirm modal
  function doParticipate(){
    if(!sel) return;
    var n = parseInt(sel.value) || 1;
    var cost = n * PROJ.sharePrice;

    showConfirm({
      title: '确认参与 ' + PROJ.name + '？',
      desc: '投资 ' + n + ' 份，共 ¥' + cost + '万',
      onConfirm: function(){
        // Check if already invested
        var investments = [];
        try { investments = JSON.parse(localStorage.getItem('zlc_investments') || '[]'); } catch(e){}
        var existing = investments.find(function(inv){ return inv.projectId === PROJ.id && inv.userId === u.id; });
        if(existing){
          showToast('您已参与过该项目','error');
          return;
        }

        // Save investment
        investments.push({
          projectId: PROJ.id,
          userId: u.id,
          shares: n,
          amount: cost,
          date: new Date().toISOString().slice(0,10),
          projectName: PROJ.name,
        });
        localStorage.setItem('zlc_investments', JSON.stringify(investments));

        // Create contract record
        var contractId = 'c-' + Date.now().toString(36);
        var contracts = [];
        try { contracts = JSON.parse(localStorage.getItem('zlc_contracts') || '[]'); } catch(e){}

        var ownerName = '发起人';
        if(typeof MEMBERS !== 'undefined'){
          var ownerM = MEMBERS.find(function(m){return m.id===PROJ.ownerId;});
          if(ownerM) ownerName = ownerM.name;
        }

        contracts.push({
          id: contractId,
          projectId: PROJ.id,
          userId: u.id,
          shares: n,
          amount: cost,
          status: 'pending',
          createdAt: new Date().toISOString(),
          ownerName: ownerName,
          project: {
            id: PROJ.id, name: PROJ.name, industry: PROJ.industry || '',
            description: PROJ.description || '',
            sharePrice: PROJ.sharePrice, targetAmount: PROJ.targetAmount,
            revenueShareRate: PROJ.revenueShareRate,
            duration: PROJ.duration || 0,
            recoveryMultiple: PROJ.recoveryMultiple,
            estimatedMonthlyRevenue: PROJ.estimatedMonthlyRevenue,
            reportFrequency: PROJ.reportFrequency || '月报',
            ownerId: PROJ.ownerId,
          }
        });
        localStorage.setItem('zlc_contracts', JSON.stringify(contracts));

        // Disable button
        if(partBtn){
          partBtn.disabled = true;
          partBtn.textContent = '已参与 ¥' + cost + '万';
        }
        if(sel) sel.disabled = true;

        // Show success modal
        showSuccessModal({
          title: '参与成功！',
          sub: '即将进入合同签署',
          duration: 2000,
          onDone: function(){ window.location.href = '/contracts/' + contractId + '/sign'; }
        });
      }
    });
  }

  if(partBtn) partBtn.addEventListener('click', doParticipate);

  // Check if already invested on load
  var investments = [];
  try { investments = JSON.parse(localStorage.getItem('zlc_investments') || '[]'); } catch(e){}
  var alreadyIn = investments.find(function(inv){ return inv.projectId === PROJ.id && inv.userId === u.id; });
  if(alreadyIn && partBtn){
    partBtn.disabled = true;
    partBtn.textContent = '已参与 ¥' + alreadyIn.amount + '万';
    if(sel) sel.disabled = true;
  }

  // ── Share Panel Logic ──
  var shareOverlay = document.getElementById('share-overlay');
  var sharePanel = document.getElementById('share-panel');
  var btnShareProject = document.getElementById('btn-share-project');
  var btnReferral = document.getElementById('btn-referral');

  function openSharePanel(){
    shareOverlay.style.display = 'block';
    void sharePanel.offsetHeight;
    sharePanel.style.transform = 'translateY(0)';
  }
  function closeSharePanel(){
    sharePanel.style.transform = 'translateY(100%)';
    setTimeout(function(){ shareOverlay.style.display = 'none'; }, 220);
  }

  if(btnShareProject){
    btnShareProject.addEventListener('click', openSharePanel);
  }
  if(shareOverlay){
    shareOverlay.addEventListener('click', function(e){
      if(e.target === shareOverlay) closeSharePanel();
    });
  }

  // Auto-open share sheet if ?share=true (Task 2)
  if(window.location.search.indexOf('share=true') !== -1){
    setTimeout(openSharePanel, 500);
  }

  // ── Referral Logic ──
  var refOverlay = document.getElementById('referral-overlay');
  var refModal = document.getElementById('referral-modal');
  var refCancelBtn = document.getElementById('ref-cancel-btn');
  var refSubmitBtn = document.getElementById('ref-submit-btn');
  var refMessage = document.getElementById('ref-message');
  var refTeacherNameEl = document.getElementById('ref-teacher-name');
  var refStatusLine = document.getElementById('referral-status-line');

  // Find teacher for current user
  var myClassId = u.classId || '';
  var myTeacher = null;
  if(myClassId){
    myTeacher = TEACHERS.find(function(t){ return t.classIds.indexOf(myClassId) !== -1; }) || null;
  }

  // Find project owner info
  var projOwnerMember = MEMBERS.find(function(m){ return m.id === PROJ.ownerId; });
  var isSameClassAsInitiator = myClassId && PROJ.initiatorClassId === myClassId;
  var isOwner = u.id === PROJ.ownerId;

  // Handle edge cases for referral button visibility
  if(btnReferral){
    if(isOwner){
      // Hide for project initiator
      btnReferral.style.display = 'none';
    } else if(!myTeacher){
      // Hide if user has no teacher
      btnReferral.style.display = 'none';
    } else if(isSameClassAsInitiator){
      // Same class: change text
      btnReferral.innerHTML = '<i class="fas fa-user-tie" style="font-size:13px;"></i> 请老师深入介绍';
    }
  }

  // Load existing referrals from localStorage
  var referrals = [];
  try { referrals = JSON.parse(localStorage.getItem('zlc_referrals') || '[]'); } catch(e){}
  var existingRef = referrals.find(function(r){ return r.projectId === PROJ.id && r.requesterId === u.id; });

  function updateReferralUI(){
    if(!btnReferral) return;
    referrals = [];
    try { referrals = JSON.parse(localStorage.getItem('zlc_referrals') || '[]'); } catch(e){}
    existingRef = referrals.find(function(r){ return r.projectId === PROJ.id && r.requesterId === u.id; });

    if(existingRef){
      // Disable button
      btnReferral.disabled = true;
      btnReferral.style.background = '#F5F5F4';
      btnReferral.style.borderColor = '#D6D3D1';
      btnReferral.style.color = '#78716C';
      btnReferral.style.cursor = 'default';
      btnReferral.innerHTML = '<i class="fas fa-clock" style="font-size:13px;"></i> 已请求引荐';

      // Show status line
      if(refStatusLine){
        if(existingRef.status === 'connected'){
          refStatusLine.style.display = 'block';
          refStatusLine.style.background = '#ECFDF5';
          refStatusLine.style.color = '#047857';
          refStatusLine.innerHTML = '\\u2705 ' + existingRef.teacherName + '已帮你对接 · 你可以随时参与投资';
        } else {
          refStatusLine.style.display = 'block';
          refStatusLine.style.background = '#FFFBEB';
          refStatusLine.style.color = '#92400E';
          refStatusLine.innerHTML = '\\u23F3 已请求引荐 · 等待' + existingRef.teacherName + '对接';
        }
      }
    }
  }

  function openReferralModal(){
    if(!myTeacher) return;
    if(refTeacherNameEl) refTeacherNameEl.textContent = myTeacher.name;
    refOverlay.style.display = 'flex';
    void refModal.offsetHeight;
    refModal.style.transform = 'scale(1)';
    refModal.style.opacity = '1';
  }
  function closeReferralModal(){
    refModal.style.transform = 'scale(0.95)';
    refModal.style.opacity = '0';
    setTimeout(function(){ refOverlay.style.display = 'none'; }, 200);
  }

  if(btnReferral && !isOwner && myTeacher){
    btnReferral.addEventListener('click', function(){
      if(existingRef){ return; }
      openReferralModal();
    });
  }
  if(refCancelBtn){
    refCancelBtn.addEventListener('click', closeReferralModal);
  }
  if(refOverlay){
    refOverlay.addEventListener('click', function(e){
      if(e.target === refOverlay) closeReferralModal();
    });
  }

  // Submit referral
  if(refSubmitBtn){
    refSubmitBtn.addEventListener('click', function(){
      if(!myTeacher) return;
      var msg = refMessage ? refMessage.value.trim() : '';
      var now = new Date();
      var nowISO = now.toISOString();
      var todayStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
      var ref = {
        id: 'ref-' + Date.now().toString(36),
        projectId: PROJ.id,
        projectName: PROJ.name,
        requesterId: u.id,
        requesterName: u.name || '',
        requesterClass: u.className || '',
        requesterClassName: u.className || '',
        initiatorId: PROJ.ownerId,
        initiatorName: projOwnerMember ? projOwnerMember.name : '',
        initiatorClassName: PROJ.initiatorClassName || '',
        teacherId: myTeacher.id,
        teacherName: myTeacher.name,
        message: msg,
        status: 'pending',
        createdAt: todayStr,
        completedAt: null,
        completedNote: null,
        requestedAt: nowISO,
        connectedAt: null
      };
      referrals.push(ref);
      localStorage.setItem('zlc_referrals', JSON.stringify(referrals));
      existingRef = ref;
      closeReferralModal();
      setTimeout(function(){
        showToast('引荐请求已发送给' + myTeacher.name, 'success');
        updateReferralUI();
      }, 300);
    });
  }

  // Initial referral UI update
  updateReferralUI();

  // Copy share code
  var btnCopyCode = document.getElementById('btn-copy-code');
  if(btnCopyCode){
    btnCopyCode.addEventListener('click', function(){
      if(PROJ.shareCode){
        navigator.clipboard.writeText(PROJ.shareCode).then(function(){
          btnCopyCode.textContent = '\\u2713 已复制';
          setTimeout(function(){ btnCopyCode.textContent = '复制分享码'; }, 2000);
        }).catch(function(){ showToast('复制失败，请手动复制: ' + PROJ.shareCode, 'error'); });
      }
    });
  }

  // Copy link
  var btnCopyLink = document.getElementById('btn-copy-link');
  if(btnCopyLink){
    btnCopyLink.addEventListener('click', function(){
      var link = 'https://zlc.yyzltop.com/share/' + PROJ.shareCode;
      navigator.clipboard.writeText(link).then(function(){
        btnCopyLink.textContent = '\\u2713 已复制';
        setTimeout(function(){ btnCopyLink.textContent = '复制链接'; }, 2000);
      }).catch(function(){ showToast('复制失败，请手动复制', 'error'); });
    });
  }

  // Copy text version (core feature)
  var btnCopyText = document.getElementById('btn-copy-text');
  if(btnCopyText){
    btnCopyText.addEventListener('click', function(){
      var monthlyRepayment = (PROJ.estimatedMonthlyRevenue * PROJ.revenueShareRate / 100).toFixed(1);
      var textContent = '\\uD83D\\uDCE2 【项目推介】' + PROJ.name + '\\n';
      if(PROJ.highlightText){ textContent += '\\uD83D\\uDCAC ' + PROJ.highlightText + '\\n'; }
      textContent += '\\n\\uD83D\\uDC64 发起人：' + OWNER.name + '（' + OWNER.className + '）\\n'
        + '\\uD83D\\uDCB0 融资规模：¥' + PROJ.targetAmount + '万\\n'
        + '\\uD83D\\uDCCA 收入分成：' + PROJ.revenueShareRate + '%\\n'
        + '\\u23F1 联营期限：' + PROJ.duration + '个月\\n'
        + '\\uD83D\\uDCC8 预估月回款：≈¥' + monthlyRepayment + '万\\n';
      if(PROJ.highlights && PROJ.highlights.length > 0){
        PROJ.highlights.forEach(function(h){ textContent += '\\u2705 ' + h + '\\n'; });
      }
      textContent += '\\n\\uD83D\\uDD17 查看详情：https://zlc.yyzltop.com/share/' + PROJ.shareCode + '\\n'
        + '\\uD83D\\uDD11 分享码：' + PROJ.shareCode + '\\n\\n'
        + '——来自「中流通」一亿中流私董会项目投资平台';
      navigator.clipboard.writeText(textContent).then(function(){
        btnCopyText.textContent = '\\u2713 已复制，去微信粘贴吧';
        setTimeout(function(){ btnCopyText.textContent = '复制文字版'; }, 3000);
      }).catch(function(){ showToast('复制失败，请手动复制', 'error'); });
    });
  }

  // Save card
  var btnSaveCard = document.getElementById('btn-save-card');
  if(btnSaveCard){
    btnSaveCard.addEventListener('click', function(){
      showToast('请长按上方卡片截图保存', 'info');
    });
  }

  // ── Coach Marks for Project Detail ──
  setTimeout(function(){
    showCoachMark('#participate-calculator', '选择份额数，系统自动帮你算预估回款', 'top', 'detail-calc');
  }, 800);
  setTimeout(function(){
    showCoachMark('#btn-referral', '不认识发起人？点这里请你的老师帮忙对接，先见面再投资', 'top', 'detail-referral');
  }, 1500);

  // ── Nudge C: Detail page 30s without action ──
  if (PROJ.status === 'open' && !localStorage.getItem('zlc_nudge_detail_action')) {
    var detailNudgeTimer = setTimeout(function(){ showNudge('\\uD83E\\uDD1D', '感兴趣的话可以直接参与，也可以请老师先引荐认识一下', 'detail_action'); }, 30000);
    function cancelDetailNudge(){ clearTimeout(detailNudgeTimer); }
    if(partBtn) partBtn.addEventListener('click', cancelDetailNudge);
    if(btnReferral) btnReferral.addEventListener('click', cancelDetailNudge);
    if(btnShareProject) btnShareProject.addEventListener('click', cancelDetailNudge);
    window.addEventListener('beforeunload', cancelDetailNudge);
  }
})();
`}} />
    </div>,
    { title: '中流通 - ' + proj.name }
  )
})
}
