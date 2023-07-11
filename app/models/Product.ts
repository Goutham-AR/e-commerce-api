import mongoose, { HydratedDocument, Model, Schema, SchemaType } from "mongoose";
import { SchemaBuilder } from "../utils/schemaUtils";
import { Review } from "./Review";



interface IProductDocument extends Document {
    name: string,
    price: number,
    description: string,
    image: string,
    category: string,
    company: string,
    colors: [string],
    featured: boolean,
    freeShipping: boolean,
    inventory: number,
    averageRating: number,
    numOfReview: number,
    user: mongoose.Schema.Types.ObjectId,
}

interface IProduct extends IProductDocument {}


interface IProductModel extends Model<IProduct> {

}



const productSchema = new mongoose.Schema<IProduct, IProductModel>({
    name: {
        type: String,
        required: [true, "Product's name should not be empty."],
        maxlength: [100, "Name cannot be more than 100 characters."]
    },
    price: {
        type: Number,
        required: [true, "Product's price should not be empty."],
        default: 0,
    },
    description: {
        type: String,
        required: [true, "Product's description should not be empty."],
        maxlength: [1000, "Name cannot be more than 1000 characters."]
    },
    image: {
        type: String,
        default: "/uploads/default.jpg"
    },
    category: {
        type: String,
        required: [true, "Product's category should not be empty"],
        enum: ["office", "kitchen", "bedroom", "fashion"],
    },
    company: {
        type: String,
        required: [true, "Product's company should not be empty"],
        enum: {
            values: ["adidas", "ikea", "liddy", "marcos"],
            message: "{VALUE} is not supported."
        }
    },
    colors: {
        type: [String],
        required: true,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    freeShipping: {
        type: Boolean,
        default: false,
    },
    inventory: {
        type: Number,
        required: true,
        default: 15
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    numOfReview: {
        type: Number,
        default: 0,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        required: true,
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

productSchema.virtual("reviews", {
    ref: "Review",
    localField: "_id",
    foreignField: "product",
    justOne: false,
});

productSchema.pre<HydratedDocument<IProduct>>("deleteOne", { document: true, query: false },  async function() {
    // await this.model("Review").deleteMany({});
    console.log("deleted");
    await Review.deleteMany({ product: this._id });
});


export const Product = mongoose.model<IProduct, IProductModel>("product", productSchema);