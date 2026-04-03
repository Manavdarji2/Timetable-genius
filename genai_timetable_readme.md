# 🤖 GenAI Timetable Generation System

An intelligent timetable generation system powered by Google Gemini 2.5 Flash AI model with comprehensive teacher absence management and automated scheduling capabilities.

## 🌟 Features

### 🎯 Core AI-Powered Features
- **GenAI Timetable Generation**: Leverages Google Gemini 2.5 Flash for intelligent scheduling
- **JSON-Based Output**: Structured timetable data in JSON format for easy processing
- **Smart Conflict Resolution**: AI-powered detection and resolution of scheduling conflicts
- **Teacher Choice Integration**: AI considers teacher preferences and availability

### 📊 Management System
- **Teacher Management**: Complete teacher profile and availability tracking
- **Class Management**: Student class organization and scheduling
- **Classroom Management**: Room allocation with capacity and type considerations
- **Subject Management**: Subject assignments and requirements
- **TimeTable Generation**: Generate Timetable based on the data provide by the user 
- **Absence Management**: Real-time teacher absence tracking and automatic rescheduling

### 📁 Export & Documentation
- **Multi-format Export**: CSV and Excel file generation
- **Screenshot Capture**: Automatic screenshot generation of timetables
- **Edge Case Handling**: Comprehensive validation and error handling
- **Audit Trail**: Complete logging of all scheduling decisions

## 🏗️ System Architecture

### Frontend
- **HTML5**: Modern semantic markup
- **CSS3**: Responsive styling with custom design
- **JavaScript**: Interactive UI and API integration
- **Templates**: Jinja2 templating for dynamic content

### Backend
- **Flask**: Python web framework for API development
- **Google Gemini 2.5 Flash**: AI model for intelligent scheduling
- **Python**: Core business logic and data processing

### Database
- **MySQL**: Primary relational database for structured data
- **MongoDB**: Document storage for flexible data and AI responses
- **Dual Database Strategy**: Optimized for both structured and unstructured data

## 📁 Project Structure
```
gen-ai-env/             # Python virtual environment
│
├── Include/            # Header files for the interpreter
├── Lib/                # Installed Python libraries
├── Scripts/            # Executable scripts
├── share/              # Shared environment files
├── pyvenv.cfg          # Environment configuration
│
├Website/                # Main web application
│
├── __pycache__/        # Compiled Python bytecode
├── static/             # Static assets
│   ├── icon.jpg        # Application icon
│   ├── image.png       # UI images
│   ├── script.js       # Client-side JavaScript
│   └── style.css       # Application styling
│
├── templates/          # HTML templates
│   ├── dashboard.html  # Main dashboard interface
│   ├── Sign-in.html    # User authentication
│   └── Sign-up.html    # User registration
│
├── .env                # Environment variables
├── app.py              # Main Flask application
├── Final_test.py       # Testing and validation script
└── [Additional files]  # Testing and correction modules
```

## 🚀 Installation

