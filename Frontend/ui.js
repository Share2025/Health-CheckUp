// ===================================================================================
// ui.js
// -----------------------------------------------------------------------------------
// This module handles all interactions with the DOM. It contains functions
// that render or update parts of the page, such as charts, tables, and modals.
// ===================================================================================

// --- DOM Element References ---
export const dom = {
    // Overlays & Global
    loadingOverlay: document.getElementById('loading-overlay'),
    toastContainer: document.getElementById('toast-container'),

    // Company Selection
    companyContainer: document.getElementById('company-container'),
    companySelectionTitle: document.getElementById('company-selection-title'),
    createCompanySection: document.getElementById('create-company-section'),
    savedCompaniesList: document.getElementById('saved-companies-list'),

    // Header & Main Views
    headerActions: document.getElementById('header-actions'),
    companyDisplay: document.getElementById('company-display'),
    companyDisplayName: document.getElementById('company-display-name'),
    uploadContainer: document.getElementById('upload-container'),
    uploadUi: document.getElementById('upload-ui'),
    uploadMessage: document.getElementById('upload-message'),
    uploadNewFileBtn: document.getElementById('upload-new-file-btn'),
    mainContent: document.getElementById('main-content'),
    mainSearchContainer: document.getElementById('main-search-container'),

    // Overview Tab
    totalCountEl: document.getElementById('total-count'),
    registeredCountEl: document.getElementById('registered-count'),
    notRegisteredCountEl: document.getElementById('not-registered-count'),
    incompleteCountEl: document.getElementById('incomplete-count'),
    summaryTableTitle: document.getElementById('summary-table-title'),
    summaryGroupHeader: document.getElementById('summary-group-header'),
    summaryTableBody: document.getElementById('summary-table-body'),

    // Station Tab
    stationCardsContainer: document.getElementById('station-cards-container'),
    stationChartCanvas: document.getElementById('station-chart'),
    departmentFilter: document.getElementById('department-filter'),
    positionFilter: document.getElementById('position-filter'),
    affiliationFilter: document.getElementById('affiliation-filter'),

    // Follow-up Tab
    followupTableBody: document.getElementById('followup-table-body'),
    followUpCardsContainer: document.getElementById('follow-up-cards-container'),


    // Search
    individualSearchResultsContainer: document.getElementById('individual-search-results'),

    // Modals
    dataModal: document.getElementById('data-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalTableHead: document.getElementById('modal-table-head'),
    modalTableBody: document.getElementById('modal-table-body'),
    individualModal: document.getElementById('individual-modal'),
    individualModalTitle: document.getElementById('individual-modal-title'),
    individualModalContent: document.getElementById('individual-modal-content'),
    shareLinkModal: document.getElementById('share-link-modal'),
    shareLinkCompanyName: document.getElementById('share-link-company-name'),
    shareableLinkInput: document.getElementById('shareable-link-input'),

    // Auth
    logoutBtn: document.getElementById('logout-btn'),
    adminLoginPromptBtn: document.getElementById('admin-login-prompt-btn'),
};

let stationChart = null;


// --- UI State & Toggles ---

export function showLoading(isLoading) {
    dom.loadingOverlay.classList.toggle('hidden', !isLoading);
}

export function showToast(message, type = 'info') {
    const icons = {
        info: `<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" /></svg>`,
        success: `<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" /></svg>`,
        error: `<svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" /></svg>`,
    };
    const colors = {
        info: 'bg-cyan-500',
        success: 'bg-emerald-500',
        error: 'bg-rose-500'
    };
    const toast = document.createElement('div');
    toast.className = `flex items-center space-x-3 text-white py-2 px-4 rounded-lg shadow-lg toast ${colors[type]}`;
    toast.innerHTML = `${icons[type]}<span>${message}</span>`;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}


// --- Initial View Setup ---

export function setupView(isAdminLoggedIn) {
    if (isAdminLoggedIn) {
        dom.companySelectionTitle.textContent = 'Admin Mode';
        dom.createCompanySection.classList.remove('hidden');
        dom.adminLoginPromptBtn.classList.add('hidden');
        dom.logoutBtn.classList.remove('hidden');
    } else {
        dom.companySelectionTitle.textContent = 'Select Company';
        dom.createCompanySection.classList.add('hidden');
        dom.adminLoginPromptBtn.classList.remove('hidden');
        dom.logoutBtn.classList.add('hidden');
    }
}

export function loadSavedCompanies(companies, isAdminLoggedIn) {
    if (companies.length > 0) {
        const deleteIcon = `<svg class="w-5 h-5 text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>`;
        let companiesHtml;
        if (isAdminLoggedIn) {
            companiesHtml = companies.map(name => `
                <div class="flex items-center gap-2 group">
                    <button class="flex-grow w-full text-left p-3 bg-slate-100 hover:bg-cyan-100 rounded-lg transition duration-200 saved-company-btn" data-company="${name}">${name}</button>
                    <button class="flex-shrink-0 p-3 bg-slate-100 hover:bg-yellow-100 rounded-lg transition duration-200 manage-link-btn" data-company="${name}" title="Manage Shareable Link">
                        <svg class="w-5 h-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.665l3-3z" /><path d="M8.603 14.53a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 005.656 5.656l3-3a4 4 0 00-.225-5.865.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.665l-3 3z" /></svg>
                    </button>
                    <button class="flex-shrink-0 p-3 bg-slate-100 hover:bg-rose-100 rounded-lg transition duration-200 delete-company-btn" data-company="${name}" title="Delete Company">${deleteIcon}</button>
                </div>`).join('');
        } else {
            companiesHtml = companies.map(name => `<button class="w-full text-left p-3 bg-slate-100 hover:bg-cyan-100 rounded-lg transition duration-200 saved-company-btn" data-company="${name}">${name}</button>`).join('');
        }
        dom.savedCompaniesList.innerHTML = `<p class="block text-sm font-medium text-slate-700 mb-2">Saved Companies:</p>${companiesHtml}`;
    } else {
        const message = isAdminLoggedIn ? "No companies have been saved yet. Please create one." : "No company data is available.";
        dom.savedCompaniesList.innerHTML = `<p class="text-center text-sm text-slate-500 p-4 bg-slate-50 rounded-lg">${message}</p>`;
    }
}

export function resetDashboardUI() {
    dom.mainContent.classList.add('hidden');
    dom.headerActions.classList.add('hidden');
    dom.mainSearchContainer.classList.add('hidden');
    dom.uploadContainer.classList.add('hidden');
    dom.companyDisplay.classList.add('hidden');
    dom.companyContainer.classList.remove('hidden');
    dom.uploadNewFileBtn.classList.add('hidden');

    if (stationChart) stationChart.destroy();
    stationChart = null;

    dom.followupTableBody.innerHTML = '';
    dom.stationCardsContainer.innerHTML = '';
    dom.individualSearchResultsContainer.innerHTML = '';
    dom.followUpCardsContainer.innerHTML = '';

    document.querySelectorAll('input[type="text"], input[type="file"]').forEach(input => input.value = '');
    document.querySelectorAll('select').forEach(select => select.innerHTML = '');
}

// --- Tab Rendering Functions ---

export function renderOverviewTab(data) {
    const total = data.length;
    const registered = data.filter(p => p.isRegistered).length;
    const notRegistered = total - registered;
    const incomplete = data.filter(p => p.status === 'ตรวจไม่ครบ').length;

    dom.totalCountEl.textContent = total;
    dom.registeredCountEl.textContent = registered;
    dom.notRegisteredCountEl.textContent = notRegistered;
    dom.incompleteCountEl.textContent = incomplete;

    renderSummaryTable(data);
}

export function renderStationTab(data, activeStations, filters = {}) {
    let filteredPeopleData = [...data];
    if (filters.department && filters.department !== 'all') filteredPeopleData = filteredPeopleData.filter(p => p.department === filters.department);
    if (filters.position && filters.position !== 'all') filteredPeopleData = filteredPeopleData.filter(p => p.position === filters.position);
    if (filters.affiliation && filters.affiliation !== 'all') filteredPeopleData = filteredPeopleData.filter(p => p.affiliation === filters.affiliation);

    let stationsToDisplay = [...activeStations];
    if (filters.search) stationsToDisplay = activeStations.filter(s => s.name.toLowerCase().includes(filters.search.toLowerCase()));

    const stationCounts = stationsToDisplay.map(station => {
        const totalRequired = filteredPeopleData.filter(p => p.requiredStations.includes(station.key)).length;
        const completedCount = filteredPeopleData.filter(p => p.stations[station.key]).length;
        return { ...station, completed: completedCount, total: totalRequired };
    });

    if (stationsToDisplay.length === 0) {
        dom.stationCardsContainer.innerHTML = `<p class="text-center text-slate-500 md:col-span-2 lg:col-span-4">No stations match the current filter.</p>`;
    } else {
        dom.stationCardsContainer.innerHTML = stationCounts.map(createStationCardHTML).join('');
    }


    if (stationChart) stationChart.destroy();

    stationChart = new Chart(dom.stationChartCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: stationCounts.map(s => s.name),
            datasets: [{
                label: 'Completed Count',
                data: stationCounts.map(s => s.completed),
                backgroundColor: '#22d3ee',
                borderColor: '#0891b2',
                borderWidth: 1,
                borderRadius: 4,
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const total = stationCounts[context.dataIndex].total;
                            const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : '0.0';
                            return `${context.dataset.label}: ${context.raw} (${percentage}%)`;
                        }
                    }
                }
            },
            scales: { x: { beginAtZero: true } }
        }
    });
}

