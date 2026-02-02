// js/tools/settings.js
import { Toast } from '../ui.js';

export function init() {
    // Theme Toggle
    const themeToggle = document.getElementById('settings-theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';
    
    if (themeToggle) {
        themeToggle.checked = currentTheme === 'dark';
        
        themeToggle.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            
            if (newTheme === 'light') {
                document.body.classList.add('light-theme');
            } else {
                document.body.classList.remove('light-theme');
            }
            Toast.show('Theme Updated', `Switched to ${newTheme} mode.`, 'success');
        });
    }

    // Clear Data
    document.getElementById('clear-data-btn')?.addEventListener('click', () => {
        if(confirm('Are you sure? This will delete all your saved resumes, tasks, and settings.')) {
            localStorage.clear();
            Toast.show('Data Cleared', 'All local storage has been wiped.', 'warning');
            setTimeout(() => location.reload(), 1500);
        }
    });

    // Export Data (Mockup)
    document.getElementById('export-data-btn')?.addEventListener('click', () => {
        const data = JSON.stringify(localStorage);
        const blob = new Blob([data], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `toolverse-backup-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        
        Toast.show('Export Successful', 'Your data backup has been downloaded.', 'success');
    });
}

export function cleanup() {}
