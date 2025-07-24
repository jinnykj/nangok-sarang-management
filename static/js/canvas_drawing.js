// HTML5 Canvas Drawing System for Korean Character Practice
class DrawingCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        
        this.setupCanvas();
        this.bindEvents();
    }
    
    setupCanvas() {
        // Set canvas properties
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = '#2c3e50';
        
        // Set canvas background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add guidelines for Korean character writing
        this.drawGuidelines();
    }
    
    drawGuidelines() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Save current context state
        ctx.save();
        
        // Set guideline style
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        // Draw center lines
        ctx.beginPath();
        // Vertical center line
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        // Horizontal center line
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        // Draw quarter lines for better guidance
        ctx.beginPath();
        // Vertical quarter lines
        ctx.moveTo(width / 4, 0);
        ctx.lineTo(width / 4, height);
        ctx.moveTo(3 * width / 4, 0);
        ctx.lineTo(3 * width / 4, height);
        // Horizontal quarter lines
        ctx.moveTo(0, height / 4);
        ctx.lineTo(width, height / 4);
        ctx.moveTo(0, 3 * height / 4);
        ctx.lineTo(width, 3 * height / 4);
        ctx.stroke();
        
        // Restore context state
        ctx.restore();
    }
    
    bindEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // Touch events for mobile devices
        this.canvas.addEventListener('touchstart', this.handleTouch.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouch.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
        
        // Prevent scrolling on touch
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault());
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
    
    getTouchPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (e.touches[0].clientX - rect.left) * scaleX,
            y: (e.touches[0].clientY - rect.top) * scaleY
        };
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
        
        // Start a new path
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        
        this.lastX = pos.x;
        this.lastY = pos.y;
    }
    
    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.ctx.beginPath();
        }
    }
    
    handleTouch(e) {
        e.preventDefault();
        
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                        e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        
        this.canvas.dispatchEvent(mouseEvent);
    }
    
    clear() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Redraw background and guidelines
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGuidelines();
        
        // Reset drawing properties
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 3;
    }
    
    getImageData() {
        return this.canvas.toDataURL('image/png');
    }
    
    loadImageData(dataUrl) {
        const img = new Image();
        img.onload = () => {
            this.clear();
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = dataUrl;
    }
    
    setStrokeColor(color) {
        this.ctx.strokeStyle = color;
    }
    
    setStrokeWidth(width) {
        this.ctx.lineWidth = width;
    }
    
    // Helper method to check if canvas has content
    hasContent() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;
        
        // Check if any pixel is not white (has been drawn on)
        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i] !== 255 || pixels[i + 1] !== 255 || pixels[i + 2] !== 255) {
                return true;
            }
        }
        return false;
    }
}

// Global canvas instance
let drawingCanvas;

// Initialize canvas when modal is shown
function initializeCanvas() {
    try {
        const canvas = document.getElementById('drawingCanvas');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        // Always create new canvas instance
        drawingCanvas = new DrawingCanvas('drawingCanvas');
        console.log('Canvas initialized');
    } catch (error) {
        console.error('Canvas initialization failed:', error);
    }
}

function clearCanvas() {
    if (drawingCanvas) {
        drawingCanvas.clear();
    }
}

function saveDrawing() {
    if (drawingCanvas && drawingCanvas.hasContent()) {
        const imageData = drawingCanvas.getImageData();
        // Save to the current question
        const modal = document.getElementById('drawingModal');
        const questionId = modal.dataset.questionId;
        const stage = modal.dataset.stage;
        
        if (window.levelTest) {
            window.levelTest.saveDrawingAnswer(imageData);
        }
        
        // Close modal
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
    } else {
        alert('먼저 글씨를 써주세요.');
    }
}

function skipDrawing() {
    // Skip drawing question
    const modal = document.getElementById('drawingModal');
    if (modal) {
        const questionId = modal.dataset.questionId;
        const stage = modal.dataset.stage;
        
        if (window.levelTest) {
            window.levelTest.saveDrawingAnswer('SKIPPED');
        }
        
        // Close modal
        if (window.drawingModal) {
            window.drawingModal.hide();
        } else {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        }
    }
}

function setDrawingColor(color) {
    if (drawingCanvas) {
        drawingCanvas.setStrokeColor(color);
    }
}

function setStrokeWidth(width) {
    if (drawingCanvas) {
        drawingCanvas.setStrokeWidth(width);
    }
}

// Initialize canvas when drawing modal is shown
document.addEventListener('DOMContentLoaded', function() {
    const drawingModal = document.getElementById('drawingModal');
    if (drawingModal) {
        drawingModal.addEventListener('shown.bs.modal', function() {
            setTimeout(() => {
                const canvas = document.getElementById('drawingCanvas');
                if (canvas) {
                    // Force canvas recreation if it exists
                    drawingCanvas = new DrawingCanvas('drawingCanvas');
                    console.log('Canvas initialized successfully');
                } else {
                    console.error('Canvas element not found');
                }
            }, 200); // Increased delay for better reliability
        });
    }
});

