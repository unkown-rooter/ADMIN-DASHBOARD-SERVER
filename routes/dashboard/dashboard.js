const express = require("express");
const router = express.Router();

/* =========================
HEALTH CHECK
========================= */
router.get("/health", (req, res) => {
res.json({
status: "ONLINE",
message: "Dashboard API is working"
});
});

/* =========================
DASHBOARD STATS
========================= */
router.get("/stats", (req, res) => {
res.json({
serverStatus: "ONLINE",
activeBots: 5,
telegramBots: 3,
whatsappBots: 2
});
});

/* =========================
BOTS LIST
========================= */
router.get("/bots", (req, res) => {
res.json([
{
_id: "1",
name: "Bot Alpha",
platform: "Telegram",
status: "Running",
uptime: "12h"
},
{
_id: "2",
name: "Bot Beta",
platform: "WhatsApp",
status: "Stopped",
uptime: "0m"
}
]);
});

/* =========================
LOGS
========================= */
router.get("/logs", (req, res) => {
res.json([
{ time: "10:00", message: "Server started" },
{ time: "10:05", message: "Bot Alpha connected" },
{ time: "10:10", message: "Bot Beta stopped" }
]);
});

module.exports = router;
