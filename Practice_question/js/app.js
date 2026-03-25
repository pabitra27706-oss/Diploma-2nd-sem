/* ============================================
   APP.JS — Core Logic, State, Event Handling
   WB Diploma Sem-II | Practice Questions App
   WITH DAY JUMP NAVIGATION
   ============================================ */

'use strict';

const App = {

  // ============================================
  // 1. STATE
  // ============================================

  allQuestions: [],
  filteredQuestions: [],
  dayMeta: {},
  filters: null,
  settings: null,
  currentPage: 1,
  dataLoaded: false,
  practiceTimer: null,
  practiceQuestions: [],
  practiceCurrentIndex: 0,
  practiceConfig: {
    subjects: [],
    difficulty: [],
    types: [],
    count: 20,
    timer: 60,
    shuffle: true
  },
  practiceActive: false,
  practiceStartTime: 0,
  currentDay: 'all',


  // ============================================
  // 2. INIT
  // ============================================

  async init() {
    console.log('[App] Initializing...');
    Renderer.cacheElements();
    this.settings = Storage.load(STORAGE_KEYS.SETTINGS, { ...DEFAULT_SETTINGS });
    this.filters = Storage.load(STORAGE_KEYS.FILTERS, Utils.deepClone(DEFAULT_FILTERS));
    Renderer.applyTheme(this.settings.theme);
    Keyboard.init();
    this._setupKeyboardShortcuts();
    Sounds.setEnabled(this.settings.soundEffects);
    Renderer.renderSkeletons(5);
    this._bindEvents();
    await this._loadData();
    Streak.update();
    console.log('[App] Initialized successfully.');
  },


  // ============================================
  // 3. DATA LOADING
  // ============================================

  async _loadData() {
    Renderer.renderLoading('Loading questions...');
    try {
      const result = await DataLoader.loadAll((loaded, total) => {
        console.log(`[App] Loaded ${loaded}/${total} days`);
      });
      this.allQuestions = result.allQuestions;
      this.dayMeta = result.dayMeta;
      this.dataLoaded = true;
      console.log(`[App] Total questions loaded: ${this.allQuestions.length}`);

      if (this.allQuestions.length === 0) {
        Renderer.renderLoading('No questions found. Please add JSON files in the /data/ folder.');
        return;
      }

      this._applyFiltersAndRender();
      this._updateDashboard();
      Renderer.renderFilterPanel(this.allQuestions, this.filters);
      Renderer.setActiveViewMode(this.settings.viewMode);
      Renderer.setActiveSortOption(this.settings.sortBy);
      this._updateDayJumpProgress();
      Renderer.showToast(`📚 ${this.allQuestions.length} questions loaded!`, 'success');
    } catch (error) {
      console.error('[App] Failed to load data:', error);
      Renderer.renderLoading('Failed to load questions. Check console for errors.');
      Renderer.showToast('❌ Failed to load questions', 'error');
    }
  },


  // ============================================
  // 4. FILTER & RENDER PIPELINE
  // ============================================

  _applyFiltersAndRender() {
    this.filteredQuestions = Filters.applyAll(this.allQuestions, this.filters);
    this.filteredQuestions = Sorter.sort(this.filteredQuestions, this.settings.sortBy);
    const paginated = Utils.paginate(this.filteredQuestions, this.currentPage, this.settings.perPage);
    Renderer.renderQuestions(paginated.items, this.settings.viewMode, this.filters.search);
    Renderer.renderResultsBar(this.filteredQuestions.length, this.allQuestions.length);
    Renderer.renderPagination(paginated.currentPage, paginated.totalPages, paginated.totalItems);
    Renderer.renderActiveFilterTags(this.filters);
    Renderer.updateFilterCount(this.filters);
    Storage.save(STORAGE_KEYS.FILTERS, this.filters);
    this.currentPage = paginated.currentPage;
  },

  _updateDashboard() {
    if (!this.dataLoaded) return;
    const stats = StatsCalculator.calculate(this.allQuestions);
    Renderer.renderDashboard(stats);
    Renderer.renderProgressBar(stats.completionPct);
    this._updateDayJumpProgress();
  },


  // ============================================
  // 5. DAY JUMP NAVIGATION
  // ============================================

  jumpToDay(day, btn) {
    // Update active button
    document.querySelectorAll('.day-jump-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    this.currentDay = day;

    // Update filter
    if (day === 'all') {
      this.filters.days = [];
    } else {
      this.filters.days = [parseInt(day)];
    }

    // Sync filter panel day buttons
    document.querySelectorAll('.filter-day-btn').forEach(b => {
      const d = parseInt(b.dataset.day);
      b.classList.toggle('active', this.filters.days.includes(d));
    });

    this.currentPage = 1;
    this._applyFiltersAndRender();
    this._showDayInfo(day);
    Renderer.scrollTo('.day-jump-bar');

    if (day === 'all') {
      Renderer.showToast('📚 Showing all days', 'info');
    } else {
      const meta = this.dayMeta[day];
      const title = meta ? meta.title : `Day ${day}`;
      Renderer.showToast(`📅 Day ${day}: ${title}`, 'info');
    }

    Sounds.click();
  },

  _showDayInfo(day) {
    const existing = document.getElementById('dayInfoPanel');
    if (existing) existing.remove();

    if (day === 'all') return;

    const dayNum = parseInt(day);
    const dayQuestions = this.allQuestions.filter(q => q.day === dayNum);
    if (dayQuestions.length === 0) return;

    let attempted = 0, bookmarked = 0;
    const subjects = new Set();
    const types = {};
    const diffs = { easy: 0, medium: 0, hard: 0 };

    dayQuestions.forEach(q => {
      if (Progress.getStatus(q.id) === 'attempted') attempted++;
      if (Progress.isBookmarked(q.id)) bookmarked++;
      subjects.add(q.subject);
      types[q.type] = (types[q.type] || 0) + 1;
      if (diffs.hasOwnProperty(q.difficulty)) diffs[q.difficulty]++;
    });

    const pct = Utils.percentage(attempted, dayQuestions.length);
    const meta = this.dayMeta[dayNum];
    const title = meta ? meta.title : `Day ${dayNum}`;

    const subjectColors = {
      maths: 'var(--clr-maths)', physics: 'var(--clr-physics)',
      mechanics: 'var(--clr-mechanics)', feee: 'var(--clr-feee)',
      it: 'var(--clr-it)', evs: 'var(--clr-evs)'
    };

    const panel = document.createElement('div');
    panel.className = 'day-info-panel visible';
    panel.id = 'dayInfoPanel';
    panel.innerHTML = `
      <div class="day-info-panel__header">
        <div class="day-info-panel__title">
          <span class="day-info-panel__title-num">${dayNum}</span>
          ${title}
        </div>
        <div class="day-info-panel__subjects">
          ${Array.from(subjects).map(s => {
            const subj = SUBJECTS.find(x => x.id === s);
            return `<span class="day-info-panel__subject-tag" style="background:${subjectColors[s] || 'var(--accent)'}">
              ${subj ? subj.icon : ''} ${(s || '').toUpperCase()}
            </span>`;
          }).join('')}
        </div>
      </div>
      <div class="day-info-panel__stats">
        <span class="day-info-panel__stat">📝 Total: <strong>${dayQuestions.length}</strong></span>
        <span class="day-info-panel__stat">✅ Done: <strong>${attempted}</strong></span>
        <span class="day-info-panel__stat">⭐ Saved: <strong>${bookmarked}</strong></span>
        <span class="day-info-panel__stat">📈 Progress: <strong>${pct}%</strong></span>
        <span class="day-info-panel__stat">🟢 Easy: <strong>${diffs.easy}</strong></span>
        <span class="day-info-panel__stat">🟡 Med: <strong>${diffs.medium}</strong></span>
        <span class="day-info-panel__stat">🔴 Hard: <strong>${diffs.hard}</strong></span>
      </div>
      <div class="day-info-panel__nav">
        <button class="btn btn--sm" onclick="App.jumpToDayByNum(${dayNum - 1})" ${dayNum <= 1 ? 'disabled' : ''}>
          ◀ Day ${dayNum - 1}
        </button>
        <button class="btn btn--sm btn--primary" onclick="App.jumpToDayByNum('all')">
          📚 Show All
        </button>
        <button class="btn btn--sm" onclick="App.jumpToDayByNum(${dayNum + 1})" ${dayNum >= 15 ? 'disabled' : ''}>
          Day ${dayNum + 1} ▶
        </button>
      </div>
    `;

    const jumpBar = document.getElementById('dayJumpBar');
    if (jumpBar) {
      jumpBar.insertAdjacentElement('afterend', panel);
    }
  },

  jumpToDayByNum(day) {
    const btn = document.querySelector(`.day-jump-btn[data-jump="${day}"]`);
    this.jumpToDay(day, btn);
  },

  _updateDayJumpProgress() {
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      const btn = document.querySelector(`.day-jump-btn[data-jump="${d}"]`);
      if (!btn) continue;

      const dayQuestions = this.allQuestions.filter(q => q.day === d);
      if (dayQuestions.length === 0) continue;

      let attempted = 0;
      dayQuestions.forEach(q => {
        if (Progress.getStatus(q.id) === 'attempted') attempted++;
      });

      const pct = Utils.percentage(attempted, dayQuestions.length);

      // Remove old progress bar
      const oldProgress = btn.querySelector('.day-jump-progress');
      if (oldProgress) oldProgress.remove();

      // Add progress bar
      const progressBar = document.createElement('div');
      progressBar.className = 'day-jump-progress';
      progressBar.style.width = pct + '%';
      btn.appendChild(progressBar);

      // Mark completed
      btn.classList.toggle('completed', pct === 100);
    }
  },


  // ============================================
  // 6. FILTER HANDLERS
  // ============================================

  toggleFilter(filterType, value) {
    if (!this.filters[filterType]) return;
    const idx = this.filters[filterType].indexOf(value);
    if (idx > -1) {
      this.filters[filterType].splice(idx, 1);
    } else {
      this.filters[filterType].push(value);
    }
    this.currentPage = 1;
    this._applyFiltersAndRender();
    this._updateFilterUI(filterType);
    if (filterType === 'subjects' || filterType === 'units') {
      Renderer.renderUnitDropdown(this.allQuestions, this.filters);
      Renderer.renderTopicDropdown(this.allQuestions, this.filters);
    }
  },

  toggleDayFilter(day) {
    const idx = this.filters.days.indexOf(day);
    if (idx > -1) {
      this.filters.days.splice(idx, 1);
    } else {
      this.filters.days.push(day);
    }
    this.currentPage = 1;
    this._applyFiltersAndRender();
    document.querySelectorAll('.filter-day-btn').forEach(btn => {
      const d = parseInt(btn.dataset.day);
      btn.classList.toggle('active', this.filters.days.includes(d));
    });
    // Sync day jump bar
    this._syncDayJumpWithFilter();
  },

  _syncDayJumpWithFilter() {
    document.querySelectorAll('.day-jump-btn').forEach(b => b.classList.remove('active'));
    if (this.filters.days.length === 0) {
      const allBtn = document.querySelector('.day-jump-btn[data-jump="all"]');
      if (allBtn) allBtn.classList.add('active');
      this.currentDay = 'all';
    } else if (this.filters.days.length === 1) {
      const btn = document.querySelector(`.day-jump-btn[data-jump="${this.filters.days[0]}"]`);
      if (btn) btn.classList.add('active');
      this.currentDay = this.filters.days[0];
    }
  },

  setFilter(key, value) {
    this.filters[key] = value;
    this.currentPage = 1;
    this._applyFiltersAndRender();
  },

  toggleBookmarkFilter() {
    this.filters.bookmarkedOnly = !this.filters.bookmarkedOnly;
    this.currentPage = 1;
    this._applyFiltersAndRender();
    Renderer.renderBookmarkFilter(this.filters.bookmarkedOnly);
  },

  setSearchQuery(query) {
    this.filters.search = query;
    this.currentPage = 1;
    this._applyFiltersAndRender();
  },

  setMarksMax(max) {
    this.filters.marksMax = parseInt(max);
    this.currentPage = 1;
    this._applyFiltersAndRender();
    Renderer.renderMarksSlider(this.filters.marksMax);
  },

  setUnitFilter(unit) {
    this.filters.units = unit ? [unit] : [];
    this.filters.topics = [];
    this.currentPage = 1;
    this._applyFiltersAndRender();
    Renderer.renderTopicDropdown(this.allQuestions, this.filters);
  },

  setTopicFilter(topic) {
    this.filters.topics = topic ? [topic] : [];
    this.currentPage = 1;
    this._applyFiltersAndRender();
  },

  removeFilterTag(type, value) {
    switch (type) {
      case 'days':
        this.filters.days = this.filters.days.filter(d => d != value);
        this._syncDayJumpWithFilter();
        break;
      case 'subjects': case 'types': case 'difficulty': case 'statuses': case 'confidence': case 'sources':
        this.filters[type] = this.filters[type].filter(v => v !== value);
        break;
      case 'units': this.filters.units = []; this.filters.topics = []; break;
      case 'topics': this.filters.topics = []; break;
      case 'marks': this.filters.marksMin = 1; this.filters.marksMax = 10; break;
      case 'bookmarkedOnly': this.filters.bookmarkedOnly = false; break;
      case 'search': this.filters.search = ''; Renderer.renderSearchInput(''); break;
    }
    this.currentPage = 1;
    this._applyFiltersAndRender();
    Renderer.renderFilterPanel(this.allQuestions, this.filters);
  },

  clearAllFilters() {
    this.filters = Utils.deepClone(DEFAULT_FILTERS);
    this.currentPage = 1;
    this.currentDay = 'all';
    this._applyFiltersAndRender();
    Renderer.renderFilterPanel(this.allQuestions, this.filters);
    this._syncDayJumpWithFilter();
    // Remove day info panel
    const panel = document.getElementById('dayInfoPanel');
    if (panel) panel.remove();
    Renderer.showToast('🔄 All filters cleared', 'info');
  },

  _updateFilterUI(filterType) {
    const container = {
      subjects: Renderer._els.filterSubjects,
      types: Renderer._els.filterTypes,
      difficulty: Renderer._els.filterDifficulty,
      statuses: Renderer._els.filterStatuses,
      confidence: Renderer._els.filterConfidence,
      sources: Renderer._els.filterSources
    }[filterType];
    if (!container) return;
    container.querySelectorAll('.filter-pill').forEach(pill => {
      const value = pill.dataset.value;
      pill.classList.toggle('active', this.filters[filterType].includes(value));
    });
  },


  // ============================================
  // 7. QUESTION INTERACTION HANDLERS
  // ============================================

  handleMCQSelect(qId, optionIndex) {
    Progress.saveAnswer(qId, optionIndex);
    Renderer.updateMCQSelection(qId, optionIndex);
    Renderer.updateStatus(qId, 'attempted');
    this._updateDashboard();
    Sounds.click();
  },

  handleTFSelect(qId, value) {
    Progress.saveAnswer(qId, value);
    Renderer.updateTFSelection(qId, value);
    Renderer.updateStatus(qId, 'attempted');
    this._updateDashboard();
    Sounds.click();
  },

  handleTextInput(qId, value) {
    if (value && value.toString().trim() !== '') {
      Progress.saveAnswer(qId, value);
      Progress.setStatus(qId, 'attempted');
      Renderer.updateStatus(qId, 'attempted');
    }
    this._updateDashboard();
  },

  handleMatchSelect(qId, matchIndex, selectedRight) {
    const currentAnswers = Progress.getAnswer(qId) || {};
    currentAnswers[matchIndex] = selectedRight;
    Progress.saveAnswer(qId, currentAnswers);
    Renderer.updateStatus(qId, 'attempted');
    this._updateDashboard();
  },

  handleBookmark(qId) {
    const newState = Progress.toggleBookmark(qId);
    Renderer.updateBookmark(qId, newState);
    this._updateDashboard();
    Renderer.showToast(newState ? '⭐ Bookmarked!' : '☆ Removed bookmark', 'info');
    Sounds.click();
  },

  handleConfidence(qId, level) {
    const currentConf = Progress.getConfidence(qId);
    const newLevel = currentConf === level ? null : level;
    if (newLevel) {
      Progress.setConfidence(qId, newLevel);
    } else {
      Progress.update(qId, { confidence: null });
    }
    Renderer.updateConfidence(qId, newLevel);
    this._updateDashboard();
    Sounds.click();
  },

  handleStatusChange(qId, status) {
    const currentStatus = Progress.getStatus(qId);
    const newStatus = currentStatus === status ? 'not-attempted' : status;
    Progress.setStatus(qId, newStatus);
    Renderer.updateStatus(qId, newStatus);
    this._updateDashboard();
    Sounds.click();
    if (newStatus === 'attempted') Streak.update();
  },

  handleHintToggle(qId) {
    if (!this.settings.showHints) {
      Renderer.showToast('💡 Hints are disabled in settings', 'warning');
      return;
    }
    Renderer.toggleHint(qId);
  },

  handleTagClick(tag) {
    this.filters.search = tag;
    Renderer.renderSearchInput(tag);
    this.currentPage = 1;
    this._applyFiltersAndRender();
    Renderer.scrollTo('.results-bar');
    Renderer.showToast(`🔍 Filtered by #${tag}`, 'info');
  },


  // ============================================
  // 8. VIEW & SORT
  // ============================================

  setViewMode(mode) {
    this.settings.viewMode = mode;
    Storage.save(STORAGE_KEYS.SETTINGS, this.settings);
    Renderer.setActiveViewMode(mode);
    this._applyFiltersAndRender();
  },

  setSortBy(sortBy) {
    this.settings.sortBy = sortBy;
    Storage.save(STORAGE_KEYS.SETTINGS, this.settings);
    Renderer.setActiveSortOption(sortBy);
    this.currentPage = 1;
    this._applyFiltersAndRender();
  },

  goToPage(page) {
    this.currentPage = page;
    this._applyFiltersAndRender();
    Renderer.scrollToTop();
  },


  // ============================================
  // 9. THEME & SETTINGS
  // ============================================

  toggleTheme() {
    this.settings.theme = this.settings.theme === 'dark' ? 'light' : 'dark';
    Storage.save(STORAGE_KEYS.SETTINGS, this.settings);
    Renderer.applyTheme(this.settings.theme);
    Renderer.showToast(this.settings.theme === 'dark' ? '🌙 Dark mode' : '☀️ Light mode', 'info');
  },

  updateSetting(key, value) {
    this.settings[key] = value;
    Storage.save(STORAGE_KEYS.SETTINGS, this.settings);
    switch (key) {
      case 'theme': Renderer.applyTheme(value); break;
      case 'soundEffects': Sounds.setEnabled(value); break;
      case 'perPage': this.currentPage = 1; this._applyFiltersAndRender(); break;
    }
  },

  openSettings() {
    Renderer.renderSettings(this.settings);
    Renderer.openModal('settingsModal');
    this._bindSettingsEvents();
  },


  // ============================================
  // 10. ANALYTICS
  // ============================================

  openAnalytics() {
    if (!this.dataLoaded) { Renderer.showToast('📊 Data not loaded yet', 'warning'); return; }
    const stats = StatsCalculator.calculate(this.allQuestions);
    Renderer.renderAnalytics(stats, this.allQuestions);
    Renderer.openModal('analyticsModal');
  },


  // ============================================
  // 11. PRACTICE MODE
  // ============================================

  openPracticeSetup() {
    if (!this.dataLoaded) { Renderer.showToast('📚 Data not loaded yet', 'warning'); return; }
    this.practiceConfig = {
      subjects: SUBJECTS.map(s => s.id),
      difficulty: DIFFICULTIES.map(d => d.id),
      types: QUESTION_TYPES.map(t => t.id),
      count: 20, timer: 60, shuffle: true
    };
    Renderer.renderPracticeSetup();
    Renderer.openModal('practiceModal');
    this._bindPracticeSetupEvents();
  },

  startPractice() {
    let questions = [...this.allQuestions];
    questions = Filters.bySubject(questions, this.practiceConfig.subjects);
    questions = Filters.byDifficulty(questions, this.practiceConfig.difficulty);
    questions = Filters.byType(questions, this.practiceConfig.types);

    // If on a specific day, filter by that day too
    if (this.currentDay !== 'all') {
      questions = questions.filter(q => q.day === parseInt(this.currentDay));
    }

    if (questions.length === 0) { Renderer.showToast('❌ No questions match your criteria', 'error'); return; }
    if (this.practiceConfig.shuffle) questions = Utils.shuffleArray(questions);
    if (this.practiceConfig.count !== 'all') {
      questions = questions.slice(0, parseInt(this.practiceConfig.count));
    }

    this.practiceQuestions = questions;
    this.practiceCurrentIndex = 0;
    this.practiceActive = true;
    this.practiceStartTime = Date.now();

    if (this.practiceConfig.timer > 0) {
      if (this.practiceTimer) this.practiceTimer.destroy();
      this.practiceTimer = new StudyTimer(
        (remaining) => {
          const display = document.getElementById('practiceTimerDisplay');
          if (display) display.textContent = Utils.formatTime(remaining);
        },
        () => {
          Renderer.showToast('⏰ Time up! Moving to next...', 'warning');
          this._practiceNext();
        }
      );
      this.practiceTimer.setDuration(this.practiceConfig.timer / 60);
    }

    this._renderCurrentPracticeQuestion();
    this._bindPracticeActiveEvents();
    if (this.practiceTimer) this.practiceTimer.start();
    Renderer.showToast(`🚀 Practice started! ${this.practiceQuestions.length} questions`, 'success');
  },

  _renderCurrentPracticeQuestion() {
    const timerSeconds = this.practiceTimer ? this.practiceTimer.getRemaining() : 0;
    Renderer.renderPracticeQuestion(this.practiceQuestions, this.practiceCurrentIndex, this.practiceConfig.timer > 0 ? timerSeconds : 0);
    this._bindPracticeActiveEvents();
  },

  _practiceNext() {
    if (this.practiceCurrentIndex >= this.practiceQuestions.length - 1) { this._endPractice(); return; }
    this.practiceCurrentIndex++;
    if (this.practiceTimer) { this.practiceTimer.reset(); this.practiceTimer.start(); }
    this._renderCurrentPracticeQuestion();
  },

  _practicePrev() {
    if (this.practiceCurrentIndex <= 0) return;
    this.practiceCurrentIndex--;
    if (this.practiceTimer) { this.practiceTimer.reset(); this.practiceTimer.start(); }
    this._renderCurrentPracticeQuestion();
  },

  _practiceSkip() {
    const q = this.practiceQuestions[this.practiceCurrentIndex];
    if (q) Progress.setStatus(q.id, 'skipped');
    this._practiceNext();
  },

  _practiceGoTo(index) {
    if (index < 0 || index >= this.practiceQuestions.length) return;
    this.practiceCurrentIndex = index;
    if (this.practiceTimer) { this.practiceTimer.reset(); this.practiceTimer.start(); }
    this._renderCurrentPracticeQuestion();
  },

  _endPractice() {
    this.practiceActive = false;
    if (this.practiceTimer) this.practiceTimer.stop();
    const elapsed = Math.floor((Date.now() - this.practiceStartTime) / 1000);
    let attempted = 0, skipped = 0;
    this.practiceQuestions.forEach(q => {
      const s = Progress.getStatus(q.id);
      if (s === 'attempted') attempted++;
      else if (s === 'skipped') skipped++;
    });
    PracticeHistory.save({
      count: this.practiceQuestions.length, attempted, skipped, time: elapsed,
      subjects: this.practiceConfig.subjects, difficulty: this.practiceConfig.difficulty
    });
    Streak.update();
    Renderer.renderPracticeSummary(this.practiceQuestions, elapsed);
    this._bindPracticeSummaryEvents();
    this._updateDashboard();
    if (attempted === this.practiceQuestions.length) { Renderer.launchConfetti(); Sounds.success(); }
    Renderer.showToast('🎉 Practice complete!', 'success');
  },


  // ============================================
  // 12. IMPORT / EXPORT
  // ============================================

  exportProgress() {
    const data = Progress.export();
    const filename = `practice-progress-${new Date().toISOString().split('T')[0]}.json`;
    Utils.downloadFile(data, filename);
    Renderer.showToast('📤 Progress exported!', 'success');
  },

  triggerImport() {
    const fileInput = document.getElementById('importFileInput');
    if (fileInput) fileInput.click();
  },

  async handleImport(file) {
    try {
      const content = await Utils.readFile(file);
      const success = Progress.import(content);
      if (success) {
        Renderer.showToast('📥 Progress imported successfully!', 'success');
        this._applyFiltersAndRender();
        this._updateDashboard();
      } else {
        Renderer.showToast('❌ Invalid file format', 'error');
      }
    } catch (error) {
      console.error('[App] Import failed:', error);
      Renderer.showToast('❌ Failed to import file', 'error');
    }
  },

  resetAllData() {
    if (!confirm('⚠️ Are you sure you want to reset ALL progress? This cannot be undone!')) return;
    if (!confirm('🗑️ Last chance! All progress, bookmarks, answers deleted.')) return;
    Storage.clearAll();
    this.filters = Utils.deepClone(DEFAULT_FILTERS);
    this.settings = { ...DEFAULT_SETTINGS };
    this.currentPage = 1;
    this.currentDay = 'all';
    Renderer.applyTheme(this.settings.theme);
    this._applyFiltersAndRender();
    this._updateDashboard();
    Renderer.renderFilterPanel(this.allQuestions, this.filters);
    this._syncDayJumpWithFilter();
    Renderer.closeAllModals();
    const panel = document.getElementById('dayInfoPanel');
    if (panel) panel.remove();
    Renderer.showToast('🗑️ All data has been reset', 'warning');
  },


  // ============================================
  // 13. EVENT BINDING — MAIN
  // ============================================

  _bindEvents() {
    // Header buttons
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) themeBtn.addEventListener('click', () => this.toggleTheme());
    const analyticsBtn = document.getElementById('analyticsBtn');
    if (analyticsBtn) analyticsBtn.addEventListener('click', () => this.openAnalytics());
    const practiceBtn = document.getElementById('practiceBtn');
    if (practiceBtn) practiceBtn.addEventListener('click', () => this.openPracticeSetup());
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) settingsBtn.addEventListener('click', () => this.openSettings());

    // Filter panel toggle
    const filterHeader = document.querySelector('.filter-panel__header');
    if (filterHeader) filterHeader.addEventListener('click', () => Renderer.toggleFilterPanel());

    // Delegated filter clicks
    document.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill[data-filter-type]');
      if (pill && !pill.closest('#practiceSetupForm')) {
        this.toggleFilter(pill.dataset.filterType, pill.dataset.value);
        return;
      }
      const dayBtn = e.target.closest('.filter-day-btn');
      if (dayBtn) { this.toggleDayFilter(parseInt(dayBtn.dataset.day)); return; }
      if (e.target.closest('#filterBookmarkBtn')) { this.toggleBookmarkFilter(); return; }
      if (e.target.closest('#clearFiltersBtn')) { this.clearAllFilters(); return; }
      const removeTag = e.target.closest('.filter-active-tag__remove');
      if (removeTag) { this.removeFilterTag(removeTag.dataset.removeType, removeTag.dataset.removeValue); return; }
    });

    // Dropdowns
    const unitSelect = document.getElementById('filterUnit');
    if (unitSelect) unitSelect.addEventListener('change', (e) => this.setUnitFilter(e.target.value));
    const topicSelect = document.getElementById('filterTopic');
    if (topicSelect) topicSelect.addEventListener('change', (e) => this.setTopicFilter(e.target.value));

    // Marks slider
    const marksSlider = document.getElementById('filterMarksSlider');
    if (marksSlider) {
      marksSlider.addEventListener('input', (e) => {
        if (Renderer._els.filterMarksValue) Renderer._els.filterMarksValue.textContent = e.target.value;
      });
      marksSlider.addEventListener('change', (e) => this.setMarksMax(e.target.value));
    }

    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      const debouncedSearch = Utils.debounce((query) => this.setSearchQuery(query), 350);
      searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
    }

    // Sort
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.addEventListener('change', (e) => this.setSortBy(e.target.value));

    // View mode
    document.querySelectorAll('.results-bar__view-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setViewMode(btn.dataset.view));
    });

    // Question interactions (delegated)
    document.addEventListener('click', (e) => {
      const option = e.target.closest('.q-card__option');
      if (option) { this.handleMCQSelect(option.dataset.qid, parseInt(option.dataset.optionIndex)); return; }
      const tfBtn = e.target.closest('.q-card__tf-btn');
      if (tfBtn) { this.handleTFSelect(tfBtn.dataset.qid, tfBtn.dataset.tfValue); return; }
      const bookmarkBtn = e.target.closest('.btn-bookmark');
      if (bookmarkBtn) { this.handleBookmark(bookmarkBtn.dataset.qid); return; }
      const hintBtn = e.target.closest('.btn-hint');
      if (hintBtn) { this.handleHintToggle(hintBtn.dataset.qid); return; }
      const confBtn = e.target.closest('.q-card__conf-btn');
      if (confBtn) { this.handleConfidence(confBtn.dataset.qid, confBtn.dataset.conf); return; }
      const statusBtn = e.target.closest('.q-card__status-btn');
      if (statusBtn) { this.handleStatusChange(statusBtn.dataset.qid, statusBtn.dataset.status); return; }
      const tagEl = e.target.closest('.q-card__tag');
      if (tagEl) { this.handleTagClick(tagEl.dataset.tag); return; }
    });

    // Text inputs (delegated, debounced)
    const debouncedTextSave = Utils.debounce((qId, value) => this.handleTextInput(qId, value), 500);
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('q-card__fill-input') ||
          e.target.classList.contains('q-card__num-input') ||
          e.target.classList.contains('q-card__textarea')) {
        debouncedTextSave(e.target.dataset.qid, e.target.value);
      }
    });

    // Match select
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('q-card__match-select')) {
        const selectedRight = e.target.value !== '' ? parseInt(e.target.value) : null;
        this.handleMatchSelect(e.target.dataset.qid, parseInt(e.target.dataset.matchIndex), selectedRight);
      }
    });

    // Pagination
    document.addEventListener('click', (e) => {
      const pageBtn = e.target.closest('.pagination__btn');
      if (pageBtn && !pageBtn.disabled) this.goToPage(parseInt(pageBtn.dataset.page));
    });

    // Modal backdrop
    const backdrop = document.getElementById('modalBackdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        if (this.practiceActive) return;
        Renderer.closeAllModals();
      });
    }

    // Modal close buttons
    document.querySelectorAll('.modal__close').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (modal) {
          if (this.practiceActive && modal.id === 'practiceModal') {
            if (confirm('⚠️ End practice session?')) { this._endPractice(); Renderer.closeModal(modal.id); }
          } else {
            Renderer.closeModal(modal.id);
          }
        }
      });
    });

    // FAB
    const fabTop = document.getElementById('fabScrollTop');
    if (fabTop) fabTop.addEventListener('click', () => Renderer.scrollToTop());

    // Hero buttons
    const heroPractice = document.getElementById('heroPracticeBtn');
    if (heroPractice) heroPractice.addEventListener('click', () => this.openPracticeSetup());
    const heroAnalytics = document.getElementById('heroAnalyticsBtn');
    if (heroAnalytics) heroAnalytics.addEventListener('click', () => this.openAnalytics());

    // Save on unload
    window.addEventListener('beforeunload', () => {
      Storage.save(STORAGE_KEYS.FILTERS, this.filters);
      Storage.save(STORAGE_KEYS.SETTINGS, this.settings);
    });
  },


  // ============================================
  // 14. EVENT BINDING — PRACTICE SETUP
  // ============================================

  _bindPracticeSetupEvents() {
    document.querySelectorAll('[data-practice-filter]').forEach(pill => {
      pill.addEventListener('click', () => {
        const filterKey = pill.dataset.practiceFilter;
        switch (filterKey) {
          case 'subject': {
            const subj = pill.dataset.subject;
            pill.classList.toggle('active');
            if (pill.classList.contains('active')) {
              if (!this.practiceConfig.subjects.includes(subj)) this.practiceConfig.subjects.push(subj);
            } else {
              this.practiceConfig.subjects = this.practiceConfig.subjects.filter(s => s !== subj);
            }
            break;
          }
          case 'difficulty': {
            const diff = pill.dataset.diff;
            pill.classList.toggle('active');
            if (pill.classList.contains('active')) {
              if (!this.practiceConfig.difficulty.includes(diff)) this.practiceConfig.difficulty.push(diff);
            } else {
              this.practiceConfig.difficulty = this.practiceConfig.difficulty.filter(d => d !== diff);
            }
            break;
          }
          case 'type': {
            const type = pill.dataset.type;
            pill.classList.toggle('active');
            if (pill.classList.contains('active')) {
              if (!this.practiceConfig.types.includes(type)) this.practiceConfig.types.push(type);
            } else {
              this.practiceConfig.types = this.practiceConfig.types.filter(t => t !== type);
            }
            break;
          }
          case 'count': {
            document.querySelectorAll('[data-practice-filter="count"]').forEach(b => b.classList.remove('active'));
            pill.classList.add('active');
            this.practiceConfig.count = pill.dataset.count;
            break;
          }
          case 'timer': {
            document.querySelectorAll('[data-practice-filter="timer"]').forEach(b => b.classList.remove('active'));
            pill.classList.add('active');
            this.practiceConfig.timer = parseInt(pill.dataset.timer);
            break;
          }
          case 'shuffle': {
            document.querySelectorAll('[data-practice-filter="shuffle"]').forEach(b => b.classList.remove('active'));
            pill.classList.add('active');
            this.practiceConfig.shuffle = pill.dataset.shuffle === 'true';
            break;
          }
        }
      });
    });
    const startBtn = document.getElementById('startPracticeBtn');
    if (startBtn) startBtn.addEventListener('click', () => this.startPractice());
  },


  // ============================================
  // 15. EVENT BINDING — PRACTICE ACTIVE
  // ============================================

  _bindPracticeActiveEvents() {
    const prevBtn = document.getElementById('practicePrevBtn');
    if (prevBtn) prevBtn.onclick = () => this._practicePrev();
    const nextBtn = document.getElementById('practiceNextBtn');
    if (nextBtn) nextBtn.onclick = () => this._practiceNext();
    const skipBtn = document.getElementById('practiceSkipBtn');
    if (skipBtn) skipBtn.onclick = () => this._practiceSkip();
    const hintBtn = document.getElementById('practiceHintBtn');
    if (hintBtn) hintBtn.onclick = () => {
      const q = this.practiceQuestions[this.practiceCurrentIndex];
      if (q) this.handleHintToggle(q.id);
    };
    document.querySelectorAll('[data-practice-goto]').forEach(btn => {
      btn.onclick = () => this._practiceGoTo(parseInt(btn.dataset.practiceGoto));
    });
  },


  // ============================================
  // 16. EVENT BINDING — PRACTICE SUMMARY
  // ============================================

  _bindPracticeSummaryEvents() {
    const retryBtn = document.getElementById('practiceRetryBtn');
    if (retryBtn) retryBtn.onclick = () => { Renderer.renderPracticeSetup(); this._bindPracticeSetupEvents(); };
    const closeBtn = document.getElementById('practiceCloseBtn');
    if (closeBtn) closeBtn.onclick = () => Renderer.closeModal('practiceModal');
  },


  // ============================================
  // 17. EVENT BINDING — SETTINGS
  // ============================================

  _bindSettingsEvents() {
    const themeToggle = document.getElementById('settingTheme');
    if (themeToggle) themeToggle.onchange = () => this.updateSetting('theme', themeToggle.checked ? 'dark' : 'light');
    const animToggle = document.getElementById('settingAnimations');
    if (animToggle) animToggle.onchange = () => this.updateSetting('animations', animToggle.checked);
    const hintsToggle = document.getElementById('settingHints');
    if (hintsToggle) hintsToggle.onchange = () => this.updateSetting('showHints', hintsToggle.checked);
    const tagsToggle = document.getElementById('settingTags');
    if (tagsToggle) tagsToggle.onchange = () => this.updateSetting('showTags', tagsToggle.checked);
    const soundToggle = document.getElementById('settingSound');
    if (soundToggle) soundToggle.onchange = () => this.updateSetting('soundEffects', soundToggle.checked);
    const perPageSelect = document.getElementById('settingPerPage');
    if (perPageSelect) perPageSelect.onchange = () => this.updateSetting('perPage', parseInt(perPageSelect.value));
    const exportBtn = document.getElementById('settingExport');
    if (exportBtn) exportBtn.onclick = () => this.exportProgress();
    const importBtn = document.getElementById('settingImport');
    if (importBtn) importBtn.onclick = () => this.triggerImport();
    const importInput = document.getElementById('importFileInput');
    if (importInput) importInput.onchange = (e) => { if (e.target.files[0]) this.handleImport(e.target.files[0]); };
    const resetBtn = document.getElementById('settingReset');
    if (resetBtn) resetBtn.onclick = () => this.resetAllData();
  },


  // ============================================
  // 18. KEYBOARD SHORTCUTS
  // ============================================

  _setupKeyboardShortcuts() {
    Keyboard.on('t', () => this.toggleTheme());

    Keyboard.on('f', () => {
      const input = document.getElementById('searchInput');
      if (input) { input.focus(); Renderer.scrollTo('.search-wrapper'); }
    });

    Keyboard.on('ctrl+f', () => Renderer.toggleFilterPanel());

    Keyboard.on('escape', () => {
      if (this.practiceActive) {
        if (confirm('⚠️ End practice?')) { this._endPractice(); Renderer.closeAllModals(); }
      } else {
        Renderer.closeAllModals();
      }
    });

    // Practice mode shortcuts
    Keyboard.on('n', () => { if (this.practiceActive) this._practiceNext(); });
    Keyboard.on('p', () => { if (this.practiceActive) this._practicePrev(); });
    Keyboard.on('b', () => {
      if (this.practiceActive) {
        const q = this.practiceQuestions[this.practiceCurrentIndex];
        if (q) this.handleBookmark(q.id);
      }
    });
    Keyboard.on('h', () => {
      if (this.practiceActive) {
        const q = this.practiceQuestions[this.practiceCurrentIndex];
        if (q) this.handleHintToggle(q.id);
      }
    });
    Keyboard.on('s', () => { if (this.practiceActive) this._practiceSkip(); });

    // MCQ shortcuts
    ['1', '2', '3', '4'].forEach((key, i) => {
      Keyboard.on(key, () => {
        if (this.practiceActive) {
          const q = this.practiceQuestions[this.practiceCurrentIndex];
          if (q && q.type === 'mcq' && q.options && q.options[i]) {
            this.handleMCQSelect(q.id, i);
            this._renderCurrentPracticeQuestion();
          }
        }
      });
    });

    // Day navigation
    Keyboard.on('shift+right', () => {
      const currentDay = this.filters.days.length === 1 ? this.filters.days[0] : 0;
      const nextDay = Math.min(currentDay + 1, 15);
      if (nextDay >= 1) this.jumpToDayByNum(nextDay);
    });

    Keyboard.on('shift+left', () => {
      const currentDay = this.filters.days.length === 1 ? this.filters.days[0] : 16;
      const prevDay = Math.max(currentDay - 1, 1);
      if (prevDay >= 1) this.jumpToDayByNum(prevDay);
    });

    Keyboard.on('shift+a', () => this.jumpToDayByNum('all'));

    Keyboard.on('a', () => { if (!this.practiceActive) this.openAnalytics(); });
    Keyboard.on('shift+t', () => Renderer.scrollToTop());
  }
};


// ============================================
// BOOTSTRAP
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});