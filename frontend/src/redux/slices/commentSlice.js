import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api"

// Async thunks
export const fetchComments = createAsyncThunk("comments/fetchComments", async (_, { rejectWithValue }) => {
  try {
    const response = await api.fetchComments()
    return response
  } catch (error) {
    return rejectWithValue(error.message || "Failed to fetch comments")
  }
})

export const createComment = createAsyncThunk("comments/createComment", async (commentData, { rejectWithValue }) => {
  try {
    const response = await api.createComment(commentData)
    return response.comment
  } catch (error) {
    return rejectWithValue(error.message || "Failed to create comment")
  }
})

// Initial state
const initialState = {
  comments: [],
  loading: false,
  error: null,
}

// Slice
const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addNewComment: (state, action) => {
      state.comments.unshift(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false
        state.comments = action.payload
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create comment
      .addCase(createComment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        // Add the new comment to the comments array without duplicating
        const exists = state.comments.some((comment) => comment._id === action.payload.comment._id)
        if (!exists) {
          state.comments.unshift(action.payload.comment)
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, addNewComment } = commentSlice.actions
export default commentSlice.reducer
