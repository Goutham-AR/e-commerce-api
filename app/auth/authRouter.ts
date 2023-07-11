import express from "express";
import { login, logout, register } from "./authController";
import { processRequest, processRequestBody } from "zod-express-middleware";
import { userRegisterSchema } from "../express/reqBodySchema";



export const authRouter = express.Router();


authRouter.post("/register", processRequestBody(userRegisterSchema), register);
authRouter.post("/login", login);
authRouter.get("/logout", logout);