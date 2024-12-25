import express, { NextFunction, Request, Response } from "express";
import {
  BadRequestError,
  NotAuthorizedError,
} from "../../../common/src";
import { body } from "express-validator";
import { Product } from "../../../models/Product";

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentUser } = req;
  
      // Ensure user is an admin
      if (!currentUser?.isAdmin) {
        throw new NotAuthorizedError("You are not authorized to create products");
      }
  
      const {
        title,
        price,
        img,
        description,
        sizes,
        color,
        category,
        avaliableQuantity,
        flashSale,
        gender,
        inStock,
      } = req.body;
  
      // Check if the product already exists
      const existingProduct = await Product.findOne({ title });
      if (existingProduct) {
        throw new BadRequestError("Product with this title already exists");
      }
  
      // Build and save the new product
      const newProduct = Product.build({
        title,
        price,
        img,
        description,
        sizes,
        color,
        category,
        avaliableQuantity,
        flashSale,
        gender,
        inStock,
      });
  
      await newProduct.save();
  
      res.status(201).json({ message: "Product created successfully", product: newProduct });
    } catch (error) {
      next(error);
    }
  };