import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
            trim: true,
        },
        barcode:{
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        category:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        },
       
        sellingPrice:{
            type: Number,
            required: true,
            min: 0,
        },
        currentStock:{
            type: Number,
            required: true,
            min: 0,
        },
        minimumStock:{
            type: Number,
            required: true,
           
        },
        unit:{
            type: String,
            required: true,
            trim: true,
        },
        supplier:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier"
        },
        active:{
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);


const Product = mongoose.model("Product", productSchema);

export default Product;