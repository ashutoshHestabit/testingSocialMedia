"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logoutUser } from "../redux/slices/authSlice"
import { FaHome, FaUserFriends, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa"
import NotificationDropdown from "./NotificationDropdown"

export default function Navbar({ user, onLogout }) {
  const dispatch = useDispatch()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { unreadCount } = useSelector((state) => state.notifications)

  const handleLogout = () => {
    dispatch(logoutUser())
    onLogout()
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/feed" className="text-xl sm:text-2xl font-bold text-blue-600 flex items-center">
              <span className="text-blue-600 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 sm:h-8 sm:w-8"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                </svg>
              </span>
              <span className="hidden sm:inline">SocialConnect</span>
              <span className="sm:hidden">Social</span>
            </Link>
          </div>

          {user ? (
            <>
              {/* Desktop menu */}
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/feed" className="text-gray-600 hover:text-blue-600 flex items-center">
                  <FaHome className="mr-1" /> Feed
                </Link>
                <Link to="/friends" className="text-gray-600 hover:text-blue-600 flex items-center">
                  <FaUserFriends className="mr-1" /> Friends
                </Link>

                <NotificationDropdown />

                <div className="flex items-center">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                    className="w-8 h-8 rounded-full mr-2"
                    alt="Profile"
                  />
                  <span className="text-gray-800 font-medium">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm hover:bg-red-200 flex items-center"
                >
                  <FaSignOutAlt className="mr-1" /> Logout
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <NotificationDropdown />
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="ml-2 p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                >
                  {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-blue-600">
                Login
              </Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && user && (
          <div className="md:hidden border-t pt-2 pb-4 space-y-3">
            <Link
              to="/feed"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaHome className="inline mr-2" /> Feed
            </Link>
            <Link
              to="/friends"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaUserFriends className="inline mr-2" /> Friends
            </Link>
            <div className="flex items-center px-4 py-2">
              <img
                src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                className="w-8 h-8 rounded-full mr-2"
                alt="Profile"
              />
              <span className="text-gray-800 font-medium">{user.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
            >
              <FaSignOutAlt className="inline mr-2" /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
