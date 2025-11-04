// js/tools/blackjack.js

// --- Game State ---
let deck = [];
let playerCards = [];
let dealerCards = [];
let gameOver = false;
let playerChips = 100;
let currentBet = 0;

// --- DOM Elements ---
let betBtn,
  hitBtn,
  standBtn,
  betAmountInput,
  playerChipsEl,
  bettingArea,
  actionArea;

const suits = ["♠", "♥", "♦", "♣"];
const values = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

// ------------------------------------
// Router Lifecycle Functions
// ------------------------------------
export function init() {
  // Get DOM elements
  betBtn = document.getElementById("bet-btn");
  hitBtn = document.getElementById("hit-btn");
  standBtn = document.getElementById("stand-btn");
  betAmountInput = document.getElementById("bet-amount");
  playerChipsEl = document.getElementById("player-chips");
  bettingArea = document.getElementById("betting-area");
  actionArea = document.getElementById("action-area");

  // Attach listeners
  betBtn.addEventListener("click", handleBet);
  hitBtn.addEventListener("click", playerHit);
  standBtn.addEventListener("click", playerStand);

  // Initial UI setup
  resetForNewRound();
}

export function cleanup() {
  betBtn?.removeEventListener("click", handleBet);
  hitBtn?.removeEventListener("click", playerHit);
  standBtn?.removeEventListener("click", playerStand);
}

// ------------------------------------
// Core Game Logic
// ------------------------------------
function createDeck() {
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  deck = shuffle(deck);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function handleBet() {
  const betValue = parseInt(betAmountInput.value);
  if (isNaN(betValue) || betValue <= 0) {
    alert("Please enter a valid bet amount.");
    return;
  }
  if (betValue > playerChips) {
    alert("You cannot bet more chips than you have.");
    return;
  }

  currentBet = betValue;
  playerChips -= currentBet;
  startGame();
}

function startGame() {
  gameOver = false;
  document.getElementById("game-result").textContent = "";

  createDeck();
  playerCards = [deck.pop(), deck.pop()];
  dealerCards = [deck.pop(), deck.pop()];

  bettingArea.classList.add("d-none");
  actionArea.classList.remove("d-none");

  // Check for immediate Blackjack
  if (calculateScore(playerCards) === 21) {
    // Player gets Blackjack, dealer does not have one
    if (calculateScore(dealerCards) !== 21) {
      endGame("win_blackjack");
    } else {
      // Both have blackjack, it's a push
      endGame("push");
    }
    return;
  }

  updateUI();
}

function playerHit() {
  if (gameOver) return;
  playerCards.push(deck.pop());
  const score = calculateScore(playerCards);

  if (score > 21) {
    endGame("loss");
  }
  updateUI();
}

function playerStand() {
  if (gameOver) return;
  gameOver = true;

  // Dealer's turn: hit until score is 17 or more
  while (calculateScore(dealerCards) < 17) {
    dealerCards.push(deck.pop());
  }

  // Determine winner after dealer stands
  determineWinner();
  updateUI();
}

function determineWinner() {
  const playerScore = calculateScore(playerCards);
  const dealerScore = calculateScore(dealerCards);

  if (playerScore > 21) {
    endGame("loss");
  } else if (dealerScore > 21) {
    endGame("win");
  } else if (dealerScore > playerScore) {
    endGame("loss");
  } else if (dealerScore < playerScore) {
    endGame("win");
  } else {
    endGame("push");
  }
}

function endGame(result) {
  gameOver = true;
  let message = "";

  switch (result) {
    case "win":
      playerChips += currentBet * 2; // Bet back + winnings
      message = `You win! +$${currentBet}`;
      break;
    case "win_blackjack":
      playerChips += currentBet * 2.5; // Bet back + 1.5x winnings
      message = `Blackjack! You win! +$${currentBet * 1.5}`;
      break;
    case "loss":
      message = `You lose! -$${currentBet}`;
      // Chips already subtracted when bet was placed
      break;
    case "push":
      playerChips += currentBet; // Bet returned
      message = "Push! It's a tie.";
      break;
  }

  document.getElementById("game-result").textContent = message;
  setTimeout(resetForNewRound, 2000); // Wait 2 seconds before starting next round
}

function calculateScore(cards) {
  let sum = 0;
  let aceCount = 0;
  for (let card of cards) {
    if (["J", "Q", "K"].includes(card.value)) sum += 10;
    else if (card.value === "A") {
      sum += 11;
      aceCount++;
    } else sum += Number(card.value);
  }
  while (sum > 21 && aceCount > 0) {
    sum -= 10;
    aceCount--;
  }
  return sum;
}

function resetForNewRound() {
  gameOver = true; // Game is over until a new bet is placed
  playerCards = [];
  dealerCards = [];
  currentBet = 0;

  if (playerChips <= 0) {
    alert("You're out of chips! Resetting to $100.");
    playerChips = 100;
  }

  bettingArea.classList.remove("d-none");
  actionArea.classList.add("d-none");
  updateUI();
}

// ------------------------------------
// UI/Design Logic (The fixed card display)
// ------------------------------------
function updateUI() {
  const playerDiv = document.getElementById("player-cards");
  const dealerDiv = document.getElementById("dealer-cards");
  const resultDiv = document.getElementById("game-result");

  playerDiv.innerHTML = "";
  dealerDiv.innerHTML = "";

  const getCardHTML = (card, isHidden = false) => {
    if (isHidden) {
      return '<div class="card-element card-back"></div>';
    }
    const suitColor =
      card.suit === "♥" || card.suit === "♦" ? "text-danger" : "text-dark";
    return `
      <div class="card-element shadow-sm">
        <span class="card-value ${suitColor}">${card.value}</span>
        <span class="card-suit-top ${suitColor}">${card.suit}</span>
        <span class="card-suit-bottom ${suitColor}">${card.suit}</span>
      </div>`;
  };

  // Player Cards
  playerCards.forEach((c) => {
    playerDiv.innerHTML += getCardHTML(c);
  });

  // Dealer Cards (Hide the first card unless game is over)
  dealerCards.forEach((c, index) => {
    let isHidden = !gameOver && index === 0;
    dealerDiv.innerHTML += getCardHTML(c, isHidden);
  });

  // Score Update Logic
  let playerScore = calculateScore(playerCards);
  let dealerScoreText = gameOver ? calculateScore(dealerCards) : "?";

  document.getElementById("player-score").textContent = playerScore;
  document.getElementById("dealer-score").textContent = dealerScoreText;
  playerChipsEl.textContent = playerChips;

  // Ensure bet input doesn't exceed available chips
  betAmountInput.max = playerChips;
}
