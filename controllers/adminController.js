const connection = require("../database/db");
const asyncHandler = require("../middleware/asyncHandler");
const bcrypt = require("bcryptjs");

const db = connection.promise();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_GRADES = ["7", "8", "9", "10", "11", "12"];
const SHS_GRADES = ["11", "12"];
const MIN_PASSWORD_LENGTH = 8;

const normalizeDateInput = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
};

// ==================== STUDENTS MANAGEMENT ====================

// Get all students (Grade 7-12)
const getAllStudents = asyncHandler(async (req, res) => {
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
  `;

  const params = [];

  if (search) {
    query += ` AND (s.fname LIKE ? OR s.lname LIKE ? OR s.user_id LIKE ? OR s.email LIKE ?)`;
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }

  if (grade) {
    query += ` AND s.yearlevel = ?`;
    params.push(grade);
  }

  query += ` ORDER BY s.lname, s.fname`;

  const [students] = await db.query(query, params);

  res.json({
    success: true,
    data: students
  });
});

// Get student subjects
const getStudentSubjects = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const sql = `
    SELECT 
      ssa.sub_code,
      si.sub_name,
      si.teacher_id,
      CONCAT(ti.fname, ' ', ti.lname) as teacher_name
    FROM subject_section_assignments ssa
    INNER JOIN student_info s ON ssa.section_id = s.section_id
    INNER JOIN subject_info si ON ssa.sub_code = si.sub_code AND ssa.school_year = si.school_year
    LEFT JOIN teacher_info ti ON si.teacher_id = ti.user_id
    WHERE s.user_id = ?
    ORDER BY si.sub_name
  `;

  const [subjects] = await db.query(sql, [studentId]);

  res.json({
    success: true,
    data: subjects
  });
});

// Update student information
const updateStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { fname, lname, mname, email, gender, yearlevel, section_id, strand } = req.body;

  if (!fname || !lname || !yearlevel || !section_id) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  if (!VALID_GRADES.includes(yearlevel)) {
    return res.status(400).json({
      success: false,
      message: "Only Grade 7-12 students are supported"
    });
  }

  if (SHS_GRADES.includes(yearlevel) && !strand) {
    return res.status(400).json({
      success: false,
      message: "Strand is required for Senior High School students"
    });
  }

  if (email) {
    const [emailRows] = await db.query(
      "SELECT user_id FROM tblusers WHERE email = ? AND user_id != ?",
      [email, studentId]
    );

    if (emailRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }
  }

  const [[section]] = await db.query(
    "SELECT section_name FROM section_info WHERE section_id = ?",
    [section_id]
  );

  if (!section) {
    return res.status(400).json({
      success: false,
      message: "Invalid section ID"
    });
  }

  const finalStrand = SHS_GRADES.includes(yearlevel) ? strand : null;

  await db.query(
    `
      UPDATE student_info 
      SET fname = ?, lname = ?, mname = ?, email = ?, gender = ?,
          yearlevel = ?, section_id = ?, section_name = ?, strand = ?
      WHERE user_id = ?
    `,
    [fname, lname, mname || null, email, gender, yearlevel, section_id, section.section_name, finalStrand, studentId]
  );

  if (email) {
    await db.query("UPDATE tblusers SET email = ? WHERE user_id = ?", [email, studentId]);
  }

  res.json({
    success: true,
    message: "Student updated successfully"
  });
});

// Add new student
const addStudent = asyncHandler(async (req, res) => {
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

  if (!user_id || !fname || !lname || !email || !password || !gender || !yearlevel || !section_id) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  if (!VALID_GRADES.includes(yearlevel)) {
    return res.status(400).json({
      success: false,
      message: "Only Grade 7-12 students can be added"
    });
  }

  if (SHS_GRADES.includes(yearlevel) && !strand) {
    return res.status(400).json({
      success: false,
      message: "Strand is required for Senior High School students"
    });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email"
    });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters"
    });
  }

  const [existingUser] = await db.query(
    "SELECT user_id FROM tblusers WHERE user_id = ? OR email = ?",
    [user_id, email]
  );

  if (existingUser.length > 0) {
    return res.status(400).json({
      success: false,
      message: "User ID or email already exists"
    });
  }

  const [[section]] = await db.query(
    `
      SELECT section_name, current_count, max_capacity 
      FROM section_info 
      WHERE section_id = ?
    `,
    [section_id]
  );

  if (!section) {
    return res.status(400).json({
      success: false,
      message: "Invalid section ID"
    });
  }

  if (section.current_count >= section.max_capacity) {
    return res.status(400).json({
      success: false,
      message: "Section is at full capacity"
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const position = SHS_GRADES.includes(yearlevel) ? "SHS" : "JHS";
  const finalStrand = SHS_GRADES.includes(yearlevel) ? strand : null;

  const conn = await db.getConnection();
  let transactionStarted = false;

  try {
    await conn.beginTransaction();
    transactionStarted = true;

    await conn.query(
      `
        INSERT INTO tblusers (user_id, password, email, status, role)
        VALUES (?, ?, ?, 'active', 'Student')
      `,
      [user_id, hashedPassword, email]
    );

    await conn.query(
      `
        INSERT INTO student_info 
        (user_id, fname, lname, mname, email, gender, yearlevel, section_id, section_name, strand, position, status_enroll)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Enrolled')
      `,
      [user_id, fname, lname, mname || null, email, gender, yearlevel, section_id, section.section_name, finalStrand, position]
    );

    await conn.query(
      `
        UPDATE section_info 
        SET current_count = current_count + 1 
        WHERE section_id = ?
      `,
      [section_id]
    );

    await conn.commit();

    res.status(201).json({
      success: true,
      message: "Student added successfully"
    });
  } catch (error) {
    if (transactionStarted) {
      await conn.rollback();
    }
    throw error;
  } finally {
    conn.release();
  }
});

// Archive student
const archiveStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const [studentRows] = await db.query(
    "SELECT section_id FROM student_info WHERE user_id = ?",
    [studentId]
  );

  if (studentRows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Student not found"
    });
  }

  const sectionId = studentRows[0].section_id;
  const conn = await db.getConnection();
  let transactionStarted = false;

  try {
    await conn.beginTransaction();
    transactionStarted = true;

    await conn.query("UPDATE tblusers SET status = 'archived' WHERE user_id = ?", [studentId]);

    if (sectionId) {
      await conn.query(
        `
          UPDATE section_info 
          SET current_count = GREATEST(current_count - 1, 0) 
          WHERE section_id = ?
        `,
        [sectionId]
      );
    }

    await conn.commit();

    res.json({
      success: true,
      message: "Student archived successfully"
    });
  } catch (error) {
    if (transactionStarted) {
      await conn.rollback();
    }
    throw error;
  } finally {
    conn.release();
  }
});

// ==================== TEACHERS MANAGEMENT ====================

// Get all teachers


const getAllTeachers = asyncHandler(async (req, res) => {
  const { search } = req.query;

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

  const [results] = await db.query(query, params);

  res.json({
    success: true,
    data: results
  });
});


// Add new teacher
const addTeacher = asyncHandler(async (req, res) => {
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

  if (!user_id || !fname || !lname || !email || !password || !position) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  if (position === "Adviser" && !section_id) {
    return res.status(400).json({
      success: false,
      message: "Section is required for Adviser position"
    });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email"
    });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters"
    });
  }

  const [existingUser] = await db.query(
    "SELECT user_id FROM tblusers WHERE user_id = ? OR email = ?",
    [user_id, email]
  );

  if (existingUser.length > 0) {
    return res.status(400).json({
      success: false,
      message: "User ID or email already exists"
    });
  }

  if (position === "Adviser" && section_id) {
    const [sectionAdviser] = await db.query(
      `
        SELECT adviser_id FROM section_info 
        WHERE section_id = ? AND adviser_id IS NOT NULL
      `,
      [section_id]
    );

    if (sectionAdviser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This section already has an adviser"
      });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const role = position === "Adviser" ? "Adviser" : "Teacher";
  const conn = await db.getConnection();
  let transactionStarted = false;

  try {
    await conn.beginTransaction();
    transactionStarted = true;

    await conn.query(
      `
        INSERT INTO tblusers (user_id, password, email, status, role)
        VALUES (?, ?, ?, 'active', ?)
      `,
      [user_id, hashedPassword, email, role]
    );

    await conn.query(
      `
        INSERT INTO teacher_info 
        (user_id, fname, lname, mname, email, position, employment_status)
        VALUES (?, ?, ?, ?, ?, ?, 'Full-time')
      `,
      [user_id, fname, lname, mname || null, email, position]
    );

    if (position === "Adviser" && section_id) {
      await conn.query(
        `
          UPDATE section_info 
          SET adviser_id = ? 
          WHERE section_id = ?
        `,
        [user_id, section_id]
      );
    }

    await conn.commit();

    res.status(201).json({
      success: true,
      message: "Teacher added successfully"
    });
  } catch (error) {
    if (transactionStarted) {
      await conn.rollback();
    }
    throw error;
  } finally {
    conn.release();
  }
});

// Archive teacher
const archiveTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const conn = await db.getConnection();
  let transactionStarted = false;

  try {
    await conn.beginTransaction();
    transactionStarted = true;

    const [result] = await conn.query("UPDATE tblusers SET status = 'archived' WHERE user_id = ?", [teacherId]);

    if (result.affectedRows === 0) {
      await conn.rollback();
      transactionStarted = false;
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    await conn.query(
      `
        UPDATE section_info 
        SET adviser_id = NULL 
        WHERE adviser_id = ?
      `,
      [teacherId]
    );

    await conn.query(
      `
        UPDATE subject_info
        SET teacher_id = NULL
        WHERE teacher_id = ?
      `,
      [teacherId]
    );

    await conn.query(
      `
        DELETE FROM subject_section_assignments
        WHERE teacher_id = ?
      `,
      [teacherId]
    );

    await conn.commit();

    res.json({
      success: true,
      message: "Teacher archived successfully"
    });
  } catch (error) {
    if (transactionStarted) {
      await conn.rollback();
    }
    throw error;
  } finally {
    conn.release();
  }
});

// ==================== SUBJECTS MANAGEMENT ====================

// Get all subjects
const getAllSubjects = asyncHandler(async (req, res) => {
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

  const [results] = await db.query(query, params);

  res.json({
    success: true,
    data: results
  });
});

// Add new subject
const addSubject = asyncHandler(async (req, res) => {
  const { sub_code, sub_name, teacher_id, yearlevel, school_year } = req.body;

  if (!sub_code || !sub_name || !yearlevel || !school_year) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  const [existing] = await db.query(
    `
      SELECT sub_code FROM subject_info 
      WHERE sub_code = ? AND school_year = ?
    `,
    [sub_code, school_year]
  );

  if (existing.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Subject code already exists for this school year"
    });
  }

  await db.query(
    `
      INSERT INTO subject_info (sub_code, sub_name, teacher_id, yearlevel, school_year)
      VALUES (?, ?, ?, ?, ?)
    `,
    [sub_code, sub_name, teacher_id || null, yearlevel, school_year]
  );

  res.status(201).json({
    success: true,
    message: "Subject added successfully"
  });
});

// Update subject
const updateSubject = asyncHandler(async (req, res) => {
  const { sub_code, school_year } = req.params;
  const { sub_name, teacher_id, yearlevel } = req.body;

  if (!sub_name || !yearlevel) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  const [result] = await db.query(
    `
      UPDATE subject_info 
      SET sub_name = ?, teacher_id = ?, yearlevel = ?
      WHERE sub_code = ? AND school_year = ?
    `,
    [sub_name, teacher_id || null, yearlevel, sub_code, school_year]
  );

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
});

// ==================== SUBJECT-SECTION ASSIGNMENTS ====================

const getSubjectSectionAssignments = asyncHandler(async (req, res) => {
  const { teacher_id, section_id, sub_code, school_year } = req.query;

  let query = `
    SELECT 
      ssa.id,
      ssa.sub_code,
      COALESCE(si.sub_name, '') as sub_name,
      ssa.teacher_id,
      CONCAT(COALESCE(t.fname, ''), ' ', COALESCE(t.lname, '')) as teacher_name,
      ssa.section_id,
      COALESCE(sec.section_name, '') as section_name,
      ssa.yearlevel,
      ssa.school_year,
      ssa.created_at
    FROM subject_section_assignments ssa
    LEFT JOIN subject_info si 
      ON ssa.sub_code = si.sub_code AND ssa.school_year = si.school_year
    LEFT JOIN teacher_info t ON ssa.teacher_id = t.user_id
    LEFT JOIN section_info sec ON ssa.section_id = sec.section_id
    WHERE 1=1
  `;

  const params = [];

  if (teacher_id) {
    query += ` AND ssa.teacher_id = ?`;
    params.push(teacher_id);
  }

  if (section_id) {
    query += ` AND ssa.section_id = ?`;
    params.push(section_id);
  }

  if (sub_code) {
    query += ` AND ssa.sub_code = ?`;
    params.push(sub_code);
  }

  if (school_year) {
    query += ` AND ssa.school_year = ?`;
    params.push(school_year);
  }

  query += ` ORDER BY ssa.school_year DESC, ssa.yearlevel, sec.section_name`;

  const [results] = await db.query(query, params);

  res.json({
    success: true,
    data: results
  });
});

const validateAssignmentEntities = async (sub_code, teacher_id, section_id, school_year) => {
  const [[subject]] = await db.query(
    `
      SELECT sub_name, yearlevel
      FROM subject_info
      WHERE sub_code = ? AND school_year = ?
    `,
    [sub_code, school_year]
  );

  if (!subject) {
    const error = new Error("Subject not found for provided school year");
    error.statusCode = 404;
    throw error;
  }

  const [[teacher]] = await db.query(
    "SELECT user_id FROM teacher_info WHERE user_id = ?",
    [teacher_id]
  );

  if (!teacher) {
    const error = new Error("Teacher not found");
    error.statusCode = 404;
    throw error;
  }

  const [[section]] = await db.query(
    `
      SELECT section_name, yearlevel, school_year
      FROM section_info
      WHERE section_id = ?
    `,
    [section_id]
  );

  if (!section) {
    const error = new Error("Section not found");
    error.statusCode = 404;
    throw error;
  }

  if (section.school_year !== school_year) {
    const error = new Error("Section does not belong to the specified school year");
    error.statusCode = 400;
    throw error;
  }

  if (section.yearlevel !== subject.yearlevel) {
    const error = new Error("Subject year level does not match section year level");
    error.statusCode = 400;
    throw error;
  }

  return {
    yearlevel: subject.yearlevel
  };
};

const addSubjectSectionAssignment = asyncHandler(async (req, res) => {
  const { sub_code, teacher_id, section_id, school_year } = req.body;

  if (!sub_code || !teacher_id || !section_id || !school_year) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  const { yearlevel } = await validateAssignmentEntities(sub_code, teacher_id, section_id, school_year);

  try {
    await db.query(
      `
        INSERT INTO subject_section_assignments
          (sub_code, teacher_id, section_id, yearlevel, school_year)
        VALUES (?, ?, ?, ?, ?)
      `,
      [sub_code, teacher_id, section_id, yearlevel, school_year]
    );
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Assignment already exists for this subject, teacher, and section"
      });
    }
    throw error;
  }

  res.status(201).json({
    success: true,
    message: "Assignment created successfully"
  });
});

const updateSubjectSectionAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { sub_code, teacher_id, section_id, school_year } = req.body;

  if (!sub_code || !teacher_id || !section_id || !school_year) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  const [existing] = await db.query(
    "SELECT id FROM subject_section_assignments WHERE id = ?",
    [assignmentId]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Assignment not found"
    });
  }

  const { yearlevel } = await validateAssignmentEntities(sub_code, teacher_id, section_id, school_year);

  try {
    const [result] = await db.query(
      `
        UPDATE subject_section_assignments
        SET sub_code = ?, teacher_id = ?, section_id = ?, yearlevel = ?, school_year = ?
        WHERE id = ?
      `,
      [sub_code, teacher_id, section_id, yearlevel, school_year, assignmentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Assignment already exists for this subject, teacher, and section"
      });
    }
    throw error;
  }

  res.json({
    success: true,
    message: "Assignment updated successfully"
  });
});

const deleteSubjectSectionAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  const [result] = await db.query(
    "DELETE FROM subject_section_assignments WHERE id = ?",
    [assignmentId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: "Assignment not found"
    });
  }

  res.json({
    success: true,
    message: "Assignment deleted successfully"
  });
});

// ==================== ADMINS MANAGEMENT ====================

// Get all admins
const getAllAdmins = asyncHandler(async (req, res) => {
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
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }

  query += ` ORDER BY a.lname, a.fname`;

  const [admins] = await db.query(query, params);

  res.json({
    success: true,
    data: admins
  });
});

// Add new admin
const addAdmin = asyncHandler(async (req, res) => {
  const { user_id, fname, lname, mname, email, password, position } = req.body;

  if (!user_id || !fname || !lname || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email"
    });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters"
    });
  }

  const [existingUser] = await db.query(
    "SELECT user_id FROM tblusers WHERE user_id = ? OR email = ?",
    [user_id, email]
  );

  if (existingUser.length > 0) {
    return res.status(400).json({
      success: false,
      message: "User ID or email already exists"
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const conn = await db.getConnection();
  let transactionStarted = false;

  try {
    await conn.beginTransaction();
    transactionStarted = true;

    await conn.query(
      `
        INSERT INTO tblusers (user_id, password, email, status, role)
        VALUES (?, ?, ?, 'active', 'Admin')
      `,
      [user_id, hashedPassword, email]
    );

    await conn.query(
      `
        INSERT INTO admin_info (user_id, fname, lname, mname, email, position)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [user_id, fname, lname, mname || null, email, position || "Administrator"]
    );

    await conn.commit();

    res.status(201).json({
      success: true,
      message: "Admin added successfully"
    });
  } catch (error) {
    if (transactionStarted) {
      await conn.rollback();
    }
    throw error;
  } finally {
    conn.release();
  }
});

