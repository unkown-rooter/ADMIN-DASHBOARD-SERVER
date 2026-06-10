const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER

exports.register = async (
    req,
    res
) => {

    try {

        const {
            username,
            password
        } = req.body;

        if (
            !username ||
            !password
        ) {
            return res.status(400).json({
                message:
                    "Username and password required"
            });
        }

        const existingUser =
            await User.findOne({
                username
            });

        if (existingUser) {
            return res.status(400).json({
                message:
                    "Username already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );

        const user =
            await User.create({
                username,
                password:
                    hashedPassword,
                role: "admin"
            });

        res.status(201).json({
            success: true,
            message:
                "User registered successfully",
            user: {
                id: user._id,
                username:
                    user.username
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Internal server error"
        });

    }
};

// LOGIN

exports.login = async (
    req,
    res
) => {

    try {

        const {
            username,
            password
        } = req.body;

        if (
            !username ||
            !password
        ) {
            return res.status(400).json({
                message:
                    "Username and password required"
            });
        }

        const user =
            await User.findOne({
                username
            });

        if (!user) {
            return res.status(401).json({
                message:
                    "Invalid credentials"
            });
        }

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {
            return res.status(401).json({
                message:
                    "Invalid credentials"
            });
        }

        const token =
            jwt.sign(
                {
                    id: user._id,
                    username:
                        user.username,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

        res.status(200).json({
            success: true,
            message:
                "Login successful",
            token,
            user: {
                id: user._id,
                username:
                    user.username,
                role: user.role
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Internal server error"
        });

    }
};

// PROFILE

exports.profile = async (
    req,
    res
) => {

    try {

        const user =
            await User.findById(
                req.user.id
            ).select("-password");

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {

        res.status(500).json({
            message:
                "Internal server error"
        });

    }
};