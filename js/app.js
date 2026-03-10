// ============================================
// 2ND SEMESTER STUDY HUB - APP LOGIC (REFINED)
// ============================================

// ============ STATE ============
let appState = {
    currentScreen: 1,
    selectedSubject: null,
    selectedType: null,
    history: []
};

// ============ DOM CACHE ============
const $ = id => document.getElementById(id);
const welcomeScreen = $('welcomeScreen');
const appContainer = $('appContainer');
const progressFill = $('progressFill');
const screenTitle = $('screenTitle');
const breadcrumbEl = $('breadcrumb');
const backBtn = $('backBtn');
const screen1 = $('screen1');
const screen2 = $('screen2');
const screen3 = $('screen3');
const footer = $('appFooter');

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    renderSubjects();
    renderMorePanel();
    checkReturnState();
});

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
        welcomeScreen.style.display = 'none';
        appContainer.style.display = 'flex';

        if (state.currentScreen === 2 && state.selectedSubject) {
            if (state.selectedSubject.isPractice) {
                renderPracticeOptions(state.selectedSubject);
            } else {
                renderContentTypes(state.selectedSubject);
            }
            showFooter();
        } else if (state.currentScreen === 3 && state.selectedSubject && state.selectedType) {
            if (state.selectedSubject.isPractice) {
                renderPracticeOptions(state.selectedSubject);
            } else {
                renderContentTypes(state.selectedSubject);
            }
            renderContentItems(state.selectedSubject, state.selectedType.key, state.selectedType.data);
            showFooter();
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
        history: []
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

    subjectList.forEach((subject, index) => {
        const card = document.createElement('div');

        // Practice card is full-width
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

    if (subject.isPractice) {
        renderPracticeOptions(subject);
    } else {
        renderContentTypes(subject);
    }

    showScreen(2);
    showFooter();
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
    // Direct types open immediately
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
                <div class="item-icon" style="background: ${subject.color}18; color: ${subject.color}">
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
// SCREEN MANAGEMENT
// ============================================
function showScreen(num) {
    // Deactivate all
    screen1.classList.remove('active');
    screen2.classList.remove('active');
    screen3.classList.remove('active');

    appState.currentScreen = num;

    // Activate target
    const target = $(`screen${num}`);
    target.classList.add('active');

    // Update all UI elements
    updateProgress(num);
    updateHeader(num);
    updateFooterState(num);
    updateBackBtn(num);

    saveState();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress(num) {
    progressFill.style.width = `${(num / 3) * 100}%`;
}

function updateHeader(num) {
    const subject = appState.selectedSubject;
    const type = appState.selectedType;

    const titles = {
        1: 'Subjects',
        2: subject ? subject.name : 'Content Type',
        3: type ? type.data.name : 'Content'
    };

    const crumbs = {
        1: 'Choose a subject to begin',
        2: subject?.isPractice ? 'Choose an option' : 'Select content type',
        3: type ? `${type.data.items?.length || 0} items available` : 'Browse items'
    };

    screenTitle.textContent = titles[num];
    breadcrumbEl.textContent = crumbs[num];
}

function updateFooterState(num) {
    if (appState.selectedSubject) {
        showFooter();
    } else {
        hideFooter();
    }

    // Active states
    $('navSubjects').classList.toggle('active', num === 1);
    $('navType').classList.toggle('active', num === 2);
    $('navContent').classList.toggle('active', num === 3);

    // Disabled states
    $('navType').classList.toggle('disabled', !appState.selectedSubject);
    $('navContent').classList.toggle('disabled', !appState.selectedType);

    // Remove active indicator from disabled
    if (!appState.selectedSubject) $('navType').classList.remove('active');
    if (!appState.selectedType) $('navContent').classList.remove('active');
}

function updateBackBtn(num) {
    backBtn.classList.toggle('hidden', num === 1);
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================
function goBack() {
    if (appState.history.length > 0) {
        const prev = appState.history.pop();

        if (prev.screen === 1) {
            appState.selectedSubject = null;
            appState.selectedType = null;
            hideFooter();
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
            hideFooter();
            showScreen(1);
        }
    }
}

function navigateTo(num) {
    if (num === 2 && !appState.selectedSubject) return;
    if (num === 3 && !appState.selectedType) return;

    if (num < appState.currentScreen) {
        if (num === 1) {
            appState.selectedSubject = null;
            appState.selectedType = null;
            appState.history = [];
            hideFooter();
        } else if (num === 2) {
            appState.selectedType = null;
        }
    }

    showScreen(num);
}

function goHome() {
    hideFooter();
    appState = {
        currentScreen: 1,
        selectedSubject: null,
        selectedType: null,
        history: []
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
// MORE PANEL
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
// BROWSER BACK BUTTON
// ============================================
window.addEventListener('popstate', () => {
    if (!$('morePanel').classList.contains('show')) {
        if (appState.currentScreen > 1) {
            goBack();
        }
    } else {
        closeMorePanel();
    }
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if ($('morePanel').classList.contains('show')) {
            closeMorePanel();
        } else if (appState.currentScreen > 1) {
            goBack();
        }
    }

    if (e.key === 'Backspace' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        if (appState.currentScreen > 1) {
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

    // Swipe right from left edge, horizontal swipe only
    if (deltaX > 80 && touchStartX < 40 && deltaY < 60) {
        if ($('morePanel').classList.contains('show')) {
            closeMorePanel();
        } else if (appState.currentScreen > 1) {
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