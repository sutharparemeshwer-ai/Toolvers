// js/tools/workout-planner.js

// --- DOM Elements ---
let planGridEl, form, modalInstance, clearPlanBtn;

// --- State ---
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
let workoutPlan = {};
const STORAGE_KEY = 'workoutPlannerData';

// --- Local Storage Functions ---
const loadPlan = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    workoutPlan = stored ? JSON.parse(stored) : {};
    // Ensure all days exist in the plan
    DAYS.forEach(day => {
        if (!workoutPlan[day]) {
            workoutPlan[day] = [];
        }
    });
};

const savePlan = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workoutPlan));
};

// --- Rendering Functions ---

const renderPlan = () => {
    planGridEl.innerHTML = '';

    DAYS.forEach(day => {
        const dayCard = document.createElement('div');
        dayCard.className = 'col-lg col-md-4 col-sm-6';
        
        const exercises = workoutPlan[day];
        let exercisesHtml = '<p class="text-muted small">Rest Day</p>';
        if (exercises.length > 0) {
            exercisesHtml = exercises.map((ex, index) => `
                <li class="list-group-item workout-exercise">
                    <div>
                        <strong>${ex.name}</strong>
                        <small class="text-muted d-block">${ex.sets ? `${ex.sets} sets` : ''} ${ex.reps ? `x ${ex.reps} reps` : ''}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-danger delete-exercise-btn" data-day="${day}" data-index="${index}">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </li>
            `).join('');
        }

        dayCard.innerHTML = `
            <div class="card h-100 workout-day-card">
                <div class="card-header text-center fw-bold">${day}</div>
                <ul class="list-group list-group-flush">
                    ${exercisesHtml}
                </ul>
            </div>
        `;
        planGridEl.appendChild(dayCard);
    });
};

// --- Event Handlers ---

const handleFormSubmit = (event) => {
    event.preventDefault();
    const day = form.querySelector('#exercise-day').value;
    const name = form.querySelector('#exercise-name').value.trim();
    const sets = form.querySelector('#exercise-sets').value;
    const reps = form.querySelector('#exercise-reps').value.trim();

    if (!day || !name) {
        alert('Please select a day and enter an exercise name.');
        return;
    }

    workoutPlan[day].push({ name, sets, reps });
    savePlan();
    renderPlan();
    modalInstance.hide();
    form.reset();
};

const handleGridClick = (event) => {
    const target = event.target.closest('.delete-exercise-btn');
    if (!target) return;

    const day = target.dataset.day;
    const index = parseInt(target.dataset.index);

    if (day && index >= 0) {
        workoutPlan[day].splice(index, 1);
        savePlan();
        renderPlan();
    }
};

const handleClearPlan = () => {
    if (confirm('Are you sure you want to delete your entire workout plan? This cannot be undone.')) {
        DAYS.forEach(day => {
            workoutPlan[day] = [];
        });
        savePlan();
        renderPlan();
    }
};

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    planGridEl = document.getElementById('workout-plan-grid');
    form = document.getElementById('exercise-form');
    clearPlanBtn = document.getElementById('clear-plan-btn');
    const modalEl = document.getElementById('exercise-form-modal');
    modalInstance = new bootstrap.Modal(modalEl);

    // Load data and render
    loadPlan();
    renderPlan();

    // Attach event listeners
    form.addEventListener('submit', handleFormSubmit);
    planGridEl.addEventListener('click', handleGridClick);
    clearPlanBtn.addEventListener('click', handleClearPlan);
}

export function cleanup() {
    // Remove event listeners
    form.removeEventListener('submit', handleFormSubmit);
    planGridEl.removeEventListener('click', handleGridClick);
    clearPlanBtn.removeEventListener('click', handleClearPlan);

    if (modalInstance) {
        modalInstance.dispose();
    }
}