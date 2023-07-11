import mongoose from "mongoose";



const orderSchema = new mongoose.Schema({
    tax: {
        type: Number
    },
    shippingFee: {
        type: Number,
    },
    subTotal: {
        type: Number
    },
    total: {
        type: Number,
    },
    orderItems: {
        type: []
    },
    status: {
        type: String,
        enum: ["Pending", "Delivered"]
    }
}, { timestamps: true });


export const Order = mongoose.model("Order", orderSchema);