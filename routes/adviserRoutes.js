// backend/routes/adviserRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  getAdviserProfile,
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

// ✅ GET /api/adviser/profile - Get adviser profile
router.get("/profile", getAdviserProfile);

// ✅ GET /api/adviser/advisory-section - Get advisory section
router.get("/advisory-section", getAdvisorySection);

// ✅ GET /api/adviser/student-list - Get student list in advisory section
router.get("/student-list", getAdvisoryStudentList);

// ✅ GET /api/adviser/student-grades - Get all student grades in advisory section
router.get("/student-grades", getAdvisoryStudentGrades);

// ✅ GET /api/adviser/achievements - Get achievements in advisory section
router.get("/achievements", getAdvisoryAchievements);

// ✅ GET /api/adviser/grading-periods - Get grading periods
router.get("/grading-periods", getGradingPeriods);

// ✅ GET /api/adviser/school-years - Get school years
router.get("/school-years", getSchoolYears);

// ✅ PUT /api/adviser/update-email - Update email
router.put("/update-email", updateEmail);

// ✅ PUT /api/adviser/change-password - Change password
router.put("/change-password", changePassword);

module.exports = router;