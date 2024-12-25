import express from "express";
import { currentUserMiddleware, requireAuthMiddleware, validateRequestMiddleware } from "../../common/src";
import { createProductValidation } from "../../common/src";
import { createProduct } from "../../controllers/admin/product/createProduct.Controller";

const router = express.Router();

// Create product router
router.post(
  "/api/admin/products/create",
  currentUserMiddleware,
  requireAuthMiddleware,
  createProductValidation,
  validateRequestMiddleware,
  createProduct
);

export { router as createProductRouter };