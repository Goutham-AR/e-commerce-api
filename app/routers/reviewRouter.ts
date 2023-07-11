import express from "express";
import { createReview, deleteReview, getAllReview, getSingleReview, updateReview } from "../controllers/reviewController";
import { authMiddleware } from "../auth/authMiddleware";



export const reviewRouter = express.Router();



reviewRouter.route("/").get(getAllReview).post(authMiddleware, createReview);
reviewRouter.route("/:id").get(getSingleReview).patch(authMiddleware, updateReview).delete(authMiddleware, deleteReview);