import Joi from "joi";

const blogSchema = Joi.object({
    title: Joi.string().min(2).required(),
    content: Joi.string().min(10).required(),
});

const blogValidation = async (req, res, next) => {
    const value = blogSchema.validate(req.body, { abortEarly: false });
    if (value.error) {
        return res.status(400).json({ error: value.error.details });
    } else {
        next();
    }
};

export default blogValidation;
