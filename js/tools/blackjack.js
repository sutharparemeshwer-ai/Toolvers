// js/tools/blackjack.js

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

let deck = [], pHand = [], dHand = [];
let bank = 1000, bet = 0;
let gameActive = false;

function createDeck() {
    deck = [];
    SUITS.forEach(s => {
        RANKS.forEach(r => {
            deck.push({ r, s, val: getValue(r) });
        });
    });
    deck.sort(() => Math.random() - 0.5);
}

function getValue(r) {
    if(['J','Q','K'].includes(r)) return 10;
    if(r === 'A') return 11;
    return parseInt(r);
}

function getScore(hand) {
    let score = hand.reduce((a, c) => a + c.val, 0);
    let aces = hand.filter(c => c.r === 'A').length;
    while(score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    return score;
}

function renderCard(c, hidden = false) {
    if(hidden) return `<div class="playing-card back"></div>`;
    const color = (c.s === '♥' || c.s === '♦') ? 'red' : 'black';
    return `
        <div class="playing-card ${color} animate-fade-in">
            <div class="top-left"><span>${c.r}</span><span class="suit-sm">${c.s}</span></div>
            <div>${c.s}</div>
            <div class="bottom-right"><span>${c.r}</span><span class="suit-sm">${c.s}</span></div>
        </div>
    `;
}

function render() {
    const bankEl = document.getElementById('bank-val');
    const betEl = document.getElementById('current-bet');
    const pHandEl = document.getElementById('player-hand');
    const dHandEl = document.getElementById('dealer-hand');
    const pScoreEl = document.getElementById('player-score');
    const dScoreEl = document.getElementById('dealer-score');
    const dealBtn = document.getElementById('deal-btn');

    if (bankEl) bankEl.textContent = bank;
    if (betEl) betEl.textContent = bet;
    
    if (pHandEl) pHandEl.innerHTML = pHand.map(c => renderCard(c)).join('');
    if (dHandEl) dHandEl.innerHTML = dHand.map((c, i) => renderCard(c, i === 0 && gameActive)).join('');
    
    if (pScoreEl) pScoreEl.textContent = getScore(pHand);
    if (dScoreEl) dScoreEl.textContent = gameActive ? '?' : getScore(dHand);

    if (dealBtn) dealBtn.disabled = bet === 0 || gameActive;
}

function placeBet(amt) {
    if(gameActive) return;
    if(amt > bank) {
        alert("Not enough chips!");
        return;
    }
    bet += amt;
    bank -= amt;
    render();
}

function clearBet() {
    if(gameActive) return;
    bank += bet;
    bet = 0;
    render();
}

function deal() {
    if(bet === 0) return;
    gameActive = true;
    createDeck();
    pHand = [deck.pop(), deck.pop()];
    dHand = [deck.pop(), deck.pop()];
    
    document.getElementById('bet-controls').classList.add('d-none');
    document.getElementById('action-controls').classList.remove('d-none');
    document.getElementById('msg-area').textContent = '';
    
    render();
    
    if(getScore(pHand) === 21) {
        // Natural Blackjack check immediately
        stand(); 
    }
}

function hit() {
    pHand.push(deck.pop());
    render();
    if(getScore(pHand) > 21) endRound('Bust! Dealer Wins.');
}

function stand() {
    // Dealer rule: hit on soft 17? Usually hit < 17.
    while(getScore(dHand) < 17) {
        dHand.push(deck.pop());
    }
    render();
    
    const p = getScore(pHand);
    const d = getScore(dHand);
    
    if (p > 21) {
        endRound('Bust! Dealer Wins.');
    } else if (d > 21) {
        bank += bet * 2;
        endRound('Dealer Busts! You Win!');
    } else if (p > d) {
        bank += bet * 2;
        endRound('You Win!');
    } else if (d > p) {
        endRound('Dealer Wins.');
    } else {
        bank += bet;
        endRound('Push.');
    }
}

function endRound(msg) {
    gameActive = false;
    render(); // Reveal dealer card
    document.getElementById('msg-area').textContent = msg;
    
    setTimeout(() => {
        // Reset state for next round
        bet = 0;
        pHand = [];
        dHand = [];
        document.getElementById('action-controls').classList.add('d-none');
        document.getElementById('bet-controls').classList.remove('d-none');
        render();
    }, 2500); // 2.5s delay to see result
}

export function init() {
    window.requestAnimationFrame(() => {
        const dealBtn = document.getElementById('deal-btn');
        const hitBtn = document.getElementById('hit-btn');
        const standBtn = document.getElementById('stand-btn');
        const betDisplay = document.getElementById('current-bet');

        if(dealBtn) dealBtn.onclick = deal;
        if(hitBtn) hitBtn.onclick = hit;
        if(standBtn) standBtn.onclick = stand;
        
        // Click the bet badge to clear bet
        if(betDisplay) betDisplay.parentElement.onclick = clearBet;
        if(betDisplay) betDisplay.parentElement.style.cursor = 'pointer';
        if(betDisplay) betDisplay.parentElement.title = 'Click to Clear Bet';

        document.querySelectorAll('.chip-btn').forEach(b => {
            b.onclick = () => placeBet(parseInt(b.dataset.val));
        });
        
        // Reset state on init
        bet = 0;
        pHand = [];
        dHand = [];
        gameActive = false;
        render();
    });
}

export function cleanup() {
    //
}
