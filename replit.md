# 난곡 사랑의집 관리 시스템

## Overview

This is a comprehensive management platform for 난곡 사랑의집 (Nangok Sarang-uijip) adult literacy education institution in Korea. The system facilitates the complete learner journey from application to class assignment through a structured 4-step process: application submission, level testing, counseling, and class assignment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Database ORM**: SQLAlchemy with Flask-SQLAlchemy extension
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Session Management**: Flask sessions with secret key configuration
- **WSGI Server**: Configured for Gunicorn deployment with ProxyFix middleware

### Frontend Architecture
- **UI Framework**: Bootstrap 5 with custom bright theme
- **Icons**: Feather Icons for consistent iconography
- **Charts**: Chart.js for data visualization and analytics
- **Interactive Elements**: Vanilla JavaScript for dynamic functionality
- **Canvas Drawing**: HTML5 Canvas for Korean character writing practice

### Data Storage
- **Primary Database**: PostgreSQL with connection pooling
- **ORM**: SQLAlchemy with declarative base model
- **Session Storage**: Flask server-side sessions
- **File Storage**: Static files served through Flask

## Key Components

### Database Models
1. **Learner**: Core student information including personal details, education background, assigned class, and status tracking
2. **LevelTest**: Comprehensive test results with scoring by category (vocabulary, grammar, reading) and detailed answers storage
3. **Counseling**: Counseling session records with counselor information and recommendations
4. **Exam**: Additional exam records for ongoing assessment

### Form Management
- **WTForms Integration**: Structured form validation and rendering
- **Validation**: Server-side validation with Korean language error messages
- **Form Types**: Application forms, counseling forms, and exam recording forms

### Level Testing System
- **Multi-stage Assessment**: Progressive testing (basic → intermediate → advanced)
- **Question Types**: Multiple choice, drawing exercises, and reading comprehension
- **Scoring Categories**: Vocabulary, grammar, and reading skills assessment
- **Interactive Drawing**: Canvas-based Korean character writing practice

### User Interface Components
- **Responsive Design**: Bootstrap-based responsive layout
- **Progress Tracking**: Visual step indicators for the 4-stage process
- **Dashboard Analytics**: Statistical overview with charts and metrics
- **Search and Filtering**: Advanced learner management with multiple filter options

## Data Flow

### Learner Registration Process
1. **Application Submission**: Personal information, education background, and motivation collection
2. **Level Testing**: Progressive skill assessment with automatic scoring
3. **Counseling**: Professional consultation with detailed record keeping
4. **Class Assignment**: Automatic assignment based on test scores with manual override capability

### Scoring and Classification
- **Score Ranges**: 80+ (Pre-Secondary), 60-79 (Elementary Advanced), 40-59 (Elementary Intermediate), <40 (Elementary Beginner)
- **Auto-assignment**: Systematic class placement based on comprehensive test results
- **Manual Override**: Administrative capability to adjust assignments

### Data Management
- **CRUD Operations**: Full create, read, update, delete functionality for all entities
- **Relationship Management**: Foreign key relationships between learners and their records
- **Status Tracking**: Progressive status updates throughout the enrollment process

## External Dependencies

### Frontend Libraries
- **Bootstrap 5**: UI framework and responsive design
- **Feather Icons**: Icon library for consistent visual elements
- **Chart.js**: Data visualization and analytics charts

### Backend Dependencies
- **Flask**: Core web framework
- **Flask-SQLAlchemy**: Database ORM integration
- **Flask-WTF**: Form handling and validation
- **WTForms**: Form field types and validators
- **Werkzeug**: WSGI utilities and middleware

### Development Tools
- **Python 3.x**: Runtime environment
- **PostgreSQL**: Production database system
- **HTML5 Canvas**: Drawing functionality for character practice

## Deployment Strategy

### Configuration Management
- **Environment Variables**: Database URL and session secrets via environment configuration
- **Database Connection**: PostgreSQL with connection pooling and health checks
- **Static Files**: Flask static file serving for CSS, JavaScript, and assets

### Production Considerations
- **WSGI Deployment**: Configured for Gunicorn with ProxyFix for reverse proxy support
- **Database Optimization**: Connection pooling and pre-ping enabled for reliability
- **Session Security**: Configurable secret key with fallback for development

### Scalability Features
- **Database Pooling**: Automatic connection management for concurrent users
- **Stateless Design**: Session-based state management for horizontal scaling
- **Modular Architecture**: Separated concerns for easy maintenance and updates

The system is designed to handle the complete lifecycle of adult literacy education management, from initial application through ongoing progress tracking, with emphasis on usability for both administrators and learners with varying levels of digital literacy.