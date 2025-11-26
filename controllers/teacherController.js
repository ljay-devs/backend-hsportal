const connection = require("../database/db");
const asyncHandler = require("../middleware/asyncHandler");
const bcrypt = require("bcryptjs");

const db = connection.promise();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const getTeacherProfile = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;

  const sql = `
    SELECT 
      t.user_id,
      t.fname,
      t.lname,
      t.mname,
      t.email,
      t.position,
      t.qualification,
      t.hire_date,
      t.employment_status,
      u.role,
      u.status
    FROM teacher_info t
    INNER JOIN tblusers u ON t.user_id = u.user_id
    WHERE t.user_id = ? AND u.status = 'active'
  `;

  const [results] = await db.query(sql, [userId]);

  if (results.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found"
    });
  }

  console.log(`Teacher profile fetched for ${userId}`);
  res.status(200).json({
    success: true,
    data: results[0]
  });
});

const getTeacherSubjects = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;

  const sql = `
    SELECT DISTINCT
      si.sub_code,
      si.sub_name,
      si.yearlevel,
      si.school_year,
      COUNT(DISTINCT ssa.section_id) as section_count
    FROM subject_info si
    INNER JOIN subject_section_assignments ssa 
      ON si.sub_code = ssa.sub_code 
      AND si.school_year = ssa.school_year
    INNER JOIN school_years sy ON si.school_year = sy.school_year
    WHERE ssa.teacher_id = ? AND sy.is_active = 1
    GROUP BY si.sub_code, si.sub_name, si.yearlevel, si.school_year
    ORDER BY si.yearlevel, si.sub_name
  `;

  const [results] = await db.query(sql, [userId]);

  console.log(`Fetched ${results.length} subjects for teacher ${userId}`);
  res.status(200).json({
    success: true,
    data: results
  });
});

const getSubjectSections = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { subCode } = req.params;
  const { schoolYear } = req.query;

  let sql;
  let params;

  if (schoolYear) {
    sql = `
      SELECT 
        sec.section_id,
        sec.section_name,
        sec.yearlevel,
        sec.current_count,
        sec.max_capacity,
        ssa.sub_code
      FROM subject_section_assignments ssa
      INNER JOIN section_info sec ON ssa.section_id = sec.section_id
      WHERE ssa.sub_code = ? 
        AND ssa.teacher_id = ?
        AND ssa.school_year = ?
      ORDER BY sec.section_name
    `;
    params = [subCode, userId, schoolYear];
  } else {
    sql = `
      SELECT 
        sec.section_id,
        sec.section_name,
        sec.yearlevel,
        sec.current_count,
        sec.max_capacity,
        ssa.sub_code
      FROM subject_section_assignments ssa
      INNER JOIN section_info sec ON ssa.section_id = sec.section_id
      INNER JOIN school_years sy ON ssa.school_year = sy.school_year
      WHERE ssa.sub_code = ? 
        AND ssa.teacher_id = ?
        AND sy.is_active = 1
      ORDER BY sec.section_name
    `;
    params = [subCode, userId];
  }

  const [results] = await db.query(sql, params);

  console.log(`Fetched ${results.length} sections for ${subCode}`);
  res.status(200).json({
    success: true,
    data: results
  });
});

