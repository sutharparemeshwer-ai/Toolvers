// js/tools/data-visualization-dashboard.js

let chartInstance = null;
let chartControls = null;
let labelsInput, dataInput, updateDataBtn, dataErrorMsg;
let currentChartData = null; // To store the data being used

const CHART_JS_CDN = 'https://cdn.jsdelivr.net/npm/chart.js';

// Sample data for the charts
const defaultSampleData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
        label: 'Monthly Sales (in thousands)',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
            'rgba(99, 255, 132, 0.5)'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(99, 255, 132, 1)'
        ],
        borderWidth: 1,
        fill: true,
    }]
};

/**
 * Dynamically loads a script from a CDN.
 * @param {string} url - The URL of the script to load.
 * @returns {Promise<void>}
 */
function loadScript(url) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.head.appendChild(script);
    });
}

function createChart(type = 'bar', data) {
    const ctx = document.getElementById('data-vis-chart')?.getContext('2d');
    if (!ctx || !data) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: type,
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow chart to fill container height
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: 'white' // Set legend text color to white
                    }
                },
                title: {
                    display: true,
                    text: `${type.charAt(0).toUpperCase() + type.slice(1)} Chart Example`,
                    color: 'white' // Set title color to white
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: 'white' // X-axis labels
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)' // Lighter grid lines for dark background
                    }
                },
                y: {
                    ticks: {
                        color: 'white' // Y-axis labels
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)' // Lighter grid lines for dark background
                    }
                }
            }
        }
    });
}

function parseAndValidateData() {
    dataErrorMsg.textContent = '';
    const labels = labelsInput.value.split(',').map(s => s.trim()).filter(Boolean);
    const dataPoints = dataInput.value.split(',').map(s => parseFloat(s.trim()));

    if (labels.length === 0 || dataPoints.length === 0) {
        dataErrorMsg.textContent = 'Please enter both labels and data.';
        return null;
    }

    if (labels.length !== dataPoints.length) {
        dataErrorMsg.textContent = 'The number of labels must match the number of data points.';
        return null;
    }

    if (dataPoints.some(isNaN)) {
        dataErrorMsg.textContent = 'All data values must be valid numbers.';
        return null;
    }

    // Return a new data object in the correct format
    return {
        labels: labels,
        datasets: [{
            ...defaultSampleData.datasets[0], // Inherit styling from default
            label: 'Custom Data',
            data: dataPoints,
        }]
    };
}

function handleDataUpdate() {
    const newData = parseAndValidateData();
    if (newData) {
        currentChartData = newData;
        const activeChartType = chartControls.querySelector('.btn-primary')?.dataset.chartType || 'bar';
        createChart(activeChartType, currentChartData);
    }
}

function handleControlClick(event) {
    const button = event.target.closest('button');
    if (!button || !button.dataset.chartType) return;

    // Update button styles
    chartControls.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
    });
    button.classList.remove('btn-secondary');
    button.classList.add('btn-primary');

    createChart(button.dataset.chartType, currentChartData);
}

export async function init() {
    await loadScript(CHART_JS_CDN);

    // Get DOM elements
    chartControls = document.getElementById('chart-controls');
    labelsInput = document.getElementById('chart-labels-input');
    dataInput = document.getElementById('chart-data-input');
    updateDataBtn = document.getElementById('update-data-btn');
    dataErrorMsg = document.getElementById('data-error-msg');

    // Set initial state
    currentChartData = defaultSampleData;
    labelsInput.value = currentChartData.labels.join(', ');
    dataInput.value = currentChartData.datasets[0].data.join(', ');

    // Add listeners
    chartControls?.addEventListener('click', handleControlClick);
    updateDataBtn?.addEventListener('click', handleDataUpdate);

    createChart('bar', currentChartData); // Create the default bar chart
}

export function cleanup() {
    chartControls?.removeEventListener('click', handleControlClick);
    updateDataBtn?.removeEventListener('click', handleDataUpdate);
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
}