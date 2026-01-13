"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdmin = exports.deleteUserHandler = exports.createUserHandler = void 0;
const firebase_config_1 = require("../config/firebase.config");
const api_error_1 = require("../errors/api.error");
const user_schema_1 = require("../schemas/user.schema");
const auth_service_1 = require("../services/auth.service");
const createUserHandler = async (req, res) => {
    const { success, data, error } = user_schema_1.createUserSchema.safeParse(req.body);
    if (!success) {
        throw new api_error_1.AppError(400, undefined, error);
    }
    const token = await (0, auth_service_1.createUser)(data);
    return res.json(token);
};
exports.createUserHandler = createUserHandler;
const deleteUserHandler = async (req, res) => {
    await (0, auth_service_1.deleteUser)(req.params.id, req.user);
    return res.sendStatus(204);
};
exports.deleteUserHandler = deleteUserHandler;
const checkAdmin = async (req, res) => {
    const { success, data } = user_schema_1.checkIsAdminSchema.safeParse(req.body);
    if (success) {
        const record = await firebase_config_1.auth.getUserByEmail(data.emailAddress);
        // return res.json(record)
        if (!record || record.customClaims?.role !== "ADMIN") {
            return res.sendStatus(400);
        }
        return res.sendStatus(200);
    }
    return res.sendStatus(400);
};
exports.checkAdmin = checkAdmin;
