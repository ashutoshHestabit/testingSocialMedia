import express from "express"
import { getChatHistory, saveMessage } from "../controllers/messageController.js"
import { protect } from "../middlewares/authMiddleware.js"

const router = express.Router()

// All routes are protected
router.use(protect)

router.get("/:userId", getChatHistory)
router.post("/", saveMessage)

export default router