const getStudentsForGrading = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { sectionId, subCode } = req.params;
  const { schoolYear, periodId } = req.query;

  const checkPeriodSql = `
    SELECT 
      gp.period_id,
      gp.grading_period,
      gp.is_open,
      gp.grade_input_start,
      gp.grade_input_end,
      sec.yearlevel
    FROM grading_periods gp
    INNER JOIN section_info sec ON gp.yearlevel = sec.yearlevel
    WHERE sec.section_id = ? 
      AND gp.school_year = ?
      AND gp.period_id = ?
  `;

  const [periodResults] = await db.query(checkPeriodSql, [sectionId, schoolYear, periodId]);

  if (periodResults.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Grading period not found"
    });
  }

  const period = periodResults[0];
  const isOpen = period.is_open === 1;
  const now = new Date();
  const inputStart = period.grade_input_start ? new Date(period.grade_input_start) : null;
  const inputEnd = period.grade_input_end ? new Date(period.grade_input_end) : null;
  const withinDateRange = inputStart && inputEnd ? now >= inputStart && now <= inputEnd : false;

  const checkSubmissionSql = `
    SELECT submission_id, submitted_at, can_edit
    FROM grade_submissions
    WHERE teacher_id = ?
      AND section_id = ?
      AND sub_code = ?
      AND school_year = ?
      AND period_id = ?
  `;

  const [submissionResults] = await db.query(
    checkSubmissionSql,
    [userId, sectionId, subCode, schoolYear, periodId]
  );

  const hasSubmitted = submissionResults.length > 0;
  const canEdit = hasSubmitted ? submissionResults[0].can_edit === 1 : false;

  const studentsSql = `
    SELECT
      si.user_id,
      si.fname,
      si.lname,
      si.mname,
      si.gender,
      gr.final_grade,
      gr.remarks,
      gr.grade_id
    FROM student_info si
    INNER JOIN section_info sec ON si.section_id = sec.section_id AND sec.school_year = ?
    LEFT JOIN grade_records gr
      ON si.user_id = gr.user_id
      AND gr.sub_code = ?
      AND gr.teacher_id = ?
      AND gr.section_id = ?
      AND gr.school_year = ?
      AND gr.period_id = ?
    WHERE si.section_id = ?
      AND si.status_enroll = 'Enrolled'
    ORDER BY si.lname, si.fname
  `;

  const [students] = await db.query(
    studentsSql,
    [schoolYear, subCode, userId, sectionId, schoolYear, periodId, sectionId]
  );

  console.log(`Fetched ${students.length} students for grading`);
  res.status(200).json({
    success: true,
    data: {
      students,
      gradingPeriod: {
        period_id: period.period_id,
        grading_period: period.grading_period,
        is_open: isOpen,
        within_date_range: withinDateRange,
        input_start: period.grade_input_start,
        input_end: period.grade_input_end
      },
      submission: {
        has_submitted: hasSubmitted,
        can_edit: canEdit,
        submitted_at: hasSubmitted ? submissionResults[0].submitted_at : null
      },
      can_input: (isOpen && withinDateRange && !hasSubmitted) || canEdit
    }
  });
});

