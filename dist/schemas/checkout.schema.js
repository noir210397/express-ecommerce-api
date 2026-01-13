"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutSchemaV2 = exports.checkoutSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const index_1 = require("./index");
const checkoutItem = zod_1.default.object({
    id: index_1.validateId,
    quantity: zod_1.default.int("provide a valid integer").positive("provide a positive number")
});
exports.checkoutSchema = zod_1.default.object({
    items: zod_1.default.array(checkoutItem).min(1, "at least 1 item is required"),
    firstName: zod_1.default.string("first name is required").min(2),
    lastName: zod_1.default.string("last name is required").min(2),
    sameBillingAndShippingAddress: zod_1.default.boolean().default(false),
    billingAddress: index_1.addressSchema.optional(),
    shippingAddress: index_1.addressSchema,
    phoneNumber: zod_1.default.string("phone number is required").regex(/^(?:\+44|44|0)\d{9,10}$/, "please provide a valid UK phone number")
}).superRefine((val, ctx) => {
    const { sameBillingAndShippingAddress, billingAddress } = val;
    if (!sameBillingAndShippingAddress && !billingAddress) {
        ctx.addIssue({
            code: "custom",
            path: ["billingAddress"],
            message: "billing address is required when its not same as shipping address"
        });
    }
});
exports.checkoutSchemaV2 = zod_1.default.object({
    items: zod_1.default.array(checkoutItem).min(1, "at least 1 item is required"),
});
