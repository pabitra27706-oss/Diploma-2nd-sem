/* ============================================
   HELPER.JS — Utilities, Filters, Storage, Timer
   WB Diploma Sem-II | Practice Questions App
   ============================================ */

'use strict';

// ============================================
// 1. CONSTANTS
// ============================================

const STORAGE_KEYS = {
  THEME: 'pq_theme',
  PROGRESS: 'pq_progress',
  FILTERS: 'pq_filters',
  SETTINGS: 'pq_settings',
  NOTES: 'pq_notes',
  VIEW_MODE: 'pq_viewMode',
  SORT_BY: 'pq_sortBy',
  PER_PAGE: 'pq_perPage',
  PRACTICE_HISTORY: 'pq_practiceHistory',
  STATS: 'pq_stats',
  BOOKMARKS: 'pq_bookmarks',
  CONFIDENCE: 'pq_confidence',
  USER_ANSWERS: 'pq_userAnswers',
  LAST_ACTIVE: 'pq_lastActive',
  STREAK: 'pq_streak'
};

const SUBJECTS = [
  { id: 'maths', label: 'Mathematics', icon: '🔵', color: '#3b82f6' },
  { id: 'physics', label: 'Physics', icon: '🟢', color: '#10b981' },
  { id: 'mechanics', label: 'Mechanics', icon: '🔴', color: '#ef4444' },
  { id: 'feee', label: 'FEEE', icon: '🟡', color: '#f59e0b' },
  { id: 'it', label: 'IT Systems', icon: '🟣', color: '#a855f7' },
  { id: 'evs', label: 'EVS', icon: '🟤', color: '#78716c' }
];

const QUESTION_TYPES = [
  { id: 'mcq', label: 'MCQ', icon: '🅰️' },
  { id: 'true-false', label: 'True/False', icon: '✅' },
  { id: 'fill-blank', label: 'Fill Blank', icon: '✏️' },
  { id: 'numerical', label: 'Numerical', icon: '🔢' },
  { id: 'short-answer', label: 'Short Ans', icon: '📝' },
  { id: 'long-answer', label: 'Long Ans', icon: '📄' },
  { id: 'match', label: 'Match', icon: '🔗' }
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', icon: '🟢', color: '#10b981' },
  { id: 'medium', label: 'Medium', icon: '🟡', color: '#f59e0b' },
  { id: 'hard', label: 'Hard', icon: '🔴', color: '#ef4444' }
];

const STATUSES = [
  { id: 'not-attempted', label: 'Not Attempted', icon: '⬜' },
  { id: 'attempted', label: 'Attempted', icon: '✅' },
  { id: 'skipped', label: 'Skipped', icon: '⏭️' }
];

const CONFIDENCE_LEVELS = [
  { id: 'confident', label: 'Confident', emoji: '😊', color: '#10b981' },
  { id: 'unsure', label: 'Unsure', emoji: '😐', color: '#f59e0b' },
  { id: 'noidea', label: 'No Idea', emoji: '😰', color: '#ef4444' }
];

const EXAM_SOURCES = [
  { id: 'objective', label: 'Objective' },
  { id: 'subjective', label: 'Subjective' },
  { id: 'end-sem', label: 'End Sem' },
  { id: 'mid-sem', label: 'Mid Sem' },
  { id: 'internal', label: 'Internal' }
];

const TOTAL_DAYS = 15;

const DEFAULT_FILTERS = {
  days: [],
  subjects: [],
  types: [],
  difficulty: [],
  units: [],
  topics: [],
  marksMin: 1,
  marksMax: 10,
  statuses: [],
  bookmarkedOnly: false,
  confidence: [],
  sources: [],
  search: ''
};

const DEFAULT_SETTINGS = {
  theme: 'dark',
  viewMode: 'card',
  sortBy: 'default',
  perPage: 20,
  showHints: true,
  showTags: true,
  autoSave: true,
  soundEffects: false,
  animations: true
};


// ============================================
// 2. STORAGE FUNCTIONS
// ============================================

const Storage = {

  /**
   * Save data to localStorage
   * @param {string} key — Storage key
   * @param {*} data — Data to store (auto-serialized)
   */
  save(key, data) {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
      return true;
    } catch (e) {
      console.warn(`[Storage] Failed to save "${key}":`, e);
      return false;
    }
  },

  /**
   * Load data from localStorage
   * @param {string} key — Storage key
   * @param {*} fallback — Default value if key not found
   * @returns {*} Parsed data or fallback
   */
  load(key, fallback = null) {
    try {
      const data = localStorage.getItem(key);
      if (data === null) return fallback;
      return JSON.parse(data);
    } catch (e) {
      console.warn(`[Storage] Failed to load "${key}":`, e);
      return fallback;
    }
  },

  /**
   * Remove a key from localStorage
   * @param {string} key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[Storage] Failed to remove "${key}":`, e);
    }
  },

  /**
   * Clear all app-related storage keys
   */
  clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.remove(key);
    });
  },

  /**
   * Get storage usage in bytes
   * @returns {number}
   */
  getSize() {
    let total = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) total += item.length * 2; // UTF-16
    });
    return total;
  },

  /**
   * Format bytes to readable string
   * @param {number} bytes
   * @returns {string}
   */
  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
};


