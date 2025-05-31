import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { addproblemToPlaylist, createPlaylist, deletePlaylist, getAllPlayListDetails, getPlayListDetails, removeProblemFromPlaylist } from '../controllers/playlist.controller.js'

const playlistRoute = express.Router()

playlistRoute.get("/", authMiddleware, getAllPlayListDetails)

playlistRoute.get("/:playlistId", authMiddleware, getPlayListDetails)

playlistRoute.post("/create-playlist", authMiddleware, createPlaylist)

playlistRoute.post("/:playlistId/add-problem", authMiddleware, addproblemToPlaylist)

playlistRoute.delete("/:playlistId", authMiddleware, deletePlaylist)

playlistRoute.delete("/playlistId/remove-problem", authMiddleware, removeProblemFromPlaylist)

export default playlistRoute