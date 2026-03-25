/* ============================================
   RENDERER.JS — DOM Rendering & UI Updates
   WB Diploma Sem-II | Practice Questions App
   ============================================ */

'use strict';

const Renderer = {

  // ============================================
  // 1. ELEMENT REFERENCES (cached after init)
  // ============================================
  _els: {},

  /**
   * Cache all frequently used DOM elements
   */
  cacheElements() {
    this._els = {
      // Dashboard
      dashboard: document.getElementById('dashboard'),
      statTotal: document.getElementById('statTotal'),
      statAttempted: document.getElementById('statAttempted'),
      statBookmarked: document.getElementById('statBookmarked'),
      statPct: document.getElementById('statPct'),
      statStreak: document.getElementById('statStreak'),

      // Progress bar
      progressPct: document.getElementById('progressPct'),
      progressBar: document.getElementById('progressBar'),

      // Header stats pill
      headerPill: document.getElementById('headerStatsPill'),

      // Filter panel
      filterPanel: document.getElementById('filterPanel'),
      filterBody: document.getElementById('filterBody'),
      filterToggleIcon: document.getElementById('filterToggleIcon'),
      filterCountBubble: document.getElementById('filterCountBubble'),
      filterDays: document.getElementById('filterDays'),
      filterSubjects: document.getElementById('filterSubjects'),
      filterTypes: document.getElementById('filterTypes'),
      filterDifficulty: document.getElementById('filterDifficulty'),
      filterUnit: document.getElementById('filterUnit'),
      filterTopic: document.getElementById('filterTopic'),
      filterMarksSlider: document.getElementById('filterMarksSlider'),
      filterMarksValue: document.getElementById('filterMarksValue'),
      filterStatuses: document.getElementById('filterStatuses'),
      filterBookmark: document.getElementById('filterBookmark'),
      filterConfidence: document.getElementById('filterConfidence'),
      filterSources: document.getElementById('filterSources'),
      searchInput: document.getElementById('searchInput'),
      filterActiveTags: document.getElementById('filterActiveTags'),
      clearFiltersBtn: document.getElementById('clearFiltersBtn'),

      // Results bar
      resultsInfo: document.getElementById('resultsInfo'),
      sortSelect: document.getElementById('sortSelect'),
      viewBtns: document.querySelectorAll('.results-bar__view-btn'),

      // Questions container
      questionsGrid: document.getElementById('questionsGrid'),

      // Pagination
      pagination: document.getElementById('pagination'),

      // Modals
      modalBackdrop: document.getElementById('modalBackdrop'),
      analyticsModal: document.getElementById('analyticsModal'),
      practiceModal: document.getElementById('practiceModal'),
      settingsModal: document.getElementById('settingsModal'),

      // Practice mode elements
      practiceTimerDisplay: document.getElementById('practiceTimerDisplay'),
      practiceNav: document.getElementById('practiceNav'),
      practiceQuestionArea: document.getElementById('practiceQuestionArea'),
      practiceCounter: document.getElementById('practiceCounter'),
      practiceSummary: document.getElementById('practiceSummary'),

      // Toast
      toast: document.getElementById('toast'),

      // Theme button
      themeBtn: document.getElementById('themeBtn')
    };
  },


  // ============================================
  // 2. DASHBOARD RENDERING
  // ============================================

  /**
   * Render the stats dashboard
   * @param {Object} stats — from StatsCalculator.calculate()
   */
  renderDashboard(stats) {
    if (this._els.statTotal) {
      this._els.statTotal.textContent = stats.total;
    }
    if (this._els.statAttempted) {
      this._els.statAttempted.textContent = stats.attempted;
    }
    if (this._els.statBookmarked) {
      this._els.statBookmarked.textContent = stats.bookmarked;
    }
    if (this._els.statPct) {
      this._els.statPct.textContent = stats.completionPct + '%';
    }
    if (this._els.statStreak) {
      this._els.statStreak.textContent = stats.streak;
    }

    // Header pill
    if (this._els.headerPill) {
      this._els.headerPill.innerHTML = `
        <span class="num">${stats.attempted}</span>/<span>${stats.total}</span> done
      `;
    }
  },


  // ============================================
  // 3. PROGRESS BAR
  // ============================================

  /**
   * Update overall progress bar
   * @param {number} pct — 0 to 100
   */
  renderProgressBar(pct) {
    if (this._els.progressPct) {
      this._els.progressPct.textContent = pct + '%';
    }
    if (this._els.progressBar) {
      this._els.progressBar.style.width = pct + '%';
    }
  },


  // ============================================
  // 4. FILTER PANEL RENDERING
  // ============================================

  /**
   * Render the entire filter panel with options
   * @param {Array} allQuestions — For populating dynamic dropdowns
   * @param {Object} currentFilters — Current active filters
   */
  renderFilterPanel(allQuestions, currentFilters) {
    this.renderDayFilters(currentFilters.days);
    this.renderSubjectFilters(currentFilters.subjects);
    this.renderTypeFilters(currentFilters.types);
    this.renderDifficultyFilters(currentFilters.difficulty);
    this.renderUnitDropdown(allQuestions, currentFilters);
    this.renderTopicDropdown(allQuestions, currentFilters);
    this.renderMarksSlider(currentFilters.marksMax);
    this.renderStatusFilters(currentFilters.statuses);
    this.renderBookmarkFilter(currentFilters.bookmarkedOnly);
    this.renderConfidenceFilters(currentFilters.confidence);
    this.renderSourceFilters(currentFilters.sources);
    this.renderSearchInput(currentFilters.search);
    this.renderActiveFilterTags(currentFilters);
    this.updateFilterCount(currentFilters);
  },

  /**
   * Render day selector pills (1 to 15)
   * @param {Array<number>} activeDays
   */
  renderDayFilters(activeDays) {
    const container = this._els.filterDays;
    if (!container) return;

    container.innerHTML = '';
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      const btn = document.createElement('button');
      btn.className = 'filter-day-btn' + (activeDays.includes(d) ? ' active' : '');
      btn.dataset.day = d;
      btn.textContent = d;
      btn.setAttribute('data-tooltip', `Day ${d}`);
      container.appendChild(btn);
    }
  },

  /**
   * Render subject filter pills
   * @param {Array<string>} activeSubjects
   */
  renderSubjectFilters(activeSubjects) {
    const container = this._els.filterSubjects;
    if (!container) return;

    container.innerHTML = SUBJECTS.map(s => `
      <button class="filter-pill${activeSubjects.includes(s.id) ? ' active' : ''}"
              data-subject="${s.id}" data-filter-type="subjects" data-value="${s.id}">
        ${s.icon} ${s.label}
      </button>
    `).join('');
  },

  /**
   * Render question type filter pills
   * @param {Array<string>} activeTypes
   */
  renderTypeFilters(activeTypes) {
    const container = this._els.filterTypes;
    if (!container) return;

    container.innerHTML = QUESTION_TYPES.map(t => `
      <button class="filter-pill${activeTypes.includes(t.id) ? ' active' : ''}"
              data-filter-type="types" data-value="${t.id}">
        ${t.icon} ${t.label}
      </button>
    `).join('');
  },

  /**
   * Render difficulty filter pills
   * @param {Array<string>} activeDiffs
   */
  renderDifficultyFilters(activeDiffs) {
    const container = this._els.filterDifficulty;
    if (!container) return;

    container.innerHTML = DIFFICULTIES.map(d => `
      <button class="filter-pill${activeDiffs.includes(d.id) ? ' active' : ''}"
              data-diff="${d.id}" data-filter-type="difficulty" data-value="${d.id}">
        ${d.icon} ${d.label}
      </button>
    `).join('');
  },

  /**
   * Render unit dropdown (dynamically from data)
   * @param {Array} allQuestions
   * @param {Object} filters
   */
  renderUnitDropdown(allQuestions, filters) {
    const select = this._els.filterUnit;
    if (!select) return;

    // Get questions matching current subject filter (to show relevant units)
    let relevantQuestions = allQuestions;
    if (filters.subjects.length > 0) {
      relevantQuestions = allQuestions.filter(q => filters.subjects.includes(q.subject));
    }

    const units = Utils.getUniqueValues(relevantQuestions, 'unit');
    select.innerHTML = '<option value="">All Units</option>';
    units.forEach(u => {
      const option = document.createElement('option');
      option.value = u;
      option.textContent = u;
      if (filters.units.includes(u)) option.selected = true;
      select.appendChild(option);
    });
  },

  /**
   * Render topic dropdown (dynamically from data)
   * @param {Array} allQuestions
   * @param {Object} filters
   */
  renderTopicDropdown(allQuestions, filters) {
    const select = this._els.filterTopic;
    if (!select) return;

    let relevantQuestions = allQuestions;
    if (filters.subjects.length > 0) {
      relevantQuestions = relevantQuestions.filter(q => filters.subjects.includes(q.subject));
    }
    if (filters.units.length > 0) {
      relevantQuestions = relevantQuestions.filter(q => filters.units.includes(q.unit));
    }

    const topics = Utils.getUniqueValues(relevantQuestions, 'topic');
    select.innerHTML = '<option value="">All Topics</option>';
    topics.forEach(t => {
      const option = document.createElement('option');
      option.value = t;
      option.textContent = t;
      if (filters.topics.includes(t)) option.selected = true;
      select.appendChild(option);
    });
  },

  /**
   * Render marks range slider
   * @param {number} currentMax
   */
  renderMarksSlider(currentMax) {
    if (this._els.filterMarksSlider) {
      this._els.filterMarksSlider.value = currentMax;
    }
    if (this._els.filterMarksValue) {
      this._els.filterMarksValue.textContent = currentMax;
    }
  },

  /**
   * Render status filter pills
   * @param {Array<string>} activeStatuses
   */
  renderStatusFilters(activeStatuses) {
    const container = this._els.filterStatuses;
    if (!container) return;

    container.innerHTML = STATUSES.map(s => `
      <button class="filter-pill${activeStatuses.includes(s.id) ? ' active' : ''}"
              data-filter-type="statuses" data-value="${s.id}">
        ${s.icon} ${s.label}
      </button>
    `).join('');
  },

  /**
   * Render bookmark filter toggle
   * @param {boolean} active
   */
  renderBookmarkFilter(active) {
    const btn = this._els.filterBookmark;
    if (!btn) return;
    btn.classList.toggle('active', active);
  },

  /**
   * Render confidence filter pills
   * @param {Array<string>} activeConfs
   */
  renderConfidenceFilters(activeConfs) {
    const container = this._els.filterConfidence;
    if (!container) return;

    container.innerHTML = CONFIDENCE_LEVELS.map(c => `
      <button class="filter-pill${activeConfs.includes(c.id) ? ' active' : ''}"
              data-filter-type="confidence" data-value="${c.id}">
        ${c.emoji} ${c.label}
      </button>
    `).join('');
  },

  /**
   * Render exam source filter pills
   * @param {Array<string>} activeSources
   */
  renderSourceFilters(activeSources) {
    const container = this._els.filterSources;
    if (!container) return;

    container.innerHTML = EXAM_SOURCES.map(s => `
      <button class="filter-pill${activeSources.includes(s.id) ? ' active' : ''}"
              data-filter-type="sources" data-value="${s.id}">
        ${s.label}
      </button>
    `).join('');
  },

  /**
   * Render search input value
   * @param {string} query
   */
  renderSearchInput(query) {
    if (this._els.searchInput) {
      this._els.searchInput.value = query || '';
    }
  },

  /**
   * Render active filter tags
   * @param {Object} filters
   */
  renderActiveFilterTags(filters) {
    const container = this._els.filterActiveTags;
    if (!container) return;

    const tags = Filters.getActiveTags(filters);
    if (tags.length === 0) {
      container.innerHTML = '<span style="font-size:0.75rem;color:var(--text-tertiary);">No active filters</span>';
      return;
    }

    container.innerHTML = tags.map(tag => `
      <span class="filter-active-tag" data-tag-type="${tag.type}" data-tag-value="${tag.value || ''}">
        ${Utils.escapeHTML(tag.label)}
        <span class="filter-active-tag__remove" data-remove-type="${tag.type}" data-remove-value="${tag.value || ''}">✕</span>
      </span>
    `).join('');
  },

  /**
   * Update filter count bubble
   * @param {Object} filters
   */
  updateFilterCount(filters) {
    const count = Filters.countActive(filters);
    if (this._els.filterCountBubble) {
      this._els.filterCountBubble.textContent = count;
      this._els.filterCountBubble.classList.toggle('hidden', count === 0);
    }
  },

  /**
   * Toggle filter panel open/close
   */
  toggleFilterPanel() {
    const panel = this._els.filterPanel;
    if (!panel) return;
    panel.classList.toggle('open');
  },


  // ============================================
  // 5. RESULTS BAR
  // ============================================

  /**
   * Render results bar info
   * @param {number} filtered — Filtered count
   * @param {number} total — Total count
   */
  renderResultsBar(filtered, total) {
    if (this._els.resultsInfo) {
      this._els.resultsInfo.innerHTML = `
        Showing <strong>${filtered}</strong> of <strong>${total}</strong> questions
      `;
    }
  },

  /**
   * Set active view mode button
   * @param {string} mode — 'card' | 'compact' | 'list'
   */
  setActiveViewMode(mode) {
    if (this._els.viewBtns) {
      this._els.viewBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === mode);
      });
    }
  },

  /**
   * Set active sort option
   * @param {string} sortBy
   */
  setActiveSortOption(sortBy) {
    if (this._els.sortSelect) {
      this._els.sortSelect.value = sortBy;
    }
  },


  // ============================================
  // 6. QUESTION CARD RENDERING
  // ============================================

  /**
   * Render all question cards
   * @param {Array} questions — Paginated questions to render
   * @param {string} viewMode — 'card' | 'compact' | 'list'
   * @param {string} searchQuery — For highlighting
   */
  renderQuestions(questions, viewMode = 'card', searchQuery = '') {
    const grid = this._els.questionsGrid;
    if (!grid) return;

    // Set grid class based on view mode
    grid.className = 'questions-grid';
    grid.classList.add(`questions-grid--${viewMode}`);

    if (questions.length === 0) {
      grid.innerHTML = this._buildEmptyState();
      return;
    }

    const fragment = document.createDocumentFragment();

    questions.forEach((q, index) => {
      const card = this._buildQuestionCard(q, index, viewMode, searchQuery);
      fragment.appendChild(card);
    });

    grid.innerHTML = '';
    grid.appendChild(fragment);
  },

  /**
   * Build a single question card element
   * @param {Object} q — Question data
   * @param {number} index — Display index
   * @param {string} viewMode
   * @param {string} searchQuery
   * @returns {HTMLElement}
   */
  _buildQuestionCard(q, index, viewMode, searchQuery) {
    const card = document.createElement('div');
    card.className = 'q-card animate-fadeInUp';
    card.dataset.qid = q.id;
    card.dataset.subject = q.subject;

    const status = Progress.getStatus(q.id);
    const bookmarked = Progress.isBookmarked(q.id);
    const confidence = Progress.getConfidence(q.id);
    const userAnswer = Progress.getAnswer(q.id);

    if (status === 'attempted') card.classList.add('q-card--attempted');
    if (status === 'skipped') card.classList.add('q-card--skipped');
    if (bookmarked) card.classList.add('q-card--bookmarked');

    if (viewMode === 'compact') card.classList.add('q-card--compact');
    if (viewMode === 'list') card.classList.add('q-card--list');

    // Build card inner HTML based on view mode
    if (viewMode === 'list') {
      card.innerHTML = this._buildListView(q, searchQuery);
    } else {
      card.innerHTML = this._buildCardView(q, index, viewMode, searchQuery, status, bookmarked, confidence, userAnswer);
    }

    return card;
  },

  /**
   * Build card view (default + compact) inner HTML
   */
  _buildCardView(q, index, viewMode, searchQuery, status, bookmarked, confidence, userAnswer) {
    const subjectInfo = SUBJECTS.find(s => s.id === q.subject) || {};
    const questionText = searchQuery
      ? Utils.highlightText(q.question, searchQuery)
      : Utils.escapeHTML(q.question);

    return `
      <!-- Header / Badge Row -->
      <div class="q-card__header">
        <div class="q-card__badges">
          <span class="q-card__badge q-card__badge--day">D${q.day || '?'}</span>
          <span class="q-card__badge q-card__badge--subject" data-subject="${q.subject}">
            ${subjectInfo.icon || ''} ${(q.subject || '').toUpperCase()}
          </span>
          <span class="q-card__badge q-card__badge--diff" data-diff="${q.difficulty}">
            ${q.difficulty || 'medium'}
          </span>
          <span class="q-card__badge q-card__badge--type">${this._getTypeLabel(q.type)}</span>
          <span class="q-card__badge q-card__badge--marks">${q.marks || 1}M</span>
        </div>
        <span class="q-card__qnum">#${q.id || index + 1}</span>
      </div>

      <!-- Body -->
      <div class="q-card__body">
        <div class="q-card__question">${questionText}</div>
        ${this._buildAnswerArea(q, userAnswer)}
        ${this._buildHintArea(q)}
        ${viewMode !== 'compact' ? this._buildTagsArea(q) : ''}
      </div>

      <!-- Footer -->
      <div class="q-card__footer">
        <div class="q-card__actions">
          <button class="q-card__action-btn btn-hint" data-qid="${q.id}" data-tooltip="Toggle Hint [H]">
            💡 Hint
          </button>
          <button class="q-card__action-btn btn-bookmark ${bookmarked ? 'active' : ''}" data-qid="${q.id}" data-tooltip="Bookmark [B]">
            ${bookmarked ? '⭐' : '☆'} ${bookmarked ? 'Saved' : 'Save'}
          </button>
        </div>

        <div class="q-card__confidence" data-qid="${q.id}">
          <button class="q-card__conf-btn ${confidence === 'confident' ? 'active' : ''}"
                  data-conf="confident" data-qid="${q.id}" data-tooltip="Confident">😊</button>
          <button class="q-card__conf-btn ${confidence === 'unsure' ? 'active' : ''}"
                  data-conf="unsure" data-qid="${q.id}" data-tooltip="Unsure">😐</button>
          <button class="q-card__conf-btn ${confidence === 'noidea' ? 'active' : ''}"
                  data-conf="noidea" data-qid="${q.id}" data-tooltip="No Idea">😰</button>
        </div>

        <div class="q-card__status-btns" data-qid="${q.id}">
          <button class="q-card__status-btn q-card__status-btn--attempted ${status === 'attempted' ? 'active' : ''}"
                  data-status="attempted" data-qid="${q.id}">
            ✅ Done
          </button>
          <button class="q-card__status-btn q-card__status-btn--skipped ${status === 'skipped' ? 'active' : ''}"
                  data-status="skipped" data-qid="${q.id}">
            ⏭️ Skip
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Build list view inner HTML
   */
  _buildListView(q, searchQuery) {
    const subjectInfo = SUBJECTS.find(s => s.id === q.subject) || {};
    const status = Progress.getStatus(q.id);
    const bookmarked = Progress.isBookmarked(q.id);
    const questionText = searchQuery
      ? Utils.highlightText(q.question, searchQuery)
      : Utils.escapeHTML(q.question);

    return `
      <div class="q-card__body">
        <div class="q-card__question">${questionText}</div>
        <div class="q-card__list-meta">
          <span class="q-card__badge q-card__badge--subject" data-subject="${q.subject}" style="font-size:0.6rem;">
            ${(q.subject || '').toUpperCase()}
          </span>
          <span class="q-card__badge q-card__badge--diff" data-diff="${q.difficulty}" style="font-size:0.6rem;">
            ${q.difficulty}
          </span>
          <span style="font-size:0.75rem;color:var(--text-tertiary);">${q.marks || 1}M</span>
          <button class="q-card__action-btn btn-bookmark ${bookmarked ? 'active' : ''}" data-qid="${q.id}" style="padding:2px 4px;">
            ${bookmarked ? '⭐' : '☆'}
          </button>
          ${status === 'attempted' ? '<span style="color:var(--green);font-size:0.8rem;">✅</span>' : ''}
        </div>
      </div>
    `;
  },


  // ============================================
  // 7. ANSWER AREA BUILDERS (by question type)
  // ============================================

  /**
   * Build answer interaction area based on question type
   * @param {Object} q — Question data
   * @param {*} userAnswer — Saved user answer
   * @returns {string} HTML
   */
  _buildAnswerArea(q, userAnswer) {
    switch (q.type) {
      case 'mcq':
        return this._buildMCQ(q, userAnswer);
      case 'true-false':
        return this._buildTrueFalse(q, userAnswer);
      case 'fill-blank':
        return this._buildFillBlank(q, userAnswer);
      case 'numerical':
        return this._buildNumerical(q, userAnswer);
      case 'short-answer':
        return this._buildShortAnswer(q, userAnswer);
      case 'long-answer':
        return this._buildLongAnswer(q, userAnswer);
      case 'match':
        return this._buildMatch(q, userAnswer);
      default:
        return '<p style="color:var(--text-tertiary);font-size:0.82rem;">No interaction available for this type.</p>';
    }
  },

  /**
   * Build MCQ options
   */
  _buildMCQ(q, userAnswer) {
    if (!q.options || q.options.length === 0) return '';
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

    return `
      <div class="q-card__options" data-qid="${q.id}" data-type="mcq">
        ${q.options.map((opt, i) => `
          <div class="q-card__option ${userAnswer === i ? 'selected' : ''}"
               data-qid="${q.id}" data-option-index="${i}">
            <div class="q-card__option-radio"></div>
            <span class="q-card__option-label">${labels[i] || i + 1}.</span>
            <span class="q-card__option-text">${Utils.escapeHTML(opt)}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  /**
   * Build True/False buttons
   */
  _buildTrueFalse(q, userAnswer) {
    return `
      <div class="q-card__tf-options" data-qid="${q.id}" data-type="true-false">
        <button class="q-card__tf-btn ${userAnswer === 'true' ? 'selected' : ''}"
                data-qid="${q.id}" data-tf-value="true">
          ✅ True
        </button>
        <button class="q-card__tf-btn ${userAnswer === 'false' ? 'selected' : ''}"
                data-qid="${q.id}" data-tf-value="false">
          ❌ False
        </button>
      </div>
    `;
  },

  /**
   * Build Fill in the Blank input
   */
  _buildFillBlank(q, userAnswer) {
    return `
      <div data-qid="${q.id}" data-type="fill-blank">
        <input type="text"
               class="q-card__fill-input"
               data-qid="${q.id}"
               placeholder="Type your answer..."
               value="${Utils.escapeHTML(userAnswer || '')}"
               autocomplete="off">
      </div>
    `;
  },

  /**
   * Build Numerical input
   */
  _buildNumerical(q, userAnswer) {
    return `
      <div data-qid="${q.id}" data-type="numerical">
        <input type="number"
               class="q-card__num-input"
               data-qid="${q.id}"
               placeholder="Enter numerical value..."
               value="${userAnswer !== null && userAnswer !== undefined ? userAnswer : ''}"
               step="any"
               autocomplete="off">
      </div>
    `;
  },

  /**
   * Build Short Answer textarea
   */
  _buildShortAnswer(q, userAnswer) {
    return `
      <div data-qid="${q.id}" data-type="short-answer">
        <textarea class="q-card__textarea q-card__textarea--short"
                  data-qid="${q.id}"
                  placeholder="Write your short answer here...">${Utils.escapeHTML(userAnswer || '')}</textarea>
      </div>
    `;
  },

  /**
   * Build Long Answer textarea
   */
  _buildLongAnswer(q, userAnswer) {
    return `
      <div data-qid="${q.id}" data-type="long-answer">
        <textarea class="q-card__textarea q-card__textarea--long"
                  data-qid="${q.id}"
                  placeholder="Write your detailed answer / derivation here...">${Utils.escapeHTML(userAnswer || '')}</textarea>
      </div>
    `;
  },

  /**
   * Build Match the Following
   */
  _buildMatch(q, userAnswer) {
    if (!q.matchLeft || !q.matchRight) return '';
    const answers = userAnswer || {};
    const shuffledRight = [...q.matchRight];

    return `
      <div class="q-card__match-container" data-qid="${q.id}" data-type="match">
        ${q.matchLeft.map((left, i) => `
          <div class="q-card__match" style="margin-bottom:var(--sp-2);">
            <div class="q-card__match-left">${Utils.escapeHTML(left)}</div>
            <span class="q-card__match-arrow">→</span>
            <select class="q-card__match-select" data-qid="${q.id}" data-match-index="${i}">
              <option value="">Select...</option>
              ${shuffledRight.map((right, j) => `
                <option value="${j}" ${answers[i] == j ? 'selected' : ''}>
                  ${Utils.escapeHTML(right)}
                </option>
              `).join('')}
            </select>
          </div>
        `).join('')}
      </div>
    `;
  },


  // ============================================
  // 8. HINT & TAGS
  // ============================================

  /**
   * Build hint section (hidden by default)
   */
  _buildHintArea(q) {
    if (!q.hint) return '';
    return `
      <div class="q-card__hint" data-hint-qid="${q.id}">
        <span class="q-card__hint-label">💡 Hint:</span>
        ${Utils.escapeHTML(q.hint)}
      </div>
    `;
  },

  /**
   * Build tags row
   */
  _buildTagsArea(q) {
    if (!q.tags || q.tags.length === 0) return '';
    return `
      <div class="q-card__tags">
        ${q.tags.map(tag => `
          <span class="q-card__tag" data-tag="${Utils.escapeHTML(tag)}">#${Utils.escapeHTML(tag)}</span>
        `).join('')}
      </div>
    `;
  },


  // ============================================
  // 9. HELPER LABEL METHODS
  // ============================================

  /**
   * Get display label for question type
   * @param {string} type
   * @returns {string}
   */
  _getTypeLabel(type) {
    const t = QUESTION_TYPES.find(x => x.id === type);
    return t ? `${t.icon} ${t.label}` : type;
  },


  // ============================================
  // 10. EMPTY & LOADING STATES
  // ============================================

  /**
   * Build empty state HTML
   * @param {string} message
   * @returns {string}
   */
  _buildEmptyState(message) {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">🔍</div>
        <div class="empty-state__title">${message || 'No questions found'}</div>
        <div class="empty-state__text">
          Try adjusting your filters or search query to find questions.
        </div>
      </div>
    `;
  },

  /**
   * Render skeleton loading placeholders
   * @param {number} count — Number of skeleton cards to show
   */
  renderSkeletons(count = 5) {
    const grid = this._els.questionsGrid;
    if (!grid) return;

    grid.className = 'questions-grid questions-grid--card';
    grid.innerHTML = '';

    for (let i = 0; i < count; i++) {
      const skel = document.createElement('div');
      skel.className = 'skeleton';
      skel.innerHTML = `
        <div class="skeleton__line skeleton__line--short"></div>
        <div class="skeleton__line skeleton__line--long"></div>
        <div class="skeleton__line skeleton__line--medium"></div>
        <div class="skeleton__line skeleton__line--full"></div>
        <div class="skeleton__line skeleton__line--short" style="margin-top:16px;"></div>
      `;
      grid.appendChild(skel);
    }
  },

  /**
   * Show a loading message
   * @param {string} msg
   */
  renderLoading(msg = 'Loading questions...') {
    const grid = this._els.questionsGrid;
    if (!grid) return;

    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon animate-pulse">📚</div>
        <div class="empty-state__title">${msg}</div>
        <div class="empty-state__text">Please wait while we load your practice questions...</div>
      </div>
    `;
  },


  // ============================================
  // 11. PAGINATION
  // ============================================

  /**
   * Render pagination buttons
   * @param {number} currentPage — 1-based
   * @param {number} totalPages
   * @param {number} totalItems
   */
  renderPagination(currentPage, totalPages, totalItems) {
    const container = this._els.pagination;
    if (!container) return;

    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let html = '';

    // Prev button
    html += `
      <button class="pagination__btn" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''}>
        ◀
      </button>
    `;

    // Page numbers
    const pages = this._getPaginationPages(currentPage, totalPages);
    pages.forEach(p => {
      if (p === '...') {
        html += `<span class="pagination__info">...</span>`;
      } else {
        html += `
          <button class="pagination__btn ${p === currentPage ? 'active' : ''}" data-page="${p}">
            ${p}
          </button>
        `;
      }
    });

    // Next button
    html += `
      <button class="pagination__btn" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''}>
        ▶
      </button>
    `;

    // Info
    html += `<span class="pagination__info">Page ${currentPage} of ${totalPages}</span>`;

    container.innerHTML = html;
  },

  /**
   * Calculate which page numbers to show
   * @param {number} current
   * @param {number} total
   * @returns {Array}
   */
  _getPaginationPages(current, total) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = [];
    pages.push(1);

    if (current > 3) pages.push('...');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) pages.push('...');

    pages.push(total);

    return pages;
  },


  // ============================================
  // 12. MODALS
  // ============================================

  /**
   * Open a modal
   * @param {string} modalId
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (this._els.modalBackdrop) {
      this._els.modalBackdrop.classList.add('active');
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Disable keyboard shortcuts in modals
    Keyboard.setEnabled(false);
  },

  /**
   * Close a modal
   * @param {string} modalId
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');

    // Check if any modal is still open
    const anyOpen = document.querySelector('.modal.active');
    if (!anyOpen) {
      if (this._els.modalBackdrop) {
        this._els.modalBackdrop.classList.remove('active');
      }
      document.body.style.overflow = '';
      Keyboard.setEnabled(true);
    }
  },

  /**
   * Close all modals
   */
  closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
    if (this._els.modalBackdrop) {
      this._els.modalBackdrop.classList.remove('active');
    }
    document.body.style.overflow = '';
    Keyboard.setEnabled(true);
  },


  // ============================================
  // 13. ANALYTICS MODAL
  // ============================================

  /**
   * Render analytics modal content
   * @param {Object} stats — from StatsCalculator.calculate()
   * @param {Array} allQuestions
   */
  renderAnalytics(stats, allQuestions) {
    const body = document.querySelector('#analyticsModal .modal__body');
    if (!body) return;

    // Subject-wise bar chart
    const subjectBars = SUBJECTS.map(s => {
      const data = stats.bySubject[s.id] || { attempted: 0, total: 0 };
      const pct = Utils.percentage(data.attempted, data.total);
      return `
        <div class="analytics__bar" style="height:${Math.max(pct, 5)}%; background:${s.color};" data-tooltip="${s.label}: ${data.attempted}/${data.total}">
          <span class="analytics__bar-value">${pct}%</span>
          <span class="analytics__bar-label">${s.icon}</span>
        </div>
      `;
    }).join('');

    // Difficulty distribution
    const diffBars = DIFFICULTIES.map(d => {
      const data = stats.byDifficulty[d.id] || { attempted: 0, total: 0 };
      const pct = Utils.percentage(data.attempted, data.total);
      return `
        <div class="analytics__bar" style="height:${Math.max(pct, 5)}%; background:${d.color};" data-tooltip="${d.label}: ${data.attempted}/${data.total}">
          <span class="analytics__bar-value">${pct}%</span>
          <span class="analytics__bar-label">${d.icon}</span>
        </div>
      `;
    }).join('');

    // Confidence pie (simplified)
    const confData = stats.byConfidence;
    const totalConf = confData.confident + confData.unsure + confData.noidea;

    // Day-wise progress
    const dayBars = Array.from({ length: TOTAL_DAYS }, (_, i) => {
      const d = i + 1;
      const data = stats.byDay[d] || { attempted: 0, total: 0 };
      const pct = Utils.percentage(data.attempted, data.total);
      return `
        <div class="analytics__bar" style="height:${Math.max(pct, 3)}%; background:var(--accent);" data-tooltip="Day ${d}: ${data.attempted}/${data.total}">
          <span class="analytics__bar-value" style="font-size:0.55rem;">${pct > 0 ? pct + '%' : ''}</span>
          <span class="analytics__bar-label">${d}</span>
        </div>
      `;
    }).join('');

    // Weakest areas
    const weakAreas = StatsCalculator.getWeakestAreas(allQuestions, 5);
    const weakList = weakAreas.length > 0
      ? weakAreas.map(w => `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.82rem;">
          <span>${Utils.escapeHTML(w.topic)}</span>
          <span style="color:var(--red);font-weight:700;">${w.count}</span>
        </div>`).join('')
      : '<p style="font-size:0.82rem;color:var(--text-tertiary);">No data yet. Mark questions with 😰 to track weak areas.</p>';

    // Most bookmarked
    const bookmarkedTopics = StatsCalculator.getMostBookmarkedTopics(allQuestions, 5);
    const bookmarkedList = bookmarkedTopics.length > 0
      ? bookmarkedTopics.map(b => `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.82rem;">
          <span>${Utils.escapeHTML(b.topic)}</span>
          <span style="color:var(--orange);font-weight:700;">${b.count} ⭐</span>
        </div>`).join('')
      : '<p style="font-size:0.82rem;color:var(--text-tertiary);">No bookmarks yet.</p>';

    // Question type distribution
    const typeBars = QUESTION_TYPES.map(t => {
      const data = stats.byType[t.id] || { attempted: 0, total: 0 };
      const pct = data.total > 0 ? Utils.percentage(data.total, stats.total) : 0;
      return `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <span style="font-size:0.8rem;min-width:70px;">${t.icon} ${t.label}</span>
          <div style="flex:1;height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;">
            <div style="width:${pct}%;height:100%;background:var(--accent);border-radius:4px;"></div>
          </div>
          <span style="font-size:0.72rem;color:var(--text-tertiary);min-width:50px;text-align:right;">${data.attempted}/${data.total}</span>
        </div>
      `;
    }).join('');

    body.innerHTML = `
      <!-- Overview Stats -->
      <div class="analytics__grid">
        <div class="analytics__card">
          <div class="analytics__card-title">📊 Overall</div>
          <div style="text-align:center;">
            <div style="font-size:2.5rem;font-weight:900;font-family:var(--font-mono);color:var(--green);">${stats.completionPct}%</div>
            <div style="font-size:0.75rem;color:var(--text-tertiary);">${stats.attempted} of ${stats.total} attempted</div>
          </div>
        </div>
        <div class="analytics__card">
          <div class="analytics__card-title">🔥 Streak</div>
          <div style="text-align:center;">
            <div style="font-size:2.5rem;font-weight:900;font-family:var(--font-mono);color:var(--orange);">${stats.streak}</div>
            <div style="font-size:0.75rem;color:var(--text-tertiary);">consecutive days</div>
          </div>
        </div>
        <div class="analytics__card">
          <div class="analytics__card-title">⭐ Bookmarked</div>
          <div style="text-align:center;">
            <div style="font-size:2.5rem;font-weight:900;font-family:var(--font-mono);color:var(--orange);">${stats.bookmarked}</div>
            <div style="font-size:0.75rem;color:var(--text-tertiary);">questions saved</div>
          </div>
        </div>
      </div>

      <!-- Subject-wise -->
      <div class="analytics__card" style="margin-bottom:16px;">
        <div class="analytics__card-title">📚 Subject-wise Progress</div>
        <div class="analytics__bar-chart" style="margin-bottom:24px;">
          ${subjectBars}
        </div>
        <div class="analytics__legend">
          ${SUBJECTS.map(s => `
            <span class="analytics__legend-item">
              <span class="analytics__legend-dot" style="background:${s.color};"></span>
              ${s.label}
            </span>
          `).join('')}
        </div>
      </div>

      <!-- Difficulty -->
      <div class="analytics__grid">
        <div class="analytics__card">
          <div class="analytics__card-title">📈 Difficulty Progress</div>
          <div class="analytics__bar-chart" style="height:80px;">
            ${diffBars}
          </div>
        </div>
        <div class="analytics__card">
          <div class="analytics__card-title">🎭 Confidence</div>
          <div style="text-align:center;">
            <div style="font-size:0.9rem;margin-bottom:8px;">
              😊 <strong style="color:var(--green);">${confData.confident}</strong> &nbsp;
              😐 <strong style="color:var(--orange);">${confData.unsure}</strong> &nbsp;
              😰 <strong style="color:var(--red);">${confData.noidea}</strong>
            </div>
            <div style="font-size:0.72rem;color:var(--text-tertiary);">${confData.unset} unrated</div>
          </div>
        </div>
      </div>

      <!-- Day-wise -->
      <div class="analytics__card" style="margin:16px 0;">
        <div class="analytics__card-title">📅 Day-wise Progress</div>
        <div class="analytics__bar-chart" style="margin-bottom:24px; height:100px;">
          ${dayBars}
        </div>
      </div>

      <!-- Question Types -->
      <div class="analytics__card" style="margin-bottom:16px;">
        <div class="analytics__card-title">📋 Question Type Distribution</div>
        ${typeBars}
      </div>

      <!-- Weak Areas & Bookmarks -->
      <div class="analytics__grid">
        <div class="analytics__card">
          <div class="analytics__card-title">😰 Weakest Areas</div>
          ${weakList}
        </div>
        <div class="analytics__card">
          <div class="analytics__card-title">⭐ Most Bookmarked</div>
          ${bookmarkedList}
        </div>
      </div>

      <!-- Storage -->
      <div style="text-align:center;margin-top:16px;font-size:0.72rem;color:var(--text-tertiary);">
        💾 Storage used: ${stats.storageUsed}
      </div>
    `;
  },


  // ============================================
  // 14. PRACTICE MODE
  // ============================================

  /**
   * Render practice mode setup form
   */
  renderPracticeSetup() {
    const body = document.querySelector('#practiceModal .modal__body');
    if (!body) return;

    body.innerHTML = `
      <div class="practice-setup" id="practiceSetupForm">
        <!-- Subject selection -->
        <div class="practice-setup__group">
          <label class="practice-setup__label">📚 Select Subjects</label>
          <div class="practice-setup__options" id="practiceSubjects">
            ${SUBJECTS.map(s => `
              <button class="filter-pill active" data-subject="${s.id}" data-practice-filter="subject">
                ${s.icon} ${s.label}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Difficulty -->
        <div class="practice-setup__group">
          <label class="practice-setup__label">🎯 Difficulty</label>
          <div class="practice-setup__options" id="practiceDifficulty">
            ${DIFFICULTIES.map(d => `
              <button class="filter-pill active" data-diff="${d.id}" data-practice-filter="difficulty">
                ${d.icon} ${d.label}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Question Type -->
        <div class="practice-setup__group">
          <label class="practice-setup__label">📝 Question Types</label>
          <div class="practice-setup__options" id="practiceTypes">
            ${QUESTION_TYPES.map(t => `
              <button class="filter-pill active" data-type="${t.id}" data-practice-filter="type">
                ${t.icon} ${t.label}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Count -->
        <div class="practice-setup__group">
          <label class="practice-setup__label">🔢 Number of Questions</label>
          <div class="practice-setup__options">
            <button class="filter-pill" data-count="10" data-practice-filter="count">10</button>
            <button class="filter-pill active" data-count="20" data-practice-filter="count">20</button>
            <button class="filter-pill" data-count="30" data-practice-filter="count">30</button>
            <button class="filter-pill" data-count="50" data-practice-filter="count">50</button>
            <button class="filter-pill" data-count="all" data-practice-filter="count">All</button>
          </div>
        </div>

        <!-- Timer -->
        <div class="practice-setup__group">
          <label class="practice-setup__label">⏱️ Timer (per question)</label>
          <div class="practice-setup__options">
            <button class="filter-pill" data-timer="0" data-practice-filter="timer">No Timer</button>
            <button class="filter-pill active" data-timer="60" data-practice-filter="timer">1 min</button>
            <button class="filter-pill" data-timer="120" data-practice-filter="timer">2 min</button>
            <button class="filter-pill" data-timer="180" data-practice-filter="timer">3 min</button>
          </div>
        </div>

        <!-- Shuffle -->
        <div class="practice-setup__group">
          <label class="practice-setup__label">🔀 Shuffle Questions?</label>
          <div class="practice-setup__options">
            <button class="filter-pill active" data-shuffle="true" data-practice-filter="shuffle">Yes</button>
            <button class="filter-pill" data-shuffle="false" data-practice-filter="shuffle">No</button>
          </div>
        </div>

        <!-- Start Button -->
        <div style="text-align:center; margin-top:16px;">
          <button class="btn btn--primary btn--lg" id="startPracticeBtn">
            🚀 Start Practice
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Render practice mode active view (one question at a time)
   * @param {Array} questions — Practice questions
   * @param {number} currentIndex — 0-based
   * @param {number} timerSeconds — Remaining seconds (0 if no timer)
   */
  renderPracticeQuestion(questions, currentIndex, timerSeconds) {
    const body = document.querySelector('#practiceModal .modal__body');
    if (!body || !questions[currentIndex]) return;

    const q = questions[currentIndex];
    const total = questions.length;
    const userAnswer = Progress.getAnswer(q.id);
    const status = Progress.getStatus(q.id);

    // Navigation pills
    const navPills = questions.map((pq, i) => {
      const pStatus = Progress.getStatus(pq.id);
      let cls = 'practice-mode__nav-btn';
      if (i === currentIndex) cls += ' active';
      else if (pStatus === 'attempted') cls += ' attempted';
      else if (pStatus === 'skipped') cls += ' skipped';
      return `<button class="${cls}" data-practice-goto="${i}">${i + 1}</button>`;
    }).join('');

    const subjectInfo = SUBJECTS.find(s => s.id === q.subject) || {};
    const questionText = Utils.escapeHTML(q.question);

    body.innerHTML = `
      <!-- Timer -->
      ${timerSeconds > 0 ? `
        <div class="practice-mode__timer">
          <div class="practice-mode__timer-display" id="practiceTimerDisplay">
            ${Utils.formatTime(timerSeconds)}
          </div>
        </div>
      ` : ''}

      <!-- Navigation -->
      <div class="practice-mode__nav" id="practiceNav">
        ${navPills}
      </div>

      <!-- Counter -->
      <div style="text-align:center; padding:12px; font-size:0.85rem; color:var(--text-secondary);">
        Question <strong style="color:var(--accent);">${currentIndex + 1}</strong> of <strong>${total}</strong>
        &nbsp;|&nbsp;
        <span class="q-card__badge q-card__badge--subject" data-subject="${q.subject}" style="font-size:0.65rem;">${subjectInfo.icon || ''} ${(q.subject || '').toUpperCase()}</span>
        &nbsp;
        <span class="q-card__badge q-card__badge--diff" data-diff="${q.difficulty}" style="font-size:0.65rem;">${q.difficulty}</span>
        &nbsp;
        <span style="font-size:0.78rem;color:var(--text-tertiary);">${q.marks || 1} marks</span>
      </div>

      <!-- Question -->
      <div class="practice-mode__question">
        <div class="q-card__question" style="font-size:1.05rem;margin-bottom:20px;">${questionText}</div>
        ${this._buildAnswerArea(q, userAnswer)}
        ${this._buildHintArea(q)}
      </div>

      <!-- Actions -->
      <div class="practice-mode__actions">
        <button class="btn" id="practicePrevBtn" ${currentIndex <= 0 ? 'disabled' : ''}>
          ◀ Prev
        </button>
        <div style="display:flex;gap:8px;">
          <button class="btn" id="practiceHintBtn">💡 Hint</button>
          <button class="btn" id="practiceSkipBtn" style="color:var(--orange);">⏭️ Skip</button>
        </div>
        <button class="btn btn--primary" id="practiceNextBtn">
          ${currentIndex >= total - 1 ? '✅ Finish' : 'Next ▶'}
        </button>
      </div>
    `;
  },

  /**
   * Render practice summary after completion
   * @param {Array} questions — Practice questions
   * @param {number} elapsedSeconds
   */
  renderPracticeSummary(questions, elapsedSeconds) {
    const body = document.querySelector('#practiceModal .modal__body');
    if (!body) return;

    let attempted = 0, skipped = 0, notAttempted = 0;
    let confidentCount = 0, unsureCount = 0, noideaCount = 0;

    questions.forEach(q => {
      const s = Progress.getStatus(q.id);
      if (s === 'attempted') attempted++;
      else if (s === 'skipped') skipped++;
      else notAttempted++;

      const c = Progress.getConfidence(q.id);
      if (c === 'confident') confidentCount++;
      else if (c === 'unsure') unsureCount++;
      else if (c === 'noidea') noideaCount++;
    });

    const total = questions.length;
    const pct = Utils.percentage(attempted, total);

    body.innerHTML = `
      <div class="practice-summary">
        <div style="font-size:3rem;margin-bottom:8px;">🎉</div>
        <h2 style="margin-bottom:8px;">Practice Complete!</h2>
        <div class="practice-summary__score">${pct}%</div>
        <p style="color:var(--text-secondary);margin-bottom:24px;">
          You attempted <strong>${attempted}</strong> out of <strong>${total}</strong> questions
          in <strong>${Utils.formatTimeLong(elapsedSeconds)}</strong>
        </p>

        <div class="practice-summary__grid">
          <div class="practice-summary__item">
            <div class="practice-summary__item-num" style="color:var(--green);">${attempted}</div>
            <div class="practice-summary__item-label">Attempted</div>
          </div>
          <div class="practice-summary__item">
            <div class="practice-summary__item-num" style="color:var(--orange);">${skipped}</div>
            <div class="practice-summary__item-label">Skipped</div>
          </div>
          <div class="practice-summary__item">
            <div class="practice-summary__item-num" style="color:var(--text-tertiary);">${notAttempted}</div>
            <div class="practice-summary__item-label">Not Attempted</div>
          </div>
        </div>

        <div style="margin-top:24px;">
          <h4 style="margin-bottom:12px;font-size:0.9rem;">Confidence Breakdown</h4>
          <div style="display:flex;justify-content:center;gap:16px;">
            <span>😊 <strong style="color:var(--green);">${confidentCount}</strong></span>
            <span>😐 <strong style="color:var(--orange);">${unsureCount}</strong></span>
            <span>😰 <strong style="color:var(--red);">${noideaCount}</strong></span>
          </div>
        </div>

        <div style="margin-top:32px; display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
          <button class="btn btn--primary" id="practiceRetryBtn">🔄 Practice Again</button>
          <button class="btn" id="practiceCloseBtn">✕ Close</button>
        </div>
      </div>
    `;
  },


  // ============================================
  // 15. SETTINGS MODAL
  // ============================================

  /**
   * Render settings modal content
   * @param {Object} settings — Current settings
   */
  renderSettings(settings) {
    const body = document.querySelector('#settingsModal .modal__body');
    if (!body) return;

    body.innerHTML = `
      <div class="settings-group">
        <div class="settings-group__title">🎨 Appearance</div>
        <div class="settings-row">
          <span class="settings-row__label">Dark Mode</span>
          <label class="toggle-switch">
            <input type="checkbox" id="settingTheme" ${settings.theme === 'dark' ? 'checked' : ''}>
            <span class="toggle-switch__slider"></span>
          </label>
        </div>
        <div class="settings-row">
          <span class="settings-row__label">Animations</span>
          <label class="toggle-switch">
            <input type="checkbox" id="settingAnimations" ${settings.animations ? 'checked' : ''}>
            <span class="toggle-switch__slider"></span>
          </label>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group__title">📋 Display</div>
        <div class="settings-row">
          <span class="settings-row__label">Show Hints</span>
          <label class="toggle-switch">
            <input type="checkbox" id="settingHints" ${settings.showHints ? 'checked' : ''}>
            <span class="toggle-switch__slider"></span>
          </label>
        </div>
        <div class="settings-row">
          <span class="settings-row__label">Show Tags</span>
          <label class="toggle-switch">
            <input type="checkbox" id="settingTags" ${settings.showTags ? 'checked' : ''}>
            <span class="toggle-switch__slider"></span>
          </label>
        </div>
        <div class="settings-row">
          <span class="settings-row__label">Questions per page</span>
          <select class="per-page-select" id="settingPerPage">
            <option value="10" ${settings.perPage === 10 ? 'selected' : ''}>10</option>
            <option value="20" ${settings.perPage === 20 ? 'selected' : ''}>20</option>
            <option value="30" ${settings.perPage === 30 ? 'selected' : ''}>30</option>
            <option value="50" ${settings.perPage === 50 ? 'selected' : ''}>50</option>
          </select>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group__title">🔊 Sound</div>
        <div class="settings-row">
          <span class="settings-row__label">Sound Effects</span>
          <label class="toggle-switch">
            <input type="checkbox" id="settingSound" ${settings.soundEffects ? 'checked' : ''}>
            <span class="toggle-switch__slider"></span>
          </label>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group__title">💾 Data</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
          <button class="btn" id="settingExport">📤 Export Progress</button>
          <button class="btn" id="settingImport">📥 Import Progress</button>
          <button class="btn btn--danger" id="settingReset">🗑️ Reset All Data</button>
        </div>
        <input type="file" id="importFileInput" accept=".json" style="display:none;">
        <div style="margin-top:12px; font-size:0.72rem; color:var(--text-tertiary);">
          💾 Storage: ${Storage.formatSize(Storage.getSize())}
        </div>
      </div>
    `;
  },


  // ============================================
  // 16. TOAST NOTIFICATION
  // ============================================

  /**
   * Show a toast notification
   * @param {string} message
   * @param {string} type — 'success' | 'error' | 'info' | 'warning'
   * @param {number} duration — Milliseconds
   */
  showToast(message, type = 'success', duration = 2500) {
    const toast = this._els.toast;
    if (!toast) return;

    // Clear any existing timeout
    if (this._toastTimeout) clearTimeout(this._toastTimeout);

    toast.className = 'toast toast--' + type;
    toast.textContent = message;
    toast.classList.add('show');

    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  },

  /** @type {number|null} Toast timeout reference */
  _toastTimeout: null,


  // ============================================
  // 17. THEME TOGGLE
  // ============================================

  /**
   * Apply theme to document
   * @param {string} theme — 'dark' | 'light'
   */
  applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    if (this._els.themeBtn) {
      this._els.themeBtn.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  },


  // ============================================
  // 18. INDIVIDUAL CARD UPDATES (without full re-render)
  // ============================================

  /**
   * Update bookmark icon on a specific card
   * @param {string} qId
   * @param {boolean} bookmarked
   */
  updateBookmark(qId, bookmarked) {
    const btns = document.querySelectorAll(`.btn-bookmark[data-qid="${qId}"]`);
    btns.forEach(btn => {
      btn.classList.toggle('active', bookmarked);
      btn.innerHTML = bookmarked ? '⭐ Saved' : '☆ Save';
    });

    const card = document.querySelector(`.q-card[data-qid="${qId}"]`);
    if (card) card.classList.toggle('q-card--bookmarked', bookmarked);
  },

  /**
   * Update confidence buttons on a specific card
   * @param {string} qId
   * @param {string} level
   */
  updateConfidence(qId, level) {
    const container = document.querySelector(`.q-card__confidence[data-qid="${qId}"]`);
    if (!container) return;
    container.querySelectorAll('.q-card__conf-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.conf === level);
    });
  },

  /**
   * Update status buttons on a specific card
   * @param {string} qId
   * @param {string} status
   */
  updateStatus(qId, status) {
    const container = document.querySelector(`.q-card__status-btns[data-qid="${qId}"]`);
    if (container) {
      container.querySelectorAll('.q-card__status-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.status === status);
      });
    }

    const card = document.querySelector(`.q-card[data-qid="${qId}"]`);
    if (card) {
      card.classList.remove('q-card--attempted', 'q-card--skipped');
      if (status === 'attempted') card.classList.add('q-card--attempted');
      if (status === 'skipped') card.classList.add('q-card--skipped');
    }
  },

  /**
   * Toggle hint visibility on a specific card
   * @param {string} qId
   */
  toggleHint(qId) {
    const hint = document.querySelector(`.q-card__hint[data-hint-qid="${qId}"]`);
    if (hint) hint.classList.toggle('visible');
  },

  /**
   * Update MCQ selection on a card
   * @param {string} qId
   * @param {number} selectedIndex
   */
  updateMCQSelection(qId, selectedIndex) {
    const container = document.querySelector(`.q-card__options[data-qid="${qId}"]`);
    if (!container) return;
    container.querySelectorAll('.q-card__option').forEach(opt => {
      const idx = parseInt(opt.dataset.optionIndex);
      opt.classList.toggle('selected', idx === selectedIndex);
    });
  },

  /**
   * Update True/False selection
   * @param {string} qId
   * @param {string} value — 'true' or 'false'
   */
  updateTFSelection(qId, value) {
    const container = document.querySelector(`.q-card__tf-options[data-qid="${qId}"]`);
    if (!container) return;
    container.querySelectorAll('.q-card__tf-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.tfValue === value);
    });
  },


  // ============================================
  // 19. CONFETTI EFFECT
  // ============================================

  /**
   * Launch confetti animation
   */
  launchConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ec4899', '#06b6d4'];

    for (let i = 0; i < 80; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 2 + 's';
      piece.style.width = (Math.random() * 8 + 4) + 'px';
      piece.style.height = (Math.random() * 8 + 4) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      container.appendChild(piece);
    }

    setTimeout(() => container.remove(), 4000);
  },


  // ============================================
  // 20. SCROLL UTILITIES
  // ============================================

  /**
   * Scroll to top of page
   */
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * Scroll to a specific element
   * @param {string} selector
   */
  scrollTo(selector) {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};