// ============================================
// 3. PROGRESS MANAGER
// ============================================

const Progress = {

  /**
   * Get all progress data
   * @returns {Object} progress map { questionId: { status, bookmarked, confidence, userAnswer, timestamp } }
   */
  getAll() {
    return Storage.load(STORAGE_KEYS.PROGRESS, {});
  },

  /**
   * Get progress for a specific question
   * @param {string} qId — Question ID
   * @returns {Object|null}
   */
  get(qId) {
    const all = this.getAll();
    return all[qId] || null;
  },

  /**
   * Update progress for a question
   * @param {string} qId
   * @param {Object} data — Partial data to merge
   */
  update(qId, data) {
    const all = this.getAll();
    all[qId] = {
      ...(all[qId] || {}),
      ...data,
      timestamp: Date.now()
    };
    Storage.save(STORAGE_KEYS.PROGRESS, all);
  },

  /**
   * Set question status
   * @param {string} qId
   * @param {string} status — 'attempted' | 'skipped' | 'not-attempted'
   */
  setStatus(qId, status) {
    this.update(qId, { status });
  },

  /**
   * Get question status
   * @param {string} qId
   * @returns {string}
   */
  getStatus(qId) {
    const p = this.get(qId);
    return p ? p.status || 'not-attempted' : 'not-attempted';
  },

  /**
   * Toggle bookmark for a question
   * @param {string} qId
   * @returns {boolean} new bookmark state
   */
  toggleBookmark(qId) {
    const p = this.get(qId);
    const newState = !(p && p.bookmarked);
    this.update(qId, { bookmarked: newState });
    return newState;
  },

  /**
   * Check if question is bookmarked
   * @param {string} qId
   * @returns {boolean}
   */
  isBookmarked(qId) {
    const p = this.get(qId);
    return p ? !!p.bookmarked : false;
  },

  /**
   * Set confidence level for a question
   * @param {string} qId
   * @param {string} level — 'confident' | 'unsure' | 'noidea'
   */
  setConfidence(qId, level) {
    this.update(qId, { confidence: level });
  },

  /**
   * Get confidence level
   * @param {string} qId
   * @returns {string|null}
   */
  getConfidence(qId) {
    const p = this.get(qId);
    return p ? p.confidence || null : null;
  },

  /**
   * Save user's answer for a question
   * @param {string} qId
   * @param {*} answer — User's answer (string, index, object)
   */
  saveAnswer(qId, answer) {
    this.update(qId, { userAnswer: answer, status: 'attempted' });
  },

  /**
   * Get user's saved answer
   * @param {string} qId
   * @returns {*}
   */
  getAnswer(qId) {
    const p = this.get(qId);
    return p ? p.userAnswer || null : null;
  },

  /**
   * Get count of questions by status
   * @returns {Object} { attempted, skipped, notAttempted, bookmarked, total }
   */
  getCounts() {
    const all = this.getAll();
    const entries = Object.values(all);
    return {
      attempted: entries.filter(e => e.status === 'attempted').length,
      skipped: entries.filter(e => e.status === 'skipped').length,
      bookmarked: entries.filter(e => e.bookmarked).length,
      total: entries.length
    };
  },

  /**
   * Get counts grouped by subject
   * @param {Array} allQuestions — All questions array
   * @returns {Object} { maths: { attempted, total }, ... }
   */
  getCountsBySubject(allQuestions) {
    const result = {};
    SUBJECTS.forEach(s => {
      const subjQuestions = allQuestions.filter(q => q.subject === s.id);
      const attempted = subjQuestions.filter(q => {
        const p = this.get(q.id);
        return p && p.status === 'attempted';
      }).length;
      result[s.id] = { attempted, total: subjQuestions.length };
    });
    return result;
  },

  /**
   * Get counts grouped by difficulty
   * @param {Array} allQuestions
   * @returns {Object}
   */
  getCountsByDifficulty(allQuestions) {
    const result = {};
    DIFFICULTIES.forEach(d => {
      const dQuestions = allQuestions.filter(q => q.difficulty === d.id);
      const attempted = dQuestions.filter(q => {
        const p = this.get(q.id);
        return p && p.status === 'attempted';
      }).length;
      result[d.id] = { attempted, total: dQuestions.length };
    });
    return result;
  },

  /**
   * Get counts grouped by day
   * @param {Array} allQuestions
   * @returns {Object}
   */
  getCountsByDay(allQuestions) {
    const result = {};
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      const dayQuestions = allQuestions.filter(q => q.day === d);
      const attempted = dayQuestions.filter(q => {
        const p = this.get(q.id);
        return p && p.status === 'attempted';
      }).length;
      result[d] = { attempted, total: dayQuestions.length };
    }
    return result;
  },

  /**
   * Get counts grouped by confidence
   * @param {Array} allQuestions
   * @returns {Object}
   */
  getCountsByConfidence(allQuestions) {
    const result = { confident: 0, unsure: 0, noidea: 0, unset: 0 };
    allQuestions.forEach(q => {
      const conf = this.getConfidence(q.id);
      if (conf && result.hasOwnProperty(conf)) {
        result[conf]++;
      } else {
        result.unset++;
      }
    });
    return result;
  },

  /**
   * Get counts grouped by question type
   * @param {Array} allQuestions
   * @returns {Object}
   */
  getCountsByType(allQuestions) {
    const result = {};
    QUESTION_TYPES.forEach(t => {
      const tQuestions = allQuestions.filter(q => q.type === t.id);
      const attempted = tQuestions.filter(q => {
        const p = this.get(q.id);
        return p && p.status === 'attempted';
      }).length;
      result[t.id] = { attempted, total: tQuestions.length };
    });
    return result;
  },

  /**
   * Reset all progress
   */
  reset() {
    Storage.save(STORAGE_KEYS.PROGRESS, {});
  },

  /**
   * Export progress as JSON string
   * @returns {string}
   */
  export() {
    const data = {
      progress: this.getAll(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(data, null, 2);
  },

  /**
   * Import progress from JSON string
   * @param {string} jsonString
   * @returns {boolean} success
   */
  import(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data && data.progress) {
        Storage.save(STORAGE_KEYS.PROGRESS, data.progress);
        return true;
      }
      return false;
    } catch (e) {
      console.warn('[Progress] Import failed:', e);
      return false;
    }
  }
};


