const connection = require("../database/db");

// ==================== PROFILE ====================

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

// ==================== TEACHING SUBJECTS MANAGEMENT ====================

const getAdviserSubjects = (req, res) => {
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

  connection.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching adviser subjects:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching subjects"
      });
    }

    console.log(`Fetched ${results.length} subjects for adviser ${userId}`);
    res.status(200).json({
      success: true,
      data: results
    });
  });
};

const getSubjectSections = (req, res) => {
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

  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching sections:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching sections"
      });
    }

    console.log(`Fetched ${results.length} sections for ${subCode}`);
    res.status(200).json({
      success: true,
      data: results
    });
  });
};

const getStudentsForGrading = (req, res) => {
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

  connection.query(checkPeriodSql, [sectionId, schoolYear, periodId], (err, periodResults) => {
    if (err) {
      console.error("Error checking grading period:", err);
      return res.status(500).json({
        success: false,
        message: "Error checking grading period"
      });
    }

    if (periodResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Grading period not found"
      });
    }

    const period = periodResults[0];
    const isOpen = period.is_open === 1;
    const now = new Date();
    const inputStart = new Date(period.grade_input_start);
    const inputEnd = new Date(period.grade_input_end);
    const withinDateRange = now >= inputStart && now <= inputEnd;

    const checkSubmissionSql = `
      SELECT submission_id, submitted_at, can_edit
      FROM grade_submissions
      WHERE teacher_id = ?
        AND section_id = ?
        AND sub_code = ?
        AND school_year = ?
        AND period_id = ?
    `;

    connection.query(
      checkSubmissionSql,
      [userId, sectionId, subCode, schoolYear, periodId],
      (err, submissionResults) => {
        if (err) {
          console.error("Error checking submission:", err);
          return res.status(500).json({
            success: false,
            message: "Error checking submission status"
          });
        }

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

        connection.query(
          studentsSql,
          [schoolYear, subCode, userId, sectionId, schoolYear, periodId, sectionId],
          (err, students) => {
            if (err) {
              console.error("Error fetching students:", err);
              return res.status(500).json({
                success: false,
                message: "Error fetching students"
              });
            }

            console.log(`Fetched ${students.length} students for grading`);
            res.status(200).json({
              success: true,
              data: {
                students: students,
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
          }
        );
      }
    );
  });
};

const submitGrades = (req, res) => {
  const userId = req.user.user_id;
  const { sectionId, subCode, schoolYear, periodId, grades } = req.body;

  if (!sectionId || !subCode || !schoolYear || !periodId || !grades || !Array.isArray(grades)) {
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

  connection.query(
    checkSubmissionSql,
    [userId, sectionId, subCode, schoolYear, periodId],
    (err, results) => {
      if (err) {
        console.error("Error checking submission:", err);
        return res.status(500).json({
          success: false,
          message: "Error submitting grades"
        });
      }

      if (results.length > 0 && results[0].can_edit === 0) {
        return res.status(403).json({
          success: false,
          message: "Grades already submitted. Request re-attempt from admin to edit."
        });
      }

      const periodSql = `
        SELECT grading_period, yearlevel
        FROM grading_periods gp
        INNER JOIN section_info sec ON gp.yearlevel = sec.yearlevel
        WHERE gp.period_id = ? AND gp.school_year = ? AND sec.section_id = ?
      `;

      connection.query(periodSql, [periodId, schoolYear, sectionId], (err, periodResults) => {
        if (err || periodResults.length === 0) {
          console.error("Error fetching period:", err);
          return res.status(500).json({
            success: false,
            message: "Error fetching grading period"
          });
        }

        const gradingPeriod = periodResults[0].grading_period;
        const yearlevel = periodResults[0].yearlevel;

        connection.beginTransaction((err) => {
          if (err) {
            console.error("Transaction error:", err);
            return res.status(500).json({
              success: false,
              message: "Error submitting grades"
            });
          }

          const gradePromises = grades.map((grade) => {
            return new Promise((resolve, reject) => {
              const { student_id, final_grade } = grade;
              
              if (final_grade === null || final_grade === undefined || final_grade === '') {
                return resolve();
              }

              const gradeValue = parseFloat(final_grade);
              if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
                return reject(new Error(`Invalid grade for student ${student_id}`));
              }

              const remarks = gradeValue >= 75 ? 'Passed' : 'Failed';

              const upsertGradeSql = `
                INSERT INTO grade_records 
                  (user_id, sub_code, teacher_id, section_id, yearlevel, school_year, period_id, grading_period, final_grade, remarks)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                  final_grade = VALUES(final_grade),
                  remarks = VALUES(remarks)
              `;

              connection.query(
                upsertGradeSql,
                [student_id, subCode, userId, sectionId, yearlevel, schoolYear, periodId, gradingPeriod, gradeValue, remarks],
                (err) => {
                  if (err) return reject(err);
                  resolve();
                }
              );
            });
          });

          Promise.all(gradePromises)
            .then(() => {
              const submissionSql = `
                INSERT INTO grade_submissions 
                  (teacher_id, section_id, sub_code, school_year, period_id, can_edit)
                VALUES (?, ?, ?, ?, ?, 0)
                ON DUPLICATE KEY UPDATE
                  submitted_at = CURRENT_TIMESTAMP,
                  can_edit = 0
              `;

              connection.query(
                submissionSql,
                [userId, sectionId, subCode, schoolYear, periodId],
                (err) => {
                  if (err) {
                    return connection.rollback(() => {
                      console.error("Error recording submission:", err);
                      res.status(500).json({
                        success: false,
                        message: "Error submitting grades"
                      });
                    });
                  }

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

                  connection.query(
                    updateAchievementsSql,
                    [schoolYear, periodId, sectionId],
                    (err) => {
                      if (err) {
                        return connection.rollback(() => {
                          console.error("Error updating achievements:", err);
                          res.status(500).json({
                            success: false,
                            message: "Error updating achievements"
                          });
                        });
                      }

                      connection.commit((err) => {
                        if (err) {
                          return connection.rollback(() => {
                            console.error("Commit error:", err);
                            res.status(500).json({
                              success: false,
                              message: "Error submitting grades"
                            });
                          });
                        }

                        console.log(`Grades submitted successfully by adviser ${userId}`);
                        res.status(200).json({
                          success: true,
                          message: "Grades submitted successfully"
                        });
                      });
                    }
                  );
                }
              );
            })
            .catch((error) => {
              connection.rollback(() => {
                console.error("Error inserting grades:", error);
                res.status(500).json({
                  success: false,
                  message: error.message || "Error submitting grades"
                });
              });
            });
        });
      });
    }
  );
};

const requestReattempt = (req, res) => {
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

  connection.query(
    checkRequestSql,
    [userId, sectionId, subCode, schoolYear, periodId],
    (err, results) => {
      if (err) {
        console.error("Error checking request:", err);
        return res.status(500).json({
          success: false,
          message: "Error submitting request"
        });
      }

      if (results.length > 0) {
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

      connection.query(infoSql, [periodId, subCode, sectionId], (err, infoResults) => {
        if (err || infoResults.length === 0) {
          console.error("Error fetching info:", err);
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

        connection.query(
          insertRequestSql,
          [
            userId, sectionId, subCode, schoolYear, periodId,
            info.sub_name, info.section_name, info.grading_period, reason
          ],
          (err, result) => {
            if (err) {
              console.error("Error inserting request:", err);
              return res.status(500).json({
                success: false,
                message: "Error submitting request"
              });
            }

            console.log(`Re-attempt request submitted by adviser ${userId}`);
            res.status(200).json({
              success: true,
              message: "Re-attempt request submitted successfully"
            });
          }
        );
      });
    }
  );
};

const getReattemptStatus = (req, res) => {
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

  connection.query(
    sql,
    [userId, sectionId, subCode, schoolYear, periodId],
    (err, results) => {
      if (err) {
        console.error("Error fetching reattempt status:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching status"
        });
      }

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
    }
  );
};

const getActiveSchoolYear = (req, res) => {
  const sql = `
    SELECT school_year, start_date, end_date
    FROM school_years
    WHERE is_active = 1
    LIMIT 1
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching active school year:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching school year"
      });
    }

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
};

const getTeachingGradingPeriods = (req, res) => {
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

  connection.query(sql, params, (err, results) => {
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
};

// ==================== ADVISORY-SPECIFIC FUNCTIONS ====================

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
  // Profile
  getAdviserProfile,
  
  // Teaching Functions (same as teacher)
  getAdviserSubjects,
  getSubjectSections,
  getStudentsForGrading,
  submitGrades,
  requestReattempt,
  getReattemptStatus,
  getActiveSchoolYear,
  getTeachingGradingPeriods,
  
  // Advisory-specific Functions
  getAdvisorySection,
  getAdvisoryStudentList, 
  getAdvisoryStudentGrades,
  getAdvisoryAchievements,
  getGradingPeriods,
  getSchoolYears,
  
  // Account Settings
  updateEmail,
  changePassword
};