"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIsAdminSchema = exports.signInuserSchema = exports.createUserSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createUserSchema = zod_1.default.object({
    firstName: zod_1.default.string("first name is required").trim().min(2),
    lastName: zod_1.default.string("last name is required").trim().min(2),
    emailAddress: zod_1.default.email("email address is required"),
    password: zod_1.default.string().regex(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/, "Password must be at least 8 characters, include 1 number, 1 uppercase letter, and 1 special character")
});
exports.signInuserSchema = exports.createUserSchema.pick({ emailAddress: true, password: true });
exports.checkIsAdminSchema = exports.createUserSchema.pick({ emailAddress: true });