export function renderFollowUpTable(tableData) {
    if (tableData.length === 0) {
        dom.followupTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-500">No data to display.</td></tr>`;
        return;
    }
    dom.followupTableBody.innerHTML = tableData.map(p => `
        <tr class="bg-white border-b hover:bg-slate-50">
            <td class="px-6 py-4 font-medium text-slate-900">${p.id}</td>
            <td class="px-6 py-4">${p.name}</td>
            <td class="px-6 py-4">${p.department}</td>
            <td class="px-6 py-4">${p.uncompleted}</td>
            <td class="px-6 py-4">${p.note}</td>
        </tr>`).join('');
}


// --- Component & Helper Rendering Functions ---

function createFollowUpStationCardHTML(station) {
    return `
    <div class="card p-4 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
        <div>
            <div class="flex items-center space-x-3 mb-2">
                <div class="bg-amber-100 text-amber-600 p-2 rounded-lg">${station.icon}</div>
                <p class="font-bold text-slate-800">${station.name}</p>
            </div>
        </div>
        <div class="border-t border-slate-100 mt-3 pt-3">
            <span class="text-xs text-slate-500">People to Follow-Up</span>
            <div 
                class="font-bold text-3xl text-amber-600 hover:text-amber-700 cursor-pointer followup-card-clickable"
                data-station-key="${station.key}"
                data-station-name="${station.name}"
            >
                ${station.followUpCount}
            </div>
        </div>
    </div>`;
}

