
const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");



dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

const authRoutes = require("./routes/auth");


//const connectDB = require("./config/db");// this will be later upgraded for now lets comment it out and use the local database for testing purpose


// Connect to the Database
// connectDB();


// Middleware setup 
console.log("Setting up middleware...");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// Routes setup
console.log("Setting up routes...");
app.use("/api/auth", authRoutes);
//app.use("/api/bots", botRoutes);
//app.use("/api/logs", logRoutes);

// TEST ROUTE
app.get("/health", (req, res) => {
    res.json({
        status: "ONLINE"
    });
});


// Serve the Frontend
app.get('/', (req, res) => {
    console.log('Received request for ${req.url}');
    res.sendFile(
        path.join(__dirname, 'public', 'index.html'));
});
app.get('/login', (req, res) => {
    console.log('Received request for ${req.url}');
    res.sendFile(
        path.join(__dirname, 'public', 'login.html'));
});


// Start the Server and Listen on the Port 5000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
});

