// js/tools/calculator.js

let displayValue = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;

// Function to update the display element
function updateDisplay() {
  const display = document.getElementById('display');
  if (display) {
    display.value = displayValue;
  }
}

// Function to handle number and decimal clicks
function inputDigit(digit) {
  if (waitingForSecondOperand === true) {
    displayValue = digit;
    waitingForSecondOperand = false;
  } else {
    displayValue = displayValue === '0' ? digit : displayValue + digit;
  }
  updateDisplay();
}

// Function to handle the decimal point
function inputDecimal(dot) {
  if (waitingForSecondOperand === true) return;
  
  if (!displayValue.includes(dot)) {
    displayValue += dot;
  }
  updateDisplay();
}

// Function to handle operator clicks
function handleOperator(nextOperator) {
  const inputValue = parseFloat(displayValue);

  if (operator && waitingForSecondOperand) {
    operator = nextOperator;
    return;
  }

  if (firstOperand === null) {
    firstOperand = inputValue;
  } else if (operator) {
    const result = performCalculation[operator](firstOperand, inputValue);

    displayValue = String(result);
    firstOperand = result;
  }

  waitingForSecondOperand = true;
  operator = nextOperator;
  updateDisplay();
}

// The calculation logic
const performCalculation = {
  '/': (first, second) => first / second,
  '*': (first, second) => first * second,
  '+': (first, second) => first + second,
  '-': (first, second) => first - second,
  '=': (first, second) => second 
};

// Function to clear the calculator state
function resetCalculator() {
  displayValue = '0';
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = false;
  updateDisplay();
}

// Event handler for all calculator buttons
function handleButtonClick(event) {
  const { target } = event;
  const action = target.dataset.action;
  const value = target.dataset.value;

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
      // The '=' button uses handleOperator to finalize the calculation
      handleOperator(operator); 
      break;
    case 'clear':
      resetCalculator();
      break;
    default:
      break;
  }
}

// Initialization function for router
export function init() {
  const calculator = document.getElementById('calculator-body');
  if (calculator) {
    calculator.addEventListener('click', handleButtonClick);
  }
  updateDisplay();
}

// Cleanup function for router
export function cleanup() {
  const calculator = document.getElementById('calculator-body');
  if (calculator) {
    calculator.removeEventListener('click', handleButtonClick);
  }
}