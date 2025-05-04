"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { registerUser, googleLogin, clearError } from "../redux/slices/authSlice"
import { GoogleLogin } from "@react-oauth/google"

export default function Register() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formError, setFormError] = useState("")

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")

    // Form validation
    if (!username || !email || !password) {
      setFormError("All fields are required")
      return
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters")
      return
    }

    dispatch(registerUser({ username, email, password }))
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    if (credentialResponse.credential) {
      dispatch(googleLogin(credentialResponse.credential))
    } else {
      console.error("No credential received from Google")
    }
  }

  const handleGoogleError = (error) => {
    console.error("Google login failed:", error)
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create an Account</h2>

      {(error || formError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{formError || error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="johndoe"
            required
          />
        </div>

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

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:bg-green-300"
        >
          {loading ? "Creating account..." : "Sign Up"}
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
              text="signup_with"
              shape="rectangular"
              locale="en"
              width="280"
            />
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Sign in
        </Link>
      </p>
    </div>
  )
}
