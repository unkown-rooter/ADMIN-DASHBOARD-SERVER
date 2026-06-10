/* =========================================================
   BOT CONTROL SERVER - FRONTEND JAVASCRIPT
   FILE: js/index.js - Dashboard Integration

========================================================= */

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL = "http://localhost:5000/api/dashboard/status";
const SOCKET_URL = "http://localhost:5000";



/* =========================================================
   *GLOBAL STATE we use local variables to store the state of the dashboard such as bots data, logs data, selected bot *id, server online status, auto refresh interval, and socket instance. This allows us to manage the state of the *dashboard and update the UI accordingly when the data changes. we will update these variables when we fetch data *from the backend or when we receive real-time updates from the socket. */
/* ========================================================= */

let botsData = [];
let logsData = [];
let selectedBotId = null;
let serverOnline = false; 
let autoRefreshInterval = null;
let socket = null;


/* =========================================================
   DOM ELEMENTS we use document.getElementById to get references to the DOM elements that we will interact with in the dashboard. This allows us to update the content of these elements dynamically based on the data we fetch from the backend or when the user interacts with the dashboard. We will use these references to update the server status, active bots count, telegram bots count, whatsapp bots count, and to render the bots table and logs container. We will also use these references to attach event listeners to the buttons for starting, stopping, restarting, reloading bots, and logging out. */
/* ========================================================= */

/* =========================================================
   DOM ELEMENTS
========================================================= */


const serverStatus = document.getElementById("serverStatus");
const activeBotsCount = document.getElementById("activeBotsCount");
const telegramBotsCount = document.getElementById("telegramBotsCount");
const whatsappBotsCount = document.getElementById("whatsappBotsCount");
/*const menuToggle = document.getElementById("menuToggle");*/
const searchInput = document.getElementById("searchInput");
const startBotBtn = document.getElementById("startBotBtn");
const stopBotBtn = document.getElementById("stopBotBtn");
const restartBotBtn = document.getElementById("restartBotBtn");
const reloadBotBtn = document.getElementById("reloadBotBtn");
const deleteBotBtn = document.getElementById("deleteBotBtn");
const logoutBtn = document.getElementById("logoutBtn");

const botsTableBody = document.getElementById("botsTableBody");
const logsContainer = document.getElementById("logsContainer");


const offlineBotsCount =
document.getElementById("offlineBotsCount");

const totalBotsCount =
document.getElementById("totalBotsCount");

/** serverStatus: This element displays the current status of the backend server (ONLINE/OFFLINE).
activeBotsCount: This element shows the total number of active bots currently running.
telegramBotsCount: This element displays the count of Telegram bots that are active.
 * 
 */







/* =========================================================
   PAGE LOAD
========================================================= */

window.addEventListener("DOMContentLoaded", async () => {

    console.log("Dashboard Loaded");

    await initializeDashboard();

});


/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */

async function initializeDashboard() {
    console.log("Init took place.");
    
    try {

        await checkServerConnection();

        await Promise.all([
            fetchDashboardStats(),
            fetchBots(),
            fetchLogs()
        ]);
        console.log("Promise took place.");
        
        // Setup Event Listeners
        setupEventListeners(); // this should be called after fetching initial data to ensure buttons are available
        // Initialize Socket.IO
        initializeSocket(); // this should be called after fetching initial data to ensure socket is available
        // Start Auto Refresh
        startAutoRefresh();  // this should be called after fetching initial data to ensure auto refresh is available
        // Add Initial Log
        addLog("Dashboard initialized successfully");
        console.log("Dashboard Initialized");

    } catch (error) {

        console.error("Dashboard Initialization Failed:", error);

        addLog("Failed to initialize dashboard");

    }

}

/*==================================================================
**   TOGGLE MENU FUNCTION
* =================================================*/
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
});
/* =========================================================
   GENERIC API REQUEST
========================================================= */

async function apiRequest(endpoint, options = {}) {

    try {
        // GET JWT TOKEN FROM LOCAL STORAGE
        const token = getToken(); // this function should be defined to retrieve the token from localStorage
        
        const config = {
            headers: {
                "Content-Type": "application/json",
                ...(token && {
                    Authorization: `Bearer ${token}`
                })
            },
            ...options
        };
        console.log(`API Request: ${endpoint}`, config);
        

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {

            const errorData = await response.json().catch(() => ({}));

            throw new Error(errorData.message || "API Request Failed");

        }

        return await response.json();

    } catch (error) {

        console.error("API ERROR:", error.message);

        throw error;

    }

}


/* =========================================================
   FETCH DASHBOARD STATS
========================================================= */
/* This function fetches the dashboard statistics from the backend API and updates the UI accordingly.
 It also handles errors by showing the server offline status if the request fails.
 we will call this function in the initializeDashboard function */

async function fetchDashboardStats() {

    try {

        const data = await apiRequest("/dashboard/stats");

        updateDashboardStats(data);

    } catch (error) {

        showServerOffline();

    }

}


