// js/tools/typing-test.js

let startTime;
let timerRunning = false;
let testText = "";
let timerInterval;

const texts = [
  "The quick brown fox jumps over the lazy dog.",
  "Typing fast takes practice and accuracy.",
  "JavaScript makes web pages interactive and fun.",
  "Focus on consistency rather than speed at first."
];

export function init() {
  const startBtn = document.getElementById("start-test");
  const resetBtn = document.getElementById("reset-test");
  const typingArea = document.getElementById("typing-area");

  startBtn.addEventListener("click", startTest);
  resetBtn.addEventListener("click", resetTest);
  typingArea.addEventListener("input", handleTyping);
}

export function cleanup() {
  clearInterval(timerInterval);
}

function startTest() {
  const typingArea = document.getElementById("typing-area");
  const textToType = document.getElementById("text-to-type");

  testText = texts[Math.floor(Math.random() * texts.length)];
  textToType.textContent = testText;

  typingArea.value = "";
  typingArea.disabled = false;
  typingArea.focus();

  startTime = new Date().getTime();
  timerRunning = true;

  document.getElementById("result").textContent = "";
}

function handleTyping() {
  if (!timerRunning) return;

  const typedText = document.getElementById("typing-area").value;
  const textToType = document.getElementById("text-to-type").textContent;

  if (typedText === textToType) {
    endTest();
  }
}

function endTest() {
  const endTime = new Date().getTime();
  const timeTaken = (endTime - startTime) / 1000; // in seconds

  const words = testText.split(" ").length;
  const wpm = Math.round((words / timeTaken) * 60);

  document.getElementById("result").textContent = `✅ You typed at ${wpm} WPM!`;
  document.getElementById("typing-area").disabled = true;
  timerRunning = false;
}

function resetTest() {
  document.getElementById("text-to-type").textContent = "Click “Start Test” to begin typing.";
  document.getElementById("typing-area").value = "";
  document.getElementById("typing-area").disabled = true;
  document.getElementById("result").textContent = "";
  timerRunning = false;
  clearInterval(timerInterval);
}
