// js/tools/calculator.js

let displayValue = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;

function updateDisplay() {
  const display = document.getElementById('display');
  if (display) {
    display.value = displayValue;
  }
}

function inputDigit(digit) {
  if (waitingForSecondOperand === true) {
    displayValue = digit;
    waitingForSecondOperand = false;
  } else {
    displayValue = displayValue === '0' ? digit : displayValue + digit;
  }
  updateDisplay();
}

function inputDecimal(dot) {
  if (waitingForSecondOperand === true) return;
  if (!displayValue.includes(dot)) {
    displayValue += dot;
  }
  updateDisplay();
}

function handleOperator(nextOperator) {
  const inputValue = parseFloat(displayValue);

  if (operator && waitingForSecondOperand) {
    operator = nextOperator;
    return;
  }

  if (firstOperand === null) {
    firstOperand = inputValue;
  } else if (operator) {
    const currentValue = firstOperand || 0;
    const result = performCalculation[operator](currentValue, inputValue);
    displayValue = String(parseFloat(result.toFixed(7))); // Prevent long decimals
    firstOperand = result;
  }

  waitingForSecondOperand = true;
  operator = nextOperator;
  updateDisplay();
}

const performCalculation = {
  '/': (first, second) => first / second,
  '*': (first, second) => first * second,
  '+': (first, second) => first + second,
  '-': (first, second) => first - second,
  '=': (first, second) => second 
};

function resetCalculator() {
  displayValue = '0';
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = false;
  updateDisplay();
}

function handleNegate() {
  displayValue = String(parseFloat(displayValue) * -1);
  updateDisplay();
}

function handlePercent() {
  displayValue = String(parseFloat(displayValue) / 100);
  updateDisplay();
}

function handleButtonClick(event) {
  const { target } = event;
  // Handle clicks on the button itself or inner elements
  const btn = target.closest('button');
  if (!btn) return;
  
  const action = btn.dataset.action;
  const value = btn.dataset.value;

  if (!action) return;

  switch (action) {
    case 'number':
      inputDigit(value);
      break;
    case 'decimal':
      inputDecimal(value);
      break;
    case 'operator':
      handleOperator(value);
      break;
    case 'calculate':
      handleOperator('='); 
      break;
    case 'clear':
      resetCalculator();
      break;
    case 'negate':
      handleNegate();
      break;
    case 'percent':
      handlePercent();
      break;
  }
}

export function init() {
  const calculator = document.getElementById('calculator-body');
  if (calculator) {
    calculator.addEventListener('click', handleButtonClick);
  }
  updateDisplay();
  
  // Keyboard support
  document.addEventListener('keydown', handleKeyboard);
}

function handleKeyboard(e) {
  const key = e.key;
  if (/\d/.test(key)) inputDigit(key);
  if (key === '.') inputDecimal('.');
  if (key === '=' || key === 'Enter') { e.preventDefault(); handleOperator('='); }
  if (key === 'Backspace') resetCalculator(); // Simplified backspace to clear for now
  if (key === '+' || key === '-' || key === '*' || key === '/') handleOperator(key);
}

export function cleanup() {
  const calculator = document.getElementById('calculator-body');
  if (calculator) {
    calculator.removeEventListener('click', handleButtonClick);
  }
  document.removeEventListener('keydown', handleKeyboard);
}
