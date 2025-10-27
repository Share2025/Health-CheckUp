// ===================================================================================
// utils.js
// -----------------------------------------------------------------------------------
// This module contains generic utility functions that can be used across
// the entire application.
// ===================================================================================

/**
 * Debounce function to limit the rate at which a function gets called.
 * This is useful for event handlers that fire rapidly, like 'keyup' or 'resize'.
 * @param {Function} func The function to debounce.
 * @param {number} delay The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
export function debounce(func, delay = 300) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Formats a date string from 'YYYY-MM-DD...' or a JavaScript Date object to 'DD/MM/YYYY'.
 * Returns the original input if formatting is not possible.
 * @param {string | Date} dateInput The date string or object to format.
 * @returns {string} The formatted date string or the original input.
 */
export function formatDate(dateInput) {
    if (!dateInput) return '';

    let dateString = dateInput instanceof Date ? dateInput.toISOString() : String(dateInput);

    if (typeof dateString !== 'string' || dateString.length < 10) {
        return dateString;
    }

    const datePart = dateString.substring(0, 10);
    const parts = datePart.split('-');

    if (parts.length === 3 && parts[0].length === 4) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    }

    return dateString;
}