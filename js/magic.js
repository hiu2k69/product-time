const API="https://script.google.com/macros/s/AKfycbzyAAK-Su1xJv4CQ9GSiLYKhkG6UQN7oGaHO_mpzI3poStDs0O9mNhUzczqER8kk-5l_A/exec";
const PHASES=["FS","EP","FEP","PP","PS"];
const PHASE_COLORS={FS:"#378ADD",EP:"#1D9E75",FEP:"#BA7517",PP:"#D4537E",PS:"#534AB7"};
const PHASE_DAYS={FS:7,EP:10,FEP:14,PP:7,PS:5};
let chart,rawData=[],currentFilter=null,currentUnit='day',statusFilter=null,lang='zh';
let listTab={d:'active',m:'active'};
let hiddenStore={};
let noteStore={};
let currentNoteTarget=null;
try{ hiddenStore=JSON.parse(localStorage.getItem('hiddenItems')||'{}'); }catch(e){}
try{ noteStore=JSON.parse(localStorage.getItem('noteItems')||'{}'); }catch(e){}
function saveStore(){ try{localStorage.setItem('hiddenItems',JSON.stringify(hiddenStore));}catch(e){} }
function saveNotes(){ try{localStorage.setItem('noteItems',JSON.stringify(noteStore));}catch(e){} }

