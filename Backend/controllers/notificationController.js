import Notification from "../models/Notification.js"
import asyncHandler from "express-async-handler"

// Get notifications for current user
export const getUserNotifications = asyncHandler(async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate("sender", "username")
      .populate("post", "content")
      .populate("comment", "content")
      .limit(20)

    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error: error.message })
  }
})

// Get unread notification count
export const getUnreadCount = asyncHandler(async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    })

    res.json({ count })
  } catch (error) {
    res.status(500).json({ message: "Error fetching notification count", error: error.message })
  }
})

// Mark notifications as read
export const markAsRead = asyncHandler(async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true })

    res.json({ message: "Notifications marked as read" })
  } catch (error) {
    res.status(500).json({ message: "Error marking notifications as read", error: error.message })
  }
})

// Create a notification
export const createNotification = asyncHandler(async (req, res) => {
  const { recipient, type, post, comment, text } = req.body
  const sender = req.user._id

  // Don't create notification if sender is recipient
  if (sender.toString() === recipient.toString()) {
    return res.status(200).json({ message: "Self notification skipped" })
  }

  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      post,
      comment,
      text,
    })

    const populatedNotification = await Notification.findById(notification._id)
      .populate("sender", "username")
      .populate("post", "content")
      .populate("comment", "content")

    res.status(201).json(populatedNotification)

    // Emit socket event
    const io = req.app.get("io")
    if (io) {
      io.emit("newNotification", populatedNotification)
    }
  } catch (error) {
    res.status(500).json({ message: "Error creating notification", error: error.message })
  }
})
