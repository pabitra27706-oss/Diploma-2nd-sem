// ============================================
// 2ND SEMESTER STUDY HUB - APP LOGIC (FULL)
// ============================================

// ============ STATE ============
let appState = {
    currentScreen: 1,
    selectedSubject: null,
    selectedType: null,
    history: [],
    preMoreScreen: null
};

// ============ DOM CACHE ============
const $ = id => document.getElementById(id);
const welcomeScreen  = $('welcomeScreen');
const appContainer   = $('appContainer');
const progressFill   = $('progressFill');
const screenTitle    = $('screenTitle');
const breadcrumbEl   = $('breadcrumb');
const backBtn        = $('backBtn');
const screen1        = $('screen1');
const screen2        = $('screen2');
const screen3        = $('screen3');
const screen4        = $('screen4');
const footer         = $('appFooter');
const headerMoreBtn  = $('headerMoreBtn');

// ============ CONFIG ============
// ✏️ CHANGE THIS DATE TO YOUR EXAM DATE
const EXAM_DATE = new Date('2025-07-15');

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    updateWelcomeStats();
    updateGreeting();
    updateExamCountdown();
    updateContinueBanner();
    updateSubjectCount();
    renderSubjects();
    renderMorePanel();
    checkReturnState();
});

// ============================================
// DYNAMIC STATS
// ============================================
function calculateStats() {
    const subjectList = Object.values(subjects).filter(s => !s.isPractice);
    let totalUnits = 0;
    let totalPYQs = 0;

    subjectList.forEach(s => {
        if (s.types?.units?.items) totalUnits += s.types.units.items.length;
        if (s.types?.pyq?.items) totalPYQs += s.types.pyq.items.length;
    });

    return { subjects: subjectList.length, units: totalUnits, pyqs: totalPYQs };
}

function updateWelcomeStats() {
    const stats = calculateStats();
    const elSub  = $('welcomeStatSubjects');
    const elUnit = $('welcomeStatUnits');
    const elPYQ  = $('welcomeStatPYQs');
    if (elSub)  elSub.textContent  = stats.subjects;
    if (elUnit) elUnit.textContent = stats.units;
    if (elPYQ)  elPYQ.textContent  = stats.pyqs;
}

function updateSubjectCount() {
    const el = $('subjectCount');
    if (el) el.textContent = `${Object.keys(subjects).length} subjects`;
}

// ============================================
// HOME SCREEN ENHANCEMENTS
// ============================================
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting, emoji;

    if (hour < 5)       { greeting = 'Late Night Study'; emoji = '🌙'; }
    else if (hour < 12) { greeting = 'Good Morning';     emoji = '☀️'; }
    else if (hour < 17) { greeting = 'Good Afternoon';   emoji = '🌤️'; }
    else if (hour < 21) { greeting = 'Good Evening';     emoji = '🌆'; }
    else                { greeting = 'Night Owl Mode';    emoji = '🦉'; }

    const el = $('greetingMessage');
    if (el) el.textContent = `${greeting}! ${emoji}`;

    const dateEl = $('greetingDate');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
        });
    }
}

function updateExamCountdown() {
    const el = $('countdownText');
    if (!el) return;

    const now  = new Date();
    const diff = EXAM_DATE - now;

    if (diff <= 0) {
        el.textContent = 'Exams are here! Best of luck! 🎯';
    } else {
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days <= 7) {
            el.textContent = `Only ${days} day${days > 1 ? 's' : ''} left — Give it your all! 🔥`;
        } else if (days <= 30) {
            el.textContent = `${days} days until exams — Stay focused! 💪`;
        } else {
            el.textContent = `${days} days until exams — Build consistency! 📈`;
        }
    }
}

function updateContinueBanner() {
    const banner = $('continueBanner');
    if (!banner) return;

    const lastVisited = localStorage.getItem('lastVisitedSubject');
    if (!lastVisited) { banner.style.display = 'none'; return; }

    try {
        const data = JSON.parse(lastVisited);
        const subject = subjects[data.id];
        if (!subject) { banner.style.display = 'none'; return; }

        $('continueIcon').textContent = subject.icon;
        $('continueSubject').textContent = subject.name;
        banner.style.display = 'flex';
    } catch (e) {
        banner.style.display = 'none';
    }
}