// Archive admin
const archiveAdmin = asyncHandler(async (req, res) => {
  const { adminId } = req.params;

  const [[countRow]] = await db.query(
    `
      SELECT COUNT(*) as count 
      FROM tblusers 
      WHERE role = 'Admin' AND status = 'active'
    `
  );

  if (countRow.count <= 1) {
    return res.status(400).json({
      success: false,
      message: "Cannot archive the last admin account"
    });
  }

  const [result] = await db.query("UPDATE tblusers SET status = 'archived' WHERE user_id = ?", [adminId]);

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: "Admin not found"
    });
  }

  res.json({
    success: true,
    message: "Admin archived successfully"
  });
});

// ==================== ARCHIVE MANAGEMENT ====================

// Get all archived users
const getArchivedUsers = asyncHandler(async (req, res) => {
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

  if (type && type !== "All") {
    if (type === "Student") {
      query += " AND u.role = 'Student'";
    } else if (type === "Teacher") {
      query += " AND u.role IN ('Teacher', 'Adviser')";
    } else if (type === "Admin") {
      query += " AND u.role = 'Admin'";
    }
  }

  if (search) {
    query += ` AND (
      COALESCE(s.fname, t.fname, a.fname) LIKE ? OR 
      COALESCE(s.lname, t.lname, a.lname) LIKE ? OR 
      u.user_id LIKE ? OR 
      u.email LIKE ?
    )`;
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }

  query += " ORDER BY u.updated_at DESC";

  const [archivedUsers] = await db.query(query, params);

  res.json({
    success: true,
    data: archivedUsers
  });
});