export function renderFollowUpCards(followupData, activeStations) {
    if (followupData.length === 0) {
        dom.followUpCardsContainer.innerHTML = `
            <div class="col-span-full text-center p-5 card bg-emerald-50 border-emerald-200">
                <p class="font-semibold text-emerald-800">Excellent! No follow-ups are needed at this time.</p>
            </div>
        `;
        return;
    }

    const stationFollowUpCounts = activeStations.map(station => {
        const count = followupData.filter(person =>
            person.uncompleted.includes(station.name)
        ).length;
        
        return {
            key: station.key,
            name: station.name,
            icon: station.icon,
            followUpCount: count
        };
    })
    .filter(station => station.followUpCount > 0)
    .sort((a, b) => b.followUpCount - a.followUpCount);

    if (stationFollowUpCounts.length === 0) {
         dom.followUpCardsContainer.innerHTML = `
            <div class="col-span-full text-center p-5 card bg-emerald-50 border-emerald-200">
                <p class="font-semibold text-emerald-800">All required stations are complete!</p>
            </div>
        `;
         return;
    }

    dom.followUpCardsContainer.innerHTML = stationFollowUpCounts.map(createFollowUpStationCardHTML).join('');
}

export function renderSummaryTable(data) {
    const selectedGroup = document.querySelector('input[name="summary-group"]:checked').value;
    const groupByKey = selectedGroup === 'department' ? 'department' : 'affiliation';

    dom.summaryTableTitle.textContent = selectedGroup === 'department' ? 'Department Summary' : 'Affiliation Summary';
    dom.summaryGroupHeader.textContent = selectedGroup === 'department' ? 'Department' : 'Affiliation';

    if (!data || data.length === 0) {
        dom.summaryTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-500">No data to display.</td></tr>`;
        return;
    }

    const groupStats = data.reduce((acc, person) => {
        const groupName = person[groupByKey] || `Unspecified`;
        if (!acc[groupName]) {
            acc[groupName] = { total: 0, registered: 0 };
        }
        acc[groupName].total++;
        if (person.isRegistered) {
            acc[groupName].registered++;
        }
        return acc;
    }, {});

    const sortedGroups = Object.keys(groupStats).sort();
    dom.summaryTableBody.innerHTML = sortedGroups.map(groupName => createSummaryTableRowHTML(groupName, groupStats[groupName], groupByKey)).join('');
}

