// js/tools/text-based-adventure-game.js

// DOM Elements
let storyTextEl, choicesContainerEl, restartBtn;

// Game State
let currentSceneId;

// Story Data: A simple graph of scenes
const storyData = {
    start: {
        text: "आप एक धुंधले, ठंडे पत्थर के कमरे में जागते हैं। आप अपने सामने एक भारी लकड़ी का दरवाज़ा और कोने में एक छोटी, धूल भरी तिजोरी देखते हैं। आप क्या करते हैं?",
        choices: [
            { text: "दरवाज़ा खोलने की कोशिश करें", nextScene: "lockedDoor" },
            { text: "तिजोरी का निरीक्षण करें", nextScene: "chest" }
        ]
    },
    lockedDoor: {
        text: "आप बड़े लोहे के हैंडल को खींचते हैं, लेकिन दरवाज़ा बंद है। यह हिलता नहीं है। शायद कहीं कोई चाबी है।",
        choices: [
            { text: "वापस जाकर तिजोरी को देखें", nextScene: "chest" }
        ]
    },
    chest: {
        text: "तिजोरी पुरानी है और खुली हुई है। आप धीरे-धीरे ढक्कन उठाते हैं। अंदर, आपको एक जंग लगी चाबी मिलती है।",
        choices: [
            { text: "चाबी लेकर दरवाज़े पर प्रयास करें", nextScene: "unlockDoor" },
            { text: "चाबी छोड़कर फिर से चारों ओर देखें", nextScene: "start" }
        ]
    },
    unlockDoor: {
        text: "जंग लगी चाबी ताले में बिल्कुल फिट बैठती है। एक ज़ोरदार *क्लिक* के साथ, दरवाज़ा खुल जाता है। आप उसे धकेल कर खोलते हैं और एक लंबे, अंधेरे गलियारे में कदम रखते हैं।",
        choices: [
            { text: "दीवार से मशाल उठाएं", nextScene: "takeTorch" },
            { text: "अंधेरे में आगे बढ़ें", nextScene: "darkHallway" }
        ]
    },
    takeTorch: {
        text: "आप दीवार से जलती हुई मशाल उठाते हैं। अब गलियारा रोशन है। आपको अंत में एक और दरवाज़ा दिखाई देता है।",
        choices: [
            { text: "अंतिम दरवाज़े की ओर बढ़ें", nextScene: "endDoor" }
        ]
    },
    darkHallway: {
        text: "आप अंधेरे में सावधानी से आगे बढ़ते हैं, लेकिन आपका पैर फिसल जाता है और आप एक गहरे गड्ढे में गिर जाते हैं! खेल खत्म।",
        choices: [
            { text: "फिर से खेलें", nextScene: "start" }
        ]
    },
    endDoor: {
        text: "आप गलियारे के अंत में दरवाज़े तक पहुँचते हैं। यह थोड़ा खुला है। अंदर से एक अजीब खर्राटे की आवाज़ आ रही है।",
        choices: [
            { text: "दरवाज़ा धकेल कर खोलें", nextScene: "treasureRoom" },
            { text: "वापस गलियारे में जाएं", nextScene: "takeTorch" }
        ]
    },
    treasureRoom: {
        text: "आप दरवाज़ा खोलते हैं और देखते हैं कि कमरा सोने और जवाहरात से भरा है! एक विशाल ड्रैगन सोने के ढेर पर सो रहा है। आपने खजाना पा लिया है! आप जीत गए!",
        choices: [
            { text: "फिर से खेलें", nextScene: "start" }
        ]
    }
};

/**
 * Renders a scene based on its ID.
 * @param {string} sceneId - The ID of the scene to render from storyData.
 */
function renderScene(sceneId) {
    currentSceneId = sceneId;
    const scene = storyData[sceneId];

    if (!scene) {
        console.error(`Scene "${sceneId}" not found!`);
        return;
    }

    // Update story text
    storyTextEl.textContent = scene.text;

    // Clear old choices
    choicesContainerEl.innerHTML = '';

    // Create and append new choice buttons
    scene.choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary';
        button.textContent = choice.text;
        button.addEventListener('click', () => renderScene(choice.nextScene));
        choicesContainerEl.appendChild(button);
    });
}

/**
 * Starts or restarts the game from the beginning.
 */
function startGame() {
    renderScene('start');
}

export function init() {
    // Get DOM elements
    storyTextEl = document.getElementById('story-text');
    choicesContainerEl = document.getElementById('choices-container');
    restartBtn = document.getElementById('restart-btn');

    // Attach event listeners
    restartBtn?.addEventListener('click', startGame);

    // Start the game
    startGame();
}

export function cleanup() {
    // Remove listeners to prevent memory leaks
    restartBtn?.removeEventListener('click', startGame);
    choicesContainerEl.innerHTML = ''; // Clear any lingering buttons/listeners
}