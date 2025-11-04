// js/tools/file-organizer.js

// --- DOM Elements ---
let folderTreeEl, fileGridEl, breadcrumbNavEl, emptyFolderMsgEl;
let newFolderBtn, newFileBtn, uploadFileBtn, fileUploadInput;
let newFolderModal, newFileModal, renameModal, fileContentModal;
let contextMenuEl;

// --- Modals (Bootstrap 5 instances) ---
let bsNewFolderModal, bsNewFileModal, bsRenameModal, bsFileContentModal;

// --- State ---
const STORAGE_KEY = 'fileOrganizerData';
let fileSystem = {};
let currentPath = '/';
let contextTarget = null; // The element being right-clicked
let editingFilePath = null; // Path of the file being edited in the content modal

// --- File System & Local Storage ---

function getInitialFileSystem() {
    return {
        '/': {
            type: 'folder',
            name: 'Home',
            path: '/',
            children: {}
        }
    };
}

function loadFileSystem() {
    const stored = localStorage.getItem(STORAGE_KEY);
    fileSystem = stored ? JSON.parse(stored) : getInitialFileSystem();
}

function saveFileSystem() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fileSystem));
}

function getNode(path) {
    const parts = path.split('/').filter(p => p);
    let currentNode = fileSystem['/'];
    for (const part of parts) {
        if (currentNode && currentNode.children && currentNode.children[part]) {
            currentNode = currentNode.children[part];
        } else {
            return null;
        }
    }
    return currentNode;
}

// --- Rendering ---

function renderAll() {
    renderFolderTree();
    renderFileGrid();
    renderBreadcrumbs();
}

function renderFolderTree() {
    function buildTreeHtml(node, path) {
        let html = `<div class="folder-tree-item" data-path="${path}">
                        <i class="fa-solid fa-folder"></i> ${node.name}
                    </div>`;
        const children = Object.values(node.children).filter(c => c.type === 'folder');
        if (children.length > 0) {
            html += '<div class="ms-3">';
            children.forEach(child => {
                html += buildTreeHtml(child, child.path);
            });
            html += '</div>';
        }
        return html;
    }
    folderTreeEl.innerHTML = buildTreeHtml(fileSystem['/'], '/');
}

function renderFileGrid() {
    const currentNode = getNode(currentPath);
    fileGridEl.innerHTML = '';

    if (!currentNode || Object.keys(currentNode.children).length === 0) {
        emptyFolderMsgEl.classList.remove('d-none');
        return;
    }
    emptyFolderMsgEl.classList.add('d-none');

    const items = Object.values(currentNode.children).sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
    });

    items.forEach(item => {
        const icon = item.type === 'folder' ? 'fa-folder' : 'fa-file';
        const itemEl = document.createElement('div');
        itemEl.className = 'col-md-3 col-6';
        itemEl.innerHTML = `
            <div class="file-item text-center p-2 rounded" data-path="${item.path}" data-type="${item.type}" draggable="true">
                <i class="fa-solid ${icon} fa-3x mb-2"></i>
                <p class="mb-0 text-truncate">${item.name}</p>
            </div>
        `;
        fileGridEl.appendChild(itemEl);
    });
}

function renderBreadcrumbs() {
    const parts = currentPath.split('/').filter(p => p);
    let path = '/';
    let html = `<li class="breadcrumb-item"><a href="#" data-path="/">Home</a></li>`;
    parts.forEach(part => {
        path += (path === '/' ? '' : '/') + part;
        html += `<li class="breadcrumb-item"><a href="#" data-path="${path}">${part}</a></li>`;
    });
    breadcrumbNavEl.querySelector('.breadcrumb').innerHTML = html;
    // Make the last item active
    const lastItem = breadcrumbNavEl.querySelector('.breadcrumb-item:last-child');
    if (lastItem) {
        lastItem.classList.add('active');
        lastItem.innerHTML = lastItem.textContent; // Remove link
    }
}

// --- Event Handlers ---

function handleGridClick(e) {
    const target = e.target.closest('.file-item');
    if (!target) return;
    const path = target.dataset.path;
    const node = getNode(path);
    if (!node) return;

    if (node.type === 'folder') {
        currentPath = path;
        renderAll();
    } else if (node.type === 'file') {
        // Open the file content viewer
        editingFilePath = path;
        document.getElementById('file-content-title').textContent = node.name;
        document.getElementById('file-content-textarea').value = node.content || '';
        bsFileContentModal.show();
    }
}

function handleBreadcrumbClick(e) {
    e.preventDefault();
    const target = e.target.closest('a[data-path]');
    if (!target) return;
    currentPath = target.dataset.path;
    renderAll();
}

function handleTreeClick(e) {
    const target = e.target.closest('.folder-tree-item');
    if (!target) return;
    currentPath = target.dataset.path;
    renderAll();
}

function createItem(name, type, content = '') {
    const parentNode = getNode(currentPath);
    if (!parentNode || parentNode.children[name]) {
        alert(`A ${type} with this name already exists.`);
        return;
    }
    const newPath = (currentPath === '/' ? '' : currentPath) + '/' + name;
    parentNode.children[name] = {
        type,
        name,
        path: newPath,
        ...(type === 'folder' && { children: {} }),
        ...(type === 'file' && { content })
    };
    saveFileSystem();
    renderAll();
}

