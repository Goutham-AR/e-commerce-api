import mongoose from "mongoose";
import { Readable, Writable, Stream } from "node:stream";
import fs from "fs";

import { ApiError } from "../errors/apiError";
import { StatusCodes } from "http-status-codes";
import { uploadsPath } from "../utils/fileIO";



export const connectDB = async (uri: string) => {
    try {
        await mongoose.connect(uri);
        console.log("Successfully connected to the database...");
    } catch (error) {
        console.error(error);
    }
}

export const createGridFSBucket = (name: string) => {
    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: name });
}

export const uploadToGridFS = (bucketName: string, filename: string, data: Buffer, cb: (id: string) => void) => {

    const readablePhotoStream = new Readable();
    readablePhotoStream.push(data);
    readablePhotoStream.push(null);

    let bucket = createGridFSBucket("photos");
    let uploadStream = bucket.openUploadStream(filename);
    const fileId = uploadStream.id;

    readablePhotoStream
        .pipe(uploadStream)
        .on("error", () => {
            throw new ApiError("Error uploading the file.", StatusCodes.INTERNAL_SERVER_ERROR);
        })
        .on("finish", () => {
            cb(fileId.toString());
        })
}

export const getFromGridFS = async (bucketName: string, fileId: string, w: Writable, cb: () => void) => {
    const id = new mongoose.Types.ObjectId(fileId);
    let bucket = createGridFSBucket(bucketName);
    let downloadStream = bucket.openDownloadStream(id);
    
    const write = fs.createWriteStream(uploadsPath + "/image.jpg");

    const data = await stream2buffer(downloadStream);

    return data;

    // downloadStream
    //     .pipe(w)
    //     .on("error", () => {throw new ApiError("Something Went wrong", StatusCodes.INTERNAL_SERVER_ERROR)})
    //     .on("end", cb)
}
 

async function stream2buffer(stream: Stream): Promise<Buffer> {

    return new Promise < Buffer > ((resolve, reject) => {
        
        const _buf = Array < any > ();

        stream.on("data", chunk => _buf.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(_buf)));
        stream.on("error", err => reject(`error converting stream - ${err}`));

    });
}