// ============================================
// 4. STREAK MANAGER
// ============================================

const Streak = {

  /**
   * Get current streak data
   * @returns {Object} { count, lastDate }
   */
  get() {
    return Storage.load(STORAGE_KEYS.STREAK, { count: 0, lastDate: null });
  },

  /**
   * Update streak — call when user completes activity today
   * @returns {number} new streak count
   */
  update() {
    const data = this.get();
    const today = this._getDateString();
    const yesterday = this._getDateString(-1);

    if (data.lastDate === today) {
      // Already updated today
      return data.count;
    }

    if (data.lastDate === yesterday) {
      // Consecutive day — increment
      data.count++;
    } else if (data.lastDate !== today) {
      // Streak broken — reset to 1
      data.count = 1;
    }

    data.lastDate = today;
    Storage.save(STORAGE_KEYS.STREAK, data);
    return data.count;
  },

  /**
   * Get date string for today or offset
   * @param {number} offset — Days offset (0 = today, -1 = yesterday)
   * @returns {string} YYYY-MM-DD
   */
  _getDateString(offset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  }
};


// ============================================
// 5. PRACTICE HISTORY
// ============================================

const PracticeHistory = {

  /**
   * Get all practice sessions
   * @returns {Array}
   */
  getAll() {
    return Storage.load(STORAGE_KEYS.PRACTICE_HISTORY, []);
  },

  /**
   * Save a practice session
   * @param {Object} session — { count, attempted, skipped, time, subjects, difficulty }
   */
  save(session) {
    const all = this.getAll();
    all.push({
      ...session,
      date: new Date().toISOString(),
      id: Utils.generateId()
    });
    Storage.save(STORAGE_KEYS.PRACTICE_HISTORY, all);
  },

  /**
   * Get today's sessions
   * @returns {Array}
   */
  getToday() {
    const today = new Date().toISOString().split('T')[0];
    return this.getAll().filter(s => s.date.startsWith(today));
  },

  /**
   * Get total questions practiced today
   * @returns {number}
   */
  getTodayCount() {
    return this.getToday().reduce((sum, s) => sum + (s.attempted || 0), 0);
  }
};


// ============================================
// 6. FILTER FUNCTIONS
// ============================================

