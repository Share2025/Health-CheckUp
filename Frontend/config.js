// ===================================================================================
// config.js
// -----------------------------------------------------------------------------------
// This file contains the static configuration for the application.
// ===================================================================================

/**
 * Prefix for all keys stored in localStorage to avoid conflicts.
 */
export const STORAGE_PREFIX = 'health-dashboard-';

/**
 * The expected name of the sheet containing follow-up notes in the Excel file.
 * The check is case-insensitive.
 */
export const NOTE_SHEET_NAME = 'note';

/**
 * Configuration for each health checkup station.
 * - key: A unique identifier for the station.
 * - name: The display name of the station.
 * - cols: An array of Excel column letters corresponding to this station.
 * - type: 'single' for one-to-one column mapping, 'combined' for many-to-one logic.
 * - icon: SVG icon markup for display in the UI.
 */
export const STATIONS_CONFIG = [
    // --- Basic Info Columns (Not stations, but defined for mapping) ---
    { key: 'no', cols: ['A'] },
    { key: 'hn', cols: ['B'] },
    { key: 'id', cols: ['C'] },
    { key: 'name', cols: ['D'] },
    { key: 'date', cols: ['E'] },
    { key: 'time', cols: ['F'] },
    { key: 'checkOut', cols: ['G'] },
    { key: 'department', cols: ['H'] },
    { key: 'position', cols: ['I'] },
    { key: 'affiliation', cols: ['J'] }, // 'Company' in Excel is mapped to affiliation

    // --- Health Checkup Stations ---
    { key: 'foundDoctor', name: 'พบแพทย์ (Doctor)', cols: ['K'], type: 'single', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>` },
    { key: 'bloodTest', name: 'เจาะเลือด (Blood Test)', cols: ['L', 'M', 'N'], type: 'combined', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12.75l-7.5 7.5-7.5-7.5m15 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>` },
    { key: 'urineTest', name: 'เก็บปัสสาวะ (Urine)', cols: ['O', 'P'], type: 'combined', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 21h4a2 2 0 002-2v-2H8v2a2 2 0 002 2zM12 3v14" /></svg>` },
    { key: 'xray', name: 'X-ray', cols: ['Q'], type: 'single', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>` },
    { key: 'spirometry', name: 'เป่าปอด (Spirometry)', cols: ['R'], type: 'single', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>` },
    { key: 'hearing', name: 'การได้ยิน (Hearing)', cols: ['S'], type: 'single', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 12h.01" /></svg>` },
    { key: 'ekg', name: 'คลื่นไฟฟ้าหัวใจ (ECG)', cols: ['T'], type: 'single', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>` },
    { key: 'pft', name: 'คลื่นไฟฟ้าอับอากาศ (PFT)', cols: ['U'], type: 'single', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l1.293-1.293a1 1 0 011.414 0l.586.586A1 1 0 0013 6V7m-4 12v-3m4 3v-3m-4-3H5a2 2 0 00-2 2v3a2 2 0 002 2h4zm4 0h4a2 2 0 002-2v-3a2 2 0 00-2-2h-4m-4 3v-3m4 3v-3" /></svg>` },
    { key: 'vision', name: 'สายตาทั่วไป (Vision)', cols: ['V'], type: 'single', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>` },
    { key: 'occVision', name: 'สายตาอาชีวอนามัย (Occ. Vision)', cols: ['W'], type: 'single', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3" /></svg>` },
    { key: 'musculoskeletal', name: 'กล้ามเนื้อมือแขนขาหลัง (Musculoskeletal)', cols: ['X'], type: 'single', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>` },
    { key: 'tb', name: 'TB วัณโรค', cols: ['Y'], type: 'single', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>` },
    { key: 'fluVaccine', name: 'วัคซีนไข้หวัดใหญ่ (Flu Vaccine)', cols: ['Z'], type: 'single', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-1.026.977-2.206.977-3.417a8 8 0 00-16 0c0 1.211.332 2.391.977 3.417M14.121 15.536A9.028 9.028 0 0112 15c-1.38 0-2.68.324-3.829.882" /></svg>` },
    { key: 'stoolTest', name: 'เก็บอุจจาระ (Stool)', cols: ['AA', 'AB'], type: 'combined', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>` },
    { key: 'papSmear', name: 'Papsmear', cols: ['AC'], type: 'single', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>` },
    { key: 'certificate', name: 'ใบรับรองแพทย์ (Certificate)', cols: ['AD'], type: 'single', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>` },
    { key: 'riskDocs', name: 'ปัจจัยเสี่ยง (Risk Docs)', cols: ['AE'], type: 'single', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>` },
    { key: 'enzyme', name: 'Enzyme', cols: ['AF'], type: 'single', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12.75l-7.5 7.5-7.5-7.5m15 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>` },
    { key: 'uaEndOfWeek', name: 'UA แดง (End of week)', cols: ['AL'], type: 'single', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 21h4a2 2 0 002-2v-2H8v2a2 2 0 002 2zM12 3v14" /></svg>` },
    { key: 'cashPayment', name: 'ชำระเงินสด', cols: ['AM'], type: 'single', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1.605a2.25 2.25 0 00-1.28-2.128l-2.071-1.035a2.25 2.25 0 00-2.298 2.298l.01 6.511a2.25 2.25 0 002.128 2.249L12 14.5M12 8h.01M12 16h.01" /></svg>` },
];