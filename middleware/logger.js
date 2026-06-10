/* =========================================================
   LOGGER MIDDLEWARE
   FILE: middleware/logger.js
========================================================= */

const authMiddleware = require('./authMiddleware');

/* =========================================================
   LOGGER
========================================================= */

const logger = (app) => {
    app.use((req, res, next) => {
        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
        );

        next();
    });
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
    logger,
    authMiddleware
};