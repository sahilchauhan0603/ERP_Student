const db = require('../config/db').promise;

const sarController = {
  // Test database connection
  testConnection: async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT 1 as test');
      
      // Check table structures
      const [sarAcademicStructure] = await db.execute('DESCRIBE SARacademic');
      const [sarInternStructure] = await db.execute('DESCRIBE SARintern');
      const [sarAchievementsStructure] = await db.execute('DESCRIBE SARAchievements');
      
      res.json({
        success: true,
        message: 'Database connection working',
        data: rows,
        tableStructures: {
          SARacademic: sarAcademicStructure,
          SARintern: sarInternStructure,
          SARAchievements: sarAchievementsStructure
        }
      });
    } catch (error) {
      console.error('Database test error:', error);
      res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: error.message
      });
    }
  },

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
          message: 'Student not found'
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

      // Parse JSON subjects field for each record
      const academicRecords = rows.map(record => ({
        ...record,
        subjects: record.subjects ? JSON.parse(record.subjects) : []
      }));

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
          message: 'Semester and academic year are required'
        });
      }

      // Validate semester range
      if (semester < 1 || semester > 8) {
        return res.status(400).json({
          success: false,
          message: 'Invalid semester. Must be between 1 and 8'
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
        return res.status(400).json({
          success: false,
          message: 'Academic record for this semester already exists'
        });
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
      res.status(500).json({
        success: false,
        message: 'Internal server error'
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
          remarks || null, JSON.stringify(subjects || []), recordId, sarId
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

      // Parse JSON fields for each record
      const internshipRecords = rows.map(record => ({
        ...record,
        skills_learned: record.skills_learned ? JSON.parse(record.skills_learned) : [],
        technologies_used: record.technologies_used ? JSON.parse(record.technologies_used) : [],
        media_urls: record.media_urls ? JSON.parse(record.media_urls) : []
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
        final_presentation, offer_letter_received, status
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
          performance_rating, final_presentation, offer_letter_received, status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          sarId, company_name, position, internship_type || 'summer',
          start_date || null, end_date || null, duration_months || null,
          duration_weeks || null, stipend || null, currency || 'INR',
          location || null, work_mode || 'onsite', description || null,
          key_responsibilities || null, JSON.stringify(skills_learned || []),
          JSON.stringify(technologies_used || []), supervisor_name || null,
          supervisor_designation || null, supervisor_email || null,
          supervisor_phone || null, performance_rating || null,
          final_presentation || false, offer_letter_received || false,
          status || 'applied'
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
        final_presentation, offer_letter_received, status
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
          offer_letter_received = ?, status = ?, updated_at = NOW()
         WHERE internship_id = ? AND SAR_id = ?`,
        [
          company_name, position, internship_type || 'summer', start_date || null,
          end_date || null, duration_months || null, duration_weeks || null,
          stipend || null, currency || 'INR', location || null, work_mode || 'onsite',
          description || null, key_responsibilities || null,
          JSON.stringify(skills_learned || []), JSON.stringify(technologies_used || []),
          supervisor_name || null, supervisor_designation || null,
          supervisor_email || null, supervisor_phone || null,
          performance_rating || null, final_presentation || false,
          offer_letter_received || false, status || 'applied',
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
        team_members: record.team_members ? JSON.parse(record.team_members) : [],
        skills_demonstrated: record.skills_demonstrated ? JSON.parse(record.skills_demonstrated) : [],
        technologies_used: record.technologies_used ? JSON.parse(record.technologies_used) : [],
        media_urls: record.media_urls ? JSON.parse(record.media_urls) : [],
        tags: record.tags ? JSON.parse(record.tags) : []
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
        event_start_date, event_end_date, level, organization, event_name,
        position_rank, total_participants, team_size, team_members,
        prize_amount, prize_currency, certificate_url, trophy_medal_received,
        media_coverage, media_urls, skills_demonstrated, technologies_used,
        verification_status, points_awarded, impact_score, tags, semester_achieved
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
          event_start_date, event_end_date, level, organization, event_name,
          position_rank, total_participants, team_size, team_members,
          prize_amount, prize_currency, certificate_url, trophy_medal_received,
          media_coverage, media_urls, skills_demonstrated, technologies_used,
          verification_status, points_awarded, impact_score, tags, semester_achieved,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          sarId, title, category, subcategory || null, description || null,
          achievement_date || null, event_start_date || null, event_end_date || null,
          level, organization || null, event_name || null, position_rank || null,
          total_participants || null, team_size || 1, JSON.stringify(team_members || []),
          prize_amount || null, prize_currency || 'INR', certificate_url || null,
          trophy_medal_received || false, media_coverage || false,
          JSON.stringify(media_urls || []), JSON.stringify(skills_demonstrated || []),
          JSON.stringify(technologies_used || []), verification_status || 'pending',
          points_awarded || 0, impact_score || null, JSON.stringify(tags || []),
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
        event_start_date, event_end_date, level, organization, event_name,
        position_rank, total_participants, team_size, team_members,
        prize_amount, prize_currency, certificate_url, trophy_medal_received,
        media_coverage, media_urls, skills_demonstrated, technologies_used,
        verification_status, points_awarded, impact_score, tags, semester_achieved
      } = req.body;

      // Update achievement record
      await db.execute(
        `UPDATE SARAchievements SET
          title = ?, category = ?, subcategory = ?, description = ?, achievement_date = ?,
          event_start_date = ?, event_end_date = ?, level = ?, organization = ?,
          event_name = ?, position_rank = ?, total_participants = ?, team_size = ?,
          team_members = ?, prize_amount = ?, prize_currency = ?, certificate_url = ?,
          trophy_medal_received = ?, media_coverage = ?, media_urls = ?,
          skills_demonstrated = ?, technologies_used = ?, verification_status = ?,
          points_awarded = ?, impact_score = ?, tags = ?, semester_achieved = ?,
          updated_at = NOW()
         WHERE achievement_id = ? AND SAR_id = ?`,
        [
          title, category, subcategory || null, description || null,
          achievement_date || null, event_start_date || null, event_end_date || null,
          level, organization || null, event_name || null, position_rank || null,
          total_participants || null, team_size || 1, JSON.stringify(team_members || []),
          prize_amount || null, prize_currency || 'INR', certificate_url || null,
          trophy_medal_received || false, media_coverage || false,
          JSON.stringify(media_urls || []), JSON.stringify(skills_demonstrated || []),
          JSON.stringify(technologies_used || []), verification_status || 'pending',
          points_awarded || 0, impact_score || null, JSON.stringify(tags || []),
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
        subjects: record.subjects ? JSON.parse(record.subjects) : []
      }));

      const internshipRecords = internshipRows.map(record => ({
        ...record,
        skills_learned: record.skills_learned ? JSON.parse(record.skills_learned) : [],
        technologies_used: record.technologies_used ? JSON.parse(record.technologies_used) : [],
        media_urls: record.media_urls ? JSON.parse(record.media_urls) : []
      }));

      const achievementRecords = achievementRows.map(record => ({
        ...record,
        team_members: record.team_members ? JSON.parse(record.team_members) : [],
        skills_demonstrated: record.skills_demonstrated ? JSON.parse(record.skills_demonstrated) : [],
        technologies_used: record.technologies_used ? JSON.parse(record.technologies_used) : [],
        media_urls: record.media_urls ? JSON.parse(record.media_urls) : [],
        tags: record.tags ? JSON.parse(record.tags) : []
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
  }
};

module.exports = sarController;