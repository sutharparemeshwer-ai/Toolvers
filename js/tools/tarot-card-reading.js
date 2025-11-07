// js/tools/tarot-card-reading.js

let drawBtn, readingContainer;

const TAROT_DECK = [
  // Major Arcana
  {
    name: "The Fool",
    img: "maj00.jpg",
    upright: "Beginnings, innocence, spontaneity, a free spirit.",
    reversed: "Recklessness, being taken advantage of, inconsideration.",
  },
  {
    name: "The Magician",
    img: "maj01.jpg",
    upright: "Manifestation, resourcefulness, power, inspired action.",
    reversed: "Manipulation, poor planning, untapped talents.",
  },
  {
    name: "The Lovers",
    img: "maj06.jpg",
    upright: "Love, harmony, relationships, values alignment, choices.",
    reversed: "Disharmony, imbalance, misalignment of values.",
  },
  {
    name: "Death",
    img: "maj13.jpg",
    upright: "Endings, change, transformation, transition.",
    reversed: "Resistance to change, personal transformation, inner purging.",
  },
  // Cups
  {
    name: "Ace of Cups",
    img: "cups01.jpg",
    upright: "New love, compassion, creativity, overwhelming emotion.",
    reversed: "Blocked or repressed emotions, emptiness, unrequited love.",
  },
  // Wands
  {
    name: "Three of Wands",
    img: "wands03.jpg",
    upright: "Progress, expansion, foresight, overseas opportunities.",
    reversed: "Lack of foresight, delays, obstacles to long-term goals.",
  },
  // Swords
  {
    name: "Ten of Swords",
    img: "swords10.jpg",
    upright: "Painful endings, deep wounds, betrayal, loss, crisis.",
    reversed: "Recovery, regeneration, resisting an inevitable end.",
  },
  // Pentacles
  {
    name: "Nine of Pentacles",
    img: "pents09.jpg",
    upright: "Abundance, luxury, self-sufficiency, financial independence.",
    reversed: "Self-worth issues, over-investment in work, hustling.",
  },
  {
    name: "King of Pentacles",
    img: "pents14.jpg",
    upright: "Wealth, business, leadership, security, discipline, abundance.",
    reversed: "Financially inept, obsessed with wealth and status, stubborn.",
  },
];

const SPREAD_TITLES = ["Past", "Present", "Future"];

/**
 * Shuffles an array in place.
 * @param {Array} array The array to shuffle.
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Draws a specified number of cards from the deck.
 * @param {number} count The number of cards to draw.
 * @returns {Array} An array of drawn card objects.
 */
function drawCards(count) {
  const shuffledDeck = [...TAROT_DECK];
  shuffle(shuffledDeck);
  const drawn = [];
  for (let i = 0; i < count; i++) {
    const card = shuffledDeck[i];
    const isReversed = Math.random() < 0.5;
    drawn.push({
      ...card,
      isReversed,
      meaning: isReversed ? card.reversed : card.upright,
    });
  }
  return drawn;
}

/**
 * Renders the tarot card reading to the DOM.
 */
function renderReading() {
  readingContainer.innerHTML = "";
  const cards = drawCards(3);

  cards.forEach((card, index) => {
    const col = document.createElement("div");
    col.className = "col-md-4";

    const cardHTML = `
            <div class="tarot-card-container">
                <div class="tarot-card">
                    <div class="tarot-card-face tarot-card-back">
                        <img src="./assets/images/tarot/card_back.jpg" alt="Card Back">
                    </div>
                    <div class="tarot-card-face tarot-card-front">
                        <img src="./assets/images/tarot/${card.img}" alt="${
      card.name
    }" class="${card.isReversed ? "reversed" : ""}">
                    </div>
                </div>
            </div>
            <div class="tarot-card-info text-center mt-3">
                <h6 class="spread-title">${SPREAD_TITLES[index]}</h6>
                <h5 class="card-name">${card.name} ${
      card.isReversed ? "(Reversed)" : ""
    }</h5>
                <p class="card-meaning small">${card.meaning}</p>
            </div>
        `;
    col.innerHTML = cardHTML;
    readingContainer.appendChild(col);

    // Animate the flip
    setTimeout(() => {
      const cardElement = col.querySelector(".tarot-card");
      cardElement.classList.add("is-flipped");
    }, (index + 1) * 500); // Stagger the flip animation
  });
}

export function init() {
  drawBtn = document.getElementById("draw-cards-btn");
  readingContainer = document.getElementById("tarot-reading-container");

  drawBtn.addEventListener("click", renderReading);

  // Initial placeholder content
  readingContainer.innerHTML = `
        <div class="col-md-4"><div class="tarot-card-placeholder"><p>?</p></div><h6 class="mt-3">Past</h6></div>
        <div class="col-md-4"><div class="tarot-card-placeholder"><p>?</p></div><h6 class="mt-3">Present</h6></div>
        <div class="col-md-4"><div class="tarot-card-placeholder"><p>?</p></div><h6 class="mt-3">Future</h6></div>
    `;
}

export function cleanup() {
  if (drawBtn) {
    drawBtn.removeEventListener("click", renderReading);
  }
}
