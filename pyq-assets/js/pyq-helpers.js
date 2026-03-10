/* ========================================
   PYQ HELPERS - Pure Utility Functions
   UPDATED VERSION - With formatAnswerText
   ======================================== */

const PYQHelpers = {

    // ============ FORMATTING ============

    /**
     * Format question type for display
     * @param {string} type - Question type
     * @returns {string} Formatted name
     */
    formatQuestionType(type) {
        const types = {
            mcq: 'MCQ',
            truefalse: 'True/False',
            gapfill: 'Fill in the Blank',
            saq: 'Short Answer',
            laq: 'Long Answer',
            missing: 'Unavailable'
        };
        return types[type] || type?.toUpperCase() || 'Unknown';
    },

    /**
     * Format marks display
     * @param {number} marks - Marks value
     * @returns {string} Formatted string
     */
    formatMarks(marks) {
        if (marks === undefined || marks === null || marks === 0) return '';
        return marks === 1 ? '1 mark' : `${marks} marks`;
    },

    /**
     * Format time duration
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time
     */
    formatTime(seconds) {
        if (seconds < 0) seconds = 0;
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) return `${hours}h ${mins}m`;
        if (mins === 0) return `${secs}s`;
        if (secs === 0) return `${mins}m`;
        return `${mins}m ${secs}s`;
    },

    /**
     * Truncate text with ellipsis
     * @param {string} text - Text to truncate
     * @param {number} length - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, length = 50) {
        if (!text) return '';
        const stripped = this.stripHTML(text);
        if (stripped.length <= length) return stripped;
        return stripped.substring(0, length).trim() + '...';
    },

    /**
     * Get ordinal suffix
     * @param {number} num - Number
     * @returns {string} Number with suffix
     */
    getOrdinal(num) {
        const suffixes = ["th", "st", "nd", "rd"];
        const v = num % 100;
        return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
    },

    /**
     * Format answer text - handles both HTML and plain text with newlines
     * @param {string} text - Answer text
     * @returns {string} HTML formatted text
     */
    formatAnswerText(text) {
        if (!text) return '';
        
        // If text already contains HTML tags, return as-is
        if (/<\/?[a-z][\s\S]*>/i.test(text)) {
            return text;
        }
        
        // Otherwise, convert plain text with \n to HTML
        return text
            .split('\n\n')  // Split on double newlines (paragraphs)
            .map(para => {
                if (para.trim() === '') return '';
                
                // Check if paragraph starts with a list marker
                if (/^[-•*]\s/.test(para)) {
                    // Convert to unordered list
                    const items = para.split('\n')
                        .filter(line => line.trim())
                        .map(line => `<li>${line.replace(/^[-•*]\s/, '').trim()}</li>`)
                        .join('');
                    return `<ul>${items}</ul>`;
                } else if (/^\d+\.\s/.test(para)) {
                    // Convert to ordered list
                    const items = para.split('\n')
                        .filter(line => line.trim())
                        .map(line => `<li>${line.replace(/^\d+\.\s/, '').trim()}</li>`)
                        .join('');
                    return `<ol>${items}</ol>`;
                } else {
                    // Regular paragraph with line breaks
                    return `<p>${para.replace(/\n/g, '<br>')}</p>`;
                }
            })
            .filter(p => p)
            .join('');
    },

    // ============ HTML UTILITIES ============

    /**
     * Strip HTML tags safely (no XSS)
     * @param {string} html - HTML string
     * @returns {string} Plain text
     */
    stripHTML(html) {
        if (!html) return '';
        // Use regex instead of DOM to avoid XSS
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim();
    },

    /**
     * Escape HTML special characters
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Highlight search term in text
     * @param {string} text - Original text
     * @param {string} term - Search term
     * @returns {string} HTML with highlighted term
     */
    highlightText(text, term) {
        if (!term || !text) return text;
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },

    // ============ ARRAY UTILITIES ============

    /**
     * Shuffle array (Fisher-Yates)
     * @param {Array} array - Array to shuffle
     * @returns {Array} New shuffled array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * Group array by key
     * @param {Array} array - Array to group
     * @param {string|Function} key - Key to group by
     * @returns {Object} Grouped object
     */
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const groupKey = typeof key === 'function' ? key(item) : item[key];
            if (!result[groupKey]) result[groupKey] = [];
            result[groupKey].push(item);
            return result;
        }, {});
    },

    /**
     * Get random items from array
     * @param {Array} array - Source array
     * @param {number} count - Number of items
     * @returns {Array} Random items
     */
    getRandomItems(array, count) {
        return this.shuffleArray(array).slice(0, Math.min(count, array.length));
    },

    // ============ FUNCTION UTILITIES ============

    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function execution
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in ms
     * @returns {Function} Throttled function
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // ============ ASYNC UTILITIES ============

    /**
     * Fetch JSON with error handling
     * @param {string} url - URL to fetch
     * @returns {Promise<Object>} Parsed JSON
     */
    async fetchJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`❌ Failed to fetch ${url}:`, error);
            throw error;
        }
    },

    // ============ VALIDATION ============

    /**
     * Validate question structure
     * @param {Object} question - Question object
     * @returns {Object} Validation result
     */
    validateQuestion(question) {
        const errors = [];
        
        if (!question) {
            return { valid: false, errors: ['Question is null/undefined'] };
        }

        if (!question.id) errors.push('Missing id');
        if (!question.type) errors.push('Missing type');
        if (!question.question) errors.push('Missing question text');

        // Type-specific validation
        switch (question.type) {
            case 'mcq':
                if (!question.options || !Array.isArray(question.options)) {
                    errors.push('MCQ missing options array');
                } else if (question.options.length < 2) {
                    errors.push('MCQ needs at least 2 options');
                }
                if (typeof question.correct !== 'number') {
                    errors.push('MCQ missing correct answer index');
                }
                break;
            
            case 'truefalse':
                if (typeof question.correct !== 'boolean') {
                    errors.push('True/False missing correct answer');
                }
                break;
            
            case 'gapfill':
                if (!question.answer && !question.acceptableAnswers) {
                    errors.push('Gap fill missing answer');
                }
                break;
            
            case 'saq':
            case 'laq':
                if (!question.answer) {
                    errors.push(`${question.type.toUpperCase()} missing answer`);
                }
                break;
            
            case 'missing':
                // Missing questions are valid
                break;
            
            default:
                errors.push(`Unknown question type: ${question.type}`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    // ============ ANSWER CHECKING ============

    /**
     * Check MCQ answer
     * @param {number} selected - Selected option index
     * @param {number} correct - Correct answer index
     * @returns {boolean}
     */
    checkMCQ(selected, correct) {
        return selected === correct;
    },

    /**
     * Check True/False answer
     * @param {boolean} selected - Selected answer
     * @param {boolean} correct - Correct answer
     * @returns {boolean}
     */
    checkTrueFalse(selected, correct) {
        return selected === correct;
    },

    /**
     * Check Gap Fill answer
     * @param {string} userAnswer - User's answer
     * @param {string|Array} acceptableAnswers - Correct answer(s)
     * @returns {boolean}
     */
    checkGapFill(userAnswer, acceptableAnswers) {
        if (!userAnswer || typeof userAnswer !== 'string') return false;
        
        const normalize = (str) => str.toLowerCase().trim().replace(/\s+/g, ' ');
        const normalized = normalize(userAnswer);
        
        if (normalized === '') return false;
        
        if (Array.isArray(acceptableAnswers)) {
            return acceptableAnswers.some(ans => normalize(String(ans)) === normalized);
        }
        
        return normalize(String(acceptableAnswers)) === normalized;
    },

    // ============ DATE/TIME ============

    /**
     * Get current ISO timestamp
     * @returns {string} ISO timestamp
     */
    getTimestamp() {
        return new Date().toISOString();
    },

    /**
     * Format date for display
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date
     */
    formatDate(date) {
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return 'Invalid date';
        
        return d.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // ============ DEVICE DETECTION ============

    /**
     * Check if device is mobile
     * @returns {boolean}
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Check if device supports touch
     * @returns {boolean}
     */
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
};

// Make globally available
window.PYQHelpers = PYQHelpers;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PYQHelpers;
}