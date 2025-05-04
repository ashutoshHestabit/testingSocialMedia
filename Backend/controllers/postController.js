// controllers/postController.js
import Post from "../models/Post.js"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * @desc    Create a post (text + optional image)
 * @route   POST /api/posts
 * @access  Private
 */
export const createPost = async (req, res) => {
  try {
    const { content } = req.body
    const author = req.user._id
    let imageUrl

    // Debug information
    console.log("Creating post with content:", content)
    console.log("File received:", req.file ? "Yes" : "No")

    if (req.file) {
      try {
        console.log("File type:", req.file.mimetype)
        console.log("File size:", req.file.size)

        // Convert buffer to base64 for Cloudinary upload
        const base64Image = req.file.buffer.toString("base64")
        const dataURI = `data:${req.file.mimetype};base64,${base64Image}`

        console.log("Uploading to Cloudinary...")
        const result = await cloudinary.uploader.upload(dataURI, {
          resource_type: "auto",
        })
        imageUrl = result.secure_url
        console.log("Upload successful, URL:", imageUrl)
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError)
        return res.status(500).json({
          message: "Failed to upload image",
          error: uploadError.message,
        })
      }
    }

    if (!content && !imageUrl) {
      return res.status(400).json({ message: "Content or image is required" })
    }

    // Generate avatar URL for consistency
    const avatarUrl = `https://ui-avatars.com/api/?name=${req.user.username}&background=random`

    const post = await Post.create({
      content,
      author: req.user._id,
      authorName: req.user.username,
      authorAvatar: avatarUrl,
      image: imageUrl,
    })

    // Populate author information
    const populatedPost = await Post.findById(post._id)
      .populate("author", "username email")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username email",
        },
      })

    res.status(201).json(populatedPost)

    req.app.get("io").emit("newPost", populatedPost)
  } catch (error) {
    console.error("Post creation error:", error)
    res.status(500).json({
      message: "Failed to create post",
      error: error.message,
    })
  }
}

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username email")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username email",
        },
      })
      .sort({ createdAt: -1 })

    res.json(posts)
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch posts",
      error: error.message,
    })
  }
}

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username email")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username email",
        },
      })

    if (!post) return res.status(404).json({ message: "Post not found" })

    res.json(post)
  } catch (error) {
    res.status(500).json({ message: "Error fetching post", error: error.message })
  }
}

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) return res.status(404).json({ message: "Post not found" })

    // Check if user is authorized to delete
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" })
    }

    await Post.findByIdAndDelete(req.params.id)

    res.json({ message: "Post deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error: error.message })
  }
}

// In your postController.js
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: "Post not found" })

    const userId = req.user._id

    // Check if user already liked
    const index = post.likes.indexOf(userId)
    if (index === -1) {
      post.likes.push(userId)
    } else {
      post.likes.splice(index, 1)
    }

    const updatedPost = await post.save()

    // Populate author information
    const populatedPost = await Post.findById(updatedPost._id)
      .populate("author", "username email")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username email",
        },
      })

    res.json(populatedPost)

    // Emit socket event
    const io = req.app.get("io")
    io.emit("updatePost", populatedPost)
  } catch (error) {
    res.status(500).json({
      message: "Error updating likes",
      error: error.message,
    })
  }
}
