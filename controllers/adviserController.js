const connection = require("../database/db");

const getAdviserProfile = (req, res) => {
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
      u.status as account_status,
      u.role
    FROM teacher_info t
    INNER JOIN tblusers u ON t.user_id = u.user_id
    WHERE t.user_id = ? AND u.status = 'active'
  `;

  connection.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching adviser profile:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching profile"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Adviser profile not found"
      });
    }

    console.log("Adviser profile fetched successfully");
    res.status(200).json({
      success: true,
      data: results[0]
    });
  });
};

const getAdvisorySection = (req, res) => {
  const userId = req.user.user_id;
  const { school_year } = req.query;

  let sql = `
    SELECT 
      s.section_id,
      s.section_name,
      s.yearlevel,
      s.current_count,
      s.max_capacity,
      s.school_year
    FROM section_info s
    WHERE s.adviser_id = ?
  `;

  const params = [userId];

  if (school_year) {
    sql += " AND s.school_year = ?";
    params.push(school_year);
  } else {
    sql += " AND s.school_year = (SELECT school_year FROM school_years WHERE is_active = 1 LIMIT 1)";
  }

  sql += " LIMIT 1";

  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching advisory section:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching advisory section"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No advisory section assigned"
      });
    }

    console.log(`Advisory section fetched for adviser ${userId}`);
    res.status(200).json({
      success: true,
      data: results[0]
    });
  });
};

const getAdvisoryStudentList = (req, res) => {
  const userId = req.user.user_id;
  const { school_year } = req.query;

  let sectionSql = `
    SELECT section_id, yearlevel
    FROM section_info
    WHERE adviser_id = ?
  `;

  const params = [userId];

  if (school_year) {
    sectionSql += " AND school_year = ?";
    params.push(school_year);
  } else {
    sectionSql += " AND school_year = (SELECT school_year FROM school_years WHERE is_active = 1 LIMIT 1)";
  }

  sectionSql += " LIMIT 1";

  connection.query(sectionSql, params, (err, sectionResults) => {
    if (err) {
      console.error("Error fetching section:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching student list"
      });
    }

    if (sectionResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No advisory section assigned"
      });
    }

    const sectionId = sectionResults[0].section_id;

    const studentSql = `
      SELECT 
        s.user_id,
        CONCAT(s.lname, ', ', s.fname, ' ', COALESCE(SUBSTRING(s.mname, 1, 1), ''), '.') as full_name,
        s.fname,
        s.lname,
        s.mname,
        s.gender,
        s.email,
        s.date_of_birth,
        s.yearlevel,
        s.section_name,
        s.position,
        s.status_enroll
      FROM student_info s
      WHERE s.section_id = ? AND s.status_enroll = 'Enrolled'
      ORDER BY s.lname, s.fname
    `;

    connection.query(studentSql, [sectionId], (err, studentResults) => {
      if (err) {
        console.error("Error fetching students:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching student list"
        });
      }

      console.log(`Fetched ${studentResults.length} students in advisory section`);
      res.status(200).json({
        success: true,
        data: studentResults
      });
    });
  });
};

const getAdvisoryStudentGrades = (req, res) => {
  const userId = req.user.user_id;
  const { grading_period, school_year } = req.query;

  if (!grading_period || !school_year) {
    return res.status(400).json({
      success: false,
      message: "Grading period and school year are required"
    });
  }

  const sectionSql = `
    SELECT section_id, yearlevel
    FROM section_info
    WHERE adviser_id = ? AND school_year = ?
    LIMIT 1
  `;

  connection.query(sectionSql, [userId, school_year], (err, sectionResults) => {
    if (err) {
      console.error("Error fetching section:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching student grades"
      });
    }

    if (sectionResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No advisory section assigned"
      });
    }

    const sectionId = sectionResults[0].section_id;

    const gradesSql = `
      SELECT 
        s.user_id,
        CONCAT(s.lname, ', ', s.fname) as student_name,
        s.lname,
        s.fname,
        gr.sub_code,
        si.sub_name,
        gr.final_grade,
        gr.remarks,
        COALESCE(sa.average, 0) as average_grade,
        COALESCE(sa.achievement, '----') as achievement
      FROM student_info s
      LEFT JOIN grade_records gr ON s.user_id = gr.user_id 
        AND gr.grading_period = ?
        AND gr.school_year = ?
      LEFT JOIN subject_info si ON gr.sub_code = si.sub_code 
        AND gr.school_year = si.school_year
      LEFT JOIN student_achievements sa ON s.user_id = sa.user_id 
        AND sa.grading_period = ?
        AND sa.school_year = ?
      WHERE s.section_id = ? AND s.status_enroll = 'Enrolled'
      ORDER BY s.lname, s.fname, si.sub_name
    `;

    connection.query(gradesSql, [grading_period, school_year, grading_period, school_year, sectionId], (err, results) => {
      if (err) {
        console.error("Error fetching grades:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching student grades"
        });
      }

      const studentGrades = {};
      results.forEach(row => {
        if (!studentGrades[row.user_id]) {
          studentGrades[row.user_id] = {
            user_id: row.user_id,
            student_name: row.student_name,
            lname: row.lname,
            fname: row.fname,
            average_grade: row.average_grade,
            achievement: row.achievement,
            subjects: []
          };
        }

        if (row.sub_code) {
          studentGrades[row.user_id].subjects.push({
            sub_code: row.sub_code,
            sub_name: row.sub_name,
            final_grade: row.final_grade,
            remarks: row.remarks
          });
        }
      });

      console.log(`Fetched grades for ${Object.keys(studentGrades).length} students`);
      res.status(200).json({
        success: true,
        data: Object.values(studentGrades)
      });
    });
  });
};

const getAdvisoryAchievements = (req, res) => {
  const userId = req.user.user_id;
  const { grading_period, school_year } = req.query;

  if (!school_year) {
    return res.status(400).json({
      success: false,
      message: "School year is required"
    });
  }

  const sectionSql = `
    SELECT section_id, yearlevel
    FROM section_info
    WHERE adviser_id = ? AND school_year = ?
    LIMIT 1
  `;

  connection.query(sectionSql, [userId, school_year], (err, sectionResults) => {
    if (err) {
      console.error("Error fetching section:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching achievements"
      });
    }

    if (sectionResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No advisory section assigned"
      });
    }

    const sectionId = sectionResults[0].section_id;

    let achievementSql = `
      SELECT 
        s.user_id,
        CONCAT(s.lname, ', ', s.fname, ' ', COALESCE(SUBSTRING(s.mname, 1, 1), ''), '.') as full_name,
        s.lname,
        s.fname,
        sa.grading_period,
        sa.average,
        sa.achievement,
        sa.total_subjects,
        sa.graded_subjects
      FROM student_info s
      INNER JOIN student_achievements sa ON s.user_id = sa.user_id 
        AND sa.school_year = ?
      WHERE s.section_id = ? 
        AND s.status_enroll = 'Enrolled'
        AND sa.achievement IN ('With Honor', 'With High Honor')
    `;

    const params = [school_year, sectionId];

    if (grading_period) {
      achievementSql += " AND sa.grading_period = ?";
      params.push(grading_period);
    }

    achievementSql += " ORDER BY sa.average DESC, s.lname, s.fname";

    connection.query(achievementSql, params, (err, results) => {
      if (err) {
        console.error("Error fetching achievements:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching achievements"
        });
      }

      const withHighHonor = results.filter(r => r.achievement === 'With High Honor').length;
      const withHonor = results.filter(r => r.achievement === 'With Honor').length;

      console.log(`Fetched ${results.length} achievements`);
      res.status(200).json({
        success: true,
        data: {
          summary: {
            with_high_honor: withHighHonor,
            with_honor: withHonor,
            total: results.length
          },
          students: results.map((student, index) => ({
            rank: index + 1,
            ...student
          }))
        }
      });
    });
  });
};

const getGradingPeriods = (req, res) => {
  const userId = req.user.user_id;
  const { school_year } = req.query;

  const sectionSql = `
    SELECT yearlevel
    FROM section_info
    WHERE adviser_id = ?
    LIMIT 1
  `;

  connection.query(sectionSql, [userId], (err, sectionResults) => {
    if (err) {
      console.error("Error fetching section:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching grading periods"
      });
    }

    if (sectionResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No advisory section assigned"
      });
    }

    const yearlevel = sectionResults[0].yearlevel;

    let sql = `
      SELECT 
        period_id,
        school_year,
        yearlevel,
        grading_period,
        period_type,
        start_date,
        end_date,
        is_open
      FROM grading_periods
      WHERE yearlevel = ?
    `;

    const params = [yearlevel];

    if (school_year) {
      sql += " AND school_year = ?";
      params.push(school_year);
    }

    sql += " ORDER BY school_year DESC, period_id ASC";

    connection.query(sql, params, (err, results) => {
      if (err) {
        console.error("Error fetching grading periods:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching grading periods"
        });
      }

      console.log(`Fetched ${results.length} grading periods`);
      res.status(200).json({
        success: true,
        data: results
      });
    });
  });
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

    console.log(`Fetched ${results.length} school years`);
    res.status(200).json({
      success: true,
      data: results
    });
  });
};

const updateEmail = (req, res) => {
  const userId = req.user.user_id;
  const { newEmail } = req.body;

  if (!newEmail) {
    return res.status(400).json({
      success: false,
      message: "New email is required"
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address"
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
        message: "Email already in use"
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
      const updateTeacherSql = "UPDATE teacher_info SET email = ? WHERE user_id = ?";

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

        connection.query(updateTeacherSql, [newEmail, userId], (err) => {
          if (err) {
            return connection.rollback(() => {
              console.error("Error updating teacher_info:", err);
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

            console.log(`Email updated successfully for user ${userId}`);
            res.status(200).json({
              success: true,
              message: "Email updated successfully"
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

    if (results.length === 0 || results[0].password !== currentPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    const updatePasswordSql = "UPDATE tblusers SET password = ? WHERE user_id = ?";
    
    connection.query(updatePasswordSql, [newPassword, userId], (err) => {
      if (err) {
        console.error("Error updating password:", err);
        return res.status(500).json({
          success: false,
          message: "Error changing password"
        });
      }

      console.log(`Password changed successfully for user ${userId}`);
      res.status(200).json({
        success: true,
        message: "Password changed successfully"
      });
    });
  });
};

module.exports = { 
  getAdviserProfile, 
  getAdvisorySection,
  getAdvisoryStudentList, 
  getAdvisoryStudentGrades,
  getAdvisoryAchievements,
  getGradingPeriods,
  getSchoolYears,
  updateEmail,
  changePassword
};