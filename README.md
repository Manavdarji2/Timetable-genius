# Timetable Genius

> AI-powered academic timetable generation and teacher absence management system built with Flask, MySQL, MongoDB, and Google Gemini 2.5 Flash.

![alt text](<Screenshot 2026-05-12 181102.png>)

Timetable Genius solves the combinatorial scheduling problem that institutions face every semester — assigning teachers, subjects, classrooms, and time slots without conflicts — by delegating the constraint satisfaction to a large language model. Beyond generation, it provides a full management dashboard for teachers, classes, classrooms, subjects, and real-time absence tracking with automated replacement suggestions.

---

## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [AI Integration](#ai-integration)
- [Frontend](#frontend)
- [Utility Scripts](#utility-scripts)
- [Edge Cases Handled](#edge-cases-handled)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Timetable Generation (AI-Powered)
- Sends all institutional data (teachers, subjects, classes, classrooms, constraints) to **Google Gemini 2.5 Flash** via structured prompt
- Returns a JSON timetable covering every class × day × time slot
- Respects theory/practical distinctions, weekly hour budgets, break schedules, and teacher availability
- Saves generated timetables to MongoDB for history and re-viewing

### Entity Management (CRUD)
- **Teachers** — name, department, email, phone, weekly hours, subject assignments
- **Classes** — name, grade, assigned classroom, student count, subject links
- **Classrooms** — room number, type (regular / lab / gym), capacity, building, floor
- **Subjects** — name, department, type (Theory / Practical), weekly hours, assigned teacher
- **Departments** and **Grades** — created on-the-fly when referenced

### Absence Management
- Record teacher absences with date range and reason
- Auto-suggest replacement teachers ranked by department match and workload
- Manual assignment of replacements
- Rescheduling with new date ranges
- Status tracking (pending → resolved)

### User System
- Registration with role selection (admin / teacher)
- Login with hashed password verification (Werkzeug `pbkdf2:sha256`)
- Session-based authentication with `@login_required` decorator
- Password reset via token (logged to console — no email transport configured)
- Profile management and profile picture upload (BLOB storage)
- Password change with current-password verification

### Dashboard
- Overview statistics: teacher count, class count, classroom count, subject count
- Recent activity feed (last 5 actions)
- Full CRUD modals for every entity type

### Data Export
- Timetable data exported as JSON
- Generated timetable persisted in MongoDB with full parameter snapshots

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (Client)                   │
│  landing.html · Sign-in · Sign-up · dashboard.html      │
│  script.js (148 KB) · style.css (53 KB)                  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (JSON + Form)
                       ▼
┌─────────────────────────────────────────────────────────┐
│               Flask Application (app.py)                │
│  Routes: Auth · Teachers · Classes · Classrooms ·        │
│          Subjects · Timetable · Absences · Profile       │
│  Middleware: login_required · CORS · session             │
│  AI Client: Final_test.py → Google Gemini 2.5 Flash      │
└────────┬────────────────────────────┬───────────────────┘
         │                            │
         ▼                            ▼
┌──────────────────┐       ┌──────────────────────┐
│  MySQL 8.0+      │       │  MongoDB 4.4+        │
│  (Structured)    │       │  (Document Store)    │
│  Connection Pool │       │  timetablegenius DB  │
│  Size: 20        │       │  timetables collection│
└──────────────────┘       └──────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | Python 3.13, Flask 3.x | Web framework, API routing, session management |
| **AI** | Google Gemini 2.5 Flash (`google-genai`) | Timetable generation via structured prompt |
| **SQL Database** | MySQL 8.0+ (`mysql-connector`) | Relational data — users, teachers, classes, subjects, absences |
| **NoSQL Database** | MongoDB 4.4+ (`pymongo`) | Generated timetable storage, AI response history |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | Dashboard SPA with modal-driven CRUD |
| **Templating** | Jinja2 | Server-rendered pages (landing, auth, dashboard shell) |
| **Auth** | Werkzeug security | Password hashing (`pbkdf2:sha256`), token generation |
| **Package Manager** | uv | Dependency resolution and virtual environment |

---

## Prerequisites

| Requirement | Version |
|---|---|
| Python | ≥ 3.13 |
| MySQL | ≥ 8.0 |
| MongoDB | ≥ 4.4 |
| Google Gemini API Key | [Get one here](https://aistudio.google.com/app/apikey) |
| uv (recommended) | Latest — or use `pip` |

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/manav-darji-aiml/Timetable-genius.git
cd Timetable-genius
```

### 2. Create and activate a virtual environment

**Using uv (recommended):**
```bash
uv venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate
```

**Using standard venv:**
```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

**Core dependencies:**

| Package | Purpose |
|---|---|
| `flask` | Web framework |
| `flask_cors` | Cross-origin request handling |
| `google-genai` | Gemini AI client |
| `mysql-connector` | MySQL database driver |
| `pymongo` | MongoDB driver |
| `pandas` | Data export (CSV/Excel) |
| `pillow` | Image validation for profile pictures |
| `python-dotenv` | Environment variable loading |
| `werkzeug` | Password hashing, security utilities |
| `cryptography` | Secure token operations |

### 4. Set up environment variables

```bash
cp Website/.env.example Website/.env
```

Edit `Website/.env` with your values (see next section).

### 5. Set up databases

See [Database Setup](#database-setup) below.

### 6. Run the application

```bash
python Website/app.py
```

Or use the provided batch file (Windows):
```bash
RUN.bat
```

The server starts at **http://localhost:5000**.

---

## Environment Variables

Create a `.env` file inside the `Website/` directory:

| Variable | Required | Description | Example |
|---|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key | `AIza...` |
| `DB_HOST` | ✅ | MySQL host | `localhost` |
| `DB_USER` | ✅ | MySQL username | `root` |
| `DB_PASSWORD` | ✅ | MySQL password | `YOUR_PASSWORD_HERE` |
| `DB_NAME` | ✅ | MySQL database name | `timetable_genius_project` |
| `DB_POOL_SIZE` | ❌ | MySQL connection pool size | `20` |
| `MONGODB` | ❌ | MongoDB connection URI | `mongodb://localhost:27017/` |

> **Security**: The `.env` file is excluded from Git via `.gitignore`. Never commit credentials.

---

## Database Setup

### MySQL

1. **Create the database and tables** using the provided schema file:

```bash
mysql -u root -p < Test_sql_final.sql
```

This creates the `timetable_genius_project` database with all 13 tables.

2. **Add reset token columns** (if not present in schema):

```bash
python update_db.py
```

This idempotently adds `reset_token` and `token_expiry` columns to the `users` table, and ensures the `teacher_absences` table exists.

### MongoDB

Ensure MongoDB is running. The application auto-creates the `timetablegenius` database and `timetables` collection on first write.

```bash
# Verify MongoDB is running
mongosh --eval "db.runCommand({ ping: 1 })"
```

---

## Running the Application

### Development

```bash
python Website/app.py
# Server starts on http://localhost:5000 with debug=True
```

### Windows Quick Start

```bash
RUN.bat
```

---

## Project Structure

```
Timetable-genius/
│
├── Website/                    # Main Flask application
│   ├── app.py                  # Flask server — all routes (2277 lines)
│   ├── Final_test.py           # Gemini AI timetable generation module
│   ├── .env                    # Environment variables (git-ignored)
│   ├── .env.example            # Template for environment setup
│   ├── pyproject.toml          # Website sub-package config
│   │
│   ├── templates/              # Jinja2 HTML templates
│   │   ├── landing.html        # Public landing page
│   │   ├── Sign-in.html        # Login page
│   │   ├── Sign-up.html        # Registration page
│   │   ├── dashboard.html      # Main authenticated dashboard
│   │   ├── forgot-password.html# Password reset request
│   │   └── reset-password.html # Password reset form
│   │
│   ├── static/                 # Client-side assets
│   │   ├── script.js           # Dashboard logic, CRUD, timetable UI (148 KB)
│   │   ├── style.css           # Application styles (53 KB)
│   │   ├── icon.jpg            # Favicon / brand icon
│   │   └── image.png           # UI asset
│   │
│   ├── TESTING/                # Test-related files
│   ├── check.py                # DB connection check utility
│   ├── check2.py               # Extended connection diagnostics
│   ├── check_connections.py    # Pool connection monitoring
│   ├── leak_check.py           # Connection leak detector
│   ├── patch_close.py          # Connection cleanup patch
│   └── desc.py                 # Table description utility
│
├── Test_sql_final.sql          # Complete MySQL schema (13 tables)
├── SQL-ERD.tldr                # Entity-Relationship Diagram (tldraw format)
├── SQL-Relation.png            # ERD screenshot
│
├── requirements.txt            # Python dependencies
├── pyproject.toml              # Root project configuration (uv workspace)
├── .python-version             # Python 3.13
├── uv.lock                     # Locked dependency versions
│
├── update_db.py                # Schema migration: adds reset token columns
├── refactor_db.py              # Automated refactoring: converts raw DB calls to context manager
├── patch_render.py             # JS patch: upgrades absence table rendering
│
├── Problem_process.md          # Requirements analysis and 90-day development plan
├── genai_timetable_readme.md   # Detailed feature documentation (earlier version)
├── mit_license.md              # MIT License with AI usage addendum
│
├── RUN.bat                     # Windows quick-start script
├── .gitignore                  # Git exclusions
└── .python-version             # Python version pinning
```

---

## API Reference

All API endpoints require authentication (session cookie) unless noted. Responses are JSON.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ❌ | Landing page (redirects to `/dashboard` if logged in) |
| `GET/POST` | `/login` | ❌ | Login page / authenticate user |
| `GET/POST` | `/signup` | ❌ | Registration page / create account |
| `GET` | `/logout` | ✅ | Clear session, redirect to login |
| `GET/POST` | `/forgot-password` | ❌ | Request password reset token |
| `GET/POST` | `/reset-password/<token>` | ❌ | Reset password via token |

#### POST `/login`

```json
// Request
{ "email": "user@example.com", "password": "securepass" }

// Success → 200
{ "redirect": "/dashboard" }

// Error → 401
{ "error": "Invalid credentials" }
```

#### POST `/signup`

```json
// Request
{ "name": "John", "email": "john@example.com", "password": "pass123", "role": "admin" }

// Success → 201
{ "message": "Registration successful" }

// Error → 409
{ "error": "Email already exists" }
```

---

### Teachers

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/teachers` | List all teachers (with department, subjects) |
| `POST` | `/api/teachers` | Create teacher |
| `GET` | `/api/teachers/<id>` | Get single teacher details |
| `PUT` | `/api/teachers/<id>` | Update teacher |
| `DELETE` | `/api/teachers/<id>` | Delete teacher |

#### POST `/api/teachers`

```json
// Request
{
  "name": "Dr. Smith",
  "email": "smith@school.edu",
  "phone": "9876543210",
  "department": "Computer Science",
  "weeklyhour": 20
}

// Success → 201
{ "message": "Teacher added successfully", "teacher_id": 5 }
```

---

### Classes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/classes` | List all classes (with grade, room, subjects) |
| `POST` | `/api/classes` | Create class with subject assignments |
| `GET` | `/api/classes/<id>` | Get class details and linked subjects |
| `PUT` | `/api/classes/<id>` | Update class and re-link subjects |
| `DELETE` | `/api/classes/<id>` | Delete class (cascades to `class_subjects`) |

#### POST `/api/classes`

```json
// Request
{
  "name": "B.Sc AIML SEM IV",
  "grade": "15",
  "classroom": 3,
  "student": 67,
  "subjects": [1, 2, 5]
}

// Success → 201
{ "success": true, "message": "Class added successfully", "class_id": 4 }
```

---

### Classrooms

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/classrooms` | List all classrooms |
| `POST` | `/api/classrooms` | Create classroom |
| `GET` | `/api/classrooms/<id>` | Get classroom details |
| `PUT` | `/api/classrooms/<id>` | Update classroom |
| `DELETE` | `/api/classrooms/<id>` | Delete classroom |

#### POST `/api/classrooms`

```json
// Request
{
  "room_number": "404",
  "type": "computer lab",
  "capacity": 60,
  "building": "Block A",
  "floor": 4
}

// Success → 201
{ "message": "Classroom added successfully", "classroom_id": 7 }
```

---

### Subjects

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/subjects` | List all subjects (with department, teacher) |
| `POST` | `/api/subjects` | Create subject and link to teacher |
| `GET` | `/api/subjects/<id>` | Get subject details |
| `PUT` | `/api/subjects/<id>` | Update subject and teacher link |
| `DELETE` | `/api/subjects/<id>` | Delete subject (cascades to joins) |

#### POST `/api/subjects`

```json
// Request
{
  "subject_name": "Deep Learning",
  "department_id": 1,
  "type_subject": "Theory",
  "weekly_hours": 4,
  "teacher_id": 2
}

// Success → 201
{ "message": "Subject added successfully", "subject_id": 8 }
```

---

### Supporting Entities

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/departments` | List departments linked to user's teachers |
| `GET` | `/api/grades` | List grades linked to user's classes |

---

### Timetable Generation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/generate-timetable` | Generate timetable via Gemini AI |
| `GET` | `/api/view-timetables` | Retrieve all generated timetables from MongoDB |

#### POST `/api/generate-timetable`

```json
// Request
{
  "timetable-name": "Semester IV Schedule",
  "timetable-description": "Spring 2026",
  "school-start-time": "08:00",
  "school-end-time": "16:00",
  "lecture-duration": "45",
  "break-duration": "10",
  "break-start-time": "12:00",
  "classes-per-day": "6",
  "classes": [{"id": "1", "name": "B.Sc AIML SEM IV"}],
  "allow-gaps": "on"
}

// Success → 200
{
  "success": true,
  "message": "Timetable generated successfully",
  "timetable": "{ ... JSON timetable ... }",
  "mongodb_id": "661f...",
  "database_updates": {
    "mysql": "school_config and activity tables updated",
    "mongodb": "timetable document saved"
  }
}
```

---

### Absence Management

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/absences` | List all absences for user's teachers |
| `POST` | `/api/absences` | Record a new absence |
| `PUT` | `/api/absences/<id>` | Update absence status or reason |
| `DELETE` | `/api/absences/<id>` | Delete absence record |
| `GET` | `/api/absences/<id>/auto-suggest` | Get ranked replacement teacher suggestions |
| `POST` | `/api/absences/<id>/manual-assign` | Assign a specific replacement teacher |
| `POST` | `/api/absences/<id>/reschedule` | Reschedule and resolve absence |

#### POST `/api/absences`

```json
// Request
{
  "teacher_id": 2,
  "start_date": "2026-04-20",
  "end_date": "2026-04-22",
  "reason": "Medical leave"
}

// Success → 201
{ "message": "Absence recorded successfully", "absence_id": 3 }
```

#### GET `/api/absences/<id>/auto-suggest`

```json
// Response → 200
{
  "absence_id": 3,
  "absent_teacher": "Dr. Smith",
  "period": { "start": "2026-04-20", "end": "2026-04-22" },
  "suggestions": [
    { "teacher_id": 5, "teacher_name": "Prof. Jones", "weekly_hours": 12 },
    { "teacher_id": 8, "teacher_name": "Dr. Patel", "weekly_hours": 18 }
  ]
}
```

#### POST `/api/absences/<id>/manual-assign`

```json
// Request
{ "replacement_teacher_id": 5 }

// Response → 200
{
  "message": "Assigned Prof. Jones as replacement",
  "absence_id": 3,
  "status": "resolved"
}
```

---

### User Profile

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/profile` | Get current user profile |
| `POST` | `/api/profile` | Update name and email |
| `POST` | `/api/change-password` | Change password (requires current password) |
| `POST` | `/api/profile/profile_picture` | Upload profile picture (max 5 MB, image only) |

---

## Database Schema

The MySQL schema consists of **13 tables** defined in [`Test_sql_final.sql`](Test_sql_final.sql).

### Entity-Relationship Overview

```
users ──────────┬─── teachers ──── teacher_subjects ──── subjects
                │         │                                  │
                │         ├── teacher_availability            │
                │         │                                  │
                │         └── teacher_absences               │
                │              └── absence_resolutions       │
                │                                            │
                ├─── classes ──── class_subjects ─────────────┘
                │         │
                │         └── grades
                │
                ├─── classrooms
                ├─── departments
                ├─── activity (audit log)
                ├─── user_preferences
                └─── school_config
```

### Table Reference

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | User accounts and auth | `user_id`, `email`, `password_hash`, `role` |
| `departments` | Academic departments | `department_id`, `name` |
| `teachers` | Teacher profiles | `teacher_id`, `user_id` (FK), `department_id` (FK), `teacher_name`, `weekly_hours` |
| `subjects` | Course/subject definitions | `subject_id`, `user_id` (FK), `department_id` (FK), `type` (Theory/Practical), `weekly_hours` |
| `teacher_subjects` | Many-to-many: teachers ↔ subjects | `teacher_id` (FK), `subject_id` (FK) |
| `grades` | Grade/semester levels | `grade_id`, `name` |
| `classes` | Student class groups | `class_id`, `user_id` (FK), `grade_id` (FK), `classroom_id` (FK), `students_count` |
| `class_subjects` | Many-to-many: classes ↔ subjects | `class_id` (FK), `subject_id` (FK) |
| `classrooms` | Physical rooms | `classroom_id`, `user_id` (FK), `room_number`, `type`, `capacity` |
| `teacher_availability` | Preferred time slots | `teacher_id` (FK), `day_of_week`, `start_time`, `end_time`, `preference_level` |
| `teacher_absences` | Absence records | `absence_id`, `teacher_id` (FK), `start_date`, `end_date`, `status` |
| `absence_resolutions` | How absences were resolved | `absence_id` (FK), `resolution_type`, `replacement_teacher_id` (FK) |
| `activity` | Audit trail for all actions | `user_id` (FK), `action_type`, `description`, `entity_type`, `entity_id` |
| `school_config` | Institution schedule settings | `user_id`, `start_time`, `end_time`, `lecture_duration`, `break_duration` |
| `user_preferences` | UI preferences per user | `user_id`, `dark_mode`, `compact_view` |

### Data Isolation

All entities are scoped to the authenticated `user_id`, ensuring multi-tenant data isolation. Every query includes a `WHERE user_id = %s` clause.

---

## AI Integration

### How Timetable Generation Works

1. **Data Collection** — The `/api/generate-timetable` endpoint queries MySQL to build a comprehensive data structure:
   - All teachers and their subject assignments (grouped by department and grade)
   - Theory vs. practical hour budgets per teacher per class
   - Classroom details (room number, type, capacity)
   - Schedule constraints (start/end time, break schedule, lectures per day)

2. **Prompt Construction** — The collected data is serialized and sent to `Generate_test_timetable()` in `Final_test.py`

3. **AI Processing** — The function calls Gemini 2.5 Flash with:
   - A detailed system instruction containing the expected JSON output format with worked examples
   - `response_mime_type="application/json"` to enforce structured output
   - Streaming response for large timetables
   - Safety settings to block harmful content

4. **Response Handling** — The JSON timetable is:
   - Saved to MongoDB (full document with parameters and metadata)
   - School config updated/created in MySQL
   - Activity logged
   - Returned to the client as JSON

### Output Format

```json
{
  "AIML FY": {
    "Monday": {
      "1:30pm to 2:20pm": {
        "subject": "Python (Nirbhay Sir)",
        "classroom": "Room 101",
        "type": "Theory"
      },
      "2:20pm to 3:10pm": {
        "subject": "Data Science (Ankit Sir)",
        "classroom": "Room 101",
        "type": "Theory"
      }
    }
  }
}
```

Each key is a `{Department} {Grade}` identifier, containing a day-of-week mapping to time-slot allocations with subject, teacher, classroom, and lecture type.

---

## Frontend

The dashboard (`dashboard.html` + `script.js` + `style.css`) is a single-page-style application that handles all CRUD operations via `fetch()` calls to the API.

### Pages

| Page | File | Purpose |
|---|---|---|
| Landing | `landing.html` | Public marketing page with feature highlights |
| Sign In | `Sign-in.html` | Email + password login form |
| Sign Up | `Sign-up.html` | Registration with name, email, password, role |
| Dashboard | `dashboard.html` | Authenticated management interface |
| Forgot Password | `forgot-password.html` | Email-based reset request |
| Reset Password | `reset-password.html` | New password form (token-gated) |

### Dashboard Sections

The dashboard uses a sidebar navigation to switch between sections:

- **Overview** — Stats cards + recent activity feed
- **Teachers** — Table with add/edit/delete modals
- **Classes** — Table with subject multi-select, grade, classroom assignment
- **Classrooms** — Table with type, capacity, building, floor
- **Subjects** — Table with department, teacher association, theory/practical type
- **Timetable** — Generation form + rendered timetable grid
- **Absence Management** — Absence table with resolve/reschedule/delete actions
- **Profile** — User info, password change, profile picture upload

---

## Utility Scripts

| Script | Purpose |
|---|---|
| [`update_db.py`](update_db.py) | Adds `reset_token` and `token_expiry` columns to `users` table; creates `teacher_absences` if missing |
| [`refactor_db.py`](refactor_db.py) | Automated refactoring tool that converts raw `get_mysql_connection()` calls to the `mysql_connection()` context manager pattern |
| [`patch_render.py`](patch_render.py) | Patches `renderAbsencesTable` in `script.js` with an enhanced version showing duration, active status highlighting, and action buttons |
| [`RUN.bat`](RUN.bat) | Windows one-click launcher: `python website\app.py` |

---

## Edge Cases Handled

- **Simultaneous teacher absences** — Auto-suggest excludes teachers who are also absent during the overlapping period
- **Department-based replacement priority** — Same-department teachers are ranked higher in suggestions
- **Workload-aware suggestions** — Teachers with fewer weekly hours are suggested first
- **Orphan cleanup** — Deleting a subject cascades through `teacher_subjects` and `class_subjects` join tables
- **Duplicate prevention** — Email uniqueness enforced on registration; department/grade names are deduplicated
- **Connection pool management** — MySQL connection pool (size 20) with context manager ensures connections are always returned, preventing pool exhaustion
- **BSON serialization** — MongoDB's `ObjectId` and `datetime` objects are recursively converted for JSON responses
- **Profile picture validation** — File type, size (≤ 5 MB), and PIL image verification before BLOB storage

---

## Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** your changes: `git commit -m "Add your feature"`
4. **Push** to the branch: `git push origin feature/your-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use the `mysql_connection()` context manager for all database operations (not raw `get_mysql_connection()`)
- All new routes require the `@login_required` decorator
- Log all entity mutations to the `activity` table
- Keep secrets in environment variables — never hardcode

---

## License

MIT License — see [`mit_license.md`](mit_license.md) for full text with AI usage addendum.

**Key additions to standard MIT:**
- Users must obtain their own Gemini API key and comply with Google's AI terms
- Users are responsible for local data protection compliance
- AI-generated timetables should be reviewed by humans before deployment
- Commercial use requires proper licensing agreements

---

**Built by [Manav Darji](https://github.com/manav-darji-aiml)**
