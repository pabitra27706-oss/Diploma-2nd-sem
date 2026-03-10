/* ========================================
   PYQ STORAGE - LocalStorage Management
   Handles all persistence operations
   ======================================== */

const PYQStorage = {

    // ============ KEY GENERATION ============

    /**
     * Get storage key for subject and year
     * @param {string} subject - Subject code
     * @param {string|number} year - Year
     * @returns {string} Storage key
     */
    getKey(subject, year) {
        const normalized = subject.toLowerCase().replace(/\s+/g, '_');
        return `pyq_${normalized}_${year}`;
    },

    /**
     * Get settings key
     * @returns {string}
     */
    getSettingsKey() {
        return 'pyq_settings';
    },

    // ============ BASIC OPERATIONS ============

    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     * @returns {boolean} Success status
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('❌ Storage save error:', error);
            if (error.name === 'QuotaExceededError') {
                this.showStorageWarning();
            }
            return false;
        }
    },

    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @returns {any} Parsed data or null
     */
    load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('❌ Storage load error:', error);
            return null;
        }
    },

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('❌ Storage remove error:', error);
        }
    },

    /**
     * Show storage warning
     */
    showStorageWarning() {
        console.warn('⚠️ Storage quota exceeded. Some data may not be saved.');
    },

    // ============ PROGRESS MANAGEMENT ============

    /**
     * Save progress for a subject/year
     * @param {string} subject - Subject code
     * @param {string|number} year - Year
     * @param {Object} data - Progress data
     */
    saveProgress(subject, year, data) {
        const key = this.getKey(subject, year);
        const saveData = {
            ...data,
            lastSaved: PYQHelpers.getTimestamp()
        };
        this.save(key, saveData);
    },

    /**
     * Load progress for a subject/year
     * @param {string} subject - Subject code
     * @param {string|number} year - Year
     * @returns {Object|null} Progress data
     */
    loadProgress(subject, year) {
        const key = this.getKey(subject, year);
        return this.load(key);
    },

    /**
     * Reset progress for a subject/year
     * @param {string} subject - Subject code
     * @param {string|number} year - Year
     */
    resetProgress(subject, year) {
        const key = this.getKey(subject, year);
        this.remove(key);
    },

    /**
     * Reset all progress for a subject
     * @param {string} subject - Subject code
     */
    resetAllProgress(subject) {
        const normalized = subject.toLowerCase().replace(/\s+/g, '_');
        const prefix = `pyq_${normalized}_`;
        
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(prefix)) {
                localStorage.removeItem(key);
            }
        });
    },

    // ============ BOOKMARKS ============

    /**
     * Get bookmarks from progress
     * @param {string} subject - Subject code
     * @param {string|number} year - Year
     * @returns {Array} Bookmark IDs
     */
    getBookmarks(subject, year) {
        const progress = this.loadProgress(subject, year);
        return progress?.bookmarks || [];
    },

    /**
     * Toggle bookmark
     * @param {string} subject - Subject code
     * @param {string|number} year - Year
     * @param {string} questionId - Question unique ID
     * @returns {boolean} New bookmark state
     */
    toggleBookmark(subject, year, questionId) {
        const progress = this.loadProgress(subject, year) || {
            userAnswers: {},
            bookmarks: [],
            currentQuestionIndex: 0
        };
        
        const index = progress.bookmarks.indexOf(questionId);
        
        if (index > -1) {
            progress.bookmarks.splice(index, 1);
            this.saveProgress(subject, year, progress);
            return false;
        } else {
            progress.bookmarks.push(questionId);
            this.saveProgress(subject, year, progress);
            return true;
        }
    },

    // ============ THEME ============

    /**
     * Get current theme
     * @returns {string} 'light' or 'dark'
     */
    getTheme() {
        const settings = this.load(this.getSettingsKey());
        if (settings?.theme) return settings.theme;
        
        // Check system preference
        if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    },

    /**
     * Set theme
     * @param {string} theme - 'light' or 'dark'
     */
    setTheme(theme) {
        const settings = this.load(this.getSettingsKey()) || {};
        settings.theme = theme;
        this.save(this.getSettingsKey(), settings);
        
        // Apply to DOM
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update meta theme-color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', theme === 'dark' ? '#1f2937' : '#6366f1');
        }
    },

    /**
     * Toggle theme
     * @returns {string} New theme
     */
    toggleTheme() {
        const current = this.getTheme();
        const newTheme = current === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        return newTheme;
    },

    /**
     * Watch for system theme changes
     */
    watchSystemTheme() {
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                const settings = this.load(this.getSettingsKey());
                // Only auto-switch if user hasn't set preference
                if (!settings?.theme) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    },

    // ============ EXPORT / IMPORT ============

    /**
     * Export all progress for a subject
     * @param {string} subject - Subject code
     * @param {Array} years - Available years
     * @returns {Object} Export data
     */
    exportProgress(subject, years) {
        const exportData = {
            subject,
            exportedAt: PYQHelpers.getTimestamp(),
            version: '2.0',
            years: {}
        };

        years.forEach(year => {
            const progress = this.loadProgress(subject, year);
            if (progress) {
                exportData.years[year] = progress;
            }
        });

        return exportData;
    },

    /**
     * Import progress data
     * @param {Object} data - Import data
     * @returns {boolean} Success
     */
    importProgress(data) {
        try {
            if (!data.subject || !data.years) {
                throw new Error('Invalid import format');
            }

            Object.entries(data.years).forEach(([year, progress]) => {
                this.saveProgress(data.subject, year, progress);
            });

            return true;
        } catch (error) {
            console.error('❌ Import error:', error);
            return false;
        }
    },

    /**
     * Download data as file
     * @param {Object} data - Data to download
     * @param {string} filename - File name
     */
    downloadAsFile(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        URL.revokeObjectURL(url);
    },

    // ============ STATISTICS ============

    /**
     * Get storage usage
     * @returns {Object} Usage info
     */
    getStorageUsage() {
        let totalSize = 0;
        let pyqSize = 0;

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const size = localStorage[key].length * 2; // UTF-16
                totalSize += size;
                if (key.startsWith('pyq_')) {
                    pyqSize += size;
                }
            }
        }

        return {
            totalKB: (totalSize / 1024).toFixed(2),
            pyqKB: (pyqSize / 1024).toFixed(2)
        };
    }
};

// Make globally available
window.PYQStorage = PYQStorage;

// Initialize theme watcher
document.addEventListener('DOMContentLoaded', () => {
    PYQStorage.watchSystemTheme();
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PYQStorage;
}