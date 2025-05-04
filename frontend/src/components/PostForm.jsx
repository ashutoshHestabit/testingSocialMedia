"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { createPost } from "../redux/slices/postSlice"
import { FaImage, FaPaperPlane, FaTimes } from "react-icons/fa"
import { toast } from "react-toastify"

export default function PostForm({ socket }) {
  const [content, setContent] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { loading } = useSelector((state) => state.posts)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB")
      return
    }

    setImageFile(file)
    setPreview(URL.createObjectURL(file))
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim() && !imageFile) {
      setError("Write something or add an image")
      return
    }

    setError("")
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("content", content)

      if (imageFile) {
        formData.append("image", imageFile)
      }


      await dispatch(createPost(formData)).unwrap()

      // Reset form
      setContent("")
      setImageFile(null)
      setPreview("")

      // Show success toast
      toast.success("Post created successfully")
    } catch (err) {
      setError(err.message || "Failed to create post")
      toast.error(err.message || "Failed to create post")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">{error}</div>}

        <div className="flex items-center space-x-3">
          <img
            src={`https://ui-avatars.com/api/?name=${user?.username || "User"}&background=random`}
            className="w-10 h-10 rounded-full"
            alt="Profile"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows="3"
          />
        </div>

        {preview && (
          <div className="relative mt-2">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="max-h-60 rounded-lg object-cover" />
            <button
              type="button"
              onClick={() => {
                setImageFile(null)
                setPreview("")
              }}
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white p-1 rounded-full hover:bg-opacity-100"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <label className="flex items-center cursor-pointer text-gray-600 hover:text-blue-600 p-2 rounded-md hover:bg-gray-100">
            <FaImage className="mr-2" />
            <span>Add Photo</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>

          <button
            type="submit"
            disabled={isSubmitting || loading || (!content.trim() && !imageFile)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting || loading ? (
              "Posting..."
            ) : (
              <>
                <FaPaperPlane className="mr-2" /> Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
