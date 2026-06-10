/* =========================================================
   BOTS MANAGEMENT SYSTEM
   FILE: js/bots.js

   READY FOR:
   ✅ Node.js Backend
   ✅ Express API
   ✅ MongoDB
   ✅ Socket.IO
   ✅ JWT Authentication
   ✅ Real-time Updates

========================================================= */


/* =========================================================
   API CONFIGURATION
========================================================= */

// Backend API URL
const API_BASE_URL = "http://localhost:5000/api";


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

// Store all bots from database
let bots = [];

// Selected bot ID
let selectedBotId = null;


/* =========================================================
   DOM ELEMENTS
========================================================= */

// Bot Grid
const botsGrid = document.getElementById("botsGrid");

// Statistics
const totalBotsCount = document.getElementById("totalBotsCount");

const runningBotsCount = document.getElementById("runningBotsCount");

const offlineBotsCount = document.getElementById("offlineBotsCount");

// Search
const searchInput = document.getElementById("searchInput");

// Modal
const modalOverlay = document.getElementById("modalOverlay");

const openAddBotModalBtn = document.getElementById("openAddBotModalBtn");

const closeModalBtn = document.getElementById("closeModalBtn");

// Form
const addBotForm = document.getElementById("addBotForm");

const botNameInput = document.getElementById("botName");

const botPlatformInput = document.getElementById("botPlatform");

const botTokenInput = document.getElementById("botToken");


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("Bots Page Loaded");

    // Initialize everything
    initializeBotsPage();

});


/* =========================================================
   INITIALIZE PAGE
========================================================= */

async function initializeBotsPage() {

    // Load bots from backend
    await fetchBots();

    // Setup listeners
    setupEventListeners();

    // Start auto refresh
    startAutoRefresh();

}


/* =========================================================
   FETCH BOTS FROM BACKEND
========================================================= */

async function fetchBots() {

    try {

        // GET /api/bots

        const response = await fetch(`${API_BASE_URL}/bots`, {

            headers: {

                // JWT Token
                Authorization: `Bearer ${getToken()}`

            }

        });

        // Convert response
        const data = await response.json();

        console.log("Bots:", data);

        // Save bots globally
        bots = data;

        // Render bots
        renderBots();

        // Update statistics
        updateStatistics();

    } catch (error) {

        console.error("Fetch Bots Error:", error);

        showNotification(
            "Failed to load bots",
            "error"
        );

    }

}


/* =========================================================
   RENDER BOTS
========================================================= */

function renderBots(filteredBots = bots) {

    // Clear old cards
    botsGrid.innerHTML = "";

    // If no bots
    if (filteredBots.length === 0) {

        botsGrid.innerHTML = `
            <div class="empty-state">

                <h2>No Bots Found</h2>

                <p>Create your first bot</p>

            </div>
        `;

        return;

    }

    // Loop through bots
    filteredBots.forEach((bot) => {

        // Create card
        const botCard = document.createElement("div");

        botCard.classList.add("bot-card");

        // Determine platform icon
        const iconClass =
            bot.platform === "Telegram"
            ? "fa-brands fa-telegram"
            : "fa-brands fa-whatsapp";

        // Determine icon background
        const iconBgClass =
            bot.platform === "Telegram"
            ? "telegram-icon"
            : "whatsapp-icon";

        // Determine status class
        const statusClass =
            bot.status === "Running"
            ? "running"
            : "offline";

        // Build card HTML
        botCard.innerHTML = `

            <!-- TOP -->
            <div class="bot-top">

                <!-- ICON -->
                <div class="bot-icon ${iconBgClass}">

                    <i class="${iconClass}"></i>

                </div>

                <!-- STATUS -->
                <div class="status-badge ${statusClass}">

                    ${bot.status}

                </div>

            </div>

            <!-- INFO -->
            <div class="bot-info">

                <h2>${bot.name}</h2>

                <p>
                    Platform:
                    ${bot.platform}
                </p>

                <p>
                    Uptime:
                    ${bot.uptime || "0m"}
                </p>

                <p>
                    Created:
                    ${formatDate(bot.createdAt)}
                </p>

            </div>

            <!-- ACTIONS -->
            <div class="bot-actions">

                <!-- START -->
                <button
                    class="action-btn start-btn"
                    onclick="startBot('${bot._id}')"
                >

                    <i class="fa-solid fa-play"></i>

                    Start

                </button>

                <!-- STOP -->
                <button
                    class="action-btn stop-btn"
                    onclick="stopBot('${bot._id}')"
                >

                    <i class="fa-solid fa-stop"></i>

                    Stop

                </button>

                <!-- RESTART -->
                <button
                    class="action-btn restart-btn"
                    onclick="restartBot('${bot._id}')"
                >

                    <i class="fa-solid fa-rotate-right"></i>

                    Restart

                </button>

                <!-- DELETE -->
                <button
                    class="action-btn delete-btn"
                    onclick="deleteBot('${bot._id}')"
                >

                    <i class="fa-solid fa-trash"></i>

                    Delete

                </button>

            </div>
        `;

        // Add card
        botsGrid.appendChild(botCard);

    });

}


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics() {

    // Total bots
    totalBotsCount.textContent = bots.length;

    // Running bots
    const runningBots = bots.filter((bot) => {

        return bot.status === "Running";

    });

    runningBotsCount.textContent = runningBots.length;

    // Offline bots
    const offlineBots = bots.filter((bot) => {

        return bot.status !== "Running";

    });

    offlineBotsCount.textContent = offlineBots.length;

}


