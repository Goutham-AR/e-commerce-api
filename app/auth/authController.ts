import { RequestHandler } from "express";

import { IUserDocument, User, insertUser } from "../models/User";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnauthenticatedError } from "../errors/apiError";
import { PayloadJWT, comparePassword, createJWT, createPayload, days, hashPassword } from "../utils/auth";

import { TypedRequestBody } from "zod-express-middleware";
import { userRegisterSchema } from "../express/reqBodySchema";

export const register: RequestHandler = async (req: TypedRequestBody<typeof userRegisterSchema>, res, next) => {
    const userData: IUserDocument = req.body;
    const emailAlreadyExist = await User.findOne({ email: userData.email });
    if (emailAlreadyExist) {
        return next(new BadRequestError(`Email (${userData.email}) is already registered.`));
    }
    userData.password = await hashPassword(userData.password);
    // const user = await User.create(req.body);
    const userId = await insertUser(userData);
    const payload = createPayload(userData, userId);
    const token = createJWT(payload);

    res.cookie("token", token, { httpOnly: true, expires: days(1) });    
    res.status(StatusCodes.CREATED).json(payload);
}



export const login: RequestHandler = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new BadRequestError(`Invalid Credentials.`));
    }
    const user = await User.findOne({ email });
    if (!user) {
        return next(new UnauthenticatedError(`${email} is not yet registered.`));
    }
    const isPasswordSame = await comparePassword(password, user.password);
    if (!isPasswordSame) {
        return next(new UnauthenticatedError(`Invalid password.`));
    }
    const payload = createPayload(user, user.id);
    const token = createJWT(payload);

    res.cookie("token", token, { expires: days(1), httpOnly: true });
    res.status(StatusCodes.OK).json({ user: payload });
}



export const logout: RequestHandler = async (req, res, next) => {
    res.cookie("token", "logout", { expires: days(0), httpOnly: true });
    res.status(StatusCodes.OK).json("logged out.");
}