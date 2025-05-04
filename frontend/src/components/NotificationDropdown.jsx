"use client"

import { useState, useEffect, useRef } from "react"
import { FaBell, FaComment, FaHeart, FaUserPlus } from "react-icons/fa"
import { toast } from "react-toastify"
import moment from "moment"

export default function NotificationDropdown({ notifications = [], unreadCount = 0, onMarkAsRead }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen && unreadCount > 0 && onMarkAsRead) {
      onMarkAsRead()

      // Show toast for each unread notification
      const unreadNotifications = notifications.filter((n) => !n.read).slice(0, 5)
      unreadNotifications.forEach((notification) => {
        toast.info(notification.text)
      })
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <FaHeart className="text-red-500" />
      case "comment":
        return <FaComment className="text-blue-500" />
      case "follow":
        return <FaUserPlus className="text-purple-500" />
      default:
        return <FaBell className="text-gray-500" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative text-gray-600 hover:text-blue-600 focus:outline-none"
        aria-label="Notifications"
      >
        <FaBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold">Notifications</h3>
          </div>

          {notifications.length > 0 ? (
            <div>
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 flex items-start ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="mr-3 mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm">{notification.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{moment(notification.createdAt).fromNow()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No notifications</div>
          )}

          <div className="p-2 text-center border-t border-gray-100">
            <button onClick={() => setIsOpen(false)} className="text-xs text-blue-600 hover:text-blue-800">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
