"use client"

import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { FaPaperPlane, FaSmile, FaImage } from "react-icons/fa"
import moment from "moment"
import { fetchChatHistory, sendMessage, receiveMessage } from "../redux/slices/messageSlice"

export default function Chat({ socket, userId, peerId }) {
  const [text, setText] = useState("")
  const endRef = useRef()
  const dispatch = useDispatch()

  const { messages } = useSelector((state) => state.messages)
  const { users } = useSelector((state) => state.auth)
  const chatMessages = messages[peerId] || []

  const peerUser = users?.find((user) => user._id === peerId)

  // Load chat history when peer changes
  useEffect(() => {
    if (peerId) {
      dispatch(fetchChatHistory(peerId))
    }
  }, [peerId, dispatch])

  // Handle incoming messages
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      if (msg.from === peerId) {
        dispatch(receiveMessage(msg))
      }
    }

    socket.on("receive-message", handleReceiveMessage)

    return () => {
      socket.off("receive-message", handleReceiveMessage)
    }
  }, [socket, peerId, dispatch])

  // Send message function
  const handleSendMessage = () => {
    if (!text.trim()) return

    // Send via socket for real-time
    socket.emit("send-message", {
      from: userId,
      to: peerId,
      text: text,
      timestamp: new Date().toISOString(),
    })

    // Save to database via API
    dispatch(
      sendMessage({
        recipient: peerId,
        text: text,
      }),
    )

    setText("")
  }

  if (!peerId) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 h-[600px] flex items-center justify-center">
        <p className="text-gray-500 text-center">Select a user to start chatting</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm h-[600px] flex flex-col">
      {/* Chat header */}
      <div className="border-b p-4 flex items-center">
        <div className="relative">
          <img
            src={`https://ui-avatars.com/api/?name=${peerUser?.username || "User"}&background=random`}
            className="w-10 h-10 rounded-full mr-3"
            alt="Chat with"
          />
          <span className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        </div>
        <div>
          <h3 className="font-semibold">{peerUser?.username || "User"}</h3>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {chatMessages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">No messages yet. Say hello!</p>
          </div>
        )}

        {chatMessages.map((message, index) => {
          const isSelf = message.sender._id === userId || message.self
          const senderName = isSelf ? "You" : message.sender.username || "User"

          return (
            <div key={index} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] p-3 rounded-2xl ${
                  isSelf ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                }`}
              >
                <p>{message.text}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-xs ${isSelf ? "text-blue-100" : "text-gray-500"}`}>{senderName}</span>
                  <span className={`text-xs ${isSelf ? "text-blue-100" : "text-gray-500"}`}>
                    {moment(message.createdAt).format("h:mm A")}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {/* Message input */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1">
          <button className="text-gray-500 hover:text-blue-500">
            <FaSmile />
          </button>
          <button className="text-gray-500 hover:text-blue-500">
            <FaImage />
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent p-2 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!text.trim()}
            className={`p-2 rounded-full ${
              text.trim() ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  )
}
