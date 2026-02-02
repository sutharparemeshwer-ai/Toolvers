// js/tools/kanban-board.js

let tasks = {};
const STORAGE_KEY = 'kanbanBoardTasks_v2';
let modalInstance;

function loadTasks() {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Add default tasks if empty for demo
    if (!stored) {
        tasks = { 
            todo: [{id: 1, text: "Explore ToolVerse features"}, {id: 2, text: "Test Drag & Drop"}], 
            inprogress: [{id: 3, text: "Review Project Code"}], 
            done: [{id: 4, text: "Sign up"}] 
        };
    } else {
        tasks = JSON.parse(stored);
    }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    updateCounts();
}

function updateCounts() {
    document.getElementById('count-todo').textContent = tasks.todo.length;
    document.getElementById('count-inprogress').textContent = tasks.inprogress.length;
    document.getElementById('count-done').textContent = tasks.done.length;
}

function renderTasks() {
    ['todo', 'inprogress', 'done'].forEach(columnId => {
        const columnEl = document.getElementById(`${columnId}-column`);
        columnEl.innerHTML = '';
        tasks[columnId].forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = 'kanban-task';
            taskEl.draggable = true;
            taskEl.dataset.id = task.id;
            
            taskEl.innerHTML = `
                <div>${task.text}</div>
                <button class="btn btn-sm btn-link text-danger delete-task-btn p-0" onclick="window.deleteKanbanTask(${task.id}, '${columnId}')">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;
            
            // Drag Events
            taskEl.addEventListener('dragstart', handleDragStart);
            columnEl.appendChild(taskEl);
        });
    });
    updateCounts();
}

function addTask(text) {
    const newTask = { id: Date.now(), text };
    tasks.todo.push(newTask);
    saveTasks();
    renderTasks();
    
    // Close modal
    const modalEl = document.getElementById('addTaskModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if(modal) modal.hide();
}

// Global delete for inline calls
window.deleteKanbanTask = function(id, colId) {
    tasks[colId] = tasks[colId].filter(t => t.id !== id);
    saveTasks();
    renderTasks();
};

/* Drag & Drop Logic */
let draggedId = null;
let sourceCol = null;

function handleDragStart(e) {
    draggedId = parseInt(e.target.dataset.id);
    sourceCol = e.target.parentElement.dataset.column;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => e.target.style.opacity = '0.5', 0);
}

function handleDragOver(e) {
    e.preventDefault(); // Allow drop
    const col = e.target.closest('.kanban-tasks');
    if(col) col.classList.add('drag-over');
}

function handleDragLeave(e) {
    const col = e.target.closest('.kanban-tasks');
    if(col) col.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const col = e.target.closest('.kanban-tasks');
    
    if(col) {
        col.classList.remove('drag-over');
        const destCol = col.dataset.column;
        
        if (draggedId && sourceCol) {
            // Move Data
            const taskIdx = tasks[sourceCol].findIndex(t => t.id === draggedId);
            if(taskIdx > -1) {
                const [task] = tasks[sourceCol].splice(taskIdx, 1);
                tasks[destCol].push(task);
                saveTasks();
                renderTasks();
            }
        }
    }
}

let form;

export function init() {
    form = document.getElementById('new-task-form');
    
    // Columns
    document.querySelectorAll('.kanban-tasks').forEach(col => {
        col.addEventListener('dragover', handleDragOver);
        col.addEventListener('dragleave', handleDragLeave);
        col.addEventListener('drop', handleDrop);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('new-task-input');
        if (input.value.trim()) {
            addTask(input.value.trim());
            input.value = '';
        }
    });

    loadTasks();
    renderTasks();
}

export function cleanup() {
    window.deleteKanbanTask = undefined;
}
