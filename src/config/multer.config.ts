import multer from "multer";

const ACCEPTED_IMAGE_MIMES = [
    "image/jpeg",   // .jpg, .jpeg
    "image/png",    // .png
    "image/jpg",    // sometimes browsers send this, alias of image/jpeg
    "image/pjpeg",  // old progressive JPEGs (some clients still emit this)
    "image/x-png"   // legacy alias for PNG
];

const multerConfig = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // keep images size < 5 MB
    },
    fileFilter(req, file, cb) {
        if (!ACCEPTED_IMAGE_MIMES.includes(file.mimetype)) {
            cb(new Error("invalid file type"))
        }
        else cb(null, true)
    },

});

export default multerConfig