import Joi from "joi";

const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
const authSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().regex(passwordPattern).required(),
});

const authValidation = async (req, res, next) => {
    const value = authSchema.validate(req.body, { abortEarly: false });
    if (value.error) {
        return res.status(400).json({error: value.error.details});
    } else {
        next();
    }
};

export default authValidation;
