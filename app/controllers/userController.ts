import { RequestHandler } from "express";
import { User } from "../models/User";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError, UnauthenticatedError, UnauthorizedError } from "../errors/apiError";
import { PayloadJWT, checkPermission, createJWT, createPayload, days } from "../utils/auth";



export const getAllUsers: RequestHandler = async (req, res, next) => {
    const users = await User.find({ role: "user" });
    res.status(StatusCodes.OK).json({ users });
}


export const getSingleUser: RequestHandler = async (req, res, next) => {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
        return next(new NotFoundError(`No user with the given id.`));
    }
    checkPermission(req.user as PayloadJWT, user.id);
    res.status(StatusCodes.OK).json(user);
}


export const showCurrentUser: RequestHandler = async (req, res, next) => {
    const { id } = req.user as PayloadJWT;
    if (!id) {
        return next(new BadRequestError(`No User currently logged in.`));
    }
    const user = await User.findById(id);
    if (!user) {
        return next(new NotFoundError(`User with id(${id}) does not exist.`));
    }
    
    res.status(StatusCodes.OK).json(req.user);
}


export const updateUser: RequestHandler = async (req, res, next) => {
    const { name, email } = req.body;
    if (!name || email) {
        return next(new BadRequestError(`Please provide the values to update`));
    }
    const { id } = req.user as PayloadJWT;
    const user = await User.findByIdAndUpdate(id, { name, email }, { new: true, runValidators: true });
    if (!user) {
        return next(new NotFoundError(`User not found in the db.`));
    }
    const payload = createPayload(user, user.id);
    const token = createJWT(payload);
    res.cookie("token", token, { httpOnly: true, expires: days(1) });
    res.status(StatusCodes.OK).json(payload);
}


export const updateUserPassword: RequestHandler = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return next(new BadRequestError(`Please provide both new and old password`));
    
    const { id } = req.user as PayloadJWT;

    const user = await User.findById(id);
    if (!user) {
        return next(new NotFoundError(`User does not exist.`));
    }
    const isOldPasswordValid = await user.comparePassword(oldPassword);
    if (!isOldPasswordValid) {
        return next(new UnauthenticatedError(`Wrong old password.`));
    }
    user.password = newPassword;
    await user.save();

    res.status(StatusCodes.OK).json("Password changed.");
};

export const deleteUser: RequestHandler = async (req, res, next) => {
    const { id } = req.user as PayloadJWT;
    deleteUserFromDb(id);
    res.cookie("token", "logout", { expires: days(0), httpOnly: true });
    res.status(StatusCodes.OK).json({ msg: "Deleted" });
};

export const deleteOtherUser: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    deleteUserFromDb(id);
    res.status(StatusCodes.OK).json({ msg: "Deleted" });
};



const deleteUserFromDb = async (userId: string) => {
    const user = await User.findOne({ _id: userId });
    if (!user) {
        throw new NotFoundError(`User(${userId}) does not exist`);
    }
    await user.deleteOne();
}
