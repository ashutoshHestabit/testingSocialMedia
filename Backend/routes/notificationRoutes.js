import express from "express"
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  createNotification,
} from "../controllers/notificationController.js"
import { protect } from "../middlewares/authMiddleware.js"

const router = express.Router()

// All routes are protected
router.use(protect)

router.get("/", getUserNotifications)
router.get("/unread", getUnreadCount)
router.put("/read", markAsRead)
router.post("/", createNotification)

export default router
