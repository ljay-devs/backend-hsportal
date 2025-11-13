const connection = require("../database/db");
const bcrypt = require("bcrypt");

// ==================== STUDENTS MANAGEMENT ====================

// Get all students (Grade 11-12 only)
const getAllStudents = async (req, res) => {
  try {
    const { search, grade } = req.query;
    
    let query = `
      SELECT 
        s.user_id,
        s.fname,
        s.lname,
        s.mname,
        s.email,
        s.gender,
        s.yearlevel,
        s.section_name,
        s.section_id,
        s.strand,
        s.status_enroll,
        u.status
      FROM student_info s
      INNER JOIN tblusers u ON s.user_id = u.user_id
      WHERE u.status = 'active' 
      AND s.yearlevel IN ('11', '12')
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (s.fname LIKE ? OR s.lname LIKE ? OR s.user_id LIKE ? OR s.email LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }
    
    if (grade && (grade === '11' || grade === '12')) {
      query += ` AND s.yearlevel = ?`;
      params.push(grade);
    }
    
    query += ` ORDER BY s.lname, s.fname`;
    
    connection.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching students:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching students",
          error: err.message
        });
      }
      
      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    console.error("Error in getAllStudents:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get student subjects
const getStudentSubjects = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const query = `
      SELECT 
        ssa.sub_code,
        si.sub_name,
        si.teacher_id,
        CONCAT(ti.fname, ' ', ti.lname) as teacher_name
      FROM subject_section_assignments ssa
      INNER JOIN student_info s ON ssa.section_id = s.section_id
      INNER JOIN subject_info si ON ssa.sub_code = si.sub_code
      LEFT JOIN teacher_info ti ON si.teacher_id = ti.user_id
      WHERE s.user_id = ?
      ORDER BY si.sub_name
    `;
    
    connection.query(query, [studentId], (err, results) => {
      if (err) {
        console.error("Error fetching student subjects:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching student subjects",
          error: err.message
        });
      }
      
      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    console.error("Error in getStudentSubjects:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update student information
const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { fname, lname, mname, email, gender, yearlevel, section_id, strand } = req.body;
    
    // Validate required fields
    if (!fname || !lname || !yearlevel || !section_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    // Check if email already exists for another user
    if (email) {
      const emailCheckQuery = `SELECT user_id FROM tblusers WHERE email = ? AND user_id != ?`;
      connection.query(emailCheckQuery, [email, studentId], (err, results) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error checking email",
            error: err.message
          });
        }
        
        if (results.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Email already exists"
          });
        }
        
        // Update student info
        performStudentUpdate();
      });
    } else {
      performStudentUpdate();
    }
    
    function performStudentUpdate() {
      // Get section name
      const sectionQuery = `SELECT section_name FROM section_info WHERE section_id = ?`;
      connection.query(sectionQuery, [section_id], (err, sectionResults) => {
        if (err || sectionResults.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid section ID"
          });
        }
        
        const section_name = sectionResults[0].section_name;
        
        const updateQuery = `
          UPDATE student_info 
          SET fname = ?, lname = ?, mname = ?, email = ?, gender = ?, 
              yearlevel = ?, section_id = ?, section_name = ?, strand = ?
          WHERE user_id = ?
        `;
        
        connection.query(
          updateQuery,
          [fname, lname, mname || null, email, gender, yearlevel, section_id, section_name, strand, studentId],
          (err, result) => {
            if (err) {
              return res.status(500).json({
                success: false,
                message: "Error updating student",
                error: err.message
              });
            }
            
            // Update email in tblusers if provided
            if (email) {
              const updateUserQuery = `UPDATE tblusers SET email = ? WHERE user_id = ?`;
              connection.query(updateUserQuery, [email, studentId], (err) => {
                if (err) {
                  console.error("Error updating user email:", err);
                }
              });
            }
            
            res.json({
              success: true,
              message: "Student updated successfully"
            });
          }
        );
      });
    }
  } catch (error) {
    console.error("Error in updateStudent:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Add new student
const addStudent = async (req, res) => {
  try {
    const { 
      user_id, 
      fname, 
      lname, 
      mname, 
      email, 
      password, 
      gender, 
      yearlevel, 
      section_id, 
      strand 
    } = req.body;
    
    // Validate required fields
    if (!user_id || !fname || !lname || !email || !password || !gender || !yearlevel || !section_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    // Only allow Grade 11-12
    if (yearlevel !== '11' && yearlevel !== '12') {
      return res.status(400).json({
        success: false,
        message: "Only Grade 11-12 students can be added"
      });
    }
    
    // Check if user ID or email already exists
    const checkQuery = `SELECT user_id FROM tblusers WHERE user_id = ? OR email = ?`;
    connection.query(checkQuery, [user_id, email], (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error checking user existence",
          error: err.message
        });
      }
      
      if (results.length > 0) {
        return res.status(400).json({
          success: false,
          message: "User ID or email already exists"
        });
      }
      
      // Get section name and check capacity
      const sectionQuery = `
        SELECT section_name, current_count, max_capacity 
        FROM section_info 
        WHERE section_id = ?
      `;
      connection.query(sectionQuery, [section_id], async (err, sectionResults) => {
        if (err || sectionResults.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid section ID"
          });
        }
        
        const section = sectionResults[0];
        
        if (section.current_count >= section.max_capacity) {
          return res.status(400).json({
            success: false,
            message: "Section is at full capacity"
          });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert into tblusers
        const insertUserQuery = `
          INSERT INTO tblusers (user_id, password, email, status, role)
          VALUES (?, ?, ?, 'active', 'Student')
        `;
        
        connection.query(insertUserQuery, [user_id, hashedPassword, email], (err) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Error creating user account",
              error: err.message
            });
          }
          
          // Insert into student_info
          const insertStudentQuery = `
            INSERT INTO student_info 
            (user_id, fname, lname, mname, email, gender, yearlevel, section_id, section_name, strand, position, status_enroll)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SHS', 'Enrolled')
          `;
          
          connection.query(
            insertStudentQuery,
            [user_id, fname, lname, mname || null, email, gender, yearlevel, section_id, section.section_name, strand],
            (err) => {
              if (err) {
                // Rollback user creation
                connection.query('DELETE FROM tblusers WHERE user_id = ?', [user_id]);
                return res.status(500).json({
                  success: false,
                  message: "Error creating student",
                  error: err.message
                });
              }
              
              // Update section count
              const updateCountQuery = `
                UPDATE section_info 
                SET current_count = current_count + 1 
                WHERE section_id = ?
              `;
              connection.query(updateCountQuery, [section_id]);
              
              res.status(201).json({
                success: true,
                message: "Student added successfully"
              });
            }
          );
        });
      });
    });
  } catch (error) {
    console.error("Error in addStudent:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Archive student
const archiveStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Get student info before archiving
    const getStudentQuery = `
      SELECT section_id FROM student_info WHERE user_id = ?
    `;
    
    connection.query(getStudentQuery, [studentId], (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Student not found"
        });
      }
      
      const section_id = results[0].section_id;
      
      // Update user status to archived
      const archiveQuery = `UPDATE tblusers SET status = 'archived' WHERE user_id = ?`;
      
      connection.query(archiveQuery, [studentId], (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error archiving student",
            error: err.message
          });
        }
        
        // Update section count
        if (section_id) {
          const updateCountQuery = `
            UPDATE section_info 
            SET current_count = GREATEST(current_count - 1, 0) 
            WHERE section_id = ?
          `;
          connection.query(updateCountQuery, [section_id]);
        }
        
        res.json({
          success: true,
          message: "Student archived successfully"
        });
      });
    });
  } catch (error) {
    console.error("Error in archiveStudent:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ==================== TEACHERS MANAGEMENT ====================

// Get all teachers


const getAllTeachers = async (req, res) => {
  try {
    const { search } = req.query;
    
    // Query with LEFT JOIN to get adviser's section
    let query = `
      SELECT 
        t.user_id,
        t.fname,
        t.lname,
        t.mname,
        t.email,
        t.position,
        t.employment_status,
        u.status,
        sec.yearlevel,
        sec.section_name,
        sec.section_id
      FROM teacher_info t
      INNER JOIN tblusers u ON t.user_id = u.user_id
      LEFT JOIN section_info sec ON t.user_id = sec.adviser_id
      WHERE u.status = 'active'
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (t.fname LIKE ? OR t.lname LIKE ? OR t.user_id LIKE ? OR t.email LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }
    
    query += ` ORDER BY t.lname, t.fname`;
    
    connection.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching teachers:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching teachers",
          error: err.message
        });
      }
      
      // Log the results to debug
      console.log('Teachers query results:', results);
      
      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    console.error("Error in getAllTeachers:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


// Add new teacher
const addTeacher = async (req, res) => {
  try {
    const { 
      user_id, 
      fname, 
      lname, 
      mname, 
      email, 
      password, 
      position, 
      section_id 
    } = req.body;
    
    // Validate required fields
    if (!user_id || !fname || !lname || !email || !password || !position) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    // If Adviser, section_id is required
    if (position === 'Adviser' && !section_id) {
      return res.status(400).json({
        success: false,
        message: "Section is required for Adviser position"
      });
    }
    
    // Check if user ID or email already exists
    const checkQuery = `SELECT user_id FROM tblusers WHERE user_id = ? OR email = ?`;
    connection.query(checkQuery, [user_id, email], (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error checking user existence",
          error: err.message
        });
      }
      
      if (results.length > 0) {
        return res.status(400).json({
          success: false,
          message: "User ID or email already exists"
        });
      }
      
      // If Adviser, check if section already has an adviser
      if (position === 'Adviser' && section_id) {
        const adviserCheckQuery = `
          SELECT adviser_id FROM section_info 
          WHERE section_id = ? AND adviser_id IS NOT NULL
        `;
        connection.query(adviserCheckQuery, [section_id], async (err, results) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Error checking section adviser",
              error: err.message
            });
          }
          
          if (results.length > 0) {
            return res.status(400).json({
              success: false,
              message: "This section already has an adviser"
            });
          }
          
          createTeacher();
        });
      } else {
        createTeacher();
      }
      
      async function createTeacher() {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Determine role
        const role = position === 'Adviser' ? 'Adviser' : 'Teacher';
        
        // Insert into tblusers
        const insertUserQuery = `
          INSERT INTO tblusers (user_id, password, email, status, role)
          VALUES (?, ?, ?, 'active', ?)
        `;
        
        connection.query(insertUserQuery, [user_id, hashedPassword, email, role], (err) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Error creating user account",
              error: err.message
            });
          }
          
          // Insert into teacher_info
          const insertTeacherQuery = `
            INSERT INTO teacher_info 
            (user_id, fname, lname, mname, email, position, employment_status)
            VALUES (?, ?, ?, ?, ?, ?, 'Full-time')
          `;
          
          connection.query(
            insertTeacherQuery,
            [user_id, fname, lname, mname || null, email, position],
            (err) => {
              if (err) {
                // Rollback user creation
                connection.query('DELETE FROM tblusers WHERE user_id = ?', [user_id]);
                return res.status(500).json({
                  success: false,
                  message: "Error creating teacher",
                  error: err.message
                });
              }
              
              // If Adviser, update section
              if (position === 'Adviser' && section_id) {
                const updateSectionQuery = `
                  UPDATE section_info 
                  SET adviser_id = ? 
                  WHERE section_id = ?
                `;
                connection.query(updateSectionQuery, [user_id, section_id]);
              }
              
              res.status(201).json({
                success: true,
                message: "Teacher added successfully"
              });
            }
          );
        });
      }
    });
  } catch (error) {
    console.error("Error in addTeacher:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Archive teacher
const archiveTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Update user status to archived
    const archiveQuery = `UPDATE tblusers SET status = 'archived' WHERE user_id = ?`;
    
    connection.query(archiveQuery, [teacherId], (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error archiving teacher",
          error: err.message
        });
      }
      
      // Remove from section adviser if applicable
      const updateSectionQuery = `
        UPDATE section_info 
        SET adviser_id = NULL 
        WHERE adviser_id = ?
      `;
      connection.query(updateSectionQuery, [teacherId]);
      
      res.json({
        success: true,
        message: "Teacher archived successfully"
      });
    });
  } catch (error) {
    console.error("Error in archiveTeacher:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ==================== SUBJECTS MANAGEMENT ====================

// Get all subjects
const getAllSubjects = async (req, res) => {
  try {
    const { search, grade } = req.query;
    
    let query = `
      SELECT 
        s.sub_code,
        s.sub_name,
        s.teacher_id,
        s.yearlevel,
        s.school_year,
        CONCAT(t.fname, ' ', t.lname) as teacher_name
      FROM subject_info s
      LEFT JOIN teacher_info t ON s.teacher_id = t.user_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (s.sub_code LIKE ? OR s.sub_name LIKE ? OR CONCAT(t.fname, ' ', t.lname) LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    
    if (grade) {
      query += ` AND s.yearlevel = ?`;
      params.push(grade);
    }
    
    query += ` ORDER BY s.yearlevel, s.sub_name`;
    
    connection.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching subjects:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching subjects",
          error: err.message
        });
      }
      
      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    console.error("Error in getAllSubjects:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Add new subject
const addSubject = async (req, res) => {
  try {
    const { sub_code, sub_name, teacher_id, yearlevel, school_year } = req.body;
    
    // Validate required fields
    if (!sub_code || !sub_name || !yearlevel || !school_year) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    // Check if subject code already exists for this school year
    const checkQuery = `
      SELECT sub_code FROM subject_info 
      WHERE sub_code = ? AND school_year = ?
    `;
    connection.query(checkQuery, [sub_code, school_year], (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error checking subject existence",
          error: err.message
        });
      }
      
      if (results.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Subject code already exists for this school year"
        });
      }
      
      // Insert subject
      const insertQuery = `
        INSERT INTO subject_info (sub_code, sub_name, teacher_id, yearlevel, school_year)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      connection.query(
        insertQuery,
        [sub_code, sub_name, teacher_id || null, yearlevel, school_year],
        (err) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Error creating subject",
              error: err.message
            });
          }
          
          res.status(201).json({
            success: true,
            message: "Subject added successfully"
          });
        }
      );
    });
  } catch (error) {
    console.error("Error in addSubject:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update subject
const updateSubject = async (req, res) => {
  try {
    const { sub_code, school_year } = req.params;
    const { sub_name, teacher_id, yearlevel } = req.body;
    
    // Validate required fields
    if (!sub_name || !yearlevel) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    const updateQuery = `
      UPDATE subject_info 
      SET sub_name = ?, teacher_id = ?, yearlevel = ?
      WHERE sub_code = ? AND school_year = ?
    `;
    
    connection.query(
      updateQuery,
      [sub_name, teacher_id || null, yearlevel, sub_code, school_year],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error updating subject",
            error: err.message
          });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "Subject not found"
          });
        }
        
        res.json({
          success: true,
          message: "Subject updated successfully"
        });
      }
    );
  } catch (error) {
    console.error("Error in updateSubject:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ==================== ADMINS MANAGEMENT ====================

// Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = `
      SELECT 
        a.user_id,
        a.fname,
        a.lname,
        a.mname,
        a.email,
        a.position,
        u.status
      FROM admin_info a
      INNER JOIN tblusers u ON a.user_id = u.user_id
      WHERE u.status = 'active'
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (a.fname LIKE ? OR a.lname LIKE ? OR a.user_id LIKE ? OR a.email LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }
    
    query += ` ORDER BY a.lname, a.fname`;
    
    connection.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching admins:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching admins",
          error: err.message
        });
      }
      
      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    console.error("Error in getAllAdmins:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Add new admin
const addAdmin = async (req, res) => {
  try {
    const { user_id, fname, lname, mname, email, password, position } = req.body;
    
    // Validate required fields
    if (!user_id || !fname || !lname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    // Check if user ID or email already exists
    const checkQuery = `SELECT user_id FROM tblusers WHERE user_id = ? OR email = ?`;
    connection.query(checkQuery, [user_id, email], async (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error checking user existence",
          error: err.message
        });
      }
      
      if (results.length > 0) {
        return res.status(400).json({
          success: false,
          message: "User ID or email already exists"
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert into tblusers
      const insertUserQuery = `
        INSERT INTO tblusers (user_id, password, email, status, role)
        VALUES (?, ?, ?, 'active', 'Admin')
      `;
      
      connection.query(insertUserQuery, [user_id, hashedPassword, email], (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error creating user account",
            error: err.message
          });
        }
        
        // Insert into admin_info
        const insertAdminQuery = `
          INSERT INTO admin_info (user_id, fname, lname, mname, email, position)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        connection.query(
          insertAdminQuery,
          [user_id, fname, lname, mname || null, email, position || 'Administrator'],
          (err) => {
            if (err) {
              // Rollback user creation
              connection.query('DELETE FROM tblusers WHERE user_id = ?', [user_id]);
              return res.status(500).json({
                success: false,
                message: "Error creating admin",
                error: err.message
              });
            }
            
            res.status(201).json({
              success: true,
              message: "Admin added successfully"
            });
          }
        );
      });
    });
  } catch (error) {
    console.error("Error in addAdmin:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Archive admin
const archiveAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    
    // Check if this is the last active admin
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM tblusers 
      WHERE role = 'Admin' AND status = 'active'
    `;
    
    connection.query(countQuery, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error checking admin count",
          error: err.message
        });
      }
      
      if (results[0].count <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot archive the last admin account"
        });
      }
      
      // Update user status to archived
      const archiveQuery = `UPDATE tblusers SET status = 'archived' WHERE user_id = ?`;
      
      connection.query(archiveQuery, [adminId], (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error archiving admin",
            error: err.message
          });
        }
        
        res.json({
          success: true,
          message: "Admin archived successfully"
        });
      });
    });
  } catch (error) {
    console.error("Error in archiveAdmin:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ==================== ARCHIVE MANAGEMENT ====================

// Get all archived users
const getArchivedUsers = async (req, res) => {
  try {
    const { search, type } = req.query;
    
    let query = `
      SELECT 
        u.user_id,
        u.email,
        u.role as type,
        u.status,
        u.updated_at as archived_date,
        COALESCE(s.fname, t.fname, a.fname) as fname,
        COALESCE(s.lname, t.lname, a.lname) as lname
      FROM tblusers u
      LEFT JOIN student_info s ON u.user_id = s.user_id
      LEFT JOIN teacher_info t ON u.user_id = t.user_id
      LEFT JOIN admin_info a ON u.user_id = a.user_id
      WHERE u.status = 'archived'
    `;
    
    const params = [];
    
    if (type && type !== 'All') {
      if (type === 'Student') {
        query += ` AND u.role = 'Student'`;
      } else if (type === 'Teacher') {
        query += ` AND u.role IN ('Teacher', 'Adviser')`;
      } else if (type === 'Admin') {
        query += ` AND u.role = 'Admin'`;
      }
    }
    
    if (search) {
      query += ` AND (
        COALESCE(s.fname, t.fname, a.fname) LIKE ? OR 
        COALESCE(s.lname, t.lname, a.lname) LIKE ? OR 
        u.user_id LIKE ? OR 
        u.email LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }
    
    query += ` ORDER BY u.updated_at DESC`;
    
    connection.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching archived users:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching archived users",
          error: err.message
        });
      }
      
      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    console.error("Error in getArchivedUsers:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Restore archived user
const restoreUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Update user status to active
    const restoreQuery = `UPDATE tblusers SET status = 'active' WHERE user_id = ?`;
    
    connection.query(restoreQuery, [userId], (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error restoring user",
          error: err.message
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      // Update section count if student
      const updateCountQuery = `
        UPDATE section_info si
        INNER JOIN student_info s ON si.section_id = s.section_id
        SET si.current_count = si.current_count + 1
        WHERE s.user_id = ?
      `;
      connection.query(updateCountQuery, [userId]);
      
      res.json({
        success: true,
        message: "User restored successfully"
      });
    });
  } catch (error) {
    console.error("Error in restoreUser:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete user permanently
const deleteUserPermanently = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Start transaction
    connection.beginTransaction((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error starting transaction",
          error: err.message
        });
      }
      
      // Delete from respective info table
      const deleteInfoQueries = [
        'DELETE FROM student_info WHERE user_id = ?',
        'DELETE FROM teacher_info WHERE user_id = ?',
        'DELETE FROM admin_info WHERE user_id = ?'
      ];
      
      let completedQueries = 0;
      
      deleteInfoQueries.forEach(query => {
        connection.query(query, [userId], (err) => {
          completedQueries++;
          
          if (completedQueries === deleteInfoQueries.length) {
            // Delete from tblusers
            const deleteUserQuery = 'DELETE FROM tblusers WHERE user_id = ?';
            
            connection.query(deleteUserQuery, [userId], (err, result) => {
              if (err) {
                return connection.rollback(() => {
                  res.status(500).json({
                    success: false,
                    message: "Error deleting user",
                    error: err.message
                  });
                });
              }
              
              if (result.affectedRows === 0) {
                return connection.rollback(() => {
                  res.status(404).json({
                    success: false,
                    message: "User not found"
                  });
                });
              }
              
              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    res.status(500).json({
                      success: false,
                      message: "Error committing transaction",
                      error: err.message
                    });
                  });
                }
                
                res.json({
                  success: true,
                  message: "User deleted permanently"
                });
              });
            });
          }
        });
      });
    });
  } catch (error) {
    console.error("Error in deleteUserPermanently:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ==================== SECTIONS MANAGEMENT ====================

// Get all sections
const getAllSections = async (req, res) => {
  try {
    const { grade } = req.query;
    
    let query = `
      SELECT 
        s.section_id,
        s.section_name,
        s.yearlevel,
        s.school_year,
        s.adviser_id,
        s.max_capacity,
        s.current_count,
        CONCAT(t.fname, ' ', t.lname) as adviser_name
      FROM section_info s
      LEFT JOIN teacher_info t ON s.adviser_id = t.user_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (grade) {
      query += ` AND s.yearlevel = ?`;
      params.push(grade);
    }
    
    query += ` ORDER BY s.yearlevel, s.section_name`;
    
    connection.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching sections:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching sections",
          error: err.message
        });
      }
      
      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    console.error("Error in getAllSections:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Add new section
const addSection = async (req, res) => {
  try {
    const { section_name, yearlevel, school_year, adviser_id, max_capacity } = req.body;
    
    // Validate required fields
    if (!section_name || !yearlevel || !school_year) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    // Check if section already exists for this year level and school year
    const checkQuery = `
      SELECT section_id FROM section_info 
      WHERE section_name = ? AND yearlevel = ? AND school_year = ?
    `;
    connection.query(checkQuery, [section_name, yearlevel, school_year], (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error checking section existence",
          error: err.message
        });
      }
      
      if (results.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Section already exists for this grade and school year"
        });
      }
      
      // If adviser provided, check if already assigned
      if (adviser_id) {
        const adviserCheckQuery = `
          SELECT section_id FROM section_info 
          WHERE adviser_id = ? AND school_year = ?
        `;
        connection.query(adviserCheckQuery, [adviser_id, school_year], (err, results) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Error checking adviser assignment",
              error: err.message
            });
          }
          
          if (results.length > 0) {
            return res.status(400).json({
              success: false,
              message: "This adviser is already assigned to another section"
            });
          }
          
          createSection();
        });
      } else {
        createSection();
      }
      
      function createSection() {
        const insertQuery = `
          INSERT INTO section_info 
          (section_name, yearlevel, school_year, adviser_id, max_capacity, current_count)
          VALUES (?, ?, ?, ?, ?, 0)
        `;
        
        connection.query(
          insertQuery,
          [section_name, yearlevel, school_year, adviser_id || null, max_capacity || 50],
          (err) => {
            if (err) {
              return res.status(500).json({
                success: false,
                message: "Error creating section",
                error: err.message
              });
            }
            
            res.status(201).json({
              success: true,
              message: "Section added successfully"
            });
          }
        );
      }
    });
  } catch (error) {
    console.error("Error in addSection:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get section students
const getSectionStudents = async (req, res) => {
  try {
    const { sectionId } = req.params;
    
    const query = `
      SELECT 
        s.user_id,
        s.fname,
        s.lname,
        s.gender,
        s.strand
      FROM student_info s
      INNER JOIN tblusers u ON s.user_id = u.user_id
      WHERE s.section_id = ? AND u.status = 'active'
      ORDER BY s.lname, s.fname
    `;
    
    connection.query(query, [sectionId], (err, results) => {
      if (err) {
        console.error("Error fetching section students:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching section students",
          error: err.message
        });
      }
      
      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    console.error("Error in getSectionStudents:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ==================== SCHOOL YEAR MANAGEMENT ====================

// Get all school years
const getAllSchoolYears = async (req, res) => {
  try {
    const query = `
      SELECT * FROM school_years 
      ORDER BY school_year DESC
    `;
    
    connection.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching school years:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching school years",
          error: err.message
        });
      }
      
      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    console.error("Error in getAllSchoolYears:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get active school year
const getActiveSchoolYear = async (req, res) => {
  try {
    const query = `
      SELECT * FROM school_years 
      WHERE is_active = 1
      LIMIT 1
    `;
    
    connection.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching active school year:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching active school year",
          error: err.message
        });
      }
      
      res.json({
        success: true,
        data: results.length > 0 ? results[0] : null
      });
    });
  } catch (error) {
    console.error("Error in getActiveSchoolYear:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Create school year
const createSchoolYear = async (req, res) => {
  try {
    const { school_year, start_date, end_date, is_active } = req.body;
    
    // Validate required fields
    if (!school_year || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    // Check if school year already exists
    const checkQuery = `SELECT school_year FROM school_years WHERE school_year = ?`;
    connection.query(checkQuery, [school_year], (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error checking school year existence",
          error: err.message
        });
      }
      
      if (results.length > 0) {
        return res.status(400).json({
          success: false,
          message: "School year already exists"
        });
      }
      
      // If setting as active, deactivate other school years
      if (is_active) {
        const deactivateQuery = `UPDATE school_years SET is_active = 0`;
        connection.query(deactivateQuery);
      }
      
      // Insert school year
      const insertQuery = `
        INSERT INTO school_years (school_year, start_date, end_date, is_active)
        VALUES (?, ?, ?, ?)
      `;
      
      connection.query(
        insertQuery,
        [school_year, start_date, end_date, is_active ? 1 : 0],
        (err) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Error creating school year",
              error: err.message
            });
          }
          
          res.status(201).json({
            success: true,
            message: "School year created successfully"
          });
        }
      );
    });
  } catch (error) {
    console.error("Error in createSchoolYear:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update school year
const updateSchoolYear = async (req, res) => {
  try {
    const { schoolYear } = req.params;
    const { start_date, end_date, is_active } = req.body;
    
    // If setting as active, deactivate other school years
    if (is_active) {
      const deactivateQuery = `UPDATE school_years SET is_active = 0 WHERE school_year != ?`;
      connection.query(deactivateQuery, [schoolYear]);
    }
    
    const updateQuery = `
      UPDATE school_years 
      SET start_date = ?, end_date = ?, is_active = ?
      WHERE school_year = ?
    `;
    
    connection.query(
      updateQuery,
      [start_date, end_date, is_active ? 1 : 0, schoolYear],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error updating school year",
            error: err.message
          });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "School year not found"
          });
        }
        
        res.json({
          success: true,
          message: "School year updated successfully"
        });
      }
    );
  } catch (error) {
    console.error("Error in updateSchoolYear:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ==================== GRADE INPUT DATES MANAGEMENT ====================

// Get all grading periods
const getAllGradingPeriods = async (req, res) => {
  try {
    const { school_year, yearlevel } = req.query;
    
    let query = `SELECT * FROM grading_periods WHERE 1=1`;
    const params = [];
    
    if (school_year) {
      query += ` AND school_year = ?`;
      params.push(school_year);
    }
    
    if (yearlevel) {
      query += ` AND yearlevel = ?`;
      params.push(yearlevel);
    }
    
    query += ` ORDER BY period_id`;
    
    connection.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching grading periods:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching grading periods",
          error: err.message
        });
      }
      
      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    console.error("Error in getAllGradingPeriods:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Create or update grading period
const upsertGradingPeriod = async (req, res) => {
  try {
    const {
      school_year,
      yearlevel,
      grading_period,
      period_type,
      start_date,
      end_date,
      grade_input_start,
      grade_input_end
    } = req.body;
    
    // Validate required fields
    if (!school_year || !yearlevel || !grading_period || !period_type || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    // Check if grading period exists
    const checkQuery = `
      SELECT period_id FROM grading_periods 
      WHERE school_year = ? AND yearlevel = ? AND grading_period = ?
    `;
    
    connection.query(checkQuery, [school_year, yearlevel, grading_period], (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error checking grading period",
          error: err.message
        });
      }
      
      if (results.length > 0) {
        // Update existing
        const updateQuery = `
          UPDATE grading_periods 
          SET start_date = ?, end_date = ?, grade_input_start = ?, grade_input_end = ?
          WHERE period_id = ?
        `;
        
        connection.query(
          updateQuery,
          [start_date, end_date, grade_input_start || null, grade_input_end || null, results[0].period_id],
          (err) => {
            if (err) {
              return res.status(500).json({
                success: false,
                message: "Error updating grading period",
                error: err.message
              });
            }
            
            res.json({
              success: true,
              message: "Grading period updated successfully"
            });
          }
        );
      } else {
        // Insert new
        const insertQuery = `
          INSERT INTO grading_periods 
          (school_year, yearlevel, grading_period, period_type, start_date, end_date, grade_input_start, grade_input_end, is_open)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
        `;
        
        connection.query(
          insertQuery,
          [school_year, yearlevel, grading_period, period_type, start_date, end_date, grade_input_start || null, grade_input_end || null],
          (err) => {
            if (err) {
              return res.status(500).json({
                success: false,
                message: "Error creating grading period",
                error: err.message
              });
            }
            
            res.status(201).json({
              success: true,
              message: "Grading period created successfully"
            });
          }
        );
      }
    });
  } catch (error) {
    console.error("Error in upsertGradingPeriod:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Open/Close grade input period
const toggleGradeInputPeriod = async (req, res) => {
  try {
    const { periodId } = req.params;
    const { is_open } = req.body;
    
    const updateQuery = `
      UPDATE grading_periods 
      SET is_open = ?
      WHERE period_id = ?
    `;
    
    connection.query(updateQuery, [is_open ? 1 : 0, periodId], (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error updating grade input period",
          error: err.message
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Grading period not found"
        });
      }
      
      res.json({
        success: true,
        message: `Grade input period ${is_open ? 'opened' : 'closed'} successfully`
      });
    });
  } catch (error) {
    console.error("Error in toggleGradeInputPeriod:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ==================== REPORTS/REATTEMPT REQUESTS MANAGEMENT ====================

// Get all reattempt requests
const getAllReattemptRequests = async (req, res) => {
  try {
    const { status, teacher_id } = req.query;
    
    let query = `
      SELECT 
        r.*,
        CONCAT(t.fname, ' ', t.lname) as teacher_name
      FROM reattempt_requests r
      INNER JOIN teacher_info t ON r.teacher_id = t.user_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }
    
    if (teacher_id) {
      query += ` AND r.teacher_id = ?`;
      params.push(teacher_id);
    }
    
    query += ` ORDER BY r.requested_at DESC`;
    
    connection.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching reattempt requests:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching reattempt requests",
          error: err.message
        });
      }
      
      res.json({
        success: true,
        data: results
      });
    });
  } catch (error) {
    console.error("Error in getAllReattemptRequests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Approve reattempt request
const approveReattemptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { admin_id } = req.body;
    
    // Get request details
    const getRequestQuery = `
      SELECT * FROM reattempt_requests WHERE request_id = ? AND status = 'Pending'
    `;
    
    connection.query(getRequestQuery, [requestId], (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching request",
          error: err.message
        });
      }
      
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Request not found or already processed"
        });
      }
      
      const request = results[0];
      
      // Calculate expiration (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Update request status
      const updateRequestQuery = `
        UPDATE reattempt_requests 
        SET status = 'Approved', 
            approved_at = NOW(), 
            approved_by = ?,
            expires_at = ?
        WHERE request_id = ?
      `;
      
      connection.query(updateRequestQuery, [admin_id, expiresAt, requestId], (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error approving request",
            error: err.message
          });
        }
        
        // Enable editing for the submission
        const enableEditQuery = `
          UPDATE grade_submissions 
          SET can_edit = 1 
          WHERE sub_code = ? 
            AND section_id = ? 
            AND teacher_id = ? 
            AND school_year = ? 
            AND period_id = ?
        `;
        
        connection.query(
          enableEditQuery,
          [request.sub_code, request.section_id, request.teacher_id, request.school_year, request.period_id],
          (err) => {
            if (err) {
              console.error("Error enabling edit:", err);
            }
            
            res.json({
              success: true,
              message: "Request approved successfully",
              expires_at: expiresAt
            });
          }
        );
      });
    });
  } catch (error) {
    console.error("Error in approveReattemptRequest:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Reject reattempt request
const rejectReattemptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { admin_id } = req.body;
    
    const updateQuery = `
      UPDATE reattempt_requests 
      SET status = 'Rejected', 
          approved_at = NOW(), 
          approved_by = ?
      WHERE request_id = ? AND status = 'Pending'
    `;
    
    connection.query(updateQuery, [admin_id, requestId], (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error rejecting request",
          error: err.message
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Request not found or already processed"
        });
      }
      
      res.json({
        success: true,
        message: "Request rejected successfully"
      });
    });
  } catch (error) {
    console.error("Error in rejectReattemptRequest:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = {
  // Students
  getAllStudents,
  getStudentSubjects,
  updateStudent,
  addStudent,
  archiveStudent,
  
  // Teachers
  getAllTeachers,
  addTeacher,
  archiveTeacher,
  
  // Subjects
  getAllSubjects,
  addSubject,
  updateSubject,
  
  // Admins
  getAllAdmins,
  addAdmin,
  archiveAdmin,
  
  // Archive
  getArchivedUsers,
  restoreUser,
  deleteUserPermanently,
  
  // Sections
  getAllSections,
  addSection,
  getSectionStudents,
  
  // School Year
  getAllSchoolYears,
  getActiveSchoolYear,
  createSchoolYear,
  updateSchoolYear,
  
  // Grade Input Dates
  getAllGradingPeriods,
  upsertGradingPeriod,
  toggleGradeInputPeriod,
  
  // Reports
  getAllReattemptRequests,
  approveReattemptRequest,
  rejectReattemptRequest
};  