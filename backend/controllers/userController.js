import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; 
import {
    getAll,
    getOne,
    updateOne,
    deleteOne,
} from "./handlerFactory.js";

export const createUser = async (req, res,next) => {
    try {
        const { name, username, password ,role} = req.body;
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            name,
            username,
            password: hashedPassword,
            role
        });
    res.status(201).json({
  status: "success",
  data: {
    id: user._id,
    name: user.name,
    username: user.username,
    role: user.role,
  },
});
    } catch (error) {
    next(error);

    }
};
export const getAllUsers = getAll(User, {});   
export const getUser = getOne(User);

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Staff can update only their own account
    if (
      req.user.role === "staff" &&
      req.user._id.toString() !== req.params.id
    ) {
      return res.status(403).json({
        status: "fail",
        message: "You can only update your own account",
      });
    }

 // Allow admins to update user details and account status.
// Staff can update only their own name and username.
const { name, username, active } = req.body;

if (name !== undefined) {
  user.name = name;
}

if (username !== undefined) {
  user.username = username;
}

if (req.user.role === "admin" && active !== undefined) {
  if (typeof active !== "boolean") {
    return res.status(400).json({
      status: "fail",
      message: "Active must be true or false",
    });
  }

  // Prevent deactivating the last active admin.
  if (user.role === "admin" && active === false) {
    const activeAdminCount = await User.countDocuments({
      role: "admin",
      active: true,
    });

    if (activeAdminCount <= 1) {
      return res.status(403).json({
        status: "fail",
        message: "You cannot deactivate the last active admin",
      });
    }
  }

  user.active = active;
}

await user.save();

    res.status(200).json({
      status: "success",
      data: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide the new password and confirmation",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "New password and confirm password do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: "fail",
        message: "Password must be at least 6 characters long",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isOwnAccount =
      req.user._id.toString() === req.params.id;

    // Only admins can change another user's password.
    if (!isAdmin && !isOwnAccount) {
      return res.status(403).json({
        status: "fail",
        message: "You can only change your own password",
      });
    }

    const user = await User.findById(req.params.id).select("+password");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Require current password unless an admin is changing
    // another user's password.
    const adminChangingAnotherUser = isAdmin && !isOwnAccount;

    if (!adminChangingAnotherUser) {
      if (!currentPassword) {
        return res.status(400).json({
          status: "fail",
          message: "Please provide your current password",
        });
      }

      const isMatch = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isMatch) {
        return res.status(400).json({
          status: "fail",
          message: "Current password is incorrect",
        });
      }
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

 

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Prevent deleting the currently logged-in account.
    if (req.user._id.toString() === req.params.id) {
      return res.status(403).json({
        status: "fail",
        message: "You cannot delete your own account",
      });
    }

    // Prevent deleting the last active admin.
    if (user.role === "admin" && user.active !== false) {
      const activeAdminCount = await User.countDocuments({
        role: "admin",
        active: true,
      });

      if (activeAdminCount <= 1) {
        return res.status(403).json({
          status: "fail",
          message: "You cannot delete the last active admin",
        });
      }
    }

    // Check whether this user has any sales history.
    const Sale = (await import("../models/saleModel.js")).default;

    const hasSales = await Sale.exists({
      soldBy: user._id,
    });

    if (hasSales) {
      return res.status(400).json({
        status: "fail",
        message:
          "This user has sales history and cannot be permanently deleted. Deactivate the user instead.",
      });
    }

    await User.findByIdAndDelete(user._id);

    return res.status(200).json({
      status: "success",
      message: "User permanently deleted",
    });
  } catch (error) {
    next(error);
  }
};


export const loginUser = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                status: "fail",
                message: "Please provide username and password",
            });
        }

      const user = await User.findOne({
    username,
    active: true,
}).select("+password");

        if (!user) {
            return res.status(401).json({
                status: "fail",
                message: "Invalid username or password",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                status: "fail",
                message: "Invalid username or password",
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        res.status(200).json({
            status: "success",
            token,
            data: {
                id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};