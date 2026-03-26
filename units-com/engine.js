/* ================================================
   ENGINE v3.2 — Robust behavior engine
   Fixes: collapse blank space, fast-scroll, 
   auto-wraps section-content for grid collapse
   ================================================ */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {

        // ========== AUTO-WRAP SECTION CONTENT ==========
        // CSS Grid 0fr collapse needs a SINGLE child wrapper
        // This wraps all children of .section-content in a .section-content-inner div
        document.querySelectorAll('.section-content').forEach(function(content) {
            // Skip if already wrapped
            if (content.querySelector('.section-content-inner')) return;
            
            var wrapper = document.createElement('div');
            wrapper.className = 'section-content-inner';
            
            // Move all children into wrapper
            while (content.firstChild) {
                wrapper.appendChild(content.firstChild);
            }
            content.appendChild(wrapper);
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

        // Close drawer when clicking drawer links
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
                            // If section is collapsed, expand it
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
                        // If section is collapsed, expand it
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

        // ========== SCROLL: progress + navbar + FAB + active nav ==========
        var progressBar = document.getElementById('scrollProgress');
        var navbar = document.getElementById('navbar');
        var fabTop = document.getElementById('fabTop');
        var scrollSections = document.querySelectorAll('.section[id]');
        var allNavLinks = document.querySelectorAll('#navLinks a, #drawerLinks a');
        var ticking = false;

        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    var y = window.scrollY;
                    var h = document.documentElement.scrollHeight - window.innerHeight;

                    if (progressBar) progressBar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
                    if (navbar) navbar.classList.toggle('scrolled', y > 10);
                    if (fabTop) fabTop.classList.toggle('visible', y > 400);

                    // Active nav link
                    var current = '';
                    scrollSections.forEach(function(sec) {
                        if (y >= sec.offsetTop - 120) current = sec.id;
                    });
                    allNavLinks.forEach(function(a) {
                        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
                    });

                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });

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
                var btn = this;
                btn.innerHTML = '<i class="fas fa-check"></i><span class="fab-tooltip">Saved!</span>';
                btn.style.background = '#27ae60';
                showToast('Progress saved!', 'check-circle');
                setTimeout(function() {
                    btn.innerHTML = '<i class="fas fa-save"></i><span class="fab-tooltip">Save</span>';
                    btn.style.background = '';
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
                if (isCollapsed) {
                    content.classList.remove('collapsed');
                    icon.classList.remove('collapsed');
                } else {
                    content.classList.add('collapsed');
                    icon.classList.add('collapsed');
                }
            });
        });

        // ========== EXERCISE ANSWER TOGGLES ==========
        document.querySelectorAll('.answer-reveal').forEach(function(el) {
            el.style.display = 'none';
        });

        document.querySelectorAll('.toggle-btn[data-target]').forEach(function(oldBtn) {
            var originalHTML = oldBtn.innerHTML;
            var label = 'Answer';
            if (originalHTML.indexOf('Solution') !== -1) label = 'Solution';

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

        var allSections = document.querySelectorAll('.section');
        allSections.forEach(function(s) {
            revealObserver.observe(s);
        });

        // Fallback for fast scrolling
        function forceRevealVisible() {
            var viewportHeight = window.innerHeight;
            allSections.forEach(function(s) {
                if (s.classList.contains('visible')) return;
                var rect = s.getBoundingClientRect();
                if (rect.top < viewportHeight + 100 && rect.bottom > -100) {
                    s.classList.add('visible');
                }
            });
        }

        setTimeout(forceRevealVisible, 100);
        setTimeout(forceRevealVisible, 500);
        setTimeout(forceRevealVisible, 1500);

        var scrollEndTimer;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollEndTimer);
            scrollEndTimer = setTimeout(forceRevealVisible, 80);
        }, { passive: true });

        window.addEventListener('resize', function() {
            setTimeout(forceRevealVisible, 200);
        });

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

    }); // END DOMContentLoaded
})();