// js/tools/unit-converter.js

const UNITS = {
    length: {
        meter: 1,
        kilometer: 1000,
        centimeter: 0.01,
        millimeter: 0.001,
        mile: 1609.34,
        yard: 0.9144,
        foot: 0.3048,
        inch: 0.0254,
    },
    weight: {
        gram: 1,
        kilogram: 1000,
        milligram: 0.001,
        pound: 453.592,
        ounce: 28.3495,
    },
    volume: {
        liter: 1,
        milliliter: 0.001,
        gallon: 3.78541,
        quart: 0.946353,
        pint: 0.473176,
        cup: 0.24,
    },
};

let categorySelect, fromSelect, toSelect, inputEl, outputEl, formulaEl;

function populateCategories() {
    Object.keys(UNITS).forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categorySelect.appendChild(option);
    });
}

function populateUnits() {
    const category = categorySelect.value;
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';

    Object.keys(UNITS[category]).forEach(unit => {
        const fromOption = document.createElement('option');
        fromOption.value = unit;
        fromOption.textContent = unit;
        fromSelect.appendChild(fromOption);

        const toOption = document.createElement('option');
        toOption.value = unit;
        toOption.textContent = unit;
        toSelect.appendChild(toOption);
    });

    // Set a different default 'to' unit
    if (toSelect.options.length > 1) {
        toSelect.selectedIndex = 1;
    }
    convert();
}

function convert() {
    const category = categorySelect.value;
    const fromUnit = fromSelect.value;
    const toUnit = toSelect.value;
    const inputValue = parseFloat(inputEl.value);

    if (isNaN(inputValue)) {
        outputEl.value = '';
        return;
    }

    const fromFactor = UNITS[category][fromUnit];
    const toFactor = UNITS[category][toUnit];

    const valueInBase = inputValue * fromFactor;
    const outputValue = valueInBase / toFactor;

    outputEl.value = outputValue.toFixed(6);
    formulaEl.textContent = `1 ${fromUnit} = ${(fromFactor / toFactor).toFixed(6)} ${toUnit}`;
}

export function init() {
    categorySelect = document.getElementById('unit-category');
    fromSelect = document.getElementById('from-unit');
    toSelect = document.getElementById('to-unit');
    inputEl = document.getElementById('input-value');
    outputEl = document.getElementById('output-value');
    formulaEl = document.getElementById('conversion-formula');

    populateCategories();
    populateUnits();

    categorySelect.addEventListener('change', populateUnits);
    fromSelect.addEventListener('change', convert);
    toSelect.addEventListener('change', convert);
    inputEl.addEventListener('input', convert);
}

export function cleanup() {
    categorySelect.removeEventListener('change', populateUnits);
    fromSelect.removeEventListener('change', convert);
    toSelect.removeEventListener('change', convert);
    inputEl.removeEventListener('input', convert);
}