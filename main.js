(function () {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  // Intro splash: dismiss once the page is ready, after a short minimum on-screen time.
  (function initSplash() {
    var splash = document.getElementById('mu-splash');
    var root = document.documentElement;
    if (!splash || root.classList.contains('mu-no-splash')) {
      root.classList.remove('mu-splash-lock');
      if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
      return;
    }

    var MIN_MS = 1400;   // let the logo animation finish
    var MAX_MS = 3200;   // hard cap on slow connections
    var start = Date.now();
    var done = false;

    function dismiss() {
      if (done) return;
      done = true;
      splash.classList.add('is-leaving');
      root.classList.remove('mu-splash-lock');
      window.scrollTo(0, 0);
      setTimeout(function () {
        if (splash.parentNode) splash.parentNode.removeChild(splash);
      }, 800);
    }

    function ready() {
      setTimeout(dismiss, Math.max(0, MIN_MS - (Date.now() - start)));
    }

    if (document.readyState === 'complete') ready();
    else window.addEventListener('load', ready);
    setTimeout(dismiss, MAX_MS);
  })();

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
      var words = ['Leadership', 'Integrity', 'Purpose'];
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

    // Phone inputs (intl-tel-input) -- applies to every tel field with a country selector
    var phoneInputs = document.querySelectorAll('input[type="tel"][data-intl-phone]');
    if (phoneInputs.length && window.intlTelInput) {
      phoneInputs.forEach(function (input) {
        window.intlTelInput(input, {
          initialCountry: 'in',
          separateDialCode: true,
          utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@23/build/js/utils.js',
        });
      });
    }

    // Milestones scrubber
    initMilestones();

    // Contact form
    initContactForm();

    // Hero enquiry form
    initHeroForm();
  });

  // ---- Shared form validation ----

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  // Accepts optional leading + and 7-15 digits total, allowing spaces/dashes/parens as separators.
  var PHONE_RE = /^\+?[0-9()\-\s]{7,20}$/;
  // Letters (incl. accented), spaces, apostrophes, hyphens and periods -- no digits.
  var NAME_RE = /^[\p{L}][\p{L}\s.'-]*$/u;

  function fieldLabel(input) {
    if (input.name === 'name') return 'name';
    if (input.name === 'email') return 'email address';
    if (input.name === 'phone') return 'phone number';
    if (input.name === 'message') return 'message';
    return 'field';
  }

  function validateField(input) {
    var value = input.value.trim();
    var required = input.hasAttribute('required');

    if (!value) {
      if (required) return 'Please enter your ' + fieldLabel(input) + '.';
      return '';
    }

    if (input.type === 'email' && !EMAIL_RE.test(value)) {
      return 'Please enter a valid email address.';
    }

    if (input.name === 'name' && !NAME_RE.test(value)) {
      return 'Please enter a valid name (letters only).';
    }

    if (input.type === 'tel') {
      var digits = value.replace(/[^0-9]/g, '');
      if (!PHONE_RE.test(value) || digits.length < 7 || digits.length > 15) {
        return 'Please enter a valid phone number.';
      }
    }

    var minLength = input.getAttribute('minlength');
    if (minLength && value.length < parseInt(minLength, 10)) {
      if (input.tagName === 'TEXTAREA') {
        return 'Please provide a bit more detail (' + minLength + '+ characters).';
      }
      return 'Please enter at least ' + minLength + ' characters.';
    }

    var maxLength = input.getAttribute('maxlength');
    if (maxLength && value.length > parseInt(maxLength, 10)) {
      return 'Please keep this under ' + maxLength + ' characters.';
    }

    return '';
  }

  function showFieldError(input, message) {
    var errorEl = input.getAttribute('aria-describedby') ? document.getElementById(input.getAttribute('aria-describedby')) : null;
    if (message) {
      input.classList.add('form-field-invalid');
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('is-visible');
      }
    } else {
      input.classList.remove('form-field-invalid');
      input.removeAttribute('aria-invalid');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('is-visible');
      }
    }
  }

  function setupLiveValidation(form) {
    var fields = form.querySelectorAll('input[name], textarea[name]');
    fields.forEach(function (input) {
      if (input.name === 'name') {
        input.addEventListener('beforeinput', function (e) {
          if (e.data && /[0-9]/.test(e.data)) e.preventDefault();
        });
      }
      input.addEventListener('blur', function () {
        showFieldError(input, validateField(input));
      });
      input.addEventListener('input', function () {
        if (input.classList.contains('form-field-invalid')) {
          showFieldError(input, validateField(input));
        }
      });
    });
  }

  function validateForm(form) {
    var fields = form.querySelectorAll('input[name], textarea[name]');
    var firstInvalid = null;
    var isValid = true;

    fields.forEach(function (input) {
      var message = validateField(input);
      showFieldError(input, message);
      if (message) {
        isValid = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });

    var submitError = form.querySelector('[data-form-error]');
    if (submitError) {
      submitError.classList.toggle('is-visible', !isValid);
    }

    if (firstInvalid) firstInvalid.focus();

    return isValid;
  }

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

  function initContactForm() {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;
    var formPanel = document.querySelector('[data-contact-form-panel]');
    var successPanel = document.querySelector('[data-contact-success-panel]');
    setupLiveValidation(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(form)) return;
      if (formPanel) formPanel.style.display = 'none';
      if (successPanel) successPanel.style.display = 'block';
    });
  }

  function initHeroForm() {
    var form = document.querySelector('[data-hero-form]');
    if (!form) return;
    var successPanel = document.querySelector('[data-hero-success-panel]');
    setupLiveValidation(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(form)) return;
      form.style.display = 'none';
      if (successPanel) successPanel.style.display = 'block';
    });
  }
})();
