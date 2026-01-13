"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressSchema = exports.validateId = void 0;
const zod_1 = __importDefault(require("zod"));
exports.validateId = zod_1.default.string("provide a valid Id").regex(/^[A-Za-z0-9]{20}$/, "Invalid Firestore auto ID");
const ukPostcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
exports.addressSchema = zod_1.default.object({
    postCode: zod_1.default.string()
        .trim()
        .regex(ukPostcodePattern, "Invalid UK postcode"),
    streetAddress: zod_1.default
        .string()
        .trim()
        .min(1, "Street address is required"),
    town: zod_1.default
        .string()
        .trim()
        .min(1, "Town is required")
});
