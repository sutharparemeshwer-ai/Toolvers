// js/tools/calorie-counter.js

// --- DOM Elements ---
let goalInput, progressBar, addFoodForm, foodNameInput, foodCaloriesInput, foodLogList, emptyLogMessage, chartCanvas;

// --- State ---
let calorieGoal = 2000;
let foodLog = [];
let dailyTotals = {}; // For the chart
let chartInstance = null;
const STORAGE_KEY = 'calorieCounterData';
const CHART_JS_CDN = 'https://cdn.jsdelivr.net/npm/chart.js';

// --- Helper Functions ---

const getTodayDateString = () => new Date().toISOString().split('T')[0];

function loadScript(url) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.head.appendChild(script);
    });
}

// --- Local Storage Functions ---

const loadData = () => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        const data = JSON.parse(storedData);
        calorieGoal = data.goal || 2000;
        dailyTotals = data.dailyTotals || {};

        // If the stored log is not for today, archive its total and clear it.
        if (data.logDate && data.logDate !== getTodayDateString()) {
            const previousDayTotal = data.log.reduce((sum, item) => sum + item.calories, 0);
            if (previousDayTotal > 0) {
                dailyTotals[data.logDate] = previousDayTotal;
            }
            foodLog = []; // Start fresh for the new day
        } else {
            foodLog = data.log || [];
        }
    }
    // Prune old data from dailyTotals (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    for (const date in dailyTotals) {
        if (new Date(date) < thirtyDaysAgo) {
            delete dailyTotals[date];
        }
    }
};

const saveData = () => {
    const dataToSave = {
        goal: calorieGoal,
        logDate: getTodayDateString(),
        log: foodLog,
        dailyTotals: dailyTotals
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
};

// --- Rendering Functions ---

const updateUI = () => {
    goalInput.value = calorieGoal;

    // Update food log list
    foodLogList.innerHTML = '';
    if (foodLog.length === 0) {
        emptyLogMessage.classList.remove('d-none');
        foodLogList.appendChild(emptyLogMessage);
    } else {
        emptyLogMessage.classList.add('d-none');
        foodLog.forEach(item => {
            const listItem = document.createElement('div');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                <span>${item.name}</span>
                <div>
                    <span class="badge bg-primary rounded-pill me-2">${item.calories} kcal</span>
                    <button class="btn btn-sm btn-outline-danger delete-food-btn" data-id="${item.id}">&times;</button>
                </div>
            `;
            foodLogList.appendChild(listItem);
        });
    }

    // Update progress bar
    const totalCalories = foodLog.reduce((sum, item) => sum + item.calories, 0);
    const percentage = calorieGoal > 0 ? (totalCalories / calorieGoal) * 100 : 0;

    progressBar.style.width = `${Math.min(percentage, 100)}%`;
    progressBar.textContent = `${totalCalories} / ${calorieGoal} kcal`;
    progressBar.setAttribute('aria-valuenow', totalCalories);
    progressBar.setAttribute('aria-valuemax', calorieGoal);

    // Change progress bar color if over the goal
    progressBar.classList.toggle('bg-danger', percentage > 100);
    renderChart();
};

// --- Event Handlers ---

const handleGoalChange = (event) => {
    const newGoal = parseInt(event.target.value);
    if (!isNaN(newGoal) && newGoal >= 0) {
        calorieGoal = newGoal;
        saveData();
        updateUI();
    }
};

const handleAddFood = (event) => {
    event.preventDefault();
    const name = foodNameInput.value.trim();
    const calories = parseInt(foodCaloriesInput.value);

    if (name && !isNaN(calories) && calories >= 0) {
        foodLog.push({ id: Date.now(), name, calories });
        saveData();
        updateUI();
        addFoodForm.reset();
        foodNameInput.focus();
    }
};

const handleDeleteFood = (event) => {
    const target = event.target.closest('.delete-food-btn');
    if (!target) return;

    const foodId = parseInt(target.dataset.id);
    foodLog = foodLog.filter(item => item.id !== foodId);
    saveData();
    updateUI();
};

// --- Chart Functions ---

const renderChart = () => {
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext('2d');

    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().split('T')[0];
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));

        if (dateString === getTodayDateString()) {
            data.push(foodLog.reduce((sum, item) => sum + item.calories, 0));
        } else {
            data.push(dailyTotals[dateString] || 0);
        }
    }

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Calories Consumed',
                data: data,
                backgroundColor: 'rgba(86, 202, 173, 0.5)',
                borderColor: 'rgba(86, 202, 173, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'var(--text-color)' },
                    grid: { color: 'var(--border-color)' }
                },
                x: {
                    ticks: { color: 'var(--text-color)' },
                    grid: { color: 'transparent' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
};

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    goalInput = document.getElementById('calorie-goal-input');
    progressBar = document.getElementById('calorie-progress-bar');
    addFoodForm = document.getElementById('add-food-form');
    foodNameInput = document.getElementById('food-name-input');
    foodCaloriesInput = document.getElementById('food-calories-input');
    foodLogList = document.getElementById('food-log-list');
    emptyLogMessage = document.getElementById('empty-log-message');
    chartCanvas = document.getElementById('calorie-chart');

    // Load data and render
    loadData();
    updateUI();

    // Attach event listeners
    goalInput.addEventListener('change', handleGoalChange);
    addFoodForm.addEventListener('submit', handleAddFood);
    foodLogList.addEventListener('click', handleDeleteFood);

    // Load Chart.js and render chart
    loadScript(CHART_JS_CDN).then(() => {
        renderChart();
    }).catch(err => {
        console.error(err);
        if (chartCanvas) chartCanvas.parentElement.innerHTML = '<p class="text-danger text-center">Could not load charting library.</p>';
    });
}

export function cleanup() {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
}