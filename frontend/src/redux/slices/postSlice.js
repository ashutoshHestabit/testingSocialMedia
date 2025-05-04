import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api"

// Async thunks
export const fetchPosts = createAsyncThunk("posts/fetchPosts", async (_, { rejectWithValue }) => {
  try {
    const response = await api.fetchPosts()
    return response
  } catch (error) {
    return rejectWithValue(error.message || "Failed to fetch posts")
  }
})

export const createPost = createAsyncThunk("posts/createPost", async (postData, { rejectWithValue }) => {
  try {
    const response = await api.createPost(postData)
    return response
  } catch (error) {
    return rejectWithValue(error.message || "Failed to create post")
  }
})

export const likePost = createAsyncThunk("posts/likePost", async (postId, { rejectWithValue }) => {
  try {
    const response = await api.likePost(postId)
    return response
  } catch (error) {
    return rejectWithValue(error.message || "Failed to like post")
  }
})

// Initial state
const initialState = {
  posts: [],
  loading: false,
  error: null,
}

// Slice
const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addNewPost: (state, action) => {
      state.posts.unshift(action.payload)
    },
    updatePostInState: (state, action) => {
      const index = state.posts.findIndex((post) => post._id === action.payload._id)
      if (index !== -1) {
        state.posts[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false
        state.posts = action.payload
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create post
      .addCase(createPost.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false
        state.posts.unshift(action.payload)
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((post) => post._id === action.payload._id)
        if (index !== -1) {
          state.posts[index] = action.payload
        }
      })
  },
})

export const { clearError, addNewPost, updatePostInState } = postSlice.actions
export default postSlice.reducer