function createSummaryTableRowHTML(groupName, stats, groupByKey) {
    const notRegistered = stats.total - stats.registered;
    const percentage = stats.total > 0 ? (stats.registered / stats.total) * 100 : 0;

    return `
        <tr class="border-b border-slate-100">
            <td class="px-6 py-4 font-medium text-cyan-600 hover:underline cursor-pointer summary-data-clickable" data-group-by="${groupByKey}" data-group-name="${groupName}" data-status="name">${groupName}</td>
            <td class="px-6 py-4 text-center font-semibold text-cyan-600 hover:underline cursor-pointer summary-data-clickable" data-group-by="${groupByKey}" data-group-name="${groupName}" data-status="total">${stats.total}</td>
            <td class="px-6 py-4 text-center font-semibold text-emerald-600 hover:underline cursor-pointer summary-data-clickable" data-group-by="${groupByKey}" data-group-name="${groupName}" data-status="registered">${stats.registered}</td>
            <td class="px-6 py-4 text-center font-semibold text-rose-600 hover:underline cursor-pointer summary-data-clickable" data-group-by="${groupByKey}" data-group-name="${groupName}" data-status="not-registered">${notRegistered}</td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                    <div class="w-full bg-slate-200 rounded-full h-2">
                        <div class="bg-gradient-to-r from-sky-500 to-cyan-500 h-2 rounded-full" style="width: ${percentage.toFixed(2)}%"></div>
                    </div>
                    <span class="text-xs font-semibold text-slate-600 w-12 text-right">${percentage.toFixed(1)}%</span>
                </div>
            </td>
        </tr>`;
}

function createStationCardHTML(station) {
    const incompleteCount = station.total - station.completed;
    const percentage = station.total > 0 ? (station.completed / station.total) * 100 : 0;
    return `
    <div class="station-card card p-4 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between" data-station-key="${station.key}">
        <div>
            <div class="flex items-center space-x-3 mb-3">
                <div class="bg-cyan-100 text-cyan-600 p-2 rounded-lg">${station.icon}</div>
                <p class="font-bold text-slate-800">${station.name}</p>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2 mb-2">
                <div class="bg-gradient-to-r from-sky-500 to-cyan-500 h-2 rounded-full" style="width: ${percentage.toFixed(2)}%"></div>
            </div>
            <p class="text-right text-sm font-semibold text-slate-600 mb-4">${percentage.toFixed(1)}%</p>
        </div>
        <div class="border-t border-slate-100 pt-3 flex justify-between items-center text-sm">
            <div class="flex space-x-4">
                <div data-status="completed" class="station-data-point cursor-pointer hover:opacity-70 transition-opacity">
                    <span class="text-xs text-slate-500">Checked</span>
                    <p class="font-bold text-lg text-emerald-600">${station.completed}</p>
                </div>
                <div data-status="incomplete" class="station-data-point cursor-pointer hover:opacity-70 transition-opacity">
                    <span class="text-xs text-slate-500">Unchecked</span>
                    <p class="font-bold text-lg text-rose-600">${incompleteCount}</p>
                </div>
            </div>
            <div>
                <span class="text-xs text-slate-500">Total</span>
                <p class="font-bold text-lg text-slate-700">${station.total}</p>
            </div>
        </div>
    </div>`;
}

