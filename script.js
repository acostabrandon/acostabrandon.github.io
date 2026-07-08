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
