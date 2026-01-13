"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createProductSchema = zod_1.default.object({
    name: zod_1.default.string("product name is required").trim().min(2).toLowerCase(),
    price: zod_1.default.coerce.number("price is required").positive("price must be a valid positive number").transform(val => {
        return Math.round(val * 100) / 100;
    }),
    quantity: zod_1.default.coerce.number("quantity is required").int("quantity must be a positive integer").positive("quantity must be a positive integer"),
    description: zod_1.default.string("description is required").trim().min(50, "description must have at least 50 characters").toLowerCase(),
    categories: zod_1.default.string("category is required").trim().toLowerCase().transform(val => val.split(",")),
});
exports.updateProductSchema = exports.createProductSchema.extend({
    deletedImages: zod_1.default.string().trim().transform(val => val.split(",")).optional().default([])
}).partial();
