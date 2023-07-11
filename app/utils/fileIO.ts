import multer from "multer";
import path from "path";


export const uploadsPath = path.resolve(process.cwd(), `app/public/uploads/`); 

export enum MulterStorageType {
    disk,
    memory
}

// TODO: add options.
export const setupMulter = (type: MulterStorageType) => {
    let storage: multer.StorageEngine;
    if (type === MulterStorageType.disk) {
        storage = multer.diskStorage({ 
            destination: path.resolve(process.cwd(), `app/public/uploads/`),
            filename: (req, file, cb) => {
                cb(null, file.originalname);
            }
        });                
    } else {
        storage = multer.memoryStorage();
    }

    return multer({ storage });
}




