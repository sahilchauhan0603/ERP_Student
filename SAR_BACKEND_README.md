# SAR (Student Academic Record) Backend Implementation

## Overview
This document provides a complete overview of the SAR backend implementation that handles student academic records, internship records, and achievement tracking.

## Database Tables Used

### 1. Student_SAR
- **student_id**: Foreign key to students table
- **enrollment_no**: Student enrollment number
- **microsoft_email**: Microsoft email address
- **current_semester**: Current semester (1-8)
- **profile_completion_percentage**: Profile completion percentage
- **created_at**, **updated_at**: Timestamps

### 2. SARacademic
- **student_id**: Foreign key to students table
- **semester**: Semester number (1-8)
- **academic_year**: Academic year (e.g., "2023-24")
- **sgpa**: Semester Grade Point Average
- **cgpa**: Cumulative Grade Point Average
- **total_credits**: Total credits for the semester
- **earned_credits**: Credits earned
- **attendance_percentage**: Attendance percentage
- **backlog_count**: Number of backlogs
- **semester_result**: Result status (ongoing, passed, failed)
- **exam_month**: Examination month
- **exam_year**: Examination year
- **remarks**: Additional remarks
- **subjects**: JSON field containing array of subject details
- **created_at**, **updated_at**: Timestamps

### 3. SARintern
- **student_id**: Foreign key to students table
- **company_name**: Company name
- **position**: Position/role
- **internship_type**: Type (summer, winter, etc.)
- **start_date**, **end_date**: Internship duration
- **duration_months**, **duration_weeks**: Duration details
- **stipend**: Stipend amount
- **currency**: Currency (default: INR)
- **location**: Internship location
- **work_mode**: Work mode (onsite, remote, hybrid)
- **description**: Job description
- **key_responsibilities**: Key responsibilities
- **skills_learned**: JSON array of skills learned
- **technologies_used**: JSON array of technologies used
- **supervisor_name**: Supervisor details
- **supervisor_designation**, **supervisor_email**, **supervisor_phone**: Supervisor contact info
- **performance_rating**: Performance rating
- **final_presentation**: Boolean for final presentation
- **offer_letter_received**: Boolean for offer letter
- **status**: Status (applied, accepted, completed, etc.)
- **media_urls**: JSON array of related media URLs
- **created_at**, **updated_at**: Timestamps

### 4. SARAchievements
- **student_id**: Foreign key to students table
- **title**: Achievement title
- **category**: Achievement category
- **subcategory**: Achievement subcategory
- **description**: Achievement description
- **achievement_date**: Date of achievement
- **event_start_date**, **event_end_date**: Event duration
- **level**: Achievement level (college, state, national, international)
- **organization**: Organizing body
- **event_name**: Event name
- **position_rank**: Position/rank achieved
- **total_participants**: Total participants
- **team_size**: Team size
- **team_members**: JSON array of team members
- **prize_amount**: Prize amount
- **prize_currency**: Prize currency (default: INR)
- **certificate_url**: Certificate URL
- **trophy_medal_received**: Boolean for trophy/medal
- **media_coverage**: Boolean for media coverage
- **media_urls**: JSON array of media URLs
- **skills_demonstrated**: JSON array of skills demonstrated
- **technologies_used**: JSON array of technologies used
- **verification_status**: Verification status (pending, verified, rejected)
- **points_awarded**: Points awarded for achievement
- **impact_score**: Impact score
- **tags**: JSON array of tags
- **semester_achieved**: Semester in which achieved
- **created_at**, **updated_at**: Timestamps

## API Endpoints

### SAR Overview
- **GET /api/sar/overview**: Get SAR overview data with student info
- **PUT /api/sar/overview**: Update SAR overview (enrollment, email, semester)

### Academic Records
- **GET /api/sar/academic**: Get all academic records for the student
- **POST /api/sar/academic**: Create a new academic record
- **PUT /api/sar/academic/:id**: Update an existing academic record
- **DELETE /api/sar/academic/:id**: Delete an academic record

### Internship Records
- **GET /api/sar/internships**: Get all internship records for the student
- **POST /api/sar/internships**: Create a new internship record
- **PUT /api/sar/internships/:id**: Update an existing internship record
- **DELETE /api/sar/internships/:id**: Delete an internship record

### Achievement Records
- **GET /api/sar/achievements**: Get all achievement records for the student
- **POST /api/sar/achievements**: Create a new achievement record
- **PUT /api/sar/achievements/:id**: Update an existing achievement record
- **DELETE /api/sar/achievements/:id**: Delete an achievement record

### Complete SAR & Statistics
- **GET /api/sar/complete**: Get complete SAR data (all records combined)
- **GET /api/sar/statistics**: Get SAR statistics (counts, averages, etc.)

## Authentication
All SAR endpoints require authentication using cookie-based session tokens. The authentication middleware verifies the token from `req.cookies.token`.

## Frontend Integration
The frontend uses axios with `withCredentials: true` to handle cookie-based authentication. The API base URL is configurable via `VITE_API_URL` environment variable, defaulting to `http://localhost:9080/api`.

## JSON Field Handling
Several fields store JSON data:
- **subjects** in SARacademic: Array of subject objects with grades, credits, etc.
- **skills_learned**, **technologies_used** in SARintern: Arrays of strings
- **team_members**, **skills_demonstrated**, **media_urls**, **tags** in SARAchievements: Arrays

These fields are automatically parsed when retrieved and stringified when stored.

## Error Handling
All endpoints include proper error handling with:
- Input validation
- Database error handling
- Permission checks (ensuring records belong to the authenticated user)
- Meaningful error messages

## Usage Examples

### Creating an Academic Record
```json
POST /api/sar/academic
{
  "semester": 1,
  "academic_year": "2023-24",
  "sgpa": 8.5,
  "cgpa": 8.5,
  "total_credits": 24,
  "earned_credits": 24,
  "attendance_percentage": 85,
  "backlog_count": 0,
  "semester_result": "passed",
  "subjects": [
    {
      "subject_code": "CS101",
      "subject_name": "Programming Fundamentals",
      "credits": 4,
      "grade": "A",
      "grade_points": 9
    }
  ]
}
```

### Creating an Internship Record
```json
POST /api/sar/internships
{
  "company_name": "Tech Corp",
  "position": "Software Developer Intern",
  "internship_type": "summer",
  "start_date": "2024-06-01",
  "end_date": "2024-08-31",
  "duration_months": 3,
  "stipend": 25000,
  "location": "Bangalore",
  "work_mode": "onsite",
  "skills_learned": ["React", "Node.js", "MongoDB"],
  "technologies_used": ["JavaScript", "Git", "Docker"],
  "status": "completed"
}
```

### Creating an Achievement Record
```json
POST /api/sar/achievements
{
  "title": "Best Project Award",
  "category": "Academic",
  "level": "college",
  "achievement_date": "2024-03-15",
  "organization": "ABC College",
  "position_rank": 1,
  "total_participants": 50,
  "skills_demonstrated": ["Problem Solving", "Teamwork"],
  "verification_status": "verified"
}
```