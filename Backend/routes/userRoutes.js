// routes/userRoutes.js
import express from "express"
import {
  registerUser,
  loginUser,
  googleAuth,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js"
import { protect } from "../middlewares/authMiddleware.js"

const router = express.Router()

// Public routes
router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/google", googleAuth)

// Protected routes
router.use(protect)
router.get("/", getAllUsers)
router.get("/me", (req, res) => res.json(req.user))

router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser)

export default router
