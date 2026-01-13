"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.querySchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.querySchema = zod_1.default.object({
    page: zod_1.default.coerce.number().int().positive("positive valid number is required if provided").optional().default(1),
    query: zod_1.default.string().optional(),
    pageSize: zod_1.default.coerce.number().int().positive("positive valid number is required if provided").optional()
});
