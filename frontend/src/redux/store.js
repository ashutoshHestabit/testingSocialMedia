import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import postReducer from "./slices/postSlice"
import commentReducer from "./slices/commentSlice"
import uiReducer from "./slices/uiSlice"
import messageReducer from "./slices/messageSlice"
import notificationReducer from "./slices/notificationSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    comments: commentReducer,
    ui: uiReducer,
    messages: messageReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})