### Prerequisites
- Python 3.8+
- MySQL 8.0+
- MongoDB 4.4+
- Google Gemini API access

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Manavdarji2/Timetable-Genius.github.io.git
   cd genai-timetable-system
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv gen-ai-env
   
   # Windows
   gen-ai-env\Scripts\activate
   
   # macOS/Linux
   source gen-ai-env/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install flask
   pip install google-generativeai
   pip install mysql-connector-python
   pip install pymongo
   pip install pandas
   pip install python-dotenv
   ```

4. **Database setup**: MySQL [Quick Setup](Test_sql_final.sql)
   ```bash
   # MySQL setup
   mysql -u root -p
   CREATE DATABASE time_genius_project;
   
   # MongoDB setup (ensure MongoDB is running)
   mongosh
   use timetablegenius
   ```

5. **Environment configuration**
   ```bash
   # Create .env file in Website directory
   cp .env.example .env
   
   # Add your configuration
   GEMINI_API_KEY=your_gemini_api_key
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=timetable_genius_proeject
   MONGODB_URI=mongodb://localhost:27017/timetablegenius
   ```

6. **Run the application**
   ```bash
   python website/app.py
   ```

## 💻 Usage

### Initial Setup
1. **Sign Up**: Create an admin account using Sign-up.html
2. **Sign In**: Login to access the dashboard
3. **Configure System**: Set up school timings and preferences

### Data Management
1. **Teacher Management**: Add teachers with availability and preferences
2. **Class Setup**: Create student classes with enrollment details
3. **Classroom Configuration**: Set up rooms with capacity and equipment
4. **Subject Assignment**: Define subjects and their requirements

### AI-Powered Timetable Generation
1. **Generate Timetable**: Click generate to invoke Gemini AI
2. **AI Processing**: System uses Gemini 2.5 Flash to create optimal schedule
3. **JSON Output**: Review the structured timetable data
4. **Export Options**: Download as CSV or Excel
5. **Screenshot Capture**: Automatic visual documentation

### Absence Management
1. **Report Absence**: Teachers can report unavailability
2. **Automatic Rescheduling**: AI automatically adjusts schedules
3. **Conflict Resolution**: Smart handling of scheduling conflicts
4. **Notification System**: Stakeholders receive updates

## 🔧 API Endpoints

### Authentication
```
POST /api/auth/signin
POST /api/auth/signup
POST /api/auth/logout
```

### Management
```
GET/POST/PUT/DELETE /api/teachers
GET/POST/PUT/DELETE /api/classes
GET/POST/PUT/DELETE /api/classrooms
GET/POST/PUT/DELETE /api/subjects
```

### AI-Powered Features
```
POST /api/timetable/generate      # Generate using Gemini AI
GET /api/timetable/json/:id       # Get JSON format timetable
POST /api/timetable/export        # Export to CSV/Excel
POST /api/timetable/screenshot    # Generate screenshot
```

### Absence Management
```
POST /api/absence/report
GET /api/absence/list
POST /api/absence/resolve
```

## 🤖 Gemini AI Integration

The system leverages Google Gemini 2.5 Flash for:

- **Intelligent Scheduling**: AI considers multiple constraints simultaneously
- **Conflict Resolution**: Automatic detection and resolution of scheduling conflicts
- **Optimization**: Resource allocation optimization for maximum efficiency
- **Preference Learning**: AI learns from user preferences and past decisions
- **Natural Language Processing**: Understanding of complex scheduling requirements

### AI Prompt Structure: This is the basic structure of Prompt eng for more [click here](Website/Final_test.py)
```python
prompt = f"""
Generate an optimal timetable for:
- Teachers: {teacher_data}
- Classes: {class_data}
- Subjects: {subject_data}
- Constraints: {constraints}
- Preferences: {preferences}

Return JSON format with complete schedule and conflict resolution.
"""
```

## 📊 Database Schema

### MySQL (Structured Data): Rest structer [Here](Test_sql_final.sql)
- **users**: User authentication and profiles
- **teachers**: Teacher information and availability
- **classes**: Student class organization
- **classrooms**: Physical space management
- **subjects**: Subject definitions and requirements
- **timetables**: Generated schedule data

### MongoDB (AI Data)
- **ai_responses**: Gemini AI responses and decisions
- **generation_logs**: AI generation history
- **optimization_data**: Performance metrics
- **user_preferences**: Learning data for AI improvement

## 🧪 Testing

The system includes comprehensive testing:

```bash
# Run This command for AI to get Ans is correct 
python Final_test.py
```

## 🔍 Edge Cases Handled

- **Teacher Unavailability**: Multiple teachers absent simultaneously
- **Room Conflicts**: Overlapping room bookings
- **Subject Constraints**: Theory/practical requirements
- **Time Limitations**: Insufficient slots for all subjects
- **Equipment Requirements**: Specialized classroom needs
- **Student Conflicts**: Class scheduling overlaps

## 📈 Performance Optimization

- **Caching**: Redis integration for frequently accessed data
- **Database Indexing**: Optimized queries for large datasets
- **AI Response Caching**: Cached Gemini responses for similar requests
- **Async Processing**: Non-blocking operations for large timetables
- **Load Balancing**: Distributed processing for multiple schools

## 🛡️ Security Features

- **API Key Protection**: Secure Gemini API key management
- **Input Validation**: Comprehensive data validation
- **SQL Injection Prevention**: Parameterized queries
- **Authentication**: Secure user authentication system
- **Rate Limiting**: API request throttling

## 🚀 Deployment

### Local Development
```bash
python app.py
# Access at http://localhost:5000
```

### Production Deployment
```bash
# Using Gunicorn
gunicorn --bind 0.0.0.0:5000 app:app

# Using Docker
docker build -t genai-timetable .
docker run -p 5000:5000 genai-timetable
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Issues**: GitHub Issues
- **Documentation**: Wiki section
- **Email**: support@yourdomain.com

## 🙏 Acknowledgments

- **Google Gemini**: For providing the AI capabilities
- **Flask Community**: For the excellent web framework
- **Open Source Contributors**: For the amazing libraries used

