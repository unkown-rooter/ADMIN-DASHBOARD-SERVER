/* =========================================================
   SETTINGS SYSTEM (BACKEND READY)
========================================================= */

const API_BASE_URL = "http://localhost:5000/api";


/* =========================================================
   ELEMENTS
========================================================= */

const saveBtn = document.getElementById("saveSettingsBtn");

const defaultPrefix = document.getElementById("defaultPrefix");

const logLevelSelect = document.getElementById("logLevelSelect");

const telegramToken = document.getElementById("telegramToken");

const whatsappKey = document.getElementById("whatsappKey");

const autoRestart = document.getElementById("autoRestart");

const enableLogs = document.getElementById("enableLogs");


/* =========================================================
   INIT LOAD
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadSettings();

});


/* =========================================================
   LOAD SETTINGS FROM BACKEND
========================================================= */

async function loadSettings() {

    try {

        const res = await fetch(`${API_BASE_URL}/settings`, {

            headers: {
                Authorization: `Bearer ${getToken()}`
            }

        });

        const data = await res.json();

        applySettings(data);

    } catch (err) {

        console.error("Settings load error:", err);

    }

}


/* =========================================================
   APPLY SETTINGS TO UI
========================================================= */

function applySettings(data) {

    if (!data) return;

    defaultPrefix.value = data.defaultPrefix || "/";

    logLevelSelect.value = data.logLevel || "info";

    telegramToken.value = data.telegramToken || "";

    whatsappKey.value = data.whatsappKey || "";

    autoRestart.checked = data.autoRestart || false;

    enableLogs.checked = data.enableLogs !== false;

}


/* =========================================================
   SAVE SETTINGS
========================================================= */

saveBtn.addEventListener("click", async () => {

    const payload = {

        defaultPrefix: defaultPrefix.value,

        logLevel: logLevelSelect.value,

        telegramToken: telegramToken.value,

        whatsappKey: whatsappKey.value,

        autoRestart: autoRestart.checked,

        enableLogs: enableLogs.checked

    };

    try {

        const res = await fetch(`${API_BASE_URL}/settings`, {

            method: "PUT",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${getToken()}`

            },

            body: JSON.stringify(payload)

        });

        if (res.ok) {

            alert("Settings saved 🚀");

        } else {

            alert("Failed to save settings");

        }

    } catch (err) {

        console.error(err);

    }

});


/* =========================================================
   JWT TOKEN
========================================================= */

function getToken() {

    return localStorage.getItem("token");

}


/* =========================================================
   SETTINGS MODEL (MONGODB READY)
========================================================= */

/*
{
    defaultPrefix: "/",

    logLevel: "info",

    telegramToken: "xxx",

    whatsappKey: "xxx",

    autoRestart: false,

    enableLogs: true
}
*/




/* =========================================================
   END
========================================================= */