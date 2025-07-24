# 난곡 사랑의집 관리 시스템

성인 문해교육을 위한 통합 학습자 관리 및 지원 플랫폼

## 주요 기능

- ✅ 학습자 지원서 작성 및 관리
- ✅ 인터랙티브 레벨 테스트 (즉시 채점, 적응형 난이도)
- ✅ 상담 기록 관리 및 AI 분석
- ✅ 음성 인식 기반 개인 상황 이야기 수집
- ✅ 개인정보 동의 및 디지털 서명
- ✅ 연도별 반 수 추적
- ✅ AI 기반 학습자 특성 분석
- ✅ Excel 데이터 내보내기

## 기술 스택

- **Backend**: Flask (Python)
- **Database**: PostgreSQL + SQLAlchemy
- **Frontend**: Bootstrap 5, HTML5 Canvas
- **AI**: OpenAI GPT-4o
- **Voice**: Web Speech API

## 실행 방법

```bash
# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정
export DATABASE_URL="your_database_url"
export OPENAI_API_KEY="your_openai_key"

# 서버 실행
python main.py
```

## 라이센스

이 프로젝트는 난곡 사랑의집 전용으로 개발되었습니다.