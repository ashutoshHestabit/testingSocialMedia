"use client"

import { useState , useEffect} from "react"
import { useDispatch, useSelector } from "react-redux"
import { likePost } from "../redux/slices/postSlice"
import { createComment } from "../redux/slices/commentSlice"
import { FaHeart, FaRegHeart, FaComment, FaShare, FaPaperPlane } from "react-icons/fa"
import moment from "moment"
import { toast } from "react-toastify"

export default function PostList({ posts, userId, socket }) {
  const dispatch = useDispatch()
  const [commentText, setCommentText] = useState({})
  const [expandedComments, setExpandedComments] = useState({})
  const { user } = useSelector((state) => state.auth)


  // PostList.jsx
useEffect(() => {
  if (!socket) return;

  const handleNewComment = (newComment) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === newComment.post 
          ? { ...post, comments: [newComment, ...post.comments] }
          : post
      )
    );
  };

  socket.on("newComment", handleNewComment);

  return () => {
    socket.off("newComment", handleNewComment);
  };
}, [socket]);

  const handleLike = async (postId) => {
    try {
      await dispatch(likePost(postId)).unwrap()
      // No toast needed for likes to avoid spam
    } catch (error) {
      console.error("Error liking post:", error)
      toast.error("Failed to like post")
    }
  }

  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) return

    try {
      const result = await dispatch(
        createComment({
          post: postId,
          content: commentText[postId],
        }),
      ).unwrap()

      // Clear comment text
      setCommentText((prev) => ({ ...prev, [postId]: "" }))

      // Show success toast
      toast.success("Comment added successfully")
    } catch (error) {
      console.error("Error creating comment:", error)
      toast.error("Failed to add comment")
    }
  }

// PostList.jsx
// Replace the toggleComments function with:
const toggleComments = async (postId) => {
  try {
    if (!expandedComments[postId]) {
      // Use the API helper instead of direct fetch
      const comments = await api.fetchComments(postId);
      
      // Update posts state (assuming you're using state management)
      setPosts(prev => prev.map(post => 
        post._id === postId ? { ...post, comments } : post
      ));
    }
    
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  } catch (error) {
    console.error("Error loading comments:", error);
    toast.error(error.message);
  }
};

  return (
    <div className="space-y-6">
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Post header */}
            <div className="p-4 flex items-start">
              <img
                src={
                  post.authorAvatar ||
                  `https://ui-avatars.com/api/?name=${post.author?.username || "User"}&background=random`
                }
                className="w-10 h-10 rounded-full mr-3"
                alt={post.author?.username}
              />
              <div>
                <h3 className="font-semibold text-gray-800">{post.authorName || post.author?.username}</h3>
                <p className="text-xs text-gray-500">{moment(post.createdAt).fromNow()}</p>
              </div>
            </div>

            {/* Post content */}
            <div className="px-4 pb-3">
              <p className="text-gray-800 mb-3">{post.content}</p>
            </div>

            {/* Post image */}
            {post.image && (
              <div className="w-full">
                <img
                  src={post.image || "/placeholder.svg"}
                  alt="Post content"
                  className="w-full max-h-96 object-cover"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "/placeholder.svg?height=400&width=600"
                  }}
                />
              </div>
            )}

            {/* Post actions */}
            <div className="px-2 sm:px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => handleLike(post._id)}
                className={`flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-md ${
                  post.likes?.includes(userId) ? "text-red-600" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {post.likes?.includes(userId) ? <FaHeart /> : <FaRegHeart />}
                <span className="hidden xs:inline">{post.likes?.length || 0}</span>
              </button>

              <button
                onClick={() => toggleComments(post._id)}
                className="flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <FaComment />
                <span className="hidden xs:inline">{post.comments?.length || 0}</span>
              </button>

              <button className="flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-md text-gray-600 hover:bg-gray-100">
                <FaShare />
                <span className="hidden xs:inline">Share</span>
              </button>
            </div>

            {/* Comments section */}
            {expandedComments[post._id] && (
              <div className="border-t border-gray-100 p-4">
                {/* Comment input */}
                <div className="flex items-center space-x-2 mb-4">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user?.username || "User"}&background=random`}
                    className="w-8 h-8 rounded-full"
                    alt="Your profile"
                  />
                  <input
                    type="text"
                    value={commentText[post._id] || ""}
                    onChange={(e) => setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))}
                    placeholder="Write a comment..."
                    className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === "Enter" && handleComment(post._id)}
                  />
                  <button
                    onClick={() => handleComment(post._id)}
                    disabled={!commentText[post._id]?.trim()}
                    className="text-blue-600 p-2 rounded-full hover:bg-blue-50 disabled:text-gray-400 disabled:hover:bg-transparent"
                  >
                    <FaPaperPlane />
                  </button>
                </div>

                {/* Comments list */}
                // In the comments list section
<div className="space-y-3 max-h-60 overflow-y-auto">
  {post.comments && post.comments.length > 0 ? (
    post.comments.map((comment) => {
      // Ensure comment is populated
      if (typeof comment === 'string') {
        // This means we only have the ID, need to fetch data
        return null;
      }
      
      return (
        <div key={comment._id} className="flex space-x-2">
          {/* Keep existing comment display code */}
        </div>
      )
    })
  ) : (
    <p className="text-center text-gray-500 text-sm py-2">
      No comments yet. Be the first to comment!
    </p>
  )}
</div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h3>
          <p className="text-gray-600">Be the first to share something with the community!</p>
        </div>
      )}
    </div>
  )
}
