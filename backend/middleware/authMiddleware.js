import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async(req,res,next) => {
    
    try{
        let token;
        if(
            req.headers.authorization && 
            req.headers.authorization.startsWith("Bearer")
        ){
            token= req.headers.authorization.split(" ")[1];
        }
        if(!token) {
            return res.status(401).json({
                status: "fail",
                message : "You are not logged in",
            });
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if(!user || !user.active ) {
            return res.status(401).json({
                status:"fail",
                message:"User no longer exist or is inactive",
            });
        }
        req.user = user;

        next();
    } catch(error) {
        return res.status(401).json({
            status: "fail",
            message: "Invaild or expired token"
        });
    }
};

export const restrictTo = (...roles) => {
    return(req,res,next) => {
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: "fail",
                message: "You do not have permission to perform this action",
            });
        }

        next();
    };
};