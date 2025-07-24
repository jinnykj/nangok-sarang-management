// 음성 인식 관련 변수
let mediaRecorder;
let audioChunks = [];
let recordingTimer;
let recordingStartTime;

// 페이지 로드 시 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', function() {
    console.log('Voice recording system initialized');
    
    // 음성 녹음 시작 버튼
    const startBtn = document.getElementById('startRecording');
    if (startBtn) {
        startBtn.addEventListener('click', async function() {
            console.log('Start recording clicked');
            
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                
                mediaRecorder.ondataavailable = function(event) {
                    if (event.data.size > 0) {
                        audioChunks.push(event.data);
                        console.log('Audio chunk received:', event.data.size, 'bytes');
                    }
                };
                
                mediaRecorder.onstop = function() {
                    console.log('MediaRecorder stopped, total chunks:', audioChunks.length);
                    stream.getTracks().forEach(track => track.stop());
                };
                
                // 더 짧은 간격으로 데이터 수집
                mediaRecorder.start(1000); // 1초마다 데이터 수집
                recordingStartTime = Date.now();
                
                // UI 업데이트
                startBtn.disabled = true;
                const stopBtn = document.getElementById('stopRecording');
                if (stopBtn) stopBtn.disabled = false;
                
                const statusDiv = document.getElementById('recordingStatus');
                if (statusDiv) statusDiv.classList.remove('d-none');
                
                // 타이머 시작
                recordingTimer = setInterval(updateRecordingTime, 1000);
                
            } catch (error) {
                alert('마이크 접근 권한이 필요합니다.');
                console.error('Error accessing microphone:', error);
            }
        });
    }

    // 음성 녹음 중지 버튼
    const stopBtn = document.getElementById('stopRecording');
    if (stopBtn) {
        stopBtn.addEventListener('click', async function() {
            console.log('Stop recording clicked');
            
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                console.log('Stopping recording...');
                mediaRecorder.stop();
                
                // UI 업데이트
                const startBtn = document.getElementById('startRecording');
                if (startBtn) startBtn.disabled = false;
                stopBtn.disabled = true;
                
                const statusDiv = document.getElementById('recordingStatus');
                if (statusDiv) statusDiv.classList.add('d-none');
                
                // 타이머 중지
                clearInterval(recordingTimer);
                
                // 자동으로 텍스트 변환 시작
                await transcribeAudio();
            } else {
                console.log('MediaRecorder not active or inactive');
            }
        });
    }

    // AI 요약 생성 버튼
    const summarizeBtn = document.getElementById('summarizeVoice');
    if (summarizeBtn) {
        summarizeBtn.addEventListener('click', async function() {
            const transcriptionText = document.getElementById('transcriptionText').textContent;
            
            if (!transcriptionText.trim()) {
                alert('먼저 음성을 녹음하고 변환해주세요.');
                return;
            }
            
            const button = this;
            const originalText = button.innerHTML;
            button.innerHTML = '<i data-feather="loader" class="me-1"></i>AI 분석중...';
            button.disabled = true;
            
            try {
                const response = await fetch('/summarize-counseling', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: transcriptionText,
                        learner_id: window.learnerId
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    displaySummary(result.summary);
                } else {
                    alert('AI 요약에 실패했습니다: ' + result.error);
                }
                
            } catch (error) {
                alert('AI 요약 중 오류가 발생했습니다.');
                console.error('Summary error:', error);
            } finally {
                button.innerHTML = originalText;
                button.disabled = false;
                feather.replace();
            }
        });
    }

    // 기타 버튼들
    const addBtn = document.getElementById('addToContent');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            const transcriptionText = document.getElementById('transcriptionText').textContent;
            const counselingContent = document.getElementById('counseling_content');
            
            const currentContent = counselingContent.value;
            const newContent = currentContent + (currentContent ? '\n\n' : '') + 
                              '[음성 녹음 내용]\n' + transcriptionText;
            
            counselingContent.value = newContent;
            
            // 텍스트 영역 자동 크기 조정
            counselingContent.style.height = 'auto';
            counselingContent.style.height = counselingContent.scrollHeight + 'px';
            
            // 변환 결과 숨기기
            document.getElementById('transcriptionPreview').classList.add('d-none');
        });
    }

    const clearBtn = document.getElementById('clearTranscription');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            document.getElementById('transcriptionPreview').classList.add('d-none');
            document.getElementById('transcriptionText').textContent = '';
            audioChunks = [];
            const summarizeBtn = document.getElementById('summarizeVoice');
            if (summarizeBtn) summarizeBtn.disabled = true;
        });
    }

    const applyBtn = document.getElementById('applySummary');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            const summaryContent = document.getElementById('summaryContent').textContent;
            const recommendationsField = document.getElementById('recommendations');
            
            // 추천사항 필드에 AI 요약의 권장사항 추가
            const currentRecommendations = recommendationsField.value;
            const newRecommendations = currentRecommendations + (currentRecommendations ? '\n\n' : '') +
                                      '[AI 분석 결과]\n' + summaryContent;
            
            recommendationsField.value = newRecommendations;
            
            // 텍스트 영역 자동 크기 조정
            recommendationsField.style.height = 'auto';
            recommendationsField.style.height = recommendationsField.scrollHeight + 'px';
            
            // 요약 결과 숨기기
            document.getElementById('aiSummaryResult').classList.add('d-none');
        });
    }
});

