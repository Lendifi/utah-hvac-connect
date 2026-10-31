/* Utah HVAC Connect scroll mockup: vanilla JS, no dependencies. Progress p (0 hot, 1 cool) drives everything. */
(function () {
  var t = document.getElementById('navToggle'), l = document.getElementById('navLinks');
  t.addEventListener('click', function () { var o = l.classList.toggle('open'); t.setAttribute('aria-expanded', o ? 'true' : 'false'); });

  var root = document.documentElement, stage = document.getElementById('stage');
  var $ = function (id) { return document.getElementById(id); };
  var beats = [].slice.call(document.querySelectorAll('.beat'));
  var steps = [].slice.call(document.querySelectorAll('.step-track li'));
  var rooms = [].slice.call(document.querySelectorAll('.room'));
  var world = $('world'), turb = $('turb'), disp = $('disp');
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');

  function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mix(a, b, k) { a = hex(a); b = hex(b); return 'rgb(' + a.map(function (v, i) { return Math.round(v + (b[i] - v) * k); }).join(',') + ')'; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function ease(k) { return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  function band(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function fill(id, a, b, k) { var e = $(id); if (e) e.setAttribute('fill', mix(a, b, k)); }

  var lastP = -1, p = 0;
  function apply(raw) {
    p = raw;
    root.style.setProperty('--p', p.toFixed(4));
    var c = ease(band(p, .12, .88));          // color shift
    var air = band(p, .42, .8);               // airflow in
    var heat = 1 - band(p, .1, .62);          // heat effects out

    $('skyTop').setAttribute('stop-color', mix('#e8572a', '#4f9be0', c));
    $('skyBot').setAttribute('stop-color', mix('#ffc07a', '#d9efff', c));
    fill('mtnBack', '#b5553a', '#3d6a92', c); fill('mtnFront', '#8a3a26', '#22486c', c);
    fill('ground', '#b89a52', '#5f9e6e', c); fill('ground2', '#9c7f3e', '#4b8a5c', c);
    fill('tree1', '#9a8a3c', '#3f8f5a', c); fill('tree2', '#8b7b32', '#357a4c', c); fill('tree3', '#8b7b32', '#357a4c', c);
    fill('plant', '#7a8a3a', '#3f8f5a', c);
    fill('roof', '#5a3a2e', '#2b4a68', c); fill('attic', '#7a2f1d', '#3a5878', c);
    fill('wallOuter', '#e8c9a8', '#e7eef5', c); fill('slab', '#4a3226', '#2b3d52', c);
    fill('blanket', '#e46a3a', '#7cc7ff', c);
    fill('curtL', '#c94f0b', '#2b78bf', c); fill('curtR', '#c94f0b', '#2b78bf', c);
    rooms.forEach(function (r) { r.setAttribute('fill', mix('#ffc9a0', '#eef6ff', c)); });
    fill('thermoScreen', '#3a0f06', '#0f2740', c); fill('thermoLed', '#ff5a2a', '#46d39a', c);
    $('thermoTemp').setAttribute('fill', mix('#ff7a3d', '#9fd3ff', c));
    $('upTemp').setAttribute('fill', mix('#ff8a3d', '#9fd3ff', c));

    var up = Math.round(88 - 16 * c), main = Math.round(84 - 13 * c);
    $('upTemp').textContent = up + '°F';
    $('thermoTemp').textContent = main + '°';
    $('artChipText').textContent = p < .5 ? 'Stagnant air, ' + up + '°F upstairs' : 'Air moving, ' + up + '°F upstairs';
    $('artChip').classList.toggle('cool-state', p >= .5);

    var sun = $('sun'); sun.setAttribute('opacity', (1 - .55 * c).toFixed(3));
    sun.setAttribute('transform', 'translate(0 ' + (60 * c).toFixed(1) + ')');
    $('sunCore').setAttribute('r', (54 - 14 * c).toFixed(1));
    $('waves').setAttribute('opacity', heat.toFixed(3));
    $('motes').setAttribute('opacity', (heat * .9).toFixed(3));
    $('sweat').setAttribute('opacity', heat.toFixed(3));
    $('tint').setAttribute('opacity', (.45 * heat).toFixed(3));
    $('flow').setAttribute('opacity', air.toFixed(3));
    $('flowGlow').setAttribute('opacity', air.toFixed(3));
    var narrow = window.innerWidth <= 720;
    $('ctaLine').textContent = p < .6 ? (narrow ? 'HVAC problem?' : 'HVAC problem? Get matched with a local pro.') : (narrow ? 'Ready to fix it?' : 'Ready to fix it? Get matched with a local pro.');

    var s = 12 * heat;
    if (s < .25 || RM.matches) { if (world.hasAttribute('filter')) world.removeAttribute('filter'); }
    else { if (!world.hasAttribute('filter')) world.setAttribute('filter', 'url(#haze)'); disp.setAttribute('scale', s.toFixed(2)); }

    // copy beats
    var cur = p < .33 ? 0 : (p < .67 ? 1 : 2);
    steps.forEach(function (li, i) { li.classList.toggle('on', i <= cur); if (i === cur) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
    var ops = [1 - band(p, .26, .34), band(p, .3, .38) * (1 - band(p, .6, .68)), band(p, .64, .72)];
    beats.forEach(function (b, i) {
      if (RM.matches) { b.style.opacity = ''; b.style.transform = ''; return; }
      b.style.opacity = ops[i].toFixed(3);
      b.style.transform = 'translateY(' + ((1 - ops[i]) * 18).toFixed(1) + 'px)';
      b.style.pointerEvents = ops[i] > .5 ? 'auto' : 'none';
      b.setAttribute('aria-hidden', ops[i] > .5 ? 'false' : 'true');
    });
  }

  function progress() {
    var top = stage.getBoundingClientRect().top + window.scrollY;
    var hdr = 68, run = stage.offsetHeight - (window.innerHeight - hdr);
    return clamp((window.scrollY + hdr - top) / Math.max(run, 1), 0, 1);
  }

  var ticking = false;
  function onScroll() {
    if (RM.matches || ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; var q = progress(); if (Math.abs(q - lastP) > .0005) { lastP = q; apply(q); } });
  }

  // ambient loop: heat shimmer + condenser fan (fan speed rises with p)
  var ang = 0, last = performance.now(), fan = $('fan');
  function loop(now) {
    var dt = Math.min(64, now - last); last = now;
    if (!RM.matches) {
      ang = (ang + dt * (.04 + .9 * p)) % 360;
      fan.setAttribute('transform', 'rotate(' + ang.toFixed(1) + ' 796 604)');
      if (world.hasAttribute('filter')) {
        var w = now / 1000;
        turb.setAttribute('baseFrequency', (0.006 + 0.0015 * Math.sin(w * 1.3)).toFixed(4) + ' ' + (0.045 + 0.006 * Math.sin(w * 2.1)).toFixed(4));
      }
    }
    requestAnimationFrame(loop);
  }

  var MOB = window.matchMedia('(max-width: 720px)'), scene = $('scene');
  function frame() { scene.setAttribute('viewBox', MOB.matches ? '110 96 780 640' : '0 0 1000 760'); }
  if (MOB.addEventListener) MOB.addEventListener('change', function () { frame(); lastP = -1; onScroll(); });
  frame();
  function init() {
    if (RM.matches) { apply(1); return; }
    lastP = progress(); apply(lastP);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { lastP = -1; onScroll(); });
  if (RM.addEventListener) RM.addEventListener('change', init);
  init();
  requestAnimationFrame(loop);
})();
