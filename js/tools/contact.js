// js/tools/contact.js
const FORMSPREE_URL = "https://formspree.io/f/mvgwbwaq"; // 🔁 replace with your actual endpoint

export function init() {
  const form = document.getElementById('contact-form');
  if (form) form.addEventListener('submit', handleSubmit);
}

export function cleanup() {
  const form = document.getElementById('contact-form');
  if (form) form.removeEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const statusDiv = document.getElementById('form-status');
  statusDiv.innerHTML = `<div class="alert alert-info">Sending...</div>`;

  try {
    const formData = new FormData(form);
    const response = await fetch(FORMSPREE_URL, {
      method: "POST",
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      statusDiv.innerHTML = `<div class="alert alert-success">✅ Message sent successfully!</div>`;
      form.reset();
    } else {
      throw new Error('Formspree submission failed');
    }
  } catch (err) {
    statusDiv.innerHTML = `<div class="alert alert-danger">❌ Something went wrong. Please try again later.</div>`;
    console.error(err);
  }
}
