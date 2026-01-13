"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrder = updateOrder;
exports.deleteOrder = deleteOrder;
exports.getOrders = getOrders;
exports.getSingleOrder = getSingleOrder;
const firebase_config_1 = require("../config/firebase.config");
const api_error_1 = require("../errors/api.error");
const ordersRef = firebase_config_1.db.collection("orders");
async function updateOrder(id, status) {
    const snapshot = await ordersRef.doc(id).get();
    if (!snapshot.exists)
        throw new api_error_1.AppError(404, "order not found");
    await ordersRef.doc(id).update({ status });
}
async function deleteOrder(id) {
    const order = await ordersRef.doc(id).get();
    if (!order.exists)
        throw new api_error_1.AppError(404, "order not found");
    await ordersRef.doc(id).delete();
}
async function getOrders(user) {
    const query = ordersRef;
    if (user.role !== "ADMIN") {
        query.where("userId", "==", user.sub);
    }
    else {
    }
    const snapshot = await query.get();
    const data = snapshot.docs.map(doc => {
        const document = doc.data();
        const { createdAt, ...rest } = document;
        return {
            id: doc.id,
            ...rest,
            createdAt: createdAt.toDate()
        };
    });
    return data;
}
async function getSingleOrder(id) {
    const order = await ordersRef.doc(id).get();
    if (!order.exists)
        throw new api_error_1.AppError(404, `order with id:${id} was not found`);
    return {
        id: order.id, ...order.data()
    };
}
