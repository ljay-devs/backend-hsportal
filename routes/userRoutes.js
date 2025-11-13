const express = require("express");
const router = express.Router();

const { login } = require("../controllers/login");
const { verifyUser, logout } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/login", login);
router.get("/verify", verifyToken, verifyUser);
router.post("/logout", verifyToken, logout);

module.exports = router;