// Restore archived user
const restoreUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const conn = await db.getConnection();
  let transactionStarted = false;

  try {
    await conn.beginTransaction();
    transactionStarted = true;

    const [result] = await conn.query("UPDATE tblusers SET status = 'active' WHERE user_id = ?", [userId]);

    if (result.affectedRows === 0) {
      await conn.rollback();
      transactionStarted = false;
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const [[studentRecord]] = await conn.query(
      "SELECT section_id FROM student_info WHERE user_id = ?",
      [userId]
    );

    if (studentRecord && studentRecord.section_id) {
      await conn.query(
        `
          UPDATE section_info 
          SET current_count = LEAST(current_count + 1, max_capacity)
          WHERE section_id = ?
        `,
        [studentRecord.section_id]
      );
    }

    await conn.commit();

    res.json({
      success: true,
      message: "User restored successfully"
    });
  } catch (error) {
    if (transactionStarted) {
      await conn.rollback();
    }
    throw error;
  } finally {
    conn.release();
  }
});

// Delete user permanently
const deleteUserPermanently = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const conn = await db.getConnection();
  let transactionStarted = false;

  try {
    await conn.beginTransaction();
    transactionStarted = true;

    const queries = [
      "DELETE FROM student_info WHERE user_id = ?",
      "DELETE FROM teacher_info WHERE user_id = ?",
      "DELETE FROM admin_info WHERE user_id = ?"
    ];

    for (const query of queries) {
      await conn.query(query, [userId]);
    }

    const [result] = await conn.query("DELETE FROM tblusers WHERE user_id = ?", [userId]);

    if (result.affectedRows === 0) {
      await conn.rollback();
      transactionStarted = false;
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await conn.commit();

    res.json({
      success: true,
      message: "User deleted permanently"
    });
  } catch (error) {
    if (transactionStarted) {
      await conn.rollback();
    }
    throw error;
  } finally {
    conn.release();
  }
});

