"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCheckoutSessionHandler = exports.checkoutHandler = void 0;
const api_error_1 = require("../errors/api.error");
const checkout_schema_1 = require("../schemas/checkout.schema");
const checkout_service_1 = require("../services/checkout.service");
const verifyToken_1 = require("../utils/verifyToken");
const checkoutHandler = async (req, res) => {
    const { success, data, error } = checkout_schema_1.checkoutSchemaV2.safeParse(req.body);
    const bearer = req.headers["authorization"];
    let payload;
    if (!success)
        throw new api_error_1.AppError(400, undefined, error);
    if (bearer) {
        const token = bearer.split(" ")[1];
        payload = await (0, verifyToken_1.verifyToken)(token, res);
    }
    const clientSecret = await (0, checkout_service_1.checkout)(data, payload);
    return res.json(clientSecret);
};
exports.checkoutHandler = checkoutHandler;
const getCheckoutSessionHandler = async (req, res) => {
    const sessionId = req.query.sessionId || "";
    await (0, checkout_service_1.getCheckout)(sessionId);
    return res.sendStatus(204);
};
exports.getCheckoutSessionHandler = getCheckoutSessionHandler;
