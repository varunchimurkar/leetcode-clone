import { db } from "../libs/db.js"


export const createPlaylist = async (req, res) => {
    try {
        const { name, description } = req.body

        const userId = req.user.id

        const playlist = await db.playlist.create({
            data: {
                name,
                description,
                userId
            }
        })

        res.status(200).json({
            success: true,
            message: "Playlist created successfully",
            playlist
        })


    } catch (error) {
        console.error('Error creating playlist:', error)
        res.status(500).json({
            error: 'Failed to create playlist'

        })
    }



}



export const getAllPlayListDetails = async (req, res) => {
    try {

        const playlist = await db.playlist.findMany({
            where: {
                userId: req.user.id
            },

            include: {
                problems: {
                    include: {
                        problem: true
                    }
                }
            }
        })

        res.status(200).json({
            success: true,
            message: "Playlist fetched Successfully",
            playlist
        })

    } catch (error) {
        console.error("Error fetching playlist:", error)
        res.status(500).json({
            error: "Failed to fetch playlist"
        })
    }

}


export const getPlayListDetails = async (req, res) => {

    const { playlistId } = req.params
    try {

        const playlist = await db.playlist.findUnique({
            where: {
                userId: req.user.id,
                id: playlistId
            },

            include: {
                problems: {
                    include: {
                        problem: true
                    }
                }
            }
        })

        if (!playlist) {
            return res.status(404).json({
                error: "Playlist not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Playlist fetched Successfully",
            playlist
        })

    } catch (error) {
        console.error("Error fetching playlist:", error)
        res.status(500).json({
            error: "Failed to fetch playlist"
        })
    }
}


export const addproblemToPlaylist = async (req, res) => {

    const { playlistId } = req.params
    const { problemIds } = req.body

    try {

        if (!Array.isArray(problemIds) || problemIds.length === 0) {
            return res.status(400).json({
                error: "Invalid or missing problemId"
            })
        }

        //Create records for each problems in the playlist

        const problemsInPlaylist = await db.problemsInPlaylist.createMany({
            data: problemIds.map((problemId) => {
                playlistId,
                    problemId
            })
        })

        res.status(201).json({
            success: true,
            message: "Problems added to playlist successfully",
            problemsInPlaylist
        })

    } catch (error) {
        console.error("Error Adding problem in playlist:", error)
        res.status(500).json({
            error: "Failed to Added problem in playlist"
        })
    }
}


export const deletePlaylist = async (req, res) => {

    const { PlaylistId } = req.params


    try {

        const deletePlaylist = await db.playlist.delete({
            where: {
                id: PlaylistId
            }
        })

        res.status(200).json({
            success: true,
            message: 'Playlist deleted successfully',
            deletePlaylist
        })

    } catch (error) {
        console.error("Error deleting problem in playlist:", error)
        res.status(500).json({
            error: "Failed to deleting problem in playlist"
        })
    }
}

export const removeProblemFromPlaylist = async (req, res) => {

    const { playlistId } = req.params
    const { problemIds } = req.body

    try {
        if (!Array.isArray(problemIds) || problemIds.length === 0) {
            return res.status(400).json({
                error: "Invalid or missing problemId"
            })
        }

        const deleteproblem = await db.problemsInPlaylist.deleteMany({
            where: {
                playlistId,
                problemId: {
                    in: problemIds
                }
            }
        })
        res.status(200).json({
            success: true,
            message: 'Problem removed from playlist successfully',
            deleteproblem
        })
    } catch (error) {
        console.error("Error removing problem in playlist:", error)
        res.status(500).json({
            error: "Failed to removing problem in playlist"
        })
    }
}