const T={
  zh:{
    appTitle:'📦 生产进度管理 PRO',btnCheck:'📋 进度检查',langLabel:'Tiếng Việt',langFlag:'🇻🇳',
    clearFilter:'✕ 清除',filterPrefix:'筛选：',formLabel:'新增产品',namePlaceholder:'产品名称...',
    notePlaceholder:'备注（选填）...',
    btnAdd:'+ 添加到计划',tabActive:'进行中',tabHidden:'已隐藏',listTotal:'共{n}个',
    previewEmpty:'填写信息以预览预计进度...',previewDays:'预计{n}天',previewEnd:'预计结束：',
    mobChart:'图表',mobList:'列表',mobAdd:'新增',mobCheck:'检查',
    popupTitle:'新增产品',popupCancel:'取消',popupSubmit:'+ 添加到计划',
    checkTitle:'📋 生产进度检查',alertOver:'逾期 ',alertSoon:'即将 ',alertOk:'正常 ',overRate:'逾期率',
    badgeOver:'逾期{n}天',badgeSoon:'剩{n}天',badgeOk:'正常',badgeDone:'已完成',
    hideBtn:'隐藏',unhideBtn:'恢复',delBtn:'删除',noteBtn:'备注',
    emptyMsg:'暂无数据',emptyFiltered:'无符合条件的产品',emptyHidden:'暂无隐藏产品',noData:'暂无产品数据',
    archiveTitle:'勾选已完成的阶段',
    checkOver:'🔴 已逾期（{n}）',checkSoon:'🟡 即将到期（{n}）',checkOk:'🟢 正常进行（{n}）',
    checkDetail:'阶段：{p} | 截止：{d} | 进度{pct}%',checkOverDays:'逾期{n}天',checkRemDays:'剩{n}天',
    summary:'总体概况',sumTotal:'总计：',sumOver:'逾期：',sumSoon:'即将：',sumOk:'正常：',sumRate:'逾期率：',
    tipStart:'开始：',tipEnd:'结束：',tipDays:'共计：',tipDaysUnit:' 天',
    tipOk:'✅ 正常',tipSoon:'⏰ 即将到期',tipOver:'⚠️ 已逾期',tipNotPlanned:'尚未安排',tipPhase:' 阶段',
    tooltipFrom:'→',tooltipOverdue:'逾期 ',tooltipLeft:'距今 ',alertMsg:'请填写完整信息！',
    notifTitle:'今日及近期事件',notifSub:'前后3天内有阶段正在/即将开始',
    notifSectionToday:'📅 今天到期',notifSection1d:'⏰ 明天',notifSection2d:'📌 后天',notifSection3d:'📍 3天后',
    notifSnooze:'🔕 稍后提醒',notifDismiss:'✓ 知道了',
    notifPhase:'阶段',notifDeadline:'截止',
    noteModalTitle:'更新备注',noteModalSub:'产品：',noteSave:'💾 保存',noteCancel:'取消',
    chipToday:'📅 前后3天事件: ',
  },
  vi:{
    appTitle:'📦 Quản Lý Tiến Độ Sản Xuất PRO',btnCheck:'📋 Kiểm tra tiến độ',langLabel:'中文',langFlag:'🇨🇳',
    clearFilter:'✕ Xóa lọc',filterPrefix:'Lọc: ',formLabel:'Thêm sản phẩm',namePlaceholder:'Tên sản phẩm...',
    notePlaceholder:'Ghi chú (tùy chọn)...',
    btnAdd:'+ Thêm vào kế hoạch',tabActive:'Đang chạy',tabHidden:'Đã ẩn',listTotal:'{n} sản phẩm',
    previewEmpty:'Nhập thông tin để xem trước tiến độ...',previewDays:'Dự kiến {n} ngày',previewEnd:'Dự kiến hoàn thành: ',
    mobChart:'Biểu đồ',mobList:'Danh sách',mobAdd:'Thêm',mobCheck:'Kiểm tra',
    popupTitle:'Thêm sản phẩm',popupCancel:'Hủy',popupSubmit:'+ Thêm vào kế hoạch',
    checkTitle:'📋 Kiểm Tra Tiến Độ Sản Xuất',alertOver:'Trễ hạn ',alertSoon:'Sắp đến hạn ',alertOk:'Bình thường ',overRate:'Tỷ lệ trễ',
    badgeOver:'Trễ {n} ngày',badgeSoon:'Còn {n} ngày',badgeOk:'Bình thường',badgeDone:'Hoàn thành',
    hideBtn:'Ẩn',unhideBtn:'Khôi phục',delBtn:'Xóa',noteBtn:'Ghi chú',
    emptyMsg:'Chưa có dữ liệu',emptyFiltered:'Không có sản phẩm phù hợp',emptyHidden:'Chưa có sản phẩm bị ẩn',noData:'Chưa có dữ liệu sản phẩm',
    archiveTitle:'Đánh dấu giai đoạn đã hoàn thành',
    checkOver:'🔴 Đã trễ hạn ({n})',checkSoon:'🟡 Sắp đến hạn ({n})',checkOk:'🟢 Đang tiến hành bình thường ({n})',
    checkDetail:'Giai đoạn: {p} | Hạn: {d} | Tiến độ {pct}%',checkOverDays:'Trễ {n} ngày',checkRemDays:'Còn {n} ngày',
    summary:'Tổng quan',sumTotal:'Tổng: ',sumOver:'Trễ hạn: ',sumSoon:'Sắp đến: ',sumOk:'Bình thường: ',sumRate:'Tỷ lệ trễ: ',
    tipStart:'Bắt đầu: ',tipEnd:'Kết thúc: ',tipDays:'Tổng cộng: ',tipDaysUnit:' ngày',
    tipOk:'✅ Bình thường',tipSoon:'⏰ Sắp đến hạn',tipOver:'⚠️ Đã trễ hạn',tipNotPlanned:'Chưa lên lịch',tipPhase:' giai đoạn',
    tooltipFrom:'→',tooltipOverdue:'Trễ ',tooltipLeft:'Còn ',alertMsg:'Vui lòng điền đầy đủ thông tin!',
    notifTitle:'Sự kiện hôm nay & sắp tới',notifSub:'Phase bắt đầu trong vòng ±3 ngày hôm nay',
    notifSectionToday:'📅 Hôm nay đến hạn',notifSection1d:'⏰ Ngày mai',notifSection2d:'📌 Ngày kia',notifSection3d:'📍 3 ngày nữa',
    notifSnooze:'🔕 Nhắc lại sau',notifDismiss:'✓ Đã biết',
    notifPhase:'Giai đoạn',notifDeadline:'Hạn',
    noteModalTitle:'Cập nhật ghi chú',noteModalSub:'Sản phẩm: ',noteSave:'💾 Lưu',noteCancel:'Hủy',
    chipToday:'📅 Sự kiện ±3 ngày: ',
  }
};
function t(key,...args){ let s=T[lang][key]||T.zh[key]||key; args.forEach(v=>{ s=s.replace(/\{[a-z]\}/,String(v)); }); return s; }
function toggleLang(){ lang=lang==='zh'?'vi':'zh'; applyLangUI(); renderAll(); }
function applyLangUI(){
  const $=id=>document.getElementById(id);
  $('app-title').textContent=t('appTitle');
  $('btn-check').textContent=t('btnCheck');
  $('lang-label').textContent=t('langLabel');
  document.querySelector('.lang-flag').textContent=t('langFlag');
  $('btn-clear-filter').textContent=t('clearFilter');
  $('d-form-label').textContent=t('formLabel');
  $('d-name').placeholder=t('namePlaceholder');
  $('d-note').placeholder=t('notePlaceholder');
  $('d-btn-add').textContent=t('btnAdd');
  $('p-form-title').textContent=t('popupTitle');
  $('p-name').placeholder=t('namePlaceholder');
  $('p-note').placeholder=t('notePlaceholder');
  $('p-btn-cancel').textContent=t('popupCancel');
  $('p-btn-submit').textContent=t('popupSubmit');
  $('check-modal-title').textContent=t('checkTitle');
  $('note-modal-title').textContent=t('noteModalTitle');
  $('note-btn-cancel').textContent=t('noteCancel');
  $('note-btn-save').textContent=t('noteSave');
  $('notif-title').textContent=t('notifTitle');
  $('notif-snooze-btn').textContent=t('notifSnooze');
  $('notif-dismiss-btn').textContent=t('notifDismiss');
  document.querySelectorAll('.tl-active').forEach(el=>el.textContent=t('tabActive'));
  document.querySelectorAll('.tl-hidden').forEach(el=>el.textContent=t('tabHidden'));
  document.querySelectorAll('.mob-label-chart').forEach(el=>el.textContent=t('mobChart'));
  document.querySelectorAll('.mob-label-list').forEach(el=>el.textContent=t('mobList'));
  document.querySelectorAll('.mob-label-add').forEach(el=>el.textContent=t('mobAdd'));
  document.querySelectorAll('.mob-label-check').forEach(el=>el.textContent=t('mobCheck'));
  ['d','p'].forEach(px=>{ let b=document.getElementById(px+'-preview'); if(b)b.innerHTML='<span>'+t('previewEmpty')+'</span>'; });
}

function switchTab(tab,panel){
  listTab[panel]=tab;
  ['active','hidden'].forEach(tp=>{
    let el=document.getElementById('tab-'+tp+'-'+panel);
    if(!el) return;
    el.classList.remove('active','tab-hidden-active');
    if(tp===tab) el.classList.add(tp==='hidden'?'tab-hidden-active':'active');
  });
  renderPanel(panel);
}

