/* Minimal nav script: mobile menu toggle only. */
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Close the menu after tapping a link (mobile).
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* Sticky sub-nav scroll-spy (Operations page). No-op on pages without .subnav. */
(function () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.subtab'));
  if (!tabs.length) return;

  var sections = tabs
    .map(function (t) { return document.querySelector(t.getAttribute('href')); })
    .filter(Boolean);

  function setActive(id) {
    tabs.forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('href') === '#' + id);
    });
    var active = document.querySelector('.subtab.active');
    if (active && active.parentNode.scrollWidth > active.parentNode.clientWidth) {
      active.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }

  if ('IntersectionObserver' in window) {
    var visible = {};
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
      var best = null, bestRatio = 0;
      sections.forEach(function (s) {
        if ((visible[s.id] || 0) > bestRatio) { bestRatio = visible[s.id]; best = s.id; }
      });
      if (best) setActive(best);
    }, { rootMargin: '-130px 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] });
    sections.forEach(function (s) { obs.observe(s); });
  }

  // Smooth-scroll on tab click and keep the URL hash in sync.
  tabs.forEach(function (t) {
    t.addEventListener('click', function (e) {
      var target = document.querySelector(t.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', t.getAttribute('href'));
      setActive(target.id);
    });
  });
})();

/* Lightbox — click any img.zoom to enlarge. No-op if none exist. */
(function () {
  var zoomables = document.querySelectorAll('img.zoom');
  if (!zoomables.length) return;

  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-label', 'Enlarged image');
  lb.innerHTML = '<span class="lb-close" aria-label="Close">&times;</span><img alt="" />';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img');

  function open(src, alt) {
    lbImg.src = src; lbImg.alt = alt || '';
    lb.classList.add('open'); document.body.style.overflow = 'hidden';
  }
  function close() { lb.classList.remove('open'); lbImg.src = ''; document.body.style.overflow = ''; }

  zoomables.forEach(function (img) {
    img.addEventListener('click', function () { open(img.currentSrc || img.src, img.alt); });
  });
  lb.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();

/* Scroll reveal + staggered card reveals. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = document.querySelectorAll('.reveal, .stagger');
  if (!els.length) return;
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('in'); });
    return;
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach(function (e) { obs.observe(e); });
})();

/* Expandable evidence (accordion) with smooth height + lazy-image recompute. */
(function () {
  var steps = document.querySelectorAll('.ev-step[data-accordion]');
  if (!steps.length) return;
  steps.forEach(function (step) {
    var head = step.querySelector('.ev-head');
    var panel = step.querySelector('.ev-panel');
    if (!head || !panel) return;
    head.setAttribute('aria-expanded', 'false');

    head.addEventListener('click', function () {
      var isOpen = step.classList.contains('open');
      if (!isOpen) {
        step.classList.add('open');
        head.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        var done = function () {
          if (step.classList.contains('open')) panel.style.maxHeight = 'none';
          panel.removeEventListener('transitionend', done);
        };
        panel.addEventListener('transitionend', done);
      } else {
        panel.style.maxHeight = panel.scrollHeight + 'px';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            step.classList.remove('open');
            head.setAttribute('aria-expanded', 'false');
            panel.style.maxHeight = '0px';
          });
        });
      }
    });

    panel.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('load', function () {
        if (step.classList.contains('open') && panel.style.maxHeight !== 'none') {
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  });
})();
