// Route: /projects/:id
import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import {
  GlobalScripts, Navbar, AuthCheckScript, StatusBadge, statusLabel,
} from '../components'

export function registerProjectDetailRoute(app: Hono<HonoEnv>) {
app.get('/projects/:id', async (c) => {
  const db = c.env.DB
  const { loadMembers, loadProjects, loadContracts, loadTeachers, loadProjectById, isSameClass, calculateRBF } = await import('../db-bridge')
  const id = c.req.param('id')
  const proj = await loadProjectById(db, id)

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
  var el = document.getElementById('dynamic-project-content');

  // Try to fetch the project from D1 API
  fetch('/api/data/projects/' + encodeURIComponent(projectId))
    .then(function(r){ return r.json(); })
    .then(function(res){
      if(!res.ok || !res.data){
        el.innerHTML = '<div style="padding:40px 0;text-align:center;"><div style="width:56px;height:56px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class="fas fa-circle-xmark" style="font-size:24px;color:#DC2626;"></i></div><p style="font-size:16px;font-weight:600;color:#292524;">项目未找到</p><p style="font-size:14px;color:#78716C;margin-top:4px;">该项目不存在或已被删除</p></div>';
        return;
      }
      var proj = res.data;
      renderDynamicProject(proj, u, el);
    })
    .catch(function(){
      el.innerHTML = '<div style="padding:40px 0;text-align:center;"><div style="width:56px;height:56px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class="fas fa-circle-xmark" style="font-size:24px;color:#DC2626;"></i></div><p style="font-size:16px;font-weight:600;color:#292524;">加载失败</p><p style="font-size:14px;color:#78716C;margin-top:4px;">网络错误，请刷新重试</p></div>';
    });

  function renderDynamicProject(proj, u, el) {
  if(!proj) return;
  // Render project detail
  var pct = proj.targetAmount > 0 ? Math.round(proj.raisedAmount / proj.targetAmount * 100) : 0;
  var yieldRate = proj.annualYieldRate != null ? proj.annualYieldRate : 12;
  var exitMode = proj.exitMode || 'both';
  var monthly = proj.estimatedMonthlyRevenue * (proj.revenueShareRate / 100);
  var payback = monthly > 0 ? Math.ceil(proj.targetAmount / monthly) : 0;
  // Exit-mode-aware cap
  var cap = proj.targetAmount * proj.recoveryMultiple;
  if(exitMode === 'term_only' && proj.expectMultiple){
    cap = proj.targetAmount * proj.expectMultiple;
  } else if(exitMode !== 'term_only'){
    var basis = proj.settlementCycle || 'monthly';
    var flat = (yieldRate / (basis === 'weekly' ? 52 : basis === 'daily' ? 365 : 12)) / 100;
    var dur = exitMode === 'cap_only' ? (payback > 0 ? payback : 24) : proj.duration;
    var periods = basis === 'weekly' ? Math.ceil(dur*4.33) : basis === 'daily' ? Math.ceil(dur*30.42) : dur;
    cap = proj.targetAmount + proj.targetAmount * flat * periods;
  }
  var remainShares = proj.totalShares - proj.raisedShares;
  var statusLabel = {open:'募集中',funded:'已满额',active:'运营中',completed:'已完成',draft:'草稿'}[proj.status]||proj.status;

  var html = '<div class="detail-card">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">';
  html += '<span style="background:linear-gradient(135deg,#FEE2E2,#FEF2F2);color:#B91C1C;padding:4px 12px;border-radius:8px;font-size:11px;font-weight:600;">' + proj.industry + '</span>';
  html += '<span class="badge badge-' + proj.status + '">' + statusLabel + '</span></div>';
  html += '<h1 style="font-size:22px;font-weight:800;color:#1C1917;margin-bottom:12px;font-family:\\'Noto Sans SC\\',sans-serif;">' + proj.name + '</h1>';
  html += '<div style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:linear-gradient(135deg,#FAFAF9,#F5F5F4);border-radius:14px;margin-bottom:12px;">';
  html += '<div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#DC2626,#991B1B);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;">' + (u.name||'?').charAt(0) + '</div>';
  html += '<div><div style="font-size:14px;font-weight:600;color:#1C1917;">' + u.name + ' · ' + (u.title||'') + '</div>';
  html += '<div style="font-size:12px;color:#78716C;">' + (u.company||'') + ' · ' + (u.cohort||'') + '</div></div></div>';
  html += '<p style="font-size:15px;line-height:1.8;color:#292524;">' + proj.description + '</p>';
  if(proj.detail){ html += '<p style="font-size:13px;line-height:1.7;color:#78716C;margin-top:8px;">' + proj.detail + '</p>'; }
  html += '</div>';

  // Terms
  html += '<div class="detail-card" style="padding:0;overflow:hidden;">';
  html += '<div style="padding:18px 20px;border-bottom:1px solid #F5F5F4;display:flex;align-items:center;gap:10px;"><i class="fas fa-file-contract" style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#FEE2E2,#FECDD3);color:#B91C1C;display:flex;align-items:center;justify-content:center;font-size:13px;"></i><span style="font-size:16px;font-weight:600;color:#1C1917;">收入分成条款</span></div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;">';
  var exitModeLabel = exitMode === 'both' ? '先到为准' : exitMode === 'term_only' ? '仅期限' : '仅封顶';
  var terms = [["融资总额","¥"+proj.targetAmount+"万"],["分成比例",proj.revenueShareRate+"%"],["退出方式",exitModeLabel]];
  if(exitMode !== 'term_only'){ terms.push(["年化收益率",yieldRate+"%"]); var _b2 = proj.settlementCycle || 'monthly'; var _bl2 = _b2 === 'weekly' ? '周' : _b2 === 'daily' ? '日' : '月'; var _fp2 = yieldRate / (_b2 === 'weekly' ? 52 : _b2 === 'daily' ? 365 : 12); terms.push(["平息口径",_bl2+"平息 "+_fp2.toFixed(3)+"%"]); }
  if(exitMode === 'term_only' && proj.expectMultiple) terms.push(["预期收益倍数",proj.expectMultiple.toFixed(2)+"x"]);
  if(exitMode !== 'cap_only') terms.push(["最长分成期限",proj.duration+"月"]);
  terms.push(["回收上限","¥"+cap.toFixed(1)+"万"]);
  terms.push(["预估月收入","¥"+proj.estimatedMonthlyRevenue+"万"]);
  terms.forEach(function(t,i){ html += "<div style=\\"padding:14px 20px;border-bottom:1px solid #F5F5F4;"+(i%2===0?"border-right:1px solid #F5F5F4;":"")+"\\"><div style=\\"font-size:12px;color:#78716C;margin-bottom:4px;\\">"+t[0]+"</div><div style=\\"font-size:18px;font-weight:700;color:#1C1917;\\">"+t[1]+"</div></div>"; });
  html += '</div><div style="background:linear-gradient(135deg,#FEF2F2,#FFF1F2);padding:18px 20px;display:grid;grid-template-columns:1fr 1fr;gap:16px;">';
  html += '<div><div style="font-size:12px;color:#78716C;margin-bottom:4px;">预估月回款</div><div style="font-size:20px;font-weight:800;color:#B91C1C;">¥'+monthly.toFixed(1)+'万</div></div>';
  html += '<div><div style="font-size:12px;color:#78716C;margin-bottom:4px;">预估回收期</div><div style="font-size:20px;font-weight:800;color:#B91C1C;">约'+payback+'月</div></div>';
  html += '</div></div>';

  // Progress
  html += '<div class="detail-card">';
  html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;"><i class="fas fa-chart-pie" style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#FEF3C7,#FDE68A);color:#B45309;display:flex;align-items:center;justify-content:center;font-size:13px;"></i><span style="font-size:16px;font-weight:600;color:#1C1917;">募集进度</span></div>';
  html += '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;"><span style="font-size:20px;font-weight:800;color:#1C1917;">¥'+proj.raisedAmount+'万</span><span style="font-size:14px;color:#78716C;">/ ¥'+proj.targetAmount+'万</span></div>';
  html += '<div style="height:12px;border-radius:99px;background:#F5F5F4;overflow:hidden;margin-bottom:8px;"><div style="height:100%;border-radius:99px;background:linear-gradient(90deg,#D4A853,#B8860B);width:'+pct+'%;"></div></div>';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:13px;color:#78716C;">总 '+proj.totalShares+' 份 · 剩余 '+remainShares+' 份</span><span style="font-size:14px;font-weight:700;color:#B8860B;">'+pct+'%</span></div></div>';
  html += '<p style="text-align:center;font-size:13px;color:#A8A29E;margin-top:16px;">发布于 '+proj.createdAt+'</p>';

  el.innerHTML = html;
  } // end renderDynamicProject
})();
`}} />
      </div>,
      { title: '中流通 - 项目详情' }
    )
  }

  const [allMembers, allContracts, allTeachers] = await Promise.all([
    loadMembers(db), loadContracts(db), loadTeachers(db)
  ])
  const owner = allMembers.find(m => m.id === proj.ownerId)!
  const rbf = calculateRBF(proj.targetAmount, proj.revenueShareRate, proj.estimatedMonthlyRevenue, proj.recoveryMultiple)
  const pct = Math.round((proj.raisedAmount / proj.targetAmount) * 100)

  // Exit mode aware calculations
  const exitMode = proj.exitMode || 'both'
  const annualYieldRate = proj.annualYieldRate ?? 12
  const settlementCycle = proj.settlementCycle || 'monthly'
  const expectMultiple = proj.expectMultiple ?? null
  const basisLabelMap: Record<string, string> = { monthly: '月', weekly: '周', daily: '日' }
  const basisDivisor: Record<string, number> = { monthly: 12, weekly: 52, daily: 365 }
  const basisLabel = basisLabelMap[settlementCycle] || '月'
  const flatRatePct = annualYieldRate / (basisDivisor[settlementCycle] || 12)

  // Compute cap based on exit mode
  let ssrCap = rbf.recoveryCap
  let ssrCapMultiple = proj.recoveryMultiple
  if (exitMode === 'term_only' && expectMultiple) {
    ssrCap = proj.targetAmount * expectMultiple
    ssrCapMultiple = expectMultiple
  } else if (exitMode !== 'term_only') {
    const flatRate = flatRatePct / 100
    const periodsMap: Record<string, (m: number) => number> = {
      monthly: (m) => m,
      weekly: (m) => Math.ceil(m * 4.33),
      daily: (m) => Math.ceil(m * 30.42),
    }
    const getPeriods = periodsMap[settlementCycle] || periodsMap.monthly
    const paybackEst = rbf.monthlyShare > 0 ? Math.ceil(proj.targetAmount / rbf.monthlyShare) : 24
    const dur = exitMode === 'cap_only' ? paybackEst : proj.duration
    const periods = getPeriods(dur)
    ssrCap = proj.targetAmount + proj.targetAmount * flatRate * periods
    ssrCapMultiple = proj.targetAmount > 0 ? ssrCap / proj.targetAmount : 1
  }
  const remainShares = proj.totalShares - proj.raisedShares
  const investorMembers = proj.investors.map(iid => allMembers.find(m => m.id === iid)).filter(Boolean) as any[]
  const bgColors = ['#B91C1C','#D4A853','#991B1B','#B8860B','#7F1D1D']

  return c.render(
    <div class="app-container">
      <AuthCheckScript />
      <GlobalScripts />
      <Navbar />

      <main class="px-4 pt-3 pb-8 max-w-lg mx-auto page-enter dk-detail-main">
        {/* Back link */}
        <a href="/projects" class="back-link mb-4 inline-flex dk-detail-fullrow">
          <i class="fas fa-arrow-left" style="font-size:13px;" /> 返回项目大厅
        </a>

        {/* From share banner — shown via JS if ?from=share */}
        <div id="share-from-banner" class="dk-detail-fullrow" style="display:none;background:linear-gradient(135deg,#EFF6FF,#DBEAFE);color:#1D4ED8;border-radius:12px;padding:10px 14px;font-size:12px;margin-bottom:12px;font-weight:500;border:1px solid #BFDBFE;">
          <i class="fas fa-link" style="margin-right:6px;font-size:11px;" />通过分享码查看
        </div>

        {/* Relation Tag — rendered via client JS based on current user's classId */}
        <div id="detail-relation-tag" class="dk-detail-fullrow" style="display:none;margin-bottom:12px;" />

        {/* LEFT COLUMN: information area */}
        <div class="dk-detail-left">

          {/* ─── Card 1: Project Header ─── */}
          <div class="detail-card dk-detail-info">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
              <span style="background:linear-gradient(135deg,#FEE2E2,#FEF2F2);color:#B91C1C;padding:4px 12px;border-radius:8px;font-size:11px;font-weight:600;letter-spacing:0.3px;">{proj.industry}</span>
              <StatusBadge status={proj.status} />
            </div>
            <h1 style="font-size:24px;font-weight:800;color:#1C1917;line-height:1.35;margin-bottom:6px;font-family:'Noto Sans SC',sans-serif;">{proj.name}</h1>
            {proj.highlightText && (
              <p style="font-size:14px;color:#B91C1C;font-style:italic;margin-top:8px;line-height:1.5;padding-left:12px;border-left:3px solid #FECACA;">{proj.highlightText}</p>
            )}
            <div id="detail-view-count" style="font-size:12px;color:#A8A29E;margin-top:10px;display:flex;align-items:center;gap:6px;">
              <i class="fas fa-eye" style="font-size:11px;" />
            </div>
          </div>

          {/* ─── Card 2: Initiator Info ─── */}
          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-user-tie detail-card-header-icon" style="background:linear-gradient(135deg,#FEE2E2,#FECDD3);color:#B91C1C;" />
              <span>发起人</span>
            </div>
            <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:linear-gradient(135deg,#FAFAF9,#F5F5F4);border-radius:14px;">
              <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#DC2626,#991B1B);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;flex-shrink:0;box-shadow:0 2px 8px rgba(185,28,28,0.2);">
                {owner.name.charAt(0)}
              </div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:15px;font-weight:600;color:#1C1917;">{owner.name} <span style="font-size:13px;color:#78716C;font-weight:400;">· {owner.title}</span></div>
                <div style="font-size:13px;color:#57534E;margin-top:2px;">{owner.company} · {owner.cohort}</div>
                {owner.bio && <div style="font-size:12px;color:#A8A29E;margin-top:4px;line-height:1.5;">{owner.bio}</div>}
              </div>
            </div>
          </div>

          {/* ─── Card 3: Project Description ─── */}
          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-align-left detail-card-header-icon" style="background:linear-gradient(135deg,#F0F9FF,#DBEAFE);color:#2563EB;" />
              <span>项目介绍</span>
            </div>
            <p style="font-size:15px;line-height:1.8;color:#292524;">{proj.description}</p>
          </div>

          {/* ─── Card 4: RBF Terms ─── */}
          <div class="detail-card" style="padding:0;overflow:hidden;">
            <div style="padding:18px 20px;border-bottom:1px solid #F5F5F4;display:flex;align-items:center;gap:10px;">
              <i class="fas fa-file-contract" style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#FEE2E2,#FECDD3);color:#B91C1C;display:flex;align-items:center;justify-content:center;font-size:13px;" />
              <span style="font-size:16px;font-weight:600;color:#1C1917;">收入分成条款</span>
            </div>
            <div class="terms-grid">
              <div class="terms-cell">
                <div style="display:flex;align-items:center;gap:4px;">
                  <span class="terms-label" style="margin-bottom:0;">融资总额</span>
                  <span class="help-icon" data-help-id="totalAmount">?</span>
                </div>
                <div class="help-text">这个项目总共需要多少资金。所有参与人的投资加起来等于这个数。</div>
                <div class="terms-value">¥{proj.targetAmount}<span style="font-size:13px;font-weight:400;color:#A8A29E;">万</span></div>
              </div>
              <div class="terms-cell">
                <div style="display:flex;align-items:center;gap:4px;">
                  <span class="terms-label" style="margin-bottom:0;">分成比例</span>
                  <span class="help-icon" data-help-id="revenueShareRatio">?</span>
                </div>
                <div class="help-text">发起人愿意把项目月收入的多少拿出来分给参与人。比例越高，参与人回款越快，但发起人让出的越多。同类项目一般在8%-20%。</div>
                <div class="terms-value">{proj.revenueShareRate}<span style="font-size:13px;font-weight:400;color:#A8A29E;">%</span></div>
              </div>
              <div class="terms-cell">
                <div style="display:flex;align-items:center;gap:4px;">
                  <span class="terms-label" style="margin-bottom:0;">退出方式</span>
                  <span class="help-icon" data-help-id="exitMode">?</span>
                </div>
                <div class="help-text">决定合同何时终止。先到为准最常用：到期或封顶哪个先到就终止。</div>
                <div class="terms-value" style="font-size:16px;">{exitMode === 'both' ? '先到为准' : exitMode === 'term_only' ? '仅期限' : '仅封顶'}</div>
              </div>
              {exitMode !== 'cap_only' && (
                <div class="terms-cell">
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span class="terms-label" style="margin-bottom:0;">最长分成期限</span>
                    <span class="help-icon" data-help-id="cooperationTerm">?</span>
                  </div>
                  <div class="help-text">合作持续多长时间。到期后无论是否收回投资，合同自动结束。</div>
                  <div class="terms-value">{proj.duration}<span style="font-size:13px;font-weight:400;color:#A8A29E;">月</span></div>
                </div>
              )}
              {exitMode !== 'term_only' && (
                <div class="terms-cell">
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span class="terms-label" style="margin-bottom:0;">年化收益率</span>
                    <span class="help-icon" data-help-id="annualYieldRate">?</span>
                  </div>
                  <div class="help-text">投资人按年化收益率计算回收上限。年化12%意味着月平息1%，投入的本金按平息x占用期计算最大收益。</div>
                  <div class="terms-value">{annualYieldRate}<span style="font-size:13px;font-weight:400;color:#A8A29E;">%</span></div>
                </div>
              )}
              {exitMode !== 'term_only' && (
                <div class="terms-cell">
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span class="terms-label" style="margin-bottom:0;">平息口径</span>
                  </div>
                  <div class="terms-value" style="font-size:16px;">{basisLabel}平息 {flatRatePct.toFixed(3)}%</div>
                </div>
              )}
              {exitMode === 'term_only' && expectMultiple && (
                <div class="terms-cell">
                  <div style="display:flex;align-items:center;gap:4px;">
                    <span class="terms-label" style="margin-bottom:0;">预期收益倍数</span>
                    <span class="help-icon" data-help-id="expectMultiple">?</span>
                  </div>
                  <div class="help-text">参与人最多拿回本金的多少倍。如1.3x = 赚30%。</div>
                  <div class="terms-value">{expectMultiple.toFixed(2)}<span style="font-size:13px;font-weight:400;color:#A8A29E;">x</span></div>
                </div>
              )}
              <div class="terms-cell">
                <div style="display:flex;align-items:center;gap:4px;">
                  <span class="terms-label" style="margin-bottom:0;">回收上限</span>
                  <span class="help-icon" data-help-id="recoveryCap">?</span>
                </div>
                <div class="help-text">你最多能拿回的总金额。{exitMode === 'term_only' ? '= 本金 x 预期收益倍数' : '= 本金 + 本金 x 平息 x 占用期'}</div>
                <div class="terms-value">¥{Math.round(ssrCap * 10) / 10}<span style="font-size:13px;font-weight:400;color:#A8A29E;">万</span></div>
              </div>
              <div class="terms-cell">
                <div style="display:flex;align-items:center;gap:4px;">
                  <span class="terms-label" style="margin-bottom:0;">预估月收入</span>
                  <span class="help-icon" data-help-id="estimatedMonthlyRevenue">?</span>
                </div>
                <div class="help-text">发起人对项目月度收入的预估。这只是预估，实际回款取决于真实经营情况。</div>
                <div class="terms-value">¥{proj.estimatedMonthlyRevenue}<span style="font-size:13px;font-weight:400;color:#A8A29E;">万</span></div>
              </div>
            </div>
            {/* Highlight calc row */}
            <div style="background:linear-gradient(135deg,#FEF2F2,#FFF1F2);padding:18px 20px;display:grid;grid-template-columns:1fr 1fr;gap:16px;">
              <div>
                <div style="font-size:12px;color:#78716C;margin-bottom:4px;">预估月回款</div>
                <div style="font-size:20px;font-weight:800;color:#B91C1C;">¥{rbf.monthlyShare.toFixed(1)}<span style="font-size:14px;font-weight:400;">万</span></div>
              </div>
              <div>
                <div style="font-size:12px;color:#78716C;margin-bottom:4px;">预估回收期</div>
                <div style="font-size:20px;font-weight:800;color:#B91C1C;">约{rbf.paybackMonths}<span style="font-size:14px;font-weight:400;">月</span></div>
              </div>
            </div>
          </div>

          {/* ─── Card 5: Project Highlights ─── */}
          {proj.highlights && proj.highlights.length > 0 && (
            <div class="detail-card" style="border-left:3px solid #D4A853;">
              <div class="detail-card-header">
                <i class="fas fa-star detail-card-header-icon" style="background:linear-gradient(135deg,#FEF3C7,#FDE68A);color:#B45309;" />
                <span>项目亮点</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:10px;">
                {proj.highlights.map((h: string, idx: number) => (
                  <div style="display:flex;align-items:flex-start;gap:12px;padding:10px 14px;background:#FFFBEB;border-radius:10px;border:1px solid #FDE68A;">
                    <span style="width:22px;height:22px;border-radius:50%;background:#D4A853;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">{idx + 1}</span>
                    <span style="font-size:14px;color:#44403C;line-height:1.6;padding-top:1px;">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Card 6: Initiator Note ─── */}
          {proj.initiatorNote && proj.initiatorNote.trim() && (
            <div class="detail-card" style="background:linear-gradient(160deg,#FAFAF9,#F5F5F4);border:1px solid #E7E5E4;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
                <div style="width:36px;height:36px;border-radius:50%;background:#FEE2E2;color:#B91C1C;font-weight:600;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;">
                  {owner.name.charAt(0)}
                </div>
                <span style="font-size:14px;font-weight:600;color:#1C1917;">{owner.name}</span>
                <span style="font-size:11px;background:rgba(185,28,28,0.08);color:#B91C1C;border-radius:4px;padding:2px 8px;">发起人</span>
              </div>
              <div style="position:relative;padding-left:16px;">
                <span style="position:absolute;left:0;top:-4px;font-size:28px;color:#D6D3D1;font-family:Georgia,serif;line-height:1;">"</span>
                <p style="font-size:14px;color:#57534E;line-height:1.8;margin:0;">{proj.initiatorNote}</p>
              </div>
            </div>
          )}

          {/* ─── Card 7: Plain Language Block ─── */}
          <div id="plain-lang-detail" class="detail-plain-lang-wrapper" />

          {/* ─── Card 8: Fundraising Progress ─── */}
          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-chart-pie detail-card-header-icon" style="background:linear-gradient(135deg,#FEF3C7,#FDE68A);color:#B45309;" />
              <span>募集进度</span>
            </div>
            {/* Amount headline */}
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
              <span style="font-size:20px;font-weight:800;color:#1C1917;">¥{proj.raisedAmount}万</span>
              <span style="font-size:14px;color:#78716C;">/ ¥{proj.targetAmount}万</span>
            </div>
            {/* Progress bar */}
            <div class="progress-bar-lg" style="margin-bottom:8px;">
              <div class="progress-fill" data-width={`${pct}%`} />
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <span style="font-size:13px;color:#78716C;">已参与 {proj.investors.length} 位同学</span>
              <span style="font-size:14px;font-weight:700;color:#B8860B;">{pct}%</span>
            </div>
            {/* Share stats */}
            <div style="display:flex;gap:8px;">
              <div style="flex:1;padding:10px;background:#FAFAF9;border-radius:10px;text-align:center;">
                <div style="font-size:11px;color:#A8A29E;margin-bottom:2px;">总份额</div>
                <div style="font-size:16px;font-weight:700;color:#1C1917;">{proj.totalShares}份</div>
              </div>
              <div style="flex:1;padding:10px;background:#FAFAF9;border-radius:10px;text-align:center;">
                <div style="font-size:11px;color:#A8A29E;margin-bottom:2px;">剩余</div>
                <div style={`font-size:16px;font-weight:700;color:${remainShares > 0 ? '#16A34A' : '#DC2626'};`}>{remainShares > 0 ? `${remainShares}份` : '已满额'}</div>
              </div>
              <div style="flex:1;padding:10px;background:#FAFAF9;border-radius:10px;text-align:center;">
                <div style="font-size:11px;color:#A8A29E;margin-bottom:2px;">每份</div>
                <div style="font-size:16px;font-weight:700;color:#1C1917;">¥{proj.sharePrice}万</div>
              </div>
            </div>
          </div>

        {/* Close left column wrapper (dk-detail-left) before the action card */}
        </div>

        {/* RIGHT COLUMN: Action area (sticky on desktop) */}
        {(proj.status === 'open' || proj.status === 'active') && remainShares > 0 && (
          <div id="participate-calculator" class="dk-detail-action-card" style="background:linear-gradient(160deg,#FFFBEB 0%,#FFF7ED 50%,#FEF2F2 100%);border-radius:20px;border:1.5px solid #FDE68A;padding:0;overflow:hidden;box-shadow:0 4px 24px rgba(212,168,83,0.15);margin-bottom:16px;">
            {/* Header banner */}
            <div style="background:linear-gradient(135deg,#B8860B 0%,#D4A853 100%);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;">
              <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:36px;height:36px;border-radius:12px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">
                  <i class="fas fa-hand-holding-usd" style="color:#fff;font-size:16px;" />
                </div>
                <div>
                  <div style="font-size:16px;font-weight:700;color:#fff;">我要参与</div>
                  <div style="font-size:11px;color:rgba(255,255,255,0.75);margin-top:1px;">选择份额，一键认购</div>
                </div>
              </div>
              <div style="background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:20px;font-size:12px;color:#fff;font-weight:600;">
                剩余 {remainShares} 份
              </div>
            </div>

            {/* Body */}
            <div style="padding:20px;">
              {/* Share selector */}
              <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
                <div style="flex:1;">
                  <div style="font-size:12px;color:#92400E;font-weight:600;margin-bottom:6px;">选择份额</div>
                  <select id="share-select" style="width:100%;padding:12px 16px;border:1.5px solid #FDE68A;border-radius:12px;font-size:16px;font-weight:700;color:#1C1917;background:#fff;outline:none;cursor:pointer;appearance:auto;">
                    {Array.from({ length: Math.min(remainShares, 10) }, (_, i) => i + 1).map(n => (
                      <option value={String(n)}>{n} 份</option>
                    ))}
                  </select>
                </div>
                <div style="font-size:20px;color:#D4A853;font-weight:300;">=</div>
                <div style="flex:1;text-align:right;">
                  <div style="font-size:12px;color:#92400E;font-weight:600;margin-bottom:6px;">投入金额</div>
                  <div id="share-amount" style="font-size:28px;font-weight:800;color:#B8860B;line-height:1;">¥{proj.sharePrice}<span style="font-size:14px;font-weight:400;">万</span></div>
                </div>
              </div>

              {/* Quick estimate grid */}
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px;">
                <div style="background:#fff;border-radius:12px;padding:12px;text-align:center;border:1px solid #FDE68A;">
                  <div style="font-size:11px;color:#92400E;margin-bottom:4px;">月回款预估</div>
                  <div id="calc-monthly" style="font-size:16px;font-weight:700;color:#B8860B;">—</div>
                </div>
                <div style="background:#fff;border-radius:12px;padding:12px;text-align:center;border:1px solid #FDE68A;">
                  <div style="font-size:11px;color:#92400E;margin-bottom:4px;">回收上限</div>
                  <div id="calc-cap" style="font-size:16px;font-weight:700;color:#B8860B;">—</div>
                </div>
                <div style="background:#fff;border-radius:12px;padding:12px;text-align:center;border:1px solid #FDE68A;">
                  <div style="font-size:11px;color:#92400E;margin-bottom:4px;">预估回收期</div>
                  <div id="calc-months" style="font-size:16px;font-weight:700;color:#B8860B;">—</div>
                </div>
              </div>

              {/* Plain-language hint */}
              <div id="calc-plain-hint" style="font-size:12px;line-height:1.7;color:#78716C;margin-bottom:18px;padding:10px 14px;background:#fff;border-radius:10px;border:1px dashed #E7E5E4;" />

              {/* Owner info (desktop) */}
              <div class="dk-detail-action-owner" style="display:none;margin-bottom:16px;">
                <div style="display:flex;align-items:center;gap:12px;padding:12px;background:#fff;border-radius:12px;border:1px solid #FDE68A;">
                  <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#DC2626,#991B1B);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0;">
                    {owner.name.charAt(0)}
                  </div>
                  <div>
                    <div style="font-size:14px;font-weight:600;color:#1C1917;">{owner.name}</div>
                    <div style="font-size:12px;color:#78716C;">{owner.company} · {owner.cohort}</div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button id="participate-btn" style="width:100%;height:52px;border:none;border-radius:14px;font-size:17px;font-weight:700;color:#fff;cursor:pointer;background:linear-gradient(135deg,#B8860B 0%,#D4A853 100%);box-shadow:0 4px 16px rgba(184,134,11,0.3);transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px;">
                <i class="fas fa-check-circle" style="font-size:15px;" />
                确认参与 ¥{proj.sharePrice}万
              </button>
              <p id="owner-hint" style="text-align:center;font-size:12px;color:#A8A29E;margin-top:10px;display:none;">
                您是项目发起人，无法参与自己的项目
              </p>
            </div>
          </div>
        )}

        {/* Fixed bottom bar for mobile — "我要参与" button when calculator is out of view */}
        {(proj.status === 'open' || proj.status === 'active') && remainShares > 0 && (
          <div id="mobile-participate-bar" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:900;background:rgba(255,255,255,0.97);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid #F5F5F4;padding:12px 16px;box-shadow:0 -4px 20px rgba(0,0,0,0.08);">
            <div style="max-width:480px;margin:0 auto;display:flex;align-items:center;gap:12px;">
              <div style="flex:1;">
                <div style="font-size:12px;color:#78716C;">每份 ¥{proj.sharePrice}万 · 剩余{remainShares}份</div>
              </div>
              <button id="mobile-participate-scroll-btn" style="background:linear-gradient(135deg,#B8860B,#D4A853);color:#fff;border:none;border-radius:12px;padding:12px 24px;font-size:15px;font-weight:700;cursor:pointer;white-space:nowrap;box-shadow:0 2px 12px rgba(184,134,11,0.3);">
                <i class="fas fa-hand-holding-usd" style="margin-right:6px;" />我要参与
              </button>
            </div>
          </div>
        )}

        {/* 5. Investors */}
        <div class="detail-card dk-detail-bottom">
          <div class="detail-card-header">
            <i class="fas fa-users detail-card-header-icon" style="background:linear-gradient(135deg,#EDE9FE,#DDD6FE);color:#7C3AED;" />
            <span>已参与学员</span>
          </div>
          {investorMembers.length > 0 ? (
            <div>
              <div class="avatar-stack mb-3">
                {investorMembers.slice(0, 6).map((m, i) => (
                  <div class="av-circle" style={`background:${bgColors[i % bgColors.length]};`}>{m.name.charAt(0)}</div>
                ))}
                {investorMembers.length > 6 && (
                  <div class="av-circle" style="background:#78716C;">+{investorMembers.length - 6}</div>
                )}
              </div>
              <p style="font-size:13px;color:#78716C;">共 {investorMembers.length} 位同学参与</p>
            </div>
          ) : (
            <div style="text-align:center;padding:12px 0;">
              <div style="font-size:28px;margin-bottom:6px;opacity:0.5;">👥</div>
              <p style="font-size:13px;color:#A8A29E;">暂无学员参与，成为第一位！</p>
            </div>
          )}
        </div>

        {/* 6. Share / Referral Buttons */}
        <div class="dk-detail-bottom" style="margin-bottom:16px;">
          <div class="detail-card" style="padding:16px 20px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
              <div style="flex:1;height:1px;background:#E7E5E4;" />
              <span style="font-size:12px;color:#A8A29E;white-space:nowrap;">更多操作</span>
              <div style="flex:1;height:1px;background:#E7E5E4;" />
            </div>
            <div style="display:flex;gap:10px;">
              <button id="btn-referral" style="flex:1;height:44px;background:linear-gradient(135deg,#FEF2F2,#FFF1F2);border:1.5px solid #FECACA;border-radius:12px;color:#B91C1C;font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all 0.2s;">
                <i class="fas fa-user-tie" style="font-size:13px;" /> 请老师引荐
              </button>
              <button id="btn-share-project" style="flex:1;height:44px;background:#FAFAF9;border:1.5px solid #E7E5E4;border-radius:12px;color:#57534E;font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all 0.2s;">
                <i class="fas fa-share-alt" style="font-size:13px;" /> 分享项目
              </button>
            </div>
            {/* Referral status line — rendered via client JS */}
            <div id="referral-status-line" style="display:none;margin-top:10px;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:500;" />
          </div>
        </div>
      </main>

      {/* Share Sheet Overlay (Task 1 — Premium Share Card) */}
      <div id="share-overlay" class="dk-modal-overlay" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;">
        <div id="share-panel" class="dk-modal-panel" style="position:absolute;bottom:0;left:0;right:0;background:#fff;border-radius:24px 24px 0 0;padding:24px;transform:translateY(100%);transition:transform 300ms ease-out;max-height:85vh;overflow-y:auto;">
          {/* Drag indicator */}
          <div style="width:40px;height:4px;border-radius:2px;background:#D6D3D1;margin:0 auto 20px;" />

          {/* Premium Share Card Preview */}
          <div id="share-card-preview" style="width:100%;max-width:320px;margin:0 auto;border-radius:20px;overflow:hidden;background:linear-gradient(160deg,#7F1D1D 0%,#B91C1C 35%,#991B1B 65%,#7F1D1D 100%);box-shadow:0 8px 32px rgba(185,28,28,0.3);">
            {/* A. Brand header */}
            <div style="padding:20px 24px 16px;">
              <div style="width:40px;height:2px;background:linear-gradient(90deg,#D4A853,#F5DEB3);margin-bottom:12px;" />
              <div style="font-size:12px;color:#D4A853;letter-spacing:3px;">中流通 · 项目推介</div>
            </div>
            {/* B. Project name */}
            <div style="padding:0 24px;">
              <div style="font-size:24px;font-weight:800;color:#fff;line-height:1.3;">{proj.name}</div>
              {proj.highlightText && (
                <div style="margin-top:8px;font-size:14px;color:rgba(212,168,83,0.9);font-style:italic;line-height:1.5;">{proj.highlightText}</div>
              )}
            </div>
            {/* C. Initiator */}
            <div style="padding:12px 24px 0;">
              <div style="font-size:13px;color:rgba(255,255,255,0.5);">发起人 {owner.name} · {owner.className || owner.cohort}</div>
            </div>
            {/* D. Core data */}
            <div style="margin:20px 24px;padding:20px;background:rgba(255,255,255,0.12);border-radius:14px;border:1px solid rgba(255,255,255,0.15);">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div style="text-align:center;"><div style="font-size:22px;font-weight:800;color:#fff;">¥{proj.targetAmount}万</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;letter-spacing:1px;">融资规模</div></div>
                <div style="text-align:center;"><div style="font-size:22px;font-weight:800;color:#fff;">{proj.revenueShareRate}%</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;letter-spacing:1px;">收入分成</div></div>
                <div style="text-align:center;"><div style="font-size:22px;font-weight:800;color:#fff;">{proj.duration}个月</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;letter-spacing:1px;">联营期限</div></div>
                <div style="text-align:center;"><div style="font-size:22px;font-weight:800;color:#fff;">≈¥{(proj.estimatedMonthlyRevenue * proj.revenueShareRate / 100).toFixed(1)}万</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;letter-spacing:1px;">预估月回款</div></div>
              </div>
            </div>
            {/* E. Highlights */}
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
            {/* F. Share code */}
            <div style="padding:24px;text-align:center;">
              <div style="border:1px dashed rgba(212,168,83,0.4);border-radius:12px;padding:16px;margin:0 24px;">
                <div style="font-size:32px;font-weight:800;letter-spacing:8px;color:#D4A853;font-family:monospace;">{proj.shareCode || '------'}</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:8px;">输入分享码 或 扫码查看</div>
                <div style="margin:10px auto 0;width:80px;height:80px;background:rgba(255,255,255,0.12);border-radius:8px;display:flex;align-items:center;justify-content:center;">
                  <span style="font-size:14px;color:rgba(255,255,255,0.2);">QR</span>
                </div>
              </div>
            </div>
            {/* G. Footer */}
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
window.__ZLC_TEACHERS__ = ${JSON.stringify(allTeachers.map(t => ({ id:t.id, name:t.name, phone:t.phone, classIds:t.classIds })))};
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
    exitMode: proj.exitMode || 'both',
    annualYieldRate: proj.annualYieldRate ?? 12,
    expectMultiple: proj.expectMultiple ?? null,
    settlementCycle: proj.settlementCycle || 'monthly',
  })};
  var OWNER = ${JSON.stringify({ name: owner.name, className: owner.className || owner.cohort || '' })};
  var MOCK_CONTRACTS_FOR_COUNT = ${JSON.stringify(allContracts.filter(c => c.projectId === proj.id && c.status === 'active').length)};
  var CONTRACTS_FOR_PROJECT = ${JSON.stringify(allContracts.filter(c => c.projectId === proj.id).map(c => ({ id:c.id, participantId:c.participantId, amount:c.amount, status:c.status })))};
  var MEMBERS = ${JSON.stringify(allMembers.map(m => ({ id:m.id, name:m.name, classId:m.classId||'' })))};
  var TEACHERS = ${JSON.stringify(allTeachers.map(t => ({ id:t.id, name:t.name, classIds:t.classIds })))};

  // Show from=share banner
  if(window.location.search.indexOf('from=share') !== -1){
    var banner = document.getElementById('share-from-banner');
    if(banner) banner.style.display = 'block';
  }

  // ── Task 3: viewCount increment + display ──
  (function(){
    fetch('/api/admin/projects/' + PROJ.id + '/view', {method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).then(function(r){return r.json();}).then(function(res){
      var currentCount = res.ok ? res.viewCount : (PROJ.viewCount || 0);
      var participantCount = MOCK_CONTRACTS_FOR_COUNT;
      var vcEl = document.getElementById('detail-view-count');
      if(vcEl) vcEl.innerHTML = '<i class="fas fa-eye" style="font-size:11px;"></i> ' + currentCount + '人浏览 · ' + participantCount + '人参与';
    }).catch(function(){
      var vcEl = document.getElementById('detail-view-count');
      if(vcEl) vcEl.innerHTML = '<i class="fas fa-eye" style="font-size:11px;"></i> ' + (PROJ.viewCount || 0) + '人浏览 · ' + MOCK_CONTRACTS_FOR_COUNT + '人参与';
    });
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
    var months = monthly > 0 ? Math.ceil(cost / monthly) : 0;

    // Exit-mode-aware cap calculation
    var em = PROJ.exitMode || 'both';
    var cap = 0;
    if(em === 'term_only'){
      var mult = PROJ.expectMultiple || PROJ.recoveryMultiple || 1.3;
      cap = cost * mult;
    } else {
      var yr = PROJ.annualYieldRate != null ? PROJ.annualYieldRate : 12;
      var basis = PROJ.settlementCycle || 'monthly';
      var flat = _getFlatRate(yr, basis) / 100;
      var dur = em === 'cap_only' ? (months > 0 ? months : 24) : PROJ.duration;
      var periods = _getPeriods(dur, basis);
      cap = cost + cost * flat * periods;
    }

    if(calcM) calcM.textContent = '¥' + monthly.toFixed(2) + '万';
    if(calcC) calcC.textContent = '¥' + (Math.round(cap*10)/10) + '万';
    if(calcMo) calcMo.textContent = '约' + months + '月';
    if(partBtn && partBtn.style.display !== 'none') partBtn.textContent = '确认参与 ¥' + cost + '万';
    // Update calculator plain-language hint
    var hintEl = document.getElementById('calc-plain-hint');
    if(hintEl && monthly > 0){
      hintEl.innerHTML = '\\uD83D\\uDCA1 你投入 ' + cost + ' 万参与这个项目。按预估，你每月大约拿到 ' + monthly.toFixed(2) + ' 万。约 ' + months + ' 个月收回本金，回收上限 ' + cap.toFixed(2) + ' 万。';
    }
  }
  if(sel) { sel.addEventListener('change', updateCalc); updateCalc(); }

  // ── Helper: compute flat rate info ──
  function _getFlatRate(yieldRate, basis){
    if(basis === 'weekly') return yieldRate / 52;
    if(basis === 'daily') return yieldRate / 365;
    return yieldRate / 12;
  }
  function _getBasisLabel(basis){ return basis === 'weekly' ? '周' : basis === 'daily' ? '日' : '月'; }
  function _getPeriods(durationMonths, basis){
    if(basis === 'weekly') return Math.ceil(durationMonths * 4.33);
    if(basis === 'daily') return Math.ceil(durationMonths * 30.42);
    return durationMonths;
  }

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

    var em = PROJ.exitMode || 'both';
    var costDesc = '';
    if(em === 'term_only'){
      var mult = PROJ.expectMultiple || multiple;
      perShareCap = minPart * mult;
      costDesc = '预期收益倍数 ' + mult.toFixed(2) + 'x';
    } else {
      var pYieldRate = PROJ.annualYieldRate != null ? PROJ.annualYieldRate : 12;
      var basis = PROJ.settlementCycle || 'monthly';
      var pBasisLabel = _getBasisLabel(basis);
      var pFlat = _getFlatRate(pYieldRate, basis);
      costDesc = '年化' + pYieldRate + '%，' + pBasisLabel + '平息' + (pFlat).toFixed(3) + '%';
    }

    plEl.innerHTML = '<div class="detail-card" style="background:#FFFBEB;border:1px solid #FDE68A;">'
      + '<div style="font-size:14px;font-weight:600;color:#92400E;margin-bottom:8px;">\\uD83D\\uDCAC 简单来说</div>'
      + '<div style="font-size:13px;line-height:1.8;color:#78716C;">'
      + '这个项目总共需要 ' + totalAmount + ' 万资金。发起人承诺把项目每月收入的 ' + ratio + '% 分给所有参与人。按目前预估每月收入 ' + estRevenue + ' 万计算，每月总共分出约 ' + monthlyShare.toFixed(2) + ' 万。'
      + '<br/><br/>如果你参与 ' + minPart + ' 万（1份），你每月大约能拿到 ' + perShareMonthly.toFixed(2) + ' 万，大概 ' + paybackMonths + ' 个月收回本金，回收上限 ' + perShareCap.toFixed(2) + ' 万（' + costDesc + '）。'
      + '<br/><br/><span style="color:#DC2626;">\\u26A0\\uFE0F 以上基于预估收入，实际回款取决于项目真实经营情况。</span>'
      + '</div></div>';
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
        if(partBtn){ partBtn.disabled = true; partBtn.textContent = '提交中...'; }

        fetch('/api/admin/projects/' + PROJ.id + '/participate', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          credentials: 'same-origin',
          body: JSON.stringify({ shares: n })
        }).then(function(r){return r.json();}).then(function(d){
          if(!d.ok){
            showToast(d.error || '参与失败', 'error');
            if(partBtn){ partBtn.disabled = false; partBtn.textContent = '确认参与'; }
            return;
          }

          var contractId = d.data.contractId;

          if(partBtn){
            partBtn.disabled = true;
            partBtn.textContent = '已参与 ¥' + cost + '万';
          }
          if(sel) sel.disabled = true;

          showSuccessModal({
            title: '参与成功！',
            sub: '即将进入条款确认',
            duration: 2000,
            onDone: function(){ window.location.href = '/contracts/' + contractId + '/terms'; }
          });
        }).catch(function(){
          showToast('网络错误', 'error');
          if(partBtn){ partBtn.disabled = false; partBtn.textContent = '确认参与'; }
        });
      }
    });
  }

  if(partBtn) partBtn.addEventListener('click', doParticipate);

  // Check if already invested on load
  var alreadyIn = null;
  if(typeof CONTRACTS_FOR_PROJECT !== 'undefined'){
    CONTRACTS_FOR_PROJECT.forEach(function(c){ if(c.participantId === u.id) alreadyIn = c; });
  }
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

  // Auto-open share sheet if ?share=true
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

  var myClassId = u.classId || '';
  var myTeacher = null;
  if(myClassId){
    myTeacher = TEACHERS.find(function(t){ return t.classIds.indexOf(myClassId) !== -1; }) || null;
  }

  var projOwnerMember = MEMBERS.find(function(m){ return m.id === PROJ.ownerId; });
  var isSameClassAsInitiator = myClassId && PROJ.initiatorClassId === myClassId;
  var isOwner = u.id === PROJ.ownerId;

  if(btnReferral){
    if(isOwner){
      btnReferral.style.display = 'none';
    } else if(!myTeacher){
      btnReferral.style.display = 'none';
    } else if(isSameClassAsInitiator){
      btnReferral.innerHTML = '<i class="fas fa-user-tie" style="font-size:13px;"></i> 请老师深入介绍';
    }
  }

  // Load existing referrals
  var referrals = [];
  var existingRef = null;
  fetch('/api/data/referrals').then(function(r){return r.json();}).then(function(res){
    var allRefs = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
    referrals = allRefs.filter(function(r){ return r.projectId === PROJ.id; });
    existingRef = referrals.find(function(r){ return r.requesterId === u.id; });
    updateReferralUI();
  }).catch(function(){});

  function updateReferralUI(){
    if(!btnReferral) return;
    existingRef = referrals.find(function(r){ return r.projectId === PROJ.id && r.requesterId === u.id; });

    if(existingRef){
      btnReferral.disabled = true;
      btnReferral.style.background = '#F5F5F4';
      btnReferral.style.borderColor = '#D6D3D1';
      btnReferral.style.color = '#78716C';
      btnReferral.style.cursor = 'default';
      btnReferral.innerHTML = '<i class="fas fa-clock" style="font-size:13px;"></i> 已请求引荐';

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

  // Submit referral via API
  if(refSubmitBtn){
    refSubmitBtn.addEventListener('click', function(){
      if(!myTeacher) return;
      var msg = refMessage ? refMessage.value.trim() : '';
      refSubmitBtn.disabled = true;
      refSubmitBtn.textContent = '发送中...';

      fetch('/api/admin/referrals/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          projectId: PROJ.id,
          requesterId: u.id,
          teacherId: myTeacher.id,
          message: msg
        })
      }).then(function(r){return r.json();}).then(function(d){
        refSubmitBtn.disabled = false;
        refSubmitBtn.textContent = '发送引荐请求';
        if(d.ok){
          existingRef = {
            status: 'pending',
            teacherName: myTeacher.name
          };
          closeReferralModal();
          setTimeout(function(){
            showToast('引荐请求已发送给' + myTeacher.name, 'success');
            updateReferralUI();
          }, 300);
        } else {
          showToast(d.error || '发送失败', 'error');
        }
      }).catch(function(){
        refSubmitBtn.disabled = false;
        refSubmitBtn.textContent = '发送引荐请求';
        showToast('网络错误', 'error');
      });
    });
  }

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

  // Copy text version
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

  // ── Inline First-Visit Hints (replaces Coach Marks to avoid overlay issues) ──
  (function(){
    var userId = '';
    try { userId = JSON.parse(localStorage.getItem('zlc_user')).id; } catch(e){}
    var hintKey = userId ? 'zlc_detail_hint_' + userId : 'zlc_detail_hint';
    if(localStorage.getItem(hintKey)) return;

    // Show inline hint below calculator
    var calcEl = document.getElementById('participate-calculator');
    if(calcEl){
      var hint = document.createElement('div');
      hint.style.cssText = 'background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:12px 16px;margin-top:-8px;margin-bottom:16px;display:flex;align-items:flex-start;gap:10px;animation:coachFadeIn 0.4s ease forwards;';
      hint.innerHTML = '<span style="font-size:16px;flex-shrink:0;">💡</span>'
        + '<div style="flex:1;"><div style="font-size:13px;color:#92400E;line-height:1.6;">选择份额数，系统自动帮你算预估回款。不认识发起人？可以请老师帮忙引荐对接。</div>'
        + '<button id="detail-hint-dismiss" style="font-size:12px;color:#B45309;font-weight:600;background:none;border:none;cursor:pointer;margin-top:6px;padding:0;">我知道了</button></div>';
      calcEl.parentNode.insertBefore(hint, calcEl.nextSibling);
      document.getElementById('detail-hint-dismiss').addEventListener('click', function(){
        localStorage.setItem(hintKey, 'true');
        hint.style.opacity = '0';
        hint.style.transition = 'opacity 0.3s';
        setTimeout(function(){ hint.remove(); }, 300);
      });
    }
  })();

  // ── Mobile fixed "我要参与" bar — show when calculator is scrolled out of view ──
  (function(){
    var calcEl = document.getElementById('participate-calculator');
    var mobileBar = document.getElementById('mobile-participate-bar');
    var scrollBtn = document.getElementById('mobile-participate-scroll-btn');
    if(!calcEl || !mobileBar) return;
    function checkScroll(){
      var rect = calcEl.getBoundingClientRect();
      var isHidden = rect.bottom < 0 || rect.top > window.innerHeight;
      mobileBar.style.display = isHidden ? 'block' : 'none';
    }
    window.addEventListener('scroll', checkScroll, {passive:true});
    checkScroll();
    if(scrollBtn){
      scrollBtn.addEventListener('click', function(){
        calcEl.scrollIntoView({behavior:'smooth',block:'center'});
      });
    }
  })();

  // ── Nudge C: Detail page 30s without action ──
  if ((PROJ.status === 'open' || PROJ.status === 'active') && !localStorage.getItem('zlc_nudge_detail_action')) {
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