// Clear canvas function
function clearCanvas() {
    if (drawingCanvas) {
        drawingCanvas.clear();
    }
}

// Save drawing function
function saveDrawing() {
    if (!drawingCanvas) {
        alert('캔버스가 초기화되지 않았습니다.');
        return;
    }
    
    if (!drawingCanvas.hasContent()) {
        alert('글씨를 써주세요.');
        return;
    }
    
    const drawingData = drawingCanvas.getImageData();
    
    // Save to level test if available
    if (window.levelTest) {
        levelTest.saveDrawingAnswer(drawingData);
    }
    
    // Visual feedback
    const saveButton = document.querySelector('[onclick="saveDrawing()"]');
    const originalText = saveButton.innerHTML;
    saveButton.innerHTML = '<i data-feather="check" class="me-2"></i>저장됨';
    saveButton.className = 'btn btn-success';
    
    setTimeout(() => {
        saveButton.innerHTML = originalText;
        saveButton.className = 'btn btn-primary';
        feather.replace();
    }, 2000);
    
    feather.replace();
}

// Color picker functionality
function setDrawingColor(color) {
    if (drawingCanvas) {
        drawingCanvas.setStrokeColor(color);
        
        // Update UI
        document.querySelectorAll('.color-option').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    }
}

// Stroke width functionality
function setStrokeWidth(width) {
    if (drawingCanvas) {
        drawingCanvas.setStrokeWidth(width);
        
        // Update UI
        document.querySelectorAll('.width-option').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    }
}

// Add drawing tools to modal when it's created
document.addEventListener('DOMContentLoaded', function() {
    const modalBody = document.querySelector('#drawingModal .modal-body');
    if (modalBody) {
        // Add color picker
        const colorTools = document.createElement('div');
        colorTools.className = 'drawing-tools mb-3';
        colorTools.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div class="color-picker">
                    <label class="form-label">색상:</label>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-sm btn-outline-dark color-option active" 
                                style="background-color: #2c3e50;" onclick="setDrawingColor('#2c3e50')"></button>
                        <button type="button" class="btn btn-sm btn-outline-primary color-option" 
                                style="background-color: #007bff;" onclick="setDrawingColor('#007bff')"></button>
                        <button type="button" class="btn btn-sm btn-outline-danger color-option" 
                                style="background-color: #dc3545;" onclick="setDrawingColor('#dc3545')"></button>
                        <button type="button" class="btn btn-sm btn-outline-success color-option" 
                                style="background-color: #28a745;" onclick="setDrawingColor('#28a745')"></button>
                    </div>
                </div>
                <div class="width-picker">
                    <label class="form-label">굵기:</label>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-sm btn-outline-secondary width-option" 
                                onclick="setStrokeWidth(1)">가는</button>
                        <button type="button" class="btn btn-sm btn-outline-secondary width-option active" 
                                onclick="setStrokeWidth(3)">보통</button>
                        <button type="button" class="btn btn-sm btn-outline-secondary width-option" 
                                onclick="setStrokeWidth(5)">굵은</button>
                    </div>
                </div>
            </div>
        `;
        
        modalBody.insertBefore(colorTools, modalBody.firstChild.nextSibling);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.target.closest('#drawingModal')) {
        switch(e.key) {
            case 'c':
            case 'C':
                if (e.ctrlKey) {
                    e.preventDefault();
                    clearCanvas();
                }
                break;
            case 's':
            case 'S':
                if (e.ctrlKey) {
                    e.preventDefault();
                    saveDrawing();
                }
                break;
            case 'Escape':
                if (window.drawingModal) {
                    window.drawingModal.hide();
                }
                break;
        }
    }
});

// Add custom styles for drawing tools
const drawingStyle = document.createElement('style');
drawingStyle.textContent = `
    .drawing-tools {
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 0.375rem;
        border: 1px solid #dee2e6;
    }
    
    .color-option, .width-option {
        width: 40px;
        height: 30px;
        margin: 0 2px;
    }
    
    .color-option.active, .width-option.active {
        box-shadow: 0 0 0 2px #007bff;
    }
    
    .canvas-container {
        position: relative;
        display: inline-block;
    }
    
    .canvas-container::before {
        content: '마우스나 터치로 글씨를 써보세요';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #6c757d;
        font-size: 1.1rem;
        pointer-events: none;
        z-index: 1;
    }
    
    .canvas-container.has-content::before {
        display: none;
    }
    
    #drawingCanvas {
        border: 2px solid #dee2e6;
        border-radius: 0.375rem;
        cursor: crosshair;
        touch-action: none;
    }
    
    #drawingCanvas:active {
        cursor: crosshair;
    }
`;

document.head.appendChild(drawingStyle);
