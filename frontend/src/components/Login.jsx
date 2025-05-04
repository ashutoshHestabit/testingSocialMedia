"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { loginUser, googleLogin, clearError } from "../redux/slices/authSlice"
import { GoogleLogin } from "@react-oauth/google"
import { toast } from "react-toastify"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, user } = useSelector((state) => state.auth)

  useEffect(() => {
    // Clear any previous errors
    dispatch(clearError())

    // If user is already logged in, redirect to feed
    if (user) {
      navigate("/feed")
    }
  }, [dispatch, user, navigate])

  useEffect(() => {
    // Show toast for errors
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return

    try {
      await dispatch(loginUser({ email, password })).unwrap()
      toast.success("Login successful!")
    } catch (err) {
      // Error is handled by the error effect above
      console.error("Login failed:", err)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    if (credentialResponse.credential) {
      try {
        await dispatch(googleLogin(credentialResponse.credential)).unwrap()
        toast.success("Google login successful!")
      } catch (err) {
        toast.error("Google login failed")
      }
    } else {
      console.error("No credential received from Google")
      toast.error("Google login failed: No credentials received")
    }
  }

  const handleGoogleError = (error) => {
    console.error("Google login failed:", error)
    toast.error("Google login failed")
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login to Your Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-300"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="filled_blue"
              text="signin_with"
              shape="rectangular"
              locale="en"
              width="280"
            />
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
          Sign up
        </Link>
      </p>
    </div>
  )
}
