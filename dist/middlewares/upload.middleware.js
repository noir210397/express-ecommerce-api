"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_config_1 = __importDefault(require("../config/multer.config"));
const uploader = multer_config_1.default.array("files", 10);
const fileUploadHandler = (req, res, next) => {
    uploader(req, res, (err) => {
        if (err) {
            req.areFilesValid = false;
            // A Multer error occurred when uploading.
        }
        else {
            req.areFilesValid = true;
        }
        next();
    });
};
exports.default = fileUploadHandler;