const Filters = {

  /**
   * Filter questions by day numbers
   * @param {Array} questions
   * @param {Array<number>} days — e.g. [1, 2, 3]
   * @returns {Array}
   */
  byDay(questions, days) {
    if (!days || days.length === 0) return questions;
    return questions.filter(q => days.includes(q.day));
  },

  /**
   * Filter questions by subjects
   * @param {Array} questions
   * @param {Array<string>} subjects — e.g. ['maths', 'physics']
   * @returns {Array}
   */
  bySubject(questions, subjects) {
    if (!subjects || subjects.length === 0) return questions;
    return questions.filter(q => subjects.includes(q.subject));
  },

  /**
   * Filter by question type
   * @param {Array} questions
   * @param {Array<string>} types — e.g. ['mcq', 'true-false']
   * @returns {Array}
   */
  byType(questions, types) {
    if (!types || types.length === 0) return questions;
    return questions.filter(q => types.includes(q.type));
  },

  /**
   * Filter by difficulty
   * @param {Array} questions
   * @param {Array<string>} diffs — e.g. ['easy', 'medium']
   * @returns {Array}
   */
  byDifficulty(questions, diffs) {
    if (!diffs || diffs.length === 0) return questions;
    return questions.filter(q => diffs.includes(q.difficulty));
  },

  /**
   * Filter by unit
   * @param {Array} questions
   * @param {Array<string>} units — e.g. ['Unit 1', 'Unit 2']
   * @returns {Array}
   */
  byUnit(questions, units) {
    if (!units || units.length === 0) return questions;
    return questions.filter(q => units.includes(q.unit));
  },

  /**
   * Filter by topic
   * @param {Array} questions
   * @param {Array<string>} topics — e.g. ['Determinants', 'Matrices']
   * @returns {Array}
   */
  byTopic(questions, topics) {
    if (!topics || topics.length === 0) return questions;
    return questions.filter(q => topics.includes(q.topic));
  },

  /**
   * Filter by marks range
   * @param {Array} questions
   * @param {number} min
   * @param {number} max
   * @returns {Array}
   */
  byMarks(questions, min, max) {
    if (min === 1 && max === 10) return questions; // default range, no filter
    return questions.filter(q => {
      const m = q.marks || 1;
      return m >= min && m <= max;
    });
  },

  /**
   * Filter by attempt status
   * @param {Array} questions
   * @param {Array<string>} statuses — e.g. ['attempted', 'skipped']
   * @returns {Array}
   */
  byStatus(questions, statuses) {
    if (!statuses || statuses.length === 0) return questions;
    return questions.filter(q => {
      const status = Progress.getStatus(q.id);
      return statuses.includes(status);
    });
  },

  /**
   * Filter bookmarked questions only
   * @param {Array} questions
   * @param {boolean} bookmarkedOnly
   * @returns {Array}
   */
  byBookmark(questions, bookmarkedOnly) {
    if (!bookmarkedOnly) return questions;
    return questions.filter(q => Progress.isBookmarked(q.id));
  },

  /**
   * Filter by confidence level
   * @param {Array} questions
   * @param {Array<string>} levels — e.g. ['confident', 'unsure']
   * @returns {Array}
   */
  byConfidence(questions, levels) {
    if (!levels || levels.length === 0) return questions;
    return questions.filter(q => {
      const conf = Progress.getConfidence(q.id);
      if (!conf && levels.includes('unset')) return true;
      return levels.includes(conf);
    });
  },

  /**
   * Filter by exam source
   * @param {Array} questions
   * @param {Array<string>} sources — e.g. ['end-sem', 'objective']
   * @returns {Array}
   */
  bySource(questions, sources) {
    if (!sources || sources.length === 0) return questions;
    return questions.filter(q => {
      const qSource = (q.source || '').toLowerCase().replace(/\s+/g, '-');
      return sources.some(s => qSource.includes(s));
    });
  },

  /**
   * Filter by search query (searches question text, topic, subtopic, tags)
   * @param {Array} questions
   * @param {string} query
   * @returns {Array}
   */
  bySearch(questions, query) {
    if (!query || query.trim() === '') return questions;
    const q = query.toLowerCase().trim();
    return questions.filter(item => {
      const searchable = [
        item.question,
        item.topic,
        item.subtopic,
        item.unit,
        item.subject,
        ...(item.tags || []),
        ...(item.options || [])
      ].filter(Boolean).join(' ').toLowerCase();
      return searchable.includes(q);
    });
  },

  /**
   * Apply ALL filters at once (AND logic)
   * @param {Array} questions — All questions
   * @param {Object} filters — Current filter state matching DEFAULT_FILTERS shape
   * @returns {Array} Filtered questions
   */
  applyAll(questions, filters) {
    let result = [...questions];

    result = this.byDay(result, filters.days);
    result = this.bySubject(result, filters.subjects);
    result = this.byType(result, filters.types);
    result = this.byDifficulty(result, filters.difficulty);
    result = this.byUnit(result, filters.units);
    result = this.byTopic(result, filters.topics);
    result = this.byMarks(result, filters.marksMin, filters.marksMax);
    result = this.byStatus(result, filters.statuses);
    result = this.byBookmark(result, filters.bookmarkedOnly);
    result = this.byConfidence(result, filters.confidence);
    result = this.bySource(result, filters.sources);
    result = this.bySearch(result, filters.search);

    return result;
  },

  /**
   * Count active filters
   * @param {Object} filters
   * @returns {number}
   */
  countActive(filters) {
    let count = 0;
    if (filters.days.length > 0) count++;
    if (filters.subjects.length > 0) count++;
    if (filters.types.length > 0) count++;
    if (filters.difficulty.length > 0) count++;
    if (filters.units.length > 0) count++;
    if (filters.topics.length > 0) count++;
    if (filters.marksMin !== 1 || filters.marksMax !== 10) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.bookmarkedOnly) count++;
    if (filters.confidence.length > 0) count++;
    if (filters.sources.length > 0) count++;
    if (filters.search.trim() !== '') count++;
    return count;
  },

  /**
   * Get list of active filter descriptions (for tag display)
   * @param {Object} filters
   * @returns {Array<Object>} [{ type, label, value }]
   */
  getActiveTags(filters) {
    const tags = [];

    filters.days.forEach(d => tags.push({ type: 'days', label: `Day ${d}`, value: d }));
    filters.subjects.forEach(s => {
      const sub = SUBJECTS.find(x => x.id === s);
      tags.push({ type: 'subjects', label: sub ? sub.label : s, value: s });
    });
    filters.types.forEach(t => {
      const tp = QUESTION_TYPES.find(x => x.id === t);
      tags.push({ type: 'types', label: tp ? tp.label : t, value: t });
    });
    filters.difficulty.forEach(d => {
      const df = DIFFICULTIES.find(x => x.id === d);
      tags.push({ type: 'difficulty', label: df ? df.label : d, value: d });
    });
    filters.units.forEach(u => tags.push({ type: 'units', label: u, value: u }));
    filters.topics.forEach(t => tags.push({ type: 'topics', label: t, value: t }));
    if (filters.marksMin !== 1 || filters.marksMax !== 10) {
      tags.push({ type: 'marks', label: `${filters.marksMin}-${filters.marksMax} marks`, value: null });
    }
    filters.statuses.forEach(s => {
      const st = STATUSES.find(x => x.id === s);
      tags.push({ type: 'statuses', label: st ? st.label : s, value: s });
    });
    if (filters.bookmarkedOnly) {
      tags.push({ type: 'bookmarkedOnly', label: 'Bookmarked ⭐', value: true });
    }
    filters.confidence.forEach(c => {
      const cf = CONFIDENCE_LEVELS.find(x => x.id === c);
      tags.push({ type: 'confidence', label: cf ? `${cf.emoji} ${cf.label}` : c, value: c });
    });
    filters.sources.forEach(s => {
      const sr = EXAM_SOURCES.find(x => x.id === s);
      tags.push({ type: 'sources', label: sr ? sr.label : s, value: s });
    });
    if (filters.search.trim() !== '') {
      tags.push({ type: 'search', label: `"${filters.search}"`, value: filters.search });
    }

    return tags;
  }
};


