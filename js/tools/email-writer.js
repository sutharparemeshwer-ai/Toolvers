// js/tools/email-writer.js
import { Toast } from '../ui.js';

const API_KEY = "AIzaSyAEIGOglo-ydWtyl-o-gtEyqh_URIVCGFQ";
const MODEL = "gemini-2.5-flash";

let topicInput, contextInput, outputInput, genBtn, toneSelect;

async function generate() {
    const topic = topicInput.value;
    const context = contextInput.value;
    
    if(!topic && !context) return Toast.show('Input Required', 'Please provide a topic or context.', 'warning');

    genBtn.disabled = true;
    genBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Drafting...';
    
    const prompt = `Write an email.
    Subject/Topic: ${topic}
    Key Points: ${context}
    Tone: ${toneSelect.value}
    
    Format:
    Subject: [Subject Line]
    
    [Body of email]`;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        const data = await res.json();
        const text = data.candidates[0].content.parts[0].text;
        
        outputInput.value = text;
        Toast.show('Draft Ready', 'Email generated successfully.', 'success');

    } catch (e) {
        outputInput.value = "Error: " + e.message;
    } finally {
        genBtn.disabled = false;
        genBtn.innerHTML = '<i class="fa-solid fa-pen-fancy me-2"></i> Write Email';
    }
}

export function init() {
    topicInput = document.getElementById('email-topic');
    contextInput = document.getElementById('email-context');
    outputInput = document.getElementById('email-output');
    genBtn = document.getElementById('generate-btn');
    toneSelect = document.getElementById('email-tone');

    if(genBtn) genBtn.onclick = generate;
    
    document.getElementById('copy-btn').onclick = () => {
        navigator.clipboard.writeText(outputInput.value);
        Toast.show('Copied', 'Draft copied to clipboard.', 'success');
    };
}

export function cleanup() {
    if(genBtn) genBtn.onclick = null;
}