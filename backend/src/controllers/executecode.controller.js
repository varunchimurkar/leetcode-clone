import { getLaguageName, pollBatchResults, submitBatch } from "../libs/judge0.lib.js"
import { db } from "../libs/db.js"


export const executecode = async (req, res) => {



    try {

        const { source_code, language_id, stdin, expected_output, problemId } = req.body

        const userId = req.user.id

        //Validate test cases

        if (!Array.isArray(stdin) || stdin.length === 0 ||
            !Array.isArray(expected_output) || expected_output.length !== stdin.length) {
            return res.status(400).json({ error: "Invaild or Missing test cases" })
        }

        //Prepare each test cases for judge0 batch submission

        const submission = stdin.map((input) => ({
            source_code,
            language_id,
            stdin: input

        }))

        //send batch of submission to judge0

        const submitResponse = await submitBatch(submission)

        const tokens = submitResponse.map((res) => res.token)

        // poll judge0 for results of all submited test cases

        const results = await pollBatchResults(tokens)

        //  console.log('Result --------', results)


        //Analyze test cases results
        let allPassed = true
        const detailedResults = results.map((result, i) => {
            const stdout = result.stdout?.trim()
            const expected_outputs = expected_output[i]?.trim()
            const passed = stdout === expected_outputs

            if (!passed) allPassed = false

            return {
                testCase: i + 1,
                passed,
                stdout,
                expected: expected_output,
                stderr: result.stderr || null,
                compile_output: result.compile_output || null,
                status: result.status.description,
                memory: result.memory ? `${result.memory} KB` : undefined,
                time: result.time ? `${result.time} s` : undefined
            }

            // /* console.log(`Testcase #${i+1}`)
            // console.log(`Input for testcase #${i+1}: ${stdin[i]}`)
            // console.log(`Expected output for testcase #${i+1}: ${expected_outputs}`)
            // console.log(`Actual output for testcase #${i+1}: ${stdout}`)

            // console.log(`Matched testcase #${i+1}: ${passed}`) */

        })

        // console.log(detailedResults)

        //store submission summary

        const submissions = await db.submission.create({
            data: {
                userId,
                problemId,
                sourceCode: source_code,
                language: getLaguageName(language_id),
                stdin: stdin.join("\n"),
                stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
                stderr: detailedResults.some((r) => r.stderr)
                    ? JSON.stringify(detailedResults.map((r) => r.stderr))
                    : null,
                compileOutput: detailedResults.some((r) => r.compile_output)
                    ? JSON.stringify(detailedResults.map((r) => r.compile_output))
                    : null,
                status: allPassed ? "Accepted" : "Wrong Answer",
                memory: detailedResults.some((r) => r.memory)
                    ? JSON.stringify(detailedResults.map((r) => r.memory))
                    : null,
                time: detailedResults.some((r) => r.time)
                    ? JSON.stringify(detailedResults.map((r) => r.time))
                    : null,

            }
        })

      //if all passed = true mark problem as solved for the current user
    

        if (allPassed) {
            await db.problemSolved.upsert({
                where: {
                    userId_problemId: {
                        userId, problemId
                    }
                },

                update:{},

                create:{
                    userId, problemId
                }
            })
        }
          
        //Save individual test case results using detailedResult

        const testCaseResults = detailedResults.map((result) => ( {
            submissionId: submissions.id,
            testCase: result.testCase,
            passed: result.passed,
            stdout: result.stdout,
            expected: result.expected,
            stderr : result.stderr,
            compileOutput : result.compile_output,
            status: result.status,
            memory: result.memory,
            time : result.time

        }))

        await db.testCaseResult.createMany({
            data: testCaseResults
        })
           

         const submissionWithTestCase = await db.submission.findUnique({
            where: {
                id:submissions.id
            },

            include: {
                testCases:true
            }
         }
         )

        res.status(200).json({
            success: true,
            message: "code executed! Sucessfully",
            submissions: submissionWithTestCase

        })

    } catch (error) {
    console.error("Error executing code:", error.message);
    res.status(500).json({ error: "Failed to execute code" });
  }
}