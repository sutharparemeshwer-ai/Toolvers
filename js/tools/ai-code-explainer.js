// js/tools/ai-code-explainer.js
import { Toast } from '../ui.js';

const API_KEY = "AIzaSyAEIGOglo-ydWtyl-o-gtEyqh_URIVCGFQ";
const MODEL = "gemini-2.5-flash"; // Reverted to your previous model

let input, output, btn, lang;

async function fetchWithRetry(prompt, retries = 2) {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
    
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
                    ]
                })
            });

            const data = await res.json();
            
            // Check for Overloaded/Busy status (503)
            if (res.status === 503 || (data.error && data.error.code === 503)) {
                if (i < retries) {
                    console.warn(`Gemini busy (503). Retrying in 2s... (Attempt ${i+1})`);
                    await new Promise(r => setTimeout(r, 2000));
                    continue;
                }
            }

            return data;
        } catch (err) {
            if (i === retries) throw err;
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

async function explain() {
    const code = input.value.trim();
    if (!code) return Toast.show('Input Required', 'Paste some code first.', 'warning');

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Analyzing...';
    output.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-info mb-3" style="width: 3rem; height: 3rem;"></div>
            <h5 class="text-white">Processing Logic...</h5>
            <p class="text-secondary small">AI is currently deconstructing your code structure.</p>
        </div>`;

    const prompt = 
        "You are a Senior Software Engineer. Explain this " + lang.value + " code snippet.\n" +
        "\n" +
        "Structure your response using ONLY these Markdown headers:\n" +
        "\n" +
        "### 📝 Summary\n" +
        "Provide a high-level 2-sentence overview.\n" +
        "\n" +
        "### 🔍 Logic Breakdown\n" +
        "Use a bulleted list to explain step-by-step how the code executes.\n" +
        "\n" +
        "### ⚠️ Potential Issues & Tips\n" +
        "Identify bugs, security flaws, or performance improvements. Use a bulleted list.\n" +
        "\n" +
        "Code to analyze:\n" +
        "```" + lang.value + "\n" +
        code + "\n" +
        "```";

    try {
        const data = await fetchWithRetry(prompt);

        if (data.error) {
            throw new Error(`API Error ${data.error.code}: ${data.error.message}`);
        }
        
        if (!data.candidates || data.candidates.length === 0) {
            if (data.promptFeedback) {
                throw new Error(`Safety Block: ${data.promptFeedback.blockReason}`);
            }
            throw new Error("Empty response from AI.");
        }

        const markdown = data.candidates[0].content.parts[0].text;
        
        if (typeof marked !== 'undefined') {
            output.innerHTML = `<div class="analysis-report-inner animate-fade-in">${marked.parse(markdown)}</div>`;
        } else {
            output.innerHTML = `<pre class="text-white-50 text-wrap p-4">${markdown}</pre>`;
        }
        
        Toast.show('Analysis Ready', 'Report generated successfully.', 'success');

    } catch (e) {
        console.error("Explanation Failed:", e);
        output.innerHTML = `
            <div class="text-center py-5">
                <div class="glass-panel p-4 d-inline-block border-danger border-opacity-25">
                    <i class="fa-solid fa-circle-exclamation text-danger fs-1 mb-3"></i>
                    <h5 class="text-white">AI Analysis Interrupted</h5>
                    <p class="text-secondary small mb-0">${e.message}</p>
                    <button class="btn btn-sm btn-outline-light mt-3" onclick="location.reload()">Refresh Page</button>
                </div>
            </div>`;
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-magnifying-glass me-2"></i> Run AI Analysis';
    }
}

export function init() {
    input = document.getElementById('code-input');
    output = document.getElementById('output-content');
    btn = document.getElementById('explain-btn');
    lang = document.getElementById('lang-select');

    if(btn) btn.onclick = explain;
}

export function cleanup() {
    if(btn) btn.onclick = null;
}