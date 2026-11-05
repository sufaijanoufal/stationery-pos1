import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        quantity: {
            type: Number,
            required: true,
            min:1,
        },
        purchasePrice: {
            type: Number,
            required: true,
            min: 0,
    },
    total: {
        type: Number,
        required: true,
        min: 0,
    },
    },
    {_id: false }
);

const purchaseSchema = new mongoose.Schema(
    {
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            required: true,
        },
        invoiceNumber: {
            type: String,
            trim: true,
        },
        purchaseDate: {
            type: Date,
            default: Date.now,
        },
        items: {
            type: [purchaseItemSchema],
            required: true,
            validate:{
                validator: (items) => items.length > 0,
                message: "A purchase must have at least one item.",
            },
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        active: {
    type: Boolean,
    default: true,
},
    },
    {
        timestamps: true,
    }
);
        

const Purchase = mongoose.model("Purchase", purchaseSchema);

export default Purchase;