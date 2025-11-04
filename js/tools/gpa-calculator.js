// js/tools/gpa-calculator.js

// --- DOM Elements ---
let form, coursesList, emptyMsg, gpaResultEl, clearAllBtn, totalCreditsEl, totalPointsEl;

// --- State ---
let courses = [];
const STORAGE_KEY = 'gpaCalculatorCourses';

// --- Local Storage Functions ---
const loadCourses = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    courses = stored ? JSON.parse(stored) : [];
};

const saveCourses = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
};

// --- Core Logic ---

const calculateGPA = () => {
    if (courses.length === 0) {
        gpaResultEl.textContent = '0.00';
        totalCreditsEl.textContent = '0';
        totalPointsEl.textContent = '0.0';
        return;
    }

    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
        totalPoints += course.grade * course.credits;
        totalCredits += course.credits;
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    gpaResultEl.textContent = gpa;
    totalCreditsEl.textContent = totalCredits;
    totalPointsEl.textContent = totalPoints.toFixed(1);
};

// --- Rendering Functions ---

const renderCourses = () => {
    coursesList.innerHTML = '';
    if (courses.length === 0) {
        emptyMsg.classList.remove('d-none');
        coursesList.appendChild(emptyMsg);
    } else {
        emptyMsg.classList.add('d-none');
        courses.forEach(course => {
            const item = document.createElement('div');
            item.className = 'list-group-item d-flex justify-content-between align-items-center';
            item.innerHTML = `
                <div>
                    <strong>${course.name || 'Unnamed Course'}</strong>
                    <small class="text-muted"> - ${course.credits} credits, Grade: ${course.gradeText}</small>
                </div>
                <button class="btn btn-sm btn-outline-danger delete-course-btn" data-id="${course.id}">&times;</button>
            `;
            coursesList.appendChild(item);
        });
    }
    calculateGPA();
};

// --- Event Handlers ---

const handleAddCourse = (event) => {
    event.preventDefault();
    const name = form.querySelector('#course-name').value.trim();
    const credits = parseFloat(form.querySelector('#course-credits').value);
    const gradeSelect = form.querySelector('#course-grade');
    const grade = parseFloat(gradeSelect.value);
    const gradeText = gradeSelect.options[gradeSelect.selectedIndex].text;

    if (isNaN(credits) || credits <= 0) {
        alert('Please enter a valid number of credits.');
        return;
    }

    courses.push({ id: Date.now(), name, credits, grade, gradeText });
    saveCourses();
    renderCourses();
    form.reset();
};

const handleListClick = (event) => {
    if (event.target.closest('.delete-course-btn')) {
        const courseId = parseInt(event.target.closest('.delete-course-btn').dataset.id);
        courses = courses.filter(course => course.id !== courseId);
        saveCourses();
        renderCourses();
    }
};

const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all courses?')) {
        courses = [];
        saveCourses();
        renderCourses();
    }
};

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    form = document.getElementById('gpa-course-form');
    coursesList = document.getElementById('courses-list');
    emptyMsg = document.getElementById('empty-courses-msg');
    gpaResultEl = document.getElementById('gpa-result');
    clearAllBtn = document.getElementById('clear-all-courses-btn');
    totalCreditsEl = document.getElementById('total-credits-result');
    totalPointsEl = document.getElementById('total-points-result');

    // Load data and render
    loadCourses();
    renderCourses();

    // Attach event listeners
    form.addEventListener('submit', handleAddCourse);
    coursesList.addEventListener('click', handleListClick);
    clearAllBtn.addEventListener('click', handleClearAll);
}

export function cleanup() {
    // Event listeners are attached to elements that will be removed from the DOM,
    // so manual removal is not strictly necessary for this tool.
}