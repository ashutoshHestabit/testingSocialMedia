import express from "express"
import multer from "multer"
import { protect } from "../middlewares/authMiddleware.js"
import { createPost, getAllPosts, getPostById, deletePost, likePost } from "../controllers/postController.js"

const router = express.Router()

// Configure multer to use memory storage
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
})

router.route("/").get(protect, getAllPosts).post(protect, upload.single("image"), createPost)

router.route("/:id").get(protect, getPostById).delete(protect, deletePost)

router.route("/:id/like").put(protect, likePost)

export default router
