const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const connection = require("../database/db");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30m";

const login = (req, res) => {
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
  
  connection.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("SQL Error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid User ID or Password.",
      });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
      if (bcryptErr) {
        console.error("Bcrypt Error:", bcryptErr);
        return res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }

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
      connection.query(updateLastLogin, [user.user_id], (updateErr) => {
        if (updateErr) {
          console.error("Error updating last login:", updateErr);
        }
      });

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
  });
};

module.exports = { login };