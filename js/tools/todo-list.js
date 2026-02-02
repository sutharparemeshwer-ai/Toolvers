// js/tools/todo-list.js

const STORAGE_KEY = 'toolverse_tasks_v2';
let tasks = [];
let currentFilter = 'all';

// DOM
let taskListEl, inputEl, addBtn, itemsLeftEl, emptyStateEl;
let clearCompletedBtn, clearAllBtn, filtersEl;

function loadTasks() {
    tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    render();
}

function addTask(text) {
    if(!text.trim()) return;
    tasks.unshift({
        id: Date.now(),
        text: text.trim(),
        completed: false
    });
    saveTasks();
    inputEl.value = '';
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if(task) {
        task.completed = !task.completed;
        saveTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
}

function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
}

function clearAll() {
    if(confirm('Delete all tasks?')) {
        tasks = [];
        saveTasks();
    }
}

function getFilteredTasks() {
    if(currentFilter === 'active') return tasks.filter(t => !t.completed);
    if(currentFilter === 'completed') return tasks.filter(t => t.completed);
    return tasks;
}

function render() {
    const filtered = getFilteredTasks();
    
    taskListEl.innerHTML = '';
    
    if(filtered.length === 0) {
        emptyStateEl.classList.remove('d-none');
    } else {
        emptyStateEl.classList.add('d-none');
        filtered.forEach(task => {
            const li = document.createElement('li');
            li.className = `list-group-item task-item d-flex align-items-center py-3 ${task.completed ? 'completed' : ''}`;
            li.draggable = true;
            li.dataset.id = task.id;
            
            li.innerHTML = `
                <div class="task-checkbox me-3 ${task.completed ? 'checked' : ''}" role="button"></div>
                <span class="task-text flex-grow-1">${task.text}</span>
                <button class="btn btn-sm text-danger delete-task-btn"><i class="fa-solid fa-trash"></i></button>
            `;
            
            // Event Listeners
            li.querySelector('.task-checkbox').addEventListener('click', () => toggleTask(task.id));
            li.querySelector('.delete-task-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(task.id);
            });
            
            // Drag Events
            li.addEventListener('dragstart', handleDragStart);
            li.addEventListener('dragover', handleDragOver);
            li.addEventListener('drop', handleDrop);
            li.addEventListener('dragenter', e => e.preventDefault());

            taskListEl.appendChild(li);
        });
    }
    
    // Update Stats
    const activeCount = tasks.filter(t => !t.completed).length;
    itemsLeftEl.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
}

// --- Drag & Drop Logic ---
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    e.dataTransfer.effectAllowed = 'move';
    this.style.opacity = '0.4';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    e.stopPropagation();
    draggedItem.style.opacity = '1';
    
    if (draggedItem !== this) {
        // Reorder array
        const draggedId = Number(draggedItem.dataset.id);
        const targetId = Number(this.dataset.id);
        
        const draggedIdx = tasks.findIndex(t => t.id === draggedId);
        const targetIdx = tasks.findIndex(t => t.id === targetId);
        
        // Move item
        const [removed] = tasks.splice(draggedIdx, 1);
        tasks.splice(targetIdx, 0, removed);
        
        saveTasks();
    }
    return false;
}


// --- Init ---
export function init() {
    taskListEl = document.getElementById('task-list');
    inputEl = document.getElementById('new-task-input');
    addBtn = document.getElementById('add-task-btn');
    itemsLeftEl = document.getElementById('items-left');
    emptyStateEl = document.getElementById('empty-state');
    clearCompletedBtn = document.getElementById('clear-completed-btn');
    clearAllBtn = document.getElementById('clear-all-btn');
    filtersEl = document.getElementById('task-filters');
    
    loadTasks();
    render();
    
    addBtn.addEventListener('click', () => addTask(inputEl.value));
    inputEl.addEventListener('keypress', e => { if(e.key === 'Enter') addTask(inputEl.value); });
    
    clearCompletedBtn.addEventListener('click', clearCompleted);
    clearAllBtn.addEventListener('click', clearAll);
    
    // Filters delegation
    filtersEl.addEventListener('click', (e) => {
        if(e.target.classList.contains('nav-link')) {
            e.preventDefault();
            // Remove active from all
            filtersEl.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            
            currentFilter = e.target.dataset.filter;
            render();
        }
    });
}

export function cleanup() {
    // Basic cleanup
}
