// js/tools/kanban-board.js

let tasks = {};
const STORAGE_KEY = 'kanbanBoardTasks';

function loadTasks() {
    const stored = localStorage.getItem(STORAGE_KEY);
    tasks = stored ? JSON.parse(stored) : { todo: [], inprogress: [], done: [] };
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
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
            taskEl.textContent = task.text;
            columnEl.appendChild(taskEl);
        });
    });
}

function addTask(text) {
    const newTask = { id: Date.now(), text };
    tasks.todo.push(newTask);
    saveTasks();
    renderTasks();
}

function handleDragStart(e) {
    if (e.target.classList.contains('kanban-task')) {
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
        e.target.classList.add('dragging');
    }
}

function handleDragOver(e) {
    e.preventDefault();
    if (e.target.classList.contains('kanban-tasks')) {
        e.target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (e.target.classList.contains('kanban-tasks')) {
        e.target.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const columnEl = e.target.closest('.kanban-tasks');
    if (!columnEl) return;

    columnEl.classList.remove('drag-over');
    const taskId = e.dataTransfer.getData('text/plain');
    const taskEl = document.querySelector(`[data-id='${taskId}']`);
    if (!taskEl) return;

    const fromColumnId = taskEl.parentElement.dataset.column;
    const toColumnId = columnEl.dataset.column;

    // Find and move the task in the state object
    const taskIndex = tasks[fromColumnId].findIndex(t => t.id == taskId);
    if (taskIndex > -1) {
        const [task] = tasks[fromColumnId].splice(taskIndex, 1);
        tasks[toColumnId].push(task);
        saveTasks();
        renderTasks(); // Re-render to ensure correct placement
    }
}

function handleDragEnd(e) {
    if (e.target.classList.contains('kanban-task')) {
        e.target.classList.remove('dragging');
    }
}

let form;
let board;

export function init() {
    form = document.getElementById('new-task-form');
    board = document.querySelector('.kanban-board');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('new-task-input');
        if (input.value.trim()) {
            addTask(input.value.trim());
            input.value = '';
        }
    });

    board.addEventListener('dragstart', handleDragStart);
    board.addEventListener('dragover', handleDragOver);
    board.addEventListener('dragleave', handleDragLeave);
    board.addEventListener('drop', handleDrop);
    board.addEventListener('dragend', handleDragEnd);

    loadTasks();
    renderTasks();
}

export function cleanup() {
    form.removeEventListener('submit', addTask);
    board.removeEventListener('dragstart', handleDragStart);
    board.removeEventListener('dragover', handleDragOver);
    board.removeEventListener('dragleave', handleDragLeave);
    board.removeEventListener('drop', handleDrop);
    board.removeEventListener('dragend', handleDragEnd);
}