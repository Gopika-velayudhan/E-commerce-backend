const Joi = require("joi");

const joiUserSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phonenumber: Joi.number().min(10),
  userName: Joi.string().alphanum().min(3).max(20),
  password: Joi.string()
});

const joiproductSchema = Joi.object({
  title: Joi.string(),
  category: Joi.string(),
  Animal: Joi.string(),
  description: Joi.string(),
  image: Joi.string(),
  price:Joi.number()
});

module.exports = { joiUserSchema, joiproductSchema};