// ============================================
// 7. SORT FUNCTIONS
// ============================================

const Sorter = {

  /**
   * Sort questions by specified criteria
   * @param {Array} questions
   * @param {string} sortBy — 'default' | 'day-asc' | 'day-desc' | 'difficulty-asc' | 'difficulty-desc' | 'marks-asc' | 'marks-desc' | 'type' | 'subject' | 'random'
   * @returns {Array} Sorted copy
   */
  sort(questions, sortBy) {
    const sorted = [...questions];

    switch (sortBy) {
      case 'day-asc':
        return sorted.sort((a, b) => (a.day || 0) - (b.day || 0));

      case 'day-desc':
        return sorted.sort((a, b) => (b.day || 0) - (a.day || 0));

      case 'difficulty-asc':
        return sorted.sort((a, b) => this._diffValue(a.difficulty) - this._diffValue(b.difficulty));

      case 'difficulty-desc':
        return sorted.sort((a, b) => this._diffValue(b.difficulty) - this._diffValue(a.difficulty));

      case 'marks-asc':
        return sorted.sort((a, b) => (a.marks || 1) - (b.marks || 1));

      case 'marks-desc':
        return sorted.sort((a, b) => (b.marks || 1) - (a.marks || 1));

      case 'type':
        return sorted.sort((a, b) => (a.type || '').localeCompare(b.type || ''));

      case 'subject':
        return sorted.sort((a, b) => (a.subject || '').localeCompare(b.subject || ''));

      case 'random':
        return Utils.shuffleArray(sorted);

      case 'default':
      default:
        return sorted;
    }
  },

  /**
   * Get numeric value for difficulty (for sorting)
   * @param {string} diff
   * @returns {number}
   */
  _diffValue(diff) {
    const map = { easy: 1, medium: 2, hard: 3 };
    return map[diff] || 2;
  }
};


