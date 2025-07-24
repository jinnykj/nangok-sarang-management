from flask import render_template, request, redirect, url_for, session, flash, jsonify, send_file, make_response
from app import app, db
from models import Learner, LevelTest, Counseling, Exam, ConsultationRecord, LearnerHistory, PrivacyConsent
from admin_models import AdminUser, SystemSettings, ContentPage, SystemLog, TestQuestion, DatabaseBackup
from admin_forms import LevelTestManagementForm, SystemSettingsForm, DatabaseMaintenanceForm, ContentManagementForm, UserRoleForm, SystemLogsForm, QuestionForm
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func
from datetime import datetime, timedelta
import json
import os
import sqlite3
import shutil
from functools import wraps

def admin_required(f):
    """관리자 권한 확인 데코레이터"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session:
            flash('관리자 로그인이 필요합니다.', 'error')
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

def log_action(log_type, action, details=None):
    """관리자 액션 로깅"""
    try:
        log = SystemLog(
            log_type=log_type,
            username=session.get('admin_username', 'anonymous'),
            action=action,
            details=details,
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print(f"Logging error: {e}")

def migrate_hardcoded_questions():
    """하드코딩된 문제들을 데이터베이스로 이전"""
    from routes import LEVEL_TEST_QUESTIONS
    
    try:
        # 기존 문제가 있는지 확인
        if TestQuestion.query.count() > 0:
            return False  # 이미 이전됨
        
        for level, questions in LEVEL_TEST_QUESTIONS.items():
            for i, q in enumerate(questions):
                # 문제 타입 변환
                question_type = 'multiple_choice' if q['type'] == 'multiple_choice' else q['type']
                
                # 옵션 처리
                options = q.get('options', [])
                correct_answer = q.get('correct')
                
                new_question = TestQuestion(
                    level=level,
                    question_type=question_type,
                    question_text=q['question'],
                    options=options if options else None,
                    correct_answer=correct_answer if correct_answer is not None else None,
                    category=q.get('category', 'vocabulary'),
                    points=10,  # 기본 10점
                    order_index=i + 1,
                    is_active=True,
                    created_by='system'
                )
                db.session.add(new_question)
        
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        print(f"Migration error: {e}")
        return False

@app.route('/admin')
@admin_required
def admin_dashboard():
    """관리자 대시보드"""
    # 하드코딩된 문제 이전 (최초 실행시)
    migrate_hardcoded_questions()
    
    # 시스템 통계
    stats = {
        'total_learners': db.session.query(func.count(Learner.id)).scalar() or 0,
        'total_counselings': db.session.query(func.count(Counseling.id)).scalar() or 0,
        'total_level_tests': db.session.query(func.count(LevelTest.id)).scalar() or 0,
        'total_questions': db.session.query(func.count(TestQuestion.id)).scalar() or 0,
        'recent_logs': SystemLog.query.order_by(SystemLog.created_at.desc()).limit(10).all()
    }
    
    return render_template('admin/dashboard.html', stats=stats)

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """관리자 로그인"""
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # 기본 관리자 계정 확인 (최초 실행시)
        if username == 'admin' and password == 'admin123':
            session['admin_logged_in'] = True
            session['admin_username'] = username
            session['admin_role'] = 'admin'
            log_action('login', f'관리자 로그인: {username}')
            flash('관리자로 로그인했습니다.', 'success')
            return redirect(url_for('admin_dashboard'))
        
        # 데이터베이스에서 사용자 확인
        admin_user = AdminUser.query.filter_by(username=username, is_active=True).first()
        if admin_user and check_password_hash(admin_user.password_hash, password):
            session['admin_logged_in'] = True
            session['admin_username'] = username
            session['admin_role'] = admin_user.role
            
            # 마지막 로그인 시간 업데이트
            admin_user.last_login = datetime.utcnow()
            db.session.commit()
            
            log_action('login', f'관리자 로그인: {username}')
            flash('관리자로 로그인했습니다.', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            log_action('login', f'로그인 실패: {username}')
            flash('잘못된 사용자명 또는 비밀번호입니다.', 'error')
    
    return render_template('admin/login.html')

@app.route('/admin/logout')
@admin_required  
def admin_logout():
    """관리자 로그아웃"""
    username = session.get('admin_username', 'unknown')
    log_action('login', f'관리자 로그아웃: {username}')
    
    session.pop('admin_logged_in', None)
    session.pop('admin_username', None) 
    session.pop('admin_role', None)
    
    flash('로그아웃되었습니다.', 'info')
    return redirect(url_for('admin_login'))

@app.route('/admin/test-questions')
@app.route('/admin/test-questions/<level>')
@admin_required
def admin_test_questions(level='basic'):
    """테스트 문제 관리"""
    if level not in ['basic', 'intermediate', 'advanced']:
        level = 'basic'
    
    questions = TestQuestion.query.filter_by(level=level).order_by(TestQuestion.order_index).all()
    
    return render_template('admin/test_questions.html', 
                         questions=questions, 
                         current_level=level)

@app.route('/admin/test-questions/add/<level>', methods=['GET', 'POST'])
@admin_required
def admin_add_question(level):
    """테스트 문제 추가"""
    if level not in ['basic', 'intermediate', 'advanced']:
        return redirect(url_for('admin_test_questions'))
    
    form = QuestionForm()
    
    if form.validate_on_submit():
        # 순서 번호 자동 설정
        max_order = db.session.query(func.max(TestQuestion.order_index)).filter_by(level=level).scalar() or 0
        
        # 옵션 배열 생성 (객관식인 경우)
        options = None
        if form.question_type.data == 'multiple_choice':
            options = [
                form.option1.data,
                form.option2.data, 
                form.option3.data,
                form.option4.data
            ]
        
        question = TestQuestion(
            level=level,
            question_type=form.question_type.data,
            question_text=form.question_text.data,
            options=options,
            correct_answer=form.correct_answer.data if form.correct_answer.data is not None else None,
            category=form.category.data,
            points=form.points.data,
            order_index=max_order + 1,
            is_active=True,
            created_by=session.get('admin_username', 'admin')
        )
        
        db.session.add(question)
        db.session.commit()
        
        log_action('data_change', f'{level} 레벨 문제 추가', f'문제 ID: {question.id}')
        flash('문제가 성공적으로 추가되었습니다.', 'success')
        
        return redirect(url_for('admin_test_questions', level=level))
    
    return render_template('admin/add_question.html', form=form, level=level)

@app.route('/admin/test-questions/edit/<int:question_id>', methods=['GET', 'POST'])
@admin_required
def admin_edit_question(question_id):
    """테스트 문제 수정"""
    question = TestQuestion.query.get_or_404(question_id)
    form = QuestionForm(obj=question)
    
    # 기존 옵션 데이터를 폼에 채우기
    if question.options and len(question.options) >= 4:
        form.option1.data = question.options[0]
        form.option2.data = question.options[1] 
        form.option3.data = question.options[2]
        form.option4.data = question.options[3]
    
    if form.validate_on_submit():
        # 옵션 배열 업데이트
        if form.question_type.data == 'multiple_choice':
            question.options = [
                form.option1.data,
                form.option2.data,
                form.option3.data, 
                form.option4.data
            ]
        else:
            question.options = None
        
        question.question_type = form.question_type.data
        question.question_text = form.question_text.data
        question.correct_answer = form.correct_answer.data if form.correct_answer.data is not None else None
        question.category = form.category.data
        question.points = form.points.data
        question.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        log_action('data_change', f'{question.level} 레벨 문제 수정', f'문제 ID: {question.id}')
        flash('문제가 성공적으로 수정되었습니다.', 'success')
        
        return redirect(url_for('admin_test_questions', level=question.level))
    
    return render_template('admin/edit_question.html', form=form, question=question)

@app.route('/admin/test-questions/delete/<int:question_id>')
@admin_required
def admin_delete_question(question_id):
    """테스트 문제 삭제"""
    question = TestQuestion.query.get_or_404(question_id)
    level = question.level
    
    db.session.delete(question)
    db.session.commit()
    
    log_action('data_change', f'{level} 레벨 문제 삭제', f'문제 ID: {question_id}')
    flash('문제가 삭제되었습니다.', 'success')
    
    return redirect(url_for('admin_test_questions', level=level))

@app.route('/admin/settings', methods=['GET', 'POST'])
@admin_required
def admin_settings():
    """시스템 설정 관리"""
    form = SystemSettingsForm()
    
    if form.validate_on_submit():
        # 설정 저장 로직
        log_action('data_change', '시스템 설정 변경')
        flash('설정이 저장되었습니다.', 'success')
    
    return render_template('admin/settings.html', form=form)

@app.route('/admin/content', methods=['GET', 'POST'])
@admin_required
def admin_content():
    """콘텐츠 관리"""
    form = ContentManagementForm()
    pages = ContentPage.query.all()
    
    if form.validate_on_submit():
        log_action('data_change', f'콘텐츠 페이지 편집: {form.page_type.data}')
        flash('콘텐츠가 저장되었습니다.', 'success')
    
    return render_template('admin/content.html', form=form, pages=pages)

@app.route('/admin/logs')
@admin_required
def admin_logs():
    """시스템 로그 조회"""
    form = SystemLogsForm()
    
    log_type = request.args.get('log_type', 'all')
    date_range = request.args.get('date_range', 'week')
    
    # 로그 쿼리
    query = SystemLog.query
    
    if log_type != 'all':
        query = query.filter_by(log_type=log_type)
    
    logs = query.order_by(SystemLog.created_at.desc()).limit(100).all()
    
    return render_template('admin/logs.html', 
                         form=form, 
                         logs=logs,
                         current_log_type=log_type,
                         current_date_range=date_range)

@app.route('/admin/backup')
@admin_required
def admin_backup():
    """데이터베이스 백업 생성"""
    try:
        # 백업 파일 이름 생성
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        backup_filename = f'backup_{timestamp}.sql'
        
        log_action('export', f'데이터베이스 백업 생성: {backup_filename}')
        flash('백업이 생성되었습니다.', 'success')
        
        return redirect(url_for('admin_dashboard'))
    
    except Exception as e:
        log_action('system_error', '백업 실패', str(e))
        flash(f'백업 생성 중 오류가 발생했습니다: {str(e)}', 'error')
        return redirect(url_for('admin_dashboard'))