/* =========================================================
   UPDATE DASHBOARD STATS
========================================================= */
/* This function takes the dashboard statistics data and updates the corresponding UI elements.
It updates the server status, active bots count, telegram bots count, 
and whatsapp bots count based on the data received from the backend. */

function updateDashboardStats(data) {

    serverStatus.textContent = data.serverStatus || "OFFLINE";

    serverStatus.style.color =
        data.serverStatus === "ONLINE"
            ? "#22c55e"
            : "red";

    activeBotsCount.textContent = data.activeBots || 0; 


    telegramBotsCount.textContent = data.telegramBots || 0;

    whatsappBotsCount.textContent = data.whatsappBots || 0;

    
}


/* =========================================================
   SERVER OFFLINE
========================================================= */
/* This function is called when the server connection check fails or when fetching dashboard stats fails. 
It updates the server status text to "OFFLINE" and changes 
the color to red to indicate that the backend server is not reachable. */
function showServerOffline() {

    serverStatus.textContent = "OFFLINE";

    serverStatus.classList.remove("online-status");

    serverStatus.classList.add("offline-status");

    [startBotBtn,
        stopBotBtn,
        restartBotBtn,
        reloadBotBtn,
        deleteBotBtn
    ].forEach((btn) => {
            if (btn) {
                btn.disabled = true;
            }
    });


}


/* =========================================================
   FETCH BOTS
========================================================= */

async function fetchBots() {

    try {

        const bots = await apiRequest("/bots");

        botsData = Array.isArray(bots) ? bots : [];

        renderBotsTable();

    } catch (error) {

        showError("Failed to fetch bots");

    }

}


/* =========================================================
   RENDER BOTS TABLE
========================================================= */

