import { RequestHandler } from "express";
import { auth } from "src/config/firebase.config";
import { UserPayload } from "src/types/user";
function authorize(allowedRoles?: string) {

    const authMiddleware: RequestHandler = async (req, res, next) => {
        try {
            if (!req.user) {
                const bearer = req.headers.authorization
                if (!bearer) return res.sendStatus(401)
                const token = bearer.split(" ")[1]
                if (!token) return res.sendStatus(401)
                req.user = await auth.verifyIdToken(token) as UserPayload
            }
            if (!allowedRoles) {
                next()
            }
            else {
                const isAuthorized = allowedRoles.split(",").find((role) => role === req.user!.role)
                if (!isAuthorized) return res.sendStatus(401)
                next()
            }
        } catch (error) {
            return res.sendStatus(401)
        }

    }
    return authMiddleware
}
export { authorize }