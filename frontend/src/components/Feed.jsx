"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchPosts } from "../redux/slices/postSlice"
import { fetchComments } from "../redux/slices/commentSlice"
import { setSelectedChat } from "../redux/slices/uiSlice"
import UserList from "./UserList.jsx"
import Chat from "./Chat.jsx"
import PostForm from "./PostForm.jsx"
import PostList from "./PostList.jsx"

export default function Feed({ socket }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { posts, loading: postsLoading, error: postsError } = useSelector((state) => state.posts)
  const { comments, loading: commentsLoading } = useSelector((state) => state.comments)
  const { selectedChat } = useSelector((state) => state.ui)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([dispatch(fetchPosts()).unwrap(), dispatch(fetchComments()).unwrap()])
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [dispatch])

  const handleSelectChat = (userId) => {
    // Toggle chat if clicking the same user
    if (selectedChat === userId) {
      dispatch(setSelectedChat(null))
    } else {
      dispatch(setSelectedChat(userId))
    }
  }

  if (isLoading || postsLoading || commentsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-4 md:block hidden">
              <div className="bg-white rounded-xl shadow-sm p-4 h-64 animate-pulse"></div>
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white rounded-xl shadow-sm p-6 h-32 animate-pulse"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-48 animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (postsError) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <h2 className="text-xl font-semibold text-red-500 mb-4">{postsError}</h2>
            <button
              onClick={() => dispatch(fetchPosts())}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
          {/* Left sidebar - User list */}
          <div className="space-y-4 order-2 md:order-1">
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
              <h3 className="text-lg font-semibold mb-2 sm:mb-4">Active Friends</h3>
              <UserList current={user._id} selected={selectedChat} onSelect={handleSelectChat} socket={socket} />
            </div>
          </div>

          {/* Main content area */}
          <div className="md:col-span-2 space-y-4 order-1 md:order-2">
            {/* Chat with selected peer */}
            {selectedChat && (
              <div className="bg-white rounded-xl shadow-sm">
                <Chat socket={socket} userId={user._id} peerId={selectedChat} />
              </div>
            )}

            {/* Post form */}
            <PostForm socket={socket} />

            {/* Posts list */}
            <div className="space-y-4">
              <PostList posts={posts} userId={user._id} socket={socket} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
