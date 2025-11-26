const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const connection = require("../database/db");
const asyncHandler = require("../middleware/asyncHandler");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30m";
const db = connection.promise();

const login = asyncHandler(async (req, res) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter both User ID and Password.",
    });
  }

  const sql = `
    SELECT user_id, password, role, status
    FROM tblusers
    WHERE user_id = ? AND status = 'active'
  `;
  
  const [results] = await db.query(sql, [userId]);

  if (results.length === 0) {
    return res.status(401).json({
      success: false,
      message: "Invalid User ID or Password.",
    });
  }

  const user = results[0];

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid User ID or Password.",
    });
  }

  const token = jwt.sign(
    {
      user_id: user.user_id,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const updateLastLogin = "UPDATE tblusers SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?";
  await db.query(updateLastLogin, [user.user_id]);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token: token,
    user: {
      user_id: user.user_id,
      role: user.role,
      status: user.status
    }
  });
});

module.exports = { login };