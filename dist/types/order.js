"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.updateOrderSchema = zod_1.default.object({
    status: zod_1.default.enum(["pending", "failed", "shipped", "delivered", "paid"])
});