async function load(){
  try{ let r=await fetch(API); rawData=await r.json(); rawData.sort((a,b)=>new Date(a.date)-new Date(b.date)); }
  catch(e){ rawData=[]; }
  renderAll();
  checkAndShowNotif();
}
function renderAll(){ renderAlertBar(); renderPanel('d'); renderPanel('m'); drawChart(); }

async function doAdd(prefix){
  let name=document.getElementById(prefix+'-name').value.trim();
  let phase=document.getElementById(prefix+'-phase').value;
  let date=document.getElementById(prefix+'-date').value;
  let note=document.getElementById(prefix+'-note')?document.getElementById(prefix+'-note').value.trim():'';
  if(!name||!date){ alert(t('alertMsg')); return; }
  if(note){ noteStore[name]=note; saveNotes(); }
  let form=new URLSearchParams();
  form.append("action","create"); form.append("name",name); form.append("phase",phase); form.append("date",date);
  try{ await fetch(API,{method:"POST",body:form}); }catch(e){}
  document.getElementById(prefix+'-name').value='';
  document.getElementById(prefix+'-date').value='';
  if(document.getElementById(prefix+'-note')) document.getElementById(prefix+'-note').value='';
  document.getElementById(prefix+'-preview').innerHTML='<span>'+t('previewEmpty')+'</span>';
  if(prefix==='p') closeAddModal();
  load();
}

// NOTE FUNCTIONS
function openNoteModal(name){
  currentNoteTarget=name;
  document.getElementById('note-modal-title').textContent=t('noteModalTitle');
  document.getElementById('note-modal-sub').textContent=t('noteModalSub')+name;
  let txt=document.getElementById('note-modal-text');
  txt.value=noteStore[name]||'';
  updateNoteChar();
  document.getElementById('note-modal-bg').style.display='flex';
  setTimeout(()=>txt.focus(),100);
}
function closeNoteModal(){ document.getElementById('note-modal-bg').style.display='none'; currentNoteTarget=null; }
function updateNoteChar(){ let v=document.getElementById('note-modal-text').value; document.getElementById('note-char-count').textContent=v.length; }
function saveNote(){
  if(!currentNoteTarget) return;
  let val=document.getElementById('note-modal-text').value.trim();
  if(val) noteStore[currentNoteTarget]=val; else delete noteStore[currentNoteTarget];
  saveNotes();
  closeNoteModal();
  renderAll();
}

// NOTIFICATION FUNCTIONS
// Báo khi startDate của phase nằm trong [-3..+3] ngày so với hôm nay
// diff < 0 → phase sắp bắt đầu (tương lai), diff = 0 → hôm nay, diff > 0 → đã bắt đầu X ngày trước
// Ví dụ hôm nay 18/04: báo phase startDate từ 15/04 đến 21/04
let _notifSnoozed=false; // flag in-memory, tự reset khi refresh trang

function getUpcomingEvents(){
  let today=new Date(); today.setHours(0,0,0,0);
  let groups=getGroups(rawData);
  let events=[];
  Object.keys(groups).forEach(name=>{
    if(isHidden(name)) return;
    let phases=[...groups[name]].sort((a,b)=>new Date(a.date)-new Date(b.date));
    phases.forEach((ph,i)=>{
      let startD=new Date(ph.date); startD.setHours(0,0,0,0);
      // diff: dương = đã qua (past), 0 = hôm nay, âm = chưa tới (future)
      let diff=Math.round((today-startD)/86400000);
      if(diff>=-3 && diff<=3){
        let endD;
        if(i<phases.length-1){ endD=new Date(phases[i+1].date); }
        else { endD=new Date(startD); endD.setDate(endD.getDate()+PHASE_DAYS[ph.phase]); }
        endD.setHours(0,0,0,0);
        events.push({name,phase:ph.phase,startDate:startD,endDate:endD,diff,note:noteStore[name]||null,color:PHASE_COLORS[ph.phase]});
      }
    });
  });
  // Sắp xếp: hôm nay(0) → quá khứ gần(1,2,3) → tương lai gần(-1,-2,-3)
  events.sort((a,b)=>{
    let pa=Math.abs(a.diff)+(a.diff<0?0.5:0);
    let pb=Math.abs(b.diff)+(b.diff<0?0.5:0);
    return pa-pb||a.name.localeCompare(b.name);
  });
  return events;
}

function forceShowNotif(){
  _notifSnoozed=false;
  let events=getUpcomingEvents();
  if(!events.length) return;
  buildNotifDialog(events);
  document.getElementById('notif-overlay').style.display='flex';
}
function checkAndShowNotif(){
  if(_notifSnoozed) return;
  let events=getUpcomingEvents();
  if(!events.length) return;
  buildNotifDialog(events);
  document.getElementById('notif-overlay').style.display='flex';
}
function dismissNotif(){
  _notifSnoozed=true;
  document.getElementById('notif-overlay').style.display='none';
}
function snoozeNotif(){
  // Chỉ ẩn dialog, không snooze → chip vẫn còn để mở lại
  document.getElementById('notif-overlay').style.display='none';
}

