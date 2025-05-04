import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api"

// Async thunks
export const loginUser = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.login(credentials)
    localStorage.setItem("user", JSON.stringify(response))
    localStorage.setItem("token", response.token)
    return response
  } catch (error) {
    return rejectWithValue(error.message || "Login failed")
  }
})

export const registerUser = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const response = await api.register(userData)
    localStorage.setItem("user", JSON.stringify(response))
    localStorage.setItem("token", response.token)
    return response
  } catch (error) {
    return rejectWithValue(error.message || "Registration failed")
  }
})

export const googleLogin = createAsyncThunk("auth/googleLogin", async (tokenId, { rejectWithValue }) => {
  try {
    console.log("Google login thunk with token:", tokenId.substring(0, 20) + "...")
    const response = await api.googleLogin(tokenId)
    localStorage.setItem("user", JSON.stringify(response))
    localStorage.setItem("token", response.token)
    return response
  } catch (error) {
    console.error("Google login error:", error)
    return rejectWithValue(error.message || "Google login failed")
  }
})

export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    return null
  } catch (error) {
    return rejectWithValue(error.message || "Logout failed")
  }
})

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  loading: false,
  error: null,
}

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
