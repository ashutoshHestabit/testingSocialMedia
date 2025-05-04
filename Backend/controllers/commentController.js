import Comment from "../models/Comment.js"
import Post from "../models/Post.js"

export const createComment = async (req, res) => {
  try {
    const { post, content } = req.body
    const author = req.user._id

    if (!post || !content) {
      return res.status(400).json({ message: "Post and content are required" })
    }

    const postExists = await Post.findById(post)
    if (!postExists) return res.status(404).json({ message: "Post not found" })

    // Create the comment
    const comment = await Comment.create({ post, author, content })

    // Populate author information for immediate display
    const populatedComment = await Comment.findById(comment._id).populate("author", "username email")

    // Update post with new comment reference
    await Post.findByIdAndUpdate(post, {
      $push: { comments: comment._id },
    })

    res.status(201).json({
      message: "Comment created successfully",
      comment: populatedComment,
    })

    // Emit socket event with populated data
    const io = req.app.get("io")
    if (io) {
      io.emit("newComment", populatedComment)
    }
  } catch (error) {
    console.error("Comment creation error:", error)
    res.status(500).json({ message: "Failed to create comment", error: error.message })
  }
}

// commentController.js
export const getAllComments = async (req, res) => {
  try {
    const { postId } = req.query;

    if (!postId) {
      return res.status(400).json({ message: "postId is required" });
    }

    const comments = await Comment.find({ post: postId })
      .populate("author", "username email")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to fetch comments", 
      error: error.message 
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return res.status(404).json({ message: "Comment not found" })

    // Check if user is authorized to delete
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this comment" })
    }

    // Remove comment reference from post
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    })

    await Comment.findByIdAndDelete(req.params.id)
    res.json({ message: "Comment deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to delete comment", error: error.message })
  }
}
