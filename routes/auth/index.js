const express = require("express");

const router =
    express.Router();

const authMiddleware =
    require("../../middleware/authMiddleware");

const {
    loginUser,
    registerUser,
    profile
} = require("../../controllers/authController"
);

// Public Routes

// Register  Routes
router.post(
    "/register",
    registerUser
);

// Login Routes, this is used to test the public route, it will be later upgraded to return the user data after login
router.post(
    "/login",
    loginUser
);
 
// Protected Route

// Profile Route, this is used to test the protected route, it will be later upgraded to return the user profile data
router.get(
    "/profile",
    authMiddleware,
    profile
);

module.exports = router;