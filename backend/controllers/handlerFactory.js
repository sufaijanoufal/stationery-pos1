import catchAsync from "../utils/catchAsync.js";

export const createOne = (Model) => catchAsync(async (req, res) => {
    const document = await Model.create(req.body);
    res.status(201).json({
        status: "success",
        data: document,
    });
});


export const getAll = (Model, filter = { active: true }, populateOptions = "") =>
  catchAsync(async (req, res) => {
    let query = Model.find(filter);

    // Never return password hashes for users
    if (Model.modelName === "User") {
      query = query.select("-password");
    }

    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    const documents = await query;

    res.status(200).json({
      status: "success",
      results: documents.length,
      data: documents,
    });
  });

export const getOne = (Model, populateOptions = "") =>
  catchAsync(async (req, res) => {
    let query = Model.findById(req.params.id);

    // Never return password hashes for users
    if (Model.modelName === "User") {
      query = query.select("-password");
    }

    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    const document = await query;

    if (!document) {
      const error = new Error("Document not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: "success",
      data: document,
    });
  });





export const updateOne = (Model) => 
    catchAsync(async (req, res) => {
        const document = await Model.findByIdAndUpdate(
            req.params.id, req.body, {
                new: true,
                runValidators: true,
            }
        );

        if (!document) {
            const error = new Error("Document not found");
            error.statusCode = 404;
            throw error;
        }   

        res.status(200).json({
            status: "success",
            data: document,
        });
    });


    export const deleteOne = (Model) =>
    catchAsync(async (req, res) => {
        const document = await Model.findByIdAndUpdate(
            req.params.id, { active: false }, {
                new: true,
                runValidators: true,
            }
        );

        if (!document) {
            const error = new Error("Document not found");
            error.statusCode = 404;
            throw error;
        }   

        res.status(204).json({
            status: "success",
            message: "Document deleted successfully",
            data: document,
        });
    });