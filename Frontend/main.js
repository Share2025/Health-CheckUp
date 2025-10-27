// frontend/main.js
import { STATIONS_CONFIG } from './config.js';
import * as ui from './ui.js';
import * as data from './dataProcessor.js';
import { debounce } from './utils.js';

// --- Application State ---
let state = {
    isAdminLoggedIn: false,
    authToken: null,
    processedData: [],
    followupData: [],
    currentActiveStations: [],
    modalDataCache: [],
    modalColumnCache: [],
    currentCompany: null,
};

let currentLinkCompany = null;
const API_BASE_URL = 'http://localhost:3000';

// --- Helper for API calls ---
async function fetchAPI(endpoint, options = {}) {
    const headers = { ...options.headers };
    if (state.authToken) {
        headers['Authorization'] = `Bearer ${state.authToken}`;
    }

    // For file uploads, don't set Content-Type, browser will do it
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    
    if (response.status === 204) { // No Content
        return;
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
}

// --- Backend API Interaction ---

async function createCompany(companyName) {
    try {
        await fetchAPI('/company', {
            method: 'POST',
            body: JSON.stringify({ companyName })
        });
        await setupInitialView();
        await handleCompanySelection(companyName);
    } catch (error) {
        ui.showToast(error.message, 'error');
    }
}

async function handleFileUpload(file) {
    if (!file) return;
    ui.showLoading(true);
    
    const formData = new FormData();
    formData.append('excel-file', file);
    formData.append('companyName', state.currentCompany);

    try {
        const result = await fetchAPI('/upload', {
            method: 'POST',
            body: formData,
        });

        const processedResult = result.data;
        state.processedData = processedResult.processedData;
        state.currentActiveStations = processedResult.activeStations;
        
        renderFullDashboard();
        showDashboardView(true);
        ui.showToast("File processed and saved successfully!", "success");
    } catch (error) {
        ui.showToast(error.message, "error");
        console.error(error);
        // Don't hide dashboard if there was previous data
        showDashboardView(state.processedData.length > 0);
    } finally {
        ui.showLoading(false);
    }
}

async function loadCompanyData(companyName) {
    ui.showLoading(true);
    try {
        const savedData = await fetchAPI(`/company/${companyName}`);
        state.processedData = savedData.processedData || [];
        state.currentActiveStations = savedData.activeStations || [];
        renderFullDashboard();
    } catch (e) {
        ui.showToast("Failed to load data. Is the backend server running?", "error");
        console.error(e);
        state.processedData = [];
        state.currentActiveStations = [];
        renderFullDashboard(); // Render an empty dashboard
    } finally {
        ui.showLoading(false);
    }
}


// --- UI Navigation and State ---

async function handleCompanySelection(companyName) {
    state.currentCompany = companyName;
    ui.dom.companyDisplayName.textContent = companyName;
    ui.dom.companyContainer.classList.add('hidden');
    ui.dom.companyDisplay.classList.remove('hidden');
    await loadCompanyData(companyName);
}

function handleReturnToCompanySelection() {
    state = { ...state, processedData: [], followupData: [], currentActiveStations: [], currentCompany: null };
    window.history.pushState({}, '', window.location.pathname);
    ui.resetDashboardUI();
    setupInitialView();
}

async function handleLogin(username, password) {
    const loginError = document.getElementById('login-error');
    try {
        const result = await fetchAPI('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (result.success) {
            state.authToken = result.token;
            sessionStorage.setItem('authToken', result.token);
            document.getElementById('login-modal').classList.add('hidden');
            loginError.classList.add('hidden');
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            ui.showToast('Login successful', 'success');
            initApp();
        }
    } catch (error) {
        loginError.textContent = error.message;
        loginError.classList.remove('hidden');
    }
}

function handleLogout() {
    sessionStorage.removeItem('authToken');
    state.authToken = null;
    state.isAdminLoggedIn = false;
    ui.showToast('You have been logged out', 'info');
    window.location.href = window.location.pathname;
}

function renderFullDashboard() {
    if (!state.processedData || state.processedData.length === 0) {
        showDashboardView(false);
        ui.renderFollowUpCards([], []);
        return;
    }
    ui.populateFilters(state.processedData);
    ui.renderOverviewTab(state.processedData);
    ui.renderStationTab(state.processedData, state.currentActiveStations);

    state.followupData = state.processedData
        .filter(p => p.status === 'ตรวจไม่ครบ')
        .map(p => ({
            id: p.id, name: p.name, department: p.department,
            uncompleted: Array.isArray(p.uncompletedStations) ? p.uncompletedStations.join(', ') : '',
            note: p.note
        }));

    ui.renderFollowUpTable(state.followupData);
    ui.renderFollowUpCards(state.followupData, state.currentActiveStations);

    showDashboardView(true);
    document.querySelector('.tab-button[data-tab="overview"]').click();
}

function showDashboardView(hasData) {
    ui.dom.uploadContainer.classList.toggle('hidden', hasData);
    ui.dom.mainContent.classList.toggle('hidden', !hasData);
    ui.dom.mainSearchContainer.classList.toggle('hidden', !hasData);
    ui.dom.headerActions.classList.remove('hidden');
    ui.dom.uploadNewFileBtn.classList.toggle('hidden', !state.isAdminLoggedIn || !hasData);
    if (!hasData && state.isAdminLoggedIn) {
        ui.dom.uploadUi.classList.remove('hidden');
        ui.dom.uploadMessage.classList.add('hidden');
    }
}

// --- Shareable Link Logic ---

async function handleManageLink(companyName) {
    try {
        const { shareToken } = await fetchAPI(`/company/${companyName}/token`);
        const link = `${window.location.origin}${window.location.pathname}?company_token=${shareToken}`;
        
        ui.dom.shareLinkCompanyName.textContent = companyName;
        ui.dom.shareableLinkInput.value = link;
        ui.dom.shareLinkModal.classList.remove('hidden');
    } catch (error) {
        ui.showToast(error.message, 'error');
    }
}

function handleCopyLink() {
    ui.dom.shareableLinkInput.select();
    document.execCommand('copy');
    ui.showToast("Link copied to clipboard!", "success");
}

async function handleRegenerateLink() {
    if (!currentLinkCompany) return;
    if (confirm(`Are you sure you want to regenerate the link for "${currentLinkCompany}"? The old link will stop working.`)) {
        try {
            const { shareToken } = await fetchAPI(`/company/${currentLinkCompany}/token`, { method: 'PUT' });
            const newLink = `${window.location.origin}${window.location.pathname}?company_token=${shareToken}`;
            ui.dom.shareableLinkInput.value = newLink;
            ui.showToast("Link has been regenerated.", "success");
        } catch (error) {
            ui.showToast(error.message, 'error');
        }
    }
}

// --- Delegated Click Handlers (No changes needed in this section) ---
// ... (The entire section from handleOverviewClicks to handleFollowUpCardClick remains the same)
function handleOverviewClicks(e) {
    const card = e.target.closest('.info-card[id$="-card"]');
    if (card) {
        handleOverviewCardClick(card.id);
        return;
    }
    const summaryCell = e.target.closest('.summary-data-clickable');
    if (summaryCell) {
        handleSummaryTableClick(summaryCell.dataset);
    }
}

function handleOverviewCardClick(cardId) {
    let data, title, columns;
    const baseColumns = [
        { key: 'id', name: 'Employee ID' }, { key: 'name', name: 'Name' }, { key: 'department', name: 'Department' },
    ];
    switch (cardId) {
        case 'total-card':
            data = state.processedData;
            title = 'All Employees with Checkup Data';
            columns = [...baseColumns, { key: 'status', name: 'Status' }];
            break;
        case 'registered-card':
            data = state.processedData.filter(p => p.isRegistered);
            title = 'Registered Employees';
            columns = [...baseColumns, { key: 'date', name: 'Date' }, { key: 'time', name: 'Time' }];
            break;
        case 'not-registered-card':
            data = state.processedData.filter(p => !p.isRegistered);
            title = 'Unregistered Employees';
            columns = baseColumns;
            break;
        case 'incomplete-card':
            data = state.processedData.filter(p => p.status === 'ตรวจไม่ครบ').map(p => ({ ...p, uncompletedStations: p.uncompletedStations.join(', ') }));
            title = 'Incomplete Checkups';
            columns = [...baseColumns, { key: 'uncompletedStations', name: 'Incomplete Items' }, { key: 'note', name: 'Note' }];
            break;
    }
    if (data) {
        state.modalDataCache = data;
        state.modalColumnCache = columns.map(c => c.key);
        ui.showDataModal(title, data, columns);
    }
}

function handleSummaryTableClick({ groupBy, groupName, status }) {
    let data, title;
    const columns = [
        { key: 'id', name: 'Employee ID' }, { key: 'name', name: 'Name' },
        { key: 'position', name: 'Position' }, { key: 'status', name: 'Checkup Status' }
    ];
    const groupData = (groupName === 'Unspecified')
        ? state.processedData.filter(p => !p[groupBy] || p[groupBy].trim() === '')
        : state.processedData.filter(p => p[groupBy] === groupName);
    switch (status) {
        case 'name': case 'total': data = groupData; title = `All Employees in: ${groupName}`; break;
        case 'registered': data = groupData.filter(p => p.isRegistered); title = `Registered Employees in: ${groupName}`; break;
        case 'not-registered': data = groupData.filter(p => !p.isRegistered); title = `Unregistered Employees in: ${groupName}`; break;
    }
    if (data) {
        state.modalDataCache = data;
        state.modalColumnCache = columns.map(c => c.key);
        ui.showDataModal(title, data, columns);
    }
}

function handleStationCardClicks(e) {
    const stationCard = e.target.closest('.station-card');
    const dataPoint = e.target.closest('.station-data-point');
    if (!stationCard || !dataPoint) return;

    const stationKey = stationCard.dataset.stationKey;
    const status = dataPoint.dataset.status;
    const stationConfig = state.currentActiveStations.find(s => s.key === stationKey);
    if (!stationConfig) return;

    let filteredData = [...state.processedData];
    // Apply main filters from Station tab
    const filters = { department: ui.dom.departmentFilter.value, position: ui.dom.positionFilter.value, affiliation: ui.dom.affiliationFilter.value };
    if (filters.department !== 'all') filteredData = filteredData.filter(p => p.department === filters.department);
    if (filters.position !== 'all') filteredData = filteredData.filter(p => p.position === filters.position);
    if (filters.affiliation !== 'all') filteredData = filteredData.filter(p => p.affiliation === filters.affiliation);

    let finalData, title;
    const columns = [{ key: 'id', name: 'Employee ID' }, { key: 'name', name: 'Name' }, { key: 'department', name: 'Department' }];

    if (status === 'completed') {
        finalData = filteredData.filter(p => p.stations[stationKey]);
        title = `${stationConfig.name} - Checked`;
    } else {
        finalData = filteredData.filter(p => p.requiredStations.includes(stationKey) && !p.stations[stationKey]);
        title = `${stationConfig.name} - Unchecked`;
    }

    state.modalDataCache = finalData;
    state.modalColumnCache = columns.map(c => c.key);
    ui.showDataModal(title, finalData, columns);
}

function handleFollowUpCardClick(e) {
    const card = e.target.closest('.followup-card-clickable');
    if (!card) return;
    const { stationName } = card.dataset;
    const data = state.followupData.filter(person => person.uncompleted.includes(stationName));
    const title = `Follow-Up for: ${stationName}`;
    const columns = [
        { key: 'id', name: 'Employee ID' }, { key: 'name', name: 'Name' },
        { key: 'department', name: 'Department' }, { key: 'note', name: 'Note' },
    ];
    state.modalDataCache = data;
    state.modalColumnCache = columns.map(c => c.key);
    ui.showDataModal(title, data, columns);
}


// --- Event Listener Setup ---
function setupEventListeners() {
    document.getElementById('company-submit-btn').addEventListener('click', () => {
        const companyName = document.getElementById('company-name-input').value.trim();
        if (companyName) {
            createCompany(companyName);
            document.getElementById('company-name-input').value = '';
        } else {
            ui.showToast("Please enter a company name.", "error");
        }
    });

    ui.dom.savedCompaniesList.addEventListener('click', async (e) => {
        const selectBtn = e.target.closest('.saved-company-btn');
        if (selectBtn) return handleCompanySelection(selectBtn.dataset.company);

        const deleteBtn = e.target.closest('.delete-company-btn');
        if (deleteBtn && state.isAdminLoggedIn) {
            const companyToDelete = deleteBtn.dataset.company;
            if (confirm(`Are you sure you want to delete "${companyToDelete}" and all its data? This cannot be undone.`)) {
                try {
                    await fetchAPI(`/company/${companyToDelete}`, { method: 'DELETE' });
                    ui.showToast(`Company "${companyToDelete}" deleted.`, 'success');
                    setupInitialView();
                } catch (error) {
                    ui.showToast(error.message, 'error');
                }
            }
        }
        
        const manageBtn = e.target.closest('.manage-link-btn');
        if (manageBtn && state.isAdminLoggedIn) {
            currentLinkCompany = manageBtn.dataset.company;
            handleManageLink(currentLinkCompany);
        }
    });

    // --- The rest of the event listeners are mostly unchanged ---
    const fileInput = document.getElementById('excel-file');
    fileInput.addEventListener('change', (e) => { handleFileUpload(e.target.files[0]); e.target.value = ''; });
    const uploadArea = ui.dom.uploadContainer;
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); e.currentTarget.classList.add('bg-cyan-50', 'border-cyan-500'); });
    uploadArea.addEventListener('dragleave', (e) => { e.preventDefault(); e.currentTarget.classList.remove('bg-cyan-50', 'border-cyan-500'); });
    uploadArea.addEventListener('drop', (e) => { e.preventDefault(); e.currentTarget.classList.remove('bg-cyan-50', 'border-cyan-500'); handleFileUpload(e.dataTransfer.files[0]); });
    document.getElementById('cancel-upload-btn').addEventListener('click', handleReturnToCompanySelection);
    document.getElementById('change-company-btn').addEventListener('click', handleReturnToCompanySelection);
    ui.dom.uploadNewFileBtn.addEventListener('click', () => showDashboardView(false));

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('tab-active'));
            e.currentTarget.classList.add('tab-active');
            document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.toggle('hidden', panel.id !== e.currentTarget.dataset.tab));
        });
    });

    const stationFilterHandler = debounce(() => {
        ui.renderStationTab(state.processedData, state.currentActiveStations, {
            search: document.getElementById('station-search').value,
            department: ui.dom.departmentFilter.value,
            position: ui.dom.positionFilter.value,
            affiliation: ui.dom.affiliationFilter.value,
        });
    });
    document.getElementById('station-search').addEventListener('keyup', stationFilterHandler);
    ['department-filter', 'position-filter', 'affiliation-filter'].forEach(id => document.getElementById(id).addEventListener('change', stationFilterHandler));

    document.getElementById('followup-search').addEventListener('keyup', debounce((e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = state.followupData.filter(p => p.name.toLowerCase().includes(searchTerm) || String(p.id).toLowerCase().includes(searchTerm) || p.department.toLowerCase().includes(searchTerm));
        ui.renderFollowUpTable(filtered);
    }));

    document.getElementById('individual-search').addEventListener('keyup', debounce((e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const resultsContainer = ui.dom.individualSearchResultsContainer;
        resultsContainer.innerHTML = '';
        if (searchTerm.length < 2) return;
        const results = state.processedData.filter(p => p.name.toLowerCase().includes(searchTerm) || String(p.id).toLowerCase().includes(searchTerm) || String(p.hn).toLowerCase().includes(searchTerm)).slice(0, 5);
        if (results.length > 0) {
            resultsContainer.innerHTML = `<div class="card mt-1 overflow-hidden">${results.map(p => `<div class="p-3 border-t border-slate-200 hover:bg-slate-100 cursor-pointer individual-result-item" data-person-id="${p.id}"><p class="font-semibold text-slate-800">${p.name}</p><p class="text-sm text-slate-500">ID: ${p.id} | Department: ${p.department}</p></div>`).join('')}</div>`;
        } else {
            resultsContainer.innerHTML = `<div class="card mt-1 p-3 text-sm text-slate-500">No results found.</div>`;
        }
    }, 300));

    ui.dom.individualSearchResultsContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.individual-result-item');
        if (item) {
            const personId = item.dataset.personId;
            const personData = state.processedData.find(p => String(p.id) === personId);
            if (personData) {
                ui.showIndividualDetailModal(personData, STATIONS_CONFIG);
                document.getElementById('individual-search').value = '';
                ui.dom.individualSearchResultsContainer.innerHTML = '';
            }
        }
    });

    document.getElementById('overview').addEventListener('click', handleOverviewClicks);
    document.getElementById('overview').addEventListener('change', (e) => { if (e.target.name === 'summary-group') ui.renderSummaryTable(state.processedData); });
    ui.dom.stationCardsContainer.addEventListener('click', handleStationCardClicks);
    ui.dom.followUpCardsContainer.addEventListener('click', handleFollowUpCardClick);

    const closeModal = () => { ui.dom.dataModal.classList.add('hidden'); ui.dom.individualModal.classList.add('hidden'); ui.dom.shareLinkModal.classList.add('hidden'); };
    [...document.querySelectorAll('#modal-close, #modal-close-footer, #individual-modal-close, #individual-modal-close-footer, #share-link-modal-close')].forEach(btn => btn.addEventListener('click', closeModal));
    document.getElementById('copy-link-btn').addEventListener('click', handleCopyLink);
    document.getElementById('regenerate-link-btn').addEventListener('click', handleRegenerateLink);
    
    document.getElementById('modal-search').addEventListener('keyup', debounce((e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = state.modalDataCache.filter(item => state.modalColumnCache.some(key => String(item[key] || '').toLowerCase().includes(searchTerm)));
        ui.renderModalTableBody(filtered, state.modalColumnCache);
    }, 300));

    document.getElementById('export-button').addEventListener('click', () => {
        if (state.followupData.length === 0) ui.showToast('There is no follow-up data to export.', 'info');
        else data.exportFollowUpData(state.followupData, state.currentCompany);
    });
    
    document.getElementById('export-all-data-btn').addEventListener('click', () => {
        if (state.processedData.length === 0) ui.showToast('There is no data to export.', 'info');
        else data.exportAllData(state.processedData, state.currentActiveStations, state.currentCompany);
    });

    ui.dom.adminLoginPromptBtn.addEventListener('click', () => document.getElementById('login-modal').classList.remove('hidden'));
    document.getElementById('login-modal-close').addEventListener('click', () => document.getElementById('login-modal').classList.add('hidden'));
    document.getElementById('login-form').addEventListener('submit', (e) => { e.preventDefault(); handleLogin(document.getElementById('username').value, document.getElementById('password').value); });
    ui.dom.logoutBtn.addEventListener('click', handleLogout);
}

// --- App Initialization ---
async function checkForShareLink() {
    // This part can be expanded to fetch read-only data using a token
    return false; 
}

async function setupInitialView() {
    ui.setupView(state.isAdminLoggedIn);
    try {
        const companies = await fetchAPI('/companies');
        ui.loadSavedCompanies(companies, state.isAdminLoggedIn);
    } catch (error) {
        console.error("Failed to load companies from backend:", error);
        ui.showToast("Could not load company list from server.", "error");
        ui.loadSavedCompanies([], state.isAdminLoggedIn);
    }
}

async function initApp() {
    const token = sessionStorage.getItem('authToken');
    state.authToken = token;
    state.isAdminLoggedIn = !!token; // Set to true if token exists
    
    ui.resetDashboardUI();
    const inViewerMode = await checkForShareLink();
    if (!inViewerMode) {
        await setupInitialView();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initApp();
});