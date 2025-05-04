import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  
  // Development server settings
  server: {
    host: true,           // listen on all network interfaces (0.0.0.0)
    port: 5173,           // ensure it uses 5173 locally
    allowedHosts: [
      "localhost",
      "testingsocialmedia-1.onrender.com"
    ],
    proxy: {
      // Proxy API calls to your deployed backend
      "/api": {
        target: "https://testingsocialmedia.onrender.com",
        changeOrigin: true,
        secure: true
      }
    }
  },

  // Preview server (npm run preview) settings
  preview: {
    host: true,
    port: 4173,
    allowedHosts: [
      "localhost",
      "testingsocialmedia-1.onrender.com"
    ]
  }
})
