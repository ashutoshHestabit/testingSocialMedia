import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api"

// Async thunks
export const fetchChatHistory = createAsyncThunk("messages/fetchChatHistory", async (userId, { rejectWithValue }) => {
  try {
    const response = await api.fetchChatHistory(userId)
    return response
  } catch (error) {
    return rejectWithValue(error.message || "Failed to fetch chat history")
  }
})

export const sendMessage = createAsyncThunk("messages/sendMessage", async (messageData, { rejectWithValue }) => {
  try {
    const response = await api.sendMessage(messageData)
    return response
  } catch (error) {
    return rejectWithValue(error.message || "Failed to send message")
  }
})

// Initial state
const initialState = {
  messages: {},
  loading: false,
  error: null,
}

// Slice
const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addNewMessage: (state, action) => {
      const { sender, recipient, text } = action.payload
      const chatId = sender._id || sender

      if (!state.messages[chatId]) {
        state.messages[chatId] = []
      }

      state.messages[chatId].push({
        sender,
        recipient,
        text,
        createdAt: new Date().toISOString(),
        self: true,
      })
    },
    receiveMessage: (state, action) => {
      const { from, text, timestamp } = action.payload

      if (!state.messages[from]) {
        state.messages[from] = []
      }

      state.messages[from].push({
        sender: { _id: from },
        text,
        createdAt: timestamp,
        self: false,
      })
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch chat history
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false

        // Group messages by chat partner
        const userId = action.meta.arg
        state.messages[userId] = action.payload
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false

        const { recipient, sender } = action.payload
        const chatId = recipient._id || recipient

        if (!state.messages[chatId]) {
          state.messages[chatId] = []
        }

        state.messages[chatId].push(action.payload)
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, addNewMessage, receiveMessage } = messageSlice.actions
export default messageSlice.reducer
