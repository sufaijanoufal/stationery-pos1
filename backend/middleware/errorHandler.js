export const globalErrorHandler = (err, req, res, next) => {
    console.error(err);

    let statusCode = err.statusCode || 500;
let message = err.message || "Something went wrong";

    // invalid id Mongoose ObjectId error
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

   
    // Mongoose validation errors
    if (err.name === "ValidationError") {
        statusCode = 400;

        const validationMessages = Object.values(err.errors || {})
            .map((error) => error.message);

        message = validationMessages.length
            ? validationMessages.join(". ")
            : "Invalid input. Please check your data.";
    }

    // duplicate key error
  
if (err.code === 11000) {
  statusCode = 409;

  const duplicateField = Object.keys(
    err.keyValue || {}
  )[0];

  if (duplicateField === "barcode") {
    message = "Barcode already exists";
  } else if (duplicateField === "username") {
    message = "Username already exists";
  } else {
    message = duplicateField
      ? `${duplicateField} already exists`
      : "Duplicate value already exists";
  }
}



    res.status(statusCode).json({
        status: "error",
        message,
    });
};