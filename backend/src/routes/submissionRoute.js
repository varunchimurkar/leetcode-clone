import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { getAllsubmission, getAllsubmissionForProblem, getSubmissionForProblem } from "../controllers/submission.controller.js"



const submissionRoute = express.Router()

submissionRoute.get("/get-all-submission", authMiddleware, getAllsubmission)
submissionRoute.get("/get-submission/:problemId", authMiddleware, getSubmissionForProblem)
submissionRoute.get("/get-submissions-count/:problemId", authMiddleware, getAllsubmissionForProblem)


export default submissionRoute