// ============================================
// 8. UTILITY FUNCTIONS
// ============================================

const Utils = {

  /**
   * Generate a unique ID
   * @returns {string}
   */
  generateId() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
  },

  /**
   * Debounce function
   * @param {Function} fn
   * @param {number} delay — Milliseconds
   * @returns {Function}
   */
  debounce(fn, delay = 300) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * Throttle function
   * @param {Function} fn
   * @param {number} limit — Milliseconds
   * @returns {Function}
   */
  throttle(fn, limit = 100) {
    let inThrottle = false;
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Shuffle array (Fisher-Yates)
   * @param {Array} arr
   * @returns {Array} Shuffled copy
   */
  shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  /**
   * Get unique values from array of objects for a given key
   * @param {Array} arr
   * @param {string} key
   * @returns {Array}
   */
  getUniqueValues(arr, key) {
    const set = new Set();
    arr.forEach(item => {
      if (item[key] !== undefined && item[key] !== null) {
        set.add(item[key]);
      }
    });
    return Array.from(set).sort();
  },

  /**
   * Group array of objects by a key
   * @param {Array} arr
   * @param {string} key
   * @returns {Object}
   */
  groupBy(arr, key) {
    return arr.reduce((groups, item) => {
      const val = item[key] || 'unknown';
      if (!groups[val]) groups[val] = [];
      groups[val].push(item);
      return groups;
    }, {});
  },

  /**
   * Format seconds to MM:SS
   * @param {number} seconds
   * @returns {string}
   */
  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  },

  /**
   * Format seconds to HH:MM:SS
   * @param {number} seconds
   * @returns {string}
   */
  formatTimeLong(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
    }
    return `${m}m ${String(s).padStart(2, '0')}s`;
  },

  /**
   * Get relative time string
   * @param {number} timestamp — Unix timestamp
   * @returns {string}
   */
  timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  },

  /**
   * Calculate percentage
   * @param {number} part
   * @param {number} total
   * @returns {number} Rounded percentage
   */
  percentage(part, total) {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  },

  /**
   * Clamp a value between min and max
   * @param {number} val
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  },

  /**
   * Deep clone an object
   * @param {*} obj
   * @returns {*}
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Escape HTML to prevent XSS
   * @param {string} str
   * @returns {string}
   */
  escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Highlight search terms in text
   * @param {string} text
   * @param {string} query
   * @returns {string} HTML with <mark> tags
   */
  highlightText(text, query) {
    if (!query || !text) return Utils.escapeHTML(text);
    const escaped = Utils.escapeHTML(text);
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escaped.replace(regex, '<mark>$1</mark>');
  },

  /**
   * Paginate array
   * @param {Array} arr
   * @param {number} page — 1-based
   * @param {number} perPage
   * @returns {Object} { items, totalPages, currentPage, totalItems }
   */
  paginate(arr, page, perPage) {
    const totalItems = arr.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const currentPage = Utils.clamp(page, 1, totalPages || 1);
    const start = (currentPage - 1) * perPage;
    const items = arr.slice(start, start + perPage);
    return { items, totalPages, currentPage, totalItems };
  },

  /**
   * Check if device is mobile
   * @returns {boolean}
   */
  isMobile() {
    return window.innerWidth < 768;
  },

  /**
   * Check if device supports touch
   * @returns {boolean}
   */
  isTouch() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Copy text to clipboard
   * @param {string} text
   * @returns {Promise<boolean>}
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textarea);
      return result;
    }
  },

  /**
   * Download a string as file
   * @param {string} content
   * @param {string} filename
   * @param {string} mimeType
   */
  downloadFile(content, filename, mimeType = 'application/json') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Read file as text (for import)
   * @param {File} file
   * @returns {Promise<string>}
   */
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
};


// ============================================
// 9. TIMER CLASS
// ============================================

class StudyTimer {

  /**
   * Create a study timer
   * @param {Function} onTick — Called every second with remaining seconds
   * @param {Function} onComplete — Called when timer reaches 0
   */
  constructor(onTick, onComplete) {
    this.duration = 25 * 60; // default 25 min
    this.remaining = this.duration;
    this.interval = null;
    this.running = false;
    this.paused = false;
    this.startTime = null;
    this.elapsed = 0;

    this.onTick = onTick || (() => {});
    this.onComplete = onComplete || (() => {});
  }

  /**
   * Set timer duration
   * @param {number} minutes
   */
  setDuration(minutes) {
    this.duration = minutes * 60;
    this.remaining = this.duration;
    this.elapsed = 0;
    this.onTick(this.remaining);
  }

