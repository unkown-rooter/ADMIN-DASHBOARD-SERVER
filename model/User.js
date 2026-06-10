// THIS FILE CONTAINS THE SCHEMA FOR THE USER MODEL, WHICH DEFINES THE STRUCTURE OF THE USER DOCUMENTS IN THE DATABASE. IT INCLUDES FIELDS FOR USERNAME, PASSWORD, AND ROLE, WITH APPROPRIATE VALIDATIONS AND DEFAULT VALUES.

// WE ARE USING LOCAL DATABASE FOR TESTING PURPOSE, SO WE WILL NOT IMPLEMENT THE USER REGISTRATION FUNCTIONALITY FOR NOW. WE WILL ADD THE REGISTER FUNCTION WHEN WE UPGRADE TO THE CLOUD DATABASE AND IMPLEMENT THE USER REGISTRATION FUNCTIONALITY.



const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        default: "admin"
    }
});

module.exports = mongoose.model("User", userSchema);