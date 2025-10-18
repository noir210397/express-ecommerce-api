
import 'express-serve-static-core';
import { AccessTokenPayload } from './token';
import { UserPayload } from './user';

declare module 'express-serve-static-core' {
    interface Request {
        user?: UserPayload; // <-- your custom field
        areFilesValid?: boolean;
    }
}