// ==================== SECTIONS MANAGEMENT ====================

// Get all sections
const getAllSections = asyncHandler(async (req, res) => {
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
    query += " AND s.yearlevel = ?";
    params.push(grade);
  }

  query += " ORDER BY s.yearlevel, s.section_name";

  const [sections] = await db.query(query, params);

  res.json({
    success: true,
    data: sections
  });
});

// Add new section
const addSection = asyncHandler(async (req, res) => {
  const { section_name, yearlevel, school_year, adviser_id, max_capacity } = req.body;

  if (!section_name || !yearlevel || !school_year) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  const [existing] = await db.query(
    `
      SELECT section_id FROM section_info 
      WHERE section_name = ? AND yearlevel = ? AND school_year = ?
    `,
    [section_name, yearlevel, school_year]
  );

  if (existing.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Section already exists for this grade and school year"
    });
  }

  if (adviser_id) {
    const [adviserAssigned] = await db.query(
      `
        SELECT section_id FROM section_info 
        WHERE adviser_id = ? AND school_year = ?
      `,
      [adviser_id, school_year]
    );

    if (adviserAssigned.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This adviser is already assigned to another section"
      });
    }
  }

  await db.query(
    `
      INSERT INTO section_info 
      (section_name, yearlevel, school_year, adviser_id, max_capacity, current_count)
      VALUES (?, ?, ?, ?, ?, 0)
    `,
    [section_name, yearlevel, school_year, adviser_id || null, max_capacity || 50]
  );

  res.status(201).json({
    success: true,
    message: "Section added successfully"
  });
});

