/* Việt Mỹ demo — interactions (vanilla, no deps) */
(function(){
  "use strict";
  function $(s,c){return (c||document).querySelector(s);}
  function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}

  /* mobile nav drawer + generic scrim */
  function openEl(el){ if(el){el.classList.add("open"); var s=$("#scrim"); if(s)s.classList.add("open"); document.body.style.overflow="hidden";} }
  function closeAll(){ $$(".drawer.open").forEach(function(d){d.classList.remove("open");}); var s=$("#scrim"); if(s)s.classList.remove("open"); document.body.style.overflow=""; }
  $$("[data-open]").forEach(function(b){ b.addEventListener("click",function(){ openEl($("#"+b.getAttribute("data-open"))); }); });
  $$("[data-close]").forEach(function(b){ b.addEventListener("click",closeAll); });
  var scrim=$("#scrim"); if(scrim) scrim.addEventListener("click",closeAll);

  /* quantity stepper */
  $$(".qty .box").forEach(function(box){
    var inp=$("input",box);
    $$("button",box).forEach(function(btn){
      btn.addEventListener("click",function(){
        var v=parseInt(inp.value,10)||1;
        v += (btn.dataset.step==="up"?1:-1);
        if(v<1)v=1; inp.value=v;
      });
    });
  });

  /* product gallery thumbnails */
  var main=$("#galMain");
  var mainBox=main?main.closest(".main"):null;
  var galCap=mainBox?$(".gal-cap",mainBox):null;
  function galApply(t){
    if(main){ main.className = "imgph "+(t.dataset.tone||""); var lbl=$(".lbl",main); if(lbl&&t.dataset.label)lbl.textContent=t.dataset.label; }
    if(mainBox){
      var kind=t.dataset.kind||"";
      mainBox.classList.toggle("is-video",  kind==="video");
      mainBox.classList.toggle("is-caption",kind==="caption");
      if(galCap) galCap.textContent = kind==="caption" ? (t.dataset.caption||"") : "";
    }
  }
  $$(".gallery .thumbs .t").forEach(function(t){
    t.addEventListener("click",function(){
      $$(".gallery .thumbs .t").forEach(function(x){x.classList.remove("active");});
      t.classList.add("active");
      galApply(t);
    });
  });
  /* sync main view with the thumb that is active on load (video poster) */
  var galActive=$(".gallery .thumbs .t.active");
  if(galActive) galApply(galActive);

  /* single-select chip groups (sort, filter chips, review filter) */
  $$("[data-chipgroup]").forEach(function(group){
    group.addEventListener("click",function(e){
      var b=e.target.closest("button,.s"); if(!b||!group.contains(b))return;
      if(b.closest(".sortdd-menu"))return; /* để dropdown "Giá" tự xử lý, không tính là tab */
      $$("button,.s",group).forEach(function(x){x.classList.remove("active");});
      b.classList.add("active");
    });
  });

  /* thanh sắp xếp: dropdown "Giá" — sắp xếp lưới sản phẩm theo giá */
  function vmPriceOf(p){ return parseInt(String((p&&p.now)||"").replace(/[^\d]/g,""),10)||0; }
  function vmSortByPrice(dir){
    if(!window.VM_GRIDS)return;
    window.VM_GRIDS.forEach(function(g){
      if(g.items&&g.items.length) g.items.sort(function(a,b){
        return dir==="desc" ? vmPriceOf(b)-vmPriceOf(a) : vmPriceOf(a)-vmPriceOf(b);
      });
    });
    qvRenderGrids();
  }
  $$("[data-sortdd]").forEach(function(dd){
    var trigger=$(".s-trigger",dd), bar=dd.closest(".sortbar");
    function setOpen(v){ dd.classList.toggle("open",v); if(trigger)trigger.setAttribute("aria-expanded",v?"true":"false"); }
    if(trigger){
      trigger.addEventListener("click",function(){ setOpen(!dd.classList.contains("open")); });
      trigger.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); setOpen(!dd.classList.contains("open")); } });
    }
    $$(".sortdd-menu button",dd).forEach(function(opt){
      opt.addEventListener("click",function(){
        $$(".sortdd-menu button",dd).forEach(function(x){ x.classList.remove("sel"); });
        opt.classList.add("sel");
        if(bar) $$(".s",bar).forEach(function(x){ x.classList.remove("active"); });
        if(trigger) trigger.classList.add("active"); /* giữ tab "Giá" sáng khi đang sắp xếp theo giá */
        vmSortByPrice(opt.getAttribute("data-dir"));
        setOpen(false);
      });
    });
    document.addEventListener("click",function(e){ if(!dd.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown",function(e){ if(e.key==="Escape") setOpen(false); });
  });

  /* hàng chip cuộn ngang: nút mũi tên báo "còn danh mục ở sau" */
  $$(".chips.nowrap").forEach(function(row){
    /* bọc hàng chip để đặt nút mũi tên tuyệt đối ở mép phải */
    var wrap=document.createElement("div");
    wrap.className="chips-wrap";
    row.parentNode.insertBefore(wrap,row);
    wrap.appendChild(row);

    var more=document.createElement("button");
    more.type="button";
    more.className="chips-more";
    more.setAttribute("aria-label","Xem thêm danh mục");
    more.innerHTML='<span class="ci"><svg><use href="#ic-arrow"/></svg></span>';
    wrap.appendChild(more);

    /* ẩn mũi tên khi hàng chip không tràn hoặc đã cuộn tới cuối */
    function update(){
      var atEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;
      wrap.classList.toggle("at-end", atEnd);
    }
    more.addEventListener("click",function(){
      row.scrollBy({left: row.clientWidth * 0.8, behavior:"smooth"});
    });
    row.addEventListener("scroll",update,{passive:true});
    window.addEventListener("resize",update);
    /* web-font tải xong -> bề rộng chip đổi -> đo lại */
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(update);
    update();
  });

  /* collapsible filter groups (category sidebar) */
  $$(".filters .fgroup-h").forEach(function(h){
    h.addEventListener("click",function(){ h.parentNode.classList.toggle("collapsed"); });
  });

  /* clear all filters (category sidebar) */
  $$(".filters .clr").forEach(function(btn){
    btn.addEventListener("click",function(){
      var box=btn.closest(".filters");
      $$("input[type=checkbox],input[type=radio]",box).forEach(function(i){i.checked=false;});
    });
  });

  /* ============================================================
     Product cards + Quick View "Xem nhanh" (dùng chung 3 trang)
     Trang chỉ cần khai báo: window.VM_GRIDS=[{el:"gridId",items:[...]}]
     ============================================================ */
  function qvEsc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  var QV_REG={}, _qvid=0;
  function qvPrice(p){return '<span class="now">'+qvEsc(p.now)+'</span>'+(p.old?'<span class="old">'+qvEsc(p.old)+'</span>':'')+(p.off?'<span class="off">'+qvEsc(p.off)+'</span>':'');}
  function qvTags(p){return p.t.map(function(x,i){return '<span'+(i===2?' class="a"':'')+'>'+qvEsc(x)+'</span>';}).join('');}
  function qvCardTags(p){return '<span>'+qvEsc((p.t&&p.t[1])||'')+'</span>'+(p.kt?'<span>KT: '+qvEsc(p.kt)+'</span>':'')+(p.cl?'<span class="a">CL: '+qvEsc(p.cl)+'</span>':'');}
  function qvCard(p,best){
    var id='qv'+(_qvid++); QV_REG[id]=p;
    return '<article class="pcard"><div class="top"><a class="top-link" href="https://lanvi-commits.github.io/demo-trang-chu-mam-non-viet-my/product.html" tabindex="-1" aria-hidden="true"><div class="imgph '+(p.tone||'')+'"><svg><use href="#'+p.ic+'"/></svg></div></a>'+
      (p.off?'<span class="bdg">'+qvEsc(p.off)+'</span>':'')+
      (best?'<span class="bdg-best">Bán chạy</span>':'')+'</div>'+
      '<div class="body"><a class="name" href="https://lanvi-commits.github.io/demo-trang-chu-mam-non-viet-my/product.html">'+qvEsc(p.n)+'</a><div class="tags">'+qvCardTags(p)+'</div>'+
      '<div class="price">'+qvPrice(p)+'</div>'+
      '<div class="meta"><span class="star">★ '+p.r.toFixed(1)+'</span> <span>('+p.c+')</span> · <span>Đã bán '+qvEsc(p.sold)+'</span></div>'+
      '<div class="acts"><button class="btn btn-out qv-open" type="button" data-key="'+id+'"><svg><use href="#ic-eye"/></svg> Xem nhanh</button>'+
      '<button class="btn cart" aria-label="Thêm giỏ"><svg><use href="#ic-cart"/></svg></button></div>'+
      '<button type="button" class="quote"><svg><use href="#ic-doc"/></svg> Thêm vào báo giá</button></div></article>';
  }
  function qvThumbs(p){var t=['','mint','warm',''],o='';for(var k=0;k<4;k++){o+='<button type="button" class="qv-t'+(k===0?' active':'')+'"><span class="imgph '+t[k]+'"><svg><use href="#'+p.ic+'"/></svg></span></button>';}return o;}
  /* --- Quick View spec helpers: origin derived from tags, màu sắc as swatches --- */
  function qvHex(c){return /^#[0-9a-fA-F]{3,8}$/.test(String(c))?c:'#cbd5e1';}
  function qvSwatches(list){var a=(list&&list.length)?list:['#2b7fff','#22b366','#f4c430','#e8503a'];return a.slice(0,6).map(function(c){return '<i class="dot" style="background:'+qvHex(c)+'"></i>';}).join('');}
  function qvOrigin(p){return p.xx||(/nhập khẩu/i.test((p.t||[]).join(' '))?'Nhập khẩu':'Việt Nam');}
  function qvDesc(p){return p.desc||('Thiết bị vận động cho bé mầm non — khung nhựa nguyên sinh, bo góc an toàn, chắc chắn và dễ vệ sinh. Phù hợp lắp đặt tại trường học, khu vui chơi và gia đình.');}
  function qvBuild(p){
    var age=p.t[2]||'Mầm non';
    return '<div class="qv-card">'+
      '<div class="qv-media"><div class="qv-img imgph '+(p.tone||'')+'"><svg><use href="#'+p.ic+'"/></svg><span class="qv-badge'+(p.bn?' new':'')+'">'+qvEsc(p.b)+'</span></div>'+
        '<div class="qv-thumbs">'+qvThumbs(p)+'</div></div>'+
      '<div class="qv-info">'+
        '<div class="qv-tags">'+qvTags(p)+'</div>'+
        '<h2 class="qv-name">'+qvEsc(p.n)+'</h2>'+
        '<div class="qv-meta"><span class="star">★ '+p.r.toFixed(1)+'</span><span>('+p.c+' đánh giá)</span><span>· Đã bán '+qvEsc(p.sold)+'</span><span class="stock">Còn hàng</span></div>'+
        '<div class="qv-price">'+qvPrice(p)+'</div>'+
        '<p class="qv-desc">'+qvEsc(qvDesc(p))+'</p>'+
        '<ul class="qv-attrs">'+
          '<li><span><b>Độ tuổi phù hợp:</b> '+qvEsc(age)+'</span></li>'+
          '<li><span><b>Kích thước:</b> '+qvEsc(p.kt||'Đang cập nhật')+'</span></li>'+
          '<li><span><b>Chất liệu:</b> '+qvEsc(p.cl||'Đang cập nhật')+'</span></li>'+
          '<li><span><b>Xuất xứ:</b> '+qvEsc(qvOrigin(p))+'</span></li>'+
          '<li><span><b>Tiêu chuẩn:</b> <span class="qv-cert">'+qvEsc(p.td||'An toàn EN-71')+'</span></span></li>'+
          '<li class="qv-color"><span><b>Màu sắc:</b></span><span class="qv-sw" aria-label="Các màu có sẵn">'+qvSwatches(p.ms)+'</span></li>'+
        '</ul>'+
        '<div class="qv-buy"><div class="qv-qty"><button type="button" data-step="down" aria-label="Giảm">−</button><input value="1" inputmode="numeric" aria-label="Số lượng"><button type="button" data-step="up" aria-label="Tăng">+</button></div>'+
          '<button type="button" class="btn btn-green qv-quote"><svg><use href="#ic-doc"/></svg> Thêm vào báo giá</button>'+
          '<button type="button" class="btn btn-out qv-cart" aria-label="Thêm giỏ"><svg><use href="#ic-cart"/></svg></button></div>'+
        '<div class="qv-foot"><a class="qv-detail" href="https://lanvi-commits.github.io/demo-trang-chu-mam-non-viet-my/product.html">Xem chi tiết đầy đủ <svg><use href="#ic-arrow"/></svg></a></div>'+
      '</div></div>';
  }
  function qvEnsureHost(){
    if(document.getElementById("qvHost"))return;
    var box=document.createElement("div");
    box.innerHTML='<div class="qv-scrim" id="qvScrim"></div>'+
      '<div class="qv-host" id="qvHost" role="dialog" aria-modal="true" aria-label="Xem nhanh sản phẩm"><div class="qv-panel"><button class="qv-x" id="qvClose" type="button" aria-label="Đóng">✕</button><div class="qv-slot" id="qvSlot"></div></div></div>'+
      '<div class="qv-toast" id="qvToast" role="status" aria-live="polite"></div>';
    while(box.firstChild)document.body.appendChild(box.firstChild);
  }
  var _qvLastFocus=null, _qvToastT=null;
  function qvToast(msg){var t=document.getElementById("qvToast");if(!t)return;t.textContent=msg;t.classList.add("show");clearTimeout(_qvToastT);_qvToastT=setTimeout(function(){t.classList.remove("show");},1900);}
  function qvOpen(p){var h=document.getElementById("qvHost");if(!p||!h)return;document.getElementById("qvSlot").innerHTML=qvBuild(p);_qvLastFocus=document.activeElement;document.getElementById("qvScrim").classList.add("open");h.classList.add("open");requestAnimationFrame(function(){h.classList.add("in");});document.body.style.overflow="hidden";var f=h.querySelector(".qv-quote");if(f)f.focus();}
  function qvClose(){var h=document.getElementById("qvHost");if(!h||!h.classList.contains("open"))return;h.classList.remove("in");var s=document.getElementById("qvScrim");if(s)s.classList.remove("open");setTimeout(function(){h.classList.remove("open");var sl=document.getElementById("qvSlot");if(sl)sl.innerHTML="";},230);document.body.style.overflow="";if(_qvLastFocus&&_qvLastFocus.focus)_qvLastFocus.focus();}
  function qvAddQuote(){var pill=$(".pill-quote b");if(pill)pill.textContent=(parseInt(pill.textContent,10)||0)+1;qvToast("Đã thêm vào báo giá ✓");}
  function qvRenderGrids(){
    if(!window.VM_GRIDS)return;
    window.VM_GRIDS.forEach(function(g){
      var el=document.getElementById(g.el);
      var best=(g.el==="g-best");
      if(el&&g.items&&g.items.length)el.innerHTML=g.items.map(function(p){return qvCard(p,best);}).join("");
    });
  }
  qvEnsureHost();
  qvRenderGrids();
  document.addEventListener("click",function(e){
    var ob=e.target.closest(".qv-open"); if(ob){ qvOpen(QV_REG[ob.getAttribute("data-key")]); return; }
    if(e.target.closest("#qvClose")||e.target===document.getElementById("qvHost")){ qvClose(); return; }
    var step=e.target.closest(".qv-qty button");
    if(step){ var inp=step.parentNode.querySelector("input"); var v=parseInt(inp.value,10)||1; v+=(step.getAttribute("data-step")==="up"?1:-1); if(v<1)v=1; inp.value=v; return; }
    if(e.target.closest(".qv-quote")||e.target.closest(".pcard .quote")){ qvAddQuote(); return; }
    if(e.target.closest(".qv-cart")){ qvToast("Đã thêm vào giỏ ✓"); return; }
    var th=e.target.closest(".qv-thumbs .qv-t"); if(th){ var bx=th.closest(".qv-thumbs"); $$(".qv-t",bx).forEach(function(x){x.classList.remove("active");}); th.classList.add("active"); return; }
  });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape")qvClose(); });
})();
