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
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    process.exit(1);
  } else {
    console.log("Connected to MySQL Database");
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