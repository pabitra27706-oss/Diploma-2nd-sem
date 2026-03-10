/* ========================================
   PYQ RENDER - DOM Rendering Functions
   UPDATED VERSION - With formatAnswerText
   All HTML generation in one place
   ======================================== */

const PYQRender = {

    // ============ ICONS (DRY) ============
    
    icons: {
        check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        
        cross: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
        
        bookmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`,
        
        bookmarkFilled: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`,
        
        eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
        
        sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
        
        moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
        
        menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
        
        search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
        
        filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>`,
        
        chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
        
        refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>`,
        
        chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
        
        chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
        
        arrowUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`,
        
        info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
        
        alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
    },

    // ============ PAGE STRUCTURE ============

    /**
     * Render complete page structure
     * @param {Object} config - App configuration
     * @returns {string} HTML string
     */
    renderPage(config) {
        return `
            <!-- Loading Screen -->
            <div id="loadingScreen" class="loading-screen">
                <div class="loading-spinner"></div>
                <p>Loading ${config.subject}...</p>
            </div>

            <!-- Header -->
            ${this.renderHeader(config)}

            <!-- Main Layout -->
            <div class="app-layout">
                <!-- Sidebar -->
                ${this.renderSidebar()}

                <!-- Main Content -->
                <main class="main-content">
                    <!-- Year Tabs -->
                    ${this.renderYearTabs(config.years)}

                    <!-- Toolbar -->
                    ${this.renderToolbar()}

                    <!-- Question Container -->
                    <div id="questionContainer" class="question-container">
                        <!-- Questions render here -->
                    </div>

                    <!-- Navigation Footer -->
                    ${this.renderFooter()}
                </main>
            </div>

            <!-- Overlay -->
            <div id="overlay" class="overlay"></div>

            <!-- Search Panel -->
            ${this.renderSearchPanel()}

            <!-- Filter Panel -->
            ${this.renderFilterPanel()}

            <!-- Modals -->
            ${this.renderStatsModalContainer()}
            ${this.renderBookmarksModalContainer()}

            <!-- Toast -->
            <div id="toast" class="toast hidden">
                <span class="toast-message"></span>
            </div>

            <!-- Go to Top -->
            <button id="goToTop" class="go-to-top hidden" aria-label="Go to top">
                ${this.icons.arrowUp}
            </button>
        `;
    },

    /**
     * Render header
     */
    renderHeader(config) {
        return `
            <header class="app-header">
                <div class="header-left">
                    <button id="menuBtn" class="icon-btn menu-btn" aria-label="Toggle menu">
                        ${this.icons.menu}
                    </button>
                    <div class="header-title">
                        <h1 id="subjectTitle">${config.subject} PYQ</h1>
                        <span class="header-subtitle">${config.course || ''}</span>
                    </div>
                </div>
                <div class="header-right">
                    <button id="searchBtn" class="icon-btn" aria-label="Search" title="Search (S)">
                        ${this.icons.search}
                    </button>
                    <button id="themeBtn" class="icon-btn" aria-label="Toggle theme" title="Toggle theme (D)">
                        <span class="sun-icon">${this.icons.sun}</span>
                        <span class="moon-icon hidden">${this.icons.moon}</span>
                    </button>
                </div>
            </header>
        `;
    },

    /**
     * Render year tabs
     */
    renderYearTabs(years) {
        const tabsHTML = years.map((year, index) => `
            <button class="year-tab ${index === 0 ? 'active' : ''}" data-year="${year}">
                ${year}
            </button>
        `).join('');

        return `
            <div class="year-tabs-container">
                <div class="year-tabs" id="yearTabs">
                    ${tabsHTML}
                </div>
            </div>
        `;
    },

    /**
     * Render toolbar
     */
    renderToolbar() {
        return `
            <div class="toolbar">
                <div class="toolbar-left">
                    <div class="mode-toggle">
                        <button class="mode-btn active" data-mode="practice">Practice</button>
                        <button class="mode-btn" data-mode="review">Review</button>
                    </div>
                </div>
                <div class="toolbar-right">
                    <button id="filterBtn" class="icon-btn" aria-label="Filter" title="Filter">
                        ${this.icons.filter}
                    </button>
                    <div class="progress-mini">
                        <span id="attemptedCount">0/0</span>
                        <span class="progress-divider">|</span>
                        <span id="scoreCount">0/0</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render sidebar
     */
    renderSidebar() {
        return `
            <aside id="sidebar" class="sidebar">
                <div class="sidebar-header">
                    <h2>Questions</h2>
                    <button id="closeSidebar" class="icon-btn" aria-label="Close sidebar">
                        ${this.icons.cross}
                    </button>
                </div>
                
                <div class="sidebar-progress">
                    <div class="progress-bar">
                        <div id="overallProgress" class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-text">
                        <span id="questionPosition">Question 0 of 0</span>
                    </div>
                </div>

                <div class="sidebar-actions">
                    <button id="bookmarksBtn" class="sidebar-action-btn">
                        ${this.icons.bookmark}
                        <span>Bookmarks</span>
                        <span id="bookmarkCount" class="badge">0</span>
                    </button>
                    <button id="statsBtn" class="sidebar-action-btn">
                        ${this.icons.chart}
                        <span>Statistics</span>
                    </button>
                    <button id="resetBtn" class="sidebar-action-btn danger">
                        ${this.icons.refresh}
                        <span>Reset Progress</span>
                    </button>
                </div>

                <div class="sidebar-list" id="questionList">
                    <!-- Question items render here -->
                </div>
            </aside>
        `;
    },

    /**
     * Render footer navigation
     */
    renderFooter() {
        return `
            <footer class="nav-footer">
                <div class="question-navigator" id="questionNavigator">
                    <!-- Navigator dots render here -->
                </div>
                <div class="nav-buttons">
                    <button id="prevBtn" class="nav-btn" disabled>
                        ${this.icons.chevronLeft}
                        <span>Previous</span>
                    </button>
                    <button id="nextBtn" class="nav-btn">
                        <span>Next</span>
                        ${this.icons.chevronRight}
                    </button>
                </div>
            </footer>
        `;
    },

    /**
     * Render search panel
     */
    renderSearchPanel() {
        return `
            <div id="searchPanel" class="search-panel hidden">
                <div class="search-header">
                    <div class="search-input-wrapper">
                        ${this.icons.search}
                        <input type="text" id="searchInput" placeholder="Search questions..." autocomplete="off">
                    </div>
                    <button id="closeSearch" class="icon-btn">
                        ${this.icons.cross}
                    </button>
                </div>
                <div id="searchResults" class="search-results">
                    <!-- Results render here -->
                </div>
            </div>
        `;
    },

    /**
     * Render filter panel
     */
    renderFilterPanel() {
        return `
            <div id="filterPanel" class="filter-panel hidden">
                <div class="filter-section">
                    <h4>Question Type</h4>
                    <div class="filter-options">
                        <label><input type="checkbox" class="filter-type" value="mcq" checked> MCQ</label>
                        <label><input type="checkbox" class="filter-type" value="truefalse" checked> True/False</label>
                        <label><input type="checkbox" class="filter-type" value="gapfill" checked> Fill in Blank</label>
                        <label><input type="checkbox" class="filter-type" value="saq" checked> Short Answer</label>
                        <label><input type="checkbox" class="filter-type" value="laq" checked> Long Answer</label>
                    </div>
                </div>
                <div class="filter-section">
                    <h4>Status</h4>
                    <div class="filter-options">
                        <label><input type="checkbox" class="filter-status" value="attempted"> Attempted</label>
                        <label><input type="checkbox" class="filter-status" value="unattempted"> Unattempted</label>
                        <label><input type="checkbox" class="filter-status" value="correct"> Correct</label>
                        <label><input type="checkbox" class="filter-status" value="wrong"> Wrong</label>
                        <label><input type="checkbox" class="filter-status" value="bookmarked"> Bookmarked</label>
                    </div>
                </div>
                <div class="filter-actions">
                    <button id="resetFilters" class="btn-secondary">Reset</button>
                    <button id="applyFilters" class="btn-primary">Apply</button>
                </div>
            </div>
        `;
    },

    /**
     * Render stats modal container
     */
    renderStatsModalContainer() {
        return `
            <div id="statsModal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Statistics</h2>
                        <button class="close-modal icon-btn" data-modal="statsModal">
                            ${this.icons.cross}
                        </button>
                    </div>
                    <div class="modal-body" id="statsContent">
                        <!-- Stats render here -->
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render bookmarks modal container
     */
    renderBookmarksModalContainer() {
        return `
            <div id="bookmarksModal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Bookmarks</h2>
                        <button class="close-modal icon-btn" data-modal="bookmarksModal">
                            ${this.icons.cross}
                        </button>
                    </div>
                    <div class="modal-body" id="bookmarksContent">
                        <!-- Bookmarks render here -->
                    </div>
                </div>
            </div>
        `;
    },

    // ============ QUESTION RENDERING ============

    /**
     * Render a question
     * @param {Object} question - Question data
     * @param {Object} state - Current state
     * @returns {string} HTML string
     */
    renderQuestion(question, state) {
        if (!question) return this.renderEmpty();
        
        if (question.type === 'missing') {
            return this.renderMissing(question);
        }

        const userAnswer = state.userAnswers[question._uniqueId];
        const isBookmarked = state.bookmarks.includes(question._uniqueId);
        const displayNumber = state.currentQuestionIndex + 1;

        return `
            <div class="question-wrapper" data-question-id="${question._uniqueId}">
                ${this.renderQuestionHeader(question, isBookmarked, displayNumber)}
                <div class="question-text">${question.question}</div>
                ${this.renderQuestionBody(question, userAnswer, state.mode)}
            </div>
        `;
    },

    /**
     * Render question header
     */
    renderQuestionHeader(question, isBookmarked, displayNumber) {
        const marks = PYQHelpers.formatMarks(question.marks);
        
        return `
            <div class="question-header">
                <div class="question-meta">
                    <span class="question-number">Q${displayNumber}</span>
                    <span class="question-type type-${question.type}">
                        ${PYQHelpers.formatQuestionType(question.type)}
                    </span>
                    ${marks ? `<span class="question-marks">${marks}</span>` : ''}
                    ${question.group ? `<span class="question-group">Group ${question.group}</span>` : ''}
                </div>
                <div class="question-actions">
                    <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" 
                            id="bookmarkBtn"
                            aria-label="${isBookmarked ? 'Remove bookmark' : 'Add bookmark'}"
                            title="Bookmark (B)">
                        ${isBookmarked ? this.icons.bookmarkFilled : this.icons.bookmark}
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Render question body based on type
     */
    renderQuestionBody(question, userAnswer, mode) {
        const renderers = {
            mcq: () => this.renderMCQ(question, userAnswer, mode),
            truefalse: () => this.renderTrueFalse(question, userAnswer, mode),
            gapfill: () => this.renderGapFill(question, userAnswer, mode),
            saq: () => this.renderSAQ(question, userAnswer, mode),
            laq: () => this.renderLAQ(question, userAnswer, mode)
        };

        const renderer = renderers[question.type];
        return renderer ? renderer() : '<p class="error">Unknown question type</p>';
    },

    /**
     * Render MCQ question
     */
    renderMCQ(question, userAnswer, mode) {
        const isAnswered = userAnswer?.isCorrect !== undefined;
        const showFeedback = mode === 'practice' && isAnswered;
        const showAnswers = mode === 'review';
        const isDisabled = showFeedback || showAnswers;

        let html = '<div class="mcq-options">';
        
        question.options.forEach((option, index) => {
            const letter = String.fromCharCode(65 + index);
            const isSelected = userAnswer?.answer === index;
            const isCorrect = index === question.correct;
            
            let classes = ['mcq-option'];
            if (isSelected) classes.push('selected');
            if (isDisabled) {
                classes.push('disabled');
                if (isCorrect) classes.push('correct');
                if (isSelected && !isCorrect) classes.push('wrong');
            }

            const icon = isDisabled ? (
                isCorrect ? `<span class="option-icon correct">${this.icons.check}</span>` :
                isSelected ? `<span class="option-icon wrong">${this.icons.cross}</span>` : ''
            ) : '';

            html += `
                <div class="${classes.join(' ')}" data-option-index="${index}">
                    <div class="option-indicator">${letter}</div>
                    <div class="option-text">${option}</div>
                    ${icon}
                </div>
            `;
        });

        html += '</div>';

        // Submit button
        if (mode === 'practice' && !isAnswered) {
            html += `
                <button class="submit-btn" id="submitBtn" disabled>
                    ${this.icons.check}
                    <span>Submit Answer</span>
                </button>
            `;
        }

        // Feedback
        if (showFeedback) {
            html += this.renderFeedback(userAnswer.isCorrect, question);
        }

        if (showAnswers && !isAnswered) {
            html += this.renderCorrectAnswer(question);
        }

        return html;
    },

    /**
     * Render True/False question
     */
    renderTrueFalse(question, userAnswer, mode) {
        const isAnswered = userAnswer?.isCorrect !== undefined;
        const showFeedback = mode === 'practice' && isAnswered;
        const showAnswers = mode === 'review';
        const isDisabled = showFeedback || showAnswers;

        let html = '<div class="tf-options">';

        [true, false].forEach(value => {
            const isSelected = userAnswer?.answer === value;
            const isCorrect = value === question.correct;
            
            let classes = ['tf-option'];
            if (isSelected) classes.push('selected');
            if (isDisabled) {
                classes.push('disabled');
                if (isCorrect) classes.push('correct');
                if (isSelected && !isCorrect) classes.push('wrong');
            }

            html += `
                <button class="${classes.join(' ')}" 
                        data-tf-value="${value}"
                        ${isDisabled ? 'disabled' : ''}>
                    ${value ? 'True' : 'False'}
                </button>
            `;
        });

        html += '</div>';

        if (mode === 'practice' && !isAnswered) {
            html += `
                <button class="submit-btn" id="submitBtn" disabled>
                    ${this.icons.check}
                    <span>Submit Answer</span>
                </button>
            `;
        }

        if (showFeedback) {
            html += this.renderFeedback(userAnswer.isCorrect, question);
        }

        if (showAnswers && !isAnswered) {
            html += this.renderCorrectAnswer(question);
        }

        return html;
    },

    /**
     * Render Gap Fill question
     */
    renderGapFill(question, userAnswer, mode) {
        const isAnswered = userAnswer?.isCorrect !== undefined;
        const showFeedback = mode === 'practice' && isAnswered;
        const showAnswers = mode === 'review';
        const isDisabled = showFeedback || showAnswers;

        let inputClass = 'gapfill-input';
        if (isDisabled && userAnswer) {
            inputClass += userAnswer.isCorrect ? ' correct' : ' wrong';
        }

        let html = `
            <div class="gapfill-wrapper">
                <input type="text" 
                       id="gapfillInput"
                       class="${inputClass}"
                       placeholder="Type your answer..."
                       value="${userAnswer?.answer || ''}"
                       ${isDisabled ? 'readonly' : ''}
                       autocomplete="off">
            </div>
        `;

        if (mode === 'practice' && !isAnswered) {
            html += `
                <button class="submit-btn" id="submitBtn" disabled>
                    ${this.icons.check}
                    <span>Submit Answer</span>
                </button>
            `;
        }

        if (showFeedback) {
            html += this.renderFeedback(userAnswer.isCorrect, question);
        }

        if (showAnswers && !isAnswered) {
            html += this.renderCorrectAnswer(question);
        }

        return html;
    },

    /**
     * Render SAQ question - UPDATED with formatAnswerText
     */
    renderSAQ(question, userAnswer, mode) {
        const isViewed = userAnswer?.viewed === true;

        let html = '';

        if (!isViewed && mode === 'practice') {
            html += `
                <button class="show-answer-btn" id="showAnswerBtn">
                    ${this.icons.eye}
                    <span>Show Answer</span>
                </button>
            `;
        }

        if (isViewed || mode === 'review') {
            html += `
                <div class="answer-display">
                    <h4>📝 Model Answer</h4>
                    <div class="answer-content">${PYQHelpers.formatAnswerText(question.answer)}</div>
                    ${question.keywords?.length ? `
                        <div class="key-points">
                            <h5>Key Points:</h5>
                            <ul>${question.keywords.map(kw => `<li>${kw}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        return html;
    },

    /**
     * Render LAQ question - UPDATED with formatAnswerText
     */
    renderLAQ(question, userAnswer, mode) {
        const isViewed = userAnswer?.viewed === true;

        let html = '';

        if (!isViewed && mode === 'practice') {
            html += `
                <button class="show-answer-btn" id="showAnswerBtn">
                    ${this.icons.eye}
                    <span>Show Answer</span>
                </button>
            `;
        }

        if (isViewed || mode === 'review') {
            html += `
                <div class="answer-display">
                    <h4>📝 Complete Answer</h4>
                    <div class="answer-content">${PYQHelpers.formatAnswerText(question.answer)}</div>
                    ${question.keyPoints?.length ? `
                        <div class="key-points">
                            <h5>Key Points to Include:</h5>
                            <ul>${question.keyPoints.map(p => `<li>${p}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        return html;
    },

    /**
     * Render missing question
     */
    renderMissing(question) {
        return `
            <div class="question-wrapper missing">
                <div class="missing-content">
                    ${this.icons.alert}
                    <h3>Question Not Available</h3>
                    <p>${question.reason || 'This question data is not available.'}</p>
                </div>
            </div>
        `;
    },

    /**
     * Render feedback section - UPDATED with formatAnswerText
     */
    renderFeedback(isCorrect, question) {
        const icon = isCorrect 
            ? `<span class="feedback-icon correct">${this.icons.check}</span>`
            : `<span class="feedback-icon wrong">${this.icons.cross}</span>`;

        return `
            <div class="feedback-section ${isCorrect ? 'correct' : 'wrong'}">
                <div class="feedback-header">
                    ${icon}
                    <span class="feedback-title">${isCorrect ? '✅ Correct!' : '❌ Incorrect'}</span>
                </div>
                <div class="feedback-body">
                    ${!isCorrect ? this.getCorrectAnswerText(question) : ''}
                    ${question.explanation ? `
                        <div class="explanation">
                            <strong>💡 Explanation:</strong>
                            <div class="explanation-text">${PYQHelpers.formatAnswerText(question.explanation)}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Render correct answer box - UPDATED with formatAnswerText
     */
    renderCorrectAnswer(question) {
        return `
            <div class="answer-display correct-answer-box">
                <h4>✅ Correct Answer</h4>
                <div class="answer-content">
                    ${this.getCorrectAnswerText(question)}
                    ${question.explanation ? `
                        <div class="explanation">
                            <strong>💡 Explanation:</strong>
                            <div class="explanation-text">${PYQHelpers.formatAnswerText(question.explanation)}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Get correct answer text
     */
    getCorrectAnswerText(question) {
        switch (question.type) {
            case 'mcq':
                const letter = String.fromCharCode(65 + question.correct);
                return `<p><strong>Answer:</strong> ${letter}. ${question.options[question.correct]}</p>`;
            case 'truefalse':
                return `<p><strong>Answer:</strong> ${question.correct ? 'True' : 'False'}</p>`;
            case 'gapfill':
                const answer = question.acceptableAnswers?.[0] || question.answer;
                return `<p><strong>Answer:</strong> ${answer}</p>`;
            default:
                return '';
        }
    },

    // ============ SIDEBAR ITEMS ============

    /**
     * Render question list for sidebar
     */
    renderQuestionList(questions, currentIndex, userAnswers, bookmarks) {
        return questions.map((q, index) => {
            const answer = userAnswers[q._uniqueId];
            const isActive = index === currentIndex;
            const isCorrect = answer?.isCorrect === true;
            const isWrong = answer?.isCorrect === false;
            const isBookmarked = bookmarks.includes(q._uniqueId);

            let classes = ['question-item'];
            if (isActive) classes.push('active');
            if (isCorrect) classes.push('correct');
            if (isWrong) classes.push('wrong');
            if (isBookmarked) classes.push('bookmarked');
            if (q.type === 'missing') classes.push('missing');

            const preview = PYQHelpers.truncateText(q.question, 40);

            return `
                <div class="${classes.join(' ')}" data-question-index="${index}">
                    <div class="question-item-status"></div>
                    <div class="question-item-text">Q${index + 1}. ${preview}</div>
                </div>
            `;
        }).join('');
    },

    /**
     * Render navigator dots
     */
    renderNavigator(questions, currentIndex, userAnswers, bookmarks) {
        return questions.map((q, index) => {
            const answer = userAnswers[q._uniqueId];
            const isActive = index === currentIndex;
            const isCorrect = answer?.isCorrect === true;
            const isWrong = answer?.isCorrect === false;
            const isBookmarked = bookmarks.includes(q._uniqueId);

            let classes = ['nav-dot'];
            if (isActive) classes.push('active');
            if (isCorrect) classes.push('correct');
            if (isWrong) classes.push('wrong');
            if (isBookmarked) classes.push('bookmarked');

            return `
                <button class="${classes.join(' ')}" 
                        data-question-index="${index}"
                        title="Question ${index + 1}">
                    ${index + 1}
                </button>
            `;
        }).join('');
    },

    // ============ MODALS ============

    /**
     * Render statistics content
     */
    renderStats(stats) {
        const { score, typeStats, overallAccuracy } = stats;

        return `
            <div class="stats-grid">
                <div class="stats-card">
                    <h3>Overall Performance</h3>
                    <div class="stats-row">
                        <span>Score</span>
                        <strong>${score.earnedMarks}/${score.totalMarks}</strong>
                    </div>
                    <div class="stats-bar">
                        <div class="stats-bar-fill" style="width: ${score.percentage}%"></div>
                    </div>
                    <div class="stats-row">
                        <span>Accuracy</span>
                        <strong>${overallAccuracy}%</strong>
                    </div>
                    <div class="stats-row">
                        <span>Attempted</span>
                        <strong>${score.attempted}/${score.total}</strong>
                    </div>
                    <div class="stats-row">
                        <span>Correct</span>
                        <strong class="text-success">${score.correct}</strong>
                    </div>
                    <div class="stats-row">
                        <span>Wrong</span>
                        <strong class="text-danger">${score.wrong}</strong>
                    </div>
                </div>

                <div class="stats-card">
                    <h3>By Question Type</h3>
                    ${Object.entries(typeStats).map(([type, data]) => `
                        <div class="stats-type-row">
                            <span>${PYQHelpers.formatQuestionType(type)}</span>
                            <span>${data.correct}/${data.total}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Render bookmarks content
     */
    renderBookmarks(questions, bookmarks, userAnswers) {
        if (bookmarks.length === 0) {
            return `
                <div class="empty-state">
                    ${this.icons.bookmark}
                    <p>No bookmarks yet</p>
                    <small>Bookmark questions to save them for later!</small>
                </div>
            `;
        }

        const bookmarkedQuestions = questions.filter(q => bookmarks.includes(q._uniqueId));

        if (bookmarkedQuestions.length === 0) {
            return `
                <div class="empty-state">
                    ${this.icons.bookmark}
                    <p>No bookmarks for this year</p>
                    <small>Bookmarks from other years won't appear here.</small>
                </div>
            `;
        }

        return `
            <div class="bookmarks-list">
                ${bookmarkedQuestions.map(q => {
                    const answer = userAnswers[q._uniqueId];
                    const isCorrect = answer?.isCorrect === true;
                    const isWrong = answer?.isCorrect === false;

                    return `
                        <div class="bookmark-item" data-question-id="${q._uniqueId}">
                            <div class="bookmark-content">
                                <div class="bookmark-meta">
                                    <span class="question-type type-${q.type}">
                                        ${PYQHelpers.formatQuestionType(q.type)}
                                    </span>
                                    ${isCorrect ? '<span class="status-badge correct">✓ Correct</span>' : ''}
                                    ${isWrong ? '<span class="status-badge wrong">✗ Wrong</span>' : ''}
                                </div>
                                <div class="bookmark-text">
                                    <strong>Q${q.id}.</strong> ${PYQHelpers.truncateText(q.question, 60)}
                                </div>
                            </div>
                            <button class="remove-bookmark-btn" data-bookmark-id="${q._uniqueId}">
                                ${this.icons.cross}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    /**
     * Render search results
     */
    renderSearchResults(results, searchTerm) {
        if (results.length === 0) {
            return '<p class="search-empty">No results found</p>';
        }

        return results.map(result => {
            const q = result.question;
            const highlighted = PYQHelpers.highlightText(
                PYQHelpers.truncateText(q.question, 80),
                searchTerm
            );

            return `
                <div class="search-result-item" data-question-id="${q._uniqueId}">
                    <div class="search-result-meta">
                        <span class="question-type type-${q.type}">
                            ${PYQHelpers.formatQuestionType(q.type)}
                        </span>
                    </div>
                    <div class="search-result-text">
                        <strong>Q${q.id}.</strong> ${highlighted}
                    </div>
                </div>
            `;
        }).join('');
    },

    // ============ STATES ============

    /**
     * Render loading state
     */
    renderLoading() {
        return `
            <div class="state-container loading">
                <div class="loading-spinner"></div>
                <p>Loading questions...</p>
            </div>
        `;
    },

    /**
     * Render error state
     */
    renderError(message) {
        return `
            <div class="state-container error">
                ${this.icons.alert}
                <h3>Error Loading Data</h3>
                <p>${message}</p>
                <button class="btn-primary" onclick="location.reload()">Retry</button>
            </div>
        `;
    },

    /**
     * Render empty state
     */
    renderEmpty() {
        return `
            <div class="state-container empty">
                ${this.icons.info}
                <h3>No Questions Found</h3>
                <p>Try adjusting your filters or select a different year.</p>
            </div>
        `;
    },

    // ============ TOAST ============

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.getElementById('toast');
        if (!toast) {
            console.log(`Toast (${type}): ${message}`);
            return;
        }

        const messageEl = toast.querySelector('.toast-message');
        if (messageEl) messageEl.textContent = message;

        toast.className = `toast ${type}`;
        
        clearTimeout(this._toastTimeout);
        
        this._toastTimeout = setTimeout(() => {
            toast.classList.add('hidden');
        }, duration);
    }
};

// Make globally available
window.PYQRender = PYQRender;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PYQRender;
}