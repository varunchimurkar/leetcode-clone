import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { executecode } from "../controllers/executecode.controller.js"



const executionRoute = express.Router() 

executionRoute.post("/", authMiddleware, executecode)

export default executionRoute