export function populateFilters(processedData) {
    const getUniqueSortedValues = (key) => [...new Set(processedData.map(p => p[key]).filter(Boolean))].sort();
    const createOptions = (arr, el, label) => {
        el.innerHTML = `<option value="all">All ${label}</option>${arr.map(item => `<option value="${item}">${item}</option>`).join('')}`;
    };
    createOptions(getUniqueSortedValues('department'), dom.departmentFilter, 'Departments');
    createOptions(getUniqueSortedValues('position'), dom.positionFilter, 'Positions');
    createOptions(getUniqueSortedValues('affiliation'), dom.affiliationFilter, 'Affiliations');
}

export function showDataModal(title, data, columns) {
    dom.modalTitle.textContent = title;
    dom.modalTableHead.innerHTML = `<tr>${columns.map(c => `<th scope="col" class="px-6 py-3">${c.name}</th>`).join('')}</tr>`;
    renderModalTableBody(data, columns.map(c => c.key));
    dom.dataModal.classList.remove('hidden');
}

export function renderModalTableBody(data, columnKeys) {
    if (data.length === 0) {
        dom.modalTableBody.innerHTML = `<tr><td colspan="${columnKeys.length}" class="text-center py-8 text-slate-500">No matching data found.</td></tr>`;
        return;
    }
    dom.modalTableBody.innerHTML = data.map(row => `
        <tr class="bg-white border-b hover:bg-slate-50">
            ${columnKeys.map(key => `<td class="px-6 py-4">${row[key] || ''}</td>`).join('')}
        </tr>`).join('');
}

export function showIndividualDetailModal(person, stationsConfig) {
    dom.individualModalTitle.textContent = `Details for ${person.name}`;

    const checkIcon = `<svg class="w-5 h-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    const xIcon = `<svg class="w-5 h-5 text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;

    const statusBadge = (status) => {
        switch (status) {
            case 'ตรวจครบ': return `<span class="px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-100 rounded-full">Complete</span>`;
            case 'ตรวจไม่ครบ': return `<span class="px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-100 rounded-full">Incomplete</span>`;
            case 'ยังไม่ลงทะเบียน': return `<span class="px-2.5 py-1 text-xs font-medium text-rose-800 bg-rose-100 rounded-full">Not Registered</span>`;
            default: return '';
        }
    };

    let stationsHtml = '<ul class="space-y-3">';
    if (person.requiredStations.length > 0) {
        person.requiredStations.forEach(stationKey => {
            const station = stationsConfig.find(s => s.key === stationKey);
            if (station) {
                stationsHtml += `
                    <li class="flex items-center justify-between">
                        <span class="flex items-center space-x-3">
                            <span class="text-cyan-500">${station.icon}</span>
                            <span>${station.name}</span>
                        </span>
                        ${person.stations[stationKey] ? checkIcon : xIcon}
                    </li>`;
            }
        });
    } else {
        stationsHtml += `<li class="text-sm text-slate-500">No specific stations were required.</li>`;
    }
    stationsHtml += '</ul>';

    dom.individualModalContent.innerHTML = `
        <div class="space-y-6">
            <div>
                <div class="flex justify-between items-start">
                     <h3 class="text-lg font-semibold text-slate-800">${person.name}</h3>
                     ${statusBadge(person.status)}
                </div>
                <p class="text-sm text-slate-500">ID: ${person.id} | HN: ${person.hn}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div class="bg-slate-50 p-3 rounded-lg"><p class="text-slate-500">Department</p><p class="font-semibold text-slate-700">${person.department || '-'}</p></div>
                 <div class="bg-slate-50 p-3 rounded-lg"><p class="text-slate-500">Position</p><p class="font-semibold text-slate-700">${person.position || '-'}</p></div>
                 <div class="bg-slate-50 p-3 rounded-lg"><p class="text-slate-500">Affiliation</p><p class="font-semibold text-slate-700">${person.affiliation || '-'}</p></div>
                 <div class="bg-slate-50 p-3 rounded-lg"><p class="text-slate-500">Registration</p><p class="font-semibold text-slate-700">${person.isRegistered ? `Registered on ${person.date}` : 'Not Registered'}</p></div>
            </div>
            <div><h4 class="font-semibold mb-3">Checkup Station Status</h4>${stationsHtml}</div>
        </div>`;
    dom.individualModal.classList.remove('hidden');
}