  /**
   * Start the timer
   */
  start() {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.startTime = Date.now();

    this.interval = setInterval(() => {
      this.remaining--;
      this.elapsed++;
      this.onTick(this.remaining);

      if (this.remaining <= 0) {
        this.stop();
        this.onComplete();
      }
    }, 1000);
  }

  /**
   * Pause the timer
   */
  pause() {
    if (!this.running) return;
    clearInterval(this.interval);
    this.interval = null;
    this.running = false;
    this.paused = true;
  }

  /**
   * Resume the timer
   */
  resume() {
    if (this.running || !this.paused) return;
    this.start();
  }

  /**
   * Toggle between start/pause
   */
  toggle() {
    if (this.running) {
      this.pause();
    } else {
      this.start();
    }
  }

  /**
   * Stop and reset the timer
   */
  stop() {
    clearInterval(this.interval);
    this.interval = null;
    this.running = false;
    this.paused = false;
  }

  /**
   * Reset timer to initial duration
   */
  reset() {
    this.stop();
    this.remaining = this.duration;
    this.elapsed = 0;
    this.onTick(this.remaining);
  }

  /**
   * Get elapsed time in seconds
   * @returns {number}
   */
  getElapsed() {
    return this.elapsed;
  }

  /**
   * Get remaining time in seconds
   * @returns {number}
   */
  getRemaining() {
    return this.remaining;
  }

  /**
   * Check if timer is running
   * @returns {boolean}
   */
  isRunning() {
    return this.running;
  }

  /**
   * Check if timer is paused
   * @returns {boolean}
   */
  isPaused() {
    return this.paused;
  }

  /**
   * Destroy timer (cleanup)
   */
  destroy() {
    this.stop();
    this.onTick = null;
    this.onComplete = null;
  }
}


// ============================================
// 10. DATA LOADER
// ============================================

const DataLoader = {

  /**
   * Load a single day's JSON file
   * @param {number} dayNum — 1 to 15
   * @returns {Promise<Object>} Day data
   */
  async loadDay(dayNum) {
    try {
      const response = await fetch(`data/day${dayNum}.json`);
      if (!response.ok) {
        console.warn(`[DataLoader] day${dayNum}.json not found (${response.status})`);
        return null;
      }
      const data = await response.json();
      // Tag each question with day number if not present
      if (data && data.questions) {
        data.questions.forEach(q => {
          if (!q.day) q.day = dayNum;
        });
      }
      return data;
    } catch (e) {
      console.warn(`[DataLoader] Failed to load day${dayNum}.json:`, e);
      return null;
    }
  },

  /**
   * Load all 15 days in parallel
   * @param {Function} onProgress — Called with (loaded, total) for progress updates
   * @returns {Promise<Array>} Array of all questions merged
   */
  async loadAll(onProgress) {
    const promises = [];
    for (let i = 1; i <= TOTAL_DAYS; i++) {
      promises.push(this.loadDay(i));
    }

    let loaded = 0;
    const results = await Promise.all(
      promises.map(p => p.then(result => {
        loaded++;
        if (onProgress) onProgress(loaded, TOTAL_DAYS);
        return result;
      }))
    );

    // Merge all questions into single array
    const allQuestions = [];
    const dayMeta = {};

    results.forEach((dayData, index) => {
      if (dayData && dayData.questions) {
        dayData.questions.forEach(q => allQuestions.push(q));
        dayMeta[index + 1] = {
          title: dayData.title || `Day ${index + 1}`,
          totalQuestions: dayData.totalQuestions || dayData.questions.length
        };
      }
    });

    return { allQuestions, dayMeta };
  },

  /**
   * Load a single day first (for quick start), then load rest in background
   * @param {Function} onFirstLoaded — Called when Day 1 is ready
   * @param {Function} onAllLoaded — Called when all days are ready
   * @param {Function} onProgress — Progress callback
   */
  async loadProgressive(onFirstLoaded, onAllLoaded, onProgress) {
    // Load Day 1 first
    const day1 = await this.loadDay(1);
    if (day1 && onFirstLoaded) {
      onFirstLoaded(day1.questions || []);
    }

    // Load rest in background
    const { allQuestions, dayMeta } = await this.loadAll(onProgress);
    if (onAllLoaded) {
      onAllLoaded(allQuestions, dayMeta);
    }
  }
};


// ============================================
// 11. STATS CALCULATOR
// ============================================

