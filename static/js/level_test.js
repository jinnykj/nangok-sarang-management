// Level Test Management System
class LevelTest {
    constructor(questions) {
        this.questions = questions;
        this.currentStage = 'basic';
        this.currentQuestionIndex = 0;
        this.stageProgress = { basic: 0, intermediate: 0, advanced: 0 };
        this.correctAnswers = { basic: 0, intermediate: 0, advanced: 0 };
        this.answers = {
            basic_answers: {},
            intermediate_answers: {},
            advanced_answers: {}
        };
        this.drawingData = '';
        this.currentDrawingQuestion = null;
        this.immediateScoring = true;  // 즉시 채점 모드
        
        this.init();
    }
    
    init() {
        this.renderQuestions('basic');
        this.setupEventListeners();
        feather.replace();
    }
    
    setupEventListeners() {
        // Drawing modal events
        const drawingModalElement = document.getElementById('drawingModal');
        if (drawingModalElement) {
            const drawingModal = new bootstrap.Modal(drawingModalElement);
            window.drawingModal = drawingModal;
            
            // Canvas setup when modal is shown
            drawingModalElement.addEventListener('shown.bs.modal', () => {
                console.log('Modal shown, initializing canvas...');
                initializeCanvas();
            });
        } else {
            console.error('Drawing modal element not found');
        }
    }
    
    renderQuestions(stage) {
        const container = document.getElementById(`${stage}Questions`);
        const questions = this.questions[stage];
        
        container.innerHTML = '';
        
        questions.forEach((question, index) => {
            const questionDiv = this.createQuestionElement(question, index, stage);
            container.appendChild(questionDiv);
        });
        
        feather.replace();
    }
    
    createQuestionElement(question, index, stage) {
        const div = document.createElement('div');
        div.className = 'question-item mb-4 p-4 border rounded';
        
        const questionNumber = question.id;
        
        div.innerHTML = `
            <div class="question-header mb-3">
                <h6 class="question-title">
                    <span class="badge bg-primary me-2">${questionNumber}</span>
                    ${question.question}
                </h6>
                ${question.category ? `<small class="text-muted">영역: ${this.getCategoryName(question.category)}</small>` : ''}
            </div>
            <div class="question-content">
                ${this.renderQuestionContent(question, stage)}
            </div>
        `;
        
        return div;
    }
    
    renderQuestionContent(question, stage) {
        switch (question.type) {
            case 'multiple_choice':
                return this.renderMultipleChoice(question, stage);
            case 'drawing':
                return this.renderDrawingQuestion(question, stage);
            case 'reading':
                return this.renderReadingQuestion(question, stage);
            default:
                return '<p class="text-muted">지원되지 않는 문제 유형입니다.</p>';
        }
    }
    
    renderMultipleChoice(question, stage) {
        const options = question.options.map((option, index) => `
            <div class="form-check form-check-lg mb-2">
                <input class="form-check-input" type="radio" name="question_${question.id}" 
                       id="q${question.id}_${index}" value="${index}" 
                       onchange="levelTest.saveAnswerWithFeedback(${question.id}, ${index}, '${stage}', ${question.correct})">
                <label class="form-check-label" for="q${question.id}_${index}">
                    ${option}
                </label>
            </div>
        `).join('');
        
        return `
            <div class="options-container">
                ${options}
                <div id="feedback_${question.id}" class="mt-3"></div>
            </div>
        `;
    }
    
    renderDrawingQuestion(question, stage) {
        return `
            <div class="drawing-question text-center">
                <p class="mb-3">아래 버튼을 클릭하여 글씨를 써주세요.</p>
                <div class="d-flex justify-content-center gap-2">
                    <button type="button" class="btn btn-outline-primary btn-lg" 
                            onclick="levelTest.openDrawingModal(${question.id}, '${question.question.replace(/'/g, '\\\'').replace(/"/g, '\\"')}', '${stage}')">
                        <i data-feather="edit-3" class="me-2"></i>글씨 쓰기
                    </button>
                    <button type="button" class="btn btn-outline-warning" 
                            onclick="levelTest.skipDrawingQuestion(${question.id}, '${stage}')">
                        <i data-feather="skip-forward" class="me-2"></i>건너뛰기
                    </button>
                </div>
                <div id="drawing_status_${question.id}" class="mt-3"></div>
            </div>
        `;
    }
    
