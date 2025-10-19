import { auth } from "src/config/firebase.config";
import { AppError } from "src/errors/api.error";
import { CreateUserType, SignInUserType } from "src/schemas/user.schema";
import { UserPayload } from "src/types/user";

export async function createUser(userToCreate: CreateUserType) {
    const { emailAddress, password, firstName, lastName } = userToCreate
    const user = await auth.getUserByEmail(emailAddress)
    if (user) throw new AppError(400, undefined, { emailAddress: "a user already exists with this email" })
    try {
        const userRecord = await auth.createUser({
            email: emailAddress, displayName: `${firstName} ${lastName}`, password
        })
        await auth.setCustomUserClaims(userRecord.uid, { role: "USER" })
        const token = await auth.createCustomToken(userRecord.uid)
        return token
    } catch (error) {
        throw new AppError(500, "unable to create user try again later")
    }
}
export async function deleteUser(id: string, user: UserPayload) {
    const userRecord = await auth.getUser(id)
    if (!userRecord) throw new AppError(404, "user not found")
    if (user.role !== "ADMIN" && user.uid !== id) throw new AppError(403, "you can't delete an account that doesnt belong to you")
    try {
        await auth.deleteUser(id)

    } catch (error) {
        throw new AppError(500, "unable to delete user")
    }
}
