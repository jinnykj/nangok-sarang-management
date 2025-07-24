from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import StringField, TextAreaField, DateField, SelectField, IntegerField, HiddenField, RadioField, SubmitField, BooleanField
from wtforms.validators import DataRequired, Email, Optional, NumberRange
from datetime import date

class LearnerApplicationForm(FlaskForm):
    """성인 문해교육 지원서 작성 폼"""
    
    # 기본 인적사항
    name = StringField('이름', validators=[DataRequired(message='이름을 입력해주세요.')])
    birth_date = DateField('생년월일', validators=[DataRequired(message='생년월일을 입력해주세요.')])
    gender = RadioField('성별', 
                       choices=[('남', '남'), ('여', '여')],
                       validators=[DataRequired(message='성별을 선택해주세요.')])
    phone = StringField('휴대폰 번호', validators=[DataRequired(message='휴대폰 번호를 입력해주세요.')])
    address = TextAreaField('주소', validators=[DataRequired(message='주소를 입력해주세요.')],
                          description='도로명 주소 또는 자택 설명을 입력해주세요.')
    
    # 비상연락처
    emergency_contact1_name = StringField('비상연락처 1 - 이름', validators=[DataRequired(message='비상연락처를 입력해주세요.')])
    emergency_contact1_relation = StringField('비상연락처 1 - 관계', validators=[DataRequired(message='관계를 입력해주세요.')])
    emergency_contact1_phone = StringField('비상연락처 1 - 전화번호', validators=[DataRequired(message='전화번호를 입력해주세요.')])
    
    emergency_contact2_name = StringField('비상연락처 2 - 이름', validators=[Optional()])
    emergency_contact2_relation = StringField('비상연락처 2 - 관계', validators=[Optional()])
    emergency_contact2_phone = StringField('비상연락처 2 - 전화번호', validators=[Optional()])
    
    # 학습 배경 및 건강 상태
    health_status = RadioField('건강 상태',
                              choices=[('건강', '건강'), ('보통', '보통'), ('나쁨', '나쁨'), ('질환', '질환 있음')],
                              validators=[DataRequired(message='건강 상태를 선택해주세요.')])
    health_details = StringField('질환 상세 (해당시)', validators=[Optional()])
    
    surgery_experience = RadioField('수술 경험',
                                   choices=[('없음', '없음'), ('있음', '있음')],
                                   validators=[DataRequired(message='수술 경험을 선택해주세요.')])
    surgery_details = StringField('수술 내용 (해당시)', validators=[Optional()])
    
    learning_experience = RadioField('학습 경험',
                                    choices=[('없음', '없음'), ('있음', '있음')],
                                    validators=[DataRequired(message='학습 경험을 선택해주세요.')])
    learning_institution = StringField('학습 기관명 (해당시)', validators=[Optional()])
    learning_period = StringField('학습 기간 (해당시)', validators=[Optional()])
    
    # 입학 경로 및 학습 목적
    enrollment_path = SelectField('입학 경로',
                                 choices=[
                                     ('단지 내', '단지 내'),
                                     ('가족 소개', '가족 소개'),
                                     ('지인 소개', '지인 소개'),
                                     ('기타', '기타')
                                 ],
                                 validators=[DataRequired(message='입학 경로를 선택해주세요.')])
    
    learning_purpose = SelectField('학습 목적',
                                  choices=[
                                      ('글자 배우기', '글자 배우기'),
                                      ('검정고시', '검정고시'),
                                      ('업무', '업무'),
                                      ('자녀 도움', '자녀 도움'),
                                      ('기타', '기타')
                                  ],
                                  validators=[DataRequired(message='학습 목적을 선택해주세요.')])
    
    # 기초 진단 평가 (자기평가)
    reading_level = SelectField('읽기 수준',
                               choices=[
                                   ('전혀 못 읽음', '전혀 못 읽음'),
                                   ('단어는 읽음', '단어는 읽음'),
                                   ('문장은 읽음', '문장은 읽음'),
                                   ('유창하게 읽음', '유창하게 읽음')
                               ],
                               validators=[DataRequired(message='읽기 수준을 선택해주세요.')])
    
    writing_level = SelectField('쓰기 수준',
                               choices=[
                                   ('전혀 못 씀', '전혀 못 씀'),
                                   ('간단한 글자', '간단한 글자'),
                                   ('문장 가능', '문장 가능'),
                                   ('글쓰기 가능', '글쓰기 가능')
                               ],
                               validators=[DataRequired(message='쓰기 수준을 선택해주세요.')])
    
    math_level = SelectField('수학 수준',
                            choices=[
                                ('숫자 전혀 모름', '숫자 전혀 모름'),
                                ('1~10 가능', '1~10 가능'),
                                ('100까지 가능', '100까지 가능'),
                                ('사칙연산 가능', '사칙연산 가능')
                            ],
                            validators=[DataRequired(message='수학 수준을 선택해주세요.')])
    
    # 추가 정보
    other_info = TextAreaField('기타 사항', validators=[Optional()],
                              description='추가로 전달하고 싶은 내용이 있으시면 적어주세요.')
    
    # 개인정보 동의 및 서명
    privacy_consent = BooleanField('개인정보 수집 및 이용에 동의합니다', 
                                  validators=[DataRequired(message='개인정보 수집 및 이용에 동의해주세요.')])
    signature_data = HiddenField('서명 데이터')
    
    submit = SubmitField('지원서 제출')

