import { db } from "../libs/db.js"

export const getAllsubmission = async (req, res) => {

    try {
        const userId = req.user.userId

        const submission = await db.submission.findMany({
            where: {
                userId: userId
            }
        })

        res.status(200).json({
            success: true,
            message: "Submission fetched successfully",
            submission
        })


    } catch (error) {
        console.error("Fetch submissions Error:", error)
        res.status(500).json({
            error: "Failed to fetch submission"
        })

    }



}

export const getSubmissionForProblem = async (req, res) => {

    try {

        const userId = req.user.id
        const problemId = req.params.problemId
        const submissions = await db.submission.findMany({
            where: {
                userId: userId,
                problemId: problemId

            }
        })

        res.status(200).json({
            success: true,
            message: "Submission fetched successfully",
            submissions
        })

    } catch (error) {
        console.error("Fetch submissions Error:", error)
        res.status(500).json({
            error: "Failed to fetch submission"
        })
    }

}

export const getAllsubmissionForProblem = async (req, res) => {
    try {
        const problemId = req.params.problemId
        const submission = await db.submission.count({
            where: {
                problemId: problemId
            }
        })
        res.status(200).json({
            success: true,
            message: "Submission fetched successfully",
            count: submission
        })

    } catch (error) {
        console.error("Fetch submissions Error:", error)
        res.status(500).json({
            error: "Failed to fetch submission"
        })
    }
}