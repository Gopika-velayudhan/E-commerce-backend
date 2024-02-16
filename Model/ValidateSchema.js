const Joi = require("joi");

const joiUserSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phonenumber: Joi.number().min(10),
  userName: Joi.string().alphanum().min(3).max(20),
  password: Joi.string().required(),
});

const joiproductSchema = Joi.object({
  id: Joi.string(),
  title: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().positive(),
  image: Joi.string(),
  category: Joi.string(),
});

module.exports = { joiUserSchema, joiproductSchema};