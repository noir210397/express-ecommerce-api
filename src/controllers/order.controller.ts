import { RequestHandler } from "express";
import { AppError } from "src/errors/api.error";
import { deleteOrder, getOrders, getSingleOrder, updateOrder, } from "src/services/order.service";
import { updateOrderSchema } from "src/types/order";

export const getOrdersHandler: RequestHandler = async (req, res) => {
    const orders = await getOrders(req.user!)
    return res.json(orders)
}
export const getSingleOrderHandler: RequestHandler = async (req, res) => {
    const order = await getSingleOrder(req.params.id)
    return res.json(order)
}
export const updateOrderHandler: RequestHandler = async (req, res) => {
    const { success, data, error } = updateOrderSchema.safeParse(req.body)
    if (!success) {
        throw new AppError(400, undefined, error)
    }
    await updateOrder(req.params.id, data.status)
    return res.sendStatus(204)
}
export const deleteOrderHandler: RequestHandler = async (req, res) => {
    await deleteOrder(req.params.id)
    return res.sendStatus(204)
}