const submitGrades = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { sectionId, subCode, schoolYear, periodId, grades } = req.body;

  if (!sectionId || !subCode || !schoolYear || !periodId || !Array.isArray(grades)) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  const checkSubmissionSql = `
    SELECT submission_id, can_edit
    FROM grade_submissions
    WHERE teacher_id = ?
      AND section_id = ?
      AND sub_code = ?
      AND school_year = ?
      AND period_id = ?
  `;

  const [submissionRows] = await db.query(
    checkSubmissionSql,
    [userId, sectionId, subCode, schoolYear, periodId]
  );

  if (submissionRows.length > 0 && submissionRows[0].can_edit === 0) {
    return res.status(403).json({
      success: false,
      message: "Grades already submitted. Request re-attempt from admin to edit."
    });
  }

  const periodSql = `
    SELECT gp.grading_period, gp.yearlevel
    FROM grading_periods gp
    INNER JOIN section_info sec ON gp.yearlevel = sec.yearlevel
    WHERE gp.period_id = ? AND gp.school_year = ? AND sec.section_id = ?
  `;

  const [periodResults] = await db.query(periodSql, [periodId, schoolYear, sectionId]);

  if (periodResults.length === 0) {
    return res.status(500).json({
      success: false,
      message: "Error fetching grading period"
    });
  }

  const gradingPeriod = periodResults[0].grading_period;
  const yearlevel = periodResults[0].yearlevel;

  const conn = await db.getConnection();
  let transactionStarted = false;

  try {
    await conn.beginTransaction();
    transactionStarted = true;

    const gradeValues = [];

    for (const grade of grades) {
      const { student_id, final_grade } = grade;

      if (final_grade === null || final_grade === undefined || final_grade === '') {
        continue;
      }

      const gradeValue = parseFloat(final_grade);
      if (Number.isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
        res.status(400);
        throw new Error(`Invalid grade for student ${student_id}`);
      }

      const remarks = gradeValue >= 75 ? 'Passed' : 'Failed';

      gradeValues.push([
        student_id, subCode, userId, sectionId, yearlevel, schoolYear, periodId, gradingPeriod, gradeValue, remarks
      ]);
    }

    if (gradeValues.length > 0) {
      const upsertGradeSql = `
        INSERT INTO grade_records 
          (user_id, sub_code, teacher_id, section_id, yearlevel, school_year, period_id, grading_period, final_grade, remarks)
        VALUES ?
        ON DUPLICATE KEY UPDATE
          final_grade = VALUES(final_grade),
          remarks = VALUES(remarks)
      `;

      await conn.query(upsertGradeSql, [gradeValues]);
    }

    const submissionSql = `
      INSERT INTO grade_submissions 
        (teacher_id, section_id, sub_code, school_year, period_id, can_edit)
      VALUES (?, ?, ?, ?, ?, 0)
      ON DUPLICATE KEY UPDATE
        submitted_at = CURRENT_TIMESTAMP,
        can_edit = 0
    `;

    await conn.query(submissionSql, [userId, sectionId, subCode, schoolYear, periodId]);

    const updateAchievementsSql = `
      INSERT INTO student_achievements 
        (user_id, school_year, yearlevel, period_id, grading_period, average, achievement, total_subjects, graded_subjects)
      SELECT 
        gr.user_id,
        gr.school_year,
        gr.yearlevel,
        gr.period_id,
        gr.grading_period,
        ROUND(AVG(gr.final_grade), 2) as average,
        CASE 
          WHEN AVG(gr.final_grade) >= 95 THEN 'With High Honor'
          WHEN AVG(gr.final_grade) >= 90 THEN 'With Honor'
          ELSE '----'
        END as achievement,
        COUNT(DISTINCT gr.sub_code) as total_subjects,
        COUNT(DISTINCT gr.sub_code) as graded_subjects
      FROM grade_records gr
      WHERE gr.school_year = ?
        AND gr.period_id = ?
        AND gr.section_id = ?
        AND gr.final_grade IS NOT NULL
      GROUP BY gr.user_id, gr.school_year, gr.yearlevel, gr.period_id, gr.grading_period
      ON DUPLICATE KEY UPDATE
        average = VALUES(average),
        achievement = VALUES(achievement),
        total_subjects = VALUES(total_subjects),
        graded_subjects = VALUES(graded_subjects)
    `;

    await conn.query(updateAchievementsSql, [schoolYear, periodId, sectionId]);

    await conn.commit();

    console.log(`Grades submitted successfully by ${userId}`);
    res.status(200).json({
      success: true,
      message: "Grades submitted successfully"
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

const requestReattempt = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { sectionId, subCode, schoolYear, periodId, reason } = req.body;

  if (!sectionId || !subCode || !schoolYear || !periodId || !reason) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  const checkRequestSql = `
    SELECT request_id, status
    FROM reattempt_requests
    WHERE teacher_id = ?
      AND section_id = ?
      AND sub_code = ?
      AND school_year = ?
      AND period_id = ?
      AND status = 'Pending'
  `;

  const [existingRequest] = await db.query(
    checkRequestSql,
    [userId, sectionId, subCode, schoolYear, periodId]
  );

  if (existingRequest.length > 0) {
    return res.status(400).json({
      success: false,
      message: "You already have a pending re-attempt request for this section"
    });
  }

  const infoSql = `
    SELECT 
      si.sub_name,
      sec.section_name,
      sec.yearlevel,
      gp.grading_period
    FROM subject_info si
    CROSS JOIN section_info sec
    INNER JOIN grading_periods gp 
      ON sec.yearlevel = gp.yearlevel 
      AND gp.period_id = ?
    WHERE si.sub_code = ? AND sec.section_id = ?
  `;

  const [infoResults] = await db.query(infoSql, [periodId, subCode, sectionId]);

  if (infoResults.length === 0) {
    return res.status(500).json({
      success: false,
      message: "Error submitting request"
    });
  }

  const info = infoResults[0];

  const insertRequestSql = `
    INSERT INTO reattempt_requests
      (teacher_id, section_id, sub_code, school_year, period_id, 
       subject_name, section_name, grading_period, reason, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
  `;

  await db.query(
    insertRequestSql,
    [
      userId,
      sectionId,
      subCode,
      schoolYear,
      periodId,
      info.sub_name,
      info.section_name,
      info.grading_period,
      reason
    ]
  );

  console.log(`Re-attempt request submitted by ${userId}`);
  res.status(200).json({
    success: true,
    message: "Re-attempt request submitted successfully"
  });
});

const getReattemptStatus = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { sectionId, subCode, schoolYear, periodId } = req.query;

  const sql = `
    SELECT 
      request_id,
      status,
      reason,
      requested_at
    FROM reattempt_requests
    WHERE teacher_id = ?
      AND section_id = ?
      AND sub_code = ?
      AND school_year = ?
      AND period_id = ?
    ORDER BY requested_at DESC
    LIMIT 1
  `;

  const [results] = await db.query(
    sql,
    [userId, sectionId, subCode, schoolYear, periodId]
  );

  if (results.length === 0) {
    return res.status(200).json({
      success: true,
      data: null
    });
  }

  res.status(200).json({
    success: true,
    data: results[0]
  });
});

