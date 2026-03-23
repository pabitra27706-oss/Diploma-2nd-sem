/* ================================================
   ENGINE v2 — Adds interactivity to HTML content
   No rendering, no JSON — just behavior
   ================================================ */
(function() {
    'use strict';
    
    // Wait for DOM to be fully ready
    // This ALSO ensures inline scripts have already run
    document.addEventListener('DOMContentLoaded', function() {
        
        // ========== TOAST ==========
        var toastEl = document.getElementById('toast');
        var toastMsg = document.getElementById('toastMsg');
        var toastTimer;
        
        function showToast(msg, icon) {
            if (!toastEl || !toastMsg) return;
            clearTimeout(toastTimer);
            toastMsg.textContent = msg;
            if (icon) toastEl.querySelector('i').className = 'fas fa-' + icon;
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
        document.querySelectorAll('#drawerLinks a').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                closeDrawer();
                var target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    setTimeout(function() {
                        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
                    }, 300);
                }
            });
        });
        
        // ========== DESKTOP NAV SMOOTH SCROLL ==========
        document.querySelectorAll('#navLinks a').forEach(function(link) {
            link.addEventListener('click', function(e) {
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
        
        window.addEventListener('scroll', onScroll);
        
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
        function updateCollapseHeights() {
            document.querySelectorAll('.section-content:not(.collapsed)').forEach(function(c) {
                c.style.maxHeight = c.scrollHeight + 'px';
            });
        }
        
        document.querySelectorAll('.section-title').forEach(function(title) {
            var content = title.nextElementSibling;
            var icon = title.querySelector('.collapse-icon');
            
            if (!content || !content.classList.contains('section-content')) return;
            if (!icon) return;
            
            requestAnimationFrame(function() {
                content.style.maxHeight = content.scrollHeight + 'px';
            });
            
            title.addEventListener('click', function() {
                if (content.classList.contains('collapsed')) {
                    content.classList.remove('collapsed');
                    content.style.maxHeight = content.scrollHeight + 'px';
                    icon.classList.remove('collapsed');
                } else {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    requestAnimationFrame(function() {
                        content.classList.add('collapsed');
                        content.style.maxHeight = '0px';
                        icon.classList.add('collapsed');
                    });
                }
            });
        });
        
        // ========================================================
        //  EXERCISE ANSWER TOGGLES
        //  Handles ALL toggle buttons across ALL unit pages
        //  Works with: "Show Answer", "Show Solution", or any text
        //  No HTML changes needed
        // ========================================================
        
        // Step 1: Hide all answer panels
        document.querySelectorAll('.answer-reveal').forEach(function(el) {
            el.style.display = 'none';
        });
        
        // Step 2: Process each toggle button
        document.querySelectorAll('.toggle-btn[data-target]').forEach(function(oldBtn) {
            
            // Detect label from original button text
            var originalHTML = oldBtn.innerHTML;
            var label = 'Answer';
            if (originalHTML.indexOf('Solution') !== -1) label = 'Solution';
            
            // Clone to remove ANY existing listeners (from inline script)
            var newBtn = oldBtn.cloneNode(true);
            newBtn.innerHTML = '<i class="fas fa-eye"></i> Show ' + label;
            oldBtn.parentNode.replaceChild(newBtn, oldBtn);
            
            // Attach fresh click handler
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var targetId = this.getAttribute('data-target');
                var answer = document.getElementById(targetId);
                if (!answer) return;
                
                var isHidden = answer.style.display !== 'block';
                
                // Toggle answer visibility
                answer.style.display = isHidden ? 'block' : 'none';
                
                // Update button text
                this.innerHTML = isHidden ?
                    '<i class="fas fa-eye-slash"></i> Hide ' + label :
                    '<i class="fas fa-eye"></i> Show ' + label;
                
                // Recalculate parent section maxHeight so content isn't cut off
                var parentContent = this.closest('.section-content');
                if (parentContent && !parentContent.classList.contains('collapsed')) {
                    // Small delay to let DOM update
                    setTimeout(function() {
                        parentContent.style.maxHeight = parentContent.scrollHeight + 'px';
                    }, 50);
                }
            });
        });
        
        // ========== SCROLL REVEAL ==========
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(e) {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    observer.unobserve(e.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        
        document.querySelectorAll('.section').forEach(function(s) {
            observer.observe(s);
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
        
        // ========== RESIZE: recalculate collapse heights ==========
        var resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(updateCollapseHeights, 200);
        });
        
    }); // END DOMContentLoaded
})();