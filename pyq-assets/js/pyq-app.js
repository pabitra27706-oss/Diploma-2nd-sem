/* ========================================
   PYQ APP - Main Application Controller
   UPDATED - With Print Overlay + Text Size
   ======================================== */

class PYQApp {
    constructor(config) {
        this.config = config;

        this.state = {
            currentYear: config.years[0],
            currentQuestionIndex: 0,
            mode: 'practice',
            questions: [],
            filteredQuestions: [],
            userAnswers: {},
            bookmarks: [],
            filters: { types: [], status: [] },
            selectedOption: null,
            isLoading: false,
            error: null
        };

        this.autoSaveInterval = null;
        this.init();
    }

    // ============ INITIALIZATION ============

    async init() {
        console.log(`🚀 Initializing PYQ App for ${this.config.subject}`);

        const root = document.getElementById('pyq-root');
        if (root) {
            root.innerHTML = PYQRender.renderPage(this.config);
        }

        const theme = PYQStorage.getTheme();
        PYQStorage.setTheme(theme);
        this.updateThemeUI(theme);

        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupTouchGestures();
        this.setupAutoSave();

        await this.loadYear(this.state.currentYear);

        this.hideLoadingScreen();

        console.log('✅ App initialized successfully');
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }, 300);
    }

    // ============ DATA LOADING ============

    async loadYear(year) {
        console.log(`📚 Loading year ${year}...`);

        this.state.isLoading = true;
        this.state.error = null;

        const container = document.getElementById('questionContainer');
        if (container) {
            container.innerHTML = PYQRender.renderLoading();
        }

        try {
            const jsonPath = `${this.config.dataPath}${year}.json`;
            let data;

            try {
                data = await PYQHelpers.fetchJSON(jsonPath);
            } catch (fetchError) {
                const globalVar = `PYQ_${year}`;
                if (window[globalVar]) {
                    console.log(`📦 Using global variable ${globalVar}`);
                    data = window[globalVar];
                } else {
                    throw new Error(`No data found for year ${year}`);
                }
            }

            this.state.questions = (data.questions || []).map((q, index) => ({
                ...q,
                _index: index,
                _uniqueId: `${year}_${q.id}`,
                _year: year
            }));

            this.state.filteredQuestions = [...this.state.questions];
            this.state.currentYear = year;
            this.state.currentQuestionIndex = 0;
            this.state.selectedOption = null;

            this.loadProgress();
            this.updateYearTabs(year);
            this.updateBookmarkBadge();
            this.render();

            console.log(`✅ Loaded ${this.state.questions.length} questions for ${year}`);

        } catch (error) {
            console.error(`❌ Failed to load year ${year}:`, error);
            this.state.error = error.message;

            if (container) {
                container.innerHTML = PYQRender.renderError(error.message);
            }
        }

        this.state.isLoading = false;
    }

    // ============ PROGRESS MANAGEMENT ============

    loadProgress() {
        const saved = PYQStorage.loadProgress(this.config.code, this.state.currentYear);

        if (saved) {
            this.state.userAnswers = saved.userAnswers || {};
            this.state.bookmarks = saved.bookmarks || [];
            this.state.mode = saved.mode || 'practice';

            const savedIndex = saved.currentQuestionIndex || 0;
            this.state.currentQuestionIndex = Math.min(
                savedIndex,
                Math.max(0, this.state.filteredQuestions.length - 1)
            );

            console.log('📥 Progress loaded');
        } else {
            this.state.userAnswers = {};
            this.state.bookmarks = [];
            this.state.currentQuestionIndex = 0;
            this.state.mode = 'practice';
        }
    }

    saveProgress() {
        PYQStorage.saveProgress(this.config.code, this.state.currentYear, {
            userAnswers: this.state.userAnswers,
            bookmarks: this.state.bookmarks,
            currentQuestionIndex: this.state.currentQuestionIndex,
            mode: this.state.mode
        });
    }

    resetProgress() {
        if (!confirm('⚠️ Reset all progress for this year? This cannot be undone.')) {
            return;
        }

        this.state.userAnswers = {};
        this.state.bookmarks = [];
        this.state.currentQuestionIndex = 0;
        this.state.selectedOption = null;

        PYQStorage.resetProgress(this.config.code, this.state.currentYear);

        this.updateBookmarkBadge();
        this.render();
        PYQRender.showToast('Progress reset successfully', 'success');
    }

    // ============ QUESTION ACCESS ============

    getCurrentQuestion() {
        if (this.state.filteredQuestions.length === 0) return null;

        const index = Math.min(
            this.state.currentQuestionIndex,
            this.state.filteredQuestions.length - 1
        );

        return this.state.filteredQuestions[index] || null;
    }

    getUserAnswer(question) {
        if (!question) return null;
        return this.state.userAnswers[question._uniqueId] || null;
    }

    // ============ NAVIGATION ============

    goToQuestion(index) {
        if (index < 0) index = 0;
        if (index >= this.state.filteredQuestions.length) {
            index = this.state.filteredQuestions.length - 1;
        }
        if (index < 0) return;

        this.state.currentQuestionIndex = index;
        this.state.selectedOption = null;

        this.saveProgress();
        this.render();

        const container = document.getElementById('questionContainer');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    goToQuestionById(uniqueId) {
        const index = this.state.filteredQuestions.findIndex(q => q._uniqueId === uniqueId);
        if (index !== -1) {
            this.goToQuestion(index);
        }
    }

    nextQuestion() {
        if (this.state.currentQuestionIndex < this.state.filteredQuestions.length - 1) {
            this.goToQuestion(this.state.currentQuestionIndex + 1);
        } else {
            PYQRender.showToast('This is the last question', 'info');
        }
    }

    prevQuestion() {
        if (this.state.currentQuestionIndex > 0) {
            this.goToQuestion(this.state.currentQuestionIndex - 1);
        } else {
            PYQRender.showToast('This is the first question', 'info');
        }
    }

    // ============ ANSWER HANDLING ============

    selectOption(value) {
        this.state.selectedOption = value;

        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
        }
    }

    submitAnswer() {
        const question = this.getCurrentQuestion();
        if (!question || this.state.mode === 'review') return;

        const answer = this.state.selectedOption;
        if (answer === null || answer === undefined || answer === '') {
            PYQRender.showToast('Please select an answer first', 'error');
            return;
        }

        let isCorrect = false;

        switch (question.type) {
            case 'mcq':
                isCorrect = PYQHelpers.checkMCQ(answer, question.correct);
                break;
            case 'truefalse':
                isCorrect = PYQHelpers.checkTrueFalse(answer, question.correct);
                break;
            case 'gapfill':
                isCorrect = PYQHelpers.checkGapFill(
                    answer,
                    question.acceptableAnswers || question.answer
                );
                break;
        }

        this.state.userAnswers[question._uniqueId] = {
            answer,
            isCorrect,
            questionId: question.id,
            timestamp: PYQHelpers.getTimestamp()
        };

        this.state.selectedOption = null;
        this.saveProgress();
        this.render();

        if (isCorrect) {
            PYQRender.showToast('✅ Correct! Well done!', 'success');
        } else {
            PYQRender.showToast('❌ Incorrect. Check the explanation.', 'error');
        }

        this.renderMath();
    }

    showAnswer(question) {
        if (!question) return;

        this.state.userAnswers[question._uniqueId] = {
            viewed: true,
            questionId: question.id,
            timestamp: PYQHelpers.getTimestamp()
        };

        this.saveProgress();
        this.render();
        this.renderMath();
    }

    // ============ BOOKMARKS ============

    toggleBookmark() {
        const question = this.getCurrentQuestion();
        if (!question) return;

        const id = question._uniqueId;
        const index = this.state.bookmarks.indexOf(id);

        if (index > -1) {
            this.state.bookmarks.splice(index, 1);
            PYQRender.showToast('Bookmark removed', 'info');
        } else {
            this.state.bookmarks.push(id);
            PYQRender.showToast('Question bookmarked', 'success');
        }

        this.saveProgress();
        this.updateBookmarkBadge();
        this.render();
    }

    removeBookmark(bookmarkId) {
        const index = this.state.bookmarks.indexOf(bookmarkId);
        if (index > -1) {
            this.state.bookmarks.splice(index, 1);
            this.saveProgress();
            this.updateBookmarkBadge();

            const modal = document.getElementById('bookmarksModal');
            if (modal && modal.classList.contains('active')) {
                this.openBookmarksModal();
            }

            PYQRender.showToast('Bookmark removed', 'info');
        }
    }

    updateBookmarkBadge() {
        const badge = document.getElementById('bookmarkCount');
        if (badge) {
            badge.textContent = this.state.bookmarks.length;
        }
    }

    // ============ YEAR & MODE SWITCHING ============

    async switchYear(year) {
        if (year === this.state.currentYear) return;

        this.saveProgress();
        await this.loadYear(year);
        PYQRender.showToast(`Switched to ${year}`, 'success');
    }

    updateYearTabs(activeYear) {
        document.querySelectorAll('.year-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.year === String(activeYear));
        });
    }

    switchMode(mode) {
        if (mode === this.state.mode) return;

        this.state.mode = mode;
        this.state.selectedOption = null;

        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        this.saveProgress();
        this.render();

        const modeText = mode === 'practice' ? 'Practice Mode' : 'Review Mode';
        PYQRender.showToast(`${modeText} activated`, 'info');
    }

    // ============ FILTERS & SEARCH ============

    applyFilters(filters) {
        this.state.filters = filters;

        this.state.filteredQuestions = this.state.questions.filter(q => {
            if (filters.types.length > 0 && !filters.types.includes(q.type)) {
                return false;
            }

            if (filters.status.length > 0) {
                const answer = this.state.userAnswers[q._uniqueId];
                const isAttempted = answer?.isCorrect !== undefined || answer?.viewed;
                const isCorrect = answer?.isCorrect === true;
                const isWrong = answer?.isCorrect === false;
                const isBookmarked = this.state.bookmarks.includes(q._uniqueId);

                const statusMatch = filters.status.some(status => {
                    switch (status) {
                        case 'attempted': return isAttempted;
                        case 'unattempted': return !isAttempted;
                        case 'correct': return isCorrect;
                        case 'wrong': return isWrong;
                        case 'bookmarked': return isBookmarked;
                        default: return false;
                    }
                });

                if (!statusMatch) return false;
            }

            return true;
        });

        this.state.currentQuestionIndex = 0;
        this.state.selectedOption = null;
        this.render();

        const count = this.state.filteredQuestions.length;
        PYQRender.showToast(`Showing ${count} question${count !== 1 ? 's' : ''}`, 'info');
    }

    resetFilters() {
        this.state.filters = { types: [], status: [] };
        this.state.filteredQuestions = [...this.state.questions];
        this.state.currentQuestionIndex = 0;
        this.state.selectedOption = null;

        document.querySelectorAll('.filter-type, .filter-status').forEach(cb => {
            cb.checked = cb.classList.contains('filter-type');
        });

        this.render();
        PYQRender.showToast('Filters reset', 'info');
    }

    handleSearch(searchTerm) {
        const resultsEl = document.getElementById('searchResults');
        if (!resultsEl) return;

        if (!searchTerm || searchTerm.trim() === '') {
            resultsEl.innerHTML = '';
            return;
        }

        const term = searchTerm.toLowerCase().trim();
        const results = [];

        this.state.questions.forEach(q => {
            let score = 0;

            const questionText = PYQHelpers.stripHTML(q.question).toLowerCase();
            if (questionText.includes(term)) score += 10;

            if (q.options) {
                q.options.forEach(opt => {
                    if (PYQHelpers.stripHTML(String(opt)).toLowerCase().includes(term)) score += 5;
                });
            }

            if (q.answer) {
                if (PYQHelpers.stripHTML(String(q.answer)).toLowerCase().includes(term)) score += 8;
            }

            if (q.explanation) {
                if (PYQHelpers.stripHTML(q.explanation).toLowerCase().includes(term)) score += 6;
            }

            if (score > 0) {
                results.push({ question: q, score });
            }
        });

        results.sort((a, b) => b.score - a.score);
        resultsEl.innerHTML = PYQRender.renderSearchResults(results, searchTerm);
    }

    // ============ MODALS ============

    openStatsModal() {
        const stats = this.calculateStats();

        const content = document.getElementById('statsContent');
        if (content) {
            content.innerHTML = PYQRender.renderStats(stats);
        }

        const modal = document.getElementById('statsModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('active');
        }
    }

    openBookmarksModal() {
        const content = document.getElementById('bookmarksContent');
        if (content) {
            content.innerHTML = PYQRender.renderBookmarks(
                this.state.questions,
                this.state.bookmarks,
                this.state.userAnswers
            );
        }

        const modal = document.getElementById('bookmarksModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.classList.add('hidden'), 300);
        }
    }

    // ============ STATISTICS ============

    calculateStats() {
        const scoredTypes = ['mcq', 'truefalse', 'gapfill'];
        const scoredQuestions = this.state.questions.filter(q => scoredTypes.includes(q.type));

        let totalMarks = 0;
        let earnedMarks = 0;
        let correct = 0;
        let wrong = 0;
        let attempted = 0;

        scoredQuestions.forEach(q => {
            totalMarks += q.marks || 1;
            const answer = this.state.userAnswers[q._uniqueId];

            if (answer?.isCorrect !== undefined) {
                attempted++;
                if (answer.isCorrect) {
                    correct++;
                    earnedMarks += q.marks || 1;
                } else {
                    wrong++;
                }
            }
        });

        const typeStats = {};
        const types = ['mcq', 'truefalse', 'gapfill', 'saq', 'laq'];

        types.forEach(type => {
            const typeQuestions = this.state.questions.filter(q => q.type === type);
            let typeCorrect = 0;

            typeQuestions.forEach(q => {
                const answer = this.state.userAnswers[q._uniqueId];
                if (answer?.isCorrect === true) typeCorrect++;
            });

            if (typeQuestions.length > 0) {
                typeStats[type] = {
                    total: typeQuestions.length,
                    correct: typeCorrect
                };
            }
        });

        const percentage = totalMarks > 0 ? ((earnedMarks / totalMarks) * 100).toFixed(1) : 0;
        const overallAccuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : 0;

        return {
            score: {
                totalMarks,
                earnedMarks,
                correct,
                wrong,
                attempted,
                total: scoredQuestions.length,
                percentage
            },
            typeStats,
            overallAccuracy
        };
    }

    // ============ UI HELPERS ============

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        const menuBtn = document.getElementById('menuBtn');

        const isActive = sidebar?.classList.contains('active');

        if (isActive) {
            this.closeSidebar();
        } else {
            sidebar?.classList.add('active');
            overlay?.classList.add('active');
            menuBtn?.classList.add('active');
        }
    }

    closeSidebar() {
        document.getElementById('sidebar')?.classList.remove('active');
        document.getElementById('overlay')?.classList.remove('active');
        document.getElementById('menuBtn')?.classList.remove('active');
    }

    toggleSearch() {
        const panel = document.getElementById('searchPanel');
        const input = document.getElementById('searchInput');

        if (panel?.classList.contains('hidden')) {
            panel.classList.remove('hidden');
            setTimeout(() => input?.focus(), 100);
        } else {
            this.closeSearch();
        }
    }

    closeSearch() {
        const panel = document.getElementById('searchPanel');
        const input = document.getElementById('searchInput');
        const results = document.getElementById('searchResults');

        panel?.classList.add('hidden');
        if (input) input.value = '';
        if (results) results.innerHTML = '';
    }

    toggleFilterPanel() {
        const panel = document.getElementById('filterPanel');
        panel?.classList.toggle('hidden');
    }

    updateThemeUI(theme) {
        const sunIcon = document.querySelector('.sun-icon');
        const moonIcon = document.querySelector('.moon-icon');

        if (theme === 'dark') {
            sunIcon?.classList.add('hidden');
            moonIcon?.classList.remove('hidden');
        } else {
            sunIcon?.classList.remove('hidden');
            moonIcon?.classList.add('hidden');
        }
    }

    toggleTheme() {
        const newTheme = PYQStorage.toggleTheme();
        this.updateThemeUI(newTheme);
        PYQRender.showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode`, 'info');
    }

    updateGoToTopButton() {
        const btn = document.getElementById('goToTop');
        if (btn) {
            btn.classList.toggle('hidden', window.scrollY <= 300);
        }
    }

    renderMath() {
        if (window.MathJax?.typesetPromise) {
            setTimeout(() => {
                window.MathJax.typesetPromise().catch(err => {
                    console.warn('MathJax render warning:', err);
                });
            }, 100);
        }
    }

    // ============ PRINT ============

    printQuestions() {
        const questions = this.state.filteredQuestions;

        if (questions.length === 0) {
            PYQRender.showToast('No questions to print', 'error');
            return;
        }

        // Create overlay
        let overlay = document.getElementById('printOverlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'printOverlay';
            overlay.className = 'print-overlay print-text-normal';
            document.body.appendChild(overlay);
        }

        // Populate
        overlay.innerHTML = PYQRender.renderPrintOverlay(
            questions,
            this.config,
            this.state.currentYear,
            this.state.filters
        );

        // Show overlay
        overlay.classList.add('active');
        document.body.classList.add('print-mode');
        overlay.scrollTop = 0;

        // Render MathJax in overlay
        if (window.MathJax?.typesetPromise) {
            window.MathJax.typesetPromise([overlay]).catch(err => {
                console.warn('MathJax print render warning:', err);
            });
        }

        PYQRender.showToast(
            `${questions.length} question${questions.length !== 1 ? 's' : ''} ready to print`,
            'info'
        );
    }

    closePrintView() {
        const overlay = document.getElementById('printOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.classList.remove('print-mode');

            // Destroy after animation
            setTimeout(() => {
                overlay.remove();
            }, 100);
        }
    }

    setPrintSize(size) {
        const overlay = document.getElementById('printOverlay');
        if (!overlay) return;

        // Remove all size classes
        overlay.classList.remove('print-text-small', 'print-text-normal', 'print-text-large');

        // Add selected size
        overlay.classList.add(`print-text-${size}`);

        // Update button states
        overlay.querySelectorAll('.print-size-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.printSize === size);
        });
    }

    // ============ MAIN RENDER ============

    render() {
        const question = this.getCurrentQuestion();

        if (!question || this.state.filteredQuestions.length === 0) {
            const container = document.getElementById('questionContainer');
            if (container) {
                container.innerHTML = PYQRender.renderEmpty();
            }
            this.renderSidebarAndNav();
            return;
        }

        const container = document.getElementById('questionContainer');
        if (container) {
            container.innerHTML = PYQRender.renderQuestion(question, this.state);
        }

        this.renderSidebarAndNav();
        this.updateProgressDisplay();
        this.updateNavigationButtons();
        this.renderMath();
    }

    renderSidebarAndNav() {
        const listEl = document.getElementById('questionList');
        if (listEl) {
            listEl.innerHTML = PYQRender.renderQuestionList(
                this.state.filteredQuestions,
                this.state.currentQuestionIndex,
                this.state.userAnswers,
                this.state.bookmarks
            );
        }

        const navEl = document.getElementById('questionNavigator');
        if (navEl) {
            navEl.innerHTML = PYQRender.renderNavigator(
                this.state.filteredQuestions,
                this.state.currentQuestionIndex,
                this.state.userAnswers,
                this.state.bookmarks
            );
        }
    }

    updateProgressDisplay() {
        const stats = this.calculateStats();

        const attemptedEl = document.getElementById('attemptedCount');
        if (attemptedEl) {
            attemptedEl.textContent = `${stats.score.attempted}/${stats.score.total}`;
        }

        const scoreEl = document.getElementById('scoreCount');
        if (scoreEl) {
            scoreEl.textContent = `${stats.score.earnedMarks}/${stats.score.totalMarks}`;
        }

        const progressBar = document.getElementById('overallProgress');
        if (progressBar) {
            const pct = stats.score.total > 0
                ? (stats.score.attempted / stats.score.total) * 100
                : 0;
            progressBar.style.width = `${pct}%`;
        }

        const posEl = document.getElementById('questionPosition');
        if (posEl) {
            posEl.textContent = `Question ${this.state.currentQuestionIndex + 1} of ${this.state.filteredQuestions.length}`;
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (prevBtn) {
            prevBtn.disabled = this.state.currentQuestionIndex === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = this.state.currentQuestionIndex >= this.state.filteredQuestions.length - 1;
        }
    }

    // ============ EVENT LISTENERS ============

    setupEventListeners() {
        document.addEventListener('click', (e) => this.handleGlobalClick(e));

        document.getElementById('menuBtn')?.addEventListener('click', () => this.toggleSidebar());
        document.getElementById('closeSidebar')?.addEventListener('click', () => this.closeSidebar());
        document.getElementById('overlay')?.addEventListener('click', () => this.closeSidebar());

        document.getElementById('themeBtn')?.addEventListener('click', () => this.toggleTheme());

        document.getElementById('searchBtn')?.addEventListener('click', () => this.toggleSearch());
        document.getElementById('closeSearch')?.addEventListener('click', () => this.closeSearch());

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', PYQHelpers.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

        document.querySelectorAll('.year-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchYear(tab.dataset.year));
        });

        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchMode(btn.dataset.mode));
        });

        document.getElementById('prevBtn')?.addEventListener('click', () => this.prevQuestion());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextQuestion());

        // Print button
        document.getElementById('printBtn')?.addEventListener('click', () => this.printQuestions());

        // Filter
        document.getElementById('filterBtn')?.addEventListener('click', () => this.toggleFilterPanel());

        document.getElementById('applyFilters')?.addEventListener('click', () => {
            const types = Array.from(document.querySelectorAll('.filter-type:checked')).map(cb => cb.value);
            const status = Array.from(document.querySelectorAll('.filter-status:checked')).map(cb => cb.value);
            this.applyFilters({ types, status });
            this.toggleFilterPanel();
        });

        document.getElementById('resetFilters')?.addEventListener('click', () => {
            this.resetFilters();
            this.toggleFilterPanel();
        });

        // Sidebar actions
        document.getElementById('bookmarksBtn')?.addEventListener('click', () => this.openBookmarksModal());
        document.getElementById('statsBtn')?.addEventListener('click', () => this.openStatsModal());
        document.getElementById('resetBtn')?.addEventListener('click', () => this.resetProgress());

        // Modal close
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(btn.dataset.modal));
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal(modal.id);
            });
        });

        // Go to top
        document.getElementById('goToTop')?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Scroll
        window.addEventListener('scroll', PYQHelpers.throttle(() => {
            this.updateGoToTopButton();
        }, 200));

        // Gap fill input
        document.addEventListener('input', (e) => {
            if (e.target.id === 'gapfillInput') {
                this.state.selectedOption = e.target.value;
                const submitBtn = document.getElementById('submitBtn');
                if (submitBtn) {
                    submitBtn.disabled = !e.target.value.trim();
                }
            }
        });
    }

    handleGlobalClick(e) {
        const target = e.target;

        // === PRINT OVERLAY CLICKS ===

        // Print back button
        if (target.closest('#printBackBtn')) {
            this.closePrintView();
            return;
        }

        // Print now button
        if (target.closest('#printNowBtn')) {
            window.print();
            return;
        }

        // Print size button
        const sizeBtn = target.closest('.print-size-btn');
        if (sizeBtn && sizeBtn.dataset.printSize) {
            this.setPrintSize(sizeBtn.dataset.printSize);
            return;
        }

        // === MAIN APP CLICKS ===

        // MCQ option
        const mcqOption = target.closest('.mcq-option');
        if (mcqOption && !mcqOption.classList.contains('disabled')) {
            const index = parseInt(mcqOption.dataset.optionIndex);
            this.selectOption(index);

            document.querySelectorAll('.mcq-option').forEach(opt => opt.classList.remove('selected'));
            mcqOption.classList.add('selected');
            return;
        }

        // True/False option
        const tfOption = target.closest('.tf-option');
        if (tfOption && !tfOption.classList.contains('disabled')) {
            const value = tfOption.dataset.tfValue === 'true';
            this.selectOption(value);

            document.querySelectorAll('.tf-option').forEach(opt => opt.classList.remove('selected'));
            tfOption.classList.add('selected');
            return;
        }

        // Submit button
        if (target.closest('#submitBtn')) {
            this.submitAnswer();
            return;
        }

        // Show answer button
        if (target.closest('#showAnswerBtn')) {
            this.showAnswer(this.getCurrentQuestion());
            return;
        }

        // Bookmark button
        if (target.closest('#bookmarkBtn')) {
            this.toggleBookmark();
            return;
        }

        // Question list item
        const questionItem = target.closest('.question-item');
        if (questionItem) {
            const index = parseInt(questionItem.dataset.questionIndex);
            if (!isNaN(index)) {
                this.goToQuestion(index);
                this.closeSidebar();
            }
            return;
        }

        // Navigator dot
        const navDot = target.closest('.nav-dot');
        if (navDot) {
            const index = parseInt(navDot.dataset.questionIndex);
            if (!isNaN(index)) {
                this.goToQuestion(index);
            }
            return;
        }

        // Search result
        const searchResult = target.closest('.search-result-item');
        if (searchResult) {
            const id = searchResult.dataset.questionId;
            if (id) {
                this.goToQuestionById(id);
                this.closeSearch();
            }
            return;
        }

        // Bookmark item
        const bookmarkItem = target.closest('.bookmark-item');
        if (bookmarkItem) {
            if (target.closest('.remove-bookmark-btn')) {
                const id = target.closest('.remove-bookmark-btn').dataset.bookmarkId;
                if (id) this.removeBookmark(id);
                return;
            }

            const id = bookmarkItem.dataset.questionId;
            if (id) {
                this.goToQuestionById(id);
                this.closeModal('bookmarksModal');
            }
            return;
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                if (e.key === 'Enter' && e.target.id === 'gapfillInput') {
                    e.preventDefault();
                    this.submitAnswer();
                }
                return;
            }

            // Check if print overlay is open
            const isPrintOpen = document.body.classList.contains('print-mode');

            if (isPrintOpen) {
                // Only allow Escape in print mode
                if (e.key === 'Escape') {
                    this.closePrintView();
                }
                return;
            }

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevQuestion();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextQuestion();
                    break;
                case '1': case '2': case '3': case '4':
                    const option = document.querySelector(`.mcq-option[data-option-index="${parseInt(e.key) - 1}"]`);
                    if (option && !option.classList.contains('disabled')) option.click();
                    break;
                case 't': case 'T':
                    document.querySelector('[data-tf-value="true"]')?.click();
                    break;
                case 'f': case 'F':
                    document.querySelector('[data-tf-value="false"]')?.click();
                    break;
                case 'b': case 'B':
                    this.toggleBookmark();
                    break;
                case 's': case 'S':
                    e.preventDefault();
                    this.toggleSearch();
                    break;
                case 'm': case 'M':
                    this.toggleSidebar();
                    break;
                case 'd': case 'D':
                    this.toggleTheme();
                    break;
                case 'p': case 'P':
                    this.printQuestions();
                    break;
                case 'Enter':
                    const submitBtn = document.getElementById('submitBtn');
                    if (submitBtn && !submitBtn.disabled) submitBtn.click();
                    break;
                case 'Escape':
                    this.closeSidebar();
                    this.closeSearch();
                    this.closeModal('statsModal');
                    this.closeModal('bookmarksModal');
                    document.getElementById('filterPanel')?.classList.add('hidden');
                    break;
            }
        });
    }

    setupTouchGestures() {
        const container = document.getElementById('questionContainer');
        if (!container) return;

        let startX = 0;
        let startY = 0;

        container.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
            startY = e.changedTouches[0].screenY;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].screenX;
            const endY = e.changedTouches[0].screenY;

            const diffX = startX - endX;
            const diffY = Math.abs(startY - endY);

            if (Math.abs(diffX) > 50 && diffY < 100) {
                if (diffX > 0) {
                    this.nextQuestion();
                } else {
                    this.prevQuestion();
                }
            }
        }, { passive: true });
    }

    setupAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.saveProgress();
            console.log('💾 Auto-saved');
        }, 30000);

        window.addEventListener('beforeunload', () => this.saveProgress());

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.saveProgress();
            }
        });
    }

    // ============ CLEANUP ============

    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        this.saveProgress();
    }
}

// ============ AUTO INITIALIZE ============

document.addEventListener('DOMContentLoaded', () => {
    if (typeof PYQ_CONFIG === 'undefined') {
        console.error('❌ PYQ_CONFIG not found!');
        const root = document.getElementById('pyq-root');
        if (root) {
            root.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: #ef4444; font-family: sans-serif;">
                    <h2>⚠️ Configuration Error</h2>
                    <p>PYQ_CONFIG is not defined. Please check your HTML file.</p>
                </div>
            `;
        }
        return;
    }

    console.log(`🎓 Starting ${PYQ_CONFIG.subject} PYQ System`);
    window.app = new PYQApp(PYQ_CONFIG);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PYQApp;
}