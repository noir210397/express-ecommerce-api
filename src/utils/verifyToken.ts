import { Response } from "express";
import { auth } from "src/config/firebase.config";
import { UserPayload } from "src/types/user";

export async function verifyToken(token: string, res?: Response) {
    try {
        const payload = await auth.verifyIdToken(token)
    } catch (error) {
        if (res) return res.status(401).json({ message: "invalid or expired token" })
        throw error
    }
}