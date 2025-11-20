const jwt = require("jsonwebtoken");
const connection = require("../database/db");
const asyncHandler = require("../middleware/asyncHandler");

if (!process.env.JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined.");
}

const JWT_SECRET = process.env.JWT_SECRET;
const db = connection.promise();

const verifyUser = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const role = req.user.role;

  let sql = "";
  
  if (role === "Student") {
    sql = `
      SELECT 
        s.user_id,
        s.fname,
        s.lname,
        s.mname,
        s.email,
        s.yearlevel,
        s.section_name,
        u.role,
        u.status
      FROM student_info s
      INNER JOIN tblusers u ON s.user_id = u.user_id
      WHERE s.user_id = ? AND u.status = 'active'
    `;
  } else if (role === "Teacher" || role === "Adviser") {
    sql = `
      SELECT 
        t.user_id,
        t.fname,
        t.lname,
        t.mname,
        t.email,
        t.position,
        u.role,
        u.status
      FROM teacher_info t
      INNER JOIN tblusers u ON t.user_id = u.user_id
      WHERE t.user_id = ? AND u.status = 'active'
    `;
  } else if (role === "Admin") {
    sql = `
      SELECT 
        a.user_id,
        a.fname,
        a.lname,
        a.mname,
        a.email,
        a.position,
        u.role,
        u.status
      FROM admin_info a
      INNER JOIN tblusers u ON a.user_id = u.user_id
      WHERE a.user_id = ? AND u.status = 'active'
    `;
  }

  if (!sql) {
    return res.status(400).json({
      success: false,
      message: "Invalid user role"
    });
  }

  const [results] = await db.query(sql, [userId]);

  if (results.length === 0) {
    return res.status(404).json({
      success: false,
      message: "User not found or inactive"
    });
  }

  res.status(200).json({
    success: true,
    message: "User verified",
    user: results[0]
  });
});

const logout = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  
  const sql = "UPDATE tblusers SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?";
  await db.query(sql, [userId]);
  
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});

module.exports = {
  verifyUser,
  logout
};