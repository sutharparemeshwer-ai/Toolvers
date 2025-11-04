// js/tools/job-application-tracker.js

// --- DOM Elements ---
let form, modalEl, modalInstance, tbody, emptyMessage, summaryStatsEl;

// --- State ---
let applications = [];
const STORAGE_KEY = 'jobApplicationsData';
const STATUSES = ['Applied', 'Interviewing', 'Offer', 'Rejected'];

// --- Local Storage Functions ---
const loadApplications = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    applications = stored ? JSON.parse(stored) : [];
};

const saveApplications = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
};

// --- Rendering Functions ---

const renderSummaryStats = () => {
    summaryStatsEl.innerHTML = '';
    STATUSES.forEach(status => {
        const count = applications.filter(app => app.status === status).length;
        const badgeClass = getStatusClass(status).replace('badge', 'badge-sm');
        summaryStatsEl.innerHTML += `
            <span class="badge ${badgeClass}">${status}: ${count}</span>
        `;
    });
};

const getStatusClass = (status) => {
    switch (status) {
        case 'Applied': return 'job-status-applied';
        case 'Interviewing': return 'job-status-interviewing';
        case 'Offer': return 'job-status-offer';
        case 'Rejected': return 'job-status-rejected';
        default: return 'bg-secondary';
    }
};

const renderTable = () => {
    tbody.innerHTML = '';
    if (applications.length === 0) {
        emptyMessage.classList.remove('d-none');
        return;
    }
    emptyMessage.classList.add('d-none');

    applications.sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied));

    applications.forEach(app => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${app.company}</td>
            <td>${app.position}</td>
            <td>${new Date(app.dateApplied).toLocaleDateString()}</td>
            <td><span class="badge ${getStatusClass(app.status)}">${app.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-light edit-btn" data-id="${app.id}"><i class="fa-solid fa-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${app.id}"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    renderSummaryStats();
};

// --- CRUD & Event Handlers ---

const handleFormSubmit = (event) => {
    event.preventDefault();
    const id = form.querySelector('#job-id').value;
    const newApplication = {
        id: id ? parseInt(id) : Date.now(),
        company: form.querySelector('#company-name').value.trim(),
        position: form.querySelector('#position-title').value.trim(),
        dateApplied: form.querySelector('#date-applied').value,
        status: form.querySelector('#application-status').value,
    };

    if (id) { // Editing existing
        const index = applications.findIndex(app => app.id === parseInt(id));
        applications[index] = newApplication;
    } else { // Adding new
        applications.push(newApplication);
    }

    saveApplications();
    renderTable();
    modalInstance.hide();
};

const handleTableClick = (event) => {
    const target = event.target.closest('button');
    if (!target) return;

    const id = parseInt(target.dataset.id);

    if (target.classList.contains('edit-btn')) {
        const app = applications.find(a => a.id === id);
        form.querySelector('#job-id').value = app.id;
        form.querySelector('#company-name').value = app.company;
        form.querySelector('#position-title').value = app.position;
        form.querySelector('#date-applied').value = app.dateApplied;
        form.querySelector('#application-status').value = app.status;
        document.getElementById('jobFormModalLabel').textContent = 'Edit Application';
        modalInstance.show();
    }

    if (target.classList.contains('delete-btn')) {
        if (confirm('Are you sure you want to delete this application?')) {
            applications = applications.filter(app => app.id !== id);
            saveApplications();
            renderTable();
        }
    }
};

const resetForm = () => {
    form.reset();
    form.querySelector('#job-id').value = '';
    document.getElementById('jobFormModalLabel').textContent = 'Add New Application';
    // Set default date to today
    form.querySelector('#date-applied').value = new Date().toISOString().split('T')[0];
};

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    form = document.getElementById('job-application-form');
    modalEl = document.getElementById('job-form-modal');
    tbody = document.getElementById('job-applications-tbody');
    emptyMessage = document.getElementById('empty-jobs-message');
    summaryStatsEl = document.getElementById('job-summary-stats');

    // Initialize Bootstrap Modal instance
    modalInstance = new bootstrap.Modal(modalEl);

    // Load data and render
    loadApplications();
    renderTable();

    // Attach event listeners
    form.addEventListener('submit', handleFormSubmit);
    tbody.addEventListener('click', handleTableClick);
    modalEl.addEventListener('hidden.bs.modal', resetForm);
}

export function cleanup() {
    // Remove event listeners
    form.removeEventListener('submit', handleFormSubmit);
    tbody.removeEventListener('click', handleTableClick);
    modalEl.removeEventListener('hidden.bs.modal', resetForm);

    // Dispose of the modal instance to prevent memory leaks
    if (modalInstance) {
        modalInstance.dispose();
    }
}