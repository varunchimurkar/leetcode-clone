import { db } from "../libs/db.js"
import { getJudge0LanguageId, submitBatch } from "../libs/judge0.lib.js"
import { pollBatchResults } from "../libs/judge0.lib.js"


export const createProblem = async (req, res) => {
    const { title, description, difficulty, tags, userId, constraints,
        codeSnippets, referenceSolutions, examples, testcases } = req.body

    if (req.user.role !== "ADMIN") {
        return res.status(403).json({
            error: "You are not allowed to create a problem"
        })
    }
    try {
        for (const [language, solutioncode] of Object.entries(referenceSolutions)) {
            const languageId = getJudge0LanguageId(language)

            if (!languageId) {
                return res.status(400).json({
                    error: `Language ${language} is not supported`
                })
            }

            const submissions = testcases.map(({ input, output }) => ({
                source_code: solutioncode,
                language_id: languageId,
                stdin: input,
                expected_output: output
            }))

            const submissionsResults = await submitBatch(submissions)

            const tokens = submissionsResults.map((res) => res.token)

            const results = await pollBatchResults(tokens)

            for (let i = 0; i < results.length; i++) {

                const result = results[i]

                //  console.log("Result -- ----", results)

                if (result.status.id !== 3) {
                    return res.status(400).json({ error: ` Testcase ${i + 1} failed for language ${language}` })
                }
            }

            const newProblem = await db.problem.create({
                data: {
                    title,
                    description,
                    difficulty,
                    tags,
                    constraints,
                    codeSnippets,
                    referenceSolutions,
                    examples,
                    testcases,
                    userId: req.user.id
                }
            })

            return res.status(201).json({
                success: true,
                message: "Message Created Successfully",
                problem: newProblem
            })
        }


    } catch (error) {
        // console.log(error)
        return res.status(500).json({
            error: "Error While Creating Problem"
        })

    }

}

export const getAllProblems = async (req, res) => {

    try {

        const problems = await db.problem.findMany()

        if (!problems) {
            return res.status(404).json({
                error: "No problems found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Message Fetched Successfully",
            problems
        })

    } catch (error) {
        // console.log(error)
        return res.status(500).json({
            error: "Error While Fetching Problem"
        })
    }


}

export const getProblemById = async (req, res) => {

    const { id } = req.params

    try {

        const problem = await db.problem.findUnique({
            where: {
                id
            }
        })

        if (!problem) {
            return res.status(404).json({
                error: "Problem not found"

            })
        }
        return res.status(200).json({
            success: true,
            message: "Message Created Successfully",
            problem
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: "Error While Fetching Problem by id"
        })
    }


}

export const updateProblem = async (req, res) => {

    const { id } = req.params

    const { title, description, difficulty, tags, userId, constraints,
        codeSnippets, referenceSolutions, examples, testcases } = req.body

    if (req.user.role !== "ADMIN") {
        return res.status(403).json({
            error: "You are not allowed to update a problem"
        })
    }
    try {

        const existingproblem = await db.problem.findUnique({
            where: {
                id
            }
        })

        if (!existingproblem) {
            return res.status(404).json({
                error: "Problem not found"

            })
        }


        for (const [language, solutioncode] of Object.entries(referenceSolutions)) {
            const languageId = getJudge0LanguageId(language)

            if (!languageId) {
                return res.status(400).json({
                    error: `Language ${language} is not supported`
                })
            }

            const submissions = testcases.map(({ input, output }) => ({
                source_code: solutioncode,
                language_id: languageId,
                stdin: input,
                expected_output: output
            }))

            const submissionsResults = await submitBatch(submissions)

            const tokens = submissionsResults.map((res) => res.token)

            const results = await pollBatchResults(tokens)

            for (let i = 0; i < results.length; i++) {

                const result = results[i]

                // console.log("Result -- ----", results)

                if (result.status.id !== 3) {
                    return res.status(400).json({ error: ` Testcase ${i + 1} failed for language ${language}` })
                }
            }

            const UpdatedProblem = await db.problem.update({
                where: { id },
                data: {
                    title,
                    description,
                    difficulty,
                    tags,
                    constraints,
                    codeSnippets,
                    referenceSolutions,
                    examples,
                    testcases

                }
            })

            return res.status(201).json({
                success: true,
                message: "Problem updated Successfully",
                problem: UpdatedProblem
            })
        }


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: "Error While updating Problem"
        })
    }
}

export const deleteproblem = async (req, res) => {
    const { id } = req.params

    try {
        const problem = await db.problem.findUnique({
            where: { id }
        })

        if (!problem) {
            return res.status(404).json({ error: "Problem Not Found" })
        }

        await db.problem.delete({ where: { id } })

        res.status(200).json({
            success: true,
            message: "Problem deleted Successfully"
        })
    } catch (error) {
        res.status(404).json({
            error: "Error While deleting the problem"
        })
    }


}

export const getAllProblemsSolvedByUser = async (req, res) => {
    try {
        const problem = await db.problem.findMany({
            where: {
                solvedBy: {
                    some: {
                        userId: req.user.id
                    }
                }
            },

            include: {
                solvedBy: {
                    where: {
                        userId: req.user.id
                    }
                }
            }
        })

        res.status(200).json({
            success: true,
            message: "Problems fetched successfully",
            problems
        })
    } catch (error) {
        console.error("Error fetching problems :", error);
        res.status(500).json({ error: "Failed to fetch problems" })

    }
}