const StatsCalculator = {

  /**
   * Calculate comprehensive stats
   * @param {Array} allQuestions
   * @returns {Object}
   */
  calculate(allQuestions) {
    const counts = Progress.getCounts();
    const total = allQuestions.length;
    const notAttempted = total - counts.attempted - counts.skipped;

    return {
      total,
      attempted: counts.attempted,
      skipped: counts.skipped,
      notAttempted: Math.max(0, notAttempted),
      bookmarked: counts.bookmarked,
      completionPct: Utils.percentage(counts.attempted, total),
      streak: Streak.get().count,
      todayCount: PracticeHistory.getTodayCount(),
      bySubject: Progress.getCountsBySubject(allQuestions),
      byDifficulty: Progress.getCountsByDifficulty(allQuestions),
      byDay: Progress.getCountsByDay(allQuestions),
      byConfidence: Progress.getCountsByConfidence(allQuestions),
      byType: Progress.getCountsByType(allQuestions),
      storageUsed: Storage.formatSize(Storage.getSize())
    };
  },

  /**
   * Get most bookmarked topics
   * @param {Array} allQuestions
   * @param {number} limit
   * @returns {Array<Object>} [{ topic, count }]
   */
  getMostBookmarkedTopics(allQuestions, limit = 5) {
    const topicCounts = {};
    allQuestions.forEach(q => {
      if (Progress.isBookmarked(q.id)) {
        const topic = q.topic || 'Unknown';
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    });

    return Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },

  /**
   * Get weakest areas (most "No Idea" confidence)
   * @param {Array} allQuestions
   * @param {number} limit
   * @returns {Array<Object>}
   */
  getWeakestAreas(allQuestions, limit = 5) {
    const topicCounts = {};
    allQuestions.forEach(q => {
      if (Progress.getConfidence(q.id) === 'noidea') {
        const topic = q.topic || 'Unknown';
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    });

    return Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
};


// ============================================
// 12. KEYBOARD SHORTCUTS MANAGER
// ============================================

const Keyboard = {

  /** @type {Object} Map of key → callback */
  _handlers: {},

  /** @type {boolean} Whether keyboard shortcuts are enabled */
  _enabled: true,

  /**
   * Initialize keyboard listener
   */
  init() {
    document.addEventListener('keydown', (e) => {
      if (!this._enabled) return;

      // Don't trigger if user is typing in input/textarea
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.target.isContentEditable) return;

      const key = this._getKeyString(e);
      if (this._handlers[key]) {
        e.preventDefault();
        this._handlers[key](e);
      }
    });
  },

  /**
   * Register a keyboard shortcut
   * @param {string} key — e.g. 'n', 'b', 'ctrl+f', 'escape'
   * @param {Function} callback
   */
  on(key, callback) {
    this._handlers[key.toLowerCase()] = callback;
  },

  /**
   * Remove a keyboard shortcut
   * @param {string} key
   */
  off(key) {
    delete this._handlers[key.toLowerCase()];
  },

  /**
   * Enable/disable shortcuts
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this._enabled = enabled;
  },

  /**
   * Get normalized key string from event
   * @param {KeyboardEvent} e
   * @returns {string}
   */
  _getKeyString(e) {
    let key = e.key.toLowerCase();
    if (key === ' ') key = 'space';
    if (key === 'escape') key = 'escape';

    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.altKey) parts.push('alt');
    if (e.shiftKey) parts.push('shift');
    parts.push(key);

    return parts.join('+');
  }
};


// ============================================
// 13. SOUND EFFECTS (Optional)
// ============================================

const Sounds = {

  /** @type {boolean} */
  _enabled: false,

  /**
   * Enable/disable sounds
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this._enabled = enabled;
  },

  /**
   * Play a short beep
   * @param {number} frequency — Hz
   * @param {number} duration — ms
   */
  beep(frequency = 520, duration = 150) {
    if (!this._enabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gain.gain.value = 0.1;
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        ctx.close();
      }, duration);
    } catch (e) {
      // Silently fail
    }
  },

  /**
   * Play success sound
   */
  success() {
    this.beep(660, 100);
    setTimeout(() => this.beep(880, 150), 120);
  },

  /**
   * Play click sound
   */
  click() {
    this.beep(440, 50);
  },

  /**
   * Play timer complete sound
   */
  timerComplete() {
    this.beep(523, 200);
    setTimeout(() => this.beep(659, 200), 250);
    setTimeout(() => this.beep(784, 300), 500);
  }
};


// ============================================
// 14. EXPORT ALL MODULES
// ============================================
// (All modules are available globally since we're not using ES modules)

// Freeze constants to prevent accidental modification
Object.freeze(STORAGE_KEYS);
Object.freeze(SUBJECTS);
Object.freeze(QUESTION_TYPES);
Object.freeze(DIFFICULTIES);
Object.freeze(STATUSES);
Object.freeze(CONFIDENCE_LEVELS);
Object.freeze(EXAM_SOURCES);
Object.freeze(DEFAULT_FILTERS);
Object.freeze(DEFAULT_SETTINGS);