class CounselingForm(FlaskForm):
    """상담 기록 폼"""
    counselor_name = StringField('상담사명', validators=[DataRequired(message='상담사명을 입력해주세요.')])
    counseling_content = TextAreaField('상담 내용', validators=[DataRequired(message='상담 내용을 입력해주세요.')])
    recommendations = TextAreaField('추천 사항', validators=[Optional()])
    notes = TextAreaField('비고', validators=[Optional()])

class ExamForm(FlaskForm):
    """시험 기록 폼"""
    exam_name = StringField('시험명', validators=[DataRequired(message='시험명을 입력해주세요.')])
    exam_date = DateField('시험일', validators=[DataRequired(message='시험일을 입력해주세요.')], default=date.today)
    score = IntegerField('점수', validators=[DataRequired(message='점수를 입력해주세요.'), NumberRange(min=0, message='0점 이상이어야 합니다.')])
    max_score = IntegerField('만점', validators=[DataRequired(message='만점을 입력해주세요.'), NumberRange(min=1, message='1점 이상이어야 합니다.')])
    notes = TextAreaField('비고', validators=[Optional()])

class UploadForm(FlaskForm):
    """엑셀/CSV 업로드 폼"""
    file = FileField('파일 선택', validators=[
        DataRequired(message='업로드할 파일을 선택해주세요.'),
        FileAllowed(['xlsx', 'xls', 'csv'], message='Excel(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.')
    ])
    submit = SubmitField('업로드')

class MemoForm(FlaskForm):
    """메모 수정 폼"""
    memo = TextAreaField('메모', validators=[Optional()], render_kw={'rows': 3, 'placeholder': '학습자에 대한 메모를 입력하세요...'})
    submit = SubmitField('저장')

class AcademicStatusForm(FlaskForm):
    """학적상태 변경 폼"""
    academic_status = SelectField('학적상태', 
                                choices=[
                                    ('재학', '재학'),
                                    ('휴학', '휴학'),
                                    ('중퇴', '중퇴'),
                                    ('졸업', '졸업')
                                ],
                                validators=[DataRequired(message='학적상태를 선택해주세요.')])
    submit = SubmitField('저장')

class ClassAssignmentForm(FlaskForm):
    """반 배정 폼"""
    class_name = SelectField('배정반', 
                            choices=[
                                ('', '반 선택'),
                                ('기쁨반', '기쁨반'),
                                ('은혜반', '은혜반'),
                                ('지혜반', '지혜반'),
                                ('바다반', '바다반')
                            ],
                            validators=[Optional()])
    submit = SubmitField('저장')