    renderReadingQuestion(question, stage) {
        const options = question.options.map((option, index) => `
            <div class="form-check form-check-lg mb-2">
                <input class="form-check-input" type="radio" name="question_${question.id}" 
                       id="q${question.id}_${index}" value="${index}" 
                       onchange="levelTest.saveAnswer(${question.id}, ${index}, '${stage}')">
                <label class="form-check-label" for="q${question.id}_${index}">
                    ${option}
                </label>
            </div>
        `).join('');
        
        return `
            <div class="reading-passage mb-4 p-3 bg-light rounded">
                <div class="passage-text">${question.question.split('\n').join('<br>')}</div>
            </div>
            <div class="options-container">
                ${options}
            </div>
        `;
    }
    
    getCategoryName(category) {
        const categories = {
            'vocabulary': '어휘',
            'grammar': '문법',
            'reading': '독해'
        };
        return categories[category] || category;
    }
    
    saveAnswer(questionId, answer, stage) {
        const stageKey = `${stage}_answers`;
        this.answers[stageKey][questionId] = answer;
        
        // Visual feedback
        const questionElement = document.querySelector(`input[name="question_${questionId}"]:checked`).closest('.question-item');
        questionElement.classList.add('answered');
        
        console.log(`Question ${questionId} answered:`, answer);
    }
    
    saveAnswerWithFeedback(questionId, selectedAnswer, stage, correctAnswer) {
        // 기본 답안 저장
        this.saveAnswer(questionId, selectedAnswer, stage);
        
        // 즉시 피드백 제공
        if (this.immediateScoring) {
            this.provideFeedback(questionId, selectedAnswer, correctAnswer, stage);
        }
        
        // 스테이지별 진행률 업데이트
        this.updateStageProgress(stage);
    }
    
    provideFeedback(questionId, selectedAnswer, correctAnswer, stage) {
        const feedbackDiv = document.getElementById(`feedback_${questionId}`);
        if (!feedbackDiv) return;
        
        const isCorrect = parseInt(selectedAnswer) === parseInt(correctAnswer);
        
        // 정답 수 업데이트
        if (isCorrect) {
            this.correctAnswers[stage]++;
        }
        
        // 피드백 UI 생성
        const feedbackClass = isCorrect ? 'success' : 'danger';
        const feedbackIcon = isCorrect ? 'check-circle' : 'x-circle';
        const feedbackText = isCorrect ? '정답입니다! 👍' : '틀렸습니다. 다시 한번 생각해보세요.';
        
        feedbackDiv.innerHTML = `
            <div class="alert alert-${feedbackClass} d-flex align-items-center mt-2">
                <i data-feather="${feedbackIcon}" class="me-2"></i>
                <span>${feedbackText}</span>
                ${!isCorrect ? `<small class="ms-auto text-muted">정답: ${this.getCorrectOptionText(questionId, correctAnswer, stage)}</small>` : ''}
            </div>
        `;
        
        // 선택지 비활성화
        const options = document.querySelectorAll(`input[name="question_${questionId}"]`);
        options.forEach(option => option.disabled = true);
        
        feather.replace();
        
        // 받침/이중받침 적응형 난이도 조절
        this.adaptiveDifficultyAdjustment(stage, isCorrect);
    }
    
    getCorrectOptionText(questionId, correctAnswer, stage) {
        const question = this.findQuestionById(questionId, stage);
        if (question && question.options) {
            return question.options[correctAnswer];
        }
        return '';
    }
    
    findQuestionById(questionId, stage) {
        return this.questions[stage].find(q => q.id == questionId);
    }
    
    updateStageProgress(stage) {
        this.stageProgress[stage]++;
        const totalQuestions = this.questions[stage].length;
        const progress = Math.round((this.stageProgress[stage] / totalQuestions) * 100);
        
        // 진행률 표시 업데이트
        const progressBar = document.getElementById(`${stage}_progress`);
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.textContent = `${progress}%`;
        }
        
