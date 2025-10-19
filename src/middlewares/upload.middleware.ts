import multerConfig from "src/config/multer.config";
import { NextFunction, Request, Response } from "express"

const uploader = multerConfig.array("files", 10)

const fileUploadHandler = (req: Request, res: Response, next: NextFunction) => {
    uploader(req, res, (err) => {
        if (err) {
            req.areFilesValid = false
            // A Multer error occurred when uploading.
        }
        else {
            req.areFilesValid = true
        }
        next()
    })
}
export default fileUploadHandler
