// js/tools/interactive-resume-builder.js

const DEFAULT_EXP = { role: 'Software Engineer', company: 'Tech Corp', start: '2020', end: 'Present', desc: 'Led development of core features.' };
const DEFAULT_EDU = { degree: 'BSc Computer Science', school: 'University of Tech', year: '2016 - 2020' };

let state = {
    personal: { name: '', title: '', email: '', phone: '', summary: '' },
    experience: [ {...DEFAULT_EXP} ],
    education: [ {...DEFAULT_EDU} ],
    skills: ''
};

// DOM Elements
let form, expListEl, eduListEl, previewName, previewTitle, previewEmail, previewPhone, previewSummary, previewExpList, previewEduList, previewSkills;

function renderEditor() {
    // Experience
    expListEl.innerHTML = state.experience.map((exp, i) => `
        <div class="glass-panel p-3 mb-3 border border-white-10 position-relative group-item">
            <button type="button" class="btn btn-sm btn-link text-danger position-absolute top-0 end-0 p-1 delete-exp" data-index="${i}"><i class="fa-solid fa-xmark"></i></button>
            <div class="row g-2 mb-2">
                <div class="col-6"><input type="text" class="form-control form-control-sm bg-dark border-white-10 text-white exp-input" data-index="${i}" data-field="role" value="${exp.role}" placeholder="Role"></div>
                <div class="col-6"><input type="text" class="form-control form-control-sm bg-dark border-white-10 text-white exp-input" data-index="${i}" data-field="company" value="${exp.company}" placeholder="Company"></div>
            </div>
            <div class="row g-2 mb-2">
                <div class="col-6"><input type="text" class="form-control form-control-sm bg-dark border-white-10 text-white exp-input" data-index="${i}" data-field="start" value="${exp.start}" placeholder="Start"></div>
                <div class="col-6"><input type="text" class="form-control form-control-sm bg-dark border-white-10 text-white exp-input" data-index="${i}" data-field="end" value="${exp.end}" placeholder="End"></div>
            </div>
            <textarea class="form-control form-control-sm bg-dark border-white-10 text-white exp-input" rows="2" data-index="${i}" data-field="desc" placeholder="Description">${exp.desc}</textarea>
        </div>
    `).join('');

    // Education
    eduListEl.innerHTML = state.education.map((edu, i) => `
        <div class="glass-panel p-3 mb-3 border border-white-10 position-relative group-item">
            <button type="button" class="btn btn-sm btn-link text-danger position-absolute top-0 end-0 p-1 delete-edu" data-index="${i}"><i class="fa-solid fa-xmark"></i></button>
            <div class="mb-2"><input type="text" class="form-control form-control-sm bg-dark border-white-10 text-white edu-input" data-index="${i}" data-field="degree" value="${edu.degree}" placeholder="Degree"></div>
            <div class="row g-2">
                <div class="col-8"><input type="text" class="form-control form-control-sm bg-dark border-white-10 text-white edu-input" data-index="${i}" data-field="school" value="${edu.school}" placeholder="School"></div>
                <div class="col-4"><input type="text" class="form-control form-control-sm bg-dark border-white-10 text-white edu-input" data-index="${i}" data-field="year" value="${edu.year}" placeholder="Year"></div>
            </div>
        </div>
    `).join('');
}

function renderPreview() {
    // Personal
    previewName.textContent = state.personal.name || 'Your Name';
    previewTitle.textContent = state.personal.title || 'Job Title';
    previewEmail.innerHTML = state.personal.email ? `<i class="fa-solid fa-envelope me-1"></i> ${state.personal.email}` : '';
    previewPhone.innerHTML = state.personal.phone ? `<i class="fa-solid fa-phone me-1"></i> ${state.personal.phone}` : '';
    previewSummary.textContent = state.personal.summary || 'Professional summary...';

    // Experience
    previewExpList.innerHTML = state.experience.map(exp => `
        <div class="mb-3">
            <div class="d-flex justify-content-between align-items-baseline">
                <h6 class="fw-bold mb-0">${exp.role || 'Role'}</h6>
                <span class="small text-muted fst-italic">${exp.start} - ${exp.end}</span>
            </div>
            <div class="small fw-bold text-secondary mb-1">${exp.company}</div>
            <p class="small mb-0 text-muted">${exp.desc}</p>
        </div>
    `).join('');

    // Education
    previewEduList.innerHTML = state.education.map(edu => `
        <div class="mb-2">
            <div class="d-flex justify-content-between">
                <h6 class="fw-bold mb-0 small">${edu.degree}</h6>
                <span class="small text-muted">${edu.year}</span>
            </div>
            <div class="small text-muted">${edu.school}</div>
        </div>
    `).join('');

    // Skills
    if(state.skills) {
        previewSkills.innerHTML = state.skills.split(',').map(s => `<span class="badge bg-secondary me-1 mb-1 fw-normal">${s.trim()}</span>`).join('');
    } else {
        previewSkills.innerHTML = '<span class="text-muted small">Skills will appear here...</span>';
    }
}

function handleInput(e) {
    const id = e.target.id;
    if(id === 'resume-name') state.personal.name = e.target.value;
    if(id === 'resume-title') state.personal.title = e.target.value;
    if(id === 'resume-email') state.personal.email = e.target.value;
    if(id === 'resume-phone') state.personal.phone = e.target.value;
    if(id === 'resume-summary') state.personal.summary = e.target.value;
    if(id === 'resume-skills') state.skills = e.target.value;

    if(e.target.classList.contains('exp-input')) {
        const idx = e.target.dataset.index;
        const field = e.target.dataset.field;
        state.experience[idx][field] = e.target.value;
    }

    if(e.target.classList.contains('edu-input')) {
        const idx = e.target.dataset.index;
        const field = e.target.dataset.field;
        state.education[idx][field] = e.target.value;
    }

    renderPreview();
}

function handleClicks(e) {
    if(e.target.closest('#add-exp-btn')) {
        state.experience.push({ role: '', company: '', start: '', end: '', desc: '' });
        renderEditor();
        renderPreview();
    }
    if(e.target.closest('.delete-exp')) {
        const idx = e.target.closest('.delete-exp').dataset.index;
        state.experience.splice(idx, 1);
        renderEditor();
        renderPreview();
    }
    if(e.target.closest('#add-edu-btn')) {
        state.education.push({ degree: '', school: '', year: '' });
        renderEditor();
        renderPreview();
    }
    if(e.target.closest('.delete-edu')) {
        const idx = e.target.closest('.delete-edu').dataset.index;
        state.education.splice(idx, 1);
        renderEditor();
        renderPreview();
    }
    if(e.target.closest('#print-btn')) {
        window.print();
    }
}

export function init() {
    form = document.getElementById('resume-form');
    expListEl = document.getElementById('experience-list');
    eduListEl = document.getElementById('education-list');
    
    // Preview Elements
    previewName = document.getElementById('preview-name');
    previewTitle = document.getElementById('preview-title');
    previewEmail = document.getElementById('preview-email');
    previewPhone = document.getElementById('preview-phone');
    previewSummary = document.getElementById('preview-summary');
    previewExpList = document.getElementById('preview-experience-list');
    previewEduList = document.getElementById('preview-education-list');
    previewSkills = document.getElementById('preview-skills-list');

    // Initial Render
    renderEditor();
    renderPreview();

    // Listeners
    form.addEventListener('input', handleInput);
    document.addEventListener('click', handleClicks);
}

export function cleanup() {
    document.removeEventListener('click', handleClicks);
}