// 성인 문해교육 진단평가 시스템 (실제 성인문해교육 표준 교육과정 기반)

let currentQuestionIndex = 0;
let currentSection = 'basic';
let testResults = {
    basic: [],
    intermediate: [], 
    advanced: []
};
let drawingPads = {};

// 실제 성인 문해 교육 진단평가 문항들 (간소화된 버전)
const ADULT_LITERACY_QUESTIONS = {
    basic: [
        // 1단계: 한글 기초 인식 (5문제)
        {
            type: 'multiple_choice',
            question: '다음 중 자음이 아닌 것은?',
            options: ['ㄱ', 'ㅏ', 'ㄴ', 'ㄷ'],
            correct: 1,
            points: 20
        },
        {
            type: 'multiple_choice',
            question: '"ㄱ + ㅏ"를 합치면?',
            options: ['가', '고', '구', '기'],
            correct: 0,
            points: 20
        },
        {
            type: 'multiple_choice',
            question: '다음 중 받침이 있는 글자는?',
            options: ['가', '강', '고', '구'],
            correct: 1,
            points: 20
        },
        {
            type: 'writing',
            question: '다음 글자를 그림판에 써보세요: <span style="font-size: 2.5em; color: #007bff;">가</span>',
            points: 20
        },
        {
            type: 'writing', 
            question: '다음 글자를 그림판에 써보세요: <span style="font-size: 2.5em; color: #007bff;">나</span>',
            points: 20
        }
    ],
    
    intermediate: [
        // 2단계: 단어 읽기와 받침 (3문제)
        {
            type: 'multiple_choice',
            question: '다음 단어를 올바르게 읽은 것은? <strong style="font-size: 1.5em;">우리</strong>',
            options: ['우리', '오리', '울이', '으리'],
            correct: 0,
            points: 30
        },
        {
            type: 'multiple_choice',
            question: '받침이 있는 단어를 올바르게 읽은 것은? <strong style="font-size: 1.5em;">웃다</strong>',
            options: ['우다', '웃다', '욷다', '웃따'],
            correct: 1,
            points: 35
        },
        {
            type: 'writing',
            question: '다음 단어를 그림판에 써보세요: <span style="font-size: 2.5em; color: #28a745;">집</span>',
            points: 35
        }
    ],
    
    advanced: [
        // 3단계: 문장 읽기와 이해 (2문제)
        {
            type: 'reading',
            passage: '오늘은 날씨가 좋다. 하늘이 맑고 바람이 시원하다.',
            question: '이 글에서 오늘 날씨는 어떻습니까?',
            options: ['좋다', '나쁘다', '추웠다', '더웠다'],
            correct: 0,
            points: 50
        },
        {
            type: 'writing',
            question: '자신의 이름을 그림판에 써보세요.',
            points: 50
        }
    ]
};

function initializeAdultLiteracyTest() {
    console.log('성인 문해 진단평가 시작');
    currentSection = 'basic';
    currentQuestionIndex = 0;
    testResults = { basic: [], intermediate: [], advanced: [] };
    drawingPads = {};
    
    displayCurrentQuestion();
}