function buildNotifDialog(events){
  const vi=lang==='vi';
  // Nhóm theo diff: -3,-2,-1,0,1,2,3
  let byDiff={};
  for(let d=-3;d<=3;d++) byDiff[d]=[];
  events.forEach(e=>{ if(byDiff[e.diff]!==undefined) byDiff[e.diff].push(e); });
  let totalToday=byDiff[0].length;
  document.getElementById('notif-icon').textContent=totalToday>0?'🔔':'📅';
  document.getElementById('notif-icon').className='notif-icon '+(totalToday>0?'today-icon':'soon-icon');
  document.getElementById('notif-sub').textContent=
    vi?`${events.length} giai đoạn trong vòng 3 ngày (trước & sau hôm nay)`
      :`共 ${events.length} 个阶段在今日前后3天内`;
  // Nhãn section theo diff
  function label(d){
    if(d===0)  return vi?'📅 Bắt đầu HÔM NAY':'📅 今天开始';
    if(d===1)  return vi?'▶ Đã bắt đầu hôm qua':'▶ 昨天已开始';
    if(d===2)  return vi?'▶ Đã bắt đầu 2 ngày trước':'▶ 2天前已开始';
    if(d===3)  return vi?'▶ Đã bắt đầu 3 ngày trước':'▶ 3天前已开始';
    if(d===-1) return vi?'⏰ Bắt đầu NGÀY MAI':'⏰ 明天开始';
    if(d===-2) return vi?'⏰ Bắt đầu ngày kia (sau 2 ngày)':'⏰ 后天开始';
    if(d===-3) return vi?'⏰ Bắt đầu sau 3 ngày':'⏰ 3天后开始';
    return '';
  }
  function badge(d){
    if(d===0)  return {txt:vi?'Hôm nay':'今天',         cls:'badge-today'};
    if(d===1)  return {txt:vi?'Hôm qua':'昨天',         cls:'badge-1d'};
    if(d===2)  return {txt:vi?'2 ngày trước':'2天前',   cls:'badge-2d'};
    if(d===3)  return {txt:vi?'3 ngày trước':'3天前',   cls:'badge-3d'};
    if(d===-1) return {txt:vi?'Ngày mai':'明天',        cls:'badge-1d'};
    if(d===-2) return {txt:vi?'Ngày kia':'后天',        cls:'badge-2d'};
    if(d===-3) return {txt:vi?'3 ngày nữa':'3天后',     cls:'badge-3d'};
    return {txt:'',cls:''};
  }
  let html='';
  // Thứ tự hiển thị: hôm nay → quá khứ gần → tương lai gần
  [0,1,2,3,-1,-2,-3].forEach(d=>{
    let arr=byDiff[d];
    if(!arr||!arr.length) return;
    let iCls=d===0?'ni-today':'ni-soon';
    html+=`<div class="notif-section"><div class="notif-section-label">${label(d)}</div>`;
    arr.forEach(ev=>{
      let dUnit=vi?' ngày':'天';
      let pDays=PHASE_DAYS[ev.phase]||0;
      let b=badge(d);
      html+=`<div class="notif-item ${iCls}">
        <div class="ni-dot" style="background:${ev.color}"></div>
        <div class="ni-body">
          <div class="ni-name">${ev.name}</div>
          <div class="ni-meta">
            <span style="color:${ev.color};font-weight:600">${ev.phase}</span>
            &nbsp;·&nbsp;${fmtFull(ev.startDate)} → ${fmtFull(ev.endDate)}&nbsp;(${pDays}${dUnit})
          </div>
          ${ev.note?`<div class="ni-note">📝 ${ev.note}</div>`:''}
        </div>
        <span class="ni-badge ${b.cls}">${b.txt}</span>
      </div>`;
    });
    html+='</div>';
  });
  document.getElementById('notif-body').innerHTML=html;
}

function isHidden(name){ return !!(hiddenStore[name]&&hiddenStore[name].hidden); }
function hideItem(name){ if(!hiddenStore[name]) hiddenStore[name]={completedPhases:{}}; hiddenStore[name].hidden=true; saveStore(); renderAll(); }
function unhideItem(name){ if(hiddenStore[name]) hiddenStore[name].hidden=false; saveStore(); renderAll(); }
function togglePhaseComplete(name,phase,checked){
  if(!hiddenStore[name]) hiddenStore[name]={hidden:true,completedPhases:{}};
  if(!hiddenStore[name].completedPhases) hiddenStore[name].completedPhases={};
  hiddenStore[name].completedPhases[phase]=checked;
  saveStore(); renderPanel('d'); renderPanel('m');
}
function deleteHiddenItem(name){
  delete hiddenStore[name]; delete noteStore[name];
  saveStore(); saveNotes();
  let idx=rawData.findIndex(o=>o.name===name);
  if(idx!==-1){
    let form=new URLSearchParams(); form.append("action","delete"); form.append("index",idx);
    try{ fetch(API,{method:"POST",body:form}); }catch(e){}
    load();
  } else { renderAll(); }
}

