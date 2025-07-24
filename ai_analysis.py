import json
import os
import tempfile
from openai import OpenAI

# the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
# do not change this unless explicitly requested by the user
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

def analyze_learner_profile(learner_data):
    """
    학습자 지원서 데이터를 분석하여 선생님이 알아야 할 특이점과 추천사항을 생성
    """
    try:
        # 학습자 데이터를 프롬프트에 맞게 정리
        profile_text = f"""
학습자 기본 정보:
- 이름: {learner_data.get('name', '')}
- 나이: {learner_data.get('birth_date', '')}
- 성별: {learner_data.get('gender', '')}
- 연락처: {learner_data.get('phone', '')}

건강 상태:
- 전반적 건강: {learner_data.get('health_status', '')}
- 건강 세부사항: {learner_data.get('health_details', '') or '없음'}
- 수술 경험: {learner_data.get('surgery_experience', '')}
- 수술 세부사항: {learner_data.get('surgery_details', '') or '없음'}

학습 배경:
- 이전 학습 경험: {learner_data.get('learning_experience', '')}
- 학습 기관: {learner_data.get('learning_institution', '') or '없음'}
- 학습 기간: {learner_data.get('learning_period', '') or '없음'}

학습 목적 및 동기:
- 입학 경로: {learner_data.get('enrollment_path', '')}
- 학습 목적: {learner_data.get('learning_purpose', '')}

현재 학습 수준:
- 읽기 수준: {learner_data.get('reading_level', '')}
- 쓰기 수준: {learner_data.get('writing_level', '')}
- 수학 수준: {learner_data.get('math_level', '')}

기타 정보:
{learner_data.get('other_info', '') or '없음'}
        """

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "당신은 성인 문해교육 전문가입니다. 학습자의 지원서 정보를 분석하여 담당 선생님이 알아야 할 중요한 특이점과 교육 방향을 제시해주세요. JSON 형식으로 응답하되, key_points, recommendations, learning_focus, special_needs 필드를 포함해주세요."
                },
                {
                    "role": "user",
                    "content": f"다음 학습자 정보를 분석해주세요:\n{profile_text}"
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=1000
        )

        try:
            content = response.choices[0].message.content
            if content:
                analysis = json.loads(content)
                return analysis
            else:
                raise ValueError("Empty response content")
        except json.JSONDecodeError as json_error:
            # JSON 파싱 실패 시 기본 구조 반환
            return {
                "key_points": [f"AI 분석 파싱 오류: {str(json_error)}"],
                "recommendations": ["수동 검토가 필요합니다."],
                "learning_focus": "전반적 기초 능력 향상",
                "special_needs": "없음"
            }

    except Exception as e:
        # 오류 발생 시 기본 분석 반환
        return {
            "key_points": ["데이터 분석 중 오류가 발생했습니다"],
            "recommendations": ["수동으로 학습자 정보를 검토해주세요"],
            "learning_focus": "기본 문해교육",
            "special_needs": f"AI 분석 오류: {str(e)}"
        }

def format_analysis_for_display(analysis):
    """
    분석 결과를 화면 표시용으로 포맷팅
    """
    if not analysis:
        return "분석 데이터가 없습니다."
    
    formatted = f"""
🔍 주요 특이점:
{chr(10).join(f'• {point}' for point in analysis.get('key_points', []))}

📋 교육 추천사항:
{chr(10).join(f'• {rec}' for rec in analysis.get('recommendations', []))}

🎯 학습 중점 영역: {analysis.get('learning_focus', '기본 문해교육')}

⚠️ 특별 배려사항: {analysis.get('special_needs', '없음')}
    """
    
    return formatted.strip()

def transcribe_audio(audio_file):
    """
    음성 파일을 텍스트로 변환
    """
    try:
        with open(audio_file, "rb") as file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=file,
                language="ko"  # 한국어 지정
            )
        return response.text
    except Exception as e:
        print(f"음성 변환 오류: {e}")
        return None

def summarize_counseling_session(transcribed_text, learner_info=None):
    """
    상담 내용을 요약하고 중요 포인트를 추출
    """
    try:
        learner_context = ""
        if learner_info:
            learner_context = f"""
학습자 정보:
- 이름: {learner_info.get('name', '')}
- 생년월일: {learner_info.get('birth_date', '')}
- 학습경험: {learner_info.get('learning_experience', '')}
- 학습목적: {learner_info.get('learning_purpose', '')}
"""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system", 
                    "content": """당신은 성인 문해교육 전문 상담사입니다. 상담 내용을 분석하여 다음과 같이 요약해주세요:

1. 상담 주요 내용 요약 (2-3문장)
2. 학습자의 감정 상태 및 태도
3. 교육적 필요사항 및 특이점
4. 향후 지도 방향 및 권장사항
5. 주의깊게 관찰해야 할 부분

JSON 형식으로 응답하되, summary, emotional_state, educational_needs, recommendations, attention_points 필드를 포함해주세요."""
                },
                {
                    "role": "user",
                    "content": f"{learner_context}\n\n상담 내용:\n{transcribed_text}"
                }
            ],
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        if content:
            return json.loads(content)
        else:
            raise ValueError("Empty response content")
    
    except Exception as e:
        print(f"상담 요약 오류: {e}")
        return {
            "summary": "AI 요약을 사용할 수 없습니다.",
            "emotional_state": "수동 관찰 필요",
            "educational_needs": "개별 평가 필요",
            "recommendations": "전문 상담사 검토 권장",
            "attention_points": "추가 상담 필요"
        }

def generate_voice_memo_summary(voice_notes, context=None):
    """
    여러 음성 메모들을 종합하여 전체 요약 생성
    """
    try:
        context_info = ""
        if context:
            context_info = f"상담 배경: {context}\n\n"
            
        combined_text = "\n\n".join([f"메모 {i+1}: {note}" for i, note in enumerate(voice_notes)])
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": """당신은 상담 기록 전문가입니다. 여러 음성 메모를 종합하여 체계적인 상담 기록을 작성해주세요.

다음 형식으로 정리해주세요:
1. 전체 상담 개요
2. 주요 대화 내용 (시간순 정리)
3. 학습자 반응 및 태도
4. 중요 발견사항
5. 후속 조치 필요사항

JSON 형식으로 응답하되, overview, main_content, learner_response, key_findings, follow_up_actions 필드를 포함해주세요."""
                },
                {
                    "role": "user",
                    "content": f"{context_info}음성 메모들:\n{combined_text}"
                }
            ],
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        if content:
            return json.loads(content)
        else:
            raise ValueError("Empty response content")
        
    except Exception as e:
        print(f"종합 요약 오류: {e}")
        return {
            "overview": "AI 종합 요약을 사용할 수 없습니다.",
            "main_content": "수동 정리 필요",
            "learner_response": "직접 관찰 기록 필요",
            "key_findings": "개별 검토 필요", 
            "follow_up_actions": "상담사 판단 필요"
        }