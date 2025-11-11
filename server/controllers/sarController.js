const db = require('../config/db').promise;
const cloudinary = require('../config/cloudinary');

// Helper function to convert numeric rating to database ENUM value
const convertRatingToEnum = (numericRating) => {
  if (!numericRating) return null;
  
  const ratingMap = {
    1: 'needs_improvement',
    2: 'average', 
    3: 'average',
    4: 'good',
    5: 'excellent'
  };
  
  return ratingMap[parseInt(numericRating)] || null;
};
// Helper function to convert database ENUM value back to numeric rating
const convertEnumToRating = (enumValue) => {
  if (!enumValue) return null;
  
  const enumMap = {
    'needs_improvement': 1,
    'average': 2,
    'good': 4, 
    'excellent': 5
  };
  
  return enumMap[enumValue] || null;
};

// Helper function to format date to YYYY-MM-DD format
const formatDateForDB = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return null;
    
    // Format to YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    return null;
  }
};

// Helper function to safely parse JSON fields
const safeJsonParse = (jsonString, defaultValue = []) => {
  if (!jsonString) return defaultValue;
  
  try {
    // Handle different input types
    let stringToParse;
    
    if (typeof jsonString === 'string') {
      stringToParse = jsonString.trim();
    } else if (typeof jsonString === 'object') {
      // If it's already an object/array, return it
      return Array.isArray(jsonString) ? jsonString : defaultValue;
    } else {
      stringToParse = jsonString.toString().trim();
    }
    
    if (!stringToParse || stringToParse === 'null' || stringToParse === '' || stringToParse === 'undefined') {
      return defaultValue;
    }
    
    const parsed = JSON.parse(stringToParse);
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

// Helper function to validate enhanced subject structure
const validateEnhancedSubject = (subject) => {
  const errors = {};
  
  // Validate required fields
  if (!subject.subject_code || !subject.subject_code.trim()) {
    errors.subject_code = 'Subject code is required';
  }
  
  if (!subject.subject_name || !subject.subject_name.trim()) {
    errors.subject_name = 'Subject name is required';
  }
  
  // Validate numeric fields
  const numericFields = [
    'credits', 'internal_theory', 'external_theory', 'total_theory',
    'internal_practical', 'external_practical', 'total_practical',
    'grade_points', 'theory_grade_points', 'practical_grade_points'
  ];
  
  numericFields.forEach(field => {
    if (subject[field] !== undefined && subject[field] !== null && subject[field] !== '') {
      const value = parseFloat(subject[field]);
      if (isNaN(value) || value < 0) {
        errors[field] = `${field.replace('_', ' ')} must be a positive number`;
      }
    }
  });
  
  // Validate theory marks consistency (if provided)
  if (subject.internal_theory && subject.external_theory && subject.total_theory) {
    const internalTheory = parseFloat(subject.internal_theory) || 0;
    const externalTheory = parseFloat(subject.external_theory) || 0;
    const totalTheory = parseFloat(subject.total_theory) || 0;
    
    if (Math.abs((internalTheory + externalTheory) - totalTheory) > 0.01) {
      errors.total_theory = 'Total theory marks should equal internal + external theory marks';
    }
  }
  
  // Validate practical marks consistency (if provided)
  if (subject.internal_practical && subject.external_practical && subject.total_practical) {
    const internalPractical = parseFloat(subject.internal_practical) || 0;
    const externalPractical = parseFloat(subject.external_practical) || 0;
    const totalPractical = parseFloat(subject.total_practical) || 0;
    
    if (Math.abs((internalPractical + externalPractical) - totalPractical) > 0.01) {
      errors.total_practical = 'Total practical marks should equal internal + external practical marks';
    }
  }
  
  return errors;
};

// Helper function to transform old subject format to new enhanced format
const transformSubjectToEnhancedFormat = (subject) => {
  // If already in new format, return as is
  if (subject.internal_theory !== undefined || subject.external_theory !== undefined) {
    return subject;
  }
  
  // Transform old format to new format
  const transformed = { ...subject };
  
  // Map old fields to new fields (if they exist)
  if (subject.theory_marks) {
    // Split theory marks equally between internal and external (estimation)
    const theoryMarks = parseFloat(subject.theory_marks) || 0;
    transformed.internal_theory = (theoryMarks * 0.3).toString(); // 30% internal
    transformed.external_theory = (theoryMarks * 0.7).toString(); // 70% external
    transformed.total_theory = theoryMarks.toString();
    delete transformed.theory_marks;
  }
  
  if (subject.practical_marks) {
    // Split practical marks equally between internal and external (estimation)
    const practicalMarks = parseFloat(subject.practical_marks) || 0;
    transformed.internal_practical = (practicalMarks * 0.5).toString(); // 50% internal
    transformed.external_practical = (practicalMarks * 0.5).toString(); // 50% external
    transformed.total_practical = practicalMarks.toString();
    delete transformed.practical_marks;
  }
  
  if (subject.internal_marks && subject.external_marks) {
    // If we have internal/external marks but no theory/practical breakdown
    // Assume they refer to theory marks
    transformed.internal_theory = subject.internal_marks;
    transformed.external_theory = subject.external_marks;
    transformed.total_theory = (parseFloat(subject.internal_marks) + parseFloat(subject.external_marks)).toString();
    delete transformed.internal_marks;
    delete transformed.external_marks;
  }
  
  return transformed;
};



const sarController = {

  /* SAR OVERVIEW */
  // Get SAR Overview
  getSAROverview: async (req, res) => {
    try {
      const studentId = req.user.id;

      // Get or create SAR record
      const sarResult = await db.execute(
        'SELECT * FROM Student_SAR WHERE student_id = ?',
        [studentId]
      );
      
      const [sarRows] = sarResult;

      let sarData;
      if (sarRows.length === 0) {
        // Create initial SAR record
        await db.execute(
          `INSERT INTO Student_SAR (student_id, enrollment_no, microsoft_email, current_semester, profile_completion_percentage, created_at, updated_at) 
           VALUES (?, '', '', 1, 0, NOW(), NOW())`,
          [studentId]
        );

        sarData = {
          student_id: studentId,
          enrollment_no: '',
          microsoft_email: '',
          current_semester: 1,
          profile_completion_percentage: 0
        };
      } else {
        sarData = sarRows[0];
      }

      // Get student basic details
      const studentResult = await db.execute(
        'SELECT * FROM students WHERE id = ?',
        [studentId]
      );
      const [studentRows] = studentResult;

      if (studentRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found. Please ensure you are logged in correctly.',
          errorCode: 'STUDENT_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: {
          student: studentRows[0],
          sarInfo: sarData
        }
      });

    } catch (error) {
      console.error('Error fetching SAR overview:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update SAR Overview
  updateSAROverview: async (req, res) => {
    try {
      const studentId = req.user.id;
      const { enrollment_no, microsoft_email, current_semester } = req.body;

      // Validate input
      if (current_semester && (current_semester < 1 || current_semester > 8)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid semester. Must be between 1 and 8'
        });
      }

      // Update or insert SAR record
      const [existingRows] = await db.execute(
        'SELECT SAR_id FROM Student_SAR WHERE student_id = ?',
        [studentId]
      );

      if (existingRows.length === 0) {
        // Insert new record
        await db.execute(
          `INSERT INTO Student_SAR (student_id, enrollment_no, microsoft_email, current_semester, profile_completion_percentage, created_at, updated_at) 
           VALUES (?, ?, ?, ?, 0, NOW(), NOW())`,
          [studentId, enrollment_no || '', microsoft_email || '', current_semester || 1]
        );
      } else {
        // Update existing record
        await db.execute(
          `UPDATE Student_SAR 
           SET enrollment_no = ?, microsoft_email = ?, current_semester = ?, updated_at = NOW()
           WHERE student_id = ?`,
          [enrollment_no || '', microsoft_email || '', current_semester || 1, studentId]
        );
      }

      res.json({
        success: true,
        message: 'SAR overview updated successfully'
      });

    } catch (error) {
      console.error('Error updating SAR overview:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update Student Info
  updateStudentInfo: async (req, res) => {
    try {
      const studentId = req.user.id;
      const { 
        firstName, middleName, lastName, email, mobile, 
        dob, placeOfBirth, gender, currentAddress, course, batch, photo 
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !mobile || !dob || !gender || !course || !batch) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Validate mobile number (10 digits)
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(mobile.replace(/\s/g, ''))) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must be 10 digits'
        });
      }

      // Format date for MySQL
      const formattedDob = formatDateForDB(dob);

      // Update student information
      await db.execute(
        `UPDATE students 
         SET firstName = ?, middleName = ?, lastName = ?, email = ?, mobile = ?,
             dob = ?, placeOfBirth = ?, gender = ?, currentAddress = ?, 
             course = ?, batch = ?, photo = ?
         WHERE id = ?`,
        [
          firstName, middleName || null, lastName, email, mobile,
          formattedDob, placeOfBirth || null, gender, currentAddress || null,
          course, batch, photo || null, studentId
        ]
      );

      res.json({
        success: true,
        message: 'Student information updated successfully'
      });

    } catch (error) {
      console.error('Error updating student info:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update Parents Information
  updateParentsInfo: async (req, res) => {
    try {
      const studentId = req.user.id;
      const {
        fatherName,
        fatherOccupation,
        fatherEmail,
        fatherMobile,
        fatherOfficeAddress,
        motherName,
        motherOccupation,
        motherEmail,
        motherMobile,
        motherOfficeAddress,
        familyIncome
      } = req.body;

      // Validate required fields
      if (!fatherName || !motherName) {
        return res.status(400).json({
          success: false,
          message: 'Father\'s name and Mother\'s name are required',
          errorCode: 'MISSING_REQUIRED_FIELDS'
        });
      }

      // Validate email formats if provided
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (fatherEmail && !emailRegex.test(fatherEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid father\'s email format',
          errorCode: 'INVALID_EMAIL_FORMAT'
        });
      }
      if (motherEmail && !emailRegex.test(motherEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mother\'s email format',
          errorCode: 'INVALID_EMAIL_FORMAT'
        });
      }

      // Validate mobile numbers if provided
      const mobileRegex = /^[0-9]{10}$/;
      if (fatherMobile && !mobileRegex.test(fatherMobile.replace(/\s/g, ''))) {
        return res.status(400).json({
          success: false,
          message: 'Father\'s mobile number must be 10 digits',
          errorCode: 'INVALID_MOBILE_FORMAT'
        });
      }
      if (motherMobile && !mobileRegex.test(motherMobile.replace(/\s/g, ''))) {
        return res.status(400).json({
          success: false,
          message: 'Mother\'s mobile number must be 10 digits',
          errorCode: 'INVALID_MOBILE_FORMAT'
        });
      }

      // Update in database using flat column structure
      await db.query(
        `UPDATE students 
         SET father_name = ?, 
             father_occupation = ?,
             father_email = ?,
             father_mobile = ?,
             father_officeAddress = ?,
             mother_name = ?,
             mother_occupation = ?,
             mother_email = ?,
             mother_mobile = ?,
             mother_officeAddress = ?,
             familyIncome = ?
         WHERE id = ?`,
        [
          fatherName, fatherOccupation || null, fatherEmail || null, 
          fatherMobile || null, fatherOfficeAddress || null,
          motherName, motherOccupation || null, motherEmail || null,
          motherMobile || null, motherOfficeAddress || null,
          familyIncome || null, studentId
        ]
      );

      res.json({
        success: true,
        message: 'Parents information updated successfully'
      });

    } catch (error) {
      console.error('Error updating parents info:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },



  /* ACADEMIC RECORDS */
  // Get Academic Records
  getAcademicRecords: async (req, res) => {
    try {
      const studentId = req.user.id;

      // First get the SAR_id for this student
      const [sarRows] = await db.execute(
        'SELECT SAR_id FROM Student_SAR WHERE student_id = ?',
        [studentId]
      );

      if (sarRows.length === 0) {
        // No SAR record found, return empty array
        return res.json({
          success: true,
          data: []
        });
      }

      const sarId = sarRows[0].SAR_id;

      const [rows] = await db.execute(
        `SELECT * FROM SARacademic WHERE SAR_id = ? ORDER BY semester ASC`,
        [sarId]
      );

      // Handle JSON subjects field for each record
      const academicRecords = rows.map(record => {
        let subjects = [];
        
        // MySQL JSON fields are already parsed as objects/arrays
        if (record.subjects) {
          if (Array.isArray(record.subjects)) {
            // Already an array, use it directly
            subjects = record.subjects;
          } else if (typeof record.subjects === 'object') {
            // Single object, convert to array
            subjects = [record.subjects];
          } else {
            // String, try to parse
            subjects = safeJsonParse(record.subjects, []);
          }
        }
        
        return {
          ...record,
          subjects: subjects.map(subject => transformSubjectToEnhancedFormat(subject))
        };
      });

      res.json({
        success: true,
        data: academicRecords
      });

    } catch (error) {
      console.error('Error fetching academic records:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Create Academic Record
  createAcademicRecord: async (req, res) => {
    try {
      const studentId = req.user.id;
      const {
        semester, academic_year, sgpa, cgpa, total_credits, earned_credits,
        attendance_percentage, backlog_count, semester_result, exam_month,
        exam_year, remarks, subjects
      } = req.body;

      // Validate required fields
      if (!semester || !academic_year) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both semester number and academic year (e.g., "2024-25") to create the record.',
          errorCode: 'MISSING_REQUIRED_FIELDS',
          fields: ['semester', 'academic_year']
        });
      }

      // Validate semester range
      if (semester < 1 || semester > 8) {
        return res.status(400).json({
          success: false,
          message: 'Please select a valid semester between 1 and 8.',
          errorCode: 'INVALID_SEMESTER_RANGE',
          validRange: { min: 1, max: 8 }
        });
      }

      // Validate numeric fields if provided
      if (sgpa && (isNaN(sgpa) || sgpa < 0 || sgpa > 10)) {
        return res.status(400).json({
          success: false,
          message: 'SGPA must be a number between 0 and 10.',
          errorCode: 'INVALID_SGPA'
        });
      }

      if (cgpa && (isNaN(cgpa) || cgpa < 0 || cgpa > 10)) {
        return res.status(400).json({
          success: false,
          message: 'CGPA must be a number between 0 and 10.',
          errorCode: 'INVALID_CGPA'
        });
      }

      // Get or create SAR record first
      let sarId;
      const [sarRows] = await db.execute(
        'SELECT SAR_id FROM Student_SAR WHERE student_id = ?',
        [studentId]
      );

      if (sarRows.length === 0) {
        // Create SAR record first
        const [sarResult] = await db.execute(
          `INSERT INTO Student_SAR (student_id, enrollment_no, microsoft_email, current_semester, profile_completion_percentage, created_at, updated_at) 
           VALUES (?, '', '', 1, 0, NOW(), NOW())`,
          [studentId]
        );
        sarId = sarResult.insertId;
      } else {
        sarId = sarRows[0].SAR_id;
      }

      // Check if record already exists for this semester
      const [existingRows] = await db.execute(
        'SELECT academic_id FROM SARacademic WHERE SAR_id = ? AND semester = ?',
        [sarId, semester]
      );

      if (existingRows.length > 0) {
        return res.status(409).json({
          success: false,
          message: `You already have an academic record for Semester ${semester}. Please edit the existing record instead of creating a new one.`,
          errorCode: 'DUPLICATE_SEMESTER_RECORD',
          existingRecordId: existingRows[0].academic_id
        });
      }

      // Validate subjects if provided (enhanced structure validation)
      if (subjects && Array.isArray(subjects) && subjects.length > 0) {
        const subjectValidationErrors = [];
        
        subjects.forEach((subject, index) => {
          const errors = validateEnhancedSubject(subject);
          if (Object.keys(errors).length > 0) {
            subjectValidationErrors.push({
              subjectIndex: index,
              subjectCode: subject.subject_code || 'Unknown',
              errors: errors
            });
          }
        });
        
        if (subjectValidationErrors.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Subject validation failed',
            validationErrors: subjectValidationErrors
          });
        }
      }

      // Insert new academic record
      const [result] = await db.execute(
        `INSERT INTO SARacademic (
          SAR_id, semester, academic_year, sgpa, cgpa, total_credits,
          earned_credits, attendance_percentage, backlog_count, semester_result,
          exam_month, exam_year, remarks, subjects, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          sarId, semester, academic_year, sgpa || null, cgpa || null,
          total_credits || null, earned_credits || null, attendance_percentage || null,
          backlog_count || 0, semester_result || 'ongoing', exam_month || null,
          exam_year || null, remarks || null, JSON.stringify(subjects || [])
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Academic record created successfully',
        data: { id: result.insertId }
      });

    } catch (error) {
      console.error('Error creating academic record:', error);
      
      // Handle specific database errors
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'A record with this information already exists.',
          errorCode: 'DUPLICATE_ENTRY'
        });
      }
      
      if (error.code === 'ER_DATA_TOO_LONG') {
        return res.status(400).json({
          success: false,
          message: 'One of the provided values is too long. Please check your input.',
          errorCode: 'DATA_TOO_LONG'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Unable to create academic record due to a server error. Please try again later.',
        errorCode: 'INTERNAL_SERVER_ERROR'
      });
    }
  },

  // Update Academic Record
  updateAcademicRecord: async (req, res) => {
    try {
      const studentId = req.user.id;
      const recordId = req.params.id;
      const {
        semester, academic_year, sgpa, cgpa, total_credits, earned_credits,
        attendance_percentage, backlog_count, semester_result, exam_month,
        exam_year, remarks, subjects
      } = req.body;

      // Get SAR_id for this student
      const [sarRows] = await db.execute(
        'SELECT SAR_id FROM Student_SAR WHERE student_id = ?',
        [studentId]
      );

      if (sarRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'SAR record not found'
        });
      }

      const sarId = sarRows[0].SAR_id;

      // Verify record belongs to student
      const [existingRows] = await db.execute(
        'SELECT academic_id FROM SARacademic WHERE academic_id = ? AND SAR_id = ?',
        [recordId, sarId]
      );

      if (existingRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Academic record not found'
        });
      }

      // Properly handle subjects data
      let subjectsJson = '[]'; // Default to empty array
      
      if (subjects) {
        if (Array.isArray(subjects)) {
          // If it's already an array, stringify it
          subjectsJson = JSON.stringify(subjects);
        } else if (typeof subjects === 'string') {
          // If it's a string, try to parse and re-stringify to validate
          try {
            const parsed = JSON.parse(subjects);
            subjectsJson = JSON.stringify(Array.isArray(parsed) ? parsed : []);
          } catch (e) {
            subjectsJson = '[]';
          }
        } else if (typeof subjects === 'object') {
          // If it's an object (but not array), wrap it in an array
          subjectsJson = JSON.stringify([subjects]);
        } else {
          subjectsJson = '[]';
        }
      }

      // Validate subjects if provided (enhanced structure validation)
      if (subjects && Array.isArray(subjects) && subjects.length > 0) {
        const subjectValidationErrors = [];
        
        subjects.forEach((subject, index) => {
          const errors = validateEnhancedSubject(subject);
          if (Object.keys(errors).length > 0) {
            subjectValidationErrors.push({
              subjectIndex: index,
              subjectCode: subject.subject_code || 'Unknown',
              errors: errors
            });
          }
        });
        
        if (subjectValidationErrors.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Subject validation failed',
            validationErrors: subjectValidationErrors
          });
        }
      }

      // Update academic record
      await db.execute(
        `UPDATE SARacademic SET
          semester = ?, academic_year = ?, sgpa = ?, cgpa = ?, total_credits = ?,
          earned_credits = ?, attendance_percentage = ?, backlog_count = ?,
          semester_result = ?, exam_month = ?, exam_year = ?, remarks = ?,
          subjects = ?, updated_at = NOW()
         WHERE academic_id = ? AND SAR_id = ?`,
        [
          semester, academic_year, sgpa || null, cgpa || null, total_credits || null,
          earned_credits || null, attendance_percentage || null, backlog_count || 0,
          semester_result || 'ongoing', exam_month || null, exam_year || null,
          remarks || null, subjectsJson, recordId, sarId
        ]
      );

      res.json({
        success: true,
        message: 'Academic record updated successfully'
      });

    } catch (error) {
      console.error('Error updating academic record:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete Academic Record
  deleteAcademicRecord: async (req, res) => {
    try {
      const studentId = req.user.id;
      const recordId = req.params.id;

      // Get SAR_id for this student
      const [sarRows] = await db.execute(
        'SELECT SAR_id FROM Student_SAR WHERE student_id = ?',
        [studentId]
      );

      if (sarRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'SAR record not found'
        });
      }

      const sarId = sarRows[0].SAR_id;

      // Verify record belongs to student and delete
      const [result] = await db.execute(
        'DELETE FROM SARacademic WHERE academic_id = ? AND SAR_id = ?',
        [recordId, sarId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Academic record not found'
        });
      }

      res.json({
        success: true,
        message: 'Academic record deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting academic record:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },



  /* INTERNSHIP RECORDS */
  // Get Internship Records
  getInternshipRecords: async (req, res) => {
    try {
      const studentId = req.user.id;

      // First get the SAR_id for this student
      const [sarRows] = await db.execute(
        'SELECT SAR_id FROM Student_SAR WHERE student_id = ?',
        [studentId]
      );

      if (sarRows.length === 0) {
        // No SAR record found, return empty array
        return res.json({
          success: true,
          data: []
        });
      }

      const sarId = sarRows[0].SAR_id;

      const [rows] = await db.execute(
        `SELECT * FROM SARintern WHERE SAR_id = ? ORDER BY created_at DESC`,
        [sarId]
      );

      // Parse JSON fields for each record and convert rating back to numeric
      const internshipRecords = rows.map(record => ({
        ...record,
        skills_learned: safeJsonParse(record.skills_learned),
        technologies_used: safeJsonParse(record.technologies_used),
        media_urls: safeJsonParse(record.media_urls),
        performance_rating: convertEnumToRating(record.performance_rating) // Convert ENUM back to numeric
      }));

      res.json({
        success: true,
        data: internshipRecords
      });

    } catch (error) {
      console.error('Error fetching internship records:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Create Internship Record
  createInternshipRecord: async (req, res) => {
    try {
      const studentId = req.user.id;
      const {
        company_name, position, internship_type, start_date, end_date,
        duration_months, duration_weeks, stipend, currency, location,
        work_mode, description, key_responsibilities, skills_learned,
        technologies_used, supervisor_name, supervisor_designation,
        supervisor_email, supervisor_phone, performance_rating,
        final_presentation, offer_letter_received, offer_letter, status
      } = req.body;

      // Validate required fields
      if (!company_name || !position) {
        return res.status(400).json({
          success: false,
          message: 'Company name and position are required'
        });
      }

      // Get or create SAR record first
      let sarId;
      const [sarRows] = await db.execute(
        'SELECT SAR_id FROM Student_SAR WHERE student_id = ?',
        [studentId]
      );

      if (sarRows.length === 0) {
        // Create SAR record first
        const [sarResult] = await db.execute(
          `INSERT INTO Student_SAR (student_id, enrollment_no, microsoft_email, current_semester, profile_completion_percentage, created_at, updated_at) 
           VALUES (?, '', '', 1, 0, NOW(), NOW())`,
          [studentId]
        );
        sarId = sarResult.insertId;
      } else {
        sarId = sarRows[0].SAR_id;
      }

      // Insert new internship record
      const [result] = await db.execute(
        `INSERT INTO SARintern (
          SAR_id, company_name, position, internship_type, start_date, end_date,
          duration_months, duration_weeks, stipend, currency, location, work_mode,
          description, key_responsibilities, skills_learned, technologies_used,
          supervisor_name, supervisor_designation, supervisor_email, supervisor_phone,
          performance_rating, final_presentation, offer_letter_received, offer_letter, status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          sarId, company_name, position, internship_type || 'summer',
          formatDateForDB(start_date), formatDateForDB(end_date), 
          duration_months ? parseFloat(duration_months) : null,
          duration_weeks ? parseInt(duration_weeks) : null, 
          stipend ? parseFloat(stipend) : null, currency || 'INR',
          location || null, work_mode || 'onsite', description || null,
          key_responsibilities || null, JSON.stringify(skills_learned || []),
          JSON.stringify(technologies_used || []), supervisor_name || null,
          supervisor_designation || null, supervisor_email || null,
          supervisor_phone || null, 
          convertRatingToEnum(performance_rating), // Convert numeric rating to ENUM
          final_presentation || false, offer_letter_received || false,
          offer_letter || null, status || 'applied'
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Internship record created successfully',
        data: { id: result.insertId }
      });

    } catch (error) {
      console.error('Error creating internship record:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update Internship Record
  updateInternshipRecord: async (req, res) => {
    try {
      const studentId = req.user.id;
      const recordId = req.params.id;

      // Get SAR_id for this student
      const [sarRows] = await db.execute(
        'SELECT SAR_id FROM Student_SAR WHERE student_id = ?',
        [studentId]
      );

      if (sarRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'SAR record not found'
        });
      }

      const sarId = sarRows[0].SAR_id;

      // Verify record belongs to student
      const [existingRows] = await db.execute(
        'SELECT internship_id FROM SARintern WHERE internship_id = ? AND SAR_id = ?',
        [recordId, sarId]
      );

      if (existingRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Internship record not found'
        });
      }

      const {
        company_name, position, internship_type, start_date, end_date,
        duration_months, duration_weeks, stipend, currency, location,
        work_mode, description, key_responsibilities, skills_learned,
        technologies_used, supervisor_name, supervisor_designation,
        supervisor_email, supervisor_phone, performance_rating,
        final_presentation, offer_letter_received, offer_letter, status
      } = req.body;

      // Update internship record (removed media_urls field as it's not in schema)
      await db.execute(
        `UPDATE SARintern SET
          company_name = ?, position = ?, internship_type = ?, start_date = ?,
          end_date = ?, duration_months = ?, duration_weeks = ?, stipend = ?,
          currency = ?, location = ?, work_mode = ?, description = ?,
          key_responsibilities = ?, skills_learned = ?, technologies_used = ?,
          supervisor_name = ?, supervisor_designation = ?, supervisor_email = ?,
          supervisor_phone = ?, performance_rating = ?, final_presentation = ?,
          offer_letter_received = ?, offer_letter = ?, status = ?, updated_at = NOW()
         WHERE internship_id = ? AND SAR_id = ?`,
        [
          company_name, position, internship_type || 'summer', formatDateForDB(start_date),
          formatDateForDB(end_date), 
          duration_months ? parseFloat(duration_months) : null, 
          duration_weeks ? parseInt(duration_weeks) : null,
          stipend ? parseFloat(stipend) : null, currency || 'INR', 
          location || null, work_mode || 'onsite',
          description || null, key_responsibilities || null,
          JSON.stringify(skills_learned || []), JSON.stringify(technologies_used || []),
          supervisor_name || null, supervisor_designation || null,
          supervisor_email || null, supervisor_phone || null,
          convertRatingToEnum(performance_rating), // Convert numeric rating to ENUM
          final_presentation || false,
          offer_letter_received || false, offer_letter || null, status || 'applied',
          recordId, sarId
        ]
      );

      res.json({
        success: true,
        message: 'Internship record updated successfully'
      });

    } catch (error) {
      console.error('Error updating internship record:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete Internship Record
  deleteInternshipRecord: async (req, res) => {
    try {
      const studentId = req.user.id;
      const recordId = req.params.id;

      // Get SAR_id for this student
      const [sarRows] = await db.execute(
        'SELECT SAR_id FROM Student_SAR WHERE student_id = ?',
        [studentId]
      );

      if (sarRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'SAR record not found'
        });
      }

      const sarId = sarRows[0].SAR_id;

      const [result] = await db.execute(
        'DELETE FROM SARintern WHERE internship_id = ? AND SAR_id = ?',
        [recordId, sarId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Internship record not found'
        });
      }

      res.json({
        success: true,
        message: 'Internship record deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting internship record:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },


   
  /* ACHIEVEMENT RECORDS */
  // Get Achievement Records
  getAchievementRecords: async (req, res) => {
    try {
      const studentId = req.user.id;

      // First get the SAR_id for this student
      const [sarRows] = await db.execute(
        'SELECT SAR_id FROM Student_SAR WHERE student_id = ?',
        [studentId]
      );

      if (sarRows.length === 0) {
        // No SAR record found, return empty array
        return res.json({
          success: true,
          data: []
        });
      }

      const sarId = sarRows[0].SAR_id;

      const [rows] = await db.execute(
        `SELECT * FROM SARAchievements WHERE SAR_id = ? ORDER BY achievement_date DESC`,
        [sarId]
      );

      // Parse JSON fields for each record
      const achievementRecords = rows.map(record => ({
        ...record,
        team_members: safeJsonParse(record.team_members),
        skills_demonstrated: safeJsonParse(record.skills_demonstrated),
        technologies_used: safeJsonParse(record.technologies_used),
        media_urls: safeJsonParse(record.media_urls),
        tags: safeJsonParse(record.tags)
      }));

      res.json({
        success: true,
        data: achievementRecords
      });

    } catch (error) {
      console.error('Error fetching achievement records:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Create Achievement Record
  createAchievementRecord: async (req, res) => {
    try {
      const studentId = req.user.id;
      const {
        title, category, subcategory, description, achievement_date,
        date_of_event, level, organization, event_name,
        position_rank, total_participants, team_size, team_members,
        prize_amount, prize_currency, certificate_url, trophy_medal_received,
        media_coverage, media_urls, skills_demonstrated, technologies_used,
        tags, semester_achieved
      } = req.body;

      // Validate required fields
      if (!title || !category || !level) {
        return res.status(400).json({
          success: false,
          message: 'Title, category, and level are required'
        });
      }

      // Get or create SAR record first
      let sarId;
      const [sarRows] = await db.execute(
        'SELECT SAR_id FROM Student_SAR WHERE student_id = ?',
        [studentId]
      );

      if (sarRows.length === 0) {
        // Create SAR record first
        const [sarResult] = await db.execute(
          `INSERT INTO Student_SAR (student_id, enrollment_no, microsoft_email, current_semester, profile_completion_percentage, created_at, updated_at) 
           VALUES (?, '', '', 1, 0, NOW(), NOW())`,
          [studentId]
        );
        sarId = sarResult.insertId;
      } else {
        sarId = sarRows[0].SAR_id;
      }

      // Insert new achievement record
      const [result] = await db.execute(
        `INSERT INTO SARAchievements (
          SAR_id, title, category, subcategory, description, achievement_date,
          date_of_event, level, organization, event_name,
          position_rank, total_participants, team_size, team_members,
          prize_amount, prize_currency, certificate_url, trophy_medal_received,
          media_coverage, media_urls, skills_demonstrated, technologies_used,
          tags, semester_achieved,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          sarId, title, category, subcategory || null, description || null,
          formatDateForDB(achievement_date), formatDateForDB(date_of_event),
          level, organization || null, event_name || null, position_rank || null,
          total_participants || null, team_size || 1, JSON.stringify(team_members || []),
          prize_amount || null, prize_currency || 'INR', certificate_url || null,
          trophy_medal_received || false, media_coverage || false,
          JSON.stringify(media_urls || []), JSON.stringify(skills_demonstrated || []),
          JSON.stringify(technologies_used || []), JSON.stringify(tags || []),
          semester_achieved || null
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Achievement record created successfully',
        data: { id: result.insertId }
      });

    } catch (error) {
      console.error('Error creating achievement record:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update Achievement Record
  updateAchievementRecord: async (req, res) => {
    try {
      const studentId = req.user.id;
      const recordId = req.params.id;

      // Get SAR_id for this student
      const [sarRows] = await db.execute(
        'SELECT SAR_id FROM Student_SAR WHERE student_id = ?',
        [studentId]
      );

      if (sarRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'SAR record not found'
        });
      }

      const sarId = sarRows[0].SAR_id;

      // Verify record belongs to student
      const [existingRows] = await db.execute(
        'SELECT achievement_id FROM SARAchievements WHERE achievement_id = ? AND SAR_id = ?',
        [recordId, sarId]
      );

      if (existingRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Achievement record not found'
        });
      }

      const {
        title, category, subcategory, description, achievement_date,
        date_of_event, level, organization, event_name,
        position_rank, total_participants, team_size, team_members,
        prize_amount, prize_currency, certificate_url, trophy_medal_received,
        media_coverage, media_urls, skills_demonstrated, technologies_used,
        tags, semester_achieved
      } = req.body;

      // Update achievement record
      await db.execute(
        `UPDATE SARAchievements SET
          title = ?, category = ?, subcategory = ?, description = ?, achievement_date = ?,
          date_of_event = ?, level = ?, organization = ?,
          event_name = ?, position_rank = ?, total_participants = ?, team_size = ?,
          team_members = ?, prize_amount = ?, prize_currency = ?, certificate_url = ?,
          trophy_medal_received = ?, media_coverage = ?, media_urls = ?,
          skills_demonstrated = ?, technologies_used = ?, tags = ?, semester_achieved = ?,
          updated_at = NOW()
         WHERE achievement_id = ? AND SAR_id = ?`,
        [
          title, category, subcategory || null, description || null,
          formatDateForDB(achievement_date), formatDateForDB(date_of_event),
          level, organization || null, event_name || null, position_rank || null,
          total_participants || null, team_size || 1, JSON.stringify(team_members || []),
          prize_amount || null, prize_currency || 'INR', certificate_url || null,
          trophy_medal_received || false, media_coverage || false,
          JSON.stringify(media_urls || []), JSON.stringify(skills_demonstrated || []),
          JSON.stringify(technologies_used || []), JSON.stringify(tags || []),
          semester_achieved || null, recordId, sarId
        ]
      );

      res.json({
        success: true,
        message: 'Achievement record updated successfully'
      });

    } catch (error) {
      console.error('Error updating achievement record:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete Achievement Record
  deleteAchievementRecord: async (req, res) => {
    try {
      const studentId = req.user.id;
      const recordId = req.params.id;

      // Get SAR_id for this student
      const [sarRows] = await db.execute(
        'SELECT SAR_id FROM Student_SAR WHERE student_id = ?',
        [studentId]
      );

      if (sarRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'SAR record not found'
        });
      }

      const sarId = sarRows[0].SAR_id;

      const [result] = await db.execute(
        'DELETE FROM SARAchievements WHERE achievement_id = ? AND SAR_id = ?',
        [recordId, sarId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Achievement record not found'
        });
      }

      res.json({
        success: true,
        message: 'Achievement record deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting achievement record:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get Complete SAR Data
  getCompleteSAR: async (req, res) => {
    try {
      const studentId = req.user.id;

      // Get student basic details
      const [studentRows] = await db.execute(
        'SELECT * FROM students WHERE id = ?',
        [studentId]
      );

      if (studentRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Get SAR info
      const [sarRows] = await db.execute(
        'SELECT * FROM Student_SAR WHERE student_id = ?',
        [studentId]
      );

      let academicRows = [], internshipRows = [], achievementRows = [];
      
      if (sarRows.length > 0) {
        const sarId = sarRows[0].SAR_id;

        // Get academic records
        [academicRows] = await db.execute(
          'SELECT * FROM SARacademic WHERE SAR_id = ? ORDER BY semester ASC',
          [sarId]
        );

        // Get internship records
        [internshipRows] = await db.execute(
          'SELECT * FROM SARintern WHERE SAR_id = ? ORDER BY created_at DESC',
          [sarId]
        );

        // Get achievement records
        [achievementRows] = await db.execute(
          'SELECT * FROM SARAchievements WHERE SAR_id = ? ORDER BY achievement_date DESC',
          [sarId]
        );
      }

      // Parse JSON fields
      const academicRecords = academicRows.map(record => ({
        ...record,
        subjects: safeJsonParse(record.subjects)
      }));

      const internshipRecords = internshipRows.map(record => ({
        ...record,
        skills_learned: safeJsonParse(record.skills_learned),
        technologies_used: safeJsonParse(record.technologies_used),
        media_urls: safeJsonParse(record.media_urls),
        performance_rating: convertEnumToRating(record.performance_rating) // Convert ENUM back to numeric
      }));

      const achievementRecords = achievementRows.map(record => ({
        ...record,
        team_members: safeJsonParse(record.team_members),
        skills_demonstrated: safeJsonParse(record.skills_demonstrated),
        technologies_used: safeJsonParse(record.technologies_used),
        media_urls: safeJsonParse(record.media_urls),
        tags: safeJsonParse(record.tags)
      }));

      res.json({
        success: true,
        data: {
          student: studentRows[0],
          sarInfo: sarRows[0] || {
            enrollment_no: '',
            microsoft_email: '',
            current_semester: 1,
            profile_completion_percentage: 0
          },
          academicRecords,
          internships: internshipRecords,
          achievements: achievementRecords
        }
      });

    } catch (error) {
      console.error('Error fetching complete SAR:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get SAR Statistics
  getSARStatistics: async (req, res) => {
    try {
      const studentId = req.user.id;

      // Get SAR_id first
      const [sarRows] = await db.execute(
        'SELECT SAR_id FROM Student_SAR WHERE student_id = ?',
        [studentId]
      );

      let academicCount = [{ count: 0 }];
      let internshipCount = [{ count: 0 }];
      let achievementCount = [{ count: 0 }];
      let cgpaData = [{ avg_cgpa: null }];

      if (sarRows.length > 0) {
        const sarId = sarRows[0].SAR_id;

        // Get counts
        [academicCount] = await db.execute(
          'SELECT COUNT(*) as count FROM SARacademic WHERE SAR_id = ?',
          [sarId]
        );

        [internshipCount] = await db.execute(
          'SELECT COUNT(*) as count FROM SARintern WHERE SAR_id = ?',
          [sarId]
        );

        [achievementCount] = await db.execute(
          'SELECT COUNT(*) as count FROM SARAchievements WHERE SAR_id = ?',
          [sarId]
        );

        // Get average CGPA
        [cgpaData] = await db.execute(
          'SELECT AVG(cgpa) as avg_cgpa FROM SARacademic WHERE SAR_id = ? AND cgpa IS NOT NULL',
          [sarId]
        );
      }

      res.json({
        success: true,
        data: {
          academicRecordsCount: academicCount[0].count,
          internshipsCount: internshipCount[0].count,
          achievementsCount: achievementCount[0].count,
          averageCGPA: cgpaData[0].avg_cgpa ? parseFloat(cgpaData[0].avg_cgpa).toFixed(2) : null
        }
      });

    } catch (error) {
      console.error('Error fetching SAR statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Generate Cloudinary upload signature
  generateUploadSignature: async (req, res) => {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      
      // Get folder from request body, default to internship-documents
      const folder = req.body.folder || 'internship-documents';
      
      // Only include parameters that are supported for signature generation
      const params = {
        timestamp: timestamp,
        folder: folder
      };

      const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

      res.json({
        success: true,
        signature,
        timestamp,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        folder: params.folder
      });
    } catch (error) {
      console.error('Error generating upload signature:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate upload signature'
      });
    }
  },

  // Get student details by enrollment number (unprotected for testing)
  getStudentByEnrollment: async (req, res) => {
    try {
      const { enrollmentNo } = req.params;

      if (!enrollmentNo) {
        return res.status(400).json({
          success: false,
          message: 'Enrollment number is required'
        });
      }

      // First, get student_id from Student_SAR table using enrollment_no
      const [sarRecords] = await db.query(
        'SELECT student_id FROM Student_SAR WHERE enrollment_no = ?',
        [enrollmentNo]
      );

      if (!sarRecords || sarRecords.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No SAR record found for this enrollment number'
        });
      }

      const studentId = sarRecords[0].student_id;

      // Get student basic info from students table
      const [students] = await db.query(
        'SELECT * FROM students WHERE id = ?',
        [studentId]
      );

      if (!students || students.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const student = students[0];

      // Get SAR info from Student_SAR table
      const [sarInfo] = await db.query(
        'SELECT * FROM Student_SAR WHERE student_id = ?',
        [studentId]
      );

      // Get all SAR data in parallel
      const [
        [academicRecords],
        [internshipRecords],
        [achievementRecords]
      ] = await Promise.all([
        db.query('SELECT * FROM SARacademic WHERE SAR_id = ? ORDER BY semester', [studentId]),
        db.query('SELECT * FROM SARintern WHERE SAR_id = ? ORDER BY start_date DESC', [studentId]),
        db.query('SELECT * FROM SARAchievements WHERE SAR_id = ? ORDER BY achievement_date DESC', [studentId])
      ]);

      // Parse academic records
      const parsedAcademicRecords = academicRecords.map(record => ({
        ...record,
        subjects: safeJsonParse(record.subjects, [])
      }));

      // Parse achievement records
      const parsedAchievementRecords = achievementRecords.map(record => ({
        ...record,
        team_members: safeJsonParse(record.team_members, []),
        mentors: safeJsonParse(record.mentors, []),
        skills_developed: safeJsonParse(record.skills_developed, [])
      }));

      // Construct response
      const response = {
        success: true,
        data: {
          student: {
            id: student.id,
            firstName: student.firstName,
            middleName: student.middleName,
            lastName: student.lastName,
            email: student.email,
            mobile: student.mobile,
            dob: student.dob,
            placeOfBirth: student.placeOfBirth,
            gender: student.gender,
            category: student.category,
            subCategory: student.subCategory,
            region: student.region,
            currentAddress: student.currentAddress,
            permanentAddress: student.permanentAddress,
            course: student.course,
            examRoll: student.examRoll,
            examRank: student.examRank,
            abcId: student.abcId,
            batch: student.batch,
            status: student.status,
            photo: student.photo,
            created_at: student.created_at
          },
          parents: {
            father: {
              name: student.father_name,
              qualification: student.father_qualification,
              occupation: student.father_occupation,
              email: student.father_email,
              mobile: student.father_mobile,
              officeAddress: student.father_officeAddress
            },
            mother: {
              name: student.mother_name,
              qualification: student.mother_qualification,
              occupation: student.mother_occupation,
              email: student.mother_email,
              mobile: student.mother_mobile,
              officeAddress: student.mother_officeAddress
            },
            familyIncome: student.familyIncome
          },
          sarInfo: sarInfo[0] ? {
            enrollment_no: sarInfo[0].enrollment_no,
            microsoft_email: sarInfo[0].microsoft_email,
            current_semester: sarInfo[0].current_semester,
            sar_status: sarInfo[0].sar_status,
            profile_completion_percentage: sarInfo[0].profile_completion_percentage
          } : null,
          sar: {
            academic: parsedAcademicRecords,
            internships: internshipRecords,
            achievements: parsedAchievementRecords,
            statistics: {
              totalAcademicRecords: parsedAcademicRecords.length,
              totalInternships: internshipRecords.length,
              totalAchievements: parsedAchievementRecords.length
            }
          }
        }
      };

      res.json(response);

    } catch (error) {
      console.error('Error fetching student by enrollment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch student details',
        error: error.message
      });
    }
  }
};

module.exports = sarController;