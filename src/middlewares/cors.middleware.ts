import cors, { CorsOptions } from 'cors';
import { DOMAIN_NAMES } from 'src/constants/constants';

export const whitelist = [
    ...DOMAIN_NAMES
];

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

export default cors(corsOptions);