function renderBotsTable(data = botsData) {

    botsTableBody.innerHTML = "";

    if (!data.length) {

        botsTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    No bots found
                </td>
            </tr>
        `;

        return;

    }

    data.forEach((bot) => {

        const row = document.createElement("tr");

        const statusClass =
            bot.status === "Running"
                ? "running-status"
                : "offline-status";

        row.innerHTML = `
            <td>${sanitizeHTML(bot.name)}</td>

            <td>${sanitizeHTML(bot.platform)}</td>

            <td>
                <span class="table-status ${statusClass}">
                    ${sanitizeHTML(bot.status)}
                </span>
            </td>

            <td>${sanitizeHTML(bot.uptime || "0m")}</td>

            <td>
                <button
                    class="table-btn"
                    onclick="viewBot('${bot._id}')">
                    View
                </button>
            </td>
        `;

        botsTableBody.appendChild(row);

    });

}


/* =========================================================
   VIEW BOT
========================================================= */

function viewBot(botId) {

    if (!botId) return;

    selectedBotId = botId;

    window.location.href = `bot-details.html?id=${botId}`;

}


/* =========================================================
   DELETE BOT
========================================================= */

async function deleteSelectedBot() {

    try {

        if (!selectedBotId) {

            return showError("No bot selected");

        }

        const confirmed = confirm("Delete selected bot?");

        if (!confirmed) return;

        await apiRequest(`/bots/${selectedBotId}`, {
            method: "DELETE"
        });

        showSuccess("Bot deleted successfully");

        await fetchBots();

    } catch (error) {

        showError("Failed to delete bot");

    }

}


/* =========================================================
   FETCH LOGS
========================================================= */

async function fetchLogs() {

    try {

        const logs = await apiRequest("/logs");

        logsData = Array.isArray(logs) ? logs : [];

        renderLogs();

    } catch (error) {

        showError("Failed to fetch logs");

    }

}


/* =========================================================
   RENDER LOGS
========================================================= */

function renderLogs() {

    logsContainer.innerHTML = "";

    logsData.forEach((log) => {

        const logDiv = document.createElement("div");

        logDiv.classList.add("log-entry");

        logDiv.textContent = `[${log.time || "--:--"}] ${log.message}`;

        logsContainer.appendChild(logDiv);

    });

    logsContainer.scrollTop = logsContainer.scrollHeight;

}


/* =========================================================
   ADD LOG
========================================================= */

function addLog(message) {

    if (!logsContainer) return;

    const logDiv = document.createElement("div");

    logDiv.classList.add("log-entry");

    const currentTime = new Date().toLocaleTimeString();

    logDiv.textContent = `[${currentTime}] ${message}`;

    logsContainer.appendChild(logDiv);

    logsContainer.scrollTop = logsContainer.scrollHeight;

}


/* =========================================================
   BOT ACTIONS
========================================================= */

async function startAllBots() {

    await executeBotAction({
        endpoint: "/bots/start",
        button: startBotBtn,
        loadingText: "Starting...",
        successMessage: "All bots started"
    });

}

async function stopAllBots() {

    await executeBotAction({
        endpoint: "/bots/stop",
        button: stopBotBtn,
        loadingText: "Stopping...",
        successMessage: "All bots stopped"
    });

}

async function restartAllBots() {

    await executeBotAction({
        endpoint: "/bots/restart",
        button: restartBotBtn,
        loadingText: "Restarting...",
        successMessage: "All bots restarted"
    });

}


/* =========================================================
   EXECUTE BOT ACTION
========================================================= */

async function executeBotAction({
    endpoint,
    button,
    loadingText,
    successMessage
}) {

    const originalText = button.innerHTML;

    try {

        showLoading(button, loadingText);

        await apiRequest(endpoint, {
            method: "POST"
        });

        showSuccess(successMessage);

        await fetchBots();

        await fetchDashboardStats();

    } catch (error) {

        showError(error.message);

    } finally {

        hideLoading(button, originalText);

    }

}


/* =========================================================
   RELOAD DASHBOARD
========================================================= */

async function reloadDashboard() {

    try {

        showLoading(reloadBotBtn, "Reloading...");

        await Promise.all([
            fetchDashboardStats(),
            fetchBots(),
            fetchLogs()
        ]);

        showSuccess("Dashboard reloaded");

    } catch (error) {

        showError("Dashboard reload failed");

    } finally {

        hideLoading(reloadBotBtn, "Reload");

    }

}


/* =========================================================
   SEARCH BOT
========================================================= */

function searchBot(botName = "") {

    if (!botName.trim()) {
        renderBotsTable();
        return;
    }

    const filteredBots = botsData.filter((bot) =>
        bot?.name?.toLowerCase().includes(botName.trim().toLowerCase())
    );

    renderBotsTable(filteredBots);

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEventListeners() {

    startBotBtn?.addEventListener("click", startAllBots);

    stopBotBtn?.addEventListener("click", stopAllBots);

    restartBotBtn?.addEventListener("click", restartAllBots);

    reloadBotBtn?.addEventListener("click", reloadDashboard);

    deleteBotBtn?.addEventListener("click", deleteSelectedBot);

    logoutBtn?.addEventListener("click", logoutAdmin);

    searchInput?.addEventListener("input", searchBot);


}


/* =========================================================
   LOGOUT
========================================================= */

function logoutAdmin() {

    localStorage.removeItem("token"); // Remove JWT token from localStorage

    localStorage.removeItem("admin"); // Remove admin info from localStorage

    if (socket) {

        socket.disconnect(); // Disconnect Socket.IO

    }

    addLog("Admin logged out"); // Add log entry for logout

    window.location.href = "login.html";  // Redirect to login page

    showSuccess("Logged out successfully");
    console.log("Admin logged out");

}


/* =========================================================
   AUTO REFRESH
========================================================= */

function startAutoRefresh() {

    clearInterval(autoRefreshInterval);

    autoRefreshInterval = setInterval(async () => {

        await fetchDashboardStats();


    }, 10000);

}


/* =========================================================
   CHECK SERVER CONNECTION
========================================================= */

async function checkServerConnection() {

    try {

        const response = await fetch(`${API_BASE_URL}/health`);

        if (!response.ok) {
            throw new Error("Server Offline");
        }

        serverOnline = true;

        serverStatus.textContent = "ONLINE";

        serverStatus.style.color = "#22c55e";

        console.log("Backend Connected");

    } catch (error) {

        serverOnline = false;

        showServerOffline();

        console.error("Backend Offline");

    }

}


/* =========================================================
   SOCKET.IO
========================================================= */

function initializeSocket() {

    if (typeof io === "undefined") {

        console.warn("Socket.IO not loaded");

        return;

    }

    socket = io(SOCKET_URL, {
        transports: ["websocket"]
    });

    socket.on("connect", () => {

        addLog("Realtime server connected");

    });

    socket.on("disconnect", () => {

        addLog("Realtime server disconnected");

    });

    socket.on("server-log", (data) => {

        addLog(data.message);

    });

    socket.on("bot-update", async () => {

        await fetchBots();

        await fetchDashboardStats();

    });

}


/* =========================================================
   JWT TOKEN
========================================================= */

function getToken() {

    return localStorage.getItem("token");

}


/* =========================================================
   AUTH GUARD
========================================================= */

function requireAuth() {

    const token = getToken();

    if (!token) {

        window.location.href = "login.html";

    }

}

requireAuth();


/* =========================================================
   SANITIZE HTML
========================================================= */

function sanitizeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   LOADING STATE
========================================================= */

function showLoading(button, text = "Loading...") {

    if (!button) return;

    button.disabled = true;

    button.dataset.originalText = button.innerHTML;

    button.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        ${text}
    `;

}


/* =========================================================
   HIDE LOADING
========================================================= */

function hideLoading(button, fallbackText = "Done") {

    if (!button) return;

    button.disabled = false;

    button.innerHTML =
        button.dataset.originalText || fallbackText;

}


/* =========================================================
   SUCCESS
========================================================= */

function showSuccess(message) {

    console.log("SUCCESS:", message);

    addLog(message);

}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    console.error("ERROR:", message);

    addLog(message);

}