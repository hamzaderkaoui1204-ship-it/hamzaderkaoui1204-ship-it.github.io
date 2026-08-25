/* CostCruncher premium runtime — taste-skill (Geist + Tailwind) */
(function () {
  'use strict';
  var D = window.CC_DATA;
  if (!D) return;

  function money(n) {
    if (!isFinite(n)) return '$0';
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  var form = document.getElementById('calc-form');
  var fields = document.getElementById('fields');
  var results = document.getElementById('results');

  function buildField(inp) {
    var wrap = document.createElement('div');
    wrap.className = 'space-y-1.5';
    var id = 'in-' + inp.id;
    var lab = document.createElement('label');
    lab.setAttribute('for', id);
    lab.className = 'block text-[13px] font-semibold text-ink';
    lab.innerHTML = inp.label + (inp.unit ? ' <span class="font-normal text-muted">(' + inp.unit + ')</span>' : '');
    var el;
    var baseInput = 'w-full h-11 px-3 rounded-xl border border-line bg-white text-[14px] placeholder:text-muted focus:outline-none focus:border-ink/20 focus:ring-4 focus:ring-ink/[0.04] transition';
    if (inp.type === 'select') {
      el = document.createElement('select');
      el.className = baseInput;
      inp.options.forEach(function (o) {
        var opt = document.createElement('option');
        opt.value = o.v;
        opt.textContent = o.l;
        if (o.v === inp.def) opt.selected = true;
        el.appendChild(opt);
      });
      wrap.appendChild(lab);
      el.id = id;
      wrap.appendChild(el);
    } else if (inp.type === 'checkbox') {
      wrap.className = 'flex items-center gap-3 py-1';
      el = document.createElement('input');
      el.type = 'checkbox';
      el.className = 'w-[18px] h-[18px] rounded border-line accent-accent';
      el.checked = !!inp.def;
      el.id = id;
      lab.className = 'text-[13px] font-medium text-ink cursor-pointer';
      wrap.appendChild(el);
      wrap.appendChild(lab);
    } else {
      el = document.createElement('input');
      el.type = 'number';
      el.className = baseInput;
      el.value = inp.def;
      if (inp.min != null) el.min = inp.min;
      if (inp.max != null) el.max = inp.max;
      if (inp.step != null) el.step = inp.step;
      if (inp.placeholder) el.placeholder = inp.placeholder;
      el.id = id;
      wrap.appendChild(lab);
      wrap.appendChild(el);
    }
    fields.appendChild(wrap);
  }

  D.inputs.forEach(buildField);

  function readValues() {
    var v = {};
    D.inputs.forEach(function (inp) {
      var el = document.getElementById('in-' + inp.id);
      if (inp.type === 'checkbox') v[inp.id] = el.checked;
      else if (inp.type === 'number') v[inp.id] = parseFloat(el.value) || 0;
      else v[inp.id] = el.value;
    });
    return v;
  }

  function fmt(n) {
    return '$' + (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function renderOriginal(r) {
    var html = '';
    if (r.total === 0) {
      html = '<div class="text-center py-10"><div class="w-10 h-10 rounded-full bg-bg border border-line grid place-items-center mx-auto text-muted">!</div><p class="mt-3 text-[14px] text-muted">' + (r.note || 'Nothing to estimate — check inputs.') + '</p></div>';
      results.innerHTML = html;
      return;
    }
    html += '<h3 class="text-[11px] tracking-[0.12em] font-semibold uppercase text-muted">Your estimate</h3>';
    html += '<div class="mt-3 rounded-2xl border border-line overflow-hidden bg-bg">';
    r.items.forEach(function (i) {
      html += '<div class="flex gap-4 justify-between items-start px-4 py-3 bg-white border-b border-line last:border-0"><div class="flex-1 min-w-0"><div class="text-[13.5px] font-medium leading-tight">' + i.label + '</div>' + (i.detail ? '<div class="text-[12px] text-muted leading-snug mt-0.5">' + i.detail + '</div>' : '') + '</div><div class="shrink-0 font-mono font-semibold text-[13.5px]">' + fmt(i.amount) + '</div></div>';
    });
    html += '</div>';
    html += '<div class="total mt-4 rounded-2xl bg-ink text-white p-5 flex items-end justify-between gap-4"><div><div class="text-[11px] tracking-[0.12em] font-semibold uppercase text-white/60">Estimated total</div><div class="text-[11px] text-white/50 mt-1">Updated 2026 • range below</div></div><strong class="text-[28px] font-extrabold tracking-tight leading-none font-mono">' + money(r.total) + '</strong></div>';
    html += '<div class="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3"><p class="text-[13px] font-medium text-emerald-800">Typical range: <strong>' + money(r.low) + ' – ' + money(r.high) + '</strong>' + (r.per && isFinite(r.per.value) ? ' <span class="font-normal text-emerald-700">(' + fmt(r.per.value) + ' ' + r.per.label + ')</span>' : '') + '</p></div>';
    if (r.note) html += '<div class="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-[13px] leading-relaxed text-amber-900">' + r.note + '</div>';
    html += '<p class="mt-3 text-[11px] text-muted">Link: <a href="' + location.href + '" class="text-accent font-medium hover:underline">' + D.title.replace(' Cost Calculator', '') + ' cost calculator</a> • Share this estimate</p>';
    results.innerHTML = html;
  }

  var logic;
  try { logic = eval('(' + D.logic + ')'); } catch (e) { console.error('logic parse failed', e); return; }

  var _origRender = renderOriginal;
  function render(r){
    _origRender(r);
    var strong = results.querySelector('.total strong');
    if(strong){
      strong.classList.remove('pop');
      void strong.offsetWidth;
      strong.classList.add('pop');
      var target = r.total;
      var start = null;
      function step(ts){
        if(!start) start=ts;
        var p = Math.min((ts-start)/420,1);
        var eased = 1 - Math.pow(1-p,3);
        strong.textContent = money(target * eased);
        if(p<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    try {
      var r = logic(readValues());
      if (r && r.items) render(r); else results.innerHTML = '<div class="text-center py-8 text-muted text-[14px]">Could not compute — check your inputs.</div>';
    } catch (err) {
      console.error(err);
      results.innerHTML = '<div class="text-center py-8 text-muted text-[14px]">Could not compute — check your inputs.</div>';
    }
  });

  try {
    var r0 = logic(readValues());
    if (r0 && r0.items && r0.total > 0) render(r0);
  } catch (e) { }

  // subtle reveal for new sections
  try{
    var style = document.createElement('style');
    style.textContent = '@keyframes pop{0%{transform:scale(1)}40%{transform:scale(1.04)}100%{transform:scale(1)}} .pop{animation:pop .45s cubic-bezier(.34,1.56,.64,1)}';
    document.head.appendChild(style);
  }catch(e){}
})();

// premium scroll reveal
(function(){
  try{
    var els = document.querySelectorAll('.prose h2, .prose p, .table-wrap, details');
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    },{threshold:0.12});
    els.forEach(function(el){ el.classList.add('reveal'); io.observe(el); });
  }catch(e){}
})();
