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

    // Dossier tab links: scroll to section without changing the URL hash
    var dossierTabs = document.querySelectorAll('.dossier-tab[href^="#"]');
    if (dossierTabs.length) {
      dossierTabs.forEach(function (link) {
        link.addEventListener('click', function (e) {
          var id = link.getAttribute('href').slice(1);
          var target = document.getElementById(id);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
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

    // Dossier nav horizontal scroll (drag + wheel)
    initDossierScroll();

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

    function goPrev() { goTo((active + milestones.length - 1) % milestones.length); }
    function goNext() { goTo((active + 1) % milestones.length); }

    trackItems.forEach(function (item, i) {
      item.addEventListener('click', function () { goTo(i); });
    });
    if (prevBtn) prevBtn.addEventListener('click', goPrev);
    if (nextBtn) nextBtn.addEventListener('click', goNext);

    // Swipe (touch / pen) to move between milestones
    var swipeArea = root.querySelector('[data-ms-swipe]') || root;
    var startX = 0, startY = 0, startT = 0, tracking = false, decided = false, horizontal = false;

    swipeArea.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { tracking = false; return; }
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startT = Date.now();
      tracking = true;
      decided = false;
      horizontal = false;
    }, { passive: true });

    swipeArea.addEventListener('touchmove', function (e) {
      if (!tracking || e.touches.length !== 1) return;
      var dx = e.touches[0].clientX - startX;
      var dy = e.touches[0].clientY - startY;
      // Lock the gesture to one axis once it clears the slop threshold,
      // so vertical page scrolling is never hijacked.
      if (!decided) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        decided = true;
        horizontal = Math.abs(dx) > Math.abs(dy);
      }
      if (horizontal && e.cancelable) e.preventDefault();
    }, { passive: false });

    swipeArea.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      if (!horizontal) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - startX;
      var elapsed = Date.now() - startT;
      // Commit on a long enough drag, or a short fast flick.
      if (Math.abs(dx) > 50 || (Math.abs(dx) > 25 && elapsed < 300)) {
        if (dx < 0) goNext(); else goPrev();
      }
    }, { passive: true });

    swipeArea.addEventListener('touchcancel', function () { tracking = false; }, { passive: true });

    render();
  }

  function initDossierScroll() {
    var el = document.querySelector('.dossier-scroll');
    if (!el) return;

    var prevBtn = document.querySelector('[data-dossier-prev]');
    var nextBtn = document.querySelector('[data-dossier-next]');
    var thumb = document.querySelector('[data-dossier-thumb]');

    function maxScroll() { return el.scrollWidth - el.clientWidth; }

    function updateUI() {
      var max = maxScroll();
      var scrollable = max > 2;

      if (prevBtn) prevBtn.disabled = !scrollable || el.scrollLeft <= 2;
      if (nextBtn) nextBtn.disabled = !scrollable || el.scrollLeft >= max - 2;

      if (thumb) {
        if (!scrollable) {
          thumb.style.width = '100%';
          thumb.style.left = '0';
        } else {
          var thumbWidth = Math.max(12, (el.clientWidth / el.scrollWidth) * 100);
          var travel = 100 - thumbWidth;
          var progress = el.scrollLeft / max;
          thumb.style.width = thumbWidth + '%';
          thumb.style.left = (travel * progress) + '%';
        }
      }
    }

    el.addEventListener('scroll', updateUI, { passive: true });
    window.addEventListener('resize', updateUI);

    if (prevBtn) prevBtn.addEventListener('click', function () {
      el.scrollBy({ left: -el.clientWidth * 0.6, behavior: 'smooth' });
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      el.scrollBy({ left: el.clientWidth * 0.6, behavior: 'smooth' });
    });

    // Vertical wheel scrolls the strip horizontally
    el.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (maxScroll() <= 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    }, { passive: false });

    // Links/text are natively draggable in most browsers, which hijacks
    // mousemove before our custom drag-to-scroll ever sees it.
    el.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // Click-and-drag scrolling for mouse users
    var isDown = false;
    var startX = 0;
    var startScroll = 0;
    var dragged = false;

    el.addEventListener('mousedown', function (e) {
      isDown = true;
      dragged = false;
      startX = e.pageX;
      startScroll = el.scrollLeft;
      el.classList.add('is-dragging');
    });
    window.addEventListener('mouseup', function () {
      if (!isDown) return;
      isDown = false;
      el.classList.remove('is-dragging');
    });
    window.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      var delta = e.pageX - startX;
      if (Math.abs(delta) > 4) dragged = true;
      el.scrollLeft = startScroll - delta;
    });
    // Suppress the tab click that follows a drag
    el.addEventListener('click', function (e) {
      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
      }
      dragged = false;
    }, true);

    updateUI();
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
