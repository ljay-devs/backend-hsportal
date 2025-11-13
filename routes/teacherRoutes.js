// backend/routes/teacherRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
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
} = require("../controllers/teacherController");

// Middleware to check if user is a teacher or adviser
const verifyTeacher = (req, res, next) => {
  if (req.user.role !== "Teacher" && req.user.role !== "Adviser") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Teachers/Advisers only."
    });
  }
  next();
};

// All routes require authentication and teacher/adviser role
router.use(verifyToken);
router.use(verifyTeacher);

// ✅ GET /api/teacher/profile - Get teacher profile
router.get("/profile", getTeacherProfile);

// ✅ GET /api/teacher/subjects - Get subjects teacher handles
router.get("/subjects", getTeacherSubjects);

// ✅ GET /api/teacher/sections/:subCode - Get sections for a subject
router.get("/sections/:subCode", getSubjectSections);

// ✅ GET /api/teacher/students/:sectionId/:subCode - Get students for grading
router.get("/students/:sectionId/:subCode", getStudentsForGrading);

// ✅ POST /api/teacher/submit-grades - Submit grades
router.post("/submit-grades", submitGrades);

// ✅ POST /api/teacher/request-reattempt - Request re-attempt
router.post("/request-reattempt", requestReattempt);

// ✅ GET /api/teacher/reattempt-status - Get re-attempt status
router.get("/reattempt-status", getReattemptStatus);

// ✅ GET /api/teacher/active-school-year - Get active school year
router.get("/active-school-year", getActiveSchoolYear);

// ✅ GET /api/teacher/grading-periods - Get grading periods
router.get("/grading-periods", getGradingPeriods);

// ✅ PUT /api/teacher/update-email - Update email
router.put("/update-email", updateEmail);

// ✅ PUT /api/teacher/change-password - Change password
router.put("/change-password", changePassword);

module.exports = router;