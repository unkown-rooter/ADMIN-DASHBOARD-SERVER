/* =========================================================
   LOG SYSTEM (REAL-TIME READY)
========================================================= */

const API_BASE_URL = "http://localhost:5000/api";


/* =========================================================
   DOM ELEMENTS
========================================================= */

const logsBox = document.getElementById("logsBox");
const clearBtn = document.getElementById("clearLogsBtn");
const searchInput = document.getElementById("logSearch");
const filterSelect = document.getElementById("logFilter");
const autoScroll = document.getElementById("autoScroll");


/* =========================================================
   STATE
========================================================= */

let logs = [];


/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    fetchLogs();

    setupEvents();

});


/* =========================================================
   FETCH LOGS FROM BACKEND
========================================================= */

async function fetchLogs() {

    try {

        const res = await fetch(`${API_BASE_URL}/logs`, {

            headers: {
                Authorization: `Bearer ${getToken()}`
            }

        });

        logs = await res.json();

        renderLogs();

    } catch (err) {

        console.error("Logs Error:", err);

    }

}


/* =========================================================
   RENDER LOGS
========================================================= */

function renderLogs(filtered = logs) {

    logsBox.innerHTML = "";

    filtered.forEach(log => {

        const div = document.createElement("div");

        div.className = `log-item log-${log.type}`;

        div.innerHTML = `

            <span class="log-time">

                [${formatTime(log.createdAt)}]

            </span>

            <span>

                ${log.message}

            </span>

        `;

        logsBox.appendChild(div);

    });

    if (autoScroll.checked) {

        logsBox.scrollTop = logsBox.scrollHeight;

    }

}


/* =========================================================
   FILTER LOGS
========================================================= */

function filterLogs() {

    let filtered = [...logs];

    const search = searchInput.value.toLowerCase();

    const type = filterSelect.value;

    if (search) {

        filtered = filtered.filter(l =>
            l.message.toLowerCase().includes(search)
        );

    }

    if (type !== "all") {

        filtered = filtered.filter(l =>
            l.type === type
        );

    }

    renderLogs(filtered);

}


/* =========================================================
   CLEAR LOGS (UI ONLY)
========================================================= */

clearBtn.addEventListener("click", () => {

    logsBox.innerHTML = "";

});


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    searchInput.addEventListener("input", filterLogs);

    filterSelect.addEventListener("change", filterLogs);

}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(date) {

    return new Date(date).toLocaleTimeString();

}


/* =========================================================
   JWT
========================================================= */

function getToken() {

    return localStorage.getItem("token");

}


/* =========================================================
   SOCKET READY (OPTIONAL FUTURE)
========================================================= */

/*

socket.on("log", (log) => {

    logs.push(log);

    renderLogs();

});

*/


/* =========================================================
   EXPECTED MONGODB MODEL
========================================================= */

/*

{
    message: "Bot started successfully",

    type: "success", // info | error | warning | success

    createdAt: Date
}

*/


/* =========================================================
   END
========================================================= */