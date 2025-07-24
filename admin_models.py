from app import db
from datetime import datetime
from sqlalchemy import func

class AdminUser(db.Model):
    """관리자 사용자 모델"""
    __tablename__ = 'admin_user'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='staff')  # admin, teacher, counselor, staff
    permissions = db.Column(db.String(50), default='read_only')  # all, read_only, learner_management, test_management
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<AdminUser {self.username}>'

class SystemSettings(db.Model):
    """시스템 설정 모델"""
    __tablename__ = 'system_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    setting_key = db.Column(db.String(100), unique=True, nullable=False)
    setting_value = db.Column(db.Text)
    setting_type = db.Column(db.String(20), default='string')  # string, integer, boolean, json
    description = db.Column(db.String(200))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.String(50))
    
    def __repr__(self):
        return f'<SystemSettings {self.setting_key}>'

class ContentPage(db.Model):
    """콘텐츠 페이지 모델"""
    __tablename__ = 'content_page'
    
    id = db.Column(db.Integer, primary_key=True)
    page_type = db.Column(db.String(50), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.String(50))
    
    def __repr__(self):
        return f'<ContentPage {self.page_type}>'

class SystemLog(db.Model):
    """시스템 로그 모델"""
    __tablename__ = 'system_log'
    
    id = db.Column(db.Integer, primary_key=True)
    log_type = db.Column(db.String(50), nullable=False)  # login, data_change, system_error, export
    user_id = db.Column(db.Integer, db.ForeignKey('admin_user.id'))
    username = db.Column(db.String(50))
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 관계 설정
    user = db.relationship('AdminUser', backref=db.backref('logs', lazy='dynamic'))
    
    def __repr__(self):
        return f'<SystemLog {self.log_type} - {self.action}>'

class TestQuestion(db.Model):
    """테스트 문제 모델"""
    __tablename__ = 'test_question'
    
    id = db.Column(db.Integer, primary_key=True)
    level = db.Column(db.String(20), nullable=False)  # basic, intermediate, advanced
    question_type = db.Column(db.String(20), nullable=False)  # multiple_choice, drawing, reading
    question_text = db.Column(db.Text, nullable=False)
    options = db.Column(db.JSON)  # 객관식 선택지 배열
    correct_answer = db.Column(db.Integer)  # 정답 인덱스 (0-3)
    category = db.Column(db.String(20), nullable=False)  # vocabulary, grammar, reading
    points = db.Column(db.Integer, default=10)  # 배점
    order_index = db.Column(db.Integer, default=0)  # 문제 순서
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.String(50))
    
    def __repr__(self):
        return f'<TestQuestion {self.level} - {self.question_type}>'
    
    def to_dict(self):
        """레벨 테스트에서 사용할 수 있는 딕셔너리 형태로 변환"""
        return {
            'id': self.id,
            'type': self.question_type,
            'question': self.question_text,
            'options': self.options if self.options else [],
            'correct': self.correct_answer,
            'category': self.category,
            'points': self.points
        }

class DatabaseBackup(db.Model):
    """데이터베이스 백업 기록 모델"""
    __tablename__ = 'database_backup'
    
    id = db.Column(db.Integer, primary_key=True)
    backup_name = db.Column(db.String(200), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.BigInteger)  # 파일 크기 (bytes)
    backup_type = db.Column(db.String(20), default='manual')  # manual, automatic
    status = db.Column(db.String(20), default='completed')  # in_progress, completed, failed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.String(50))
    notes = db.Column(db.Text)
    
    def __repr__(self):
        return f'<DatabaseBackup {self.backup_name}>'