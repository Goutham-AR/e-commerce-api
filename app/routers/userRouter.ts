import express from "express";
import { deleteOtherUser, deleteUser, getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword } from "../controllers/userController";
import { authMiddleware, authorizePermission } from "../auth/authMiddleware";


export const userRouter = express.Router();


userRouter.use(authMiddleware);
userRouter.get("/", authorizePermission("admin"), getAllUsers);
userRouter.get("/showMe", showCurrentUser);
userRouter.patch("/updateUser", updateUser);
userRouter.patch("/updateUserPassword", updateUserPassword);
userRouter.route("/:id").get(getSingleUser).delete(authorizePermission("admin"), deleteOtherUser);
userRouter.delete("/deleteUser", deleteUser);