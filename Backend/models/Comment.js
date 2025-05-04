import mongoose from "mongoose"

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: String,
  },
  { timestamps: true },
)

export default mongoose.model("Comment", commentSchema)
