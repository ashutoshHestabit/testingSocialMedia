import jwt from "jsonwebtoken"
import asyncHandler from "express-async-handler"
import User from "../models/User.js"

export const protect = asyncHandler(async (req, res, next) => {
  let token

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Important: Use 'decoded.id' not 'decoded.userId'
      req.user = await User.findById(decoded.id).select("-password")

      if (!req.user) {
        res.status(401).json({ message: "User not found" })
        return
      }

      next()
    } catch (error) {
      console.error("JWT Error:", error.message)
      res.status(401).json({ message: "Authentication required" })
      return
    }
  } else if (!token) {
    res.status(401).json({ message: "Authentication required, no token provided" })
    return
  }
})