---

**⭐ Star this repository if you find it helpful!**
# 🤖 GenAI Timetable Generation System

An intelligent timetable generation system powered by Google Gemini 2.5 Flash AI model with comprehensive teacher absence management and automated scheduling capabilities.

## 🌟 Features

### 🎯 Core AI-Powered Features
- **GenAI Timetable Generation**: Leverages Google Gemini 2.5 Flash for intelligent scheduling
- **JSON-Based Output**: Structured timetable data in JSON format for easy processing
- **Smart Conflict Resolution**: AI-powered detection and resolution of scheduling conflicts
- **Teacher Choice Integration**: AI considers teacher preferences and availability

### 📊 Management System
- **Teacher Management**: Complete teacher profile and availability tracking
- **Class Management**: Student class organization and scheduling
- **Classroom Management**: Room allocation with capacity and type considerations
- **Subject Management**: Subject assignments and requirements
- **TimeTable Generation**: Generate Timetable based on the data provide by the user 
- **Absence Management**: Real-time teacher absence tracking and automatic rescheduling

### 📁 Export & Documentation
- **Multi-format Export**: CSV and Excel file generation
- **Screenshot Capture**: Automatic screenshot generation of timetables
- **Edge Case Handling**: Comprehensive validation and error handling
- **Audit Trail**: Complete logging of all scheduling decisions

## 🏗️ System Architecture

### Frontend
- **HTML5**: Modern semantic markup
- **CSS3**: Responsive styling with custom design
- **JavaScript**: Interactive UI and API integration
- **Templates**: Jinja2 templating for dynamic content

### Backend
- **Flask**: Python web framework for API development
- **Google Gemini 2.5 Flash**: AI model for intelligent scheduling
- **Python**: Core business logic and data processing

### Database
- **MySQL**: Primary relational database for structured data
- **MongoDB**: Document storage for flexible data and AI responses
- **Dual Database Strategy**: Optimized for both structured and unstructured data

## 📁 Project Structure
```
gen-ai-env/             # Python virtual environment
│
├── Include/            # Header files for the interpreter
├── Lib/                # Installed Python libraries
├── Scripts/            # Executable scripts
├── share/              # Shared environment files
├── pyvenv.cfg          # Environment configuration
│
├Website/                # Main web application
│
├── __pycache__/        # Compiled Python bytecode
├── static/             # Static assets
│   ├── icon.jpg        # Application icon
│   ├── image.png       # UI images
│   ├── script.js       # Client-side JavaScript
│   └── style.css       # Application styling
│
├── templates/          # HTML templates
│   ├── dashboard.html  # Main dashboard interface
│   ├── Sign-in.html    # User authentication
│   └── Sign-up.html    # User registration
│
├── .env                # Environment variables
├── app.py              # Main Flask application
├── Final_test.py       # Testing and validation script
└── [Additional files]  # Testing and correction modules
```

## 🚀 Installation

