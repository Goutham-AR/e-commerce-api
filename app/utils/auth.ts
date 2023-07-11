import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { config } from "./config";
import { IUserDocument } from "../models/User";
import { UnauthorizedError } from "../errors/apiError";



export interface PayloadJWT {
    name: string,
    id: string,
    role: string,
}

type CreatePayloadTypeF = (u: IUserDocument, id: string) => PayloadJWT;

export const createPayload: CreatePayloadTypeF = (user: IUserDocument, id: string) => {
    return {
        name: user.name,
        id: id,
        role: user.role,
    };
}

export const days = (n: number) => {
    const oneDay = 1000 * 60 * 60 * 24;
    return new Date(Date.now() + oneDay * n);
}


export const createJWT: (p: PayloadJWT) => string = (payload: PayloadJWT) => {

    const token = jwt.sign(
        payload,
        config.JWT_SECRET as string, 
        { expiresIn: config.JWT_LIFETIME });

    return token;

}


export const verifyJWT: (t: string) => PayloadJWT = (token: string) => {
    const payload = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload;
    return {
        name: payload.name,
        id: payload.id,
        role: payload.role,
    }
}


type CheckPermissionTypeF = (requestingUser: PayloadJWT, requestedResourceOwnerId: string) => void;
export const checkPermission: CheckPermissionTypeF = (requestingUser: PayloadJWT, requestedResourceOwnerId: string) => {
    if (requestingUser.role == "admin") return;
    if (requestingUser.id == requestedResourceOwnerId) return

    throw new UnauthorizedError(`Not authorized to access this route.`);
}

type ComparePasswordTypeF = (candidatePassword: string, hashedPassword: string) => Promise<boolean>;
export const comparePassword: ComparePasswordTypeF =  async (candidatePassword: string, hashedPassword: string) => {
    const isMatch = await bcrypt.compare(candidatePassword, hashedPassword);
    return isMatch;
}

export const hashPassword: (p: string) => Promise<string> = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    const p = await bcrypt.hash(password, salt);
    return p; 
};

