"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthMiddleware = adminAuthMiddleware;
const firebase_config_1 = require("../config/firebase.config");
const allowedUrls = process.env.ALLOWED_URLS;
const whitelist = allowedUrls ? allowedUrls.split(",") : [];
const ADMIN_ORIGIN = allowedUrls ? allowedUrls.split(",")[0] : ""; // replace with your admin site
async function adminAuthMiddleware(req, res, next) {
    const origin = req.headers.origin;
    // ✅ Everyone except the admin site just passes
    if (origin !== ADMIN_ORIGIN) {
        return next();
    }
    // ✅ Admin site but hitting an auth route → allow
    if (req.path.includes("auth")) {
        return next();
    }
    // 🛑 Admin site → token required
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.sendStatus(401);
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = (await firebase_config_1.auth.verifyIdToken(token));
        if (decoded.role !== "ADMIN") {
            return res.status(403).json({ message: "ADMINS ONLY" });
        }
        return next();
    }
    catch (err) {
        return res.status(403).json({ message: "ADMINS ONLY" });
    }
}
