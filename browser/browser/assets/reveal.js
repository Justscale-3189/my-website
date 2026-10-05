/* Scroll-reveal + draw-in motion for the Just Scale site.
   Content is visible by default; the reveal only ever adds an entrance
   animation, so nothing can be hidden by a failed observer. */
(function () {
  if (window.__jsRevealInstalled) return;
  window.__jsRevealInstalled = true;

  var css = [
    '@keyframes jsRise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}',
    '@keyframes jsFade{from{opacity:0}to{opacity:1}}',
    '@keyframes jsDrawX{from{transform:scaleX(0)}to{transform:scaleX(1)}}',
    '@keyframes jsSweep{0%{transform:translateX(-100%)}100%{transform:translateX(220%)}}',
    '@keyframes jsMark{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:none}}',
    '[data-reveal].js-armed{opacity:0}',
    '[data-reveal].js-in{animation:jsRise .72s cubic-bezier(.2,.72,.2,1) both}',
    '[data-reveal-stagger].js-armed>*,[data-reveal-rows].js-armed>*{opacity:0}',
    '[data-reveal-stagger].js-in>*,[data-reveal-rows].js-in>*{animation:jsRise .62s cubic-bezier(.2,.72,.2,1) both}',
    '.blueprint>.corner{animation:jsMark .5s ease-out both}',
    'a.js-lift,button.js-lift{transition:background .18s ease,color .18s ease,transform .18s ease,box-shadow .18s ease}',
    '[data-hover-row]{transition:background .2s ease}',
    '[data-hover-row]:hover{background:color-mix(in srgb, var(--color-accent) 7%, transparent)}',
    '[data-hover-card]{transition:background .2s ease,box-shadow .2s ease,transform .2s ease}',
    '[data-hover-card]:hover{background:color-mix(in srgb, var(--color-accent) 6%, transparent);box-shadow:var(--shadow-sm);transform:translateY(-2px)}',
    '@media (prefers-reduced-motion: reduce){.js-armed,.js-armed>*{opacity:1!important;animation:none!important}}'
  ].join('');

  for (var i = 1; i <= 14; i++) {
    css += '[data-reveal-stagger].js-in>*:nth-child(' + i + '),[data-reveal-rows].js-in>*:nth-child(' + i + '){animation-delay:' + (i - 1) * 0.07 + 's}';
  }

  var style = document.createElement('style');
  style.setAttribute('data-js-reveal', '');
  style.textContent = css;
  document.head.appendChild(style);

  var SEL = '[data-reveal],[data-reveal-stagger],[data-reveal-rows]';
  var pending = [];

  function play(el) {
    el.classList.remove('js-armed');
    el.classList.add('js-in');
  }

  function sweep() {
    var vh = window.innerHeight || 800;
    for (var i = pending.length - 1; i >= 0; i--) {
      var el = pending[i];
      if (!el.isConnected) { pending.splice(i, 1); continue; }
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.94) { play(el); pending.splice(i, 1); }
    }
  }

  function scan(root) {
    var nodes = root.querySelectorAll ? root.querySelectorAll(SEL) : [];
    Array.prototype.forEach.call(nodes, function (el) {
      if (el.__jsSeen) return;
      el.__jsSeen = true;
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      if (r.top < vh * 0.94) { el.classList.add('js-armed'); play(el); return; }
      el.classList.add('js-armed');
      pending.push(el);
      // Failsafe: whatever happens with scrolling, never leave content hidden.
      setTimeout(function () {
        var k = pending.indexOf(el);
        if (k > -1) { play(el); pending.splice(k, 1); }
      }, 4000);
    });
    sweep();
  }

  function boot() {
    scan(document);
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        Array.prototype.forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) scan(n); });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });

    ['scroll', 'resize', 'wheel', 'touchmove'].forEach(function (evt) {
      window.addEventListener(evt, sweep, { passive: true });
      document.addEventListener(evt, sweep, { passive: true, capture: true });
    });
    setInterval(sweep, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
