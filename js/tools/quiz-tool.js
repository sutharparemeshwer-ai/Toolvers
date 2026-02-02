// js/tools/quiz-tool.js

let questions = [];
let curr = 0;
let score = 0;

async function fetchQuiz() {
    try {
        const res = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
        const data = await res.json();
        questions = data.results;
        showQuestion();
        document.getElementById('loader').classList.add('d-none');
        document.getElementById('question-box').classList.remove('d-none');
    } catch(e) {
        document.getElementById('quiz-container').innerHTML = '<p class="text-danger">Failed to load quiz.</p>';
    }
}

function showQuestion() {
    if(curr >= questions.length) {
        document.getElementById('question-box').classList.add('d-none');
        document.getElementById('result-box').classList.remove('d-none');
        document.getElementById('final-score').textContent = `${score}/${questions.length}`;
        return;
    }

    const q = questions[curr];
    document.getElementById('q-category').textContent = q.category;
    document.getElementById('q-text').innerHTML = q.question;

    const opts = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
    const list = document.getElementById('options-list');
    
    list.innerHTML = opts.map(o => `
        <button class="btn quiz-opt" onclick="window.checkAns(this, '${o.replace(/'/g, "\'")}')">${o}</button>
    `).join('');
}

window.checkAns = (btn, ans) => {
    const q = questions[curr];
    const correct = q.correct_answer;
    
    // Disable all
    document.querySelectorAll('.quiz-opt').forEach(b => {
        b.disabled = true;
        if(b.textContent === correct) b.classList.add('correct');
    });

    if(ans === correct) {
        score++;
        document.getElementById('score-val').textContent = score;
    } else {
        btn.classList.add('wrong');
    }

    setTimeout(() => {
        curr++;
        showQuestion();
    }, 1500);
};

export function init() {
    fetchQuiz();
}
export function cleanup() {
    window.checkAns = undefined;
}
