import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../configs/cloudinary.js";

const MIMETYPES = ["image/jpg", "image/jpeg", "image/png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const createCloudinaryStorage = (folderName) => {
    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: folderName,
            allowed_formats: ["jpg", "png", "jpeg", "webp", "gif"],
            transformation: [{ width: 1000, height: 1000, crop: "limit" }]
        }
    });
};

const createMulterConfig = (storage) => {
    return multer({
        storage: storage,
        fileFilter: (req, file, cb) => {
            if (MIMETYPES.includes(file.mimetype)) cb(null, true);
            else cb(new Error('Tipo de archivo no permitido'));
        },
        limits: {
            fileSize: MAX_FILE_SIZE
        }
    });
};

export const uploadProfilePicture = createMulterConfig(createCloudinaryStorage("perfil"));
export const uploadTeamLogo = createMulterConfig(createCloudinaryStorage("equipo"));
export const uploadPlayerPhoto = createMulterConfig(createCloudinaryStorage("foto_jugador"));
export const uploadGalleryImage = createMulterConfig(createCloudinaryStorage("galeria"));
