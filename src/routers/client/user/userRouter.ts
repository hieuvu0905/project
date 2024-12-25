import express from "express";
import { body } from "express-validator";
import { validateRequestMiddleware, currentUserMiddleware,requireAuthMiddleware } from "../../../common/src";
import { signupController, login, updateUser } from "../../../controllers/client/user/userController";

const router = express.Router();

router.post(
    "/api/users/signup",
    [
        body("username").not().isEmpty().withMessage("Username is required"),
        body("email").isEmail().withMessage("Please provide a valid email"),
        body("password")
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage("Password must be between 4 and 20 characters"),
    ],
    validateRequestMiddleware,
    signupController
);

router.post(
    "/api/users/login",
    [
        body("email").isEmail().withMessage("Please provide a valid email"),
        body("password")
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage("Password must be between 4 and 20 characters"),
    ],
    validateRequestMiddleware,
    login,
    currentUserMiddleware,
);
router.post("/api/users/signout", (req, res) => {
    req.session = null; // Xóa session người dùng

    res.status(200).send({
        message: "Signed out successfully!",
    });
});
router.put(
    "/api/users/update",
    [
      body("username").not().isEmpty().withMessage("Username is required"),
      body("password")
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage("Password must be between 4 and 20 characters"),
    ],
    validateRequestMiddleware,
    updateUser,
    requireAuthMiddleware,
    
);
export { router as signupRouter };