// Get section students
const getSectionStudents = asyncHandler(async (req, res) => {
  const { sectionId } = req.params;

  const sql = `
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

  const [students] = await db.query(sql, [sectionId]);

  res.json({
    success: true,
    data: students
  });
});

// ==================== SCHOOL YEAR MANAGEMENT ====================

// Get all school years
const getAllSchoolYears = asyncHandler(async (req, res) => {
  const [years] = await db.query("SELECT * FROM school_years ORDER BY school_year DESC");

  res.json({
    success: true,
    data: years
  });
});

// Get active school year
const getActiveSchoolYear = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `
      SELECT * FROM school_years 
      WHERE is_active = 1
      LIMIT 1
    `
  );

  res.json({
    success: true,
    data: rows.length > 0 ? rows[0] : null
  });
});

// Create school year
const createSchoolYear = asyncHandler(async (req, res) => {
  const { school_year, start_date, end_date, is_active } = req.body;

  if (!school_year || !start_date || !end_date) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  const normalizedStartDate = normalizeDateInput(start_date);
  const normalizedEndDate = normalizeDateInput(end_date);

  if (!normalizedStartDate || !normalizedEndDate) {
    return res.status(400).json({
      success: false,
      message: "Invalid start or end date format"
    });
  }

  if (normalizedStartDate > normalizedEndDate) {
    return res.status(400).json({
      success: false,
      message: "Start date cannot be after end date"
    });
  }

  const [existing] = await db.query("SELECT school_year FROM school_years WHERE school_year = ?", [school_year]);

  if (existing.length > 0) {
    return res.status(400).json({
      success: false,
      message: "School year already exists"
    });
  }

  const conn = await db.getConnection();
  let transactionStarted = false;

  try {
    await conn.beginTransaction();
    transactionStarted = true;

    if (is_active) {
      await conn.query("UPDATE school_years SET is_active = 0");
    }

    await conn.query(
      `
        INSERT INTO school_years (school_year, start_date, end_date, is_active)
        VALUES (?, ?, ?, ?)
      `,
      [school_year, normalizedStartDate, normalizedEndDate, is_active ? 1 : 0]
    );

    await conn.commit();

    res.status(201).json({
      success: true,
      message: "School year created successfully"
    });
  } catch (error) {
    if (transactionStarted) {
      await conn.rollback();
    }
    throw error;
  } finally {
    conn.release();
  }
});

// Update school year
const updateSchoolYear = asyncHandler(async (req, res) => {
  const { schoolYear } = req.params;
  const { start_date, end_date, is_active } = req.body;

  if (!start_date || !end_date) {
    return res.status(400).json({
      success: false,
      message: "Start and end dates are required"
    });
  }

  const normalizedStartDate = normalizeDateInput(start_date);
  const normalizedEndDate = normalizeDateInput(end_date);

  if (!normalizedStartDate || !normalizedEndDate) {
    return res.status(400).json({
      success: false,
      message: "Invalid start or end date format"
    });
  }

  if (normalizedStartDate > normalizedEndDate) {
    return res.status(400).json({
      success: false,
      message: "Start date cannot be after end date"
    });
  }

  const conn = await db.getConnection();
  let transactionStarted = false;

  try {
    await conn.beginTransaction();
    transactionStarted = true;

    if (is_active) {
      await conn.query("UPDATE school_years SET is_active = 0 WHERE school_year != ?", [schoolYear]);
    }

    const [result] = await conn.query(
      `
        UPDATE school_years 
        SET start_date = ?, end_date = ?, is_active = ?
        WHERE school_year = ?
      `,
      [normalizedStartDate, normalizedEndDate, is_active ? 1 : 0, schoolYear]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      transactionStarted = false;
      return res.status(404).json({
        success: false,
        message: "School year not found"
      });
    }

    await conn.commit();

    res.json({
      success: true,
      message: "School year updated successfully"
    });
  } catch (error) {
    if (transactionStarted) {
      await conn.rollback();
    }
    throw error;
  } finally {
    conn.release();
  }
});

// ==================== GRADE INPUT DATES MANAGEMENT ====================

// Get all grading periods
const getAllGradingPeriods = asyncHandler(async (req, res) => {
  const { school_year, yearlevel } = req.query;

  let query = "SELECT * FROM grading_periods WHERE 1=1";
  const params = [];

  if (school_year) {
    query += " AND school_year = ?";
    params.push(school_year);
  }

  if (yearlevel) {
    query += " AND yearlevel = ?";
    params.push(yearlevel);
  }

  query += " ORDER BY period_id";

  const [periods] = await db.query(query, params);

  res.json({
    success: true,
    data: periods
  });
});

// Create or update grading period
const upsertGradingPeriod = asyncHandler(async (req, res) => {
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

  if (!school_year || !yearlevel || !grading_period || !period_type || !start_date || !end_date) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  const [existing] = await db.query(
    `
      SELECT period_id FROM grading_periods 
      WHERE school_year = ? AND yearlevel = ? AND grading_period = ?
    `,
    [school_year, yearlevel, grading_period]
  );

  if (existing.length > 0) {
    await db.query(
      `
        UPDATE grading_periods 
        SET start_date = ?, end_date = ?, grade_input_start = ?, grade_input_end = ?
        WHERE period_id = ?
      `,
      [start_date, end_date, grade_input_start || null, grade_input_end || null, existing[0].period_id]
    );

    return res.json({
      success: true,
      message: "Grading period updated successfully"
    });
  }

  await db.query(
    `
      INSERT INTO grading_periods 
      (school_year, yearlevel, grading_period, period_type, start_date, end_date, grade_input_start, grade_input_end, is_open)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `,
    [school_year, yearlevel, grading_period, period_type, start_date, end_date, grade_input_start || null, grade_input_end || null]
  );

  res.status(201).json({
    success: true,
    message: "Grading period created successfully"
  });
});

// Open/Close grade input period
const toggleGradeInputPeriod = asyncHandler(async (req, res) => {
  const { periodId } = req.params;
  const { is_open } = req.body;

  const [result] = await db.query(
    `
      UPDATE grading_periods 
      SET is_open = ?
      WHERE period_id = ?
    `,
    [is_open ? 1 : 0, periodId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: "Grading period not found"
    });
  }

  res.json({
    success: true,
    message: `Grade input period ${is_open ? "opened" : "closed"} successfully`
  });
});

// ==================== REPORTS/REATTEMPT REQUESTS MANAGEMENT ====================

// Get all reattempt requests
const getAllReattemptRequests = asyncHandler(async (req, res) => {
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
    query += " AND r.status = ?";
    params.push(status);
  }

  if (teacher_id) {
    query += " AND r.teacher_id = ?";
    params.push(teacher_id);
  }

  query += " ORDER BY r.requested_at DESC";

  const [requests] = await db.query(query, params);

  res.json({
    success: true,
    data: requests
  });
});

// Approve reattempt request
const approveReattemptRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { admin_id } = req.body;

  if (!admin_id) {
    return res.status(400).json({
      success: false,
      message: "Admin ID is required"
    });
  }

  const conn = await db.getConnection();
  let transactionStarted = false;

  try {
    await conn.beginTransaction();
    transactionStarted = true;

    const [requests] = await conn.query(
      "SELECT * FROM reattempt_requests WHERE request_id = ? AND status = 'Pending'",
      [requestId]
    );

    if (requests.length === 0) {
      await conn.rollback();
      transactionStarted = false;
      return res.status(404).json({
        success: false,
        message: "Request not found or already processed"
      });
    }

    const request = requests[0];
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await conn.query(
      `
        UPDATE reattempt_requests 
        SET status = 'Approved', 
            approved_at = NOW(), 
            approved_by = ?,
            expires_at = ?
        WHERE request_id = ?
      `,
      [admin_id, expiresAt, requestId]
    );

    await conn.query(
      `
        UPDATE grade_submissions 
        SET can_edit = 1 
        WHERE sub_code = ? 
          AND section_id = ? 
          AND teacher_id = ? 
          AND school_year = ? 
          AND period_id = ?
      `,
      [request.sub_code, request.section_id, request.teacher_id, request.school_year, request.period_id]
    );

    await conn.commit();

    res.json({
      success: true,
      message: "Request approved successfully",
      expires_at: expiresAt
    });
  } catch (error) {
    if (transactionStarted) {
      await conn.rollback();
    }
    throw error;
  } finally {
    conn.release();
  }
});

// Reject reattempt request
const rejectReattemptRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { admin_id } = req.body;

  if (!admin_id) {
    return res.status(400).json({
      success: false,
      message: "Admin ID is required"
    });
  }

  const [result] = await db.query(
    `
      UPDATE reattempt_requests 
      SET status = 'Rejected', 
          approved_at = NOW(), 
          approved_by = ?
      WHERE request_id = ? AND status = 'Pending'
    `,
    [admin_id, requestId]
  );

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
  getSubjectSectionAssignments,
  addSubjectSectionAssignment,
  updateSubjectSectionAssignment,
  deleteSubjectSectionAssignment,
  
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
