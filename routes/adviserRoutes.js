// backend/routes/adviserRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  getAdviserProfile,
  getAdviserSubjects,
  getSubjectSections,
  getStudentsForGrading,
  submitGrades,
  requestReattempt,
  getReattemptStatus,
  getActiveSchoolYear,
  getTeachingGradingPeriods,
  getAdvisorySection,
  getAdvisoryStudentList,
  getAdvisoryStudentGrades,
  getAdvisoryAchievements,
  getGradingPeriods,
  getSchoolYears,
  updateEmail,
  changePassword
} = require("../controllers/adviserController");

// Middleware to check if user is an adviser
const verifyAdviser = (req, res, next) => {
  if (req.user.role !== "Adviser") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Advisers only."
    });
  }
  next();
};

// All routes require authentication and adviser role
router.use(verifyToken);
router.use(verifyAdviser);

// ==================== PROFILE ====================
// ✅ GET /api/adviser/profile - Get adviser profile
router.get("/profile", getAdviserProfile);

// ==================== TEACHING SUBJECTS (same as teacher) ====================
// ✅ GET /api/adviser/subjects - Get subjects adviser is teaching
router.get("/subjects", getAdviserSubjects);

// ✅ GET /api/adviser/subjects/:subCode/sections - Get sections for a subject
router.get("/subjects/:subCode/sections", getSubjectSections);

// ✅ GET /api/adviser/sections/:sectionId/subjects/:subCode/students - Get students for grading
router.get("/sections/:sectionId/subjects/:subCode/students", getStudentsForGrading);

// ✅ POST /api/adviser/grades/submit - Submit grades
router.post("/grades/submit", submitGrades);

// ✅ POST /api/adviser/reattempt/request - Request grade re-attempt
router.post("/reattempt/request", requestReattempt);

// ✅ GET /api/adviser/reattempt/status - Get re-attempt request status
router.get("/reattempt/status", getReattemptStatus);

// ✅ GET /api/adviser/active-school-year - Get active school year
router.get("/active-school-year", getActiveSchoolYear);

// ✅ GET /api/adviser/teaching-grading-periods - Get grading periods for teaching subjects
router.get("/teaching-grading-periods", getTeachingGradingPeriods);

// ==================== ADVISORY SECTION ====================
// ✅ GET /api/adviser/advisory-section - Get advisory section
router.get("/advisory-section", getAdvisorySection);

// ✅ GET /api/adviser/student-list - Get student list in advisory section
router.get("/student-list", getAdvisoryStudentList);

// ✅ GET /api/adviser/student-grades - Get all student grades in advisory section
router.get("/student-grades", getAdvisoryStudentGrades);

// ✅ GET /api/adviser/achievements - Get achievements in advisory section
router.get("/achievements", getAdvisoryAchievements);

// ✅ GET /api/adviser/grading-periods - Get grading periods for advisory section
router.get("/grading-periods", getGradingPeriods);

// ✅ GET /api/adviser/school-years - Get school years
router.get("/school-years", getSchoolYears);

// ==================== ACCOUNT SETTINGS ====================
// ✅ PUT /api/adviser/update-email - Update email
router.put("/update-email", updateEmail);

// ✅ PUT /api/adviser/change-password - Change password
router.put("/change-password", changePassword);

module.exports = router;