// 음성을 텍스트로 변환하는 함수
async function transcribeAudio() {
    console.log('Transcribing audio, chunks:', audioChunks.length);
    
    if (audioChunks.length === 0) {
        console.log('No audio chunks to transcribe');
        alert('녹음된 오디오가 없습니다. 다시 녹음해주세요.');
        return;
    }
    
    const statusDiv = document.createElement('div');
    statusDiv.className = 'alert alert-info mt-2';
    statusDiv.innerHTML = '<i data-feather="loader" class="me-2"></i>음성을 텍스트로 변환중...';
    document.querySelector('.voice-recording-controls').appendChild(statusDiv);
    
    try {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        console.log('Audio blob size:', audioBlob.size, 'bytes');
        
        if (audioBlob.size === 0) {
            throw new Error('녹음된 오디오 데이터가 없습니다.');
        }
        
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        
        const response = await fetch('/transcribe-audio', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('transcriptionText').textContent = result.text;
            document.getElementById('transcriptionPreview').classList.remove('d-none');
            
            const summarizeBtn = document.getElementById('summarizeVoice');
            if (summarizeBtn) summarizeBtn.disabled = false;
        } else {
            alert('음성 변환에 실패했습니다: ' + result.error);
        }
        
    } catch (error) {
        alert('음성 변환 중 오류가 발생했습니다.');
        console.error('Transcription error:', error);
    } finally {
        if (statusDiv && statusDiv.parentNode) {
            statusDiv.remove();
        }
        feather.replace();
    }
}

// 녹음 시간 업데이트 함수
function updateRecordingTime() {
    if (!recordingStartTime) return;
    
    const elapsed = Date.now() - recordingStartTime;
    const seconds = Math.floor(elapsed / 1000) % 60;
    const minutes = Math.floor(elapsed / (1000 * 60));
    
    const timeDisplay = document.getElementById('recordingTime');
    if (timeDisplay) {
        timeDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// AI 요약 결과 표시 함수
function displaySummary(summary) {
    const summaryHtml = `
        <div class="summary-section mb-3">
            <h6>🎯 주요 내용</h6>
            <p>${summary.main_points || '주요 내용이 확인되지 않았습니다.'}</p>
        </div>
        <div class="summary-section mb-3">
            <h6>💭 학습자 특성</h6>
            <p>${summary.learner_characteristics || '학습자 특성 분석이 제공되지 않았습니다.'}</p>
        </div>
        <div class="summary-section mb-3">
            <h6>📚 권장 사항</h6>
            <p>${summary.recommendations || '구체적인 권장사항이 제공되지 않았습니다.'}</p>
        </div>
        <div class="summary-section">
            <h6>📋 후속 조치</h6>
            <p>${summary.follow_up || '후속 조치가 명시되지 않았습니다.'}</p>
        </div>
    `;
    
    document.getElementById('summaryContent').innerHTML = summaryHtml;
    document.getElementById('aiSummaryResult').classList.remove('d-none');
    
    // 스크롤을 요약 결과로 이동
    document.getElementById('aiSummaryResult').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}