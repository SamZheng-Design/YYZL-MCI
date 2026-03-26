// Route: /initiated/:projectId/report
import { Hono } from 'hono'
import type { HonoEnv } from '../types'
import {
  GlobalScripts, Navbar, AuthCheckScript,
} from '../components'

export function registerRevenueReportRoute(app: Hono<HonoEnv>) {
app.get('/initiated/:projectId/report', async (c) => {
  // ═══ Phase 1C: NO DB calls — pure HTML skeleton ═══
  const projectId = c.req.param('projectId')

  return c.render(
    <div class="app-container">
      <AuthCheckScript />
      <GlobalScripts />
      <Navbar />

      <main class="max-w-lg mx-auto px-4 pt-3 pb-8 page-enter">
        <a href="/repayments" class="back-link mb-4 inline-flex">
          <i class="fas fa-arrow-left" style="font-size:13px;" /> 返回回款中心
        </a>

        <div id="report-content">
          <div class="text-center py-12">
            <div class="spinner" style="border-color:rgba(185,28,28,0.2);border-top-color:#B91C1C;width:32px;height:32px;" />
            <p class="text-text-secondary mt-3" style="font-size:14px;">加载中...</p>
          </div>
        </div>
      </main>

      {/* Success overlay */}
      <div class="sign-success-overlay" id="report-success-overlay">
        <div class="sign-success-icon">
          <i class="fas fa-check text-white" style="font-size:36px;" />
        </div>
        <div class="sign-success-text">上报成功</div>
        <div class="sign-success-sub">收入已记录，分成已自动分配</div>
      </div>

      <div id="toast" class="toast" />

      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var u = null;
  try { u = JSON.parse(localStorage.getItem('zlc_user')); } catch(e){}
  if (!u) return;

  var PROJECT_ID = '${projectId}';
  var CONTRACTS = [];
  var PROJECTS = [];
  var REV_REPORTS = [];
  var REP_RECORDS = [];
  var MEMBERS = [];

  var el = document.getElementById('report-content');

  // Fetch data from APIs
  Promise.all([
    fetch('/api/data/contracts').then(function(r){return r.json();}),
    fetch('/api/data/projects').then(function(r){return r.json();}),
    fetch('/api/data/revenue-reports').then(function(r){return r.json();}),
    fetch('/api/data/repayment-records').then(function(r){return r.json();}),
    fetch('/api/data/members').then(function(r){return r.json();})
  ]).then(function(results){
    CONTRACTS = results[0].ok ? results[0].data : [];
    PROJECTS = results[1].ok ? results[1].data : [];
    REV_REPORTS = results[2].ok ? results[2].data : [];
    REP_RECORDS = results[3].ok ? results[3].data : [];
    MEMBERS = (results[4].ok ? results[4].data : []).map(function(m){ return {id:m.id,name:m.name,company:m.company}; });
    initReport();
  }).catch(function(err){
    el.innerHTML = '<div style="text-align:center;padding:40px;"><p style="color:#DC2626;">数据加载失败，请刷新重试</p></div>';
  });

  function initReport(){
  var proj = PROJECTS.find(function(p){ return p.id === PROJECT_ID; });

  if(!proj){
    el.innerHTML = '<div style="text-align:center;padding:40px 0;"><div style="width:56px;height:56px;border-radius:50%;background:#FEE2E2;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class="fas fa-circle-xmark" style="font-size:24px;color:#DC2626;"></i></div><p style="font-size:16px;font-weight:600;color:#292524;">项目未找到</p></div>';
    return;
  }

  var projContracts = CONTRACTS.filter(function(c){ return c.projectId === proj.id && c.status === 'active'; });
  var projReports = REV_REPORTS.filter(function(r){ return r.projectId === proj.id; });
  var shareRatio = proj.revenueShareRate || (projContracts.length > 0 ? projContracts[0].revenueShareRatio : 0);

  // Generate month options (from a reasonable start to current month)
  var now = new Date();
  var months = [];
  // Start from 2025-12 or project active date, go to current month
  var startYear = 2025, startMonth = 12;
  for(var y = startYear; y <= now.getFullYear(); y++){
    var mStart = (y === startYear) ? startMonth : 1;
    var mEnd = (y === now.getFullYear()) ? (now.getMonth() + 1) : 12;
    for(var m = mStart; m <= mEnd; m++){
      var key = y + '-' + String(m).padStart(2, '0');
      months.push({ key: key, label: y + '年' + m + '月' });
    }
  }
  months.reverse(); // Latest first

  function render(){
    // Reload merged data
    var allReports = REV_REPORTS.filter(function(r){ return r.projectId === proj.id; });
    allReports.sort(function(a,b){ return b.period.localeCompare(a.period); });

    var html = '';

    // 1. Project info
    html += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:16px;margin-bottom:12px;">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">';
    html += '<span style="font-size:18px;font-weight:600;color:#1C1917;">' + proj.name + '</span>';
    html += '<span style="background:#F0FDF4;color:#16a34a;border:1px solid #BBF7D0;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">运营中</span>';
    html += '</div>';
    html += '<div style="font-size:13px;color:#78716C;">参与人 ' + projContracts.length + ' 位 | 分成比例 ' + shareRatio + '%</div>';
    html += '</div>';

    // 2. Report form
    html += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:24px;margin-bottom:12px;border-top:3px solid #B91C1C;">';
    html += '<div style="font-size:18px;font-weight:600;color:#292524;margin-bottom:16px;">上报本期收入</div>';

    // Period select
    html += '<div style="margin-bottom:16px;">';
    html += '<label style="font-size:14px;font-weight:500;color:#292524;margin-bottom:6px;display:block;">报告期间</label>';
    html += '<select id="rpt-period" style="width:100%;background:#fff;appearance:none;-webkit-appearance:none;background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'10\\' height=\\'6\\'%3E%3Cpath d=\\'M0 0l5 6 5-6z\\' fill=\\'%2378716C\\'/%3E%3C/svg%3E&quot;);background-repeat:no-repeat;background-position:right 14px center;border:1px solid rgba(0,0,0,0.12);border-radius:12px;padding:14px 36px 14px 16px;font-size:15px;color:#1C1917;outline:none;cursor:pointer;font-family:inherit;">';
    months.forEach(function(m,i){
      var reported = allReports.find(function(r){ return r.period === m.key; });
      html += '<option value="' + m.key + '"' + (i===0?' selected':'') + '>' + m.label + (reported ? ' (已上报)' : '') + '</option>';
    });
    html += '</select></div>';

    // Revenue input
    html += '<div style="margin-bottom:16px;">';
    html += '<label style="font-size:14px;font-weight:500;color:#292524;margin-bottom:6px;display:block;">本期总收入</label>';
    html += '<div style="position:relative;">';
    html += '<input id="rpt-revenue" type="number" step="0.01" min="0" placeholder="请输入本期项目总收入" style="width:100%;background:#fff;border:1px solid rgba(0,0,0,0.12);border-radius:12px;padding:14px 52px 14px 16px;font-size:15px;color:#1C1917;outline:none;font-family:inherit;box-sizing:border-box;" />';
    html += '<span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:13px;color:#78716C;pointer-events:none;">万元</span>';
    html += '</div></div>';

    // Note
    html += '<div style="margin-bottom:16px;">';
    html += '<label style="font-size:14px;font-weight:500;color:#292524;margin-bottom:6px;display:block;">备注 <span style="font-size:12px;color:#A8A29E;">（选填）</span></label>';
    html += '<input id="rpt-note" type="text" placeholder="如有说明请填写" style="width:100%;background:#fff;border:1px solid rgba(0,0,0,0.12);border-radius:12px;padding:14px 16px;font-size:15px;color:#1C1917;outline:none;font-family:inherit;box-sizing:border-box;" />';
    html += '</div>';

    // Auto-calc area
    html += '<div id="rpt-calc" style="background:#FEF2F2;border-radius:12px;padding:16px;margin-top:16px;">';
    html += '<div style="font-size:15px;color:#B91C1C;font-weight:600;">本期分成总额: <span id="rpt-share-total">—</span></div>';
    html += '<div style="font-size:13px;color:#78716C;margin-top:4px;">将分配给 ' + projContracts.length + ' 位参与人</div>';
    html += '</div>';

    // Submit button
    html += '<button id="rpt-submit-btn" style="width:100%;height:48px;background:linear-gradient(135deg,#DC2626,#B91C1C);color:#fff;font-weight:700;font-size:16px;border:none;border-radius:12px;cursor:pointer;margin-top:16px;transition:transform 0.15s,box-shadow 0.25s;" onmouseover="this.style.transform=\\'translateY(-1px)\\';this.style.boxShadow=\\'0 6px 24px rgba(185,28,28,0.35)\\';" onmouseout="this.style.transform=\\'none\\';this.style.boxShadow=\\'none\\';">提交收入上报</button>';
    html += '</div>';

    // 3. History
    html += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:20px;margin-bottom:12px;">';
    html += '<div style="font-size:16px;font-weight:600;color:#292524;margin-bottom:12px;">历史上报</div>';
    if(allReports.length === 0){
      html += '<div style="text-align:center;padding:16px;color:#78716C;font-size:14px;">暂无上报记录</div>';
    } else {
      allReports.forEach(function(r){
        var yM = r.period.split('-');
        var label = yM[0] + '年' + parseInt(yM[1]) + '月';
        html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid #F5F5F4;">';
        html += '<span style="font-size:14px;color:#292524;">' + label + '</span>';
        html += '<span style="font-size:14px;font-weight:600;color:#292524;">收入 \\u00A5' + r.totalRevenue + '\\u4E07</span>';
        html += '<span style="font-size:14px;color:#D4A853;font-weight:600;">分成 \\u00A5' + r.totalShareAmount.toFixed(1) + '\\u4E07</span>';
        html += '</div>';
      });
    }
    html += '</div>';

    // 4. Distribution details (latest report)
    if(allReports.length > 0){
      var latestReport = allReports[0];
      var totalInvested = projContracts.reduce(function(s,c){ return s + c.amount; }, 0);
      var latestShareTotal = latestReport.totalRevenue * (shareRatio / 100);

      html += '<div style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 2px 8px rgba(0,0,0,0.03);padding:20px;margin-bottom:12px;">';
      html += '<div style="font-size:16px;font-weight:600;color:#292524;margin-bottom:12px;">本期分配明细</div>';
      projContracts.forEach(function(c){
        var ratio = totalInvested > 0 ? c.amount / totalInvested : 0;
        var share = latestShareTotal * ratio;
        var mem = MEMBERS.find(function(m){ return m.id === c.participantId; });
        var mName = c.participantName || (mem ? mem.name : '');
        var mComp = mem ? mem.company : '';

        html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #F5F5F4;">';
        html += '<div style="display:flex;align-items:center;gap:10px;">';
        html += '<div style="width:36px;height:36px;border-radius:50%;background:#B91C1C;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;">' + mName.charAt(0) + '</div>';
        html += '<div><div style="font-size:14px;font-weight:600;color:#1C1917;">' + mName + '</div><div style="font-size:12px;color:#78716C;">' + mComp + '</div></div>';
        html += '</div>';
        html += '<div style="text-align:right;">';
        html += '<div style="font-size:12px;color:#78716C;">投资 \\u00A5' + c.amount + '\\u4E07</div>';
        html += '<div style="font-size:14px;font-weight:600;color:#D4A853;">本期 \\u00A5' + share.toFixed(2) + '\\u4E07</div>';
        html += '</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    el.innerHTML = html;

    // Wire up events
    var revenueInput = document.getElementById('rpt-revenue');
    var shareTotalEl = document.getElementById('rpt-share-total');

    if(revenueInput){
      revenueInput.addEventListener('input', function(){
        var rev = parseFloat(revenueInput.value) || 0;
        var share = rev * (shareRatio / 100);
        shareTotalEl.textContent = share > 0 ? '\\u00A5' + share.toFixed(2) + '\\u4E07' : '\\u2014';
      });
    }

    var submitBtn = document.getElementById('rpt-submit-btn');
    if(submitBtn){
      submitBtn.addEventListener('click', function(){
        var period = document.getElementById('rpt-period').value;
        var revenue = parseFloat(document.getElementById('rpt-revenue').value);
        var note = document.getElementById('rpt-note').value.trim();

        if(!revenue || revenue <= 0){
          showToast('请输入本期收入', 'error');
          return;
        }

        // Check if already reported this period
        var existing = allReports.find(function(r){ return r.period === period; });
        if(existing){
          showToast('该期已上报过，请选择其他月份', 'error');
          return;
        }

        // Submit via API
        var submitBtn = document.getElementById('submit-btn');
        if(submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '提交中...'; }

        fetch('/api/admin/revenue-report/submit', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            projectId: proj.id,
            reportedBy: u.id,
            period: period,
            totalRevenue: revenue,
            note: note
          })
        }).then(function(r){return r.json();}).then(function(res){
          if(!res.ok){
            showToast(res.error || '提交失败', 'error');
            if(submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '确认提交'; }
            return;
          }

          // Refresh data from server
          Promise.all([
            fetch('/api/data/revenue-reports').then(function(r){return r.json();}),
            fetch('/api/data/repayment-records').then(function(r){return r.json();}),
            fetch('/api/data/contracts').then(function(r){return r.json();})
          ]).then(function(results){
            // Update local data arrays
            var newReports = results[0] || [];
            var newRepRecords = results[1] || [];
            var newContracts = results[2] || [];
            REV_REPORTS.length = 0;
            newReports.forEach(function(r){ REV_REPORTS.push(r); });
            REP_RECORDS.length = 0;
            newRepRecords.forEach(function(r){ REP_RECORDS.push(r); });
            // Update contract totalRepaid
            projContracts.forEach(function(c){
              var updated = newContracts.find(function(nc){ return nc.id === c.id; });
              if(updated) c.totalRepaid = updated.totalRepaid;
            });
          }).catch(function(){});

          // Show success
          var overlay = document.getElementById('report-success-overlay');
          overlay.classList.add('show');
          setTimeout(function(){
          overlay.classList.remove('show');
          render(); // re-render page
        }, 2000);
      });
    }
  }

  render();
  } // end initReport
})();
`}} />
    </div>,
    { title: '中流通 - 上报收入' }
  )
})
}
