import { RequestHandler } from "express";
import { PayloadJWT } from "../utils/auth";
import { Product } from "../models/Product";
import { StatusCodes } from "http-status-codes";
import { ApiError, BadRequestError, NotFoundError } from "../errors/apiError";
import { createGridFSBucket, getFromGridFS, uploadToGridFS } from "../db/db";
import mongoose from "mongoose";




// TODO: should be able to handle image upload while creating the product
export const createProduct: RequestHandler = async (req, res, next) => {
    const { id } = req.user as PayloadJWT;
    req.body.user = id;
    const product = await Product.create(req.body);
    res.status(StatusCodes.CREATED).json(product);
}

export const getAllProduct: RequestHandler = async (req, res, next) => {
    const products = await Product.find({});
    res.status(StatusCodes.OK).json({ products });
}

export const getSingleProduct: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate("reviews");
    if (!product) {
        return next(new NotFoundError(`No product with id(${id}).`));
    }
    const data = await getFromGridFS("photos", product.image, res, () => {
        res.status(StatusCodes.OK).json(product);
    });
    console.log(data);

    res.status(StatusCodes.OK).json({ product, imageData: data });
}

export const updateProduct: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedProduct) {
        return next(new NotFoundError(`No product with id(${id}).`));
    }
    
    res.status(StatusCodes.OK).json(updatedProduct);
}

// ! Not deleting the image file from the db.
export const deleteProduct: RequestHandler = async (req, res, next) => {
    const { id } = req.params;

    const product = await Product.findOne({ _id: id });
    if (!product) {
        return next(new NotFoundError(`No product with id(${id}).`));
    }
    const bucket = createGridFSBucket("photos");
    await bucket.delete(new mongoose.Types.ObjectId(product.image));
    await product.deleteOne();
    res.status(StatusCodes.OK).json({ msg: "product deleted." });
}

// TODO: Should delete the previous image (if any) from the db 
export const uploadImage: RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findOne({ _id: id });
    if (!product) {
        return next(new NotFoundError(`No product with id(${id}).`));
    }
    const filename = req.body.name;
    if (!filename) {
        return next(new BadRequestError(`No image filename provided.`));
    }
    if (!req.file) {
        return next(new BadRequestError(`No image file provided.`));
    }
    const productImage = req.file as Express.Multer.File;
    if (!productImage.mimetype.startsWith("image")) {
        return next(new BadRequestError(`Please upload image.`));
    }

    uploadToGridFS(
        "photos", 
        filename, 
        productImage.buffer, 
        (fileId: string) => {
            product.image = fileId;
            product.save();
            return res.status(StatusCodes.CREATED).json({ message: "File uploaded successfully" });
        }
    );
    
}




export const deleteListOfProducts: RequestHandler = async (req, res, next) => {
    const list = req.body.list as string[];
    if (list.length == 0) {
        return next(new BadRequestError(`Please specify a list of products`));
    }
    const result = await Product.deleteMany({ _id: { $in: list } });
    if (!result.acknowledged) {
        return next(new ApiError(`Failed to delete the following products(${list}),`, StatusCodes.INTERNAL_SERVER_ERROR));
    }
    res.status(StatusCodes.OK).json({ msg: `deleted ${result.deletedCount} products`});
}
