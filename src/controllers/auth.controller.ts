import { RequestHandler } from "express";
import { auth } from "src/config/firebase.config";
import { AppError } from "src/errors/api.error";
import { checkIsAdminSchema, createUserSchema } from "src/schemas/user.schema";
import { createUser, deleteUser } from "src/services/auth.service";

export const createUserHandler: RequestHandler = async (req, res) => {
    const { success, data, error } = createUserSchema.safeParse(req.body)
    if (!success) {
        throw new AppError(400, undefined, error)
    }
    const token = await createUser(data)
    return res.json(token)
}

export const deleteUserHandler: RequestHandler = async (req, res) => {
    await deleteUser(req.params.id, req.user!)
    return res.sendStatus(204)
}
export const checkAdmin: RequestHandler = async (req, res) => {
    const { success, data } = checkIsAdminSchema.safeParse(req.body)
    if (success) {
        const record = await auth.getUserByEmail(data.emailAddress)
        // return res.json(record)
        if (!record || record.customClaims?.role !== "ADMIN") {
            return res.sendStatus(400)
        }
        return res.sendStatus(200)
    }
    return res.sendStatus(400)
}