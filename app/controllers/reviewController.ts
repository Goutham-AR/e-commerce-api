import { RequestHandler } from "express";
import { PayloadJWT, checkPermission } from "../utils/auth";
import { Review } from "../models/Review";
import { StatusCodes } from "http-status-codes";
import { Product } from "../models/Product";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../errors/apiError";

export const createReview: RequestHandler = async (req, res, next) => {
    const { product: productId } = req.body;
    const { id: userId } = req.user as PayloadJWT;

    const isValidProduct = await Product.findById(productId);
    if (!isValidProduct) {
        return next(new NotFoundError(`No product with id(${productId})`));
    }

    const alreadySubmitted = await Review.findOne({ product: productId, user: userId });
    if (alreadySubmitted) {
        return next(new BadRequestError(`Already submitted a review.`));
    }
    
    req.body = { ...req.body, user: userId }
    const review = await Review.create(req.body);
    res.status(StatusCodes.CREATED).json(review);
}


export const getAllReview: RequestHandler = async (req, res, next) => {
    const reviews = await Review.find({}).populate({ path: "product user", select: "name company price role"});
    res.status(StatusCodes.OK).json({ reviews });
}


export const getSingleReview: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
        return next(new NotFoundError(`No Review exist with id(${id}).`));
    }
    res.status(StatusCodes.OK).json(review);
}


export const updateReview: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const { rating, title, comment } = req.body;
    const { id: user } = req.user as PayloadJWT;

    const review = await Review.findOne({ _id: id });
    if (!review) {
        return next(new NotFoundError(`No Review exist with id(${id})`));
    }
    
    review.rating = rating;
    review.title = title;
    review.comment = comment;

    await review.save();
    
    res.status(StatusCodes.OK).json(review);
}


export const deleteReview: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const { id: userId } = req.user as PayloadJWT;
    const review = await Review.findOne({ _id: id });
    if (!review) {
        return next(new NotFoundError(`No review exist with id(${id}).`));
    }
    checkPermission(req.user as PayloadJWT, review.user.toString());
    await review.deleteOne();
    res.status(StatusCodes.OK).send("deleted");
}