import express, { NextFunction, Request, Response } from "express";
import { User } from "../../../models/User";
import { BadRequestError } from "../../../common/src/index";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import { faker } from "@faker-js/faker";
import { Password } from "../../../services/password.service";
import {
  NotFoundError,
  NotAuthorizedError,
  validateRequestMiddleware,
  currentUserMiddleware,
} from "../../../common/src";
import dotenv from "dotenv";
dotenv.config();


export const signupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;
    let { isAdmin, gender, address } = req.body;

    if (process.env.ADMIN_EMAIL === email) {
      isAdmin = true;
    }

    // Kiểm tra xem người dùng đã tồn tại hay chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError(
        "User with this email already exists. Please try another email."
      );
    }

    // Sử dụng dữ liệu ngẫu nhiên nếu không được cung cấp
    gender = gender || faker.person.sex();
    address = address || {
      street: faker.location.streetAddress(),
      houseNumber: faker.number.int(),
      zipCode: faker.location.zipCode(),
      state: faker.location.state(),
      country: faker.location.country(),
      phoneNumber: faker.phone.number(),
      additionalInfo: faker.location.secondaryAddress(),
    };

    // Tạo người dùng mới và lưu vào cơ sở dữ liệu
    const newUser = User.build({
      username,
      email,
      password,
      isAdmin,
      gender,
      address,
    });
    await newUser.save();

    // Ký JWT
    const jwtToken = jwt.sign(
      { id: newUser.id, isAdmin: newUser.isAdmin, email: newUser.email },
      process.env.SECRET_KEY!,
      { expiresIn: "14d" }
    );

    // Đính kèm JWT vào session
    req.session = { jwt: jwtToken };

    res.status(201).json({ message: "Success", token: jwtToken });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // check if user is registered or not
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError("You are not registered! Try to signup first.");
    }

    // validate password
    const isPasswordValid = Password.validatePassowrd(
      user.password,
      password
    );
    if (!isPasswordValid) {
      throw new NotAuthorizedError("Invalid credientials!");
    }

    // sign jwt
    const jwtToken = jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
        email: user.email,
        address: user.address,
      },
      process.env.SECRET_KEY!,
      {
        expiresIn: "14days",
      }
    );

    // attach the newly signed jwt token to session object
    req.session = {
      jwt: jwtToken,
    };

    res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
}
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { newusername, password, gender, address } = req.body;

  // Fetch user by id (assuming currentUser is added to the request object via middleware)
  const user = await User.findById(req.currentUser?.id);
  if (!user) {
    throw new NotFoundError("Failed to fetch the user!");
  }

  // Validate password
  const isPasswordValid = Password.validatePassowrd(user.password, password);
  if (!isPasswordValid) {
    throw new NotAuthorizedError("Invalid credentials!");
  }

  // Optional: Validate gender if needed
  const allowedGenders = ["Male", "Female", "Other"];
  if (gender && !allowedGenders.includes(gender)) {
    throw new NotAuthorizedError("Invalid gender provided!");
  }

  // Update user details
  user.set({
    username: newusername,
    gender: gender || user.gender, // If gender is not provided, keep the current gender
    address: address || user.address, // Similarly for address
  });

  // Save the updated user to the database
  await user.save();

  // Return updated user
  res.status(200).send(user);
};