function getGroups(data){ let g={}; data.forEach(o=>{ if(!g[o.name]) g[o.name]=[]; g[o.name].push(o); }); return g; }
function getStatus(ds){
  let td=new Date(); td.setHours(0,0,0,0); let d=new Date(ds); d.setHours(0,0,0,0); let df=(d-td)/86400000;
  if(df<0) return {st:'over',diff:Math.abs(Math.floor(df))};
  if(df<=3) return {st:'soon',diff:Math.ceil(df)};
  return {st:'ok',diff:Math.ceil(df)};
}
function fmtDate(d){ return new Date(d).toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit'}); }
function fmtFull(d){ return new Date(d).toLocaleDateString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'}); }
function sortNames(names,groups){
  return [...names].sort((a,b)=>{
    let pa=groups[a]?[...groups[a]].sort((x,y)=>new Date(x.date)-new Date(y.date)):[];
    let pb=groups[b]?[...groups[b]].sort((x,y)=>new Date(x.date)-new Date(y.date)):[];
    let o={over:0,soon:1,ok:2};
    let sa=pa.length?getStatus(pa[pa.length-1].date).st:'ok';
    let sb=pb.length?getStatus(pb[pb.length-1].date).st:'ok';
    return o[sa]-o[sb];
  });
}
function getPhaseRange(phases,p){
  let found=phases.find(x=>x.phase===p); if(!found) return null;
  let startD=new Date(found.date);
  let nx=phases.find(x=>PHASES.indexOf(x.phase)>PHASES.indexOf(p));
  let endD=nx?new Date(nx.date):(()=>{ let e=new Date(startD); e.setDate(e.getDate()+PHASE_DAYS[p]); return e; })();
  return {startD,endD,days:Math.round((endD-startD)/86400000)};
}
function esc(s){ return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }

function renderAlertBar(){
  let groups=getGroups(rawData),over=0,soon=0,ok=0;
  Object.keys(groups).forEach(n=>{
    if(isHidden(n)) return;
    let ph=[...groups[n]].sort((a,b)=>new Date(a.date)-new Date(b.date));
    let last=ph[ph.length-1];
    let {st}=getStatus(last.date);
    if(st==='over') over++; else if(st==='soon') soon++; else ok++;
  });
  // Dùng getUpcomingEvents để đếm số sự kiện đang trong window 3 ngày
  let upcomingCount=getUpcomingEvents().length;
  let total=over+soon+ok;
  let bar=document.getElementById('alert-bar');
  if(!total){ bar.innerHTML=''; return; }
  bar.innerHTML=`
    ${upcomingCount>0?`<div class="alert-chip chip-today" onclick="forceShowNotif()"><div class="alert-dot pulse" style="background:#378ADD"></div>${t('chipToday')}${upcomingCount}</div>`:''}
    ${over>0?`<div class="alert-chip chip-over" onclick="filterStatus('over')"><div class="alert-dot pulse" style="background:#E24B4A"></div>${t('alertOver')}${over}</div>`:''}
    ${soon>0?`<div class="alert-chip chip-soon" onclick="filterStatus('soon')"><div class="alert-dot pulse" style="background:#ef9f27"></div>${t('alertSoon')}${soon}</div>`:''}
    ${ok>0?`<div class="alert-chip chip-ok"><div class="alert-dot" style="background:#5dcaa5"></div>${t('alertOk')}${ok}</div>`:''}
    <div style="margin-left:auto;font-size:11px;color:rgba(255,255,255,.35)">${t('overRate')} <span style="color:${over>0?'#f09595':'rgba(255,255,255,.35)'}">${Math.round(over/total*100)}%</span></div>`;
}
function filterStatus(st){ statusFilter=st; renderPanel('d'); renderPanel('m'); }

function buildPills(phases){
  return PHASES.map(p=>{
    let found=phases.find(x=>x.phase===p);
    let col=found?PHASE_COLORS[p]:'transparent';
    let tc=found?PHASE_COLORS[p]:'rgba(255,255,255,.22)';
    let bc=found?PHASE_COLORS[p]:'rgba(255,255,255,.1)';
    let tipHtml='';
    if(found){
      let rng=getPhaseRange(phases,p);
      let {st:ps}=getStatus(rng.endD.toISOString().split('T')[0]);
      let sc=ps==='over'?'tip-line-over':ps==='soon'?'tip-line-soon':'tip-line-ok';
      let stTxt=ps==='over'?t('tipOver'):ps==='soon'?t('tipSoon'):t('tipOk');
      tipHtml=`<span class="tip"><span style="font-weight:600;font-size:12px;color:${PHASE_COLORS[p]}">${p}${t('tipPhase')}</span>\n<hr class="tip-divider">${t('tipStart')}${fmtFull(rng.startD)}\n${t('tipEnd')}${fmtFull(rng.endD)}\n${t('tipDays')}${rng.days}${t('tipDaysUnit')}\n<span class="${sc}">${stTxt}</span></span>`;
    } else {
      tipHtml=`<span class="tip"><span style="color:rgba(255,255,255,.5)">${p}${t('tipPhase')}</span>\n<hr class="tip-divider"><span style="color:rgba(255,255,255,.35)">${t('tipNotPlanned')}</span></span>`;
    }
    return `<span class="phase-pill" style="background:${col}22;color:${tc};border:.5px solid ${bc}">${p}${tipHtml}</span>`;
  }).join('');
}

function buildActiveHTML(names,groups){
  let visible=names.filter(n=>!isHidden(n));
  if(!visible.length) return `<div class="empty-msg">${t('emptyMsg')}</div>`;
  let html='',any=false;
  visible.forEach(name=>{
    let phases=[...groups[name]].sort((a,b)=>new Date(a.date)-new Date(b.date));
    let last=phases[phases.length-1];
    let {st,diff}=getStatus(last.date);
    if(statusFilter&&st!==statusFilter) return;
    if(currentFilter&&name!==currentFilter) return;
    any=true;
    let bCls=st==='over'?'badge-over':st==='soon'?'badge-soon':'badge-ok';
    let bTxt=st==='over'?t('badgeOver',diff):st==='soon'?t('badgeSoon',diff):t('badgeOk');
    let rCls=st==='over'?'row-over':st==='soon'?'row-soon':'';
    let sel=currentFilter===name;
    let pct=Math.round(phases.length/PHASES.length*100);
    let barCol=st==='over'?'#E24B4A':st==='soon'?'#ef9f27':PHASE_COLORS[last.phase];
    let icon=st==='over'?'🔴':st==='soon'?'🟡':'🟢';
    let note=noteStore[name]||'';
    html+=`<div class="item-row ${rCls}${sel?' selected':''}" onclick="filterBy('${esc(name)}')">
      <div class="item-dot" style="background:${PHASE_COLORS[last.phase]||'#888'}"></div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <span style="font-size:13px">${icon}</span>
          <span class="item-name">${name}</span>
          <span class="badge ${bCls}">${bTxt}</span>
        </div>
        ${note?`<div class="item-note">📝 ${note}</div>`:''}
        <div style="display:flex;gap:4px;margin-bottom:5px;margin-top:${note?'5px':'0'};flex-wrap:wrap">${buildPills(phases)}</div>
        <div style="display:flex;align-items:center;gap:6px">
          <div style="flex:1;height:4px;background:rgba(255,255,255,.1);border-radius:99px">
            <div style="width:${pct}%;height:4px;background:${barCol};border-radius:99px"></div>
          </div>
          <span style="font-size:10px;color:rgba(255,255,255,.4);min-width:28px;text-align:right">${pct}%</span>
        </div>
      </div>
      <div class="act-btns">
        <button class="note-btn" onclick="event.stopPropagation();openNoteModal('${esc(name)}')">${t('noteBtn')}</button>
        <button class="hide-btn" onclick="event.stopPropagation();hideItem('${esc(name)}')">${t('hideBtn')}</button>
      </div>
    </div>`;
  });
  return any?html:`<div class="empty-msg">${t('emptyFiltered')}</div>`;
}

function buildHiddenHTML(hiddenNames,groups){
  if(!hiddenNames.length) return `<div class="empty-msg">${t('emptyHidden')}</div>`;
  let html='';
  hiddenNames.forEach(name=>{
    let phases=groups[name]?[...groups[name]].sort((a,b)=>new Date(a.date)-new Date(b.date)):[];
    let last=phases.length?phases[phases.length-1]:null;
    let pct=phases.length?Math.round(phases.length/PHASES.length*100):0;
    let cp=(hiddenStore[name]&&hiddenStore[name].completedPhases)||{};
    let doneCount=Object.values(cp).filter(Boolean).length;
    let allDone=doneCount===PHASES.length;
    let doneBadge=allDone?`<span class="badge badge-done">${t('badgeDone')}</span>`:doneCount>0?`<span class="badge" style="background:rgba(83,74,183,.2);color:#a89ef5">${doneCount}/${PHASES.length}</span>`:'';
    let note=noteStore[name]||'';
    let checkboxes=PHASES.map(ph=>{
      let hasPh=phases.find(x=>x.phase===ph);
      let isDone=!!cp[ph];
      let col=hasPh?PHASE_COLORS[ph]:'rgba(255,255,255,.25)';
      return `<label class="phase-check-item${isDone?' ph-done':''}" onclick="event.stopPropagation()">
        <input type="checkbox" ${isDone?'checked':''} onchange="togglePhaseComplete('${esc(name)}','${ph}',this.checked)">
        <span class="ph-label" style="color:${col}">${ph}</span>
      </label>`;
    }).join('');
    html+=`<div class="item-row row-archived">
      <div class="item-dot" style="background:#534AB7"></div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
          <span style="font-size:13px">📦</span>
          <span class="item-name">${name}</span>
          ${doneBadge}
        </div>
        ${note?`<div class="item-note">📝 ${note}</div>`:''}
        ${last?`<div style="font-size:10px;color:rgba(255,255,255,.35);margin-bottom:7px;margin-top:${note?'4px':'0'}">${last.phase} &nbsp;·&nbsp; ${fmtFull(last.date)} &nbsp;·&nbsp; ${pct}%</div>`:''}
        <div class="archive-phases">
          <div class="archive-phase-label">${t('archiveTitle')}</div>
          <div class="phase-check-row">${checkboxes}</div>
        </div>
      </div>
      <div class="act-btns">
        <button class="note-btn" onclick="event.stopPropagation();openNoteModal('${esc(name)}')">${t('noteBtn')}</button>
        <button class="unhide-btn" onclick="event.stopPropagation();unhideItem('${esc(name)}')">${t('unhideBtn')}</button>
        <button class="del-btn" onclick="event.stopPropagation();deleteHiddenItem('${esc(name)}')">${t('delBtn')}</button>
      </div>
    </div>`;
  });
  return html;
}

function renderPanel(panel){
  let groups=getGroups(rawData);
  let activeNames=sortNames(Object.keys(groups).filter(n=>!isHidden(n)),groups);
  let hiddenNames=Object.keys(hiddenStore).filter(n=>hiddenStore[n]&&hiddenStore[n].hidden);
  let ac=activeNames.length,hc=hiddenNames.length;
  document.querySelectorAll(`#cnt-active-${panel}`).forEach(el=>el.textContent=ac||'');
  document.querySelectorAll(`#cnt-hidden-${panel}`).forEach(el=>el.textContent=hc||'');
  let listId=panel==='d'?'d-list':'m-list';
  let el=document.getElementById(listId);
  if(!el) return;
  el.innerHTML=listTab[panel]==='active'?buildActiveHTML(activeNames,groups):buildHiddenHTML(hiddenNames,groups);
  if(panel==='d'){
    let fi=document.getElementById('filter-info'),fl=document.getElementById('filter-label');
    if(fi&&fl){ if(currentFilter){fi.style.display='flex';fl.textContent=t('filterPrefix')+currentFilter;}else{fi.style.display='none';} }
  }
}

function updatePreview(prefix){
  let name=document.getElementById(prefix+'-name').value.trim();
  let selPh=document.getElementById(prefix+'-phase').value;
  let dateVal=document.getElementById(prefix+'-date').value;
  let box=document.getElementById(prefix+'-preview');
  if(!name||!dateVal){ box.innerHTML='<span>'+t('previewEmpty')+'</span>'; return; }
  let si=PHASES.indexOf(selPh),rem=PHASES.slice(si);
  let total=rem.reduce((s,p)=>s+PHASE_DAYS[p],0);
  let today=new Date(); today.setHours(0,0,0,0);
  let cur=new Date(dateVal); cur.setHours(0,0,0,0);
  let end=new Date(cur); end.setDate(end.getDate()+total);
  let html=`<div style="font-size:11px;font-weight:500;margin-bottom:7px;color:rgba(255,255,255,.8)">${name} — ${t('previewDays',total)}</div>`;
  let d=new Date(cur);
  let dUnit=lang==='vi'?' ngày':'天';
  rem.forEach(ph=>{
    let s=new Date(d),e=new Date(d); e.setDate(e.getDate()+PHASE_DAYS[ph]);
    let ov=(e<today),bw=Math.round((PHASE_DAYS[ph]/total)*100),col=ov?'#E24B4A':PHASE_COLORS[ph];
    html+=`<div class="preview-row">
      <div class="preview-dot" style="background:${col}"></div>
      <span style="width:30px;font-size:10px;font-weight:500;color:${col}">${ph}</span>
      <div class="preview-bar" style="width:${bw}%;background:${col}"></div>
      <span style="font-size:10px;color:rgba(255,255,255,.4);margin-left:4px;white-space:nowrap">${fmtDate(s)}–${fmtDate(e)} (${PHASE_DAYS[ph]}${dUnit})</span>
    </div>`;
    d=new Date(e);
  });
  html+=`<div style="font-size:10px;color:rgba(255,255,255,.35);margin-top:6px">${t('previewEnd')}${fmtFull(end)}</div>`;
  box.innerHTML=html;
}

function mobSwitch(view){
  ['chart','list','add','check'].forEach(v=>{ let el=document.getElementById('mob-tab-'+v); if(el)el.classList.remove('active'); });
  let tab=document.getElementById('mob-tab-'+view); if(tab)tab.classList.add('active');
  let lv=document.getElementById('mob-list-view');
  if(view==='list') lv.classList.remove('hidden'); else lv.classList.add('hidden');
}
function openAddModal(){ document.getElementById('add-modal-bg').style.display='flex'; }
function closeAddModal(){ document.getElementById('add-modal-bg').style.display='none'; }

function openCheckModal(){
  let groups=getGroups(rawData);
  let names=Object.keys(groups).filter(n=>!isHidden(n));
  if(!names.length){ alert(t('noData')); return; }
  let over=[],soon=[],ok=[];
  names.forEach(name=>{
    let ph=[...groups[name]].sort((a,b)=>new Date(a.date)-new Date(b.date));
    let last=ph[ph.length-1],{st,diff}=getStatus(last.date);
    let pct=Math.round(ph.length/PHASES.length*100);
    let obj={name,phase:last.phase,date:last.date,diff,pct};
    if(st==='over') over.push(obj); else if(st==='soon') soon.push(obj); else ok.push(obj);
  });
  const block=(arr,cls,icon,col,titleKey,oKey,rKey)=>{
    if(!arr.length) return '';
    let s=`<div class="section-title">${t(titleKey,arr.length)}</div>`;
    arr.forEach(o=>{
      let note=noteStore[o.name]||'';
      s+=`<div class="check-row ${cls}">
        <span class="check-icon">${icon}</span>
        <div style="flex:1">
          <div class="check-name">${o.name}</div>
          <div class="check-detail">${t('checkDetail',o.phase,fmtFull(o.date),o.pct)}</div>
          ${note?`<div style="font-size:11px;color:rgba(55,138,221,.75);margin-top:3px">📝 ${note}</div>`:''}
          <div style="margin-top:5px;height:3px;background:rgba(255,255,255,.1);border-radius:99px">
            <div style="width:${o.pct}%;height:3px;background:${col};border-radius:99px"></div>
          </div>
        </div>
        <span class="check-days" style="color:${col}">${cls==='cr-over'?t(oKey,o.diff):t(rKey,o.diff)}</span>
      </div>`;
    });
    return s;
  };
  let html=block(over,'cr-over','⚠️','#E24B4A','checkOver','checkOverDays','checkRemDays')
    +block(soon,'cr-soon','⏰','#ef9f27','checkSoon','checkOverDays','checkRemDays')
    +block(ok,'cr-ok','✅','#1D9E75','checkOk','checkOverDays','checkRemDays');
  let total=names.length,or2=Math.round(over.length/total*100);
  html+=`<div style="margin-top:16px;padding:12px;background:rgba(255,255,255,.04);border-radius:8px;font-size:12px;color:rgba(255,255,255,.5)">
    <div style="margin-bottom:6px;font-weight:500;color:rgba(255,255,255,.7)">${t('summary')}</div>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <span>${t('sumTotal')}<b style="color:#fff">${total}</b></span>
      <span>${t('sumOver')}<b style="color:#f09595">${over.length}</b></span>
      <span>${t('sumSoon')}<b style="color:#ef9f27">${soon.length}</b></span>
      <span>${t('sumOk')}<b style="color:#5dcaa5">${ok.length}</b></span>
      <span>${t('sumRate')}<b style="color:${or2>30?'#f09595':or2>10?'#ef9f27':'#5dcaa5'}">${or2}%</b></span>
    </div>
  </div>`;
  document.getElementById('check-modal-body').innerHTML=html;
  document.getElementById('check-modal-bg').style.display='flex';
}
function closeCheckModal(){ document.getElementById('check-modal-bg').style.display='none'; }

function filterBy(name){ currentFilter=(currentFilter===name)?null:name; statusFilter=null; renderPanel('d'); renderPanel('m'); drawChart(); }
function clearFilter(){ currentFilter=null; statusFilter=null; renderPanel('d'); renderPanel('m'); drawChart(); }
function setZoom(u){
  currentUnit=u;
  ['day','week','month'].forEach(x=>document.getElementById('z-'+x).classList.remove('active'));
  document.getElementById('z-'+u).classList.add('active');
  drawChart();
}

function drawChart(){
  if(chart){ chart.destroy(); chart=null; }
  let ex=Chart.getChart('chart'); if(ex) ex.destroy();
  let data=rawData.filter(o=>!isHidden(o.name));
  if(currentFilter) data=data.filter(o=>o.name===currentFilter);
  let groups=getGroups(data);
  let labels=sortNames(Object.keys(groups),groups);
  if(!labels.length) return;
  let today=new Date(); today.setHours(0,0,0,0);
  let minDate=new Date(today.getFullYear(),today.getMonth(),1);
  let mob=window.innerWidth<=700;
  let datasets=[];
  PHASES.forEach(phase=>{
    let arr=[],bgColors=[];
    labels.forEach(name=>{
      let phases=[...groups[name]].sort((a,b)=>new Date(a.date)-new Date(b.date));
      let idx=phases.findIndex(p=>p.phase===phase);
      if(idx!==-1){
        let start=new Date(phases[idx].date);
        let end=idx<phases.length-1?new Date(phases[idx+1].date):(()=>{ let e=new Date(start); e.setDate(e.getDate()+2); return e; })();
        let {st}=getStatus(end.toISOString().split('T')[0]);
        let color=st==='over'?'#E24B4A':st==='soon'?'#ef9f27':PHASE_COLORS[phase];
        arr.push({x:[start,end],y:name}); bgColors.push(color);
      } else { arr.push({x:[new Date(0),new Date(0)],y:name}); bgColors.push('transparent'); }
    });
    datasets.push({label:phase,data:arr,backgroundColor:bgColors,borderRadius:4,borderSkipped:false});
  });
  let ctx=document.getElementById('chart').getContext('2d');
  chart=new Chart(ctx,{
    type:'bar',data:{labels,datasets},
    options:{
      indexAxis:'y',maintainAspectRatio:false,
      parsing:{xAxisKey:'x',yAxisKey:'y'},
      scales:{
        x:{type:'time',min:minDate,time:{unit:currentUnit},ticks:{color:'rgba(255,255,255,.5)',font:{size:mob?9:11},maxRotation:0},grid:{color:'rgba(255,255,255,.06)'}},
        y:{stacked:true,ticks:{color:(c)=>{
          let n=c.tick.label,g=getGroups(data);
          if(!g[n]) return 'rgba(255,255,255,.8)';
          let ph=[...g[n]].sort((a,b)=>new Date(a.date)-new Date(b.date));
          let {st}=getStatus(ph[ph.length-1].date);
          return st==='over'?'#f09595':st==='soon'?'#ef9f27':'rgba(255,255,255,.8)';
        },font:{size:mob?10:12}},grid:{display:false}}
      },
      plugins:{
        legend:{labels:{color:'rgba(255,255,255,.6)',font:{size:mob?9:11},boxWidth:8,boxHeight:8}},
        tooltip:{callbacks:{label:(c)=>{
          let d=c.raw;
          if(!d||!d.x||new Date(d.x[0]).getFullYear()===1970) return '';
          let s=new Date(d.x[0]),e=new Date(d.x[1]);
          let days=Math.round((e-s)/86400000);
          let toEnd=Math.round((e-new Date())/86400000);
          let dSfx=lang==='vi'?' ngày':'天';
          return [
            `${c.dataset.label}：${fmtFull(s)} ${t('tooltipFrom')} ${fmtFull(e)}（${days}${dSfx}）`,
            toEnd>=0?`${t('tooltipLeft')}${toEnd}${dSfx}`:`${t('tooltipOverdue')}${Math.abs(toEnd)}${dSfx}`
          ];
        }}}
      },
      onClick:(e,els)=>{ if(els.length) filterBy(labels[els[0].index]); }
    }
  });
}
window.onload=()=>{ applyLangUI(); load(); if(window.innerWidth<=700){ mobSwitch('list'); } };
window.addEventListener('resize',()=>{ drawChart(); });