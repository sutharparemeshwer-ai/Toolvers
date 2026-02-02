// js/tools/calorie-counter.js

let log = [];
let goal = 2000;

function render() {
    const list = document.getElementById('food-list');
    list.innerHTML = '';
    
    let total = 0;
    
    log.forEach((item, i) => {
        total += item.cals;
        const li = document.createElement('li');
        li.className = 'list-group-item bg-transparent border-white-10 text-white d-flex justify-content-between align-items-center px-0';
        li.innerHTML = `
            <span>${item.name}</span>
            <div>
                <span class="badge bg-white-5 text-white me-2">${item.cals} kcal</span>
                <button class="btn btn-sm btn-link text-danger p-0" onclick="window.delCal(${i})">&times;</button>
            </div>
        `;
        list.appendChild(li);
    });

    // Update Progress
    const pct = Math.min((total / goal) * 100, 100);
    document.getElementById('progress-bar').style.width = `${pct}%`;
    document.getElementById('consumed-text').textContent = `${total} kcal`;
    document.getElementById('remaining-text').textContent = `${goal - total} left`;
}

function add(e) {
    e.preventDefault();
    const name = document.getElementById('food-name').value;
    const cals = parseInt(document.getElementById('food-cals').value);
    
    if(name && cals) {
        log.push({ name, cals });
        render();
        e.target.reset();
        document.getElementById('food-name').focus();
    }
}

window.delCal = (i) => {
    log.splice(i, 1);
    render();
};

export function init() {
    document.getElementById('add-food-form').addEventListener('submit', add);
    render();
}
export function cleanup() {
    window.delCal = undefined;
}
