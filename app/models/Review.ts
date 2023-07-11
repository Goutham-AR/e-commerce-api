import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import { Product } from "./Product";
import { ApiError } from "../errors/apiError";

interface IReviewDocument extends Document {
    rating: number,
    title: string,
    comment: string,
    user: Schema.Types.ObjectId,
    product: Schema.Types.ObjectId,
}

interface IReview extends IReviewDocument {

}


// type ReviewModel = Model<IReview>;

interface IReviewModel extends Model<IReview> {
}



const reviewSchema = new mongoose.Schema<IReview, IReviewModel>({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, "Please provide a rating"]
    },
    title: {
        type: String,
        trim: true,
        required: [true, "Please provide a title"],
        maxlength: 100
    },
    comment: {
        type: String,
        trim: true,
        required: [true, "Please provide a comment."],
    },
    user: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "users"
    },
    product: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "product"
    }
}, { timestamps: true });


reviewSchema.index({ product: 1, user: 1 }, { unique: true });


async function calculateAvgRating(productId: Schema.Types.ObjectId) {
    const result = await Review.aggregate([
        {
            $match: { product: productId }
        },
        {
            $group: 
            { 
                _id: null, 
                averageRating: { $avg: "$rating" }, 
                numOfReview: { $sum: 1 } 
            }
        }
    ]);
    console.log(result);

    try {
        await Product.findOneAndUpdate(
            { _id: productId },
            { 
                averageRating: Math.ceil(result[0]?.averageRating || 0),
                numOfReview: result[0]?.numOfReview || 0, 
            }
        );
    } catch (error) {
        throw error;
    }

};

reviewSchema.post("save", async function() {
    await calculateAvgRating(this.product);
});

reviewSchema.post("deleteOne", { document: true, query: false }, async function() {
    await calculateAvgRating(this.product);
});






export const Review = mongoose.model<IReview, IReviewModel>("Review", reviewSchema);
