/* ================================================
   ENGINE v3.3 — Performance-fixed behavior engine
   Fixes: scroll jank, mobile perf, startup speed
   ================================================ */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {

        // ========== AUTO-WRAP SECTION CONTENT ==========
        // Use DocumentFragment to batch DOM moves (reduces reflows)
        document.querySelectorAll('.section-content').forEach(function(content) {
            if (content.querySelector('.section-content-inner')) return;
            
            var wrapper = document.createElement('div');
            wrapper.className = 'section-content-inner';
            
            // Batch: move to fragment first (off-DOM = no reflows)
            var frag = document.createDocumentFragment();
            while (content.firstChild) {
                frag.appendChild(content.firstChild);
            }
            wrapper.appendChild(frag);
            content.appendChild(wrapper); // single reflow
        });

        // ========== TOAST ==========
        var toastEl = document.getElementById('toast');
        var toastMsg = document.getElementById('toastMsg');
        var toastTimer;

        function showToast(msg, icon) {
            if (!toastEl || !toastMsg) return;
            clearTimeout(toastTimer);
            toastMsg.textContent = msg;
            var iconEl = toastEl.querySelector('i');
            if (icon && iconEl) iconEl.className = 'fas fa-' + icon;
            toastEl.classList.add('show');
            toastTimer = setTimeout(function() {
                toastEl.classList.remove('show');
            }, 2500);
        }

        // ========== DARK MODE ==========
        var themeBtn = document.getElementById('themeToggle');
        var drawerThemeBtn = document.getElementById('drawerThemeToggle');

        function setTheme(dark) {
            document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
            localStorage.setItem('theme', dark ? 'dark' : 'light');
            var icon = dark ? 'fa-sun' : 'fa-moon';
            if (themeBtn) themeBtn.innerHTML = '<i class="fas ' + icon + '"></i>';
            if (drawerThemeBtn) drawerThemeBtn.innerHTML = '<i class="fas ' + icon + '"></i> Theme';
        }

        var saved = localStorage.getItem('theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(saved ? saved === 'dark' : prefersDark);

        if (themeBtn) {
            themeBtn.addEventListener('click', function() {
                var isDark = document.documentElement.getAttribute('data-theme') !== 'dark';
                setTheme(isDark);
                showToast(isDark ? 'Dark mode on' : 'Light mode on', isDark ? 'moon' : 'sun');
            });
        }
        if (drawerThemeBtn) {
            drawerThemeBtn.addEventListener('click', function() {
                if (themeBtn) themeBtn.click();
            });
        }

        // ========== MOBILE DRAWER ==========
        var menuBtn = document.getElementById('menuBtn');
        var drawer = document.getElementById('mobileDrawer');
        var overlay = document.getElementById('navOverlay');
        var drawerCloseBtn = document.getElementById('drawerClose');

        function openDrawer() {
            if (drawer) drawer.classList.add('active');
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeDrawer() {
            if (drawer) drawer.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (menuBtn) menuBtn.addEventListener('click', openDrawer);
        if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
        if (overlay) overlay.addEventListener('click', closeDrawer);

        var drawerPrintBtn = document.getElementById('drawerPrint');
        if (drawerPrintBtn) {
            drawerPrintBtn.addEventListener('click', function() {
                closeDrawer();
                setTimeout(function() { window.print(); }, 400);
            });
        }

        var drawerLinksEl = document.getElementById('drawerLinks');
        if (drawerLinksEl) {
            drawerLinksEl.querySelectorAll('a').forEach(function(link) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    closeDrawer();
                    var href = this.getAttribute('href');
                    var target = document.querySelector(href);
                    if (target) {
                        setTimeout(function() {
                            target.classList.add('visible');
                            var content = target.querySelector('.section-content');
                            var icon = target.querySelector('.collapse-icon');
                            if (content && content.classList.contains('collapsed')) {
                                content.classList.remove('collapsed');
                                if (icon) icon.classList.remove('collapsed');
                            }
                            window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
                        }, 300);
                    }
                });
            });
        }

        // ========== DESKTOP NAV SMOOTH SCROLL ==========
        var navLinksEl = document.getElementById('navLinks');
        if (navLinksEl) {
            navLinksEl.querySelectorAll('a').forEach(function(link) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    var href = this.getAttribute('href');
                    var target = document.querySelector(href);
                    if (target) {
                        target.classList.add('visible');
                        var content = target.querySelector('.section-content');
                        var icon = target.querySelector('.collapse-icon');
                        if (content && content.classList.contains('collapsed')) {
                            content.classList.remove('collapsed');
                            if (icon) icon.classList.remove('collapsed');
                        }
                        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
                    }
                });
            });
        }

        // ========== SCROLL PERFORMANCE FIX ==========
        // Cache section positions — avoid reading layout during scroll
        var progressBar = document.getElementById('scrollProgress');
        var navbar = document.getElementById('navbar');
        var fabTop = document.getElementById('fabTop');
        var scrollSections = document.querySelectorAll('.section[id]');
        var allNavLinks = document.querySelectorAll('#navLinks a, #drawerLinks a');
        var allSections = document.querySelectorAll('.section');

        // *** KEY FIX: Pre-calculate and cache positions ***
        var sectionPositions = [];

        function cacheSectionPositions() {
            sectionPositions = [];
            scrollSections.forEach(function(sec) {
                sectionPositions.push({
                    id: sec.id,
                    top: sec.offsetTop  // read layout ONCE, not per frame
                });
            });
        }

        // Build cache after layout settles
        cacheSectionPositions();
        // Rebuild on resize (positions change)
        var resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                cacheSectionPositions();
                forceRevealVisible();
            }, 250);
        });

        // *** SINGLE scroll listener — combines everything ***
        var ticking = false;
        var scrollEndTimer;

        window.addEventListener('scroll', function() {
            // --- rAF-throttled work ---
            if (!ticking) {
                requestAnimationFrame(function() {
                    var y = window.scrollY;
                    var h = document.documentElement.scrollHeight - window.innerHeight;

                    // Batch all WRITES together (no read-write-read cycle)
                    if (progressBar) progressBar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
                    if (navbar) navbar.classList.toggle('scrolled', y > 10);
                    if (fabTop) fabTop.classList.toggle('visible', y > 400);

                    // Use CACHED positions — zero reflow
                    var current = '';
                    for (var i = 0; i < sectionPositions.length; i++) {
                        if (y >= sectionPositions[i].top - 120) {
                            current = sectionPositions[i].id;
                        }
                    }
                    allNavLinks.forEach(function(a) {
                        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
                    });

                    ticking = false;
                });
                ticking = true;
            }

            // --- Debounced reveal (runs once after scroll stops) ---
            clearTimeout(scrollEndTimer);
            scrollEndTimer = setTimeout(forceRevealVisible, 150);

        }, { passive: true });

        // ========== FAB BUTTONS ==========
        if (fabTop) {
            fabTop.addEventListener('click', function() {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        var fabPrint = document.getElementById('fabPrint');
        if (fabPrint) {
            fabPrint.addEventListener('click', function() {
                window.print();
            });
        }

        var fabSave = document.getElementById('fabSave');
        if (fabSave) {
            fabSave.addEventListener('click', function() {
                if (fabSave._saving) return; // debounce rapid clicks
                fabSave._saving = true;
                var btn = this;
                btn.innerHTML = '<i class="fas fa-check"></i><span class="fab-tooltip">Saved!</span>';
                btn.style.background = '#27ae60';
                showToast('Progress saved!', 'check-circle');
                setTimeout(function() {
                    btn.innerHTML = '<i class="fas fa-save"></i><span class="fab-tooltip">Save</span>';
                    btn.style.background = '';
                    fabSave._saving = false;
                }, 2000);
            });
        }

        // ========== COLLAPSIBLE SECTIONS ==========
        document.querySelectorAll('.section-title').forEach(function(title) {
            var content = title.nextElementSibling;
            var icon = title.querySelector('.collapse-icon');
            if (!content || !content.classList.contains('section-content')) return;
            if (!icon) return;

            title.addEventListener('click', function() {
                var isCollapsed = content.classList.contains('collapsed');
                content.classList.toggle('collapsed');
                icon.classList.toggle('collapsed');

                // Recache positions after collapse animation finishes
                setTimeout(cacheSectionPositions, 400);
            });
        });

        // ========== EXERCISE ANSWER TOGGLES ==========
        document.querySelectorAll('.answer-reveal').forEach(function(el) {
            el.style.display = 'none';
        });

        document.querySelectorAll('.toggle-btn[data-target]').forEach(function(oldBtn) {
            var originalHTML = oldBtn.innerHTML;
            var label = originalHTML.indexOf('Solution') !== -1 ? 'Solution' : 'Answer';

            var newBtn = oldBtn.cloneNode(true);
            newBtn.innerHTML = '<i class="fas fa-eye"></i> Show ' + label;
            oldBtn.parentNode.replaceChild(newBtn, oldBtn);

            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var targetId = this.getAttribute('data-target');
                var answer = document.getElementById(targetId);
                if (!answer) return;
                var isHidden = answer.style.display !== 'block';
                answer.style.display = isHidden ? 'block' : 'none';
                this.innerHTML = isHidden ?
                    '<i class="fas fa-eye-slash"></i> Hide ' + label :
                    '<i class="fas fa-eye"></i> Show ' + label;

                // Recache after content size changes
                setTimeout(cacheSectionPositions, 100);
            });
        });

        // ========== SCROLL REVEAL ==========
        var revealObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.02,
            rootMargin: '50px 0px'
        });

        allSections.forEach(function(s) {
            revealObserver.observe(s);
        });

        // Optimized fallback — only checks non-visible sections
        function forceRevealVisible() {
            var viewportHeight = window.innerHeight;
            var remaining = 0;
            allSections.forEach(function(s) {
                if (s.classList.contains('visible')) return;
                remaining++;
                var rect = s.getBoundingClientRect();
                if (rect.top < viewportHeight + 100 && rect.bottom > -100) {
                    s.classList.add('visible');
                }
            });
            // All revealed — no need to keep checking
            if (remaining === 0) {
                clearTimeout(scrollEndTimer);
            }
        }

        setTimeout(forceRevealVisible, 100);
        setTimeout(forceRevealVisible, 500);
        setTimeout(forceRevealVisible, 1500);

        // ========== KEYBOARD SHORTCUTS ==========
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                window.print();
            }
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (fabSave) fabSave.click();
            }
            if (e.key === 'Escape') closeDrawer();
        });

    });
})();