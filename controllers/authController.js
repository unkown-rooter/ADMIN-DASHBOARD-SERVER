const database = require("../database/users.json");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const usersFile = path.join(__dirname, "../database/users.json");

// REGISTER

exports.registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = database.find(
            user => user.email === email
        );

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now(),
            email,
            password: hashedPassword
        };

        database.push(newUser);

        fs.writeFileSync(
            usersFile,
            JSON.stringify(database, null, 2)
        );

        res.status(201).json({
            success: true,
            message: "User registered"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// LOGIN

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = database.find(
            user => user.email === email
        );

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const match = await bcrypt.compare(
            password,
            user.password
        );

        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
            success: true,
            token
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// PROFILE

exports.profile = async (req, res) => {
    try {

        const user = database.find(
            user => user.id === req.user.id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const { password, ...userData } = user;

        res.status(200).json({
            success: true,
            user: userData
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};