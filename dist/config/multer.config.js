"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const ACCEPTED_IMAGE_MIMES = [
    "image/jpeg", // .jpg, .jpeg
    "image/png", // .png
    "image/jpg", // sometimes browsers send this, alias of image/jpeg
    "image/pjpeg", // old progressive JPEGs (some clients still emit this)
    "image/x-png" // legacy alias for PNG
];
const multerConfig = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // keep images size < 5 MB
    },
    fileFilter(req, file, cb) {
        if (!ACCEPTED_IMAGE_MIMES.includes(file.mimetype)) {
            cb(new Error("invalid file type"));
        }
        else
            cb(null, true);
    },
});
exports.default = multerConfig;
