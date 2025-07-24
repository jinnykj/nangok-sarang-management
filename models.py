from app import db
from datetime import datetime
from sqlalchemy import func

class Learner(db.Model):
    """성인 문해교육 학습자 정보"""
    id = db.Column(db.Integer, primary_key=True)
    
    # 기본 인적사항
    name = db.Column(db.String(100), nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.Text, nullable=False)
    
    # 비상연락처
    emergency_contact1_name = db.Column(db.String(100), nullable=False)
    emergency_contact1_relation = db.Column(db.String(50), nullable=False)
    emergency_contact1_phone = db.Column(db.String(20), nullable=False)
    emergency_contact2_name = db.Column(db.String(100))
    emergency_contact2_relation = db.Column(db.String(50))
    emergency_contact2_phone = db.Column(db.String(20))
    
    # 학습 배경 및 건강 상태
    health_status = db.Column(db.String(20), nullable=False)
    health_details = db.Column(db.String(200))
    surgery_experience = db.Column(db.String(10), nullable=False)
    surgery_details = db.Column(db.String(200))
    learning_experience = db.Column(db.String(10), nullable=False)
    learning_institution = db.Column(db.String(100))
    learning_period = db.Column(db.String(100))
    
    # 입학 경로 및 학습 목적
    enrollment_path = db.Column(db.String(50), nullable=False)
    learning_purpose = db.Column(db.String(50), nullable=False)
    
    # 기초 진단 평가 (자기평가)
    reading_level = db.Column(db.String(50), nullable=False)
    writing_level = db.Column(db.String(50), nullable=False)
    math_level = db.Column(db.String(50), nullable=False)
    
    # 추가 정보
    other_info = db.Column(db.Text)
    
    # 개인정보 동의 및 서명
    privacy_agreement = db.Column(db.Boolean, default=False)  # 개인정보 동의 여부
    digital_signature = db.Column(db.Text)  # 디지털 서명 데이터 (Base64)
    
    # 시스템 관리 필드
    assigned_class = db.Column(db.String(50))  # 예비 중등반, 초등 고급반, 초등 중급반, 초등 초급반
    class_name = db.Column(db.String(50))  # 기쁨반, 은혜반, 지혜반, 바다반
    status = db.Column(db.String(20), default='지원서 작성')  # 지원서 작성, 레벨 테스트, 상담, 반 배정 완료
    academic_status = db.Column(db.String(20), default='재학')  # 재학, 휴학, 중퇴, 졸업
    memo = db.Column(db.Text)  # 관리자 메모
    ai_analysis = db.Column(db.Text)  # AI 분석 결과
    yearly_class_count = db.Column(db.JSON)  # 연도별 반 수 추적 {"2024": 2, "2025": 1}
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    level_tests = db.relationship('LevelTest', backref='learner', lazy=True)
    counselings = db.relationship('Counseling', backref='learner', lazy=True)
    exams = db.relationship('Exam', backref='learner', lazy=True)

class LevelTest(db.Model):
    """레벨 테스트 결과"""
    id = db.Column(db.Integer, primary_key=True)
    learner_id = db.Column(db.Integer, db.ForeignKey('learner.id'), nullable=False)
    
    # 점수별 영역
    vocabulary_score = db.Column(db.Integer, default=0)  # 어휘 점수
    grammar_score = db.Column(db.Integer, default=0)     # 문법 점수
    reading_score = db.Column(db.Integer, default=0)     # 독해 점수
    total_score = db.Column(db.Integer, default=0)       # 총점
    
    # 단계별 상세 결과
    basic_answers = db.Column(db.JSON)      # 기초 단계 답안
    intermediate_answers = db.Column(db.JSON)  # 중급 단계 답안
    advanced_answers = db.Column(db.JSON)   # 고급 단계 답안
    
    # 그림판 데이터
    drawing_data = db.Column(db.Text)       # Canvas 그림 데이터
    
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.Text)            # 상세 평가 내용

class Counseling(db.Model):
    """상담 기록"""
    id = db.Column(db.Integer, primary_key=True)
    learner_id = db.Column(db.Integer, db.ForeignKey('learner.id'), nullable=False)
    counselor_name = db.Column(db.String(100), nullable=False)
    counseling_content = db.Column(db.Text, nullable=False)
    recommendations = db.Column(db.Text)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Exam(db.Model):
    """시험 기록"""
    id = db.Column(db.Integer, primary_key=True)
    learner_id = db.Column(db.Integer, db.ForeignKey('learner.id'), nullable=False)
    exam_name = db.Column(db.String(100), nullable=False)
    exam_date = db.Column(db.Date, nullable=False)
    score = db.Column(db.Integer, nullable=False)
    max_score = db.Column(db.Integer, nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def percentage(self):
        return round((self.score / self.max_score) * 100, 1)

class ConsultationRecord(db.Model):
    """상담 기록 모델"""
    __tablename__ = 'consultation_record'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))  # 이름 (선택사항)
    phone = db.Column(db.String(20), nullable=False)  # 전화번호 (필수)
    consultation_content = db.Column(db.Text)  # 상담 내용
    consultation_date = db.Column(db.Date, nullable=False)  # 날짜
    gender = db.Column(db.String(10))  # 성별
    residence = db.Column(db.String(100))  # 거주지
    consultation_area = db.Column(db.String(50))  # 상담영역 (한글, 영어, 스마트폰)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ConsultationRecord {self.name or "익명"} - {self.phone}>'

class LearnerHistory(db.Model):
    """학습자 이력 기록 모델"""
    __tablename__ = 'learner_history'
    
    id = db.Column(db.Integer, primary_key=True)
    learner_id = db.Column(db.Integer, db.ForeignKey('learner.id'), nullable=False)
    event_type = db.Column(db.String(50), nullable=False)  # 이벤트 유형 (class_assignment, graduation_certification, enrollment, etc.)
    event_date = db.Column(db.Date, nullable=False)  # 이벤트 날짜
    event_title = db.Column(db.String(100), nullable=False)  # 이벤트 제목
    event_description = db.Column(db.Text)  # 이벤트 설명
    previous_value = db.Column(db.String(100))  # 이전 값 (반 변경시 이전 반 이름)
    new_value = db.Column(db.String(100))  # 새 값 (반 변경시 새 반 이름)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.String(50))  # 기록한 사람 (관리자명 등)
    
    # 관계 설정
    learner = db.relationship('Learner', backref=db.backref('history_records', lazy='dynamic', order_by='LearnerHistory.event_date.desc()'))
    
    def __repr__(self):
        return f'<LearnerHistory {self.learner.name} - {self.event_title}>'

class PrivacyConsent(db.Model):
    """개인정보 동의서 모델"""
    __tablename__ = 'privacy_consent'
    
    id = db.Column(db.Integer, primary_key=True)
    learner_id = db.Column(db.Integer, db.ForeignKey('learner.id'), nullable=False)
    consent_content = db.Column(db.Text)  # 동의서 내용 (수정 가능)
    consent_date = db.Column(db.Date, nullable=False)  # 동의 날짜
    consent_name = db.Column(db.String(50), nullable=False)  # 동의자 이름
    signature_data = db.Column(db.Text)  # 서명 데이터 (base64)
    is_agreed = db.Column(db.Boolean, default=True, nullable=False)  # 동의 여부
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    learner = db.relationship('Learner', backref=db.backref('privacy_consent', uselist=False))
    
    def __repr__(self):
        return f'<PrivacyConsent {self.learner.name} - {self.consent_date}>'
