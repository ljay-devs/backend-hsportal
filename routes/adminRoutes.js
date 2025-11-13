const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Middleware to verify admin authentication (you should implement this)
const verifyAdmin = (req, res, next) => {
  // TODO: Implement JWT verification and check if user is admin
  // For now, we'll just pass through
  // Example:
  // const token = req.headers.authorization?.split(' ')[1];
  // if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });
  // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  //   if (err || decoded.role !== 'Admin') {
  //     return res.status(403).json({ success: false, message: "Forbidden" });
  //   }
  //   req.user = decoded;
  //   next();
  // });
  next();
};

// Apply verifyAdmin middleware to all routes
router.use(verifyAdmin);

// ==================== STUDENTS ROUTES ====================
// GET /api/admin/students - Get all students (Grade 11-12) with optional search and filter
router.get("/students", adminController.getAllStudents);

// GET /api/admin/students/:studentId/subjects - Get student's subjects
router.get("/students/:studentId/subjects", adminController.getStudentSubjects);

// PUT /api/admin/students/:studentId - Update student information
router.put("/students/:studentId", adminController.updateStudent);

// POST /api/admin/students - Add new student
router.post("/students", adminController.addStudent);

// DELETE /api/admin/students/:studentId - Archive student
router.delete("/students/:studentId", adminController.archiveStudent);

// ==================== TEACHERS ROUTES ====================
// GET /api/admin/teachers - Get all teachers with optional search
router.get("/teachers", adminController.getAllTeachers);

// POST /api/admin/teachers - Add new teacher
router.post("/teachers", adminController.addTeacher);

// DELETE /api/admin/teachers/:teacherId - Archive teacher
router.delete("/teachers/:teacherId", adminController.archiveTeacher);

// ==================== SUBJECTS ROUTES ====================
// GET /api/admin/subjects - Get all subjects with optional search and filter
router.get("/subjects", adminController.getAllSubjects);

// POST /api/admin/subjects - Add new subject
router.post("/subjects", adminController.addSubject);

// PUT /api/admin/subjects/:sub_code/:school_year - Update subject
router.put("/subjects/:sub_code/:school_year", adminController.updateSubject);

// ==================== ADMINS ROUTES ====================
// GET /api/admin/admins - Get all admins with optional search
router.get("/admins", adminController.getAllAdmins);

// POST /api/admin/admins - Add new admin
router.post("/admins", adminController.addAdmin);

// DELETE /api/admin/admins/:adminId - Archive admin
router.delete("/admins/:adminId", adminController.archiveAdmin);

// ==================== ARCHIVE ROUTES ====================
// GET /api/admin/archive - Get all archived users with optional search and type filter
router.get("/archive", adminController.getArchivedUsers);

// PUT /api/admin/archive/:userId/restore - Restore archived user
router.put("/archive/:userId/restore", adminController.restoreUser);

// DELETE /api/admin/archive/:userId - Delete user permanently
router.delete("/archive/:userId", adminController.deleteUserPermanently);

// ==================== SECTIONS ROUTES ====================
// GET /api/admin/sections - Get all sections with optional grade filter
router.get("/sections", adminController.getAllSections);

// POST /api/admin/sections - Add new section
router.post("/sections", adminController.addSection);

// GET /api/admin/sections/:sectionId/students - Get students in a section
router.get("/sections/:sectionId/students", adminController.getSectionStudents);

// ==================== SCHOOL YEAR ROUTES ====================
// GET /api/admin/school-years - Get all school years
router.get("/school-years", adminController.getAllSchoolYears);

// GET /api/admin/school-years/active - Get active school year
router.get("/school-years/active", adminController.getActiveSchoolYear);

// POST /api/admin/school-years - Create new school year
router.post("/school-years", adminController.createSchoolYear);

// PUT /api/admin/school-years/:schoolYear - Update school year
router.put("/school-years/:schoolYear", adminController.updateSchoolYear);

// ==================== GRADE INPUT DATES ROUTES ====================
// GET /api/admin/grading-periods - Get all grading periods with optional filters
router.get("/grading-periods", adminController.getAllGradingPeriods);

// POST /api/admin/grading-periods - Create or update grading period
router.post("/grading-periods", adminController.upsertGradingPeriod);

// PUT /api/admin/grading-periods/:periodId/toggle - Open/Close grade input period
router.put("/grading-periods/:periodId/toggle", adminController.toggleGradeInputPeriod);

// ==================== REPORTS/REATTEMPT REQUESTS ROUTES ====================
// GET /api/admin/reports - Get all reattempt requests with optional filters
router.get("/reports", adminController.getAllReattemptRequests);

// PUT /api/admin/reports/:requestId/approve - Approve reattempt request
router.put("/reports/:requestId/approve", adminController.approveReattemptRequest);

// PUT /api/admin/reports/:requestId/reject - Reject reattempt request
router.put("/reports/:requestId/reject", adminController.rejectReattemptRequest);

module.exports = router;