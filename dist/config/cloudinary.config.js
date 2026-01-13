"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImagesToCloudinary = uploadImagesToCloudinary;
const cloudinary_1 = require("cloudinary");
const api_error_1 = require("../errors/api.error");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
async function uploadImagesToCloudinary(files) {
    const imageUrls = [];
    for (const file of files) {
        const url = await new Promise((resolve, reject) => {
            cloudinary_1.v2.uploader
                .upload_stream({ folder: "vinzinee" }, (err, res) => {
                if (err)
                    return reject(new api_error_1.AppError(500, `unable to upload file: ${err.message}`));
                if (!res?.secure_url)
                    return reject(new api_error_1.AppError(500, "missing secure_url"));
                resolve(res.secure_url);
            })
                .end(file);
        });
        imageUrls.push(url);
    }
    return imageUrls;
}
exports.default = cloudinary_1.v2;