class ConsultationRecordForm(FlaskForm):
    """상담 기록 폼"""
    name = StringField('이름', validators=[Optional()], render_kw={'placeholder': '이름을 입력하세요 (선택사항)'})
    phone = StringField('전화번호', 
                       validators=[DataRequired(message='전화번호를 입력해주세요.')], 
                       render_kw={'placeholder': '010-1234-5678'})
    consultation_content = TextAreaField('상담 내용', 
                                      validators=[Optional()], 
                                      render_kw={'rows': 4, 'placeholder': '상담한 내용을 입력하세요...'})
    consultation_date = DateField('상담 날짜', 
                                validators=[DataRequired(message='상담 날짜를 선택해주세요.')],
                                default=date.today)
    gender = SelectField('성별', 
                        choices=[('', '선택안함'), ('남성', '남성'), ('여성', '여성')], 
                        validators=[Optional()])
    residence = StringField('거주지', 
                          validators=[Optional()], 
                          render_kw={'placeholder': '예: 관악구 신림동'})
    consultation_area = SelectField('상담영역', 
                                  choices=[
                                      ('', '선택안함'),
                                      ('한글', '한글'),
                                      ('영어', '영어'),
                                      ('스마트폰', '스마트폰')
                                  ], 
                                  validators=[Optional()])
    submit = SubmitField('저장')

class LearnerHistoryForm(FlaskForm):
    """학습자 이력 기록 폼"""
    event_type = SelectField('이벤트 유형', 
                           choices=[
                               ('enrollment', '입학'),
                               ('graduation_certification', '학력인증'),
                               ('level_test', '레벨테스트'),
                               ('counseling', '상담'),
                               ('class_assignment', '반 배정'),
                               ('academic_status', '학적상태변경'),
                               ('achievement', '성취/수료'),
                               ('other', '기타')
                           ],
                           validators=[DataRequired(message='이벤트 유형을 선택해주세요.')])
    event_date = DateField('날짜', 
                         validators=[DataRequired(message='날짜를 선택해주세요.')],
                         default=date.today)
    event_title = StringField('제목', 
                            validators=[DataRequired(message='제목을 입력해주세요.')],
                            render_kw={'placeholder': '예: 2024년도 기쁨반 배정'})
    event_description = TextAreaField('상세 설명', 
                                    validators=[Optional()],
                                    render_kw={'rows': 3, 'placeholder': '상세한 설명을 입력하세요 (선택사항)'})
    previous_value = StringField('이전 값', 
                               validators=[Optional()],
                               render_kw={'placeholder': '예: 은혜반 (반 변경시)'})
    new_value = StringField('새 값', 
                          validators=[Optional()],
                          render_kw={'placeholder': '예: 기쁨반 (반 변경시)'})
    created_by = StringField('기록자', 
                           validators=[Optional()],
                           render_kw={'placeholder': '기록한 사람 이름'})
    submit = SubmitField('저장')

class PrivacyConsentForm(FlaskForm):
    """개인정보 동의서 폼"""
    consent_content = TextAreaField('동의서 내용', 
                                  validators=[DataRequired(message='동의서 내용을 입력해주세요.')],
                                  render_kw={'rows': 15, 'class': 'form-control'})
    consent_date = DateField('동의 날짜', 
                           validators=[DataRequired(message='동의 날짜를 선택해주세요.')],
                           default=date.today)
    consent_name = StringField('동의자 이름', 
                             validators=[DataRequired(message='동의자 이름을 입력해주세요.')],
                             render_kw={'placeholder': '본인의 이름을 입력해주세요'})
    signature_data = HiddenField('서명 데이터')  # 서명 Canvas 데이터
    is_agreed = BooleanField('개인정보 수집 및 이용에 동의합니다', 
                           validators=[DataRequired(message='동의해주셔야 저장됩니다.')],
                           default=True)
    submit = SubmitField('동의서 저장')