/* =========================================================
   OPEN MODAL
========================================================= */

function openModal() {

    modalOverlay.classList.add("active");

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal() {

    modalOverlay.classList.remove("active");

    // Reset form
    addBotForm.reset();

}


/* =========================================================
   CREATE NEW BOT
========================================================= */

async function createBot(event) {

    // Prevent refresh
    event.preventDefault();

    // Get values
    const name = botNameInput.value.trim();

    const platform = botPlatformInput.value;

    const token = botTokenInput.value.trim();

    // Validation
    if (!name || !platform || !token) {

        showNotification(
            "Please fill all fields",
            "error"
        );

        return;

    }

    try {

        // POST /api/bots

        const response = await fetch(`${API_BASE_URL}/bots`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${getToken()}`

            },

            body: JSON.stringify({

                name,
                platform,
                token

            })

        });

        // Convert response
        const data = await response.json();

        console.log("Bot Created:", data);

        // Success
        if (response.ok) {

            showNotification(
                "Bot created successfully",
                "success"
            );

            // Refresh bots
            fetchBots();

            // Close modal
            closeModal();

        } else {

            showNotification(
                data.message || "Failed to create bot",
                "error"
            );

        }

    } catch (error) {

        console.error("Create Bot Error:", error);

        showNotification(
            "Server error",
            "error"
        );

    }

}


/* =========================================================
   START BOT
========================================================= */

async function startBot(botId) {

    try {

        console.log("Starting Bot:", botId);

        // POST /api/bots/start/:id

        const response = await fetch(

            `${API_BASE_URL}/bots/start/${botId}`,

            {

                method: "POST",

                headers: {

                    Authorization:
                    `Bearer ${getToken()}`

                }

            }

        );

        const data = await response.json();

        console.log(data);

        showNotification(
            "Bot started",
            "success"
        );

        // Refresh
        fetchBots();

    } catch (error) {

        console.error("Start Bot Error:", error);

        showNotification(
            "Failed to start bot",
            "error"
        );

    }

}


/* =========================================================
   STOP BOT
========================================================= */

async function stopBot(botId) {

    try {

        console.log("Stopping Bot:", botId);

        // POST /api/bots/stop/:id

        const response = await fetch(

            `${API_BASE_URL}/bots/stop/${botId}`,

            {

                method: "POST",

                headers: {

                    Authorization:
                    `Bearer ${getToken()}`

                }

            }

        );

        const data = await response.json();

        console.log(data);

        showNotification(
            "Bot stopped",
            "success"
        );

        fetchBots();

    } catch (error) {

        console.error("Stop Bot Error:", error);

        showNotification(
            "Failed to stop bot",
            "error"
        );

    }

}


/* =========================================================
   RESTART BOT
========================================================= */

async function restartBot(botId) {

    try {

        console.log("Restarting Bot:", botId);

        // POST /api/bots/restart/:id

        const response = await fetch(

            `${API_BASE_URL}/bots/restart/${botId}`,

            {

                method: "POST",

                headers: {

                    Authorization:
                    `Bearer ${getToken()}`

                }

            }

        );

        const data = await response.json();

        console.log(data);

        showNotification(
            "Bot restarted",
            "success"
        );

        fetchBots();

    } catch (error) {

        console.error("Restart Bot Error:", error);

        showNotification(
            "Failed to restart bot",
            "error"
        );

    }

}


/* =========================================================
   DELETE BOT
========================================================= */

async function deleteBot(botId) {

    // Confirm deletion
    const confirmed = confirm(
        "Are you sure you want to delete this bot?"
    );

    if (!confirmed) return;

    try {

        console.log("Deleting Bot:", botId);

        // DELETE /api/bots/:id

        const response = await fetch(

            `${API_BASE_URL}/bots/${botId}`,

            {

                method: "DELETE",

                headers: {

                    Authorization:
                    `Bearer ${getToken()}`

                }

            }

        );

        const data = await response.json();

        console.log(data);

        showNotification(
            "Bot deleted",
            "success"
        );

        // Refresh bots
        fetchBots();

    } catch (error) {

        console.error("Delete Bot Error:", error);

        showNotification(
            "Failed to delete bot",
            "error"
        );

    }

}


/* =========================================================
   SEARCH BOTS
========================================================= */

function searchBots(searchText) {

    // Convert to lowercase
    const query = searchText.toLowerCase();

    // Filter bots
    const filteredBots = bots.filter((bot) => {

        return (

            bot.name
            .toLowerCase()
            .includes(query)

            ||

            bot.platform
            .toLowerCase()
            .includes(query)

        );

    });

    // Render filtered bots
    renderBots(filteredBots);

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEventListeners() {

    // OPEN MODAL
    openAddBotModalBtn.addEventListener(

        "click",

        openModal

    );

    // CLOSE MODAL
    closeModalBtn.addEventListener(

        "click",

        closeModal

    );

    // CLOSE WHEN CLICK OUTSIDE
    modalOverlay.addEventListener(

        "click",

        (event) => {

            if (event.target === modalOverlay) {

                closeModal();

            }

        }

    );

    // FORM SUBMIT
    addBotForm.addEventListener(

        "submit",

        createBot

    );

    // SEARCH
    searchInput.addEventListener(

        "input",

        (event) => {

            searchBots(event.target.value);

        }

    );

}


/* =========================================================
   AUTO REFRESH
========================================================= */

function startAutoRefresh() {

    // Refresh every 10 seconds
    setInterval(() => {

        console.log("Refreshing Bots...");

        fetchBots();

    }, 10000);

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateString) {

    if (!dateString) return "Unknown";

    const date = new Date(dateString);

    return date.toLocaleDateString();

}


/* =========================================================
   JWT TOKEN
========================================================= */

function getToken() {

    return localStorage.getItem("token");

}


/* =========================================================
   NOTIFICATION SYSTEM
========================================================= */

function showNotification(message, type) {

    // Create notification
    const notification = document.createElement("div");

    notification.classList.add("notification");

    // Type class
    notification.classList.add(type);

    // Message
    notification.textContent = message;

    // Add styles
    notification.style.position = "fixed";

    notification.style.top = "20px";

    notification.style.right = "20px";

    notification.style.padding = "15px 20px";

    notification.style.borderRadius = "12px";

    notification.style.color = "white";

    notification.style.fontWeight = "600";

    notification.style.zIndex = "9999";

    notification.style.boxShadow =
        "0 10px 25px rgba(0,0,0,0.3)";

    notification.style.animation =
        "slideIn 0.3s ease";

    // Success/Error colors
    if (type === "success") {

        notification.style.background =
            "#22c55e";

    } else {

        notification.style.background =
            "#ef4444";

    }

    // Add to body
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {

        notification.remove();

    }, 3000);

}


/* =========================================================
   SOCKET.IO SUPPORT (OPTIONAL)
========================================================= */

/*

=========================================================
BACKEND:

npm install socket.io

=========================================================

SERVER:

const io = require("socket.io")(server);

io.on("connection", (socket) => {

    console.log("Client Connected");

});

=========================================================
FRONTEND:

<script src="/socket.io/socket.io.js"></script>

const socket = io("http://localhost:5000");

socket.on("bot-updated", () => {

    fetchBots();

});

=========================================================

*/


/* =========================================================
   EXPECTED MONGODB STRUCTURE
========================================================= */

/*

{
    _id: ObjectId,

    name: "WeatherBot",

    platform: "Telegram",

    token: "BOT_TOKEN",

    status: "Running",

    uptime: "4h 22m",

    createdAt: Date
}

*/


/* =========================================================
   EXPECTED EXPRESS ROUTES
========================================================= */

/*

=========================================================
GET ALL BOTS
=========================================================

GET /api/bots

=========================================================
CREATE BOT
=========================================================

POST /api/bots

=========================================================
DELETE BOT
=========================================================

DELETE /api/bots/:id

=========================================================
START BOT
=========================================================

POST /api/bots/start/:id

=========================================================
STOP BOT
=========================================================

POST /api/bots/stop/:id

=========================================================
RESTART BOT
=========================================================

POST /api/bots/restart/:id

=========================================================

*/


/* =========================================================
   PROTECTED ROUTE CHECK
========================================================= */

// If user not logged in
window.addEventListener("load", () => {

    const token = getToken();

    // No token
    if (!token) {

        // Redirect login
        window.location.href = "login.html";

    }

});


/* =========================================================
   END OF FILE
========================================================= */