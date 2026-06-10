/* =========================================================
   COMMAND CENTER JS
   FRONTEND → BACKEND READY (NODE + MONGODB READY)

   FEATURES:
   ✅ CRUD Commands
   ✅ Prefix System (/ . ! ? #)
   ✅ Enable / Disable Toggle
   ✅ Bot Assignment
   ✅ Search + Filter
   ✅ Backend API Integration
   ✅ JWT Authentication Ready
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const API_BASE_URL = "http://localhost:5000/api";


/* =========================================================
   STATE
========================================================= */

let commands = [];
let bots = [];


/* =========================================================
   DOM ELEMENTS
========================================================= */

// Grid
const commandsGrid = document.getElementById("commandsGrid");

// Stats
const totalCommandsCount = document.getElementById("totalCommandsCount");
const enabledCommandsCount = document.getElementById("enabledCommandsCount");
const disabledCommandsCount = document.getElementById("disabledCommandsCount");

// Search / Filters
const searchInput = document.getElementById("commandSearchInput");
const platformFilter = document.getElementById("platformFilter");
const statusFilter = document.getElementById("statusFilter");

// Modal
const modalOverlay = document.getElementById("commandModalOverlay");
const openModalBtn = document.getElementById("openCommandModalBtn");
const closeModalBtn = document.getElementById("closeCommandModalBtn");

// Form
const commandForm = document.getElementById("commandForm");

const commandName = document.getElementById("commandName");
const commandPrefix = document.getElementById("commandPrefix");
const commandPlatform = document.getElementById("commandPlatform");
const commandCategory = document.getElementById("commandCategory");
const commandBot = document.getElementById("commandBot");
const commandResponse = document.getElementById("commandResponse");
const commandEnabled = document.getElementById("commandEnabled");


/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    console.log("Command Center Loaded 🚀");

    await loadCommands();
    await loadBots();

    setupEvents();

});


/* =========================================================
   LOAD COMMANDS
========================================================= */

async function loadCommands() {

    try {

        const res = await fetch(`${API_BASE_URL}/commands`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });

        commands = await res.json();

        renderCommands();
        updateStats();

    } catch (err) {

        console.error("Load Commands Error:", err);

    }

}


/* =========================================================
   LOAD BOTS (FOR DROPDOWN)
========================================================= */

async function loadBots() {

    try {

        const res = await fetch(`${API_BASE_URL}/bots`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });

        bots = await res.json();

        populateBotDropdown();

    } catch (err) {

        console.error("Load Bots Error:", err);

    }

}


/* =========================================================
   POPULATE BOT DROPDOWN
========================================================= */

function populateBotDropdown() {

    commandBot.innerHTML = `<option value="">Select Bot</option>`;

    bots.forEach(bot => {

        const option = document.createElement("option");

        option.value = bot._id;

        option.textContent = `${bot.name} (${bot.platform})`;

        commandBot.appendChild(option);

    });

}


/* =========================================================
   RENDER COMMANDS
========================================================= */

function renderCommands(filtered = commands) {

    commandsGrid.innerHTML = "";

    if (filtered.length === 0) {

        commandsGrid.innerHTML = `
            <div style="color:#94a3b8;text-align:center;padding:40px;">
                No commands found
            </div>
        `;

        return;

    }

    filtered.forEach(cmd => {

        const card = document.createElement("div");

        card.className = "command-card";

        const fullCommand = `${cmd.prefix}${cmd.command}`;

        card.innerHTML = `

            <div class="command-top">

                <div>

                    <div class="prefix-badge">
                        ${cmd.prefix}
                    </div>

                    <div class="command-name">
                        ${cmd.command}
                    </div>

                    <div class="platform-tag">
                        ${cmd.platform}
                    </div>

                </div>

            </div>


            <div class="category-badge">
                ${cmd.category}
            </div>


            <div class="command-response">
                ${cmd.response}
            </div>


            <div class="toggle-container">

                <span>
                    ${cmd.enabled ? "Enabled" : "Disabled"}
                </span>

                <label class="switch">

                    <input type="checkbox"
                        ${cmd.enabled ? "checked" : ""}
                        onchange="toggleCommand('${cmd._id}', this.checked)"
                    >

                    <span class="slider"></span>

                </label>

            </div>


            <div class="command-actions">

                <button class="edit-btn"
                    onclick="editCommand('${cmd._id}')">

                    Edit

                </button>

                <button class="delete-btn"
                    onclick="deleteCommand('${cmd._id}')">

                    Delete

                </button>

            </div>

        `;

        commandsGrid.appendChild(card);

    });

}


