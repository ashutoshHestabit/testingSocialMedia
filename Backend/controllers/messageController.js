import Message from "../models/Message.js"
import User from "../models/User.js"
import asyncHandler from "express-async-handler"

// Get chat history between two users
export const getChatHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const currentUserId = req.user._id

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" })
  }

  try {
    // Find messages where current user is either sender or recipient
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username")
      .populate("recipient", "username")

    // Mark messages as read if current user is recipient
    await Message.updateMany({ sender: userId, recipient: currentUserId, read: false }, { read: true })

    res.json(messages)
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat history", error: error.message })
  }
})

// Save a new message
export const saveMessage = asyncHandler(async (req, res) => {
  const { recipient, text } = req.body
  const sender = req.user._id

  if (!recipient || !text) {
    return res.status(400).json({ message: "Recipient and text are required" })
  }

  try {
    // Check if recipient exists
    const recipientUser = await User.findById(recipient)
    if (!recipientUser) {
      return res.status(404).json({ message: "Recipient not found" })
    }

    const message = await Message.create({
      sender,
      recipient,
      text,
    })

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username")
      .populate("recipient", "username")

    res.status(201).json(populatedMessage)

    // Emit socket event if needed
    const io = req.app.get("io")
    if (io) {
      io.emit("newMessage", populatedMessage)
    }
  } catch (error) {
    res.status(500).json({ message: "Error saving message", error: error.message })
  }
})
