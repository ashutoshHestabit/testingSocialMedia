import { createSlice } from "@reduxjs/toolkit"

// Initial state
const initialState = {
  isLoading: false,
  selectedChat: null,
  notifications: [],
}

// Slice
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
  },
})

export const { setLoading, setSelectedChat, addNotification, clearNotifications } = uiSlice.actions

export default uiSlice.reducer
