/* ================================================
   ENGINE v3.5 — Final mobile scroll fix
   The collapse transition applies overflow:hidden
   temporarily, then removes it when done.
   ================================================ */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {

        // ========== AUTO-WRAP SECTION CONTENT ==========
        document.querySelectorAll('.section-content').forEach(function(content) {
            if (content.querySelector('.section-content-inner')) return;

            var wrapper = document.createElement('div');
            wrapper.className = 'section-content-inner';

            var frag = document.createDocumentFragment();
            while (content.firstChild) {
                frag.appendChild(content.firstChild);
            }
            wrapper.appendChild(frag);
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

        try {
            window.matchMedia('(prefers-color-scheme: dark)')
                .addEventListener('change', function(e) {
                    if (!localStorage.getItem('theme')) {
                        setTheme(e.matches);
                    }
                });
        } catch(e) {}

        if (themeBtn) {
            themeBtn.addEventListener('click', function() {
                var isDark = document.documentElement.getAttribute('data-theme') !== 'dark';
                setTheme(isDark);
                showToast(isDark ? 'Dark mode on' : 'Light mode on', isDark ? 'moon' : 'sun');
            });
        }
        if (drawerThemeBtn) {
            drawerThemeBtn.addEventListener('click', function() {
                var isDark = document.documentElement.getAttribute('data-theme') !== 'dark';
                setTheme(isDark);
                showToast(isDark ? 'Dark mode on' : 'Light mode on', isDark ? 'moon' : 'sun');
            });
        }

        // ========== MOBILE DRAWER ==========
        var menuBtn = document.getElementById('menuBtn');
        var drawer = document.getElementById('mobileDrawer');
        var overlay = document.getElementById('navOverlay');
        var drawerCloseBtn = document.getElementById('drawerClose');

        var savedScrollY = 0;

        function openDrawer() {
            if (drawer) drawer.classList.add('active');
            if (overlay) overlay.classList.add('active');
            savedScrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = '-' + savedScrollY + 'px';
            document.body.style.left = '0';
            document.body.style.right = '0';
        }

        function closeDrawer() {
            if (drawer) drawer.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            window.scrollTo(0, savedScrollY);
        }

        if (menuBtn) menuBtn.addEventListener('click', openDrawer);
        if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
        if (overlay) overlay.addEventListener('click', closeDrawer);

        if (drawer) {
            drawer.addEventListener('transitionend', function() {
                if (!drawer.classList.contains('active')) {
                    if (document.body.style.position === 'fixed') {
                        document.body.style.position = '';
                        document.body.style.top = '';
                        document.body.style.left = '';
                        document.body.style.right = '';
                        window.scrollTo(0, savedScrollY);
                    }
                }
            });
        }

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
                                content.classList.add('transitioning');
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
                            content.classList.add('transitioning');
                            if (icon) icon.classList.remove('collapsed');
                        }
                        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
                    }
                });
            });
        }

        // ========== SCROLL PERFORMANCE ==========
        var progressBar = document.getElementById('scrollProgress');
        var navbar = document.getElementById('navbar');
        var fabTop = document.getElementById('fabTop');
        var scrollSections = document.querySelectorAll('.section[id]');
        var allNavLinks = document.querySelectorAll('#navLinks a, #drawerLinks a');
        var allSections = document.querySelectorAll('.section');

        var sectionPositions = [];
        var cachedDocHeight = 1;

        function cacheSectionPositions() {
            sectionPositions = [];
            scrollSections.forEach(function(sec) {
                sectionPositions.push({
                    id: sec.id,
                    top: sec.offsetTop
                });
            });
            cachedDocHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (cachedDocHeight < 1) cachedDocHeight = 1;
        }

        cacheSectionPositions();

        var resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                cacheSectionPositions();
                forceRevealVisible();
            }, 250);
        });

        var prevNavState = '';
        var prevNavbarScrolled = false;
        var prevFabVisible = false;

        var ticking = false;
        var scrollEndTimer;

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    var y = window.scrollY;

                    if (progressBar) {
                        progressBar.style.width = ((y / cachedDocHeight) * 100) + '%';
                    }

                    var shouldBeScrolled = y > 10;
                    if (navbar && shouldBeScrolled !== prevNavbarScrolled) {
                        navbar.classList.toggle('scrolled', shouldBeScrolled);
                        prevNavbarScrolled = shouldBeScrolled;
                    }

                    var shouldShowFab = y > 400;
                    if (fabTop && shouldShowFab !== prevFabVisible) {
                        fabTop.classList.toggle('visible', shouldShowFab);
                        prevFabVisible = shouldShowFab;
                    }

                    var current = '';
                    for (var i = 0; i < sectionPositions.length; i++) {
                        if (y >= sectionPositions[i].top - 120) {
                            current = sectionPositions[i].id;
                        }
                    }
                    if (current !== prevNavState) {
                        allNavLinks.forEach(function(a) {
                            a.classList.toggle('active',
                                a.getAttribute('href') === '#' + current);
                        });
                        prevNavState = current;
                    }

                    ticking = false;
                });
                ticking = true;
            }

            clearTimeout(scrollEndTimer);
            scrollEndTimer = setTimeout(forceRevealVisible, 300);

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
                if (fabSave._saving) return;
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

        // ========== COLLAPSIBLE SECTIONS (FIXED) ==========
        // The key: overflow:hidden only during transition, removed after
        document.querySelectorAll('.section-title').forEach(function(title) {
            var content = title.nextElementSibling;
            var icon = title.querySelector('.collapse-icon');
            if (!content || !content.classList.contains('section-content')) return;
            if (!icon) return;

            title.setAttribute('role', 'button');
            title.setAttribute('tabindex', '0');
            title.setAttribute('aria-expanded', 'true');

            // Remove overflow:hidden from expanded sections on load
            // This is THE fix — expanded content must not clip
            if (!content.classList.contains('collapsed')) {
                content.classList.add('expanded');
            }

            // Listen for transition end to toggle overflow
            content.addEventListener('transitionend', function(e) {
                // Only react to grid-template-rows transition
                if (e.propertyName !== 'grid-template-rows') return;

                if (!content.classList.contains('collapsed')) {
                    // Expand finished — remove clipping
                    content.classList.add('expanded');
                    content.classList.remove('transitioning');
                } else {
                    // Collapse finished — keep clipping
                    content.classList.remove('expanded');
                    content.classList.remove('transitioning');
                }

                cacheSectionPositions();
            });

            title.addEventListener('click', function() {
                var isCollapsed = content.classList.contains('collapsed');

                // Starting a transition — need overflow:hidden during animation
                content.classList.remove('expanded');
                content.classList.add('transitioning');

                if (isCollapsed) {
                    // Expanding
                    content.classList.remove('collapsed');
                    icon.classList.remove('collapsed');
                    title.setAttribute('aria-expanded', 'true');
                } else {
                    // Collapsing
                    content.classList.add('collapsed');
                    icon.classList.add('collapsed');
                    title.setAttribute('aria-expanded', 'false');
                }

                // Safety: if transitionend doesn't fire, clean up after timeout
                setTimeout(function() {
                    content.classList.remove('transitioning');
                    if (!content.classList.contains('collapsed')) {
                        content.classList.add('expanded');
                    }
                    cacheSectionPositions();
                }, 600);
            });

            title.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
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
                setTimeout(cacheSectionPositions, 150);
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