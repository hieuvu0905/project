// src/validation/productValidation.ts
import { body } from "express-validator";

export const createProductValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("img").trim().notEmpty().withMessage("Image is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("sizes").isArray().withMessage("Sizes must be an array"),
  body("color").trim().notEmpty().withMessage("Color is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
  body("avaliableQuantity")
    .isInt({ min: 0 })
    .withMessage("Available quantity must be a non-negative integer"),
  body("flashSale").optional().isBoolean().withMessage("FlashSale must be a boolean"),
  body("gender").optional().isString().withMessage("Gender must be a string"),
  body("inStock").optional().isBoolean().withMessage("InStock must be a boolean"),
];
