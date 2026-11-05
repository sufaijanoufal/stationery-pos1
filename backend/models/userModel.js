import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: [true, "Please add a name"],
        trim: true,
    },
    username: {
        type: String,
        required: [true, "Please add a username"],      
        unique: true,
        trim: true,
    },
   password: {
    type: String,
    required: [true, "Please add a password"],
    select: false,
},
    role: {
        type: String,
        enum: ["admin", "staff"],
        default: "staff",
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

const User = mongoose.model("User", userSchema);

export default User;