function resumeStudy() {
    const lastVisited = localStorage.getItem('lastVisitedSubject');
    if (!lastVisited) return;
    try {
        const data = JSON.parse(lastVisited);
        const subject = subjects[data.id];
        if (subject) selectSubject(subject);
    } catch (e) { /* ignore */ }
}

function trackSubjectVisit(subject) {
    if (subject && !subject.isPractice) {
        localStorage.setItem('lastVisitedSubject', JSON.stringify({
            id: subject.id,
            timestamp: Date.now()
        }));
    }
}

// ============================================
// QUICK LINKS
// ============================================
function openQuickLink(type) {
    switch (type) {
        case 'practice':
            if (subjects['practice']) selectSubject(subjects['practice']);
            break;
        case 'roadmap':
            saveState();
            window.location.href = 'Practice_question/roadmap.html';
            break;
        case 'formulas':
            showFormulaSelector();
            break;
        case 'feedback':
            saveState();
            window.location.href = 'app-resorses/sections/send-feedback.html';
            break;
    }
}

function showFormulaSelector() {
    const content = $('morePanelContent');
    content.innerHTML = '';

    Object.values(subjects).forEach(subject => {
        if (subject.types?.formula) {
            const item = document.createElement('div');
            item.className = 'more-item';
            item.innerHTML = `
                <div class="more-icon" style="background:${subject.color}18;color:${subject.color}">
                    <span style="font-size:1.2rem">${subject.icon}</span>
                </div>
                <div class="more-text">
                    <h4>${subject.name}</h4>
                    <p>Formula Sheet</p>
                </div>
                <i class="fas fa-chevron-right more-arrow"></i>
            `;
            item.addEventListener('click', () => {
                saveState();
                window.location.href = `${subject.folder}/${subject.types.formula.directLink}`;
            });
            content.appendChild(item);
        }
    });

    $('panelTitle').innerHTML = '<i class="fas fa-clipboard-list"></i> Formula Sheets';
    $('morePanel').classList.add('show');
    $('moreOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
}

// ============================================
// SESSION STATE MANAGEMENT
// ============================================
function checkReturnState() {
    const saved = sessionStorage.getItem('studyHubState');
    if (!saved) return;

    try {
        const state = JSON.parse(saved);
        if (!state || !state.currentScreen) return;

        appState = state;

        // If was on More screen, restore to previous
        if (appState.currentScreen === 4) {
            appState.currentScreen = appState.preMoreScreen || 1;
            appState.preMoreScreen = null;
        }

        welcomeScreen.style.display = 'none';
        appContainer.style.display = 'flex';

        if (appState.currentScreen === 2 && appState.selectedSubject) {
            if (appState.selectedSubject.isPractice) {
                renderPracticeOptions(appState.selectedSubject);
            } else {
                renderContentTypes(appState.selectedSubject);
            }
        } else if (appState.currentScreen === 3 && appState.selectedSubject && appState.selectedType) {
            if (appState.selectedSubject.isPractice) {
                renderPracticeOptions(appState.selectedSubject);
            } else {
                renderContentTypes(appState.selectedSubject);
            }
            renderContentItems(appState.selectedSubject, appState.selectedType.key, appState.selectedType.data);
        } else {
            appState.currentScreen = 1;
            appState.selectedSubject = null;
            appState.selectedType = null;
            appState.history = [];
        }

        showScreen(appState.currentScreen);
    } catch (e) {
        console.warn('State restore failed:', e);
        sessionStorage.removeItem('studyHubState');
    }
}

function saveState() {
    sessionStorage.setItem('studyHubState', JSON.stringify(appState));
}

function clearState() {
    sessionStorage.removeItem('studyHubState');
}

// ============================================
// FOOTER CONTROL
// ============================================
function showFooter() {
    footer.classList.add('visible');
}

function hideFooter() {
    footer.classList.remove('visible');
}

// ============================================
// WELCOME SCREEN
// ============================================
function startApp() {
    clearState();
    appState = {
        currentScreen: 1,
        selectedSubject: null,
        selectedType: null,
        history: [],
        preMoreScreen: null
    };

    welcomeScreen.style.opacity = '0';
    welcomeScreen.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        welcomeScreen.style.display = 'none';
        appContainer.style.display = 'flex';
        requestAnimationFrame(() => {
            appContainer.style.opacity = '1';
            appContainer.style.transition = 'opacity 0.4s ease';
        });
        showScreen(1);
    }, 500);
}

