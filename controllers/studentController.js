const jwt = require("jsonwebtoken");
const connection = require("../database/db");
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

const getStudentProfile = (req, res) => {
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

  connection.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching student profile:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching profile"
      });
    }

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
};

const getStudentGrades = (req, res) => {
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

  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching grades:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching grades"
      });
    }

    res.status(200).json({
      success: true,
      data: results
    });
  });
};

const getStudentAchievements = (req, res) => {
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

  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching achievements:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching achievements"
      });
    }

    res.status(200).json({
      success: true,
      data: results
    });
  });
};

const getHistoricalGrades = (req, res) => {
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

  connection.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching historical grades:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching historical grades"
      });
    }

    res.status(200).json({
      success: true,
      data: results
    });
  });
};

const updateEmail = (req, res) => {
  const userId = req.user.user_id;
  const { newEmail, currentPassword } = req.body;

  if (!newEmail || !currentPassword) {
    return res.status(400).json({
      success: false,
      message: "New email and current password are required"
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address"
    });
  }

  const verifyPasswordSql = "SELECT password FROM tblusers WHERE user_id = ?";
  
  connection.query(verifyPasswordSql, [userId], (err, results) => {
    if (err) {
      console.error("Error verifying password:", err);
      return res.status(500).json({
        success: false,
        message: "Error updating email"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    bcrypt.compare(currentPassword, results[0].password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect"
        });
      }

      const checkEmailSql = "SELECT user_id FROM tblusers WHERE email = ? AND user_id != ?";
      
      connection.query(checkEmailSql, [newEmail, userId], (err, emailResults) => {
        if (err) {
          console.error("Error checking email:", err);
          return res.status(500).json({
            success: false,
            message: "Error updating email"
          });
        }

        if (emailResults.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Email already in use by another account"
          });
        }

        connection.beginTransaction((err) => {
          if (err) {
            console.error("Transaction error:", err);
            return res.status(500).json({
              success: false,
              message: "Error updating email"
            });
          }

          const updateUsersSql = "UPDATE tblusers SET email = ? WHERE user_id = ?";
          const updateStudentSql = "UPDATE student_info SET email = ? WHERE user_id = ?";

          connection.query(updateUsersSql, [newEmail, userId], (err) => {
            if (err) {
              return connection.rollback(() => {
                console.error("Error updating tblusers:", err);
                res.status(500).json({
                  success: false,
                  message: "Error updating email"
                });
              });
            }

            connection.query(updateStudentSql, [newEmail, userId], (err) => {
              if (err) {
                return connection.rollback(() => {
                  console.error("Error updating student_info:", err);
                  res.status(500).json({
                    success: false,
                    message: "Error updating email"
                  });
                });
              }

              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    console.error("Commit error:", err);
                    res.status(500).json({
                      success: false,
                      message: "Error updating email"
                    });
                  });
                }

                res.status(200).json({
                  success: true,
                  message: "Email updated successfully"
                });
              });
            });
          });
        });
      });
    });
  });
};

const changePassword = (req, res) => {
  const userId = req.user.user_id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required"
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long"
    });
  }

  const verifyPasswordSql = "SELECT password FROM tblusers WHERE user_id = ?";
  
  connection.query(verifyPasswordSql, [userId], (err, results) => {
    if (err) {
      console.error("Error verifying password:", err);
      return res.status(500).json({
        success: false,
        message: "Error changing password"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    bcrypt.compare(currentPassword, results[0].password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect"
        });
      }

      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
          console.error("Error hashing password:", err);
          return res.status(500).json({
            success: false,
            message: "Error changing password"
          });
        }

        const updatePasswordSql = "UPDATE tblusers SET password = ? WHERE user_id = ?";
        
        connection.query(updatePasswordSql, [hashedPassword, userId], (err) => {
          if (err) {
            console.error("Error updating password:", err);
            return res.status(500).json({
              success: false,
              message: "Error changing password"
            });
          }

          res.status(200).json({
            success: true,
            message: "Password changed successfully"
          });
        });
      });
    });
  });
};

const getGradingPeriods = (req, res) => {
  const userId = req.user.user_id;
  const { school_year } = req.query;

  if (!school_year) {
    const getCurrentYearLevelSql = "SELECT yearlevel FROM student_info WHERE user_id = ?";
    
    connection.query(getCurrentYearLevelSql, [userId], (err, studentResults) => {
      if (err) {
        console.error("Error fetching student info:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching grading periods"
        });
      }

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

      connection.query(sql, [yearlevel], (err, results) => {
        if (err) {
          console.error("Error fetching grading periods:", err);
          return res.status(500).json({
            success: false,
            message: "Error fetching grading periods"
          });
        }

        res.status(200).json({
          success: true,
          data: results
        });
      });
    });
  } else {
    const getYearLevelFromGradesSql = `
      SELECT DISTINCT yearlevel 
      FROM grade_records 
      WHERE user_id = ? AND school_year = ? 
      LIMIT 1
    `;
    
    connection.query(getYearLevelFromGradesSql, [userId, school_year], (err, gradeResults) => {
      if (err) {
        console.error("Error fetching year level from grades:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching grading periods"
        });
      }

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

      connection.query(sql, [yearlevel, school_year], (err, results) => {
        if (err) {
          console.error("Error fetching grading periods:", err);
          return res.status(500).json({
            success: false,
            message: "Error fetching grading periods"
          });
        }

        res.status(200).json({
          success: true,
          data: results
        });
      });
    });
  }
};

const getSchoolYears = (req, res) => {
  const sql = `
    SELECT 
      school_year,
      start_date,
      end_date,
      is_active
    FROM school_years
    ORDER BY school_year DESC
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching school years:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching school years"
      });
    }

    res.status(200).json({
      success: true,
      data: results
    });
  });
};

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