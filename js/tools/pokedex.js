// js/tools/pokedex.js

const COLORS = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
    grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
    ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
    steel: '#B7B7CE', fairy: '#D685AD'
};

let form, input, card, errorEl, bg;

async function search(e) {
    e.preventDefault();
    const q = input.value.trim().toLowerCase();
    if (!q) return;

    card.classList.add('d-none');
    errorEl.classList.add('d-none');

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${q}`);
        if (!res.ok) throw new Error("Not Found");
        const data = await res.json();
        render(data);
        card.classList.remove('d-none');
    } catch (err) {
        errorEl.classList.remove('d-none');
    }
}

function render(data) {
    // Basic Info
    document.getElementById('pk-name').textContent = data.name;
    document.getElementById('pk-id').textContent = `#${String(data.id).padStart(3, '0')}`;
    document.getElementById('pk-img').src = data.sprites.other['official-artwork'].front_default;
    document.getElementById('pk-height').textContent = data.height / 10 + 'm';
    document.getElementById('pk-weight').textContent = data.weight / 10 + 'kg';
    document.getElementById('pk-xp').textContent = data.base_experience;

    // Types & Theme
    const mainType = data.types[0].type.name;
    const color = COLORS[mainType] || '#777';
    bg.style.background = `linear-gradient(135deg, ${color}, #333)`;
    
    document.getElementById('pk-types').innerHTML = data.types.map(t => 
        `<span class="badge bg-white bg-opacity-25 rounded-pill px-3 border border-white-25">${t.type.name}</span>`
    ).join('');

    // Stats
    document.getElementById('pk-stats').innerHTML = data.stats.map(s => {
        const val = s.base_stat;
        const pct = Math.min(val / 150 * 100, 100);
        let barColor = 'bg-success';
        if(val < 50) barColor = 'bg-danger';
        else if(val < 80) barColor = 'bg-warning';

        return `
            <div class="mb-2">
                <div class="d-flex justify-content-between small mb-1">
                    <span class="text-muted fw-bold text-uppercase">${getStatName(s.stat.name)}</span>
                    <span class="fw-bold">${val}</span>
                </div>
                <div class="progress" style="height: 6px; background-color: #f0f0f0;">
                    <div class="progress-bar ${barColor}" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function getStatName(name) {
    if(name === 'hp') return 'HP';
    if(name === 'attack') return 'ATK';
    if(name === 'defense') return 'DEF';
    if(name === 'special-attack') return 'SATK';
    if(name === 'special-defense') return 'SDEF';
    if(name === 'speed') return 'SPD';
    return name;
}

export function init() {
    form = document.getElementById('poke-form');
    input = document.getElementById('poke-input');
    card = document.getElementById('poke-card');
    errorEl = document.getElementById('poke-error');
    bg = document.getElementById('poke-bg');

    form.addEventListener('submit', search);
}

export function cleanup() {}