// ============================================
// RENDER SUBJECTS (Screen 1)
// ============================================
function renderSubjects() {
    const grid = $('subjectGrid');
    grid.innerHTML = '';

    const subjectList = Object.values(subjects);

    subjectList.forEach((subject) => {
        const card = document.createElement('div');

        if (subject.isPractice) {
            card.className = 'subject-card full-width';
            card.style.setProperty('--card-color', subject.color);
            card.innerHTML = `
                <span class="subject-icon">${subject.icon}</span>
                <div class="card-text">
                    <div class="subject-name">${subject.name}</div>
                    <div class="subject-meta">Roadmap & Daily Practice</div>
                </div>
                <i class="fas fa-chevron-right card-arrow"></i>
            `;
        } else {
            card.className = 'subject-card';
            card.style.setProperty('--card-color', subject.color);
            const unitCount = subject.types?.units?.items?.length || 0;
            const hasAnswers = subject.types?.answers ? ' • Answers' : '';
            const meta = `${unitCount} Units${hasAnswers}`;
            card.innerHTML = `
                <span class="subject-icon">${subject.icon}</span>
                <div class="subject-name">${subject.shortName || subject.name}</div>
                <div class="subject-meta">${meta}</div>
            `;
        }

        card.addEventListener('click', () => selectSubject(subject));
        grid.appendChild(card);
    });
}

// ============================================
// SELECT SUBJECT
// ============================================
function selectSubject(subject) {
    appState.history.push({ screen: 1 });
    appState.selectedSubject = subject;
    appState.selectedType = null;

    trackSubjectVisit(subject);

    if (subject.isPractice) {
        renderPracticeOptions(subject);
    } else {
        renderContentTypes(subject);
    }

    showScreen(2);
}

// ============================================
// RENDER PRACTICE OPTIONS (Screen 2 for Practice)
// ============================================
function renderPracticeOptions(subject) {
    const banner = $('selectedSubjectBanner');
    banner.style.setProperty('--banner-color', subject.color);
    banner.innerHTML = `
        <span class="banner-icon">${subject.icon}</span>
        <div class="banner-content">
            <div class="banner-title">${subject.name}</div>
            <div class="banner-subtitle">Choose an option</div>
        </div>
    `;

    const grid = $('contentGrid');
    grid.innerHTML = '';

    subject.options.forEach(option => {
        const card = document.createElement('div');
        card.className = 'type-card';
        card.style.setProperty('--type-color', option.color);
        card.innerHTML = `
            <span class="type-icon">${option.icon}</span>
            <div class="type-name">${option.name}</div>
            <div class="type-count">${option.desc}</div>
        `;
        card.addEventListener('click', () => {
            saveState();
            window.location.href = option.link;
        });
        grid.appendChild(card);
    });
}

