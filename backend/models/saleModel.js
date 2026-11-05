import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true  ,
    },
    quantity:{
        type: Number,
        required: true,
        min:1,
    },
    sellingPrice:{
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
{_id: false}
);

const saleSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        trim: true,
    },
    saleDate: {
        type: Date,
       default: Date.now,
    },
    items:{
        type: [saleItemSchema],
        required: true,
        validate: {
            validator:(items) => items.length > 0,
            message: 'Sale must have at least one item.',   
        },
    
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
paymentMethod: {
    type: String,
    enum: ["Cash", "GPay"],
    default: "Cash",
    required: true,
},
    active:{
        type: Boolean,
        default:true,
    },
     soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
},

},
{
  timestamps: true
}
);

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;