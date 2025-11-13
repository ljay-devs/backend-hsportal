const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  getStudentProfile,getStudentGrades,
  getStudentAchievements,getHistoricalGrades,
  updateEmail,changePassword,
  getGradingPeriods,getSchoolYears
} = require("../controllers/studentController");

const verifyStudent = (req, res, next) => {
  if (req.user.role !== "Student") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Students only."
    });
  }
  next();
};

router.use(verifyToken);
router.use(verifyStudent);

router.get("/profile", getStudentProfile);
router.get("/grades", getStudentGrades);
router.get("/achievements", getStudentAchievements);
router.get("/historical-grades", getHistoricalGrades);
router.put("/update-email", updateEmail);
router.put("/change-password", changePassword);
router.get("/grading-periods", getGradingPeriods);
router.get("/school-years", getSchoolYears);

module.exports = router;