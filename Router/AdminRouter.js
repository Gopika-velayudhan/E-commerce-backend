const express = require("express")
const router = express.Router()
const admincontroler = require("../Controller/Admincontroller")
const tryCatchMiddleware = require("../Middlewares/trycatch")
const verifyTocken = require("../Middlewares/Adminauth")