function deleteItem(path) {
    const parts = path.split('/').filter(p => p);
    const name = parts.pop();
    const parentPath = parts.length > 0 ? '/' + parts.join('/') : '/';
    const parentNode = getNode(parentPath);
    if (parentNode && parentNode.children[name]) {
        delete parentNode.children[name];
        saveFileSystem();
        renderAll();
    }
}

function renameItem(path, newName) {
    const parts = path.split('/').filter(p => p);
    const oldName = parts.pop();
    const parentPath = parts.length > 0 ? '/' + parts.join('/') : '/';
    const parentNode = getNode(parentPath);

    if (parentNode && parentNode.children[oldName] && !parentNode.children[newName]) {
        const item = parentNode.children[oldName];
        delete parentNode.children[oldName];
        item.name = newName;
        item.path = parentPath === '/' ? `/${newName}` : `${parentPath}/${newName}`;
        parentNode.children[newName] = item;
        // Note: This doesn't recursively update paths of children. For this simple tool, it's okay.
        saveFileSystem();
        renderAll();
    } else {
        alert('Invalid name or name already exists.');
    }
}

function showContextMenu(e) {
    contextTarget = e.target.closest('.file-item');
    if (!contextTarget) return;
    e.preventDefault();
    contextMenuEl.style.display = 'block';
    contextMenuEl.style.left = `${e.pageX}px`;
    contextMenuEl.style.top = `${e.pageY}px`;
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target.result;
        createItem(file.name, 'file', content);
    };
    reader.onerror = () => {
        alert('Failed to read file.');
    };
    reader.readAsText(file);

    e.target.value = ''; // Reset input so the same file can be uploaded again
}

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    folderTreeEl = document.getElementById('folder-tree');
    fileGridEl = document.getElementById('file-grid');
    breadcrumbNavEl = document.getElementById('breadcrumb-nav');
    emptyFolderMsgEl = document.getElementById('empty-folder-msg');
    newFolderBtn = document.getElementById('new-folder-btn');
    newFileBtn = document.getElementById('new-file-btn');
    uploadFileBtn = document.getElementById('upload-file-btn');
    fileUploadInput = document.getElementById('file-upload-input');
    contextMenuEl = document.getElementById('context-menu');

    // Modals
    newFolderModal = document.getElementById('new-folder-modal');
    newFileModal = document.getElementById('new-file-modal');
    renameModal = document.getElementById('rename-modal');
    fileContentModal = document.getElementById('file-content-modal');
    bsNewFolderModal = new bootstrap.Modal(newFolderModal);
    bsNewFileModal = new bootstrap.Modal(newFileModal);
    bsRenameModal = new bootstrap.Modal(renameModal);
    bsFileContentModal = new bootstrap.Modal(fileContentModal);

    // Load data and render
    loadFileSystem();
    renderAll();

    // Attach event listeners
    fileGridEl.addEventListener('click', handleGridClick);
    fileGridEl.addEventListener('contextmenu', showContextMenu);
    breadcrumbNavEl.addEventListener('click', handleBreadcrumbClick);
    folderTreeEl.addEventListener('click', handleTreeClick);

    // Hide context menu on global click
    document.addEventListener('click', () => contextMenuEl.style.display = 'none');

    // Button/Form listeners
    newFolderBtn.addEventListener('click', () => bsNewFolderModal.show());
    newFileBtn.addEventListener('click', () => bsNewFileModal.show());
    uploadFileBtn.addEventListener('click', () => fileUploadInput.click());
    fileUploadInput.addEventListener('change', handleFileUpload);

    document.getElementById('new-folder-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-folder-name').value.trim();
        if (name) createItem(name, 'folder');
        bsNewFolderModal.hide();
        e.target.reset();
    });

    document.getElementById('new-file-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-file-name').value.trim();
        if (name) createItem(name, 'file');
        bsNewFileModal.hide();
        e.target.reset();
    });

    document.getElementById('rename-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = document.getElementById('rename-name').value.trim();
        if (newName && contextTarget) {
            renameItem(contextTarget.dataset.path, newName);
        }
        bsRenameModal.hide();
        e.target.reset();
    });

    document.getElementById('file-content-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newContent = document.getElementById('file-content-textarea').value;
        const node = getNode(editingFilePath);
        if (node && node.type === 'file') {
            node.content = newContent;
            saveFileSystem();
        }
        bsFileContentModal.hide();
        editingFilePath = null;
    });

    // Context menu actions
    document.getElementById('ctx-delete').addEventListener('click', (e) => {
        e.preventDefault();
        if (contextTarget && confirm(`Are you sure you want to delete "${getNode(contextTarget.dataset.path).name}"?`)) {
            deleteItem(contextTarget.dataset.path);
        }
    });

    document.getElementById('ctx-rename').addEventListener('click', (e) => {
        e.preventDefault();
        if (contextTarget) {
            document.getElementById('rename-name').value = getNode(contextTarget.dataset.path).name;
            bsRenameModal.show();
        }
    });
}

export function cleanup() {
    // Dispose of Bootstrap modals to prevent memory leaks
    [bsNewFolderModal, bsNewFileModal, bsRenameModal, bsFileContentModal].forEach(m => m && m.dispose());
}