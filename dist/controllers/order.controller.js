"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrderHandler = exports.updateOrderHandler = exports.getSingleOrderHandler = exports.getOrdersHandler = void 0;
const api_error_1 = require("../errors/api.error");
const order_service_1 = require("../services/order.service");
const order_1 = require("../types/order");
const getOrdersHandler = async (req, res) => {
    const orders = await (0, order_service_1.getOrders)(req.user);
    return res.json(orders);
};
exports.getOrdersHandler = getOrdersHandler;
const getSingleOrderHandler = async (req, res) => {
    const order = await (0, order_service_1.getSingleOrder)(req.params.id);
    return res.json(order);
};
exports.getSingleOrderHandler = getSingleOrderHandler;
const updateOrderHandler = async (req, res) => {
    const { success, data, error } = order_1.updateOrderSchema.safeParse(req.body);
    if (!success) {
        throw new api_error_1.AppError(400, undefined, error);
    }
    await (0, order_service_1.updateOrder)(req.params.id, data.status);
    return res.sendStatus(204);
};
exports.updateOrderHandler = updateOrderHandler;
const deleteOrderHandler = async (req, res) => {
    await (0, order_service_1.deleteOrder)(req.params.id);
    return res.sendStatus(204);
};
exports.deleteOrderHandler = deleteOrderHandler;
