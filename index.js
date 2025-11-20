require('dotenv').config();
const express = require("express");
const moment = require("moment");
const cors = require("cors");
const connection = require("./database/db");

// Import all routes
const userRoutes = require("./routes/userRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const adviserRoutes = require("./routes/adviserRoutes");
const adminRoutes = require("./routes/adminRoutes"); // NEW: Admin routes

const app = express();
const PORT = process.env.PORT || 6969;

// Logging middleware
const logger = (req, res, next) => {
  console.log(
    `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl} : ${moment().format("YYYY-MM-DD HH:mm:ss")}`
  );
  next();
};

// Apply middleware
app.use(logger);

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection check
connection.getConnection((err, conn) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    process.exit(1);
  } else {
    console.log("Connected to MySQL Database");
    conn.release(); // Release the connection back to the pool
  }
});

// API Routes
app.use("/api", userRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/adviser", adviserRoutes);
app.use("/api/admin", adminRoutes); // NEW: Admin routes

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Server is running!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Test API: http://localhost:${PORT}/api/test`);
  console.log(`JWT Session Timeout: ${process.env.JWT_EXPIRES_IN || '30m'}`);
});