// ============================================
// RENDER CONTENT TYPES (Screen 2)
// ============================================
function renderContentTypes(subject) {
    const banner = $('selectedSubjectBanner');
    banner.style.setProperty('--banner-color', subject.color);
    banner.innerHTML = `
        <span class="banner-icon">${subject.icon}</span>
        <div class="banner-content">
            <div class="banner-title">${subject.name}</div>
            <div class="banner-subtitle">Select content type</div>
        </div>
    `;

    const grid = $('contentGrid');
    grid.innerHTML = '';

    const typeKeys = ['units', 'pyq', 'answers', 'formula'];

    typeKeys.forEach(key => {
        const typeData = subject.types[key];
        if (!typeData) return;

        const card = document.createElement('div');
        card.className = 'type-card';
        card.style.setProperty('--type-color', typeData.color);

        let countText = '';
        if (typeData.items) {
            countText = `${typeData.items.length} Items`;
        } else if (typeData.isDirectType) {
            countText = typeData.desc || 'Tap to open';
        }

        card.innerHTML = `
            <span class="type-icon">${typeData.icon}</span>
            <div class="type-name">${typeData.name}</div>
            <div class="type-count">${countText}</div>
        `;

        card.addEventListener('click', () => selectType(subject, key, typeData));
        grid.appendChild(card);
    });
}

// ============================================
// SELECT TYPE
// ============================================
function selectType(subject, typeKey, typeData) {
    if (typeData.isDirectType) {
        saveState();
        window.location.href = `${subject.folder}/${typeData.directLink}`;
        return;
    }

    appState.history.push({ screen: 2 });
    appState.selectedType = { key: typeKey, data: typeData };

    renderContentItems(subject, typeKey, typeData);
    showScreen(3);
}

// ============================================
// RENDER CONTENT ITEMS (Screen 3)
// ============================================
function renderContentItems(subject, typeKey, typeData) {
    const banner = $('selectedInfoBanner');
    banner.style.setProperty('--banner-color', subject.color);
    banner.innerHTML = `
        <span class="banner-icon">${subject.icon}</span>
        <div class="banner-content">
            <div class="banner-title">${subject.name}</div>
            <div class="banner-subtitle">${typeData.name} — ${typeData.items.length} items</div>
        </div>
    `;

    const list = $('contentList');
    list.innerHTML = '';

    typeData.items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'content-item';

        let itemIcon = typeKey === 'units' ? '📖' : typeKey === 'pyq' ? '📝' : '📄';

        div.innerHTML = `
            <div class="item-left">
                <div class="item-icon" style="background:${subject.color}18;color:${subject.color}">
                    ${itemIcon}
                </div>
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>${item.desc || ''}</p>
                </div>
            </div>
            <i class="fas fa-chevron-right item-arrow"></i>
        `;

        div.addEventListener('click', () => openContent(subject, typeKey, typeData, item));
        list.appendChild(div);
    });
}

// ============================================
// OPEN CONTENT FILE
// ============================================
function openContent(subject, typeKey, typeData, item) {
    saveState();
    let path = '';

    if (typeKey === 'units') {
        path = `${subject.folder}/${item.file}`;
    } else if (typeKey === 'pyq') {
        path = `${subject.folder}/${typeData.folder}/${item.file}`;
    }

    if (path) window.location.href = path;
}

// ============================================
// MORE SCREEN (Screen 4 — Full Page)
// ============================================
function showMoreScreen() {
    if (appState.currentScreen === 4) return;
    appState.preMoreScreen = appState.currentScreen;
    renderMoreScreenContent();
    showScreen(4);
}

