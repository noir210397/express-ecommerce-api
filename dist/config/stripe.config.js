"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const key = process.env.STRIPE_API_KEY;
if (!key) {
    throw new Error("stripe api key is not defined");
}
const stripe = new stripe_1.default(key);
exports.default = stripe;
