import { ErrorRequestHandler } from "express";
import { ApiError } from "../errors/apiError";
import { StatusCodes } from "http-status-codes";
import multer from "multer";


export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    let apiError: ApiError;
    let multerError: multer.MulterError;

    if (err instanceof ApiError && (apiError = err as ApiError)) {
        return res.status(apiError.statusCode).json({ message: apiError.message });
    }
    if (err instanceof multer.MulterError && (multerError = err as multer.MulterError)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: `MulterError(${multerError.code}): ${multerError.message}`});
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: err.message });
}