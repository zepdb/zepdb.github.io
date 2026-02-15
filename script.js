// ---------------------------------------------------------------------------
// 0. Copy-to-clipboard for hero install command
// ---------------------------------------------------------------------------
function copyInstallCommand() {
  var cmd = 'curl -sL https://zepdb.github.io/install.sh | sh';
  navigator.clipboard.writeText(cmd).then(function() {
    document.getElementById('copy-icon').classList.add('hidden');
    document.getElementById('check-icon').classList.remove('hidden');
    setTimeout(function() {
      document.getElementById('copy-icon').classList.remove('hidden');
      document.getElementById('check-icon').classList.add('hidden');
    }, 2000);
  });
}

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
  // 7. Pricing Calculator
  // ---------------------------------------------------------------------------
  var PRICING_DATA = {
    aws: {
      label: 'AWS',
      regions: [
        { id: 'us-east-1', label: 'US East (N. Virginia)', standard: 0.023, infrequent: 0.0125 },
        { id: 'us-west-2', label: 'US West (Oregon)', standard: 0.023, infrequent: 0.0125 },
        { id: 'eu-west-1', label: 'EU (Ireland)', standard: 0.023, infrequent: 0.0125 },
        { id: 'eu-central-1', label: 'EU (Frankfurt)', standard: 0.0245, infrequent: 0.0131 },
        { id: 'ap-southeast-1', label: 'Asia Pacific (Singapore)', standard: 0.025, infrequent: 0.0138 },
        { id: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)', standard: 0.025, infrequent: 0.0138 }
      ],
      instances: [
        { id: 't2.micro', label: 't2.micro Free Tier (1 vCPU, 1 GB)', hourly: 0 },
        { id: 't3.medium', label: 't3.medium (2 vCPU, 4 GB)', hourly: 0.0416 },
        { id: 't3.large', label: 't3.large (2 vCPU, 8 GB)', hourly: 0.0832 },
        { id: 't3.xlarge', label: 't3.xlarge (4 vCPU, 16 GB)', hourly: 0.1664 },
        { id: 'm5.large', label: 'm5.large (2 vCPU, 8 GB)', hourly: 0.096 },
        { id: 'm5.xlarge', label: 'm5.xlarge (4 vCPU, 16 GB)', hourly: 0.192 },
        { id: 'm5.2xlarge', label: 'm5.2xlarge (8 vCPU, 32 GB)', hourly: 0.384 },
        { id: 'r5.large', label: 'r5.large (2 vCPU, 16 GB)', hourly: 0.126 },
        { id: 'r5.xlarge', label: 'r5.xlarge (4 vCPU, 32 GB)', hourly: 0.252 },
        { id: 'r5.2xlarge', label: 'r5.2xlarge (8 vCPU, 64 GB)', hourly: 0.504 }
      ]
    },
    gcp: {
      label: 'GCP',
      regions: [
        { id: 'us-central1', label: 'Iowa (us-central1)', standard: 0.020, infrequent: 0.010 },
        { id: 'us-east1', label: 'S. Carolina (us-east1)', standard: 0.020, infrequent: 0.010 },
        { id: 'europe-west1', label: 'Belgium (europe-west1)', standard: 0.020, infrequent: 0.010 },
        { id: 'europe-west3', label: 'Frankfurt (europe-west3)', standard: 0.023, infrequent: 0.013 },
        { id: 'asia-east1', label: 'Taiwan (asia-east1)', standard: 0.023, infrequent: 0.013 },
        { id: 'asia-northeast1', label: 'Tokyo (asia-northeast1)', standard: 0.023, infrequent: 0.013 }
      ],
      instances: [
        { id: 'e2-micro', label: 'e2-micro Free Tier (0.25 vCPU, 1 GB)', hourly: 0 },
        { id: 'e2-medium', label: 'e2-medium (2 vCPU, 4 GB)', hourly: 0.0335 },
        { id: 'e2-standard-2', label: 'e2-standard-2 (2 vCPU, 8 GB)', hourly: 0.0670 },
        { id: 'e2-standard-4', label: 'e2-standard-4 (4 vCPU, 16 GB)', hourly: 0.1340 },
        { id: 'n2-standard-2', label: 'n2-standard-2 (2 vCPU, 8 GB)', hourly: 0.0971 },
        { id: 'n2-standard-4', label: 'n2-standard-4 (4 vCPU, 16 GB)', hourly: 0.1942 },
        { id: 'n2-standard-8', label: 'n2-standard-8 (8 vCPU, 32 GB)', hourly: 0.3884 },
        { id: 'n2-highmem-2', label: 'n2-highmem-2 (2 vCPU, 16 GB)', hourly: 0.1310 },
        { id: 'n2-highmem-4', label: 'n2-highmem-4 (4 vCPU, 32 GB)', hourly: 0.2620 }
      ]
    },
    azure: {
      label: 'Azure',
      regions: [
        { id: 'eastus', label: 'East US', standard: 0.018, infrequent: 0.01 },
        { id: 'westus2', label: 'West US 2', standard: 0.018, infrequent: 0.01 },
        { id: 'northeurope', label: 'North Europe', standard: 0.018, infrequent: 0.01 },
        { id: 'westeurope', label: 'West Europe', standard: 0.020, infrequent: 0.01 },
        { id: 'southeastasia', label: 'Southeast Asia', standard: 0.025, infrequent: 0.013 },
        { id: 'japaneast', label: 'Japan East', standard: 0.025, infrequent: 0.014 }
      ],
      instances: [
        { id: 'B1s', label: 'B1s Free Tier (1 vCPU, 1 GB)', hourly: 0 },
        { id: 'B2s', label: 'B2s (2 vCPU, 4 GB)', hourly: 0.0416 },
        { id: 'B2ms', label: 'B2ms (2 vCPU, 8 GB)', hourly: 0.0832 },
        { id: 'D2s_v5', label: 'D2s v5 (2 vCPU, 8 GB)', hourly: 0.096 },
        { id: 'D4s_v5', label: 'D4s v5 (4 vCPU, 16 GB)', hourly: 0.192 },
        { id: 'D8s_v5', label: 'D8s v5 (8 vCPU, 32 GB)', hourly: 0.384 },
        { id: 'E2s_v5', label: 'E2s v5 (2 vCPU, 16 GB)', hourly: 0.126 },
        { id: 'E4s_v5', label: 'E4s v5 (4 vCPU, 32 GB)', hourly: 0.252 },
        { id: 'E8s_v5', label: 'E8s v5 (8 vCPU, 64 GB)', hourly: 0.504 }
      ]
    },
    r2: {
      label: 'Cloudflare R2',
      regions: [
        { id: 'auto', label: 'Automatic (global)', standard: 0.015, infrequent: 0.01 }
      ],
      instances: [
        { id: 't3.medium', label: 't3.medium (2 vCPU, 4 GB)', hourly: 0.0416 },
        { id: 't3.large', label: 't3.large (2 vCPU, 8 GB)', hourly: 0.0832 },
        { id: 't3.xlarge', label: 't3.xlarge (4 vCPU, 16 GB)', hourly: 0.1664 },
        { id: 'm5.large', label: 'm5.large (2 vCPU, 8 GB)', hourly: 0.096 },
        { id: 'm5.xlarge', label: 'm5.xlarge (4 vCPU, 16 GB)', hourly: 0.192 },
        { id: 'm5.2xlarge', label: 'm5.2xlarge (8 vCPU, 32 GB)', hourly: 0.384 },
        { id: 'r5.large', label: 'r5.large (2 vCPU, 16 GB)', hourly: 0.126 },
        { id: 'r5.xlarge', label: 'r5.xlarge (4 vCPU, 32 GB)', hourly: 0.252 }
      ]
    }
  };

  var COMPETITORS = {
    'Weaviate':      { '1e6': 98,   '1e7': 755,   '1e8': 7321 },
    'TurboPuffer':   { '1e6': 64,   '1e7': 256,   '1e8': 1000 },
    'Qdrant Cloud':  { '1e6': 100,  '1e7': 400,   '1e8': 4000 },
    'Pinecone':      { '1e6': 70,   '1e7': 170,   '1e8': 1700 }
  };

  var HOURS_PER_MONTH = 730;
  var SQ8_BYTES_PER_COMPONENT = 1;
  var INDEX_OVERHEAD = 1.20;
  var BYTES_PER_GB = 1073741824;

  // Logarithmic slider: 0 → 1M, 50 → 10M, 100 → 1B
  function sliderToVectors(val) {
    var minLog = Math.log10(1e6);   // 6
    var maxLog = Math.log10(1e9);   // 9
    return Math.round(Math.pow(10, minLog + (maxLog - minLog) * (val / 100)));
  }

  function formatVectorCount(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(n % 1e9 === 0 ? 0 : 1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
    return n.toString();
  }

  function calculateStorageCost(vectors, dims, metadataBytes, pricePerGB) {
    var vectorBytes = vectors * dims * SQ8_BYTES_PER_COMPONENT;
    var metaBytes = vectors * metadataBytes;
    var totalBytes = (vectorBytes + metaBytes) * INDEX_OVERHEAD;
    var totalGB = totalBytes / BYTES_PER_GB;
    return totalGB * pricePerGB;
  }

  function calculateComputeCost(hourlyPrice, nodes) {
    return hourlyPrice * HOURS_PER_MONTH * nodes;
  }

  function formatCurrency(amount) {
    if (amount >= 10000) return '$' + (amount / 1000).toFixed(1) + 'K';
    if (amount >= 1000) return '$' + (amount / 1000).toFixed(1) + 'K';
    if (amount >= 100) return '$' + Math.round(amount);
    if (amount >= 1) return '$' + amount.toFixed(0);
    return '$' + amount.toFixed(2);
  }

  function interpolateCompetitorCost(competitor, vectorCount) {
    var tiers = [1e6, 1e7, 1e8];
    var prices = [
      competitor['1e6'],
      competitor['1e7'],
      competitor['1e8']
    ];

    if (vectorCount <= tiers[0]) return prices[0];
    if (vectorCount >= tiers[2]) return prices[2];

    // Find the two tiers to interpolate between
    var lowerIdx = 0;
    for (var i = 0; i < tiers.length - 1; i++) {
      if (vectorCount >= tiers[i] && vectorCount <= tiers[i + 1]) {
        lowerIdx = i;
        break;
      }
    }

    var logLower = Math.log10(tiers[lowerIdx]);
    var logUpper = Math.log10(tiers[lowerIdx + 1]);
    var logCount = Math.log10(vectorCount);
    var t = (logCount - logLower) / (logUpper - logLower);

    var priceLower = prices[lowerIdx];
    var priceUpper = prices[lowerIdx + 1];
    // Log-linear interpolation
    var logPriceLower = Math.log10(priceLower);
    var logPriceUpper = Math.log10(priceUpper);
    return Math.pow(10, logPriceLower + t * (logPriceUpper - logPriceLower));
  }

  // Calculator state
  var calcChart = null;
  var currentProvider = 'aws';

  function getSelectedRegion() {
    var el = document.getElementById('calc-region');
    return el ? el.value : '';
  }

  function getStoragePrice() {
    var provider = PRICING_DATA[currentProvider];
    var regionId = getSelectedRegion();
    var region = null;
    for (var i = 0; i < provider.regions.length; i++) {
      if (provider.regions[i].id === regionId) { region = provider.regions[i]; break; }
    }
    if (!region) region = provider.regions[0];
    var storageClass = document.getElementById('calc-storage-class').value;
    return storageClass === 'infrequent' ? region.infrequent : region.standard;
  }

  function getInstanceHourly() {
    var provider = PRICING_DATA[currentProvider];
    var instanceId = document.getElementById('calc-instance').value;
    for (var i = 0; i < provider.instances.length; i++) {
      if (provider.instances[i].id === instanceId) return provider.instances[i].hourly;
    }
    return provider.instances[0].hourly;
  }

  function flashUpdate(el) {
    el.classList.add('updated');
    setTimeout(function () { el.classList.remove('updated'); }, 400);
  }

  function recalculate() {
    var sliderVal = parseInt(document.getElementById('calc-vectors').value, 10);
    var vectors = sliderToVectors(sliderVal);
    var dims = parseInt(document.getElementById('calc-dims').value, 10);
    var meta = parseInt(document.getElementById('calc-meta').value, 10);
    var nodes = parseInt(document.getElementById('calc-nodes').value, 10);

    document.getElementById('calc-vectors-display').textContent = formatVectorCount(vectors);

    var storagePrice = getStoragePrice();
    var storageCost = calculateStorageCost(vectors, dims, meta, storagePrice);
    var computeCost = calculateComputeCost(getInstanceHourly(), nodes);
    var totalCost = storageCost + computeCost;

    var storageEl = document.getElementById('calc-cost-storage');
    var computeEl = document.getElementById('calc-cost-compute');
    var totalEl = document.getElementById('calc-cost-total');

    storageEl.textContent = formatCurrency(storageCost);
    computeEl.textContent = formatCurrency(computeCost);
    totalEl.textContent = formatCurrency(totalCost) + '/mo';

    flashUpdate(storageEl);
    flashUpdate(computeEl);

    updateChart(totalCost, vectors);
  }

  function populateDropdown(selectId, items, labelKey, valueKey) {
    var el = document.getElementById(selectId);
    el.innerHTML = '';
    for (var i = 0; i < items.length; i++) {
      var opt = document.createElement('option');
      opt.value = items[i][valueKey];
      opt.textContent = items[i][labelKey];
      el.appendChild(opt);
    }
  }

  function switchProvider(key) {
    currentProvider = key;
    var provider = PRICING_DATA[key];

    // Update active tab
    var tabs = document.querySelectorAll('#calc-provider-tabs .calc-tab');
    tabs.forEach(function (tab) {
      if (tab.getAttribute('data-provider') === key) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Populate regions
    populateDropdown('calc-region', provider.regions, 'label', 'id');

    // Populate instances
    populateDropdown('calc-instance', provider.instances, 'label', 'id');

    // Hide/show storage class for R2
    var storageWrap = document.getElementById('calc-storage-class-wrap');
    if (key === 'r2') {
      storageWrap.style.display = 'none';
      document.getElementById('calc-storage-class').value = 'standard';
    } else {
      storageWrap.style.display = '';
    }

    recalculate();
  }

  function initChart() {
    var ctx = document.getElementById('calc-chart');
    if (!ctx) return;

    calcChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Zeppelin', 'TurboPuffer', 'Weaviate', 'Qdrant Cloud', 'Pinecone'],
        datasets: [{
          data: [0, 0, 0, 0, 0],
          backgroundColor: [
            'rgba(232, 89, 12, 0.85)',
            'rgba(209, 213, 219, 0.6)',
            'rgba(209, 213, 219, 0.6)',
            'rgba(209, 213, 219, 0.6)',
            'rgba(209, 213, 219, 0.6)'
          ],
          borderColor: [
            '#e8590c',
            '#9ca3af',
            '#9ca3af',
            '#9ca3af',
            '#9ca3af'
          ],
          borderWidth: 1,
          borderRadius: 3,
          barThickness: 32
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 300,
          easing: 'easeOutQuart'
        },
        layout: {
          padding: { right: 60 }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                return formatCurrency(context.raw) + '/mo';
              }
            },
            backgroundColor: 'rgba(26, 26, 46, 0.9)',
            titleFont: { family: "'JetBrains Mono', monospace", size: 12 },
            bodyFont: { family: "'JetBrains Mono', monospace", size: 12 },
            padding: 10,
            cornerRadius: 4
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { display: false },
            ticks: {
              font: { family: "'JetBrains Mono', monospace", size: 11 },
              color: '#888',
              callback: function (value) { return formatCurrency(value); }
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              font: { family: "'JetBrains Mono', monospace", size: 12, weight: '500' },
              color: '#1a1a2e'
            }
          }
        }
      },
      plugins: [{
        id: 'datalabels',
        afterDatasetsDraw: function (chart) {
          var ctx2 = chart.ctx;
          chart.data.datasets.forEach(function (dataset, i) {
            var meta = chart.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              var value = dataset.data[index];
              if (value === 0) return;
              ctx2.save();
              ctx2.font = "600 12px 'JetBrains Mono', monospace";
              ctx2.fillStyle = '#1a1a2e';
              ctx2.textAlign = 'left';
              ctx2.textBaseline = 'middle';
              ctx2.fillText(formatCurrency(value) + '/mo', bar.x + 8, bar.y);
              ctx2.restore();
            });
          });
        }
      }]
    });
  }

  function updateChart(zeppelinCost, vectorCount) {
    if (!calcChart) return;

    var entries = [{ name: 'Zeppelin', cost: zeppelinCost, isZeppelin: true }];
    var competitorNames = Object.keys(COMPETITORS);
    for (var i = 0; i < competitorNames.length; i++) {
      var name = competitorNames[i];
      entries.push({
        name: name,
        cost: interpolateCompetitorCost(COMPETITORS[name], vectorCount),
        isZeppelin: false
      });
    }

    // Sort cheapest to most expensive
    entries.sort(function (a, b) { return a.cost - b.cost; });

    var labels = [];
    var data = [];
    var bgColors = [];
    var borderColors = [];

    for (var j = 0; j < entries.length; j++) {
      labels.push(entries[j].name);
      data.push(Math.round(entries[j].cost * 100) / 100);
      if (entries[j].isZeppelin) {
        bgColors.push('rgba(232, 89, 12, 0.85)');
        borderColors.push('#e8590c');
      } else {
        bgColors.push('rgba(209, 213, 219, 0.6)');
        borderColors.push('#9ca3af');
      }
    }

    calcChart.data.labels = labels;
    calcChart.data.datasets[0].data = data;
    calcChart.data.datasets[0].backgroundColor = bgColors;
    calcChart.data.datasets[0].borderColor = borderColors;
    calcChart.update('active');
  }

  function initCalculator() {
    // Provider tab clicks
    var tabs = document.querySelectorAll('#calc-provider-tabs .calc-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        switchProvider(tab.getAttribute('data-provider'));
      });
    });

    // Slider input
    var slider = document.getElementById('calc-vectors');
    if (slider) {
      slider.addEventListener('input', recalculate);
    }

    // All selects
    ['calc-dims', 'calc-meta', 'calc-storage-class', 'calc-region', 'calc-instance'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', recalculate);
    });

    // Node stepper
    var nodesInput = document.getElementById('calc-nodes');
    var minusBtn = document.getElementById('calc-nodes-minus');
    var plusBtn = document.getElementById('calc-nodes-plus');

    if (minusBtn) {
      minusBtn.addEventListener('click', function () {
        var v = parseInt(nodesInput.value, 10);
        if (v > 1) { nodesInput.value = v - 1; recalculate(); }
      });
    }

    if (plusBtn) {
      plusBtn.addEventListener('click', function () {
        var v = parseInt(nodesInput.value, 10);
        if (v < 10) { nodesInput.value = v + 1; recalculate(); }
      });
    }

    // Initialize with AWS
    switchProvider('aws');
    initChart();
    recalculate();
  }

  // Only init if the calculator section exists on the page
  if (document.getElementById('calc-chart')) {
    initCalculator();
  }

  // ---------------------------------------------------------------------------
  // 8. Performance bar animations (scroll-triggered)
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
