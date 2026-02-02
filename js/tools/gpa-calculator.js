// js/tools/gpa-calculator.js

let courses = [];
const STORE_KEY = 'toolverse_gpa_v2';

function load() {
    courses = JSON.parse(localStorage.getItem(STORE_KEY)) || [];
    render();
}

function save() {
    localStorage.setItem(STORE_KEY, JSON.stringify(courses));
    render();
}

function render() {
    const list = document.getElementById('course-list');
    list.innerHTML = '';
    
    let totalPoints = 0;
    let totalCreds = 0;

    courses.forEach((c, i) => {
        totalPoints += (c.grade * c.credits);
        totalCreds += c.credits;

        const row = document.createElement('div');
        row.className = 'd-flex align-items-center p-3 border-bottom border-white-10 text-white hover-bg-white-5';
        row.innerHTML = `
            <div style="width: 40%" class="fw-bold text-truncate pe-2">${c.name}</div>
            <div style="width: 20%">${c.credits}</div>
            <div style="width: 20%">${c.grade}</div>
            <div style="width: 20%" class="text-end">
                <button class="btn btn-sm btn-link text-danger p-0" onclick="window.delCourse(${i})"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `;
        list.appendChild(row);
    });

    const gpa = totalCreds ? (totalPoints / totalCreds).toFixed(2) : '0.00';
    document.getElementById('gpa-display').textContent = gpa;
}

function add(e) {
    e.preventDefault();
    const name = document.getElementById('c-name').value || 'Course';
    const credits = parseFloat(document.getElementById('c-credits').value);
    const grade = parseFloat(document.getElementById('c-grade').value);

    if (credits > 0) {
        courses.push({ name, credits, grade });
        save();
        document.getElementById('c-name').value = '';
    }
}

window.delCourse = (i) => {
    courses.splice(i, 1);
    save();
};

export function init() {
    document.getElementById('add-form').addEventListener('submit', add);
    document.getElementById('clear-btn').addEventListener('click', () => {
        if(confirm('Clear all?')) {
            courses = [];
            save();
        }
    });
    load();
}

export function cleanup() {
    window.delCourse = undefined;
}
