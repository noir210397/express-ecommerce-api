import { DecodedIdToken } from "firebase-admin/auth";

export interface UserPayload extends DecodedIdToken {
    role: "USER" | "ADMIN"
}