const getActiveSchoolYear = asyncHandler(async (req, res) => {
  const sql = `
    SELECT school_year, start_date, end_date
    FROM school_years
    WHERE is_active = 1
    LIMIT 1
  `;

  const [results] = await db.query(sql);

  if (results.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No active school year found"
    });
  }

  res.status(200).json({
    success: true,
    data: results[0]
  });
});

const getGradingPeriods = asyncHandler(async (req, res) => {
  const { yearlevel, schoolYear } = req.query;

  if (!yearlevel) {
    return res.status(400).json({
      success: false,
      message: "Year level is required"
    });
  }

  let sql = `
    SELECT 
      period_id,
      school_year,
      yearlevel,
      grading_period,
      period_type,
      start_date,
      end_date,
      grade_input_start,
      grade_input_end,
      is_open
    FROM grading_periods
    WHERE yearlevel = ?
  `;

  const params = [yearlevel];

  if (schoolYear) {
    sql += " AND school_year = ?";
    params.push(schoolYear);
  }

  sql += " ORDER BY period_id ASC";

  const [results] = await db.query(sql, params);

  res.status(200).json({
    success: true,
    data: results
  });
});

const updateEmail = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { newEmail } = req.body;

  if (!newEmail) {
    return res.status(400).json({
      success: false,
      message: "New email is required"
    });
  }

  if (!EMAIL_REGEX.test(newEmail)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address"
    });
  }

  const checkEmailSql = "SELECT user_id FROM tblusers WHERE email = ? AND user_id != ?";
  const [emailResults] = await db.query(checkEmailSql, [newEmail, userId]);

  if (emailResults.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Email already in use"
    });
  }

  const conn = await db.getConnection();
  let transactionStarted = false;

  try {
    await conn.beginTransaction();
    transactionStarted = true;

    await conn.query("UPDATE tblusers SET email = ? WHERE user_id = ?", [newEmail, userId]);
    await conn.query("UPDATE teacher_info SET email = ? WHERE user_id = ?", [newEmail, userId]);

    await conn.commit();

    console.log(`Email updated for ${userId}`);
    res.status(200).json({
      success: true,
      message: "Email updated successfully"
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

const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required"
    });
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters"
    });
  }

  const [userRows] = await db.query("SELECT password FROM tblusers WHERE user_id = ?", [userId]);

  if (userRows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  const isMatch = await bcrypt.compare(currentPassword, userRows[0].password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect"
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.query("UPDATE tblusers SET password = ? WHERE user_id = ?", [hashedPassword, userId]);

  console.log(`Password changed for ${userId}`);
  res.status(200).json({
    success: true,
    message: "Password changed successfully"
  });
});

module.exports = {
  getTeacherProfile,
  getTeacherSubjects,
  getSubjectSections,
  getStudentsForGrading,
  submitGrades,
  requestReattempt,
  getReattemptStatus,
  getActiveSchoolYear,
  getGradingPeriods,
  updateEmail,
  changePassword
};