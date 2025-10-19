import { RequestHandler } from "express";
import { AppError } from "src/errors/api.error";
import { checkoutSchemaV2 } from "src/schemas/checkout.schema";
import { checkout, getCheckout, } from "src/services/checkout.service";
import { UserPayload } from "src/types/user";
import { verifyToken } from "src/utils/verifyToken";


export const checkoutHandler: RequestHandler = async (req, res) => {
    const { success, data, error } = checkoutSchemaV2.safeParse(req.body)
    const bearer = req.headers["authorization"]
    let payload: UserPayload | undefined
    if (!success) throw new AppError(400, undefined, error)
    if (bearer) {
        const token = bearer.split(" ")[1]
        payload = await verifyToken(token, res) as unknown as UserPayload
    }
    const clientSecret = await checkout(data, payload)
    return res.json(clientSecret)
}

export const getCheckoutSessionHandler: RequestHandler = async (req, res) => {
    const sessionId = (req.query.sessionId as string) || ""
    await getCheckout(sessionId)
    return res.sendStatus(204)
}