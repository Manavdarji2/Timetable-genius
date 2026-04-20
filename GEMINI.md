# Timetable Genius - Project Context

AI-powered academic timetable generation and teacher absence management system built with Flask, MySQL, MongoDB, and Google Gemini 2.5 Flash.

## Project Overview
Timetable Genius automates the complex task of creating academic schedules. It collects institutional data (teachers, subjects, classrooms, and constraints), processes it through Gemini 2.5 Flash to generate a conflict-free JSON timetable, and provides a full-featured dashboard for manual management and real-time absence tracking.

### Core Technologies
- **Backend**: Python 3.13 + Flask 3.x
- **AI Integration**: Google Gemini 2.5 Flash (`google-genai`)
- **Primary Database (SQL)**: MySQL 8.0+ (Users, entities, activity logs, config)
- **Secondary Database (NoSQL)**: MongoDB 4.4+ (Generated timetables, AI response history)
- **Frontend**: Vanilla JavaScript (ES6+), CSS3, HTML5 (Jinja2 templates)
- **Dev Tools**: `uv` (package manager), `python-dotenv`, `mysql-connector-python`, `pymongo`

## Key Directories & Files
- `Website/app.py`: Main Flask application containing 100+ routes for auth, entity CRUD, and API endpoints.
- `Website/Final_test.py`: Core AI module that interfaces with Gemini 2.5 Flash for timetable generation.
- `Website/static/script.js`: Massive (148 KB) frontend controller for the dashboard's SPA-like behavior.
- `Test_sql_final.sql`: Full MySQL schema definition (13 tables).
- `update_db.py`: Database migration script for schema updates.
- `refactor_db.py`: Utility to refactor database calls into the project's preferred context manager pattern.

## Development Conventions

### Database Patterns
- **MySQL Connection Pooling**: Managed via `_mysql_pool` (size 20). 
- **Context Manager**: ALWAYS use the `@contextmanager mysql_connection()` from `app.py` for SQL operations to ensure connections are returned to the pool.
- **Data Isolation**: All entity queries MUST include `WHERE user_id = %s` (or equivalent) to maintain isolation between different institutional accounts.

### AI Integration
- Timetable generation is triggered via `POST /api/generate-timetable`.
- Prompt engineering involves serializing complex relational data into a structured format for Gemini, enforcing `response_mime_type="application/json"`.

### Security & Auth
- **Session Auth**: Managed via the `@login_required` decorator.
- **Secrets**: API keys and DB credentials MUST be stored in `.env` and accessed via `os.environ`.
- **Passwords**: Hashed using Werkzeug's `pbkdf2:sha256`.

## Building and Running

### Setup
1. **Environment**: Ensure Python 3.13+ is installed.
2. **Dependencies**: `pip install -r requirements.txt` (or `uv sync` if using uv).
3. **Config**: Copy `Website/.env.example` to `Website/.env` and fill in `GEMINI_API_KEY` and DB credentials.
4. **Database**: 
   - Import `Test_sql_final.sql` into MySQL.
   - Run `python update_db.py` to apply schema patches.

### Execution
- **Development**: `python Website/app.py` (Starts on `http://localhost:5000`).
- **Windows**: `RUN.bat`.
- **Production**: Recommended to use Gunicorn: `gunicorn --bind 0.0.0.0:5000 Website.app:app`.

### Testing
- **AI Logic**: `python Website/Final_test.py` can be used to test the Gemini integration in isolation.
- **Connection Health**: `python Website/check_connections.py` or `leak_check.py` to monitor pool status.

## Usage Guidelines
- All new routes should be added to `Website/app.py` and must respect the `@login_required` decorator.
- For UI changes, modify `Website/static/style.css` and `Website/static/script.js`. The dashboard is highly dependent on `script.js` for dynamic rendering.
- Log all significant actions (create/update/delete) using the `activity` table to maintain the audit trail.
