import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";


export const notFoundMiddleware: RequestHandler = (req, res) => {
    return res.status(StatusCodes.NOT_FOUND).send("Route does not exist.");
}

