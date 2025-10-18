import { v2 as cloudinary, UploadApiResponse } from "cloudinary"
import { AppError } from "src/errors/api.error"



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function uploadImagesToCloudinary(files: Buffer[]) {
    const imageUrls: string[] = [];

    for (const file of files) {
        const url = await new Promise<string>((resolve, reject) => {
            cloudinary.uploader
                .upload_stream({ folder: "vinzinee" }, (err, res) => {
                    if (err) return reject(new AppError(500, `unable to upload file: ${err.message}`));
                    if (!res?.secure_url) return reject(new AppError(500, "missing secure_url"));
                    resolve(res.secure_url);
                })
                .end(file);
        });
        imageUrls.push(url);
    }
    return imageUrls;
}

export default cloudinary

