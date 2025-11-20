const connection = require("../database/db");
const bcrypt = require("bcryptjs");
const asyncHandler = require("../middleware/asyncHandler");

const db = connection.promise();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const getStudentProfile = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;

  const sql = `
    SELECT 
      s.user_id,
      s.fname,
      s.lname,
      s.mname,
      s.email,
      s.gender,
      s.date_of_birth,
      s.yearlevel,
      s.section_name,
      s.section_id,
      s.strand,
      s.position,
      s.status_enroll,
      u.status as account_status
    FROM student_info s
    INNER JOIN tblusers u ON s.user_id = u.user_id
    WHERE s.user_id = ? AND u.status = 'active'
  `;

  const [results] = await db.query(sql, [userId]);

  if (results.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found"
    });
  }

  res.status(200).json({
    success: true,
    data: results[0]
  });
});

const getStudentGrades = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { school_year, period_id, yearlevel } = req.query;

  let sql = `
    SELECT 
      gr.grade_id,
      gr.user_id,
      gr.sub_code,
      si.sub_name,
      gr.final_grade,
      gr.remarks,
      gr.grading_period,
      gr.school_year,
      gr.yearlevel,
      gr.period_id,
      t.fname as teacher_fname,
      t.lname as teacher_lname,
      gp.grading_period as period_name
    FROM grade_records gr
    INNER JOIN subject_info si ON gr.sub_code = si.sub_code 
      AND gr.school_year = si.school_year
    LEFT JOIN teacher_info t ON gr.teacher_id = t.user_id
    LEFT JOIN grading_periods gp ON gr.period_id = gp.period_id 
      AND gr.school_year = gp.school_year
    WHERE gr.user_id = ?
  `;

  const params = [userId];

  if (school_year) {
    sql += " AND gr.school_year = ?";
    params.push(school_year);
  }

  if (period_id) {
    sql += " AND gr.period_id = ?";
    params.push(period_id);
  }

  if (yearlevel) {
    sql += " AND gr.yearlevel = ?";
    params.push(yearlevel);
  }

  sql += " ORDER BY gr.school_year DESC, gr.period_id ASC, si.sub_name ASC";

  const [results] = await db.query(sql, params);

  res.status(200).json({
    success: true,
    data: results
  });
});

const getStudentAchievements = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { school_year } = req.query;

  let sql = `
    SELECT 
      sa.achievement_id,
      sa.user_id,
      sa.school_year,
      sa.yearlevel,
      sa.grading_period,
      sa.period_id,
      sa.average,
      sa.achievement,
      sa.total_subjects,
      sa.graded_subjects,
      gp.grading_period as period_name
    FROM student_achievements sa
    LEFT JOIN grading_periods gp ON sa.period_id = gp.period_id 
      AND sa.school_year = gp.school_year
    WHERE sa.user_id = ?
  `;

  const params = [userId];

  if (school_year) {
    sql += " AND sa.school_year = ?";
    params.push(school_year);
  }

  sql += " ORDER BY sa.school_year DESC, sa.period_id ASC";

  const [results] = await db.query(sql, params);

  res.status(200).json({
    success: true,
    data: results
  });
});

const getHistoricalGrades = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;

  const sql = `
    SELECT 
      gr.school_year,
      gr.yearlevel,
      gr.grading_period,
      COUNT(DISTINCT gr.sub_code) as total_subjects,
      AVG(gr.final_grade) as average_grade,
      MIN(gr.final_grade) as lowest_grade,
      MAX(gr.final_grade) as highest_grade
    FROM grade_records gr
    WHERE gr.user_id = ? AND gr.final_grade IS NOT NULL
    GROUP BY gr.school_year, gr.yearlevel, gr.period_id, gr.grading_period
    ORDER BY gr.school_year DESC, gr.yearlevel DESC, gr.period_id ASC
  `;

  const [results] = await db.query(sql, [userId]);

  res.status(200).json({
    success: true,
    data: results
  });
});

const updateEmail = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { newEmail, currentPassword } = req.body;

  if (!newEmail || !currentPassword) {
    return res.status(400).json({
      success: false,
      message: "New email and current password are required"
    });
  }

  if (!EMAIL_REGEX.test(newEmail)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address"
    });
  }

  const conn = await db.getConnection();
  let transactionStarted = false;

  try {
    const [userRows] = await conn.query("SELECT password FROM tblusers WHERE user_id = ?", [userId]);

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, userRows[0].password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    const [emailRows] = await conn.query(
      "SELECT user_id FROM tblusers WHERE email = ? AND user_id != ?",
      [newEmail, userId]
    );

    if (emailRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already in use by another account"
      });
    }

    await conn.beginTransaction();
    transactionStarted = true;

    await conn.query("UPDATE tblusers SET email = ? WHERE user_id = ?", [newEmail, userId]);
    await conn.query("UPDATE student_info SET email = ? WHERE user_id = ?", [newEmail, userId]);

    await conn.commit();

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
    if (conn) {
      conn.release();
    }
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
      message: "Password must be at least 8 characters long"
    });
  }

  const [userRows] = await db.query("SELECT password FROM tblusers WHERE user_id = ?", [userId]);

  if (userRows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  const passwordMatch = await bcrypt.compare(currentPassword, userRows[0].password);

  if (!passwordMatch) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect"
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.query("UPDATE tblusers SET password = ? WHERE user_id = ?", [hashedPassword, userId]);

  res.status(200).json({
    success: true,
    message: "Password changed successfully"
  });
});

const getGradingPeriods = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { school_year } = req.query;

  if (!school_year) {
    const [studentResults] = await db.query("SELECT yearlevel FROM student_info WHERE user_id = ?", [userId]);

    if (studentResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const yearlevel = studentResults[0].yearlevel;

    const sql = `
      SELECT 
        period_id,
        school_year,
        yearlevel,
        grading_period,
        period_type,
        is_open
      FROM grading_periods
      WHERE yearlevel = ?
      ORDER BY school_year DESC, period_id ASC
    `;

    const [results] = await db.query(sql, [yearlevel]);

    return res.status(200).json({
      success: true,
      data: results
    });
  } else {
    const getYearLevelFromGradesSql = `
      SELECT DISTINCT yearlevel 
      FROM grade_records 
      WHERE user_id = ? AND school_year = ? 
      LIMIT 1
    `;

    const [gradeResults] = await db.query(getYearLevelFromGradesSql, [userId, school_year]);

    if (gradeResults.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const yearlevel = gradeResults[0].yearlevel;

    const sql = `
      SELECT 
        period_id,
        school_year,
        yearlevel,
        grading_period,
        period_type,
        is_open
      FROM grading_periods
      WHERE yearlevel = ? AND school_year = ?
      ORDER BY period_id ASC
    `;

    const [results] = await db.query(sql, [yearlevel, school_year]);

    res.status(200).json({
      success: true,
      data: results
    });
  }
});

const getSchoolYears = asyncHandler(async (req, res) => {
  const sql = `
    SELECT 
      school_year,
      start_date,
      end_date,
      is_active
    FROM school_years
    ORDER BY school_year DESC
  `;

  const [results] = await db.query(sql);

  res.status(200).json({
    success: true,
    data: results
  });
});

module.exports = {
  getStudentProfile,
  getStudentGrades,
  getStudentAchievements,
  getHistoricalGrades,
  updateEmail,
  changePassword,
  getGradingPeriods,
  getSchoolYears
};