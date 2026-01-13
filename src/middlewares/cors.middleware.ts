import cors, { CorsOptions } from 'cors';
const allowedUrls = process.env.ALLOWED_URLS
const whitelist = allowedUrls ? allowedUrls.split(",") : []

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