### Prerequisites
- Python 3.8+
- MySQL 8.0+
- MongoDB 4.4+
- Google Gemini API access

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Manavdarji2/Timetable-Genius.github.io.git
   cd genai-timetable-system
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv gen-ai-env
   
   # Windows
   gen-ai-env\Scripts\activate
   
   # macOS/Linux
   source gen-ai-env/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install flask
   pip install google-generativeai
   pip install mysql-connector-python
   pip install pymongo
   pip install pandas
   pip install python-dotenv
   ```

4. **Database setup**: MySQL [Quick Setup](Test_sql_final.sql)
   ```bash
   # MySQL setup
   mysql -u root -p
   CREATE DATABASE time_genius_project;
   
   # MongoDB setup (ensure MongoDB is running)
   mongosh
   use timetablegenius
   ```

5. **Environment configuration**
   ```bash
   # Create .env file in Website directory
   cp .env.example .env
   
   # Add your configuration
   GEMINI_API_KEY=your_gemini_api_key
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=timetable_genius_proeject
   MONGODB_URI=mongodb://localhost:27017/timetablegenius
   ```

6. **Run the application**
   ```bash
   python website/app.py
   ```

## 💻 Usage

### Initial Setup
1. **Sign Up**: Create an admin account using Sign-up.html
2. **Sign In**: Login to access the dashboard
3. **Configure System**: Set up school timings and preferences

### Data Management
1. **Teacher Management**: Add teachers with availability and preferences
2. **Class Setup**: Create student classes with enrollment details
3. **Classroom Configuration**: Set up rooms with capacity and equipment
4. **Subject Assignment**: Define subjects and their requirements

### AI-Powered Timetable Generation
1. **Generate Timetable**: Click generate to invoke Gemini AI
2. **AI Processing**: System uses Gemini 2.5 Flash to create optimal schedule
3. **JSON Output**: Review the structured timetable data
4. **Export Options**: Download as CSV or Excel
5. **Screenshot Capture**: Automatic visual documentation

### Absence Management
1. **Report Absence**: Teachers can report unavailability
2. **Automatic Rescheduling**: AI automatically adjusts schedules
3. **Conflict Resolution**: Smart handling of scheduling conflicts
4. **Notification System**: Stakeholders receive updates

## 🔧 API Endpoints

### Authentication
```
POST /api/auth/signin
POST /api/auth/signup
POST /api/auth/logout
```

### Management
```
GET/POST/PUT/DELETE /api/teachers
GET/POST/PUT/DELETE /api/classes
GET/POST/PUT/DELETE /api/classrooms
GET/POST/PUT/DELETE /api/subjects
```

### AI-Powered Features
```
POST /api/timetable/generate      # Generate using Gemini AI
GET /api/timetable/json/:id       # Get JSON format timetable
POST /api/timetable/export        # Export to CSV/Excel
POST /api/timetable/screenshot    # Generate screenshot
```

### Absence Management
```
POST /api/absence/report
GET /api/absence/list
POST /api/absence/resolve
```

## 🤖 Gemini AI Integration

The system leverages Google Gemini 2.5 Flash for:

- **Intelligent Scheduling**: AI considers multiple constraints simultaneously
- **Conflict Resolution**: Automatic detection and resolution of scheduling conflicts
- **Optimization**: Resource allocation optimization for maximum efficiency
- **Preference Learning**: AI learns from user preferences and past decisions
- **Natural Language Processing**: Understanding of complex scheduling requirements

### AI Prompt Structure: This is the basic structure of Prompt eng for more [click here](Website/Final_test.py)
```python
prompt = f"""
Generate an optimal timetable for:
- Teachers: {teacher_data}
- Classes: {class_data}
- Subjects: {subject_data}
- Constraints: {constraints}
- Preferences: {preferences}

Return JSON format with complete schedule and conflict resolution.
"""
```

## 📊 Database Schema

### MySQL (Structured Data): Rest structer [Here](Test_sql_final.sql)
- **users**: User authentication and profiles
- **teachers**: Teacher information and availability
- **classes**: Student class organization
- **classrooms**: Physical space management
- **subjects**: Subject definitions and requirements
- **timetables**: Generated schedule data

### MongoDB (AI Data)
- **ai_responses**: Gemini AI responses and decisions
- **generation_logs**: AI generation history
- **optimization_data**: Performance metrics
- **user_preferences**: Learning data for AI improvement

## 🧪 Testing

The system includes comprehensive testing:

```bash
# Run This command for AI to get Ans is correct 
python Final_test.py
```

## 🔍 Edge Cases Handled

- **Teacher Unavailability**: Multiple teachers absent simultaneously
- **Room Conflicts**: Overlapping room bookings
- **Subject Constraints**: Theory/practical requirements
- **Time Limitations**: Insufficient slots for all subjects
- **Equipment Requirements**: Specialized classroom needs
- **Student Conflicts**: Class scheduling overlaps

## 📈 Performance Optimization

- **Caching**: Redis integration for frequently accessed data
- **Database Indexing**: Optimized queries for large datasets
- **AI Response Caching**: Cached Gemini responses for similar requests
- **Async Processing**: Non-blocking operations for large timetables
- **Load Balancing**: Distributed processing for multiple schools

## 🛡️ Security Features

- **API Key Protection**: Secure Gemini API key management
- **Input Validation**: Comprehensive data validation
- **SQL Injection Prevention**: Parameterized queries
- **Authentication**: Secure user authentication system
- **Rate Limiting**: API request throttling

## 🚀 Deployment

### Local Development
```bash
python app.py
# Access at http://localhost:5000
```

### Production Deployment
```bash
# Using Gunicorn
gunicorn --bind 0.0.0.0:5000 app:app

# Using Docker
docker build -t genai-timetable .
docker run -p 5000:5000 genai-timetable
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Issues**: GitHub Issues
- **Documentation**: Wiki section
- **Email**: support@yourdomain.com

## 🙏 Acknowledgments

- **Google Gemini**: For providing the AI capabilities
- **Flask Community**: For the excellent web framework
- **Open Source Contributors**: For the amazing libraries used

---

**⭐ Star this repository if you find it helpful!**
