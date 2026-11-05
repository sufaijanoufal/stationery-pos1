import Supplier from "../models/supplierModel.js";

import { createOne, getAll, getOne, updateOne, deleteOne } from "./handlerFactory.js";

export const createSupplier = createOne(Supplier);
export const getAllSuppliers = getAll(Supplier);
export const getSupplier = getOne(Supplier);        
export const updateSupplier = updateOne(Supplier);
export const deleteSupplier = deleteOne(Supplier);