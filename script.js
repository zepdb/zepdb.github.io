document.addEventListener('DOMContentLoaded', function () {

  // ---------------------------------------------------------------------------
  // 1. Tab switching for code examples
  // ---------------------------------------------------------------------------
  var tabButtons = document.querySelectorAll('.code-tab');
  var tabPanels = document.querySelectorAll('.code-panel');

  function activateTab(targetId) {
    // Hide all panels
    tabPanels.forEach(function (panel) {
      panel.classList.add('hidden');
    });

    // Deactivate all tab buttons
    tabButtons.forEach(function (btn) {
      btn.classList.remove('active');
    });

    // Show the target panel
    var targetPanel = document.getElementById(targetId);
    if (targetPanel) {
      targetPanel.classList.remove('hidden');
    }

    // Activate the matching button
    var activeBtn = document.querySelector('.code-tab[data-tab="' + targetId + '"]');
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('data-tab');
      if (targetId) {
        activateTab(targetId);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Mobile navigation toggle
  // ---------------------------------------------------------------------------
  var mobileMenuBtn = document.getElementById('mobile-menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      mobileMenu.classList.toggle('hidden');
    });

    // Close menu when a link inside it is clicked
    var mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.add('hidden');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!mobileMenu.classList.contains('hidden')) {
        var isInsideMenu = mobileMenu.contains(e.target);
        var isMenuBtn = mobileMenuBtn.contains(e.target);
        if (!isInsideMenu && !isMenuBtn) {
          mobileMenu.classList.add('hidden');
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Scroll animations (reveal on scroll)
  // ---------------------------------------------------------------------------
  var revealSelectors = [
    '#features > div',
    '.compact-col',
    '.fieldset-card'
  ];

  var revealElements = document.querySelectorAll(revealSelectors.join(', '));

  revealElements.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
  });

  function revealEntry(entry) {
    var el = entry.target;
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var parent = entry.target.parentElement;
          var siblings = parent ? Array.prototype.slice.call(parent.children) : [];
          var index = siblings.indexOf(entry.target);
          var delay = index >= 0 ? index * 80 : 0;

          setTimeout(function () {
            revealEntry(entry);
          }, delay);

          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Sticky nav background (slightly more opaque on scroll)
  // ---------------------------------------------------------------------------
  var nav = document.querySelector('nav');
  var NAV_SCROLLED_CLASS = 'nav-scrolled';
  var scrollThreshold = 50;

  // Dark nav stays dark; just increase opacity and add subtle shadow on scroll
  var styleTag = document.createElement('style');
  styleTag.textContent =
    '.nav-scrolled { background-color: rgba(26, 26, 46, 0.98) !important; ' +
    'box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important; }';
  document.head.appendChild(styleTag);

  function updateNavBackground() {
    if (!nav) return;
    if (window.scrollY > scrollThreshold) {
      nav.classList.add(NAV_SCROLLED_CLASS);
    } else {
      nav.classList.remove(NAV_SCROLLED_CLASS);
    }
  }

  // Throttle scroll handler for performance
  var scrollTicking = false;
  function onScroll() {
    if (!scrollTicking) {
      window.requestAnimationFrame(function () {
        updateNavBackground();
        updateActiveNavLink();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateNavBackground();

  // ---------------------------------------------------------------------------
  // 5. Smooth scroll for anchor links (with nav offset)
  // ---------------------------------------------------------------------------
  var anchorLinks = document.querySelectorAll('a[href^="#"]');
  var navHeight = nav ? nav.offsetHeight : 64;

  anchorLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (!href || href === '#') return;

      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      var targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: 'smooth'
      });

      if (history.pushState) {
        history.pushState(null, '', href);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Active nav link highlighting on scroll
  // ---------------------------------------------------------------------------
  var sections = document.querySelectorAll('section[id]');
  var desktopNavLinks = document.querySelectorAll('nav .hidden.md\\:flex a[href^="#"]');
  var mobileNavLinks = mobileMenu
    ? mobileMenu.querySelectorAll('a[href^="#"]')
    : [];

  var allNavLinks = Array.prototype.slice.call(desktopNavLinks)
    .concat(Array.prototype.slice.call(mobileNavLinks));

  function setActiveLink(sectionId) {
    allNavLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === '#' + sectionId) {
        link.classList.add('text-white');
        link.classList.remove('text-gray-300');
      } else {
        link.classList.remove('text-white');
        link.classList.add('text-gray-300');
      }
    });
  }

  var currentActiveSection = null;

  function updateActiveNavLink() {
    var scrollPos = window.scrollY + navHeight + 100;
    var newActive = null;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var bottom = top + section.offsetHeight;
      if (scrollPos >= top && scrollPos < bottom) {
        newActive = section.id;
      }
    });

    if (newActive && newActive !== currentActiveSection) {
      currentActiveSection = newActive;
      setActiveLink(newActive);
    }

    if (window.scrollY < 100 && currentActiveSection !== null) {
      currentActiveSection = null;
      allNavLinks.forEach(function (link) {
        link.classList.remove('text-white');
        link.classList.add('text-gray-300');
      });
    }
  }

  updateActiveNavLink();

  // ---------------------------------------------------------------------------
  // 7. Performance bar animations (scroll-triggered)
  // ---------------------------------------------------------------------------
  var perfBars = document.querySelectorAll('.perf-bar[data-width]');

  if (perfBars.length > 0 && 'IntersectionObserver' in window) {
    var perfObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Animate all bars in this fieldset-card
          var container = entry.target;
          var bars = container.querySelectorAll('.perf-bar[data-width]');
          bars.forEach(function (bar, index) {
            setTimeout(function () {
              bar.style.width = bar.getAttribute('data-width') + '%';
            }, index * 150);
          });
          perfObserver.unobserve(container);
        }
      });
    }, {
      threshold: 0.3
    });

    // Observe each fieldset-card that contains perf bars
    var perfContainers = document.querySelectorAll('.fieldset-card');
    perfContainers.forEach(function (container) {
      if (container.querySelector('.perf-bar[data-width]')) {
        perfObserver.observe(container);
      }
    });
  } else {
    // Fallback: just show bars at full width
    perfBars.forEach(function (bar) {
      bar.style.width = bar.getAttribute('data-width') + '%';
    });
  }

});
