/* CostCruncher calculator runtime — vanilla ES5, no dependencies */
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
    wrap.className = 'field';
    var id = 'in-' + inp.id;
    var lab = document.createElement('label');
    lab.setAttribute('for', id);
    lab.innerHTML = inp.label + (inp.unit ? ' <span class="unit">(' + inp.unit + ')</span>' : '');
    wrap.appendChild(lab);
    var el;
    if (inp.type === 'select') {
      el = document.createElement('select');
      inp.options.forEach(function (o) {
        var opt = document.createElement('option');
        opt.value = o.v;
        opt.textContent = o.l;
        if (o.v === inp.def) opt.selected = true;
        el.appendChild(opt);
      });
    } else if (inp.type === 'checkbox') {
      el = document.createElement('input');
      el.type = 'checkbox';
      el.checked = !!inp.def;
      wrap.className = 'field field-check';
      lab.htmlFor = id;
      el.id = id;
    } else {
      el = document.createElement('input');
      el.type = 'number';
      el.value = inp.def;
      if (inp.min != null) el.min = inp.min;
      if (inp.max != null) el.max = inp.max;
      if (inp.step != null) el.step = inp.step;
    }
    if (inp.type !== 'checkbox') el.id = id;
    wrap.insertBefore(el, lab);
    if (inp.type === 'checkbox') { wrap.appendChild(lab); }
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

  function render(r) {
    var html = '';
    if (r.total === 0) {
      html = '<div class="zero"><p>' + (r.note || 'Nothing to estimate.') + '</p></div>';
      results.innerHTML = html;
      return;
    }
    html += '<h2>Your estimate</h2><table class="line-items"><tbody>';
    r.items.forEach(function (i) {
      html += '<tr><td>' + i.label + (i.detail ? '<span class="detail">' + i.detail + '</span>' : '') + '</td><td class="amt">' + fmt(i.amount) + '</td></tr>';
    });
    html += '</tbody></table>';
    html += '<div class="total"><span>Estimated total</span><strong>' + money(r.total) + '</strong></div>';
    html += '<div class="range"><p>Typical range: <strong>' + money(r.low) + ' – ' + money(r.high) + '</strong>' +
      (r.per && isFinite(r.per.value) ? ' <span class="per">(' + fmt(r.per.value) + ' ' + r.per.label + ')</span>' : '') + '</p></div>';
    if (r.note) html += '<p class="note">' + r.note + '</p>';
    html += '<p class="share">Link: <a href="' + location.href + '">' + D.title.replace(' Cost Calculator', '') + ' cost calculator</a></p>';
    results.innerHTML = html;
  }

  var logic;
  try { logic = eval('(' + D.logic + ')'); } catch (e) { console.error('logic parse failed', e); return; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    try {
      var r = logic(readValues());
      if (r && r.items) render(r); else results.innerHTML = '<div class="placeholder"><p>Could not compute — check your inputs.</p></div>';
    } catch (err) {
      console.error(err);
      results.innerHTML = '<div class="placeholder"><p>Could not compute — check your inputs.</p></div>';
    }
  });

  // auto-run once with defaults so results are never empty
  try {
    var r0 = logic(readValues());
    if (r0 && r0.items && r0.total > 0) render(r0);
  } catch (e) { /* defaults may be invalid; ignore */ }

  // animate total on update
  var _origRender = render;
  render = function(r){
    _origRender(r);
    var strong = results.querySelector('.total strong');
    if(strong){
      strong.classList.remove('pop');
      void strong.offsetWidth;
      strong.classList.add('pop');
      // count-up
      var target = r.total;
      var cur = 0;
      var start = null;
      function step(ts){
        if(!start) start=ts;
        var p = Math.min((ts-start)/420,1);
        var eased = 1 - Math.pow(1-p,3);
        cur = target * eased;
        strong.textContent = money(cur);
        if(p<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  };
})();

// Global cool animations — scroll reveal, card stagger
(function(){
  try{
    var els = document.querySelectorAll('.cat-section, .prose h2, .prose p, .faq, .table-wrap');
    els.forEach(function(el){ el.classList.add('reveal'); });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    },{threshold:0.12});
    els.forEach(function(el){ io.observe(el); });
  }catch(e){}
})();
