/* ============================================
   APP.JS — Core Logic, State, Event Handling
   WB Diploma Sem-II | Practice Questions App
   ============================================ */

'use strict';

// ============================================
// 1. APPLICATION STATE
// ============================================

const App = {

  /** @type {Array} All questions merged from all JSON files */
  allQuestions: [],

  /** @type {Array} Questions after applying filters */
  filteredQuestions: [],

  /** @type {Object} Day metadata { 1: { title, totalQuestions }, ... } */
  dayMeta: {},

  /** @type {Object} Current active filters — matches DEFAULT_FILTERS shape */
  filters: null,

  /** @type {Object} App settings */
  settings: null,

  /** @type {number} Current page (1-based) */
  currentPage: 1,

  /** @type {boolean} Whether data has been loaded */
  dataLoaded: false,

  /** @type {StudyTimer|null} Timer instance for practice mode */
  practiceTimer: null,

  /** @type {Array} Questions selected for current practice session */
  practiceQuestions: [],

  /** @type {number} Current question index in practice mode (0-based) */
  practiceCurrentIndex: 0,

  /** @type {Object} Practice mode configuration */
  practiceConfig: {
    subjects: [],
    difficulty: [],
    types: [],
    count: 20,
    timer: 60,
    shuffle: true
  },

  /** @type {boolean} Whether practice mode is active */
  practiceActive: false,

  /** @type {number} Practice start timestamp */
  practiceStartTime: 0,


  // ============================================
  // 2. INITIALIZATION
  // ============================================

  /**
   * Initialize the application
   * Called on DOMContentLoaded
   */
  async init() {
    console.log('[App] Initializing...');

    // Cache DOM elements
    Renderer.cacheElements();

    // Load saved settings
    this.settings = Storage.load(STORAGE_KEYS.SETTINGS, { ...DEFAULT_SETTINGS });

    // Load saved filters
    this.filters = Storage.load(STORAGE_KEYS.FILTERS, Utils.deepClone(DEFAULT_FILTERS));

    // Apply theme
    Renderer.applyTheme(this.settings.theme);

    // Initialize keyboard shortcuts
    Keyboard.init();
    this._setupKeyboardShortcuts();

    // Initialize sounds
    Sounds.setEnabled(this.settings.soundEffects);

    // Show loading state
    Renderer.renderSkeletons(5);

    // Bind all event listeners
    this._bindEvents();

    // Load question data
    await this._loadData();

    // Update streak
    Streak.update();

    console.log('[App] Initialized successfully.');
  },


  // ============================================
  // 3. DATA LOADING
  // ============================================

  /**
   * Load all question data from JSON files
   */
  async _loadData() {
    Renderer.renderLoading('Loading questions...');

    try {
      const result = await DataLoader.loadAll((loaded, total) => {
        // Progress callback — could update a loading bar
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

      // Initial render
      this._applyFiltersAndRender();

      // Render dashboard
      this._updateDashboard();

      // Render filter panel
      Renderer.renderFilterPanel(this.allQuestions, this.filters);

      // Set view mode
      Renderer.setActiveViewMode(this.settings.viewMode);

      // Set sort option
      Renderer.setActiveSortOption(this.settings.sortBy);

      // Show welcome toast
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

  /**
   * Apply all filters, sort, paginate, and render questions
   */
  _applyFiltersAndRender() {
    // Step 1: Apply filters
    this.filteredQuestions = Filters.applyAll(this.allQuestions, this.filters);

    // Step 2: Sort
    this.filteredQuestions = Sorter.sort(this.filteredQuestions, this.settings.sortBy);

    // Step 3: Paginate
    const paginated = Utils.paginate(
      this.filteredQuestions,
      this.currentPage,
      this.settings.perPage
    );

    // Step 4: Render
    Renderer.renderQuestions(
      paginated.items,
      this.settings.viewMode,
      this.filters.search
    );

    // Step 5: Update results bar
    Renderer.renderResultsBar(this.filteredQuestions.length, this.allQuestions.length);

    // Step 6: Update pagination
    Renderer.renderPagination(paginated.currentPage, paginated.totalPages, paginated.totalItems);

    // Step 7: Update filter panel
    Renderer.renderActiveFilterTags(this.filters);
    Renderer.updateFilterCount(this.filters);

    // Step 8: Save filters to storage
    Storage.save(STORAGE_KEYS.FILTERS, this.filters);

    // Adjust current page if needed
    this.currentPage = paginated.currentPage;
  },

  /**
   * Update dashboard stats
   */
  _updateDashboard() {
    if (!this.dataLoaded) return;
    const stats = StatsCalculator.calculate(this.allQuestions);
    Renderer.renderDashboard(stats);
    Renderer.renderProgressBar(stats.completionPct);
  },


  // ============================================
  // 5. FILTER HANDLERS
  // ============================================

  /**
   * Toggle a filter value in an array-type filter
   * @param {string} filterType — e.g. 'subjects', 'types', 'difficulty'
   * @param {*} value — Value to toggle
   */
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

    // Update specific filter UI
    this._updateFilterUI(filterType);

    // If subject changed, update unit/topic dropdowns
    if (filterType === 'subjects' || filterType === 'units') {
      Renderer.renderUnitDropdown(this.allQuestions, this.filters);
      Renderer.renderTopicDropdown(this.allQuestions, this.filters);
    }
  },

  /**
   * Toggle day filter
   * @param {number} day
   */
  toggleDayFilter(day) {
    const idx = this.filters.days.indexOf(day);
    if (idx > -1) {
      this.filters.days.splice(idx, 1);
    } else {
      this.filters.days.push(day);
    }

    this.currentPage = 1;
    this._applyFiltersAndRender();

    // Update day buttons UI
    document.querySelectorAll('.filter-day-btn').forEach(btn => {
      const d = parseInt(btn.dataset.day);
      btn.classList.toggle('active', this.filters.days.includes(d));
    });
  },

  /**
   * Set a non-array filter value
   * @param {string} key — Filter key
   * @param {*} value
   */
  setFilter(key, value) {
    this.filters[key] = value;
    this.currentPage = 1;
    this._applyFiltersAndRender();
  },

  /**
   * Toggle bookmark-only filter
   */
  toggleBookmarkFilter() {
    this.filters.bookmarkedOnly = !this.filters.bookmarkedOnly;
    this.currentPage = 1;
    this._applyFiltersAndRender();
    Renderer.renderBookmarkFilter(this.filters.bookmarkedOnly);
  },

  /**
   * Set search query
   * @param {string} query
   */
  setSearchQuery(query) {
    this.filters.search = query;
    this.currentPage = 1;
    this._applyFiltersAndRender();
  },

  /**
   * Set marks range
   * @param {number} max
   */
  setMarksMax(max) {
    this.filters.marksMax = parseInt(max);
    this.currentPage = 1;
    this._applyFiltersAndRender();
    Renderer.renderMarksSlider(this.filters.marksMax);
  },

  /**
   * Set unit filter from dropdown
   * @param {string} unit
   */
  setUnitFilter(unit) {
    this.filters.units = unit ? [unit] : [];
    // Reset topic when unit changes
    this.filters.topics = [];
    this.currentPage = 1;
    this._applyFiltersAndRender();
    Renderer.renderTopicDropdown(this.allQuestions, this.filters);
  },

  /**
   * Set topic filter from dropdown
   * @param {string} topic
   */
  setTopicFilter(topic) {
    this.filters.topics = topic ? [topic] : [];
    this.currentPage = 1;
    this._applyFiltersAndRender();
  },

  /**
   * Remove a specific active filter tag
   * @param {string} type — Filter type
   * @param {*} value — Value to remove
   */
  removeFilterTag(type, value) {
    switch (type) {
      case 'days':
        this.filters.days = this.filters.days.filter(d => d != value);
        break;
      case 'subjects':
      case 'types':
      case 'difficulty':
      case 'statuses':
      case 'confidence':
      case 'sources':
        this.filters[type] = this.filters[type].filter(v => v !== value);
        break;
      case 'units':
        this.filters.units = [];
        this.filters.topics = [];
        break;
      case 'topics':
        this.filters.topics = [];
        break;
      case 'marks':
        this.filters.marksMin = 1;
        this.filters.marksMax = 10;
        break;
      case 'bookmarkedOnly':
        this.filters.bookmarkedOnly = false;
        break;
      case 'search':
        this.filters.search = '';
        Renderer.renderSearchInput('');
        break;
    }

    this.currentPage = 1;
    this._applyFiltersAndRender();
    Renderer.renderFilterPanel(this.allQuestions, this.filters);
  },

  /**
   * Clear all filters
   */
  clearAllFilters() {
    this.filters = Utils.deepClone(DEFAULT_FILTERS);
    this.currentPage = 1;
    this._applyFiltersAndRender();
    Renderer.renderFilterPanel(this.allQuestions, this.filters);
    Renderer.showToast('🔄 All filters cleared', 'info');
  },

  /**
   * Update filter pill UI after toggle
   * @param {string} filterType
   */
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
  // 6. QUESTION INTERACTION HANDLERS
  // ============================================

  /**
   * Handle MCQ option click
   * @param {string} qId
   * @param {number} optionIndex
   */
  handleMCQSelect(qId, optionIndex) {
    Progress.saveAnswer(qId, optionIndex);
    Renderer.updateMCQSelection(qId, optionIndex);
    Renderer.updateStatus(qId, 'attempted');
    this._updateDashboard();
    Sounds.click();
  },

  /**
   * Handle True/False selection
   * @param {string} qId
   * @param {string} value — 'true' or 'false'
   */
  handleTFSelect(qId, value) {
    Progress.saveAnswer(qId, value);
    Renderer.updateTFSelection(qId, value);
    Renderer.updateStatus(qId, 'attempted');
    this._updateDashboard();
    Sounds.click();
  },

  /**
   * Handle text input change (fill-blank, numerical, short, long)
   * @param {string} qId
   * @param {*} value
   */
  handleTextInput(qId, value) {
    if (value && value.toString().trim() !== '') {
      Progress.saveAnswer(qId, value);
      Progress.setStatus(qId, 'attempted');
      Renderer.updateStatus(qId, 'attempted');
    }
    this._updateDashboard();
  },

  /**
   * Handle match selection change
   * @param {string} qId
   * @param {number} matchIndex — Which left item
   * @param {number} selectedRight — Selected right item index
   */
  handleMatchSelect(qId, matchIndex, selectedRight) {
    const currentAnswers = Progress.getAnswer(qId) || {};
    currentAnswers[matchIndex] = selectedRight;
    Progress.saveAnswer(qId, currentAnswers);
    Renderer.updateStatus(qId, 'attempted');
    this._updateDashboard();
  },

  /**
   * Handle bookmark toggle
   * @param {string} qId
   */
  handleBookmark(qId) {
    const newState = Progress.toggleBookmark(qId);
    Renderer.updateBookmark(qId, newState);
    this._updateDashboard();
    Renderer.showToast(newState ? '⭐ Bookmarked!' : '☆ Removed bookmark', 'info');
    Sounds.click();
  },

  /**
   * Handle confidence selection
   * @param {string} qId
   * @param {string} level
   */
  handleConfidence(qId, level) {
    const currentConf = Progress.getConfidence(qId);
    // Toggle off if same level clicked
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

  /**
   * Handle status button click
   * @param {string} qId
   * @param {string} status — 'attempted' or 'skipped'
   */
  handleStatusChange(qId, status) {
    const currentStatus = Progress.getStatus(qId);
    // Toggle off if same status clicked
    const newStatus = currentStatus === status ? 'not-attempted' : status;

    Progress.setStatus(qId, newStatus);
    Renderer.updateStatus(qId, newStatus);
    this._updateDashboard();
    Sounds.click();

    if (newStatus === 'attempted') {
      Streak.update();
    }
  },

  /**
   * Handle hint toggle
   * @param {string} qId
   */
  handleHintToggle(qId) {
    if (!this.settings.showHints) {
      Renderer.showToast('💡 Hints are disabled in settings', 'warning');
      return;
    }
    Renderer.toggleHint(qId);
  },

  /**
   * Handle tag click (quick filter)
   * @param {string} tag
   */
  handleTagClick(tag) {
    this.filters.search = tag;
    Renderer.renderSearchInput(tag);
    this.currentPage = 1;
    this._applyFiltersAndRender();
    Renderer.scrollTo('.results-bar');
    Renderer.showToast(`🔍 Filtered by #${tag}`, 'info');
  },


  // ============================================
  // 7. VIEW & SORT HANDLERS
  // ============================================

  /**
   * Change view mode
   * @param {string} mode — 'card' | 'compact' | 'list'
   */
  setViewMode(mode) {
    this.settings.viewMode = mode;
    Storage.save(STORAGE_KEYS.SETTINGS, this.settings);
    Renderer.setActiveViewMode(mode);
    this._applyFiltersAndRender();
  },

  /**
   * Change sort order
   * @param {string} sortBy
   */
  setSortBy(sortBy) {
    this.settings.sortBy = sortBy;
    Storage.save(STORAGE_KEYS.SETTINGS, this.settings);
    Renderer.setActiveSortOption(sortBy);
    this.currentPage = 1;
    this._applyFiltersAndRender();
  },

  /**
   * Go to a specific page
   * @param {number} page
   */
  goToPage(page) {
    this.currentPage = page;
    this._applyFiltersAndRender();
    Renderer.scrollToTop();
  },


  // ============================================
  // 8. THEME & SETTINGS
  // ============================================

  /**
   * Toggle dark/light theme
   */
  toggleTheme() {
    this.settings.theme = this.settings.theme === 'dark' ? 'light' : 'dark';
    Storage.save(STORAGE_KEYS.SETTINGS, this.settings);
    Renderer.applyTheme(this.settings.theme);
    Renderer.showToast(
      this.settings.theme === 'dark' ? '🌙 Dark mode' : '☀️ Light mode',
      'info'
    );
  },

  /**
   * Update a setting
   * @param {string} key
   * @param {*} value
   */
  updateSetting(key, value) {
    this.settings[key] = value;
    Storage.save(STORAGE_KEYS.SETTINGS, this.settings);

    // Apply specific settings immediately
    switch (key) {
      case 'theme':
        Renderer.applyTheme(value);
        break;
      case 'soundEffects':
        Sounds.setEnabled(value);
        break;
      case 'perPage':
        this.currentPage = 1;
        this._applyFiltersAndRender();
        break;
    }
  },

  /**
   * Open settings modal
   */
  openSettings() {
    Renderer.renderSettings(this.settings);
    Renderer.openModal('settingsModal');
    this._bindSettingsEvents();
  },


  // ============================================
  // 9. ANALYTICS
  // ============================================

  /**
   * Open analytics modal
   */
  openAnalytics() {
    if (!this.dataLoaded) {
      Renderer.showToast('📊 Data not loaded yet', 'warning');
      return;
    }
    const stats = StatsCalculator.calculate(this.allQuestions);
    Renderer.renderAnalytics(stats, this.allQuestions);
    Renderer.openModal('analyticsModal');
  },


  // ============================================
  // 10. PRACTICE MODE
  // ============================================

  /**
   * Open practice mode setup
   */
  openPracticeSetup() {
    if (!this.dataLoaded) {
      Renderer.showToast('📚 Data not loaded yet', 'warning');
      return;
    }

    // Reset practice config
    this.practiceConfig = {
      subjects: SUBJECTS.map(s => s.id),
      difficulty: DIFFICULTIES.map(d => d.id),
      types: QUESTION_TYPES.map(t => t.id),
      count: 20,
      timer: 60,
      shuffle: true
    };

    Renderer.renderPracticeSetup();
    Renderer.openModal('practiceModal');
    this._bindPracticeSetupEvents();
  },

  /**
   * Start practice session
   */
  startPractice() {
    // Filter questions based on practice config
    let questions = [...this.allQuestions];

    questions = Filters.bySubject(questions, this.practiceConfig.subjects);
    questions = Filters.byDifficulty(questions, this.practiceConfig.difficulty);
    questions = Filters.byType(questions, this.practiceConfig.types);

    if (questions.length === 0) {
      Renderer.showToast('❌ No questions match your criteria', 'error');
      return;
    }

    // Shuffle if configured
    if (this.practiceConfig.shuffle) {
      questions = Utils.shuffleArray(questions);
    }

    // Limit count
    if (this.practiceConfig.count !== 'all') {
      const count = parseInt(this.practiceConfig.count);
      questions = questions.slice(0, count);
    }

    this.practiceQuestions = questions;
    this.practiceCurrentIndex = 0;
    this.practiceActive = true;
    this.practiceStartTime = Date.now();

    // Setup timer if configured
    if (this.practiceConfig.timer > 0) {
      if (this.practiceTimer) this.practiceTimer.destroy();

      this.practiceTimer = new StudyTimer(
        (remaining) => {
          const display = document.getElementById('practiceTimerDisplay');
          if (display) display.textContent = Utils.formatTime(remaining);
        },
        () => {
          // Auto-skip on timeout
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

  /**
   * Render current practice question
   */
  _renderCurrentPracticeQuestion() {
    const timerSeconds = this.practiceTimer ? this.practiceTimer.getRemaining() : 0;
    Renderer.renderPracticeQuestion(
      this.practiceQuestions,
      this.practiceCurrentIndex,
      this.practiceConfig.timer > 0 ? timerSeconds : 0
    );
    this._bindPracticeActiveEvents();
  },

  /**
   * Go to next practice question
   */
  _practiceNext() {
    if (this.practiceCurrentIndex >= this.practiceQuestions.length - 1) {
      this._endPractice();
      return;
    }

    this.practiceCurrentIndex++;

    // Reset timer for next question
    if (this.practiceTimer) {
      this.practiceTimer.reset();
      this.practiceTimer.start();
    }

    this._renderCurrentPracticeQuestion();
  },

  /**
   * Go to previous practice question
   */
  _practicePrev() {
    if (this.practiceCurrentIndex <= 0) return;

    this.practiceCurrentIndex--;

    if (this.practiceTimer) {
      this.practiceTimer.reset();
      this.practiceTimer.start();
    }

    this._renderCurrentPracticeQuestion();
  },

  /**
   * Skip current practice question
   */
  _practiceSkip() {
    const q = this.practiceQuestions[this.practiceCurrentIndex];
    if (q) {
      Progress.setStatus(q.id, 'skipped');
    }
    this._practiceNext();
  },

  /**
   * Go to specific practice question
   * @param {number} index — 0-based
   */
  _practiceGoTo(index) {
    if (index < 0 || index >= this.practiceQuestions.length) return;

    this.practiceCurrentIndex = index;

    if (this.practiceTimer) {
      this.practiceTimer.reset();
      this.practiceTimer.start();
    }

    this._renderCurrentPracticeQuestion();
  },

  /**
   * End practice session
   */
  _endPractice() {
    this.practiceActive = false;

    if (this.practiceTimer) {
      this.practiceTimer.stop();
    }

    const elapsed = Math.floor((Date.now() - this.practiceStartTime) / 1000);

    // Save to practice history
    let attempted = 0, skipped = 0;
    this.practiceQuestions.forEach(q => {
      const s = Progress.getStatus(q.id);
      if (s === 'attempted') attempted++;
      else if (s === 'skipped') skipped++;
    });

    PracticeHistory.save({
      count: this.practiceQuestions.length,
      attempted,
      skipped,
      time: elapsed,
      subjects: this.practiceConfig.subjects,
      difficulty: this.practiceConfig.difficulty
    });

    // Update streak
    Streak.update();

    // Render summary
    Renderer.renderPracticeSummary(this.practiceQuestions, elapsed);
    this._bindPracticeSummaryEvents();

    // Update main dashboard
    this._updateDashboard();

    // Confetti if all attempted
    if (attempted === this.practiceQuestions.length) {
      Renderer.launchConfetti();
      Sounds.success();
    }

    Renderer.showToast('🎉 Practice complete!', 'success');
  },


  // ============================================
  // 11. IMPORT / EXPORT
  // ============================================

  /**
   * Export progress as JSON file
   */
  exportProgress() {
    const data = Progress.export();
    const filename = `practice-progress-${new Date().toISOString().split('T')[0]}.json`;
    Utils.downloadFile(data, filename);
    Renderer.showToast('📤 Progress exported!', 'success');
  },

  /**
   * Trigger file input for import
   */
  triggerImport() {
    const fileInput = document.getElementById('importFileInput');
    if (fileInput) fileInput.click();
  },

  /**
   * Handle import file selection
   * @param {File} file
   */
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

  /**
   * Reset all progress data
   */
  resetAllData() {
    if (!confirm('⚠️ Are you sure you want to reset ALL progress? This cannot be undone!')) {
      return;
    }

    if (!confirm('🗑️ Last chance! All your progress, bookmarks, and answers will be deleted.')) {
      return;
    }

    Storage.clearAll();
    this.filters = Utils.deepClone(DEFAULT_FILTERS);
    this.settings = { ...DEFAULT_SETTINGS };
    this.currentPage = 1;

    Renderer.applyTheme(this.settings.theme);
    this._applyFiltersAndRender();
    this._updateDashboard();
    Renderer.renderFilterPanel(this.allQuestions, this.filters);
    Renderer.closeAllModals();

    Renderer.showToast('🗑️ All data has been reset', 'warning');
  },


  // ============================================
  // 12. EVENT BINDING — MAIN
  // ============================================

  /**
   * Bind all main event listeners
   */
  _bindEvents() {
    // --- HEADER ---
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    const analyticsBtn = document.getElementById('analyticsBtn');
    if (analyticsBtn) {
      analyticsBtn.addEventListener('click', () => this.openAnalytics());
    }

    const practiceBtn = document.getElementById('practiceBtn');
    if (practiceBtn) {
      practiceBtn.addEventListener('click', () => this.openPracticeSetup());
    }

    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openSettings());
    }

    // --- FILTER PANEL TOGGLE ---
    const filterHeader = document.querySelector('.filter-panel__header');
    if (filterHeader) {
      filterHeader.addEventListener('click', () => Renderer.toggleFilterPanel());
    }

    // --- FILTER PILLS (Delegated) ---
    document.addEventListener('click', (e) => {
      // Filter pill toggle
      const pill = e.target.closest('.filter-pill[data-filter-type]');
      if (pill && !pill.closest('#practiceSetupForm')) {
        const type = pill.dataset.filterType;
        const value = pill.dataset.value;
        this.toggleFilter(type, value);
        return;
      }

      // Day filter button
      const dayBtn = e.target.closest('.filter-day-btn');
      if (dayBtn) {
        const day = parseInt(dayBtn.dataset.day);
        this.toggleDayFilter(day);
        return;
      }

      // Bookmark filter toggle
      if (e.target.closest('#filterBookmarkBtn')) {
        this.toggleBookmarkFilter();
        return;
      }

      // Clear filters
      if (e.target.closest('#clearFiltersBtn')) {
        this.clearAllFilters();
        return;
      }

      // Remove active filter tag
      const removeTag = e.target.closest('.filter-active-tag__remove');
      if (removeTag) {
        this.removeFilterTag(removeTag.dataset.removeType, removeTag.dataset.removeValue);
        return;
      }
    });

    // --- FILTER DROPDOWNS ---
    const unitSelect = document.getElementById('filterUnit');
    if (unitSelect) {
      unitSelect.addEventListener('change', (e) => this.setUnitFilter(e.target.value));
    }

    const topicSelect = document.getElementById('filterTopic');
    if (topicSelect) {
      topicSelect.addEventListener('change', (e) => this.setTopicFilter(e.target.value));
    }

    // --- MARKS SLIDER ---
    const marksSlider = document.getElementById('filterMarksSlider');
    if (marksSlider) {
      marksSlider.addEventListener('input', (e) => {
        if (Renderer._els.filterMarksValue) {
          Renderer._els.filterMarksValue.textContent = e.target.value;
        }
      });
      marksSlider.addEventListener('change', (e) => this.setMarksMax(e.target.value));
    }

    // --- SEARCH ---
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      const debouncedSearch = Utils.debounce((query) => {
        this.setSearchQuery(query);
      }, 350);

      searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
      });
    }

    // --- SORT ---
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => this.setSortBy(e.target.value));
    }

    // --- VIEW MODE ---
    document.querySelectorAll('.results-bar__view-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setViewMode(btn.dataset.view));
    });

    // --- QUESTION CARD INTERACTIONS (Delegated) ---
    document.addEventListener('click', (e) => {
      // MCQ option
      const option = e.target.closest('.q-card__option');
      if (option) {
        const qId = option.dataset.qid;
        const idx = parseInt(option.dataset.optionIndex);
        this.handleMCQSelect(qId, idx);
        return;
      }

      // True/False button
      const tfBtn = e.target.closest('.q-card__tf-btn');
      if (tfBtn) {
        this.handleTFSelect(tfBtn.dataset.qid, tfBtn.dataset.tfValue);
        return;
      }

      // Bookmark button
      const bookmarkBtn = e.target.closest('.btn-bookmark');
      if (bookmarkBtn) {
        this.handleBookmark(bookmarkBtn.dataset.qid);
        return;
      }

      // Hint button
      const hintBtn = e.target.closest('.btn-hint');
      if (hintBtn) {
        this.handleHintToggle(hintBtn.dataset.qid);
        return;
      }

      // Confidence button
      const confBtn = e.target.closest('.q-card__conf-btn');
      if (confBtn) {
        this.handleConfidence(confBtn.dataset.qid, confBtn.dataset.conf);
        return;
      }

      // Status button
      const statusBtn = e.target.closest('.q-card__status-btn');
      if (statusBtn) {
        this.handleStatusChange(statusBtn.dataset.qid, statusBtn.dataset.status);
        return;
      }

      // Tag click
      const tagEl = e.target.closest('.q-card__tag');
      if (tagEl) {
        this.handleTagClick(tagEl.dataset.tag);
        return;
      }
    });

    // --- TEXT INPUT / TEXTAREA (Delegated, debounced) ---
    const debouncedTextSave = Utils.debounce((qId, value) => {
      this.handleTextInput(qId, value);
    }, 500);

    document.addEventListener('input', (e) => {
      // Fill blank
      if (e.target.classList.contains('q-card__fill-input')) {
        debouncedTextSave(e.target.dataset.qid, e.target.value);
        return;
      }
      // Numerical
      if (e.target.classList.contains('q-card__num-input')) {
        debouncedTextSave(e.target.dataset.qid, e.target.value);
        return;
      }
      // Textarea (short/long)
      if (e.target.classList.contains('q-card__textarea')) {
        debouncedTextSave(e.target.dataset.qid, e.target.value);
        return;
      }
    });

    // --- MATCH SELECT (Delegated) ---
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('q-card__match-select')) {
        const qId = e.target.dataset.qid;
        const matchIndex = parseInt(e.target.dataset.matchIndex);
        const selectedRight = e.target.value !== '' ? parseInt(e.target.value) : null;
        this.handleMatchSelect(qId, matchIndex, selectedRight);
        return;
      }
    });

    // --- PAGINATION (Delegated) ---
    document.addEventListener('click', (e) => {
      const pageBtn = e.target.closest('.pagination__btn');
      if (pageBtn && !pageBtn.disabled) {
        this.goToPage(parseInt(pageBtn.dataset.page));
        return;
      }
    });

    // --- MODAL BACKDROP CLOSE ---
    const backdrop = document.getElementById('modalBackdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        if (this.practiceActive) return; // Don't close during practice
        Renderer.closeAllModals();
      });
    }

    // --- MODAL CLOSE BUTTONS ---
    document.querySelectorAll('.modal__close').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (modal) {
          if (this.practiceActive && modal.id === 'practiceModal') {
            if (confirm('⚠️ End practice session?')) {
              this._endPractice();
              Renderer.closeModal(modal.id);
            }
          } else {
            Renderer.closeModal(modal.id);
          }
        }
      });
    });

    // --- FAB BUTTONS ---
    const fabTop = document.getElementById('fabScrollTop');
    if (fabTop) {
      fabTop.addEventListener('click', () => Renderer.scrollToTop());
    }

    // --- HERO BUTTONS ---
    const heroPractice = document.getElementById('heroPracticeBtn');
    if (heroPractice) {
      heroPractice.addEventListener('click', () => this.openPracticeSetup());
    }

    const heroAnalytics = document.getElementById('heroAnalyticsBtn');
    if (heroAnalytics) {
      heroAnalytics.addEventListener('click', () => this.openAnalytics());
    }

    // --- WINDOW RESIZE ---
    window.addEventListener('resize', Utils.debounce(() => {
      // Could handle responsive changes here
    }, 250));

    // --- BEFORE UNLOAD (save state) ---
    window.addEventListener('beforeunload', () => {
      Storage.save(STORAGE_KEYS.FILTERS, this.filters);
      Storage.save(STORAGE_KEYS.SETTINGS, this.settings);
    });
  },


  // ============================================
  // 13. EVENT BINDING — PRACTICE SETUP
  // ============================================

  /**
   * Bind events within practice setup form
   */
  _bindPracticeSetupEvents() {
    // Practice filter pills
    document.querySelectorAll('[data-practice-filter]').forEach(pill => {
      pill.addEventListener('click', () => {
        const filterKey = pill.dataset.practiceFilter;

        switch (filterKey) {
          case 'subject': {
            const subj = pill.dataset.subject;
            pill.classList.toggle('active');
            if (pill.classList.contains('active')) {
              if (!this.practiceConfig.subjects.includes(subj)) {
                this.practiceConfig.subjects.push(subj);
              }
            } else {
              this.practiceConfig.subjects = this.practiceConfig.subjects.filter(s => s !== subj);
            }
            break;
          }
          case 'difficulty': {
            const diff = pill.dataset.diff;
            pill.classList.toggle('active');
            if (pill.classList.contains('active')) {
              if (!this.practiceConfig.difficulty.includes(diff)) {
                this.practiceConfig.difficulty.push(diff);
              }
            } else {
              this.practiceConfig.difficulty = this.practiceConfig.difficulty.filter(d => d !== diff);
            }
            break;
          }
          case 'type': {
            const type = pill.dataset.type;
            pill.classList.toggle('active');
            if (pill.classList.contains('active')) {
              if (!this.practiceConfig.types.includes(type)) {
                this.practiceConfig.types.push(type);
              }
            } else {
              this.practiceConfig.types = this.practiceConfig.types.filter(t => t !== type);
            }
            break;
          }
          case 'count': {
            // Single select
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

    // Start button
    const startBtn = document.getElementById('startPracticeBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startPractice());
    }
  },


  // ============================================
  // 14. EVENT BINDING — PRACTICE ACTIVE
  // ============================================

  /**
   * Bind events within active practice mode
   */
  _bindPracticeActiveEvents() {
    // Navigation buttons
    const prevBtn = document.getElementById('practicePrevBtn');
    if (prevBtn) {
      prevBtn.onclick = () => this._practicePrev();
    }

    const nextBtn = document.getElementById('practiceNextBtn');
    if (nextBtn) {
      nextBtn.onclick = () => this._practiceNext();
    }

    const skipBtn = document.getElementById('practiceSkipBtn');
    if (skipBtn) {
      skipBtn.onclick = () => this._practiceSkip();
    }

    const hintBtn = document.getElementById('practiceHintBtn');
    if (hintBtn) {
      hintBtn.onclick = () => {
        const q = this.practiceQuestions[this.practiceCurrentIndex];
        if (q) this.handleHintToggle(q.id);
      };
    }

    // Question navigation pills
    document.querySelectorAll('[data-practice-goto]').forEach(btn => {
      btn.onclick = () => {
        this._practiceGoTo(parseInt(btn.dataset.practiceGoto));
      };
    });
  },


  // ============================================
  // 15. EVENT BINDING — PRACTICE SUMMARY
  // ============================================

  /**
   * Bind events in practice summary screen
   */
  _bindPracticeSummaryEvents() {
    const retryBtn = document.getElementById('practiceRetryBtn');
    if (retryBtn) {
      retryBtn.onclick = () => {
        Renderer.renderPracticeSetup();
        this._bindPracticeSetupEvents();
      };
    }

    const closeBtn = document.getElementById('practiceCloseBtn');
    if (closeBtn) {
      closeBtn.onclick = () => Renderer.closeModal('practiceModal');
    }
  },


  // ============================================
  // 16. EVENT BINDING — SETTINGS
  // ============================================

  /**
   * Bind events within settings modal
   */
  _bindSettingsEvents() {
    // Theme toggle
    const themeToggle = document.getElementById('settingTheme');
    if (themeToggle) {
      themeToggle.onchange = () => {
        this.updateSetting('theme', themeToggle.checked ? 'dark' : 'light');
      };
    }

    // Animations
    const animToggle = document.getElementById('settingAnimations');
    if (animToggle) {
      animToggle.onchange = () => {
        this.updateSetting('animations', animToggle.checked);
      };
    }

    // Hints
    const hintsToggle = document.getElementById('settingHints');
    if (hintsToggle) {
      hintsToggle.onchange = () => {
        this.updateSetting('showHints', hintsToggle.checked);
      };
    }

    // Tags
    const tagsToggle = document.getElementById('settingTags');
    if (tagsToggle) {
      tagsToggle.onchange = () => {
        this.updateSetting('showTags', tagsToggle.checked);
      };
    }

    // Sound
    const soundToggle = document.getElementById('settingSound');
    if (soundToggle) {
      soundToggle.onchange = () => {
        this.updateSetting('soundEffects', soundToggle.checked);
      };
    }

    // Per page
    const perPageSelect = document.getElementById('settingPerPage');
    if (perPageSelect) {
      perPageSelect.onchange = () => {
        this.updateSetting('perPage', parseInt(perPageSelect.value));
      };
    }

    // Export
    const exportBtn = document.getElementById('settingExport');
    if (exportBtn) {
      exportBtn.onclick = () => this.exportProgress();
    }

    // Import
    const importBtn = document.getElementById('settingImport');
    if (importBtn) {
      importBtn.onclick = () => this.triggerImport();
    }

    const importInput = document.getElementById('importFileInput');
    if (importInput) {
      importInput.onchange = (e) => {
        if (e.target.files[0]) {
          this.handleImport(e.target.files[0]);
        }
      };
    }

    // Reset
    const resetBtn = document.getElementById('settingReset');
    if (resetBtn) {
      resetBtn.onclick = () => this.resetAllData();
    }
  },


  // ============================================
  // 17. KEYBOARD SHORTCUTS
  // ============================================

  /**
   * Setup keyboard shortcuts
   */
  _setupKeyboardShortcuts() {
    // Theme toggle
    Keyboard.on('t', () => this.toggleTheme());

    // Focus search
    Keyboard.on('f', () => {
      const input = document.getElementById('searchInput');
      if (input) {
        input.focus();
        Renderer.scrollTo('.search-wrapper');
      }
    });

    // Toggle filter panel
    Keyboard.on('ctrl+f', () => {
      Renderer.toggleFilterPanel();
    });

    // Close modals
    Keyboard.on('escape', () => {
      if (this.practiceActive) {
        if (confirm('⚠️ End practice?')) {
          this._endPractice();
          Renderer.closeAllModals();
        }
      } else {
        Renderer.closeAllModals();
      }
    });

    // Practice mode shortcuts
    Keyboard.on('n', () => {
      if (this.practiceActive) this._practiceNext();
    });

    Keyboard.on('p', () => {
      if (this.practiceActive) this._practicePrev();
    });

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

    Keyboard.on('s', () => {
      if (this.practiceActive) this._practiceSkip();
    });

    // MCQ shortcuts (1-4)
    ['1', '2', '3', '4'].forEach((key, i) => {
      Keyboard.on(key, () => {
        if (this.practiceActive) {
          const q = this.practiceQuestions[this.practiceCurrentIndex];
          if (q && q.type === 'mcq' && q.options && q.options[i]) {
            this.handleMCQSelect(q.id, i);
            // Re-render to show selection
            this._renderCurrentPracticeQuestion();
          }
        }
      });
    });

    // Scroll to top
    Keyboard.on('shift+t', () => Renderer.scrollToTop());

    // Open analytics
    Keyboard.on('a', () => {
      if (!this.practiceActive) this.openAnalytics();
    });
  }
};


// ============================================
// 18. BOOTSTRAP — Start the app
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});