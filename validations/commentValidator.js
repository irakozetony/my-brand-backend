import Joi from "joi";

const commentSchema = Joi.object({
    author: Joi.string().min(2).max(8).required(),
    message: Joi.string().min(2).required(),
});

const commentValidation = async (req, res, next) => {
    const value = await commentSchema.validate(req.body, {abortEarly: false});
    if (value.error) {
        return res.status(400).json({error: value.error.details});
    } else {
        next();
    }
};

export default commentValidation;
