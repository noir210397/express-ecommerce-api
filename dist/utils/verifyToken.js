"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
const firebase_config_1 = require("../config/firebase.config");
async function verifyToken(token, res) {
    try {
        const payload = await firebase_config_1.auth.verifyIdToken(token);
    }
    catch (error) {
        if (res)
            return res.status(401).json({ message: "invalid or expired token" });
        throw error;
    }
}