function renderMoreScreenContent() {
    const content = $('moreScreenContent');
    content.innerHTML = '';

    // App Info Card
    const stats = calculateStats();
    const appCard = document.createElement('div');
    appCard.className = 'more-app-card';
    appCard.innerHTML = `
        <div class="more-app-icon">📚</div>
        <div class="more-app-info">
            <h3>2nd Semester Study Hub</h3>
            <p>${stats.subjects} subjects • ${stats.units} units • ${stats.pyqs} PYQs</p>
        </div>
    `;
    content.appendChild(appCard);

    // Home / Welcome Button
    const homeItem = document.createElement('div');
    homeItem.className = 'more-item home-action';
    homeItem.innerHTML = `
        <div class="more-icon blue">
            <i class="fas fa-home"></i>
        </div>
        <div class="more-text">
            <h4>Back to Welcome</h4>
            <p>Return to start screen</p>
        </div>
        <i class="fas fa-chevron-right more-arrow"></i>
    `;
    homeItem.addEventListener('click', goHome);
    content.appendChild(homeItem);

    // Sections
    moreLinks.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'more-screen-section';
        sectionDiv.innerHTML = `<div class="more-section-label">${section.section}</div>`;

        section.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'more-item';
            itemDiv.innerHTML = `
                <div class="more-icon ${item.color}">
                    <i class="${item.icon}"></i>
                </div>
                <div class="more-text">
                    <h4>${item.name}</h4>
                    <p>${item.desc}</p>
                </div>
                <i class="fas fa-chevron-right more-arrow"></i>
            `;
            itemDiv.addEventListener('click', () => {
                saveState();
                window.location.href = item.link;
            });
            sectionDiv.appendChild(itemDiv);
        });

        content.appendChild(sectionDiv);
    });

    // Version Footer
    const versionDiv = document.createElement('div');
    versionDiv.className = 'more-version';
    versionDiv.innerHTML = `<p>Version 1.0 • Made with ❤️ for students</p>`;
    content.appendChild(versionDiv);
}

// ============================================
// MORE PANEL (Slide-Up — Header ⋮ Button)
// ============================================
function renderMorePanel() {
    const content = $('morePanelContent');
    content.innerHTML = '';

    moreLinks.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'more-section';
        sectionDiv.innerHTML = `<div class="more-section-label">${section.section}</div>`;

        section.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'more-item';
            itemDiv.innerHTML = `
                <div class="more-icon ${item.color}">
                    <i class="${item.icon}"></i>
                </div>
                <div class="more-text">
                    <h4>${item.name}</h4>
                    <p>${item.desc}</p>
                </div>
                <i class="fas fa-chevron-right more-arrow"></i>
            `;
            itemDiv.addEventListener('click', () => {
                saveState();
                window.location.href = item.link;
            });
            sectionDiv.appendChild(itemDiv);
        });

        content.appendChild(sectionDiv);
    });
}

