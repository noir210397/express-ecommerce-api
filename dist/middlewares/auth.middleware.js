"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
const firebase_config_1 = require("../config/firebase.config");
function authorize(allowedRoles) {
    const authMiddleware = async (req, res, next) => {
        try {
            if (!req.user) {
                const bearer = req.headers.authorization;
                if (!bearer)
                    return res.sendStatus(401);
                const token = bearer.split(" ")[1];
                if (!token)
                    return res.sendStatus(401);
                req.user = await firebase_config_1.auth.verifyIdToken(token);
            }
            if (!allowedRoles) {
                next();
            }
            else {
                const isAuthorized = allowedRoles.split(",").find((role) => role === req.user.role);
                if (!isAuthorized)
                    return res.sendStatus(401);
                next();
            }
        }
        catch (error) {
            return res.sendStatus(401);
        }
    };
    return authMiddleware;
}
