// js/tools/expense-splitter.js

let people = [];
let expenses = [];

let personInput, addPersonBtn, peopleContainer;
let expDesc, expAmt, expPayer, addExpBtn, expList;
let settlementPlan;

function render() {
    // Render People Chips
    peopleContainer.innerHTML = people.map(p => `
        <span class="badge bg-white bg-opacity-10 border border-white-10 p-2 d-flex align-items-center gap-2">
            ${p} <i class="fa-solid fa-xmark cursor-pointer opacity-50 hover-opacity-100" onclick="window.delPerson('${p}')"></i>
        </span>
    `).join('');

    // Render Payer Select
    const currentPayer = expPayer.value;
    expPayer.innerHTML = '<option value="" disabled selected>Payer</option>' + 
        people.map(p => `<option value="${p}">${p}</option>`).join('');
    if(people.includes(currentPayer)) expPayer.value = currentPayer;

    // Render Expenses
    expList.innerHTML = expenses.map((e, i) => `
        <div class="list-group-item bg-transparent border-white-10 text-white d-flex justify-content-between align-items-center">
            <div>
                <strong class="d-block">${e.desc}</strong>
                <small class="text-secondary">Paid by ${e.payer}</small>
            </div>
            <div class="d-flex align-items-center gap-3">
                <span class="text-success fw-bold">$${e.amt.toFixed(2)}</span>
                <i class="fa-solid fa-trash text-danger cursor-pointer" onclick="window.delExp(${i})"></i>
            </div>
        </div>
    `).join('');

    calculate();
}

function calculate() {
    if(people.length < 2 || expenses.length === 0) {
        settlementPlan.innerHTML = '<p class="text-white-50 text-center small my-2">Add people and expenses to calculate.</p>';
        return;
    }

    const balances = {};
    people.forEach(p => balances[p] = 0);

    expenses.forEach(e => {
        const split = e.amt / people.length;
        people.forEach(p => {
            if(p === e.payer) balances[p] += (e.amt - split);
            else balances[p] -= split;
        });
    });

    const debtors = [];
    const creditors = [];

    for (const [p, bal] of Object.entries(balances)) {
        if (bal < -0.01) debtors.push({ p, amt: -bal });
        if (bal > 0.01) creditors.push({ p, amt: bal });
    }

    let plan = '';
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const amount = Math.min(debtor.amt, creditor.amt);

        plan += `
            <div class="d-flex align-items-center justify-content-between p-2 border-bottom border-white-10">
                <span class="text-white">${debtor.p}</span>
                <span class="text-secondary small">pays</span>
                <span class="text-white">${creditor.p}</span>
                <span class="badge bg-success">$${amount.toFixed(2)}</span>
            </div>
        `;

        debtor.amt -= amount;
        creditor.amt -= amount;

        if (debtor.amt < 0.01) i++;
        if (creditor.amt < 0.01) j++;
    }

    settlementPlan.innerHTML = plan || '<div class="text-center text-success fw-bold p-2">All settled up!</div>';
}

function addPerson() {
    const name = personInput.value.trim();
    if(name && !people.includes(name)) {
        people.push(name);
        personInput.value = '';
        render();
    }
}

function addExpense() {
    const desc = expDesc.value.trim();
    const amt = parseFloat(expAmt.value);
    const payer = expPayer.value;

    if(desc && amt > 0 && payer) {
        expenses.push({ desc, amt, payer });
        expDesc.value = '';
        expAmt.value = '';
        render();
    }
}

window.delPerson = (name) => {
    people = people.filter(p => p !== name);
    expenses = expenses.filter(e => e.payer !== name); // Remove orphaned expenses? Or reassign? Simple removal for now.
    render();
};

window.delExp = (i) => {
    expenses.splice(i, 1);
    render();
};

export function init() {
    personInput = document.getElementById('person-name');
    addPersonBtn = document.getElementById('add-person-btn');
    peopleContainer = document.getElementById('people-container');
    
    expDesc = document.getElementById('exp-desc');
    expAmt = document.getElementById('exp-amt');
    expPayer = document.getElementById('exp-payer');
    addExpBtn = document.getElementById('add-expense-btn');
    expList = document.getElementById('expense-list');
    
    settlementPlan = document.getElementById('settlement-plan');

    addPersonBtn.addEventListener('click', addPerson);
    addExpBtn.addEventListener('click', addExpense);
    document.getElementById('reset-btn').addEventListener('click', () => {
        if(confirm('Clear all?')) {
            people = [];
            expenses = [];
            render();
        }
    });

    render();
}

export function cleanup() {
    window.delPerson = undefined;
    window.delExp = undefined;
}