function displayCurrentQuestion() {
    const questions = ADULT_LITERACY_QUESTIONS[currentSection];
    if (currentQuestionIndex >= questions.length) {
        if (currentSection === 'basic') {
            currentSection = 'intermediate';
            currentQuestionIndex = 0;
        } else if (currentSection === 'intermediate') {
            currentSection = 'advanced';
            currentQuestionIndex = 0;
        } else {
            showTestCompletionModal();
            return;
        }
    }
    
    const question = questions[currentQuestionIndex];
    const questionContainer = document.getElementById('question-container');
    
    if (!questionContainer) {
        console.error('question-container not found');
        return;
    }
    
    // 진행률 업데이트
    updateProgress();
    
    let html = `
        <div class="card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="card-title mb-0">
                        ${getSectionName(currentSection)} - 문제 ${currentQuestionIndex + 1}
                    </h5>
                    <span class="badge bg-primary">${question.points}점</span>
                </div>
                
                <div class="question-content mb-4">
                    ${question.passage ? `<div class="alert alert-info"><strong>다음 글을 읽고 답하세요:</strong><br>${question.passage}</div>` : ''}
                    <p class="fs-5">${question.question}</p>
                </div>
    `;
    
    if (question.type === 'multiple_choice' || question.type === 'reading') {
        html += '<div class="options-container">';
        question.options.forEach((option, index) => {
            html += `
                <div class="form-check mb-2">
                    <input class="form-check-input" type="radio" name="answer" id="option${index}" value="${index}">
                    <label class="form-check-label fs-6" for="option${index}">
                        ${index + 1}. ${option}
                    </label>
                </div>
            `;
        });
        html += '</div>';
        
    } else if (question.type === 'writing') {
        const canvasId = `writing-canvas-${currentSection}-${currentQuestionIndex}`;
        const clearBtnId = `clear-btn-${currentSection}-${currentQuestionIndex}`;
        
        html += `
            <div class="writing-container">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="form-label">그림판에 글씨를 써주세요:</label>
                    <button type="button" class="btn btn-outline-secondary btn-sm" id="${clearBtnId}">
                        지우기
                    </button>
                </div>
                <div class="canvas-container border rounded" style="background: #f8f9fa;">
                    <canvas id="${canvasId}" width="400" height="200" style="width: 100%; height: 200px; cursor: crosshair;"></canvas>
                </div>
                <small class="text-muted">마우스나 터치로 글씨를 써보세요.</small>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
        
        <div class="text-center mt-4">
            <button type="button" class="btn btn-outline-secondary me-2" onclick="previousQuestion()" ${currentQuestionIndex === 0 && currentSection === 'basic' ? 'disabled' : ''}>
                이전
            </button>
            <button type="button" class="btn btn-primary" onclick="nextQuestion()">
                다음
            </button>
        </div>
    `;
    
    questionContainer.innerHTML = html;
    
    // 쓰기 문제인 경우 그림판 초기화
    if (question.type === 'writing') {
        const canvasId = `writing-canvas-${currentSection}-${currentQuestionIndex}`;
        const clearBtnId = `clear-btn-${currentSection}-${currentQuestionIndex}`;
        setTimeout(() => {
            const canvas = document.getElementById(canvasId);
            if (canvas) {
                drawingPads[`${currentSection}-${currentQuestionIndex}`] = new DrawingPad(canvasId, clearBtnId);
            }
        }, 50);
    }
}

function getSectionName(section) {
    const names = {
        'basic': '1단계 (기초)',
        'intermediate': '2단계 (중급)', 
        'advanced': '3단계 (고급)'
    };
    return names[section] || section;
}

function saveCurrentAnswer() {
    const questions = ADULT_LITERACY_QUESTIONS[currentSection];
    const question = questions[currentQuestionIndex];
    
    let answer = null;
    let isCorrect = false;
    let score = 0;
    
    if (question.type === 'multiple_choice' || question.type === 'reading') {
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        if (selectedOption) {
            answer = parseInt(selectedOption.value);
            isCorrect = answer === question.correct;
            score = isCorrect ? question.points : 0;
        }
    } else if (question.type === 'writing') {
        const padKey = `${currentSection}-${currentQuestionIndex}`;
        const drawingPad = drawingPads[padKey];
        if (drawingPad && !drawingPad.isEmpty()) {
            answer = drawingPad.getImageData();
            // 쓰기 문제는 작성했으면 부분 점수 부여
            score = question.points * 0.8; // 80% 점수 부여
            isCorrect = true;
        }
    }
    
    testResults[currentSection][currentQuestionIndex] = {
        question: question.question,
        answer: answer,
        correct: question.correct || null,
        isCorrect: isCorrect,
        score: score,
        points: question.points
    };
}

function nextQuestion() {
    saveCurrentAnswer();
    currentQuestionIndex++;
    displayCurrentQuestion();
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayCurrentQuestion();
    } else if (currentSection !== 'basic') {
        // 이전 섹션으로
        if (currentSection === 'intermediate') {
            currentSection = 'basic';
            currentQuestionIndex = ADULT_LITERACY_QUESTIONS.basic.length - 1;
        } else if (currentSection === 'advanced') {
            currentSection = 'intermediate';
            currentQuestionIndex = ADULT_LITERACY_QUESTIONS.intermediate.length - 1;
        }
        displayCurrentQuestion();
    }
}

function updateProgress() {
    const totalQuestions = Object.values(ADULT_LITERACY_QUESTIONS).reduce((sum, section) => sum + section.length, 0);
    const completedQuestions = Object.keys(testResults).reduce((sum, section) => {
        return sum + Object.keys(testResults[section]).length;
    }, 0) + currentQuestionIndex;
    
    const progressPercent = Math.round((completedQuestions / totalQuestions) * 100);
    
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('#progress-text');
    
    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
        progressBar.setAttribute('aria-valuenow', progressPercent);
    }
    
    if (progressText) {
        progressText.textContent = `${completedQuestions}/${totalQuestions} 문제 완료`;
    }
}

function calculateTotalScore() {
    let totalScore = 0;
    let maxScore = 0;
    
    Object.values(testResults).forEach(sectionResults => {
        Object.values(sectionResults).forEach(result => {
            totalScore += result.score || 0;
            maxScore += result.points || 0;
        });
    });
    
    return { totalScore, maxScore };
}

function showTestCompletionModal() {
    const { totalScore, maxScore } = calculateTotalScore();
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    let classLevel = '';
    if (percentage >= 80) {
        classLevel = '예비 중등반';
    } else if (percentage >= 60) {
        classLevel = '초등 고급반';
    } else if (percentage >= 40) {
        classLevel = '초등 중급반';
    } else {
        classLevel = '초등 초급반';
    }
    
    const modal = new bootstrap.Modal(document.getElementById('completionModal'));
    document.getElementById('final-score').textContent = `${totalScore}/${maxScore} (${percentage}%)`;
    document.getElementById('recommended-class').textContent = classLevel;
    
    modal.show();
}

async function submitAdultLiteracyTest() {
    try {
        console.log('Submitting test results:', testResults);
        
        const response = await fetch('/level-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testResults)
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.redirect) {
                window.location.href = result.redirect;
            } else {
                window.location.href = '/counseling';
            }
        } else {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            alert('테스트 제출 중 오류가 발생했습니다: ' + response.status);
        }
    } catch (error) {
        console.error('Test submission error:', error);
        alert('테스트 제출 중 오류가 발생했습니다: ' + error.message);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeAdultLiteracyTest();
});