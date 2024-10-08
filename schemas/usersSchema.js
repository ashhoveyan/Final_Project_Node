import Joi from 'joi';

export default {
    registration: Joi.object({
        username: Joi.string().min(1).max(25).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(32).required(),
    }),
    activate: Joi.object({
        key: Joi.string().min(1).max(200).required(),
    }),
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(32).required(),
    }),
    updateProfile: Joi.object({
        username: Joi.string().min(1).max(25).required(),
    }),
}