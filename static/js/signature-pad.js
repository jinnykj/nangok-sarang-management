// 서명 패드 JavaScript 구현
class SignaturePad {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        
        // 캔버스 설정
        this.setupCanvas();
        this.bindEvents();
    }
    
    setupCanvas() {
        // 캔버스 배경 흰색으로 설정
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 선 설정
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = '#000';
    }
    
    bindEvents() {
        // 마우스 이벤트
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // 터치 이벤트 (모바일 지원)
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
        
        // 기본 터치 동작 방지
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault());
    }
    
    getEventPos(e) {
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
        const pos = this.getEventPos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getEventPos(e);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        
        this.lastX = pos.x;
        this.lastY = pos.y;
        
        // 서명 데이터 업데이트
        this.updateSignatureData();
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    handleTouchStart(e) {
        const pos = this.getTouchPos(e);
        this.isDrawing = true;
        this.lastX = pos.x;
        this.lastY = pos.y;
    }
    
    handleTouchMove(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getTouchPos(e);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        
        this.lastX = pos.x;
        this.lastY = pos.y;
        
        // 서명 데이터 업데이트
        this.updateSignatureData();
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.setupCanvas();
        this.updateSignatureData();
    }
    
    isEmpty() {
        // 캔버스가 비어있는지 확인 (흰색 배경만 있는지)
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            // RGB 값이 255(흰색)가 아니면 그림이 있음
            if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
                return false;
            }
        }
        return true;
    }
    
    toDataURL() {
        return this.canvas.toDataURL('image/png');
    }
    
    updateSignatureData() {
        // 숨겨진 input 필드에 서명 데이터 저장
        const signatureInput = document.querySelector('input[name="signature_data"]');
        if (signatureInput) {
            signatureInput.value = this.toDataURL();
        }
    }
}

// 전역 함수들
let signaturePad;

function initializeSignaturePad() {
    const canvas = document.getElementById('signatureCanvas');
    if (canvas) {
        signaturePad = new SignaturePad(canvas);
    }
}

function clearSignature() {
    if (signaturePad) {
        signaturePad.clear();
    }
}

function isSignatureEmpty() {
    return signaturePad ? signaturePad.isEmpty() : true;
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeSignaturePad();
    
    // 폼 제출 시 서명 검증
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            const privacyCheckbox = document.querySelector('input[name="privacy_consent"]');
            const signatureRequired = privacyCheckbox && privacyCheckbox.checked;
            
            if (signatureRequired && isSignatureEmpty()) {
                e.preventDefault();
                alert('개인정보 수집 및 이용에 동의하셨습니다. 서명을 완료해주세요.');
                return false;
            }
        });
    }
    
    // 개인정보 동의 체크박스 변경 시 서명 필드 표시/숨김
    const privacyCheckbox = document.querySelector('input[name="privacy_consent"]');
    const signatureContainer = document.querySelector('.signature-container');
    
    if (privacyCheckbox && signatureContainer) {
        function toggleSignatureField() {
            if (privacyCheckbox.checked) {
                signatureContainer.style.display = 'block';
                signatureContainer.parentElement.style.display = 'block';
            } else {
                signatureContainer.style.display = 'none';
                signatureContainer.parentElement.style.display = 'none';
                if (signaturePad) {
                    signaturePad.clear();
                }
            }
        }
        
        privacyCheckbox.addEventListener('change', toggleSignatureField);
        
        // 초기 상태 설정
        toggleSignatureField();
    }
});