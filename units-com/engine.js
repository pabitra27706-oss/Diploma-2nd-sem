/* ================================================
   ENGINE v2 — Adds interactivity to HTML content
   No rendering, no JSON — just behavior
   ================================================ */

(function () {
    'use strict';

    // ========== TOAST ==========
    const toastEl = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    let toastTimer;

    function showToast(msg, icon) {
        clearTimeout(toastTimer);
        toastMsg.textContent = msg;
        if (icon) toastEl.querySelector('i').className = 'fas fa-' + icon;
        toastEl.classList.add('show');
        toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2500);
    }

    // ========== DARK MODE ==========
    var themeBtn = document.getElementById('themeToggle');
    var drawerThemeBtn = document.getElementById('drawerThemeToggle');

    function setTheme(dark) {
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
        localStorage.setItem('theme', dark ? 'dark' : 'light');
        var icon = dark ? 'fa-sun' : 'fa-moon';
        themeBtn.innerHTML = '<i class="fas ' + icon + '"></i>';
        drawerThemeBtn.innerHTML = '<i class="fas ' + icon + '"></i> Theme';
    }

    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(saved ? saved === 'dark' : prefersDark);

    themeBtn.addEventListener('click', function () {
        var isDark = document.documentElement.getAttribute('data-theme') !== 'dark';
        setTheme(isDark);
        showToast(isDark ? 'Dark mode on' : 'Light mode on', isDark ? 'moon' : 'sun');
    });
    drawerThemeBtn.addEventListener('click', function () { themeBtn.click(); });

    // ========== MOBILE DRAWER ==========
    var menuBtn = document.getElementById('menuBtn');
    var drawer = document.getElementById('mobileDrawer');
    var overlay = document.getElementById('navOverlay');
    var closeBtn = document.getElementById('drawerClose');

    function openDrawer() {
        drawer.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', openDrawer);
    closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    document.getElementById('drawerPrint').addEventListener('click', function () {
        closeDrawer();
        setTimeout(function () { window.print(); }, 400);
    });

    // Close drawer when clicking drawer links
    var drawerLinks = document.querySelectorAll('#drawerLinks a');
    drawerLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            closeDrawer();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                setTimeout(function () {
                    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
                }, 300);
            }
        });
    });

    // ========== DESKTOP NAV SMOOTH SCROLL ==========
    var navLinks = document.querySelectorAll('#navLinks a');
    navLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });

    // ========== SCROLL: progress + navbar + FAB + active nav ==========
    var progressBar = document.getElementById('scrollProgress');
    var navbar = document.getElementById('navbar');
    var fabTop = document.getElementById('fabTop');
    var sections = document.querySelectorAll('.section[id]');
    var allNavLinks = document.querySelectorAll('#navLinks a, #drawerLinks a');
    var ticking = false;

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(function () {
                var y = window.scrollY;
                var h = document.documentElement.scrollHeight - window.innerHeight;

                // Progress bar
                progressBar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';

                // Navbar shadow
                navbar.classList.toggle('scrolled', y > 10);

                // Back to top FAB
                fabTop.classList.toggle('visible', y > 400);

                // Active nav link
                var current = '';
                sections.forEach(function (sec) {
                    if (y >= sec.offsetTop - 120) current = sec.id;
                });
                allNavLinks.forEach(function (a) {
                    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
                });

                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll);

    // ========== FAB BUTTONS ==========
    fabTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('fabPrint').addEventListener('click', function () {
        window.print();
    });

    document.getElementById('fabSave').addEventListener('click', function () {
        var btn = this;
        btn.innerHTML = '<i class="fas fa-check"></i><span class="fab-tooltip">Saved!</span>';
        btn.style.background = '#27ae60';
        showToast('Progress saved!', 'check-circle');
        setTimeout(function () {
            btn.innerHTML = '<i class="fas fa-save"></i><span class="fab-tooltip">Save</span>';
            btn.style.background = '';
        }, 2000);
    });

    // ========== COLLAPSIBLE SECTIONS ==========
    document.querySelectorAll('.section-title').forEach(function (title) {
        var content = title.nextElementSibling;
        var icon = title.querySelector('.collapse-icon');

        if (!content || !content.classList.contains('section-content')) return;
        if (!icon) return;

        // Set initial max-height
        requestAnimationFrame(function () {
            content.style.maxHeight = content.scrollHeight + 'px';
        });

        title.addEventListener('click', function () {
            if (content.classList.contains('collapsed')) {
                content.classList.remove('collapsed');
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.classList.remove('collapsed');
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                requestAnimationFrame(function () {
                    content.classList.add('collapsed');
                    content.style.maxHeight = '0px';
                    icon.classList.add('collapsed');
                });
            }
        });
    });

    // ========== EXERCISE ANSWER TOGGLES ==========
    document.querySelectorAll('.toggle-btn[data-target]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var answer = document.getElementById(btn.getAttribute('data-target'));
            if (!answer) return;
            var visible = answer.style.display === 'block';
            answer.style.display = visible ? 'none' : 'block';
            btn.innerHTML = visible
                ? '<i class="fas fa-eye"></i> Show Answer'
                : '<i class="fas fa-eye-slash"></i> Hide Answer';
        });
    });

    // ========== SCROLL REVEAL ==========
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.section').forEach(function (s) {
        observer.observe(s);
    });

    // ========== KEYBOARD SHORTCUTS ==========
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'p') { e.preventDefault(); window.print(); }
        if (e.ctrlKey && e.key === 's') { e.preventDefault(); document.getElementById('fabSave').click(); }
        if (e.key === 'Escape') closeDrawer();
    });

    // ========== RESIZE: recalculate collapse heights ==========
    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            document.querySelectorAll('.section-content:not(.collapsed)').forEach(function (c) {
                c.style.maxHeight = c.scrollHeight + 'px';
            });
        }, 200);
    });

})();