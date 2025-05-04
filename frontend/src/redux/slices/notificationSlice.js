import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api"

// Async thunks
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.fetchNotifications()
      return response
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch notifications")
    }
  },
)

export const getUnreadCount = createAsyncThunk("notifications/getUnreadCount", async (_, { rejectWithValue }) => {
  try {
    const response = await api.getUnreadNotificationCount()
    return response.count
  } catch (error) {
    return rejectWithValue(error.message || "Failed to get unread count")
  }
})

export const markAsRead = createAsyncThunk("notifications/markAsRead", async (_, { rejectWithValue }) => {
  try {
    await api.markNotificationsAsRead()
    return true
  } catch (error) {
    return rejectWithValue(error.message || "Failed to mark notifications as read")
  }
})

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
}

// Slice
const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addNewNotification: (state, action) => {
      state.notifications.unshift(action.payload)
      state.unreadCount += 1
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get unread count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state) => {
        state.unreadCount = 0
      })
  },
})

export const { clearError, addNewNotification, resetUnreadCount } = notificationSlice.actions
export default notificationSlice.reducer
