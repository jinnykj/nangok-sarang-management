from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SelectField, IntegerField, SubmitField, FieldList, FormField, BooleanField, FloatField
from wtforms.validators import DataRequired, Optional, NumberRange

class QuestionForm(FlaskForm):
    """개별 문제 폼"""
    question_type = SelectField('문제 유형', choices=[
        ('multiple_choice', '객관식'),
        ('drawing', '그림 그리기'),
        ('reading', '읽기 문제')
    ], validators=[DataRequired()])
    
    question_text = TextAreaField('문제', validators=[DataRequired()], render_kw={'rows': 3})
    option1 = StringField('선택지 1', validators=[Optional()])
    option2 = StringField('선택지 2', validators=[Optional()])
    option3 = StringField('선택지 3', validators=[Optional()])
    option4 = StringField('선택지 4', validators=[Optional()])
    correct_answer = IntegerField('정답 (0-3)', validators=[Optional(), NumberRange(min=0, max=3)])
    category = SelectField('카테고리', choices=[
        ('vocabulary', '어휘'),
        ('grammar', '문법'),
        ('reading', '독해')
    ], validators=[DataRequired()])
    points = IntegerField('배점', default=10, validators=[DataRequired(), NumberRange(min=1, max=100)])

class LevelTestManagementForm(FlaskForm):
    """레벨 테스트 관리 폼"""
    level = SelectField('레벨', choices=[
        ('basic', '기초'),
        ('intermediate', '중급'),
        ('advanced', '고급')
    ], validators=[DataRequired()])
    
    questions = FieldList(FormField(QuestionForm), min_entries=1)
    add_question = SubmitField('문제 추가')
    save_questions = SubmitField('저장')

class SystemSettingsForm(FlaskForm):
    """시스템 설정 폼"""
    site_title = StringField('사이트 제목', default='난곡 사랑의집 관리 시스템', validators=[DataRequired()])
    welcome_message = TextAreaField('환영 메시지', render_kw={'rows': 3})
    contact_phone = StringField('연락처 전화번호')
    contact_email = StringField('연락처 이메일')
    address = TextAreaField('주소', render_kw={'rows': 2})
    
    # 점수 기준 설정
    score_presecondary = IntegerField('예비중등반 기준점수', default=80, validators=[DataRequired()])
    score_elementary_advanced = IntegerField('초등고급반 기준점수', default=60, validators=[DataRequired()])
    score_elementary_intermediate = IntegerField('초등중급반 기준점수', default=40, validators=[DataRequired()])
    
    # 기능 활성화/비활성화
    enable_ai_analysis = BooleanField('AI 분석 기능 활성화', default=True)
    enable_privacy_consent = BooleanField('개인정보 동의서 기능 활성화', default=True)
    enable_excel_export = BooleanField('엑셀 내보내기 기능 활성화', default=True)
    
    save_settings = SubmitField('설정 저장')

class DatabaseMaintenanceForm(FlaskForm):
    """데이터베이스 관리 폼"""
    action = SelectField('작업 선택', choices=[
        ('backup', '데이터 백업'),
        ('cleanup', '불필요한 데이터 정리'),
        ('reset_test_data', '테스트 데이터 초기화'),
        ('reindex', '인덱스 재구성')
    ], validators=[DataRequired()])
    
    confirm = BooleanField('위험한 작업임을 확인합니다', validators=[DataRequired()])
    execute = SubmitField('실행')

class ContentManagementForm(FlaskForm):
    """콘텐츠 관리 폼"""
    page_type = SelectField('페이지 유형', choices=[
        ('privacy_policy', '개인정보처리방침'),
        ('terms_of_service', '이용약관'),
        ('welcome_page', '메인 페이지 내용'),
        ('help_guide', '도움말')
    ], validators=[DataRequired()])
    
    title = StringField('제목', validators=[DataRequired()])
    content = TextAreaField('내용', validators=[DataRequired()], render_kw={'rows': 15})
    is_active = BooleanField('활성화', default=True)
    
    save_content = SubmitField('저장')

class UserRoleForm(FlaskForm):
    """사용자 권한 관리 폼"""
    username = StringField('사용자명', validators=[DataRequired()])
    role = SelectField('권한', choices=[
        ('admin', '관리자'),
        ('teacher', '강사'),
        ('counselor', '상담사'),
        ('staff', '일반 직원')
    ], validators=[DataRequired()])
    
    permissions = SelectField('세부 권한', choices=[
        ('all', '모든 권한'),
        ('read_only', '읽기 전용'),
        ('learner_management', '학습자 관리만'),
        ('test_management', '테스트 관리만')
    ], validators=[DataRequired()])
    
    save_user = SubmitField('저장')

class SystemLogsForm(FlaskForm):
    """시스템 로그 조회 폼"""
    log_type = SelectField('로그 유형', choices=[
        ('all', '전체'),
        ('login', '로그인'),
        ('data_change', '데이터 변경'),
        ('system_error', '시스템 오류'),
        ('export', '데이터 내보내기')
    ], validators=[DataRequired()])
    
    date_range = SelectField('기간', choices=[
        ('today', '오늘'),
        ('week', '최근 1주일'),
        ('month', '최근 1개월'),
        ('all', '전체')
    ], validators=[DataRequired()])
    
    search_logs = SubmitField('조회')