import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/Users.js";

const compare = bcrypt.compare;
const sign = jwt.sign;

export const user_signup = async (req, res, next) => {
    res.status(200).json({
        message: "Signup successful",
        user_token: req.user,
    });
};

export const user_login = async (req, res, next) => {
    const email = req.body.email;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({error: "User not found"});
        }
        if (await compare(req.body.password, user.password)) {
            const userData = { id: user._id, email: user.email };
            const token = sign(userData, "TOP_SECRET");
            res.json({
                user_token: token,
                message: "Successfully loggedin",
                email: user.email,
            });
        }
        else return res.status(400).json({error: "Wrong credentials"});
    } catch (err) {
        return res.status(400).json({ error: err });
    }
};
