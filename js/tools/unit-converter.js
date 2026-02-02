// js/tools/unit-converter.js

const UNITS = {
    length: { meter: 1, km: 1000, cm: 0.01, mm: 0.001, mile: 1609.34, yard: 0.9144, foot: 0.3048, inch: 0.0254 },
    weight: { kg: 1, gram: 0.001, pound: 0.453592, ounce: 0.0283495 },
    temp: { celsius: 'c', fahrenheit: 'f', kelvin: 'k' } // Handled separately
};

let cat, from, to, inp, out, formula;

function render() {
    const c = cat.value;
    const v = parseFloat(inp.value);
    
    if(isNaN(v)) { out.textContent = '--'; return; }

    let res = 0;
    const u1 = from.value;
    const u2 = to.value;

    if (c === 'temp') {
        if (u1 === u2) res = v;
        else if (u1 === 'celsius' && u2 === 'fahrenheit') res = (v * 9/5) + 32;
        else if (u1 === 'celsius' && u2 === 'kelvin') res = v + 273.15;
        else if (u1 === 'fahrenheit' && u2 === 'celsius') res = (v - 32) * 5/9;
        else if (u1 === 'fahrenheit' && u2 === 'kelvin') res = (v - 32) * 5/9 + 273.15;
        else if (u1 === 'kelvin' && u2 === 'celsius') res = v - 273.15;
        else if (u1 === 'kelvin' && u2 === 'fahrenheit') res = (v - 273.15) * 9/5 + 32;
    } else {
        const base = v * UNITS[c][u1];
        res = base / UNITS[c][u2];
    }

    out.textContent = parseFloat(res.toFixed(4));
    formula.textContent = `1 ${u1} ≈ ${(1 * (c === 'temp' ? 1 : UNITS[c][u1] / UNITS[c][u2])).toFixed(4)} ${u2}`;
}

function updateUnits() {
    const c = cat.value;
    const opts = Object.keys(UNITS[c]).map(u => `<option value="${u}">${u}</option>`).join('');
    from.innerHTML = opts;
    to.innerHTML = opts;
    if (to.options[1]) to.selectedIndex = 1;
    render();
}

export function init() {
    cat = document.getElementById('unit-category');
    from = document.getElementById('from-unit');
    to = document.getElementById('to-unit');
    inp = document.getElementById('input-value');
    out = document.getElementById('output-value');
    formula = document.getElementById('formula-text');

    Object.keys(UNITS).forEach(k => {
        const o = document.createElement('option');
        o.value = k;
        o.textContent = k.toUpperCase();
        cat.appendChild(o);
    });

    cat.addEventListener('change', updateUnits);
    from.addEventListener('change', render);
    to.addEventListener('change', render);
    inp.addEventListener('input', render);

    updateUnits();
}
export function cleanup() {}
