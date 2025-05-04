import express from "express"
import { createComment, getAllComments, deleteComment } from "../controllers/commentController.js"

const router = express.Router()

router.post("/", createComment)
router.get("/", getAllComments)
router.delete("/:id", deleteComment)

export default router
