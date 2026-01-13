"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.deleteUser = deleteUser;
const firebase_config_1 = require("../config/firebase.config");
const api_error_1 = require("../errors/api.error");
async function createUser(userToCreate) {
    const { emailAddress, password, firstName, lastName } = userToCreate;
    const user = await firebase_config_1.auth.getUserByEmail(emailAddress);
    if (user)
        throw new api_error_1.AppError(400, undefined, { emailAddress: "a user already exists with this email" });
    try {
        const userRecord = await firebase_config_1.auth.createUser({
            email: emailAddress, displayName: `${firstName} ${lastName}`, password
        });
        await firebase_config_1.auth.setCustomUserClaims(userRecord.uid, { role: "USER" });
        const token = await firebase_config_1.auth.createCustomToken(userRecord.uid);
        return token;
    }
    catch (error) {
        throw new api_error_1.AppError(500, "unable to create user try again later");
    }
}
async function deleteUser(id, user) {
    const userRecord = await firebase_config_1.auth.getUser(id);
    if (!userRecord)
        throw new api_error_1.AppError(404, "user not found");
    if (user.role !== "ADMIN" && user.uid !== id)
        throw new api_error_1.AppError(403, "you can't delete an account that doesnt belong to you");
    try {
        await firebase_config_1.auth.deleteUser(id);
    }
    catch (error) {
        throw new api_error_1.AppError(500, "unable to delete user");
    }
}
