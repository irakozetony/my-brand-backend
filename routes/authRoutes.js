import express from "express";
import passport from "passport";
import { authenticate } from "../auth/auth.js";
import { user_login, user_signup } from "../controllers/authController.js";
import authValidation from "../validations/authValidator.js";

const authRouter = express.Router();

authRouter.post(
    "/signup", authValidation,
    passport.authenticate("signup", { session: false }),
    user_signup
);

authRouter.post(
    "/login",
    user_login
);

export default authRouter;
