(function () {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  // Mobile menu toggle
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.hamburger-btn');
    var panel = document.querySelector('.mobile-panel');
    if (btn && panel) {
      btn.addEventListener('click', function () {
        var open = btn.classList.toggle('is-open');
        panel.classList.toggle('is-open', open);
      });
    }

    // Scroll-reveal animations
    var revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
      revealEls.forEach(function (el) { observer.observe(el); });
    }

    // Hero word cycler
    var heroWordEl = document.querySelector('.hero-word');
    if (heroWordEl) {
      var words = ['Leadership', 'Integrity', 'Stewardship'];
      var idx = 0;
      setInterval(function () {
        heroWordEl.classList.add('is-fading');
        setTimeout(function () {
          idx = (idx + 1) % words.length;
          heroWordEl.textContent = words[idx];
          heroWordEl.classList.remove('is-fading');
        }, 260);
      }, 2200);
    }

    // Animated stat counters
    var statEls = document.querySelectorAll('[data-stat-target]');
    if (statEls.length) {
      var animateStats = function () {
        var duration = 1400;
        var start = performance.now();
        var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
        var tick = function (now) {
          var p = Math.min(1, (now - start) / duration);
          var e = ease(p);
          statEls.forEach(function (el) {
            var target = parseInt(el.getAttribute('data-stat-target'), 10);
            el.textContent = Math.round(target * e);
          });
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      setTimeout(animateStats, 400);
    }

    // Phone input (intl-tel-input)
    var phoneInput = document.querySelector('#hero-phone-input');
    if (phoneInput && window.intlTelInput) {
      window.intlTelInput(phoneInput, {
        initialCountry: 'in',
        separateDialCode: true,
        utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@23/build/js/utils.js',
      });
    }

    // Milestones scrubber
    initMilestones();

    // Contact form
    initContactForm();
  });

  function initMilestones() {
    var root = document.querySelector('[data-milestones]');
    if (!root) return;

    var milestones = [
      { year: '2011', label: 'Group Inception', category: 'FOUNDATION', color: '#5B7FE0', colorRgb: '91,127,224',
        desc: 'Mahapatra Universal Limited was formally incorporated, establishing the cornerstone for a scalable, diversified multi-sector industrial conglomerate.' },
      { year: '2011-2023', label: 'Multi-Sector Expansion', category: 'DIVERSIFICATION', color: '#F27518', colorRgb: '242,117,24',
        desc: 'Scaled into five independent operating subsidiaries across 11 key verticals -- Engineering, Data Technology, Hospitality, and Asset Restructuring across 7 countries.' },
      { year: '2023', label: '₹1,100 Cr Strategic SpiceJet Stake', category: 'AVIATION CAPITAL', color: '#E0615C', colorRgb: '224,97,92',
        desc: 'Preeti and Harihara Mahapatra orchestrated an equity acquisition exceeding 21% in SpiceJet, supporting landmark capital restructuring in commercial aviation.' },
      { year: '2025', label: 'Odisha Pro T20 Franchise Ownership', category: 'SPORTS ASSET', color: '#4FC3A1', colorRgb: '79,195,161',
        desc: 'Acquired a marquee professional cricket franchise, backing premier regional sports development and infrastructure at Barabati Stadium.' },
      { year: '2025', label: 'SILGO Retail Limited Equity Investment', category: 'NSE LISTED ASSET', color: '#F2A15C', colorRgb: '242,161,92',
        desc: 'Completed a strategic capital infusion into the publicly listed jewellery powerhouse, strengthening group presence in luxury gems and retail commodities.' },
    ];

    var yearEl = root.querySelector('[data-ms-year]');
    var categoryEl = root.querySelector('[data-ms-category]');
    var titleEl = root.querySelector('[data-ms-title]');
    var descEl = root.querySelector('[data-ms-desc]');
    var progressEl = root.querySelector('[data-ms-progress]');
    var glowEl = root.querySelector('[data-ms-glow]');
    var prevBtn = root.querySelector('[data-ms-prev]');
    var nextBtn = root.querySelector('[data-ms-next]');
    var trackItems = root.querySelectorAll('[data-ms-item]');

    var active = 0;
    var fading = false;
    var fadeTimer = null;

    function render() {
      var m = milestones[active];
      var n = milestones.length;

      yearEl.textContent = m.year;
      yearEl.style.color = m.color;
      categoryEl.textContent = m.category;
      categoryEl.style.color = m.color;
      categoryEl.style.borderColor = 'rgba(' + m.colorRgb + ',0.35)';
      titleEl.textContent = m.label;
      descEl.textContent = m.desc;

      progressEl.style.width = (100 / n) + '%';
      progressEl.style.left = ((100 / n) * active) + '%';
      progressEl.style.background = m.color;

      glowEl.style.backgroundImage =
        'radial-gradient(circle at 12% 15%,rgba(' + m.colorRgb + ',0.3) 0%,transparent 45%),' +
        'radial-gradient(circle at 88% 85%,rgba(' + m.colorRgb + ',0.22) 0%,transparent 45%)';

      trackItems.forEach(function (item, i) {
        var isActive = i === active;
        item.classList.toggle('is-active', isActive);
        var dot = item.querySelector('.ms-dot');
        dot.style.background = milestones[i].color;
        dot.style.boxShadow = isActive ? '0 0 0 5px rgba(' + milestones[i].colorRgb + ',0.2)' : 'none';
      });
    }

    function setFading(v) {
      fading = v;
      [yearEl, categoryEl, titleEl, descEl].forEach(function (el) {
        el.classList.toggle('is-fading', v);
      });
    }

    function goTo(i) {
      if (i === active || fading) return;
      clearTimeout(fadeTimer);
      setFading(true);
      fadeTimer = setTimeout(function () {
        active = i;
        render();
        setFading(false);
      }, 220);
    }

    trackItems.forEach(function (item, i) {
      item.addEventListener('click', function () { goTo(i); });
    });
    if (prevBtn) prevBtn.addEventListener('click', function () {
      goTo((active + milestones.length - 1) % milestones.length);
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      goTo((active + 1) % milestones.length);
    });

    render();
  }

  function initContactForm() {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;
    var formPanel = document.querySelector('[data-contact-form-panel]');
    var successPanel = document.querySelector('[data-contact-success-panel]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (formPanel) formPanel.style.display = 'none';
      if (successPanel) successPanel.style.display = 'block';
    });
  }
})();
