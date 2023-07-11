import { RequestHandler } from "express";
import { PayloadJWT, verifyJWT } from "../utils/auth";
import { UnauthenticatedError, UnauthorizedError } from "../errors/apiError";



export const authMiddleware: RequestHandler = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return next(new UnauthenticatedError(`Authentication Invalid.`));
    }

    try {
        const payload = verifyJWT(token);
        req.user = payload;
        return next();
    } catch (error) {
        return next(new UnauthenticatedError("Authentication Invalid"));
    }
};


export const authorizePermission: (...r: string[]) => RequestHandler = (...roles: string[]) => {
    return (req, res, next) => {
        const { role: userRole } = req.user as PayloadJWT;
        if (!roles.includes(userRole)) {
            return next(new UnauthorizedError(`Forbidden Route. Only ${roles} are allowed.`))
        }
        return next();
    }
}
