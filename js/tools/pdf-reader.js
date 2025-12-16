export async function init() {
    const uploadInput = document.getElementById('pdf-upload');
    const browseBtn = document.getElementById('browse-btn');
    const uploadContainer = document.getElementById('upload-container');
    const pdfToolbar = document.getElementById('pdf-toolbar');
    const viewerContainer = document.getElementById('pdf-viewer-container');
    const canvas = document.getElementById('the-canvas');
    const ctx = canvas.getContext('2d');
    const pdfLoader = document.getElementById('pdf-loader');

    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    let scale = 1.0;
    let minScale = 0.5;
    let maxScale = 3.0;

    // --- Dynamic Library Loading ---
    if (typeof window.pdfjsLib === 'undefined') {
        // Show generic loader or disable interaction while loading lib
        browseBtn.disabled = true;
        browseBtn.textContent = 'Loading Library...';
        
        try {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
            // Set worker
            if (window.pdfjsLib) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }
            browseBtn.disabled = false;
            browseBtn.textContent = 'Browse File';
        } catch (err) {
            console.error('Failed to load PDF.js', err);
            browseBtn.textContent = 'Library Error';
            alert('Could not load PDF viewer library. Please check your internet connection.');
            return;
        }
    } else {
        // Ensure worker is set even if lib was already loaded
        if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
             window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
    }

    // --- Helper to load script ---
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // --- Event Listeners ---
    browseBtn.addEventListener('click', () => uploadInput.click());

    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            loadPDF(file);
        } else {
            alert('Please select a valid PDF file.');
        }
    });

    // Drag & Drop
    uploadContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadContainer.style.backgroundColor = 'var(--primary-accent-glow)';
        uploadContainer.style.borderColor = 'var(--primary-accent)';
    });

    uploadContainer.addEventListener('dragleave', () => {
        uploadContainer.style.backgroundColor = '';
        uploadContainer.style.borderColor = 'var(--border-color)';
    });

    uploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadContainer.style.backgroundColor = '';
        uploadContainer.style.borderColor = 'var(--border-color)';
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            loadPDF(file);
        } else {
            alert('Please drop a valid PDF file.');
        }
    });

    // Navigation Buttons
    document.getElementById('prev-page').addEventListener('click', onPrevPage);
    document.getElementById('next-page').addEventListener('click', onNextPage);
    document.getElementById('zoom-in').addEventListener('click', onZoomIn);
    document.getElementById('zoom-out').addEventListener('click', onZoomOut);

    /**
     * Loads the PDF file using PDF.js
     */
    function loadPDF(file) {
        // Show viewer, hide upload
        uploadContainer.classList.add('d-none');
        viewerContainer.classList.remove('d-none');
        pdfToolbar.classList.remove('d-none');
        pdfLoader.classList.remove('d-none'); // Show spinner

        const fileReader = new FileReader();
        fileReader.onload = function() {
            const typedarray = new Uint8Array(this.result);

            if (typeof window.pdfjsLib === 'undefined') {
                alert('PDF Library not loaded. Please refresh the page.');
                return;
            }

            const loadingTask = window.pdfjsLib.getDocument(typedarray);
            loadingTask.promise.then((pdf) => {
                pdfDoc = pdf;
                document.getElementById('page-count').textContent = pdf.numPages;
                
                // Initial render
                pageNum = 1;
                renderPage(pageNum);
                pdfLoader.classList.add('d-none');
            }, (reason) => {
                console.error('Error loading PDF:', reason);
                alert('Error loading PDF: ' + reason.message);
                pdfLoader.classList.add('d-none');
                // Reset UI
                viewerContainer.classList.add('d-none');
                pdfToolbar.classList.add('d-none');
                uploadContainer.classList.remove('d-none');
            });
        };
        fileReader.readAsArrayBuffer(file);
    }

    /**
     * Renders a specific page
     */
    function renderPage(num) {
        pageRendering = true;
        
        // Fetch page
        pdfDoc.getPage(num).then((page) => {
            const viewport = page.getViewport({scale: scale});
            
            // Set dimensions
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render context
            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            const renderTask = page.render(renderContext);

            // Wait for render to finish
            renderTask.promise.then(() => {
                pageRendering = false;
                if (pageNumPending !== null) {
                    // New page requested while rendering
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
            });
        });

        // Update page counters
        document.getElementById('page-num').textContent = num;

        // Update button states
        document.getElementById('prev-page').disabled = (num <= 1);
        document.getElementById('next-page').disabled = (num >= pdfDoc.numPages);
    }

    /**
     * Queue a page for rendering (if another is rendering)
     */
    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }

    /**
     * Previous Page
     */
    function onPrevPage() {
        if (pageNum <= 1) return;
        pageNum--;
        queueRenderPage(pageNum);
    }

    /**
     * Next Page
     */
    function onNextPage() {
        if (pageNum >= pdfDoc.numPages) return;
        pageNum++;
        queueRenderPage(pageNum);
    }

    /**
     * Zoom In
     */
    function onZoomIn() {
        if (scale >= maxScale) return;
        scale += 0.25;
        // Re-render current page with new scale
        queueRenderPage(pageNum);
    }

    /**
     * Zoom Out
     */
    function onZoomOut() {
        if (scale <= minScale) return;
        scale -= 0.25;
        queueRenderPage(pageNum);
    }
}

export function cleanup() {
    // Optional: Cancel rendering or release memory if needed
    // PDF.js handles mostly everything, but we could nullify pdfDoc
}
