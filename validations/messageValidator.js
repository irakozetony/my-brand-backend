import Joi from "joi";

const phonePattern =
    /^$|^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
const messageSchema = Joi.object({
    first_name: Joi.string().min(2).required(),
    last_name: Joi.string().min(2).required(),
    mail: Joi.string().email().required(),
    phone: Joi.string().regex(phonePattern).allow(null, ""),
    message: Joi.string().min(2),
});

const messageValidation = async(req, res, next)=>{
    const value = messageSchema.validate(req.body, {abortEarly: false});
    if(value.error){
        return res.status(400).json({error: value.error.details});
    }
    else{
        next();
    }
}

export default messageValidation