/* =========================================================
   CREATE COMMAND
========================================================= */

commandForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const data = {

        command: commandName.value,

        prefix: commandPrefix.value,

        platform: commandPlatform.value,

        category: commandCategory.value,

        botId: commandBot.value,

        response: commandResponse.value,

        enabled: commandEnabled.checked

    };

    try {

        const res = await fetch(`${API_BASE_URL}/commands`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
            },

            body: JSON.stringify(data)

        });

        const result = await res.json();

        if (res.ok) {

            closeModal();

            loadCommands();

            alert("Command created 🚀");

        } else {

            alert(result.message || "Error creating command");

        }

    } catch (err) {

        console.error(err);

    }

});


/* =========================================================
   TOGGLE COMMAND (ENABLE / DISABLE)
========================================================= */

async function toggleCommand(id, status) {

    try {

        await fetch(`${API_BASE_URL}/commands/${id}/toggle`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
            },

            body: JSON.stringify({ enabled: status })

        });

        loadCommands();

    } catch (err) {

        console.error(err);

    }

}


/* =========================================================
   DELETE COMMAND
========================================================= */

async function deleteCommand(id) {

    if (!confirm("Delete this command?")) return;

    try {

        await fetch(`${API_BASE_URL}/commands/${id}`, {

            method: "DELETE",

            headers: {
                Authorization: `Bearer ${getToken()}`
            }

        });

        loadCommands();

    } catch (err) {

        console.error(err);

    }

}


/* =========================================================
   SEARCH + FILTER
========================================================= */

function filterCommands() {

    let filtered = [...commands];

    const search = searchInput.value.toLowerCase();

    const platform = platformFilter.value;

    const status = statusFilter.value;

    if (search) {

        filtered = filtered.filter(c =>
            c.command.toLowerCase().includes(search)
        );

    }

    if (platform !== "All") {

        filtered = filtered.filter(c =>
            c.platform === platform
        );

    }

    if (status !== "All") {

        filtered = filtered.filter(c =>
            status === "Enabled"
                ? c.enabled
                : !c.enabled
        );

    }

    renderCommands(filtered);

}


/* =========================================================
   UPDATE STATS
========================================================= */

function updateStats() {

    totalCommandsCount.textContent = commands.length;

    enabledCommandsCount.textContent =
        commands.filter(c => c.enabled).length;

    disabledCommandsCount.textContent =
        commands.filter(c => !c.enabled).length;

}


/* =========================================================
   MODAL CONTROL
========================================================= */

function openModal() {

    modalOverlay.classList.add("active");

}

function closeModal() {

    modalOverlay.classList.remove("active");

    commandForm.reset();

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    openModalBtn.addEventListener("click", openModal);

    closeModalBtn.addEventListener("click", closeModal);

    searchInput.addEventListener("input", filterCommands);

    platformFilter.addEventListener("change", filterCommands);

    statusFilter.addEventListener("change", filterCommands);

}


/* =========================================================
   JWT TOKEN
========================================================= */

function getToken() {

    return localStorage.getItem("token");

}


/* =========================================================
   PLACEHOLDER FUNCTIONS (FOR LATER)
========================================================= */

function editCommand(id) {

    alert("Edit feature coming next 🚀");

}


/* =========================================================
   END
========================================================= */