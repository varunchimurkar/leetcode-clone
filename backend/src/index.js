import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
import problemRoutes from "./routes/problem.routes.js"
import executionRoute from "./routes/executecode.routes.js"
import submissionRoute from "./routes/submissionRoute.js"
import playlistRoute from "./routes/playlist.routes.js"


dotenv.config()

const app = express()

app.use(cookieParser())

app.use(express.json())

app.get("/", (req, res) => {
    res.send("Hello Welcome to leetcode🎁")
})

app.use("/api/v1/auth", authRoutes)

app.use("/api/v1/problems", problemRoutes)

app.use("/api/v1/executecode", executionRoute)

app.use("/api/v1/submission", submissionRoute)

app.use("/api/v1/playlist", playlistRoute)

app.listen(process.env.PORT, () => {
    console.log("Server running in 8080")
})