function openMorePanel() {
    renderMorePanel();
    $('panelTitle').innerHTML = '<i class="fas fa-info-circle"></i> Quick Access';
    $('morePanel').classList.add('show');
    $('moreOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeMorePanel() {
    $('morePanel').classList.remove('show');
    $('moreOverlay').classList.remove('show');
    document.body.style.overflow = '';
}

// ============================================
// SCREEN MANAGEMENT
// ============================================
function showScreen(num) {
    screen1.classList.remove('active');
    screen2.classList.remove('active');
    screen3.classList.remove('active');
    screen4.classList.remove('active');

    appState.currentScreen = num;

    const target = $(`screen${num}`);
    target.classList.add('active');

    updateProgress(num);
    updateHeader(num);
    updateFooterState(num);
    updateBackBtn(num);
    saveState();

    // Refresh home screen data when shown
    if (num === 1) {
        updateGreeting();
        updateContinueBanner();
        updateExamCountdown();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress(num) {
    if (num === 4) {
        progressFill.style.width = '100%';
        progressFill.style.opacity = '0.4';
    } else {
        progressFill.style.width = `${(num / 3) * 100}%`;
        progressFill.style.opacity = '1';
    }
}

function updateHeader(num) {
    const subject = appState.selectedSubject;
    const type = appState.selectedType;

    const titles = {
        1: 'Subjects',
        2: subject ? subject.name : 'Content Type',
        3: type ? type.data.name : 'Content',
        4: 'More'
    };

    const crumbs = {
        1: 'Choose a subject to begin',
        2: subject?.isPractice ? 'Choose an option' : 'Select content type',
        3: type ? `${type.data.items?.length || 0} items available` : 'Browse items',
        4: 'App info & settings'
    };

    screenTitle.textContent = titles[num];
    breadcrumbEl.textContent = crumbs[num];

    // Hide header ⋮ on More screen (already showing More content)
    if (headerMoreBtn) {
        headerMoreBtn.style.display = (num === 4) ? 'none' : 'flex';
    }
}

function updateFooterState(num) {
    // Always show footer when in app
    showFooter();

    $('navSubjects').classList.toggle('active', num === 1);
    $('navType').classList.toggle('active', num === 2);
    $('navContent').classList.toggle('active', num === 3);
    $('navMore').classList.toggle('active', num === 4);

    // Disabled states
    $('navType').classList.toggle('disabled', !appState.selectedSubject);
    $('navContent').classList.toggle('disabled', !appState.selectedType);

    // Remove active from disabled buttons
    if (!appState.selectedSubject) $('navType').classList.remove('active');
    if (!appState.selectedType) $('navContent').classList.remove('active');
}

function updateBackBtn(num) {
    backBtn.classList.toggle('is-hidden', num === 1);
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================
function goBack() {
    // From More screen → go to previous screen
    if (appState.currentScreen === 4) {
        const prev = appState.preMoreScreen || 1;
        appState.preMoreScreen = null;
        showScreen(prev);
        return;
    }

    if (appState.history.length > 0) {
        const prev = appState.history.pop();
        if (prev.screen === 1) {
            appState.selectedSubject = null;
            appState.selectedType = null;
            showScreen(1);
        } else if (prev.screen === 2) {
            appState.selectedType = null;
            showScreen(2);
        }
    } else if (appState.currentScreen > 1) {
        if (appState.currentScreen === 3) {
            appState.selectedType = null;
            showScreen(2);
        } else if (appState.currentScreen === 2) {
            appState.selectedSubject = null;
            appState.selectedType = null;
            showScreen(1);
        }
    }
}

function navigateTo(num) {
    if (num === 2 && !appState.selectedSubject) return;
    if (num === 3 && !appState.selectedType) return;

    // Coming from More screen
    if (appState.currentScreen === 4) {
        appState.preMoreScreen = null;
    }

    // Reset state when going backwards
    if (num === 1) {
        appState.selectedSubject = null;
        appState.selectedType = null;
        appState.history = [];
    } else if (num === 2) {
        appState.selectedType = null;
    }

    showScreen(num);
}

function goHome() {
    hideFooter();
    appState = {
        currentScreen: 1,
        selectedSubject: null,
        selectedType: null,
        history: [],
        preMoreScreen: null
    };
    clearState();

    appContainer.style.opacity = '0';
    appContainer.style.transition = 'opacity 0.4s ease';

    setTimeout(() => {
        appContainer.style.display = 'none';
        welcomeScreen.style.display = 'flex';
        requestAnimationFrame(() => {
            welcomeScreen.style.opacity = '1';
            welcomeScreen.style.transition = 'opacity 0.5s ease';
        });
    }, 400);
}

// ============================================
// BROWSER BACK BUTTON
// ============================================
window.addEventListener('popstate', () => {
    if ($('morePanel').classList.contains('show')) {
        closeMorePanel();
    } else if (appState.currentScreen > 1 || appState.currentScreen === 4) {
        goBack();
    }
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if ($('morePanel').classList.contains('show')) {
            closeMorePanel();
        } else if (appState.currentScreen > 1 || appState.currentScreen === 4) {
            goBack();
        }
    }

    if (e.key === 'Backspace' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        if (appState.currentScreen > 1 || appState.currentScreen === 4) {
            e.preventDefault();
            goBack();
        }
    }
});

// ============================================
// TOUCH: SWIPE RIGHT TO GO BACK
// ============================================
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', e => {
    const deltaX = e.changedTouches[0].screenX - touchStartX;
    const deltaY = Math.abs(e.changedTouches[0].screenY - touchStartY);

    if (deltaX > 80 && touchStartX < 40 && deltaY < 60) {
        if ($('morePanel').classList.contains('show')) {
            closeMorePanel();
        } else if (appState.currentScreen > 1 || appState.currentScreen === 4) {
            goBack();
        }
    }
}, { passive: true });

// ============================================
// CLEANUP ON PAGE LEAVE
// ============================================
window.addEventListener('beforeunload', () => {
    if (appState.currentScreen === 1 && !appState.selectedSubject) {
        clearState();
    }
});