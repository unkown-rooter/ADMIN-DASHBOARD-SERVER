const express = require("express");

const router =
    express.Router();

const authMiddleware =
    require("../../middleware/authMiddleware");

const {
    login, // login here is used to test the public route, it will be later upgraded to return the user data after login

    register, // register here is used to test the public route, it will be later upgraded to return the user data after registration

    profile // profile here is used to test the protected route, it will be later upgraded to return the user profile data

} = require( // this is used to import the functions from the authController.js file, it will be later upgraded to import the functions from the authController.js file in the controllers folder
    "../../controllers/authController"
);

// Public Routes

// Register  Routes
router.post(
    "/register",
    register
);

// Login Routes, this is used to test the public route, it will be later upgraded to return the user data after login
router.post(
    "/login",
    login
);

// Protected Route

// Profile Route, this is used to test the protected route, it will be later upgraded to return the user profile data
router.get(
    "/profile",
    authMiddleware,
    profile
);

module.exports = router;