        // 단계 완료 체크
        if (this.stageProgress[stage] >= totalQuestions) {
            this.showStageCompletionModal(stage);
        }
    }
    
    adaptiveDifficultyAdjustment(stage, isCorrect) {
        // 받침 → 이중받침 적응형 난이도 조절
        if (stage === 'basic') {
            const correctRate = this.correctAnswers[stage] / this.stageProgress[stage];
            
            if (correctRate >= 0.8 && this.stageProgress[stage] >= 3) {
                // 80% 이상 정답률일 때 중급 단계로 진입 제안
                this.suggestStageAdvancement('intermediate');
            } else if (correctRate < 0.4 && this.stageProgress[stage] >= 3) {
                // 40% 미만 정답률일 때 기초 단계 추가 연습 제안
                this.suggestAdditionalPractice('basic');
            }
        }
    }
    
    showStageCompletionModal(stage) {
        const correctRate = Math.round((this.correctAnswers[stage] / this.stageProgress[stage]) * 100);
        const stageName = this.getStageDisplayName(stage);
        
        const modal = this.createAdaptiveModal(
            `${stageName} 단계 완료!`,
            `${stageName} 단계를 완료했습니다. 정답률: ${correctRate}%<br>다음 단계로 진행하시겠습니까?`,
            [
                { text: '다음 단계 진행', action: () => this.proceedToNextStage(stage), class: 'btn-primary' },
                { text: '결과 확인', action: () => this.showIntermediateResults(stage), class: 'btn-secondary' }
            ]
        );
        modal.show();
    }
    
    proceedToNextStage(currentStage) {
        const stages = ['basic', 'intermediate', 'advanced'];
        const currentIndex = stages.indexOf(currentStage);
        
        // 현재 모달 닫기
        const modal = bootstrap.Modal.getInstance(document.getElementById('adaptiveModal'));
        if (modal) modal.hide();
        
        if (currentIndex < stages.length - 1) {
            const nextStage = stages[currentIndex + 1];
            this.currentStage = nextStage;
            this.renderQuestions(nextStage);
            
            // 현재 단계 숨기고 다음 단계 표시
            document.getElementById(`${currentStage}Level`).style.display = 'none';
            document.getElementById(`${nextStage}Level`).style.display = 'block';
            
            // 진행 표시 업데이트
            document.getElementById('currentStage').textContent = this.getStageDisplayName(nextStage);
        } else {
            // 모든 단계 완료
            this.showResults();
        }
    }
    
    createAdaptiveModal(title, message, buttons) {
        // 기존 모달 제거
        const existingModal = document.getElementById('adaptiveModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 새 모달 생성
        const modalHtml = `
            <div class="modal fade" id="adaptiveModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title"><i data-feather="zap" class="me-2"></i>${title}</h5>
                        </div>
                        <div class="modal-body text-center py-4">
                            <p class="mb-0">${message}</p>
                        </div>
                        <div class="modal-footer justify-content-center">
                            ${buttons.map((btn, index) => `
                                <button type="button" class="btn ${btn.class}" onclick="window.levelTest.${btn.action.name}('${btn.stage || ''}')" ${index === 0 ? 'autofocus' : ''}>${btn.text}</button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modalElement = document.getElementById('adaptiveModal');
        feather.replace();
        return new bootstrap.Modal(modalElement);
    }
    
    openDrawingModal(questionId, questionText, stage) {
        console.log('Opening drawing modal for question:', questionId);
        this.currentDrawingQuestion = { id: questionId, stage: stage };
        
        const modalElement = document.getElementById('drawingModal');
        if (modalElement) {
            const questionElement = document.getElementById('drawingQuestion');
            if (questionElement) {
                questionElement.textContent = questionText;
            }
            
            // Store question data in modal
            modalElement.dataset.questionId = questionId;
            modalElement.dataset.stage = stage;
            
            // Show modal
            if (window.drawingModal) {
                window.drawingModal.show();
            } else {
                console.error('Drawing modal not initialized');
                alert('글씨 쓰기 기능에 문제가 있습니다. 건너뛰기를 사용해주세요.');
            }
        } else {
            console.error('Drawing modal element not found');
            alert('글씨 쓰기 기능에 문제가 있습니다. 건너뛰기를 사용해주세요.');
        }
    }
    
    saveDrawingAnswer(drawingData) {
        if (this.currentDrawingQuestion) {
            const { id, stage } = this.currentDrawingQuestion;
            const stageKey = `${stage}_answers`;
            this.answers[stageKey][id] = 'drawing_completed';
            this.drawingData = drawingData;
            
            // Update status
            const statusDiv = document.getElementById(`drawing_status_${id}`);
            if (statusDiv) {
                if (drawingData === 'SKIPPED') {
                    statusDiv.innerHTML = `
                        <div class="alert alert-warning">
                            <i data-feather="skip-forward" class="me-2"></i>
                            글씨 쓰기를 건너뛰었습니다.
                        </div>
                    `;
                } else {
                    statusDiv.innerHTML = `
                        <div class="alert alert-success">
                            <i data-feather="check-circle" class="me-2"></i>
                            글씨 쓰기가 완료되었습니다.
                        </div>
                    `;
                }
                feather.replace();
            }
            
            if (window.drawingModal) {
                window.drawingModal.hide();
            }
        }
    }
    
    skipDrawingQuestion(questionId, stage) {
        console.log('Skipping drawing question:', questionId);
        const stageKey = `${stage}_answers`;
        this.answers[stageKey][questionId] = 'drawing_skipped';
        
        // Update status directly
        const statusDiv = document.getElementById(`drawing_status_${questionId}`);
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div class="alert alert-warning">
                    <i data-feather="skip-forward" class="me-2"></i>
                    글씨 쓰기를 건너뛰었습니다.
                </div>
            `;
            feather.replace();
        }
    }
    
    completeStage(stage) {
        // Validate all questions are answered
        const questions = this.questions[stage];
        const stageKey = `${stage}_answers`;
        const answers = this.answers[stageKey];
        
        const unanswered = questions.filter(q => !(q.id in answers));
        
        if (unanswered.length > 0) {
            alert(`다음 문항을 완료해주세요: ${unanswered.map(q => q.id).join(', ')}`);
            return;
        }
        
        // Hide current stage
        document.getElementById(`${stage}Level`).style.display = 'none';
        
        // Show next stage or results
        const stages = ['basic', 'intermediate', 'advanced'];
        const currentIndex = stages.indexOf(stage);
        
        if (currentIndex < stages.length - 1) {
            const nextStage = stages[currentIndex + 1];
            this.currentStage = nextStage;
            this.renderQuestions(nextStage);
            document.getElementById(`${nextStage}Level`).style.display = 'block';
            
            // Update progress indicator
            document.getElementById('currentStage').textContent = this.getStageDisplayName(nextStage);
        } else {
            // Show results
            this.showResults();
        }
    }
    
    getStageDisplayName(stage) {
        const names = {
            'basic': '기초',
            'intermediate': '중급',
            'advanced': '고급'
        };
        return names[stage] || stage;
    }
    
    showResults() {
        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('currentStage').textContent = '완료';
        
        // Submit test results
        this.submitResults();
    }
    
    async submitResults() {
        const resultData = {
            ...this.answers,
            drawing_data: this.drawingData
        };
        
        try {
            const response = await fetch('/submit_level_test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resultData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.displayScores(result);
                
                // 3초 후 적절한 페이지로 리다이렉트
                setTimeout(() => {
                    if (result.redirect_url) {
                        window.location.href = result.redirect_url;
                    } else {
                        // 기본적으로 상담 페이지로 이동
                        window.location.href = '/counseling';
                    }
                }, 3000);
            } else {
                throw new Error(result.error || '테스트 제출에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error submitting test:', error);
            alert('테스트 제출 중 오류가 발생했습니다: ' + error.message);
        }
    }
    
    displayScores(scores) {
        const scoreDisplay = document.getElementById('scoreDisplay');
        scoreDisplay.innerHTML = `
            <div class="score-results">
                <div class="row text-center">
                    <div class="col-md-3 mb-3">
                        <div class="score-card">
                            <div class="score-circle bg-primary text-white">
                                ${scores.vocabulary_score}
                            </div>
                            <h6 class="mt-2">어휘</h6>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="score-card">
                            <div class="score-circle bg-success text-white">
                                ${scores.grammar_score}
                            </div>
                            <h6 class="mt-2">문법</h6>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="score-card">
                            <div class="score-circle bg-info text-white">
                                ${scores.reading_score}
                            </div>
                            <h6 class="mt-2">독해</h6>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="score-card">
                            <div class="score-circle bg-warning text-white">
                                ${scores.total_score}
                            </div>
                            <h6 class="mt-2">총점</h6>
                        </div>
                    </div>
                </div>
                <div class="text-center mt-4">
                    <h5 class="text-primary">예상 배정반</h5>
                    ${this.getClassAssignment(scores.total_score)}
                    <div class="mt-3">
                        <p class="text-muted">3초 후 자동으로 다음 단계로 이동합니다...</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    getClassAssignment(totalScore) {
        if (totalScore >= 80) {
            return '<span class="badge bg-success fs-6">예비 중등반</span>';
        } else if (totalScore >= 60) {
            return '<span class="badge bg-info fs-6">초등 고급반</span>';
        } else if (totalScore >= 40) {
            return '<span class="badge bg-warning fs-6">초등 중급반</span>';
        } else {
            return '<span class="badge bg-primary fs-6">초등 초급반</span>';
        }
    }
}

// Global functions for HTML onclick events
let levelTest;

function initializeLevelTest(questions) {
    levelTest = new LevelTest(questions);
}

function completeBasicLevel() {
    levelTest.completeStage('basic');
}

function completeIntermediateLevel() {
    levelTest.completeStage('intermediate');
}

function completeAdvancedLevel() {
    levelTest.completeStage('advanced');
}

function proceedToCounseling() {
    window.location.href = '/counseling';
}

// Add custom CSS for answered questions
const style = document.createElement('style');
style.textContent = `
    .question-item {
        transition: all 0.3s ease;
    }
    
    .question-item.answered {
        border-color: #28a745 !important;
        background-color: rgba(40, 167, 69, 0.05);
    }
    
    .score-card {
        text-align: center;
    }
    
    .score-circle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.2rem;
    }
`;
document.head.appendChild(style);
